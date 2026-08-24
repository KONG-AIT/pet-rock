import { describe, expect, it } from 'vitest'

import { createInitialGameState, type GameState, type Result } from '../domain'
import {
  GAME_STATE_STORAGE_KEY,
  createGameStorage,
  createInMemoryGameStorage,
  type GameStorage,
  type KeyValueStorage,
} from '.'

function unwrap<Value>(result: Result<Value>): Value {
  if (!result.ok) {
    throw new Error(`Expected success, received ${result.error.code}`)
  }

  return result.value
}

function initialState(): GameState {
  return unwrap(
    createInitialGameState({
      rockId: 'rock-03',
      name: '단단이',
      adoptedAt: 3_000,
    }),
  )
}

class MemoryKeyValueStorage implements KeyValueStorage {
  readonly values = new Map<string, string>()

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

function storageContract(name: string, createStorage: () => GameStorage): void {
  describe(name, () => {
    it('distinguishes an absent save from a stored game', async () => {
      const storage = createStorage()
      expect(await storage.load()).toEqual({ ok: true, value: null })
    })

    it('saves, restores, and clears a game state', async () => {
      const storage = createStorage()
      const state = initialState()

      expect(await storage.save(state)).toEqual({ ok: true, value: undefined })
      expect(await storage.load()).toEqual({ ok: true, value: state })
      expect(await storage.clear()).toEqual({ ok: true, value: undefined })
      expect(await storage.load()).toEqual({ ok: true, value: null })
    })
  })
}

describe('GameStorage contract', () => {
  storageContract('key-value adapter', () => createGameStorage(new MemoryKeyValueStorage()))
  storageContract('in-memory fake', () => createInMemoryGameStorage())

  it('supports seeding the in-memory fake for consumer tests', async () => {
    expect(await createInMemoryGameStorage(initialState()).load()).toEqual({
      ok: true,
      value: initialState(),
    })
  })
})

describe('key-value storage adapter', () => {
  it('uses one stable key and rejects malformed stored values', async () => {
    const keyValueStorage = new MemoryKeyValueStorage()
    keyValueStorage.values.set(GAME_STATE_STORAGE_KEY, '{broken')

    expect(await createGameStorage(keyValueStorage).load()).toEqual({
      ok: false,
      error: { code: 'malformed_data' },
    })
  })

  it.each([
    ['getItem', 'read_failed'],
    ['setItem', 'write_failed'],
    ['removeItem', 'clear_failed'],
  ] as const)('maps %s failures to %s', async (method, code) => {
    const cause = new Error(`${method} failed`)
    const keyValueStorage = new MemoryKeyValueStorage()
    keyValueStorage[method] = async () => {
      throw cause
    }
    const storage = createGameStorage(keyValueStorage)

    const result =
      method === 'getItem'
        ? await storage.load()
        : method === 'setItem'
          ? await storage.save(initialState())
          : await storage.clear()

    expect(result).toEqual({ ok: false, error: { code, cause } })
  })
})
