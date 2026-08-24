import { describe, expect, it } from 'vitest'

import {
  GROWING_STAGE_START_MS,
  GROWTH_COMPLETE_MS,
  createInitialGameState,
  getGrowthView,
  plantSeed,
  type GameState,
  type Result,
} from '../domain'
import type { GameStorage, StorageError, StorageResult } from '../storage'
import { APP_ROUTES } from './routes'
import { createAppStore } from './store'

const ADOPTED_AT = 10_000

function unwrap<Value>(result: Result<Value>): Value {
  if (!result.ok) {
    throw new Error(`Expected success, received ${result.error.code}`)
  }

  return result.value
}

function initialState(): GameState {
  return unwrap(
    createInitialGameState({
      rockId: 'rock-02',
      name: '몽돌',
      adoptedAt: ADOPTED_AT,
    }),
  )
}

class RecordingStorage implements GameStorage {
  state: GameState | null
  loadError: StorageError | null = null
  saveError: StorageError | null = null
  readonly saves: GameState[] = []

  constructor(state: GameState | null) {
    this.state = state
  }

  async load(): Promise<StorageResult<GameState | null>> {
    return this.loadError === null
      ? { ok: true, value: this.state }
      : { ok: false, error: this.loadError }
  }

  async save(state: GameState): Promise<StorageResult<void>> {
    if (this.saveError !== null) {
      return { ok: false, error: this.saveError }
    }

    this.state = state
    this.saves.push(state)
    return { ok: true, value: undefined }
  }

  async clear(): Promise<StorageResult<void>> {
    this.state = null
    return { ok: true, value: undefined }
  }
}

function store(storage: GameStorage, now = ADOPTED_AT) {
  return createAppStore({ storage, now: () => now, selectPlant: () => 'plant-01' })
}

describe('app initialization', () => {
  it('enters S01 when there is no stored rock', async () => {
    const app = store(new RecordingStorage(null))

    await app.initialize()

    expect(app.getSnapshot()).toEqual({
      status: 'ready',
      gameState: null,
      route: APP_ROUTES.rockSelection,
      observedAt: ADOPTED_AT,
    })
  })

  it('enters S02 when a stored rock exists', async () => {
    const state = initialState()
    const app = store(new RecordingStorage(state))

    await app.initialize()

    expect(app.getSnapshot()).toEqual({
      status: 'ready',
      gameState: state,
      route: APP_ROUTES.home,
      observedAt: ADOPTED_AT,
    })
  })

  it('applies elapsed growth and persists it before entering S02', async () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-03'))
    const storage = new RecordingStorage(planted)
    const now = ADOPTED_AT + GROWTH_COMPLETE_MS
    const app = store(storage, now)

    await app.initialize()

    const snapshot = app.getSnapshot()
    expect(snapshot.status).toBe('ready')
    expect(snapshot.route).toBe(APP_ROUTES.home)
    expect(snapshot.gameState?.plantGrowth).toEqual({
      status: 'completed',
      plantedAt: ADOPTED_AT,
      completedAt: now,
      plantId: 'plant-03',
    })
    expect(storage.state).toEqual(snapshot.gameState)
    expect(storage.saves).toHaveLength(1)
  })

  it.each(['openPlanting', 'openPlantStorage'] as const)(
    'does not restore a previous auxiliary route after %s',
    async (command) => {
      const storage = new RecordingStorage(initialState())
      const firstLaunch = store(storage)
      await firstLaunch.initialize()
      expect(firstLaunch.navigation.navigate(command)).toBe(true)
      expect(firstLaunch.getSnapshot().route).not.toBe(APP_ROUTES.home)

      const relaunched = store(storage)
      await relaunched.initialize()
      expect(relaunched.getSnapshot().route).toBe(APP_ROUTES.home)
    },
  )

  it('stays out of the ready state when loading fails', async () => {
    const storage = new RecordingStorage(null)
    storage.loadError = { code: 'read_failed' }
    const app = store(storage)

    await app.initialize()

    expect(app.getSnapshot()).toEqual({
      status: 'error',
      gameState: null,
      route: null,
      error: { source: 'storage', error: { code: 'read_failed' } },
    })
  })

  it('stays out of the ready state when elapsed growth cannot be saved', async () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-02'))
    const storage = new RecordingStorage(planted)
    storage.saveError = { code: 'write_failed' }
    const app = store(storage, ADOPTED_AT + GROWTH_COMPLETE_MS)

    await app.initialize()

    expect(app.getSnapshot()).toMatchObject({
      status: 'error',
      gameState: null,
      route: null,
      error: { source: 'storage', error: { code: 'write_failed' } },
    })
    expect(storage.state).toEqual(planted)
  })
})

