import type {
  GameState,
  GrowthStage,
  GrowthView,
  PlantId,
  Result,
  RockId,
} from '../../domain'
import type { AppNavigation } from '../../app/index'
import type { ShareResult } from '../../share'

export type HomeElapsedState = 'none' | GrowthStage

export type HomeRenderModel = Readonly<{
  rockId: RockId
  rockName: string
  equippedPlantId: PlantId | null
  elapsedState: HomeElapsedState
}>

export type HomeMenuAction = 'plant-seed' | 'plant-storage' | 'share'
export type HomeMenuDismissal = 'action-button' | 'system-back' | 'outside' | 'selection'
export type HomeShareNotice = Readonly<{
  message: string
  tone: 'neutral' | 'error'
}> | null

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

export function createHomeShareNotice(result: ShareResult): HomeShareNotice {
  switch (result.status) {
    case 'shared':
      return { message: '공유 창을 열었어요.', tone: 'neutral' }
    case 'cancelled':
      return null
    case 'unavailable':
      return { message: '이 환경에서는 공유 기능을 지원하지 않아요.', tone: 'error' }
    case 'failed':
      return { message: '공유하지 못했어요. 잠시 후 다시 시도해주세요.', tone: 'error' }
  }
}
