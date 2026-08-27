import { describe, expect, it } from 'vitest'

import { createInitialGameState, type GameState, type Result } from '../domain'
import { DEVELOPMENT_SEED_REFILL_AMOUNT, refillBasicSeeds } from './seed-refill'

function unwrap<Value>(result: Result<Value>): Value {
  if (!result.ok) {
    throw new Error(`Expected success, received ${result.error.code}`)
  }

  return result.value
}

function initialState(): GameState {
  return unwrap(
    createInitialGameState({ rockId: 'rock-01', name: '몽돌', adoptedAt: 0 }),
  )
}

describe('refillBasicSeeds', () => {
  it('adds the fixed development refill amount to the basic seed count', () => {
    const state = initialState()

    const result = refillBasicSeeds(state)

    expect(result).toEqual({
      ok: true,
      value: {
        ...state,
        seeds: { basic: state.seeds.basic + DEVELOPMENT_SEED_REFILL_AMOUNT },
      },
    })
  })

  it('refills seeds after they have all been used without touching other state', () => {
    const emptied: GameState = { ...initialState(), seeds: { basic: 0 } }

    const result = refillBasicSeeds(emptied)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.seeds.basic).toBe(DEVELOPMENT_SEED_REFILL_AMOUNT)
      expect(result.value.rock).toBe(emptied.rock)
      expect(result.value.plantGrowth).toBe(emptied.plantGrowth)
      expect(result.value.ownedPlants).toBe(emptied.ownedPlants)
      expect(result.value.equipment).toBe(emptied.equipment)
    }
  })
})
