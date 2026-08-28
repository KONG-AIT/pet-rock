import { PLANT_CATALOG, type GameState, type PlantId } from '../../domain'

export type PreviewPlantId = PlantId | null

export type PlantStorageItem = Readonly<{
  id: PlantId
  displayName: string | null
  owned: boolean
  equipped: boolean
  selected: boolean
}>

export type PlantStorageViewModel = Readonly<{
  completedPlantCount: number
  currentPlantId: PreviewPlantId
  previewPlantId: PreviewPlantId
  plantItems: ReadonlyArray<PlantStorageItem>
}>

export function getEquippedPlantId(state: GameState): PreviewPlantId {
  return state.equipment.status === 'equipped' ? state.equipment.plantId : null
}

export function createPlantStorageViewModel(
  state: GameState,
  previewPlantId: PreviewPlantId,
): PlantStorageViewModel {
  const ownedPlantIds = new Set(state.ownedPlants)
  const currentPlantId = getEquippedPlantId(state)

  return {
    completedPlantCount: state.ownedPlants.length,
    currentPlantId,
    previewPlantId,
    plantItems: PLANT_CATALOG.map((plant) => {
      const owned = ownedPlantIds.has(plant.id)

      return {
        id: plant.id,
        displayName: owned ? plant.displayName : null,
        owned,
        equipped: currentPlantId === plant.id,
        selected: previewPlantId === plant.id,
      }
    }),
  }
}

export function hasPendingEquipmentChange(
  currentPlantId: PreviewPlantId,
  previewPlantId: PreviewPlantId,
): boolean {
  return currentPlantId !== previewPlantId
}
