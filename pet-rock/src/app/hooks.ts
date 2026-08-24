import { use, useMemo, useSyncExternalStore } from 'react'

import { getGrowthView } from '../domain'
import { AppStoreContext } from './context'
import type { AppSnapshot, GameActions, GameQueries, AppNavigation } from './types'

function useAppStore() {
  const store = use(AppStoreContext)

  if (store === null) {
    throw new Error('App hooks must be used inside AppProvider')
  }

  return store
}

export function useAppSnapshot(): AppSnapshot {
  const store = useAppStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

export function useGameQueries(): GameQueries {
  const snapshot = useAppSnapshot()

  return useMemo(() => {
    const gameState = snapshot.status === 'ready' ? snapshot.gameState : null
    return {
      gameState,
      hasRock: gameState !== null,
      growth:
        gameState === null || snapshot.status !== 'ready'
          ? null
          : getGrowthView(gameState, snapshot.observedAt),
    }
  }, [snapshot])
}

export function useGameActions(): GameActions {
  return useAppStore().actions
}

export function useAppNavigation(): AppNavigation {
  return useAppStore().navigation
}
