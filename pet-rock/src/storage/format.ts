import {
  PLANT_IDS,
  ROCK_IDS,
  validateRockName,
  type GameState,
  type PlantEquipment,
  type PlantGrowth,
  type RockId,
} from '../domain'
import type { StorageResult } from './types'

export const GAME_STATE_FORMAT_VERSION = 1 as const

type GameStateEnvelope = Readonly<{
  version: typeof GAME_STATE_FORMAT_VERSION
  state: GameState
}>

function success<Value>(value: Value): StorageResult<Value> {
  return { ok: true, value }
}

function malformed(): StorageResult<never> {
  return { ok: false, error: { code: 'malformed_data' } }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: Record<string, unknown>, keys: ReadonlyArray<string>): boolean {
  const actualKeys = Object.keys(value)
  return actualKeys.length === keys.length && actualKeys.every((key) => keys.includes(key))
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isPlantId(value: unknown): value is GameState['ownedPlants'][number] {
  return typeof value === 'string' && PLANT_IDS.some((plantId) => plantId === value)
}

function isRockId(value: unknown): value is RockId {
  return typeof value === 'string' && ROCK_IDS.some((rockId) => rockId === value)
}

function parseEquipment(
  value: Record<string, unknown>,
  ownedPlants: GameState['ownedPlants'],
): PlantEquipment | null {
  if (hasOnlyKeys(value, ['status']) && value.status === 'unequipped') {
    return { status: 'unequipped' }
  }

  if (
    hasOnlyKeys(value, ['status', 'plantId']) &&
    value.status === 'equipped' &&
    isPlantId(value.plantId) &&
    ownedPlants.includes(value.plantId)
  ) {
    return { status: 'equipped', plantId: value.plantId }
  }

  return null
}

function parsePlantGrowth(value: unknown): PlantGrowth | null | undefined {
  if (value === null) {
    return null
  }

  if (!isRecord(value) || typeof value.status !== 'string') {
    return undefined
  }

  if (
    value.status === 'growing' &&
    hasOnlyKeys(value, ['status', 'plantedAt', 'resultPlantId']) &&
    isTimestamp(value.plantedAt) &&
    isPlantId(value.resultPlantId)
  ) {
    return {
      status: 'growing',
      plantedAt: value.plantedAt,
      resultPlantId: value.resultPlantId,
    }
  }

  if (
    value.status === 'completed' &&
    hasOnlyKeys(value, ['status', 'plantedAt', 'completedAt', 'plantId']) &&
    isTimestamp(value.plantedAt) &&
    isTimestamp(value.completedAt) &&
    value.completedAt >= value.plantedAt &&
    isPlantId(value.plantId)
  ) {
    return {
      status: 'completed',
      plantedAt: value.plantedAt,
      completedAt: value.completedAt,
      plantId: value.plantId,
    }
  }

  return undefined
}

function parseGameState(value: unknown): GameState | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['rock', 'seeds', 'plantGrowth', 'ownedPlants', 'equipment']) ||
    !isRecord(value.seeds) ||
    !hasOnlyKeys(value.seeds, ['basic']) ||
    typeof value.seeds.basic !== 'number' ||
    !Number.isSafeInteger(value.seeds.basic) ||
    value.seeds.basic < 0 ||
    !Array.isArray(value.ownedPlants) ||
    !value.ownedPlants.every(isPlantId) ||
    new Set(value.ownedPlants).size !== value.ownedPlants.length ||
    !isRecord(value.equipment)
  ) {
    return null
  }

  const rock = value.rock

  if (
    !isRecord(rock) ||
    !hasOnlyKeys(rock, ['id', 'name', 'adoptedAt']) ||
    !isRockId(rock.id) ||
    typeof rock.name !== 'string' ||
    !isTimestamp(rock.adoptedAt)
  ) {
    return null
  }

  const name = validateRockName(rock.name)
  const plantGrowth = parsePlantGrowth(value.plantGrowth)
  const equipment = parseEquipment(value.equipment, value.ownedPlants)

  if (
    !name.valid ||
    plantGrowth === undefined ||
    (plantGrowth !== null && plantGrowth.plantedAt < rock.adoptedAt) ||
    equipment === null
  ) {
    return null
  }

  return {
    rock: {
      id: rock.id,
      name: name.name,
      adoptedAt: rock.adoptedAt,
    },
    seeds: { basic: value.seeds.basic },
    plantGrowth,
    ownedPlants: value.ownedPlants,
    equipment,
  }
}

export function serializeGameState(state: GameState): string {
  const envelope: GameStateEnvelope = {
    version: GAME_STATE_FORMAT_VERSION,
    state,
  }

  return JSON.stringify(envelope)
}

export function deserializeGameState(serialized: string): StorageResult<GameState> {
  let value: unknown

  try {
    value = JSON.parse(serialized)
  } catch {
    return malformed()
  }

  if (!isRecord(value) || !hasOnlyKeys(value, ['version', 'state'])) {
    return malformed()
  }

  if (value.version !== GAME_STATE_FORMAT_VERSION) {
    return { ok: false, error: { code: 'unsupported_version' } }
  }

  const state = parseGameState(value.state)
  return state === null ? malformed() : success(state)
}
