import {
  collectCompletedPlant,
  completePlantGrowth,
  createInitialGameState,
  equipPlant,
  plantSeed,
  unequipPlant,
  type GameState,
  type PlantSelector,
  type Result,
} from '../domain'
import type { GameStorage } from '../storage'
import { APP_ROUTES, getNavigationDestination, type NavigationCommand } from './routes'
import type {
  AdoptRockInput,
  AppError,
  AppActionError,
  AppActionResult,
  AppNavigation,
  AppSnapshot,
  GameActions,
} from './types'

type Clock = () => number
type Listener = () => void
type StateTransition = (state: GameState) => Result<GameState>
type GrowthSynchronizationResult =
  | Readonly<{ ok: true; state: GameState }>
  | Readonly<{ ok: false; error: AppError }>

export interface AppStore {
  getSnapshot(): AppSnapshot
  subscribe(listener: Listener): () => void
  initialize(): Promise<void>
  readonly actions: GameActions
  readonly navigation: AppNavigation
}

export type CreateAppStoreOptions = Readonly<{
  storage: GameStorage
  now: Clock
  selectPlant: PlantSelector
}>

function actionFailure(error: AppActionError): AppActionResult {
  return { ok: false, error }
}

function actionSuccess(): AppActionResult {
  return { ok: true, value: undefined }
}

