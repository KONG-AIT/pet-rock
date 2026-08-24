import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { createInitialGameState, getGrowthView, plantSeed, completePlantGrowth } from '../../domain'
import type { GameState, Result } from '../../domain'
import { SeedPlantingContent } from './index'
import { formatRemainingTime, getSeedPlantingViewState } from './view-state'

const ADOPTED_AT = 1_000
const SIX_HOURS = 6 * 60 * 60 * 1_000

function unwrap<Value>(result: Result<Value>): Value {
  if (!result.ok) {
    throw new Error(result.error.code)
  }

  return result.value
}

function initialState(): GameState {
  return unwrap(createInitialGameState({ rockId: 'rock-01', name: '몽돌', adoptedAt: ADOPTED_AT }))
}

const callbacks = {
  pendingAction: null,
  onPlant: vi.fn(),
  onEquip: vi.fn(),
  onStore: vi.fn(),
} as const

describe('S03 seed planting view states', () => {
  it('shows the current seed count, empty pot, and planting action before planting', () => {
    const state = initialState()
    const viewState = getSeedPlantingViewState(state, getGrowthView(state, ADOPTED_AT))
    const html = renderToStaticMarkup(<SeedPlantingContent viewState={viewState} {...callbacks} />)

    expect(viewState).toMatchObject({ status: 'empty', seedCount: 3, canPlant: true })
    expect(html).toContain('보유 기본 씨앗 3개')
    expect(html).toContain('씨앗 심기')
    expect(html).toContain('s03-pot--empty')
  })

  it.each([
    [0, 'planted', '씨앗이 자리를 잡고 있어요.'],
    [3 * 60 * 60 * 1_000, 'growing', '조금씩 자라고 있어요.'],
  ] as const)('renders the %s ms growth stage without revealing the plant', (elapsed, stage, copy) => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-02'))
    const viewState = getSeedPlantingViewState(
      planted,
      getGrowthView(planted, ADOPTED_AT + elapsed),
      ADOPTED_AT + elapsed,
    )
    const html = renderToStaticMarkup(<SeedPlantingContent viewState={viewState} {...callbacks} />)

    expect(planted.seeds.basic).toBe(2)
    expect(viewState).toMatchObject({ status: 'growing', stage, seedCount: 2 })
    expect(html).toContain(copy)
    expect(html).toContain('남은 시간')
    expect(html).not.toContain('식물 2')
    expect(html).not.toContain('plant-02')
    expect(html).not.toContain('씨앗 심기</button>')
  })

  it('formats the remaining growth time without a progress gauge', () => {
    expect(formatRemainingTime(6 * 60 * 60 * 1_000)).toBe('6시간')
    expect(formatRemainingTime((2 * 60 + 45) * 60 * 1_000)).toBe('2시간 45분')
    expect(formatRemainingTime(30 * 1_000)).toBe('1분')
    expect(formatRemainingTime(0)).toBe('곧 다 자라요')
  })

  it('reveals a completed plant and offers equip and store actions at six hours', () => {
    const planted = unwrap(plantSeed(initialState(), ADOPTED_AT, () => 'plant-03'))
    const completed = unwrap(completePlantGrowth(planted, ADOPTED_AT + SIX_HOURS))
    const viewState = getSeedPlantingViewState(
      completed,
      getGrowthView(completed, ADOPTED_AT + SIX_HOURS),
    )
    const html = renderToStaticMarkup(<SeedPlantingContent viewState={viewState} {...callbacks} />)

    expect(viewState).toMatchObject({
      status: 'completed',
      plantId: 'plant-03',
      displayName: '식물 3',
      isNew: true,
    })
    expect(html).toContain('다 자랐어요!')
    expect(html).toContain('식물 3')
    expect(html).toContain('머리에 심기')
    expect(html).toContain('보관하기')
  })

  it('does not mark an already owned completed plant as new', () => {
    const owned = { ...initialState(), ownedPlants: ['plant-01'] as const }
    const planted = unwrap(plantSeed(owned, ADOPTED_AT, () => 'plant-01'))
    const completed = unwrap(completePlantGrowth(planted, ADOPTED_AT + SIX_HOURS))
    const viewState = getSeedPlantingViewState(
      completed,
      getGrowthView(completed, ADOPTED_AT + SIX_HOURS),
    )

    expect(viewState).toMatchObject({ status: 'completed', isNew: false })
  })

  it('disables planting when no basic seed remains', () => {
    const state = { ...initialState(), seeds: { basic: 0 } }
    const viewState = getSeedPlantingViewState(state, getGrowthView(state, ADOPTED_AT))
    const html = renderToStaticMarkup(<SeedPlantingContent viewState={viewState} {...callbacks} />)

    expect(viewState).toMatchObject({ status: 'empty', seedCount: 0, canPlant: false })
    expect(html).toContain('disabled=""')
    expect(html).toContain('보유한 씨앗이 없어요.')
  })
})
