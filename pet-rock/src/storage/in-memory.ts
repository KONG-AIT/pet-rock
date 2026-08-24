import type { GameState } from '../domain'
import { GAME_STATE_STORAGE_KEY, createGameStorage } from './game-storage'
import { serializeGameState } from './format'
import type { GameStorage, KeyValueStorage } from './types'

class InMemoryKeyValueStorage implements KeyValueStorage {
  private readonly values: Map<string, string>

  constructor(entries: ReadonlyArray<readonly [string, string]> = []) {
    this.values = new Map(entries)
  }

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key)
  }
}

export function createInMemoryGameStorage(initialState?: GameState): GameStorage {
  const entries: ReadonlyArray<readonly [string, string]> =
    initialState === undefined
      ? []
      : [[GAME_STATE_STORAGE_KEY, serializeGameState(initialState)]]

  return createGameStorage(new InMemoryKeyValueStorage(entries))
}
