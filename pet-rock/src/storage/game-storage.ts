import type { GameState } from '../domain'
import { deserializeGameState, serializeGameState } from './format'
import type { GameStorage, KeyValueStorage, StorageErrorCode, StorageResult } from './types'

export const GAME_STATE_STORAGE_KEY = 'pet-rock.game-state'

function failure(code: StorageErrorCode, cause: unknown): StorageResult<never> {
  return { ok: false, error: { code, cause } }
}

export function createGameStorage(
  storage: KeyValueStorage,
  key: string = GAME_STATE_STORAGE_KEY,
): GameStorage {
  return {
    async load() {
      let serialized: string | null

      try {
        serialized = await storage.getItem(key)
      } catch (cause) {
        return failure('read_failed', cause)
      }

      if (serialized === null) {
        return { ok: true, value: null }
      }

      return deserializeGameState(serialized)
    },

    async save(state: GameState) {
      try {
        await storage.setItem(key, serializeGameState(state))
        return { ok: true, value: undefined }
      } catch (cause) {
        return failure('write_failed', cause)
      }
    },

    async clear() {
      try {
        await storage.removeItem(key)
        return { ok: true, value: undefined }
      } catch (cause) {
        return failure('clear_failed', cause)
      }
    },
  }
}
