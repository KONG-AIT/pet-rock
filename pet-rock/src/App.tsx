import {
  AppProvider,
  AppRouter,
  createRandomPlantSelector,
  type AppScreens,
} from './app/index'
import { RockSelectionScreen } from './screens/s01-rock-selection'
import { HomeScreen } from './screens/s02-home'
import { PlantingScreen } from './screens/s03-planting'
import { PlantStorageScreen } from './screens/s04-plant-storage'
import { createAppsInTossGameStorage } from './storage'

const storage = createAppsInTossGameStorage()
const selectPlant = createRandomPlantSelector()
const screens: AppScreens = {
  RockSelection: RockSelectionScreen,
  Home: HomeScreen,
  Planting: PlantingScreen,
  PlantStorage: PlantStorageScreen,
}

function App() {
  return (
    <AppProvider storage={storage} selectPlant={selectPlant}>
      <AppRouter screens={screens} />
    </AppProvider>
  )
}

export default App
