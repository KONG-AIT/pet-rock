import { PLANT_CATALOG } from './catalog'
import { validateRockName } from './name'
import type {
  DomainErrorCode,
  GameState,
  GrowthStage,
  GrowthView,
  PlantCatalogEntry,
  PlantId,
  Result,
  RockId,
} from './types'

export const INITIAL_BASIC_SEED_COUNT = 3
export const GROWING_STAGE_START_MS = 3 * 60 * 60 * 1_000
export const GROWTH_COMPLETE_MS = 6 * 60 * 60 * 1_000

export type PlantSelector = (catalog: ReadonlyArray<PlantCatalogEntry>) => PlantId

type InitialGameStateInput = Readonly<{
  rockId: RockId
  name: string
  adoptedAt: number
}>

function success<Value>(value: Value): Result<Value> {
  return { ok: true, value }
}

function failure(code: DomainErrorCode): Result<never> {
  return { ok: false, error: domainError(code) }
}

function domainError(code: DomainErrorCode) {
  return { code }
}

function isValidTime(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

export function createInitialGameState(input: InitialGameStateInput): Result<GameState> {
  const name = validateRockName(input.name)

  if (!name.valid) {
    return failure('invalid_name')
  }

  if (!isValidTime(input.adoptedAt)) {
    return failure('invalid_time')
  }

  return success({
    rock: {
      id: input.rockId,
      name: name.name,
      adoptedAt: input.adoptedAt,
    },
    seeds: { basic: INITIAL_BASIC_SEED_COUNT },
    plantGrowth: null,
    ownedPlants: [],
    equipment: { status: 'unequipped' },
  })
}

export function getGrowthStage(plantedAt: number, now: number): Result<GrowthStage> {
  if (!isValidTime(plantedAt) || !isValidTime(now) || now < plantedAt) {
    return failure('invalid_time')
  }

  const elapsed = now - plantedAt

  if (elapsed >= GROWTH_COMPLETE_MS) {
    return success('grown')
  }

  if (elapsed >= GROWING_STAGE_START_MS) {
    return success('growing')
  }

  return success('planted')
}

export function getGrowthView(state: GameState, now: number): Result<GrowthView> {
  const growth = state.plantGrowth

  if (growth === null) {
    return success({ status: 'empty' })
  }

  if (!isValidTime(now) || now < growth.plantedAt) {
    return failure('invalid_time')
  }

  if (growth.status === 'completed') {
    return success({
      status: 'completed',
      stage: 'grown',
      plantedAt: growth.plantedAt,
      plantId: growth.plantId,
    })
  }

  const stage = getGrowthStage(growth.plantedAt, now)

  if (!stage.ok) {
    return stage
  }

  return success({
    status: 'growing',
    stage: stage.value === 'grown' ? 'growing' : stage.value,
    plantedAt: growth.plantedAt,
  })
}

export function plantSeed(
  state: GameState,
  plantedAt: number,
  selectPlant: PlantSelector,
): Result<GameState> {
  if (!isValidTime(plantedAt) || plantedAt < state.rock.adoptedAt) {
    return failure('invalid_time')
  }

  if (state.plantGrowth !== null) {
    return failure('growth_in_progress')
  }

  if (state.seeds.basic < 1) {
    return failure('no_seeds')
  }

  const resultPlantId = selectPlant(PLANT_CATALOG)

  if (!PLANT_CATALOG.some(({ id }) => id === resultPlantId)) {
    return failure('invalid_plant_selection')
  }

  return success({
    ...state,
    seeds: { ...state.seeds, basic: state.seeds.basic - 1 },
    plantGrowth: { status: 'growing', plantedAt, resultPlantId },
  })
}

export function completePlantGrowth(state: GameState, now: number): Result<GameState> {
  const growth = state.plantGrowth

  if (growth === null) {
    return failure('no_growth')
  }

  if (growth.status === 'completed') {
    return failure('growth_already_complete')
  }

  const stage = getGrowthStage(growth.plantedAt, now)

  if (!stage.ok) {
    return stage
  }

  if (stage.value !== 'grown') {
    return failure('growth_not_complete')
  }

  return success({
    ...state,
    plantGrowth: {
      status: 'completed',
      plantedAt: growth.plantedAt,
      completedAt: growth.plantedAt + GROWTH_COMPLETE_MS,
      plantId: growth.resultPlantId,
    },
  })
}

export function collectCompletedPlant(state: GameState): Result<GameState> {
  const growth = state.plantGrowth

  if (growth === null) {
    return failure('no_growth')
  }

  if (growth.status !== 'completed') {
    return failure('growth_not_complete')
  }

  const alreadyOwned = state.ownedPlants.includes(growth.plantId)

  return success({
    ...state,
    plantGrowth: null,
    ownedPlants: alreadyOwned ? state.ownedPlants : [...state.ownedPlants, growth.plantId],
  })
}

export function equipPlant(state: GameState, plantId: PlantId): Result<GameState> {
  if (!state.ownedPlants.includes(plantId)) {
    return failure('plant_not_owned')
  }

  if (state.equipment.status === 'equipped' && state.equipment.plantId === plantId) {
    return failure('plant_already_equipped')
  }

  return success({ ...state, equipment: { status: 'equipped', plantId } })
}

export function unequipPlant(state: GameState): Result<GameState> {
  if (state.equipment.status === 'unequipped') {
    return failure('no_equipped_plant')
  }

  return success({ ...state, equipment: { status: 'unequipped' } })
}
