import { PLANT_CATALOG, type GameState } from '../domain'
import type { RockShareModel } from './types'

export function createRockShareModel(state: GameState): RockShareModel {
  const equipment = state.equipment
  const equippedPlant =
    equipment.status === 'equipped'
      ? PLANT_CATALOG.find(({ id }) => id === equipment.plantId) ?? null
      : null

  return {
    rock: {
      id: state.rock.id,
      name: state.rock.name,
    },
    plant: equippedPlant,
  }
}

export function createRockShareText(model: RockShareModel): string {
  const plantText =
    model.plant === null
      ? '머리 위 식물: 없음'
      : `머리 위 식물: ${model.plant.displayName}`

  return `내 애완돌을 소개할게요.\n이름: ${model.rock.name}\n돌: ${model.rock.id}\n${plantText}`
}
