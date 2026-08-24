import type { ComponentType } from 'react'

import { APP_ROUTES } from './routes'
import { useAppSnapshot } from './hooks'

export type AppScreens = Readonly<{
  RockSelection: ComponentType
  Home: ComponentType
  Planting: ComponentType
  PlantStorage: ComponentType
}>

type AppRouterProps = Readonly<{
  screens: AppScreens
}>

export function AppRouter({ screens }: AppRouterProps) {
  const snapshot = useAppSnapshot()

  if (snapshot.status === 'loading') {
    return <main aria-busy="true">게임을 불러오고 있어요.</main>
  }

  if (snapshot.status === 'error') {
    return <main role="alert">게임을 불러오지 못했어요. 앱을 다시 실행해주세요.</main>
  }

  switch (snapshot.route) {
    case APP_ROUTES.rockSelection:
      return <screens.RockSelection />
    case APP_ROUTES.home:
      return <screens.Home />
    case APP_ROUTES.planting:
      return <screens.Planting />
    case APP_ROUTES.plantStorage:
      return <screens.PlantStorage />
  }
}