export function createAppStore({ storage, now, selectPlant }: CreateAppStoreOptions): AppStore {
  let snapshot: AppSnapshot = { status: 'loading', gameState: null, route: null }
  let initializePromise: Promise<void> | null = null
  let mutationQueue: Promise<void> = Promise.resolve()
  const listeners = new Set<Listener>()

  function publish(nextSnapshot: AppSnapshot): void {
    snapshot = nextSnapshot
    listeners.forEach((listener) => listener())
  }

  function getReadyGame():
    | Readonly<{ ok: true; state: GameState }>
    | Readonly<{ ok: false; result: AppActionResult }> {
    if (snapshot.status !== 'ready') {
      return {
        ok: false,
        result: actionFailure({ source: 'app', code: 'not_ready' }),
      }
    }

    if (snapshot.gameState === null) {
      return {
        ok: false,
        result: actionFailure({ source: 'app', code: 'game_not_started' }),
      }
    }

    return { ok: true, state: snapshot.gameState }
  }

  function enqueue(operation: () => Promise<AppActionResult>): Promise<AppActionResult> {
    const result = mutationQueue.then(operation)
    mutationQueue = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  async function synchronizeGrowth(
    state: GameState,
    observedAt: number,
  ): Promise<GrowthSynchronizationResult> {
    const completed = completePlantGrowth(state, observedAt)

    if (!completed.ok) {
      if (
        completed.error.code === 'growth_not_complete' ||
        completed.error.code === 'no_growth' ||
        completed.error.code === 'growth_already_complete'
      ) {
        return { ok: true, state }
      }

      return { ok: false, error: { source: 'domain', error: completed.error } }
    }

    const saved = await storage.save(completed.value)

    if (!saved.ok) {
      return { ok: false, error: { source: 'storage', error: saved.error } }
    }

    return { ok: true, state: completed.value }
  }

  async function saveTransition(
    transition: StateTransition,
    navigationCommand?: NavigationCommand,
  ): Promise<AppActionResult> {
    if (snapshot.status !== 'ready') {
      return actionFailure({ source: 'app', code: 'not_ready' })
    }

    const readyGame = getReadyGame()

    if (!readyGame.ok) {
      return readyGame.result
    }

    const destination = navigationCommand
      ? getNavigationDestination(snapshot.route, navigationCommand)
      : snapshot.route

    if (destination === null) {
      return actionFailure({ source: 'app', code: 'invalid_navigation' })
    }

    const transitioned = transition(readyGame.state)

    if (!transitioned.ok) {
      return actionFailure({ source: 'domain', error: transitioned.error })
    }

    const saved = await storage.save(transitioned.value)

    if (!saved.ok) {
      return actionFailure({ source: 'storage', error: saved.error })
    }

    if (snapshot.status !== 'ready') {
      return actionFailure({ source: 'app', code: 'not_ready' })
    }

    publish({
      status: 'ready',
      gameState: transitioned.value,
      route: destination,
      observedAt: now(),
    })
    return actionSuccess()
  }

  async function initialize(): Promise<void> {
    if (snapshot.status === 'ready') {
      return
    }

    if (initializePromise !== null) {
      return initializePromise
    }

    publish({ status: 'loading', gameState: null, route: null })
    initializePromise = (async () => {
      const loaded = await storage.load()

      if (!loaded.ok) {
        publish({
          status: 'error',
          gameState: null,
          route: null,
          error: { source: 'storage', error: loaded.error },
        })
        return
      }

      if (loaded.value === null) {
        publish({
          status: 'ready',
          gameState: null,
          route: APP_ROUTES.rockSelection,
          observedAt: now(),
        })
        return
      }

      const observedAt = now()
      const synchronized = await synchronizeGrowth(loaded.value, observedAt)

      if (!synchronized.ok) {
        publish({
          status: 'error',
          gameState: null,
          route: null,
          error: synchronized.error,
        })
        return
      }

      publish({
        status: 'ready',
        gameState: synchronized.state,
        route: APP_ROUTES.home,
        observedAt,
      })
    })().finally(() => {
      initializePromise = null
    })

    return initializePromise
  }

  const actions: GameActions = {
    adoptRock(input: AdoptRockInput) {
      return enqueue(async () => {
        if (snapshot.status !== 'ready') {
          return actionFailure({ source: 'app', code: 'not_ready' })
        }

        if (snapshot.gameState !== null) {
          return actionFailure({ source: 'app', code: 'game_already_started' })
        }

        const adoptedAt = now()
        const created = createInitialGameState({ ...input, adoptedAt })

        if (!created.ok) {
          return actionFailure({ source: 'domain', error: created.error })
        }

        const saved = await storage.save(created.value)

        if (!saved.ok) {
          return actionFailure({ source: 'storage', error: saved.error })
        }

        publish({
          status: 'ready',
          gameState: created.value,
          route: APP_ROUTES.home,
          observedAt: adoptedAt,
        })
        return actionSuccess()
      })
    },

    plantSeed() {
      return enqueue(() => saveTransition((state) => plantSeed(state, now(), selectPlant)))
    },

    refreshGrowth() {
      return enqueue(async () => {
        const readyGame = getReadyGame()

        if (!readyGame.ok) {
          return readyGame.result
        }

        if (snapshot.status !== 'ready') {
          return actionFailure({ source: 'app', code: 'not_ready' })
        }

        const observedAt = now()
        const synchronized = await synchronizeGrowth(readyGame.state, observedAt)

        if (!synchronized.ok) {
          return actionFailure(synchronized.error)
        }

        if (snapshot.status !== 'ready') {
          return actionFailure({ source: 'app', code: 'not_ready' })
        }

        publish({ ...snapshot, gameState: synchronized.state, observedAt })
        return actionSuccess()
      })
    },

    finishGrowthWithEquipment() {
      return enqueue(() =>
        saveTransition((state) => {
          const collected = collectCompletedPlant(state)

          if (!collected.ok) {
            return collected
          }

          const completedGrowth = state.plantGrowth
          if (completedGrowth?.status !== 'completed') {
            return collectCompletedPlant(state)
          }

          const equipped = equipPlant(collected.value, completedGrowth.plantId)

          if (!equipped.ok && equipped.error.code === 'plant_already_equipped') {
            return collected
          }

          return equipped
        }, 'finishGrowthEquipped'),
      )
    },

    finishGrowthToStorage() {
      return enqueue(() =>
        saveTransition(collectCompletedPlant, 'finishGrowthStored'),
      )
    },

    equipPlant(plantId) {
      return enqueue(() =>
        saveTransition((state) => equipPlant(state, plantId), 'backHome'),
      )
    },

    unequipPlant() {
      return enqueue(() => saveTransition(unequipPlant, 'backHome'))
    },
  }

  const navigation: AppNavigation = {
    navigate(command) {
      if (snapshot.status !== 'ready') {
        return false
      }

      if (command === 'completeRockSelection' && snapshot.gameState === null) {
        return false
      }

      const destination = getNavigationDestination(snapshot.route, command)

      if (destination === null) {
        return false
      }

      publish({ ...snapshot, route: destination })
      return true
    },
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    initialize,
    actions,
    navigation,
  }
}

export function createRandomPlantSelector(random: () => number = Math.random): PlantSelector {
  return (catalog) => {
    const index = Math.min(Math.floor(random() * catalog.length), catalog.length - 1)
    return catalog[index].id
  }
}
