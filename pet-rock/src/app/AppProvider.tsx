import { useEffect, useState, type PropsWithChildren } from 'react'

import type { PlantSelector } from '../domain'
import type { GameStorage } from '../storage'
import { AppStoreContext } from './context'
import { createAppStore, type AppStore } from './store'

type AppProviderProps = PropsWithChildren<{
  storage: GameStorage
  now?: () => number
  selectPlant: PlantSelector
}>

export function AppProvider({
  children,
  storage,
  now = Date.now,
  selectPlant,
}: AppProviderProps) {
  const [store] = useState<AppStore>(() => createAppStore({ storage, now, selectPlant }))

  useEffect(() => {
    void store.initialize()
  }, [store])

  return <AppStoreContext value={store}>{children}</AppStoreContext>
}
