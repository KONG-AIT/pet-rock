export const APP_ROUTES = {
  rockSelection: 's01-rock-selection',
  home: 's02-home',
  planting: 's03-planting',
  plantStorage: 's04-plant-storage',
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]

export const NAVIGATION_DESTINATIONS = {
  completeRockSelection: APP_ROUTES.home,
  openPlanting: APP_ROUTES.planting,
  openPlantStorage: APP_ROUTES.plantStorage,
  backHome: APP_ROUTES.home,
  finishGrowthEquipped: APP_ROUTES.home,
  finishGrowthStored: APP_ROUTES.planting,
} as const

export type NavigationCommand = keyof typeof NAVIGATION_DESTINATIONS

const NAVIGATION_SOURCES: Readonly<Record<NavigationCommand, ReadonlyArray<AppRoute>>> = {
  completeRockSelection: [APP_ROUTES.rockSelection],
  openPlanting: [APP_ROUTES.home, APP_ROUTES.plantStorage],
  openPlantStorage: [APP_ROUTES.home],
  backHome: [APP_ROUTES.planting, APP_ROUTES.plantStorage],
  finishGrowthEquipped: [APP_ROUTES.planting],
  finishGrowthStored: [APP_ROUTES.planting],
}

export function getNavigationDestination(
  currentRoute: AppRoute,
  command: NavigationCommand,
): AppRoute | null {
  if (!NAVIGATION_SOURCES[command].includes(currentRoute)) {
    return null
  }

  return NAVIGATION_DESTINATIONS[command]
}
