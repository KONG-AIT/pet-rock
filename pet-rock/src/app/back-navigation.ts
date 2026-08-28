import { APP_ROUTES, type AppRoute } from './routes'

export const EXIT_CONFIRMATION_WINDOW_MS = 2_000

export type BackNavigationEffect =
  | Readonly<{ type: 'navigateBackHome' }>
  | Readonly<{ type: 'armExitConfirmation' }>
  | Readonly<{ type: 'exitApp' }>
  | Readonly<{ type: 'none' }>

/**
 * Decides what a single system Back press should do for the current route,
 * per docs/ux/flows.md #19 (S03/S04 Back → S02 홈) and the S02 double-Back
 * exit confirmation. `isExitConfirmationArmed` is true only when a prior
 * Back press at S02 홈 is still within its confirmation window.
 */
export function resolveBackPress(
  route: AppRoute | null,
  isExitConfirmationArmed: boolean,
): BackNavigationEffect {
  if (route === APP_ROUTES.planting || route === APP_ROUTES.plantStorage) {
    return { type: 'navigateBackHome' }
  }

  if (route === APP_ROUTES.home) {
    return isExitConfirmationArmed ? { type: 'exitApp' } : { type: 'armExitConfirmation' }
  }

  return { type: 'none' }
}
