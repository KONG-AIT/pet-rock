import type {
  DomainError,
  GameState,
  GrowthView,
  PlantId,
  Result,
  RockId,
} from '../domain'
import type { StorageError } from '../storage'
import type { AppRoute, NavigationCommand } from './routes'

export type AppError =
  | Readonly<{ source: 'domain'; error: DomainError }>
  | Readonly<{ source: 'storage'; error: StorageError }>

export type AppActionError =
  | AppError
  | Readonly<{
      source: 'app'
      code:
        | 'not_ready'
        | 'game_not_started'
        | 'game_already_started'
        | 'invalid_navigation'
    }>

export type AppActionResult =
  | Readonly<{ ok: true; value: void }>
  | Readonly<{ ok: false; error: AppActionError }>

export type AppSnapshot =
  | Readonly<{ status: 'loading'; gameState: null; route: null }>
  | Readonly<{ status: 'error'; gameState: null; route: null; error: AppError }>
  | Readonly<{
      status: 'ready'
      gameState: GameState | null
      route: AppRoute
      observedAt: number
    }>

export type GameQueries = Readonly<{
  gameState: GameState | null
  hasRock: boolean
  growth: Result<GrowthView> | null
}>

export type AdoptRockInput = Readonly<{
  rockId: RockId
  name: string
}>

export interface GameActions {
  adoptRock(input: AdoptRockInput): Promise<AppActionResult>
  plantSeed(): Promise<AppActionResult>
  refreshGrowth(): Promise<AppActionResult>
  finishGrowthWithEquipment(): Promise<AppActionResult>
  finishGrowthToStorage(): Promise<AppActionResult>
  equipPlant(plantId: PlantId): Promise<AppActionResult>
  unequipPlant(): Promise<AppActionResult>
}

export interface AppNavigation {
  navigate(command: NavigationCommand): boolean
}
