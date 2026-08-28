import { useEffect, useRef, useState } from 'react'
import { Screen, graniteEvent } from '@apps-in-toss/web-framework'

import { isAppsInTossRuntime } from '../share'
import {
  EXIT_CONFIRMATION_WINDOW_MS,
  resolveBackPress,
  type BackNavigationEffect,
} from './back-navigation'
import { createTransientHistoryEntry, type TransientHistoryEntry } from './history-entry'
import { useAppNavigation, useAppSnapshot } from './hooks'
import { APP_ROUTES } from './routes'

const ROUTE_BACK_STATE_KEY = 'petRockRouteBack'

type RuntimeWindow = Window & Readonly<{ ReactNativeWebView?: unknown }>

function isAppsInToss(): boolean {
  return isAppsInTossRuntime(typeof window === 'undefined' ? undefined : (window as RuntimeWindow))
}

function exitApp(): void {
  if (!isAppsInToss()) {
    return
  }

  Screen.close().catch(() => {})
}

export type RouteBackNavigation = Readonly<{
  showExitConfirmation: boolean
}>

/**
 * Wires hardware/system Back to in-app navigation for the whole app session:
 * S03/S04 Back returns to S02 홈 (docs/ux/flows.md #19), and a second Back
 * at S02 홈 within `EXIT_CONFIRMATION_WINDOW_MS` exits the app. Handles both
 * a plain mobile browser (via browser history) and the Apps in Toss WebView
 * (via `graniteEvent`'s `backEvent`, which does not go through `popstate`).
 */
export function useRouteBackNavigation(): RouteBackNavigation {
  const snapshot = useAppSnapshot()
  const navigation = useAppNavigation()
  const route = snapshot.status === 'ready' ? snapshot.route : null

  const routeRef = useRef(route)
  const armedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [entry] = useState<TransientHistoryEntry | null>(() =>
    typeof window === 'undefined'
      ? null
      : createTransientHistoryEntry(window.history, ROUTE_BACK_STATE_KEY),
  )

  useEffect(() => {
    routeRef.current = route

    if (
      entry === null ||
      route === null ||
      route === APP_ROUTES.rockSelection ||
      isAppsInToss()
    ) {
      return
    }

    // Deferred one tick: a route change away from S01 돌 선택 can coincide
    // with that screen's own overlay history entry still being popped
    // (its `history.back()` resolves asynchronously), and pushing here
    // synchronously would race it and corrupt the history stack.
    const timer = window.setTimeout(() => entry.open(), 0)
    return () => window.clearTimeout(timer)
  }, [entry, route])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    function clearArmTimer() {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    function disarmExitConfirmation() {
      clearArmTimer()
      armedRef.current = false
      setShowExitConfirmation(false)
    }

    function applyEffect(effect: BackNavigationEffect, rearm: () => void) {
      switch (effect.type) {
        case 'navigateBackHome':
          navigation.navigate('backHome')
          rearm()
          return
        case 'armExitConfirmation':
          armedRef.current = true
          setShowExitConfirmation(true)
          clearArmTimer()
          timerRef.current = window.setTimeout(disarmExitConfirmation, EXIT_CONFIRMATION_WINDOW_MS)
          rearm()
          return
        case 'exitApp':
          disarmExitConfirmation()
          exitApp()
          return
        case 'none':
          return
      }
    }

    function handleBackPress() {
      applyEffect(resolveBackPress(routeRef.current, armedRef.current), () => {})
    }

    if (isAppsInToss()) {
      return graniteEvent.addEventListener('backEvent', { onEvent: handleBackPress })
    }

    if (entry === null) {
      return
    }

    function handlePopState() {
      if (entry === null || !entry.consumePop()) {
        return
      }

      applyEffect(resolveBackPress(routeRef.current, armedRef.current), () => entry.open())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      clearArmTimer()
      entry.close()
    }
  }, [entry, navigation])

  return { showExitConfirmation }
}
