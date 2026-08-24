import { describe, expect, it } from 'vitest'

import { createInitialGameState, type GameState, type Result } from '../domain'
import {
  GAME_STATE_FORMAT_VERSION,
  deserializeGameState,
  serializeGameState,
} from './format'

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
      name: '몽돌',
      adoptedAt: 1_000,
    }),
  )
}

describe('game state format', () => {
  it('serializes a versioned envelope and restores the complete domain state', () => {
    const state: GameState = {
      ...initialState(),
      plantGrowth: {
        status: 'completed',
        plantedAt: 2_000,
        completedAt: 3_000,
        plantId: 'plant-02',
      },
      ownedPlants: ['plant-01'],
      equipment: { status: 'equipped', plantId: 'plant-01' },
    }
    const serialized = serializeGameState(state)

    expect(JSON.parse(serialized)).toEqual({
      version: GAME_STATE_FORMAT_VERSION,
      state,
    })
    expect(deserializeGameState(serialized)).toEqual({ ok: true, value: state })
  })

  it.each([
    'not-json',
    'null',
    '{}',
    JSON.stringify({ version: GAME_STATE_FORMAT_VERSION, state: null }),
    JSON.stringify({
      version: GAME_STATE_FORMAT_VERSION,
      state: { ...initialState(), seeds: { basic: -1 } },
    }),
    JSON.stringify({
      version: GAME_STATE_FORMAT_VERSION,
      state: {
        ...initialState(),
        equipment: { status: 'equipped', plantId: 'plant-01' },
      },
    }),
    JSON.stringify({
      version: GAME_STATE_FORMAT_VERSION,
      state: {
        ...initialState(),
        plantGrowth: {
          status: 'growing',
          plantedAt: 999,
          resultPlantId: 'plant-01',
        },
      },
    }),
  ])('rejects malformed saved data', (serialized) => {
    expect(deserializeGameState(serialized)).toEqual({
      ok: false,
      error: { code: 'malformed_data' },
    })
  })

  it('reports an unsupported format version separately from malformed data', () => {
    const serialized = JSON.stringify({ version: 2, state: initialState() })

    expect(deserializeGameState(serialized)).toEqual({
      ok: false,
      error: { code: 'unsupported_version' },
    })
  })
})
