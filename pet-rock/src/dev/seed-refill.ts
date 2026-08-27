import type { GameState, Result } from '../domain'

export const DEVELOPMENT_SEED_REFILL_AMOUNT = 3

export function refillBasicSeeds(state: GameState): Result<GameState> {
  return {
    ok: true,
    value: {
      ...state,
      seeds: { ...state.seeds, basic: state.seeds.basic + DEVELOPMENT_SEED_REFILL_AMOUNT },
    },
  }
}
