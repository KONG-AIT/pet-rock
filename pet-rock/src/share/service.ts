import { createAppsInTossShareService } from './apps-in-toss'
import { createBrowserShareService } from './browser'
import type { RockShareModel, RockShareService, ShareResult } from './types'

type RuntimeWindow = Window &
  Readonly<{
    ReactNativeWebView?: unknown
  }>

export type RockShareRuntime = Readonly<{
  isAppsInToss: boolean
  appsInToss: RockShareService
  browser: RockShareService
}>

function getBrowserUrl(runtimeWindow: Window | undefined): string | undefined {
  const url = runtimeWindow?.location.href

  if (url === undefined || !/^https?:\/\//.test(url)) {
    return undefined
  }

  return url
}

export function isAppsInTossRuntime(
  runtimeWindow: Readonly<{ ReactNativeWebView?: unknown }> | undefined,
): boolean {
  return runtimeWindow?.ReactNativeWebView != null
}

export function createRockShareService(runtime: RockShareRuntime): RockShareService {
  return {
    share(model: RockShareModel): Promise<ShareResult> {
      return runtime.isAppsInToss
        ? runtime.appsInToss.share(model)
        : runtime.browser.share(model)
    },
  }
}

export function createDefaultRockShareService(
  runtimeWindow: RuntimeWindow | undefined =
    typeof window === 'undefined' ? undefined : (window as RuntimeWindow),
): RockShareService {
  return createRockShareService({
    isAppsInToss: isAppsInTossRuntime(runtimeWindow),
    appsInToss: createAppsInTossShareService(),
    browser: createBrowserShareService(
      runtimeWindow?.navigator,
      getBrowserUrl(runtimeWindow),
      runtimeWindow?.isSecureContext === true,
    ),
  })
}
