import { describe, expect, it } from 'vitest'

import { APP_ROUTES } from './routes'
import { getRouteTransitionDirection } from './route-transition'

describe('route transition direction', () => {
  it.each([
    [APP_ROUTES.rockSelection, APP_ROUTES.home],
    [APP_ROUTES.home, APP_ROUTES.planting],
    [APP_ROUTES.home, APP_ROUTES.plantStorage],
    [APP_ROUTES.plantStorage, APP_ROUTES.planting],
    [APP_ROUTES.planting, APP_ROUTES.plantStorage],
  ] as const)('treats %s to %s as forward progress', (from, to) => {
    expect(getRouteTransitionDirection(from, to)).toBe('forward')
  })

  it.each([
    [APP_ROUTES.planting, APP_ROUTES.home],
    [APP_ROUTES.plantStorage, APP_ROUTES.home],
  ] as const)('treats %s to %s as a return home', (from, to) => {
    expect(getRouteTransitionDirection(from, to)).toBe('back')
  })
})
