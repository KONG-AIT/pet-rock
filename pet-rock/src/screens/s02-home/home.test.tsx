import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { GameState, GrowthView, Result } from '../../domain'
import { HomeView } from './HomeView'
import {
  createHomeRenderModel,
  nextMenuOpenState,
  requestHomeMenuAction,
  type HomeRenderModel,
} from './home-model'

const state: GameState = {
  rock: { id: 'rock-02', name: '몽돌' as GameState['rock']['name'], adoptedAt: 1_000 },
  seeds: { basic: 2 },
  plantGrowth: null,
  ownedPlants: ['plant-02'],
  equipment: { status: 'equipped', plantId: 'plant-02' },
}

const noOp = () => undefined

function renderHome(model: HomeRenderModel, menuOpen = false) {
  return renderToStaticMarkup(
    <HomeView
      model={model}
      menuOpen={menuOpen}
      reacting={false}
      reactionKey={0}
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
})
