import type { GameState } from '../domain'
import { createRockShareModel } from './model'
import { createDefaultRockShareService } from './service'
import type { RockShareService, ShareResult } from './types'

export function shareRock(
  state: GameState,
  service: RockShareService = createDefaultRockShareService(),
): Promise<ShareResult> {
  return service.share(createRockShareModel(state))
}
