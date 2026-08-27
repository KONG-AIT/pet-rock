import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { GameState, GrowthView, Result } from '../../domain'
import { HomeView } from './HomeView'
import {
  createHomeShareNotice,
  createHomeRenderModel,
  nextMenuOpenState,
  requestHomeMenuAction,
  type HomeRenderModel,
  type HomeShareNotice,
} from './home-model'
import { requestRockShareOnce, shareThenUnwindMenu } from './home-share'

const state: GameState = {
  rock: { id: 'rock-02', name: '몽돌' as GameState['rock']['name'], adoptedAt: 1_000 },
  seeds: { basic: 2 },
  plantGrowth: null,
  ownedPlants: ['plant-02'],
  equipment: { status: 'equipped', plantId: 'plant-02' },
}

const noOp = () => undefined

function renderHome(
  model: HomeRenderModel,
  menuOpen = false,
  sharePending = false,
  shareNotice: HomeShareNotice = null,
) {
  return renderToStaticMarkup(
    <HomeView
      model={model}
      menuOpen={menuOpen}
      reacting={false}
      reactionKey={0}
      shareNotice={shareNotice}
      sharePending={sharePending}
      onRockTouch={noOp}
      onToggleMenu={noOp}
      onDismissMenu={noOp}
      onMenuAction={noOp}
    />,
  )
}

describe('S02 home render model', () => {
  it('shows the adopted rock name and equipped plant', () => {
    const model = createHomeRenderModel(state, { ok: true, value: { status: 'empty' } })
    const markup = renderHome(model)

    expect(markup).toContain('몽돌')
    expect(markup).toContain('data-plant-id="plant-02"')
    expect(markup).toContain('aria-label="몽돌 쓰다듬기"')
  })

  it('renders an unequipped rock naturally without a plant', () => {
    const unequipped: GameState = { ...state, equipment: { status: 'unequipped' } }
    const markup = renderHome(createHomeRenderModel(unequipped, null))

    expect(markup).not.toContain('data-plant-id=')
    expect(markup).toContain('data-elapsed-state="none"')
  })

  it.each([
    [{ status: 'growing', stage: 'planted', plantedAt: 1_000 }, 'planted'],
    [{ status: 'growing', stage: 'growing', plantedAt: 1_000 }, 'growing'],
    [{ status: 'completed', stage: 'grown', plantedAt: 1_000, plantId: 'plant-01' }, 'grown'],
  ] as ReadonlyArray<readonly [GrowthView, string]>)(
    'provides the %s elapsed-time rendering point',
    (view, expected) => {
      const growth: Result<GrowthView> = { ok: true, value: view }
      expect(renderHome(createHomeRenderModel(state, growth))).toContain(
        `data-elapsed-state="${expected}"`,
      )
    },
  )

  it('keeps the default home visually quiet until the action button opens', () => {
    const model = createHomeRenderModel(state, null)
    const closed = renderHome(model)
    const open = renderHome(model, true)

    expect(closed).toContain('aria-label="액션 메뉴 열기"')
    expect(closed).not.toContain('role="menuitem"')
    expect(open).toContain('씨앗 심기')
    expect(open).toContain('식물 보관함')
    expect(open).toContain('공유')
    expect(open).not.toMatch(/행복도|수분|햇빛|이름 수정|캘린더|설정|꾸미기/)
  })
})

