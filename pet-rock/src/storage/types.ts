import type { GameState } from '../domain'

export type StorageErrorCode =
  | 'read_failed'
  | 'write_failed'
  | 'clear_failed'
  | 'malformed_data'
  | 'unsupported_version'

export type StorageError = Readonly<{
  code: StorageErrorCode
  cause?: unknown
}>

export type StorageResult<Value> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ ok: false; error: StorageError }>

export interface GameStorage {
  load(): Promise<StorageResult<GameState | null>>
  save(state: GameState): Promise<StorageResult<void>>
  clear(): Promise<StorageResult<void>>
}

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
