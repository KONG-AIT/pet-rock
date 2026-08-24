import {
  GROWTH_COMPLETE_MS,
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
      remainingMs: number
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

export function formatRemainingTime(remainingMs: number): string {
  if (remainingMs <= 0) {
    return '곧 다 자라요'
  }

  const totalMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1_000)))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}분`
  }

  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
}

export function getSeedPlantingViewState(
  gameState: GameState | null,
  growth: Result<GrowthView> | null,
  observedAt: number = Date.now(),
): SeedPlantingViewState {
  const seedCount = gameState?.seeds.basic ?? 0

  if (gameState === null || growth === null || !growth.ok) {
    return { status: 'unavailable', seedCount }
  }

  if (growth.value.status === 'empty') {
    return { status: 'empty', seedCount, canPlant: seedCount > 0 }
  }

  if (growth.value.status === 'growing') {
    return {
      status: 'growing',
      seedCount,
      stage: growth.value.stage,
      remainingMs: Math.max(0, growth.value.plantedAt + GROWTH_COMPLETE_MS - observedAt),
    }
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
