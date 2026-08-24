import { Storage } from '@apps-in-toss/web-framework'

import { createGameStorage } from './game-storage'
import type { GameStorage } from './types'

export function createAppsInTossGameStorage(): GameStorage {
  return createGameStorage(Storage)
}
