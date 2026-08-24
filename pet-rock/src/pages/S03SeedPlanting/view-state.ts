import {
  PLANT_CATALOG,
  type GameState,
  type GrowthView,
  type PlantId,
  type Result,
} from '../../domain'

export type SeedPlantingViewState =
  | Readonly<{
      status: 'empty'
      seedCount: number
      canPlant: boolean
    }>
  | Readonly<{
      status: 'growing'
      seedCount: number
      stage: 'planted' | 'growing'
    }>
  | Readonly<{
      status: 'completed'
      seedCount: number
      plantId: PlantId
      displayName: string
      assetKey: string
      isNew: boolean
    }>
  | Readonly<{
      status: 'unavailable'
      seedCount: number
    }>

export function getSeedPlantingViewState(
  gameState: GameState | null,
  growth: Result<GrowthView> | null,
): SeedPlantingViewState {
  const seedCount = gameState?.seeds.basic ?? 0

  if (gameState === null || growth === null || !growth.ok) {
    return { status: 'unavailable', seedCount }
  }

  if (growth.value.status === 'empty') {
    return { status: 'empty', seedCount, canPlant: seedCount > 0 }
  }

  if (growth.value.status === 'growing') {
    return { status: 'growing', seedCount, stage: growth.value.stage }
  }

  const completedPlantId = growth.value.plantId
  const plant = PLANT_CATALOG.find(({ id }) => id === completedPlantId)

  if (plant === undefined) {
    return { status: 'unavailable', seedCount }
  }

  return {
    status: 'completed',
    seedCount,
    plantId: plant.id,
    displayName: plant.displayName,
    assetKey: plant.assetKey,
    isNew: !gameState.ownedPlants.includes(plant.id),
  }
}
