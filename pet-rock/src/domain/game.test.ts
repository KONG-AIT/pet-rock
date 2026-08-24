import { describe, expect, it } from 'vitest'

import {
  GROWING_STAGE_START_MS,
  GROWTH_COMPLETE_MS,
  INITIAL_BASIC_SEED_COUNT,
  collectCompletedPlant,
  completePlantGrowth,
  createInitialGameState,
  equipPlant,
  getGrowthStage,
  getGrowthView,
  plantSeed,
  unequipPlant,
} from './game'
import type { GameState, Result } from './types'

const ADOPTED_AT = 1_000

function unwrap<Value>(result: Result<Value>): Value {
  if (!result.ok) {
    throw new Error(`Expected success, received ${result.error.code}`)
  }

  return result.value
}

function initialState(): GameState {
  return unwrap(
    createInitialGameState({
      rockId: 'rock-01',
      name: ' 몽돌 ',
      adoptedAt: ADOPTED_AT,
    }),
  )
}

describe('createInitialGameState', () => {
  it('creates the P00 initial state with three basic seeds and no equipped plant', () => {
    expect(initialState()).toEqual({
      rock: { id: 'rock-01', name: '몽돌', adoptedAt: ADOPTED_AT },
      seeds: { basic: INITIAL_BASIC_SEED_COUNT },
      plantGrowth: null,
      ownedPlants: [],
      equipment: { status: 'unequipped' },
    })
  })

  it('rejects an invalid name and invalid adoption time', () => {
    expect(
      createInitialGameState({ rockId: 'rock-01', name: ' ', adoptedAt: ADOPTED_AT }),
    ).toEqual({ ok: false, error: { code: 'invalid_name' } })
    expect(createInitialGameState({ rockId: 'rock-01', name: '몽돌', adoptedAt: -1 })).toEqual({
      ok: false,
      error: { code: 'invalid_time' },
    })
  })
})

describe('getGrowthStage', () => {
  it.each([
    [0, 'planted'],
    [GROWING_STAGE_START_MS - 1, 'planted'],
    [GROWING_STAGE_START_MS, 'growing'],
    [GROWTH_COMPLETE_MS - 1, 'growing'],
    [GROWTH_COMPLETE_MS, 'grown'],
  ] as const)('returns the stage at elapsed time %i', (elapsed, stage) => {
    expect(getGrowthStage(ADOPTED_AT, ADOPTED_AT + elapsed)).toEqual({ ok: true, value: stage })
  })

  it('rejects time before planting', () => {
    expect(getGrowthStage(ADOPTED_AT, ADOPTED_AT - 1)).toEqual({
      ok: false,
      error: { code: 'invalid_time' },
    })
  })
})

describe('plant growth', () => {
  it('consumes one seed, starts growth, and keeps the result out of the UI view', () => {
    const before = initialState()
    const after = unwrap(plantSeed(before, ADOPTED_AT, () => 'plant-02'))
    const view = unwrap(getGrowthView(after, ADOPTED_AT))

    expect(after.seeds.basic).toBe(INITIAL_BASIC_SEED_COUNT - 1)
    expect(after.plantGrowth).toEqual({
      status: 'growing',
      plantedAt: ADOPTED_AT,
      resultPlantId: 'plant-02',
    })
    expect(view).toEqual({ status: 'growing', stage: 'planted', plantedAt: ADOPTED_AT })
    expect('plantId' in view).toBe(false)
    expect('resultPlantId' in view).toBe(false)
    expect(before.seeds.basic).toBe(INITIAL_BASIC_SEED_COUNT)
    expect(before.plantGrowth).toBeNull()
  })

  it('completes at six hours, reveals the plant, and adds it to owned plants when collected', () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-03'))

    expect(completePlantGrowth(planted, ADOPTED_AT + GROWTH_COMPLETE_MS - 1)).toEqual({
      ok: false,
      error: { code: 'growth_not_complete' },
    })

    const completed = unwrap(
      completePlantGrowth(planted, ADOPTED_AT + GROWTH_COMPLETE_MS),
    )
    const completedView = unwrap(getGrowthView(completed, ADOPTED_AT + GROWTH_COMPLETE_MS))
    const collected = unwrap(collectCompletedPlant(completed))

    expect(completedView).toEqual({
      status: 'completed',
      stage: 'grown',
      plantedAt: ADOPTED_AT,
      plantId: 'plant-03',
    })
    expect(collected.ownedPlants).toEqual(['plant-03'])
    expect(collected.plantGrowth).toBeNull()
  })

  it('does not duplicate an already owned plant when collecting another one', () => {
    const state = { ...initialState(), ownedPlants: ['plant-01'] as const }
    const planted = unwrap(plantSeed(state, ADOPTED_AT, () => 'plant-01'))
    const completed = unwrap(completePlantGrowth(planted, ADOPTED_AT + GROWTH_COMPLETE_MS))

    expect(unwrap(collectCompletedPlant(completed)).ownedPlants).toEqual(['plant-01'])
  })
})

describe('plant equipment', () => {
  it('equips an owned plant and supports an explicit unequipped state', () => {
    const owned = { ...initialState(), ownedPlants: ['plant-01'] as const }
    const equipped = unwrap(equipPlant(owned, 'plant-01'))
    const unequipped = unwrap(unequipPlant(equipped))

    expect(equipped.equipment).toEqual({ status: 'equipped', plantId: 'plant-01' })
    expect(unequipped.equipment).toEqual({ status: 'unequipped' })
  })
})

describe('invalid transitions', () => {
  it('rejects planting while the pot is occupied or when no seeds remain', () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-01'))
    const noSeeds = { ...initialState(), seeds: { basic: 0 } }

    expect(plantSeed(planted, ADOPTED_AT, () => 'plant-02')).toEqual({
      ok: false,
      error: { code: 'growth_in_progress' },
    })
    expect(plantSeed(noSeeds, ADOPTED_AT, () => 'plant-01')).toEqual({
      ok: false,
      error: { code: 'no_seeds' },
    })
  })

  it('rejects completion and collection without a valid completed growth', () => {
    const state = initialState()
    const planted = unwrap(plantSeed(state, ADOPTED_AT, () => 'plant-01'))

    expect(completePlantGrowth(state, ADOPTED_AT + GROWTH_COMPLETE_MS)).toEqual({
      ok: false,
      error: { code: 'no_growth' },
    })
    expect(collectCompletedPlant(planted)).toEqual({
      ok: false,
      error: { code: 'growth_not_complete' },
    })
  })

  it('rejects equipping an unowned or already equipped plant and removing no plant', () => {
    const owned = { ...initialState(), ownedPlants: ['plant-01'] as const }
    const equipped = unwrap(equipPlant(owned, 'plant-01'))

    expect(equipPlant(initialState(), 'plant-01')).toEqual({
      ok: false,
      error: { code: 'plant_not_owned' },
    })
    expect(equipPlant(equipped, 'plant-01')).toEqual({
      ok: false,
      error: { code: 'plant_already_equipped' },
    })
    expect(unequipPlant(initialState())).toEqual({
      ok: false,
      error: { code: 'no_equipped_plant' },
    })
  })
})
