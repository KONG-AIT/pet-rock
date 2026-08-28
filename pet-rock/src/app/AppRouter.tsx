import { useEffect, useRef, useState, type ComponentType } from 'react'

import { APP_ROUTES } from './routes'
import { useAppSnapshot } from './hooks'
import { AppSnapshotOverrideContext } from './context'
import {
  getRouteTransitionDirection,
  ROUTE_TRANSITION_DURATION_MS,
} from './route-transition'
import type { AppRoute } from './routes'
import type { AppSnapshot } from './types'
import './AppRouter.css'

export type AppScreens = Readonly<{
  RockSelection: ComponentType
  Home: ComponentType
  Planting: ComponentType
  PlantStorage: ComponentType
}>

type AppRouterProps = Readonly<{
  screens: AppScreens
}>

const ROUTE_LABELS: Readonly<Record<AppRoute, string>> = {
  [APP_ROUTES.rockSelection]: '돌 선택',
  [APP_ROUTES.home]: '홈',
  [APP_ROUTES.planting]: '내 정원',
  [APP_ROUTES.plantStorage]: '식물 보관함',
}

function RouteScreen({
  route,
  screens,
}: Readonly<{ route: AppRoute; screens: AppScreens }>) {
  switch (route) {
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

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AppRouter({ screens }: AppRouterProps) {
  const snapshot = useAppSnapshot()
  const readyRoute = snapshot.status === 'ready' ? snapshot.route : null
  const currentViewRef = useRef<HTMLDivElement | null>(null)
  const [renderedSnapshot, setRenderedSnapshot] = useState<AppSnapshot>(snapshot)
  const [departingSnapshot, setDepartingSnapshot] = useState<AppSnapshot | null>(null)

  if (renderedSnapshot !== snapshot) {
    if (
      renderedSnapshot.status === 'ready' &&
      snapshot.status === 'ready' &&
      renderedSnapshot.route !== snapshot.route
    ) {
      setDepartingSnapshot(
        prefersReducedMotion() ? null : renderedSnapshot,
      )
    }
    setRenderedSnapshot(snapshot)
  }

  const departingRoute =
    departingSnapshot?.status === 'ready' ? departingSnapshot.route : null

  useEffect(() => {
    if (readyRoute === null) {
      return
    }

    if (departingRoute === null) {
      currentViewRef.current?.focus({ preventScroll: true })
      return
    }

    const timer = window.setTimeout(() => {
      setDepartingSnapshot(null)
    }, ROUTE_TRANSITION_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [departingRoute, readyRoute])

  if (snapshot.status === 'loading') {
    return <main aria-busy="true" className="app-router__status">게임을 불러오고 있어요.</main>
  }

  if (snapshot.status === 'error') {
    return <main className="app-router__status" role="alert">게임을 불러오지 못했어요. 앱을 다시 실행해주세요.</main>
  }

  const direction =
    departingRoute === null
      ? null
      : getRouteTransitionDirection(departingRoute, snapshot.route)

  return (
    <div
      className="app-router"
      data-transitioning={departingRoute !== null || undefined}
    >
      {departingRoute === null ? null : (
        <div
          aria-hidden="true"
          className="app-route-view app-route-view--departing"
          data-direction={direction}
          inert
          key={departingRoute}
        >
          <AppSnapshotOverrideContext value={departingSnapshot}>
            <RouteScreen route={departingRoute} screens={screens} />
          </AppSnapshotOverrideContext>
        </div>
      )}
      <div
        aria-label={ROUTE_LABELS[snapshot.route]}
        className={`app-route-view${departingRoute === null ? '' : ' app-route-view--arriving'}`}
        data-direction={direction ?? undefined}
        inert={departingRoute !== null}
        key={snapshot.route}
        ref={currentViewRef}
        role="region"
        tabIndex={-1}
      >
        <AppSnapshotOverrideContext value={null}>
          <RouteScreen route={snapshot.route} screens={screens} />
        </AppSnapshotOverrideContext>
      </div>
    </div>
  )
}