describe('game actions', () => {
  it('reflects a new game only after it has been saved', async () => {
    const storage = new RecordingStorage(null)
    const app = store(storage)
    await app.initialize()

    expect(await app.actions.adoptRock({ rockId: 'rock-01', name: '단단이' })).toEqual({
      ok: true,
      value: undefined,
    })

    const snapshot = app.getSnapshot()
    expect(snapshot.route).toBe(APP_ROUTES.home)
    expect(snapshot.gameState).toEqual(storage.state)
    expect(snapshot.gameState?.rock).toEqual({
      id: 'rock-01',
      name: '단단이',
      adoptedAt: ADOPTED_AT,
    })
  })

  it('keeps app and stored state unchanged when a save fails', async () => {
    const original = initialState()
    const storage = new RecordingStorage(original)
    const app = store(storage)
    await app.initialize()
    const before = app.getSnapshot()
    storage.saveError = { code: 'write_failed' }

    expect(await app.actions.plantSeed()).toEqual({
      ok: false,
      error: { source: 'storage', error: { code: 'write_failed' } },
    })
    expect(app.getSnapshot()).toBe(before)
    expect(storage.state).toBe(original)
  })

  it('refreshes the elapsed growth view without saving an incomplete transition', async () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-01'))
    const storage = new RecordingStorage(planted)
    let currentTime = ADOPTED_AT
    const app = createAppStore({
      storage,
      now: () => currentTime,
      selectPlant: () => 'plant-01',
    })
    await app.initialize()
    currentTime = ADOPTED_AT + GROWING_STAGE_START_MS

    expect(await app.actions.refreshGrowth()).toEqual({ ok: true, value: undefined })

    const snapshot = app.getSnapshot()
    expect(snapshot.status).toBe('ready')
    if (snapshot.status === 'ready' && snapshot.gameState !== null) {
      expect(snapshot.observedAt).toBe(currentTime)
      expect(snapshot.gameState).toEqual(planted)
      expect(unwrap(getGrowthView(snapshot.gameState, snapshot.observedAt))).toMatchObject({
        status: 'growing',
        stage: 'growing',
      })
    }
    expect(storage.saves).toHaveLength(0)
  })

  it('collects and equips a completed plant before returning home', async () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-01'))
    const storage = new RecordingStorage(planted)
    const app = store(storage, ADOPTED_AT + GROWTH_COMPLETE_MS)
    await app.initialize()
    app.navigation.navigate('openPlanting')

    expect(await app.actions.finishGrowthWithEquipment()).toEqual({
      ok: true,
      value: undefined,
    })

    const snapshot = app.getSnapshot()
    expect(snapshot.route).toBe(APP_ROUTES.home)
    expect(snapshot.gameState?.plantGrowth).toBeNull()
    expect(snapshot.gameState?.ownedPlants).toEqual(['plant-01'])
    expect(snapshot.gameState?.equipment).toEqual({
      status: 'equipped',
      plantId: 'plant-01',
    })
    expect(storage.state).toEqual(snapshot.gameState)
  })

  it('collects a completed plant and opens storage without changing equipment', async () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-02'))
    const storage = new RecordingStorage(planted)
    const app = store(storage, ADOPTED_AT + GROWTH_COMPLETE_MS)
    await app.initialize()
    app.navigation.navigate('openPlanting')

    expect(await app.actions.finishGrowthToStorage()).toEqual({
      ok: true,
      value: undefined,
    })

    const snapshot = app.getSnapshot()
    expect(snapshot.route).toBe(APP_ROUTES.plantStorage)
    expect(snapshot.gameState?.ownedPlants).toEqual(['plant-02'])
    expect(snapshot.gameState?.equipment).toEqual({ status: 'unequipped' })
    expect(storage.state).toEqual(snapshot.gameState)
  })
})
