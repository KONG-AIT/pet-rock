import { describe, expect, it } from 'vitest'

import { resolveBackPress } from './back-navigation'
import { APP_ROUTES } from './routes'

describe('resolveBackPress', () => {
  it('sends S03 내 정원 Back to S02 홈', () => {
    expect(resolveBackPress(APP_ROUTES.planting, false)).toEqual({
      type: 'navigateBackHome',
    })
    expect(resolveBackPress(APP_ROUTES.planting, true)).toEqual({
      type: 'navigateBackHome',
    })
  })

  it('sends S04 식물 보관함 Back to S02 홈 regardless of entry point', () => {
    expect(resolveBackPress(APP_ROUTES.plantStorage, false)).toEqual({
      type: 'navigateBackHome',
    })
  })

  it('arms the exit confirmation on the first Back at S02 홈', () => {
    expect(resolveBackPress(APP_ROUTES.home, false)).toEqual({
      type: 'armExitConfirmation',
    })
  })

  it('exits on a second Back at S02 홈 while the confirmation is armed', () => {
    expect(resolveBackPress(APP_ROUTES.home, true)).toEqual({ type: 'exitApp' })
  })

  it('does nothing for S01 돌 선택 and no route yet', () => {
    expect(resolveBackPress(APP_ROUTES.rockSelection, false)).toEqual({ type: 'none' })
    expect(resolveBackPress(null, false)).toEqual({ type: 'none' })
  })
})
