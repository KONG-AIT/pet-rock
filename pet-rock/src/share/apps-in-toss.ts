import { Share } from '@apps-in-toss/web-framework'
import { createRockShareText } from './model'
import type { RockShareModel, RockShareService, ShareResult } from './types'

export const ROCK_SHARE_DEEP_LINK = 'intoss://pet-rock'

export type AppsInTossShareApi = Readonly<{
  createLink(options: Readonly<{ path: string }>): Promise<string>
  sendMessage(options: Readonly<{ message: string }>): Promise<void>
}>

export function createAppsInTossShareService(
  shareApi: AppsInTossShareApi = Share,
): RockShareService {
  return {
    async share(model: RockShareModel): Promise<ShareResult> {
      try {
        const link = await shareApi.createLink({ path: ROCK_SHARE_DEEP_LINK })
        const message = `${createRockShareText(model)}\n${link}`

        await shareApi.sendMessage({ message })
        return { status: 'shared' }
      } catch {
        return { status: 'failed' }
      }
    },
  }
}
