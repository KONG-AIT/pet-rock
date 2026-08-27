import { describe, expect, it } from 'vitest'

import {
  GROWTH_COMPLETE_MS,
  createInitialGameState,
  type GameState,
  type Result,
} from '../domain'
import { createDevelopmentClock } from '../dev/growth-clock'
import { shareRock, type RockShareService, type ShareResult } from '../share'
import { createInMemoryGameStorage } from '../storage'
import { APP_ROUTES } from './routes'
import { createAppStore } from './store'

const STARTED_AT = 10_000

function unwrap<Value>(result: Result<Value>): Value {
  if (!result.ok) {
    throw new Error(result.error.code)
  }

  return result.value
}

function createHarness(initialState?: GameState) {
  let now = STARTED_AT
  const storage = createInMemoryGameStorage(initialState)
  const app = createAppStore({
    storage,
    now: () => now,
    selectPlant: () => 'plant-02',
  })

  return {
    app,
    storage,
    advanceBy(elapsed: number) {
      now += elapsed
    },
  }
}

function currentGameState(app: ReturnType<typeof createAppStore>): GameState {
  const snapshot = app.getSnapshot()

  if (snapshot.status !== 'ready' || snapshot.gameState === null) {
    throw new Error('Expected a ready game state')
  }

  return snapshot.gameState
}

