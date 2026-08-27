import {
  AppProvider,
  AppRouter,
  createRandomPlantSelector,
  type AppScreens,
} from './app/index'
import { DevelopmentGrowthClock } from './dev/DevelopmentGrowthClock'
import { createDevelopmentClock } from './dev/growth-clock'
import { RockSelectionScreen } from './screens/s01-rock-selection'
import { HomeScreen } from './screens/s02-home'
import { PlantingScreen } from './screens/s03-planting'
import { PlantStorageScreen } from './screens/s04-plant-storage'
import { createAppsInTossGameStorage } from './storage'

const storage = createAppsInTossGameStorage()
const selectPlant = createRandomPlantSelector()
const developmentClock = import.meta.env.DEV
  ? createDevelopmentClock()
  : null
const screens: AppScreens = {
  RockSelection: RockSelectionScreen,
  Home: HomeScreen,
  Planting: PlantingScreen,
  PlantStorage: PlantStorageScreen,
}

function App() {
  return (
    <AppProvider
      storage={storage}
      selectPlant={selectPlant}
      now={developmentClock?.now}
    >
      <AppRouter screens={screens} />
      {developmentClock !== null ? (
        <DevelopmentGrowthClock clock={developmentClock} />
      ) : null}
    </AppProvider>
  )
}

export default App
