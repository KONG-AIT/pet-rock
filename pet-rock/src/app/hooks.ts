import { use, useMemo, useSyncExternalStore } from 'react'

import { getGrowthView } from '../domain'
import { AppSnapshotOverrideContext, AppStoreContext } from './context'
import type {
  AppSnapshot,
  GameActions,
  GameQueries,
  AppNavigation,
  DevGameActions,
} from './types'

function useAppStore() {
  const store = use(AppStoreContext)

  if (store === null) {
    throw new Error('App hooks must be used inside AppProvider')
  }

  return store
}

export function useAppSnapshot(): AppSnapshot {
  const store = useAppStore()
  const override = use(AppSnapshotOverrideContext)
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return override ?? snapshot
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

export function useDevGameActions(): DevGameActions | null {
  return useAppStore().devActions
}