describe('S02 action menu behavior', () => {
  it('closes for system Back, action-button retouch, outside touch, and selection', () => {
    expect(nextMenuOpenState(false, 'action-button')).toBe(true)
    expect(nextMenuOpenState(true, 'action-button')).toBe(false)
    expect(nextMenuOpenState(true, 'system-back')).toBe(false)
    expect(nextMenuOpenState(true, 'outside')).toBe(false)
    expect(nextMenuOpenState(true, 'selection')).toBe(false)
  })

  it('uses the P03 navigation commands for S03 and S04', () => {
    const navigate = vi.fn(() => true)
    const share = vi.fn()
    const navigation = { navigate }

    expect(requestHomeMenuAction('plant-seed', navigation, share)).toBe(true)
    expect(requestHomeMenuAction('plant-storage', navigation, share)).toBe(true)
    expect(navigate.mock.calls).toEqual([['openPlanting'], ['openPlantStorage']])
    expect(share).not.toHaveBeenCalled()
  })

  it('exposes share as a callback without implementing sharing', () => {
    const navigate = vi.fn(() => true)
    const share = vi.fn()

    expect(requestHomeMenuAction('share', { navigate }, share)).toBe(true)
    expect(share).toHaveBeenCalledOnce()
    expect(navigate).not.toHaveBeenCalled()
  })

  it.each([
    [{ status: 'shared' }, '공유 창을 열었어요.'],
    [{ status: 'unavailable' }, '이 환경에서는 공유 기능을 지원하지 않아요.'],
    [{ status: 'failed' }, '공유하지 못했어요. 잠시 후 다시 시도해주세요.'],
  ] as const)('creates short feedback for $status', (result, message) => {
    expect(createHomeShareNotice(result)?.message).toBe(message)
  })

  it('keeps cancellation quiet', () => {
    expect(createHomeShareNotice({ status: 'cancelled' })).toBeNull()
  })

  it('renders progress and result feedback without adding another screen', () => {
    const model = createHomeRenderModel(state, null)
    const pending = renderHome(model, true, true)
    const failed = renderHome(
      model,
      false,
      false,
      createHomeShareNotice({ status: 'failed' }),
    )

    expect(pending).toContain('공유를 준비하고 있어요.')
    expect(pending).toContain('disabled=""')
    expect(failed).toContain('공유하지 못했어요. 잠시 후 다시 시도해주세요.')
    expect(failed).toContain('data-screen="s02-home"')
  })

  it('prevents duplicate share requests while one is in progress', async () => {
    let finishShare: ((value: { status: 'shared' }) => void) | undefined
    const share = vi.fn(() => new Promise<{ status: 'shared' }>((resolve) => {
      finishShare = resolve
    }))
    const inFlight = { current: false }

    const first = requestRockShareOnce(state, { share }, inFlight)
    await expect(requestRockShareOnce(state, { share }, inFlight)).resolves.toBeNull()
    expect(share).toHaveBeenCalledOnce()

    finishShare?.({ status: 'shared' })
    await expect(first).resolves.toEqual({ status: 'shared' })
    expect(inFlight.current).toBe(false)
  })

  it('maps an unexpected service rejection to failed and allows retrying', async () => {
    const inFlight = { current: false }
    const share = vi.fn().mockRejectedValueOnce(new Error('unexpected'))

    await expect(requestRockShareOnce(state, { share }, inFlight)).resolves.toEqual({
      status: 'failed',
    })
    expect(inFlight.current).toBe(false)
  })

  it('keeps the menu history entry open until the share flow settles', async () => {
    let finishShare: (() => void) | undefined
    const performShare = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishShare = resolve
        }),
    )
    const unwindMenuHistory = vi.fn()

    shareThenUnwindMenu(performShare, unwindMenuHistory)

    expect(performShare).toHaveBeenCalledOnce()
    expect(unwindMenuHistory).not.toHaveBeenCalled()

    finishShare?.()
    await Promise.resolve()
    await Promise.resolve()

    expect(unwindMenuHistory).toHaveBeenCalledOnce()
  })

  it('still unwinds the menu history entry when the share flow rejects', async () => {
    const performShare = vi.fn().mockRejectedValueOnce(new Error('unexpected'))
    const unwindMenuHistory = vi.fn()

    shareThenUnwindMenu(performShare, unwindMenuHistory)
    await Promise.resolve()
    await Promise.resolve()

    expect(unwindMenuHistory).toHaveBeenCalledOnce()
  })
})
