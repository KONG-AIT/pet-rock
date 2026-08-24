export const ROCK_IDS = ['rock-01', 'rock-02', 'rock-03'] as const

export type RockId = (typeof ROCK_IDS)[number]

export type Rock = Readonly<{
  id: RockId
  name: RockName
  adoptedAt: number
}>

declare const rockNameBrand: unique symbol

export type RockName = string & { readonly [rockNameBrand]: true }

export type NameValidationErrorCode = 'required' | 'too_long' | 'invalid_characters'

export type NameValidationResult =
  | Readonly<{ valid: true; name: RockName }>
  | Readonly<{ valid: false; reason: NameValidationErrorCode }>

export const SEED_TYPES = ['basic'] as const

export type SeedType = (typeof SEED_TYPES)[number]

export type SeedInventory = Readonly<Record<SeedType, number>>

export const PLANT_IDS = ['plant-01', 'plant-02', 'plant-03'] as const

export type PlantId = (typeof PLANT_IDS)[number]

export type PlantCatalogEntry = Readonly<{
  id: PlantId
  displayName: string
  assetKey: string
}>

export type GrowingPlant = Readonly<{
  status: 'growing'
  plantedAt: number
  resultPlantId: PlantId
}>

export type CompletedPlant = Readonly<{
  status: 'completed'
  plantedAt: number
  completedAt: number
  plantId: PlantId
}>

export type PlantGrowth = GrowingPlant | CompletedPlant

export type GrowthStage = 'planted' | 'growing' | 'grown'

export type GrowthView =
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'growing'; stage: Exclude<GrowthStage, 'grown'>; plantedAt: number }>
  | Readonly<{ status: 'completed'; stage: 'grown'; plantedAt: number; plantId: PlantId }>

export type OwnedPlants = ReadonlyArray<PlantId>

export type PlantEquipment =
  | Readonly<{ status: 'unequipped' }>
  | Readonly<{ status: 'equipped'; plantId: PlantId }>

export type GameState = Readonly<{
  rock: Rock
  seeds: SeedInventory
  plantGrowth: PlantGrowth | null
  ownedPlants: OwnedPlants
  equipment: PlantEquipment
}>

export type DomainErrorCode =
  | 'invalid_name'
  | 'invalid_time'
  | 'no_seeds'
  | 'growth_in_progress'
  | 'no_growth'
  | 'growth_not_complete'
  | 'growth_already_complete'
  | 'plant_not_owned'
  | 'plant_already_equipped'
  | 'no_equipped_plant'
  | 'invalid_plant_selection'

export type DomainError = Readonly<{
  code: DomainErrorCode
}>

export type Result<Value> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ ok: false; error: DomainError }>
