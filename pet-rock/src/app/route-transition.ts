import { APP_ROUTES, type AppRoute } from './routes'

export const ROUTE_TRANSITION_DURATION_MS = 210

export type RouteTransitionDirection = 'forward' | 'back'

export function getRouteTransitionDirection(
  from: AppRoute,
  to: AppRoute,
): RouteTransitionDirection {
  if (
    to === APP_ROUTES.home &&
    (from === APP_ROUTES.planting || from === APP_ROUTES.plantStorage)
  ) {
    return 'back'
  }

  return 'forward'
}