describe('whole game flow integration', () => {
  it('grows two plants consecutively with the development clock', async () => {
    const clock = createDevelopmentClock(null, () => STARTED_AT)
    const storage = createInMemoryGameStorage()
    const app = createAppStore({
      storage,
      now: clock.now,
      selectPlant: () => 'plant-02',
    })
    await app.initialize()
    await app.actions.adoptRock({ rockId: 'rock-03', name: '조약돌' })

    for (let growthNumber = 0; growthNumber < 2; growthNumber += 1) {
      expect(app.navigation.navigate('openPlanting')).toBe(true)
      await expect(app.actions.plantSeed()).resolves.toEqual({ ok: true, value: undefined })
      const growth = currentGameState(app).plantGrowth
      expect(growth?.status).toBe('growing')
      if (growth === null) {
        throw new Error('Expected a planted growth')
      }

      expect(clock.moveTo(growth.plantedAt, GROWTH_COMPLETE_MS + 1)).toBe(true)
      await expect(app.actions.refreshGrowth()).resolves.toEqual({ ok: true, value: undefined })
      await expect(app.actions.finishGrowthToStorage()).resolves.toEqual({
        ok: true,
        value: undefined,
      })
    }

    expect(currentGameState(app)).toMatchObject({
      plantGrowth: null,
      ownedPlants: ['plant-02'],
      seeds: { basic: 1 },
    })
  })

  it('takes a new user from adoption through growth, storage, equipment, and relaunch', async () => {
    const { app, storage, advanceBy } = createHarness()
    await app.initialize()

    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.rockSelection,
      gameState: null,
    })

    await expect(
      app.actions.adoptRock({ rockId: 'rock-03', name: '조약돌' }),
    ).resolves.toEqual({ ok: true, value: undefined })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { rock: { id: 'rock-03', name: '조약돌' }, seeds: { basic: 3 } },
    })

    expect(app.navigation.navigate('openPlanting')).toBe(true)
    await expect(app.actions.plantSeed()).resolves.toEqual({ ok: true, value: undefined })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.planting,
      gameState: {
        seeds: { basic: 2 },
        plantGrowth: { status: 'growing', resultPlantId: 'plant-02' },
      },
    })

    advanceBy(GROWTH_COMPLETE_MS)
    await expect(app.actions.refreshGrowth()).resolves.toEqual({ ok: true, value: undefined })
    await expect(app.actions.finishGrowthToStorage()).resolves.toEqual({
      ok: true,
      value: undefined,
    })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.plantStorage,
      gameState: {
        plantGrowth: null,
        ownedPlants: ['plant-02'],
        equipment: { status: 'unequipped' },
      },
    })

    await expect(app.actions.equipPlant('plant-02')).resolves.toEqual({
      ok: true,
      value: undefined,
    })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'equipped', plantId: 'plant-02' } },
    })

    const relaunched = createAppStore({
      storage,
      now: () => STARTED_AT + GROWTH_COMPLETE_MS,
      selectPlant: () => 'plant-01',
    })
    await relaunched.initialize()
    expect(relaunched.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'equipped', plantId: 'plant-02' } },
    })
  })

  it('connects S02, S04 seeds, and S03 while keeping every Back destination at home', async () => {
    const state: GameState = {
      ...unwrap(
        createInitialGameState({ rockId: 'rock-01', name: '돌이', adoptedAt: STARTED_AT }),
      ),
      ownedPlants: ['plant-01', 'plant-03'],
      equipment: { status: 'equipped', plantId: 'plant-01' },
    }
    const { app } = createHarness(state)
    await app.initialize()

    expect(app.navigation.navigate('openPlantStorage')).toBe(true)
    expect(app.navigation.navigate('openPlanting')).toBe(true)
    expect(app.navigation.navigate('backHome')).toBe(true)
    expect(app.getSnapshot().route).toBe(APP_ROUTES.home)

    expect(app.navigation.navigate('openPlanting')).toBe(true)
    expect(app.navigation.navigate('backHome')).toBe(true)
    expect(app.getSnapshot().route).toBe(APP_ROUTES.home)

    expect(app.navigation.navigate('openPlantStorage')).toBe(true)
    await expect(app.actions.equipPlant('plant-03')).resolves.toEqual({
      ok: true,
      value: undefined,
    })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'equipped', plantId: 'plant-03' } },
    })

    expect(app.navigation.navigate('openPlantStorage')).toBe(true)
    await expect(app.actions.unequipPlant()).resolves.toEqual({ ok: true, value: undefined })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'unequipped' } },
    })
  })

  it('finishes duplicate growth for the already-equipped plant and returns home', async () => {
    const state: GameState = {
      ...unwrap(
        createInitialGameState({ rockId: 'rock-01', name: '돌이', adoptedAt: STARTED_AT }),
      ),
      ownedPlants: ['plant-02'],
      equipment: { status: 'equipped', plantId: 'plant-02' },
    }
    const { app, storage, advanceBy } = createHarness(state)
    await app.initialize()

    expect(app.navigation.navigate('openPlanting')).toBe(true)
    await expect(app.actions.plantSeed()).resolves.toEqual({ ok: true, value: undefined })

    advanceBy(GROWTH_COMPLETE_MS)
    await expect(app.actions.refreshGrowth()).resolves.toEqual({ ok: true, value: undefined })
    await expect(app.actions.finishGrowthWithEquipment()).resolves.toEqual({
      ok: true,
      value: undefined,
    })

    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: {
        plantGrowth: null,
        ownedPlants: ['plant-02'],
        equipment: { status: 'equipped', plantId: 'plant-02' },
      },
    })
    await expect(storage.load()).resolves.toEqual({
      ok: true,
      value: currentGameState(app),
    })
  })

  it.each<ShareResult>([
    { status: 'shared' },
    { status: 'cancelled' },
    { status: 'unavailable' },
    { status: 'failed' },
  ])('keeps home and saved game state after share result $status', async (shareResult) => {
    const state = unwrap(
      createInitialGameState({ rockId: 'rock-02', name: '몽돌', adoptedAt: STARTED_AT }),
    )
    const { app, storage } = createHarness(state)
    const service: RockShareService = { share: async () => shareResult }
    await app.initialize()
    const before = app.getSnapshot()

    await expect(shareRock(currentGameState(app), service)).resolves.toEqual(shareResult)

    expect(app.getSnapshot()).toBe(before)
    await expect(storage.load()).resolves.toEqual({ ok: true, value: state })
  })
})
