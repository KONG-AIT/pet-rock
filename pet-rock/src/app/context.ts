import { createContext } from 'react'

import type { AppStore } from './store'
import type { AppSnapshot } from './types'

export const AppStoreContext = createContext<AppStore | null>(null)
export const AppSnapshotOverrideContext = createContext<AppSnapshot | null>(null)
