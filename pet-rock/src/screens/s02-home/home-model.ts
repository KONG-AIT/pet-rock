import type {
  GameState,
  GrowthStage,
  GrowthView,
  PlantId,
  Result,
  RockId,
} from '../../domain'
import type { AppNavigation } from '../../app/index'

export type HomeElapsedState = 'none' | GrowthStage

export type HomeRenderModel = Readonly<{
  rockId: RockId
  rockName: string
  equippedPlantId: PlantId | null
  elapsedState: HomeElapsedState
}>

export type HomeMenuAction = 'plant-seed' | 'plant-storage' | 'share'
export type HomeMenuDismissal = 'action-button' | 'system-back' | 'outside' | 'selection'

export function createHomeRenderModel(
  gameState: GameState,
  growth: Result<GrowthView> | null,
): HomeRenderModel {
  return {
    rockId: gameState.rock.id,
    rockName: gameState.rock.name,
    equippedPlantId:
      gameState.equipment.status === 'equipped' ? gameState.equipment.plantId : null,
    elapsedState: growth?.ok && growth.value.status !== 'empty' ? growth.value.stage : 'none',
  }
}

export function nextMenuOpenState(
  isOpen: boolean,
  dismissal: HomeMenuDismissal,
): boolean {
  return dismissal === 'action-button' ? !isOpen : false
}

export function requestHomeMenuAction(
  action: HomeMenuAction,
  navigation: AppNavigation,
  onShare: () => void,
): boolean {
  switch (action) {
    case 'plant-seed':
      return navigation.navigate('openPlanting')
    case 'plant-storage':
      return navigation.navigate('openPlantStorage')
    case 'share':
      onShare()
      return true
  }
}
