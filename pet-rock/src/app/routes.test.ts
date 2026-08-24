import { describe, expect, it } from 'vitest'

import {
  APP_ROUTES,
  NAVIGATION_DESTINATIONS,
  getNavigationDestination,
  type AppRoute,
  type NavigationCommand,
} from './routes'

describe('app navigation contract', () => {
  it.each([
    [APP_ROUTES.rockSelection, 'completeRockSelection'],
    [APP_ROUTES.home, 'openPlanting'],
    [APP_ROUTES.home, 'openPlantStorage'],
    [APP_ROUTES.planting, 'backHome'],
    [APP_ROUTES.plantStorage, 'backHome'],
    [APP_ROUTES.planting, 'finishGrowthEquipped'],
    [APP_ROUTES.planting, 'finishGrowthStored'],
    [APP_ROUTES.plantStorage, 'openPlanting'],
  ] as ReadonlyArray<readonly [AppRoute, NavigationCommand]>) (
    'moves from %s with %s to its documented destination',
    (source, command) => {
      expect(getNavigationDestination(source, command)).toBe(
        NAVIGATION_DESTINATIONS[command],
      )
    },
  )

  it('rejects a command outside its documented source route', () => {
    expect(getNavigationDestination(APP_ROUTES.rockSelection, 'openPlanting')).toBeNull()
    expect(getNavigationDestination(APP_ROUTES.home, 'backHome')).toBeNull()
  })
})
