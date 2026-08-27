import { createRockShareText } from './model'
import type { RockShareModel, RockShareService, ShareResult } from './types'

export type BrowserShareApi = Readonly<{
  share?(data: ShareData): Promise<void>
}>

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function createBrowserShareService(
  navigatorApi: BrowserShareApi | undefined,
  currentUrl: string | undefined,
  isSecureContext = true,
): RockShareService {
  return {
    async share(model: RockShareModel): Promise<ShareResult> {
      if (!isSecureContext || navigatorApi?.share === undefined || currentUrl === undefined) {
        return { status: 'unavailable' }
      }

      try {
        await navigatorApi.share({
          text: createRockShareText(model),
          url: currentUrl,
        })
        return { status: 'shared' }
      } catch (error) {
        return { status: isAbortError(error) ? 'cancelled' : 'failed' }
      }
    },
  }
}
