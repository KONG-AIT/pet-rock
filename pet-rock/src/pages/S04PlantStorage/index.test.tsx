import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { APP_ROUTES, createAppStore } from '../../app/index'
import { createInitialGameState, type GameState } from '../../domain'
import { createInMemoryGameStorage } from '../../storage'
import { PlantStorageView } from './index'
import {
  createPlantStorageViewModel,
  getEquippedPlantId,
  hasPendingEquipmentChange,
} from './model'

function gameState(overrides: Partial<GameState> = {}): GameState {
  const created = createInitialGameState({
    rockId: 'rock-02',
    name: '몽돌',
    adoptedAt: 1_000,
  })

  if (!created.ok) {
    throw new Error('test game state could not be created')
  }

  return { ...created.value, ...overrides }
}

const callbacks = {
  onBack: () => undefined,
  onTabChange: () => undefined,
  onPreviewChange: () => undefined,
  onApply: () => undefined,
  onOpenPlanting: () => undefined,
}

function appStore(initialState: GameState) {
  const storage = createInMemoryGameStorage(initialState)
  const app = createAppStore({
    storage,
    now: () => 5_000,
    selectPlant: () => 'plant-01',
  })

  return { app, storage }
}

describe('S04 plant storage model', () => {
  it('shows owned plants and keeps unowned catalog entries anonymous', () => {
    const state = gameState({
      ownedPlants: ['plant-01', 'plant-03'],
      equipment: { status: 'equipped', plantId: 'plant-03' },
    })

    const model = createPlantStorageViewModel(state, 'plant-01')

    expect(model.completedPlantCount).toBe(2)
    expect(model.plantItems).toEqual([
      {
        id: 'plant-01',
        displayName: '식물 1',
        owned: true,
        equipped: false,
        selected: true,
      },
      {
        id: 'plant-02',
        displayName: null,
        owned: false,
        equipped: false,
        selected: false,
      },
      {
        id: 'plant-03',
        displayName: '식물 3',
        owned: true,
        equipped: true,
        selected: false,
      },
    ])
  })

  it('does not include a growing plant in the owned collection', () => {
    const state = gameState({
      ownedPlants: ['plant-01'],
      plantGrowth: {
        status: 'growing',
        plantedAt: 2_000,
        resultPlantId: 'plant-02',
      },
    })

    const model = createPlantStorageViewModel(state, null)

    expect(model.completedPlantCount).toBe(1)
    expect(model.plantItems.find(({ id }) => id === 'plant-02')).toMatchObject({
      owned: false,
      displayName: null,
    })
  })

  it('keeps preview selection separate from persisted equipment', () => {
    const state = gameState({
      ownedPlants: ['plant-01', 'plant-02'],
      equipment: { status: 'equipped', plantId: 'plant-01' },
    })

    const preview = createPlantStorageViewModel(state, 'plant-02')
    const removedPreview = createPlantStorageViewModel(state, null)

    expect(preview.previewPlantId).toBe('plant-02')
    expect(preview.currentPlantId).toBe('plant-01')
    expect(removedPreview.previewPlantId).toBeNull()
    expect(getEquippedPlantId(state)).toBe('plant-01')
    expect(state.equipment).toEqual({ status: 'equipped', plantId: 'plant-01' })
  })

  it('enables applying only when preview and equipment differ', () => {
    expect(hasPendingEquipmentChange('plant-01', 'plant-01')).toBe(false)
    expect(hasPendingEquipmentChange('plant-01', 'plant-02')).toBe(true)
    expect(hasPendingEquipmentChange('plant-01', null)).toBe(true)
    expect(hasPendingEquipmentChange(null, null)).toBe(false)
  })

  it('uses the actual basic seed quantity from GameState', () => {
    const model = createPlantStorageViewModel(gameState({ seeds: { basic: 7 } }), null)

    expect(model.seedCount).toBe(7)
  })
})

describe('S04 plant storage view', () => {
  it('renders plant and seed tabs with current equipment and locked plants', () => {
    const state = gameState({
      ownedPlants: ['plant-01'],
      equipment: { status: 'equipped', plantId: 'plant-01' },
      seeds: { basic: 2 },
    })

    const html = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={state}
        activeTab="plants"
        previewPlantId="plant-01"
        pending={false}
        errorMessage={null}
      />,
    )

    expect(html).toContain('role="tablist"')
    expect(html).toContain('식물')
    expect(html).toContain('씨앗')
    expect(html).toContain('없음')
    expect(html).toContain('장착 중')
    expect(html).toContain('미리보기')
    expect(html).toContain('미획득')
    expect(html).toContain('머리에 심기')
    expect(html).toContain('disabled=""')
    expect(html).toContain('plant-storage__panel--with-apply')
  })

  it('distinguishes persisted equipment from a different preview selection', () => {
    const html = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({
          ownedPlants: ['plant-01', 'plant-02'],
          equipment: { status: 'equipped', plantId: 'plant-01' },
        })}
        activeTab="plants"
        previewPlantId="plant-02"
        pending={false}
        errorMessage={null}
      />,
    )

    expect(html).toMatch(
      /data-selected="false" data-equipped="true"[^>]*>[\s\S]*?식물 1[\s\S]*?plant-card__equipped-badge">장착 중/,
    )
    expect(html).toMatch(
      /data-selected="true" data-equipped="false"[^>]*>[\s\S]*?식물 2[\s\S]*?plant-card__preview-badge" data-active="true"[^>]*>미리보기/,
    )
    expect(html.match(/plant-card__equipped-badge/g)).toHaveLength(1)
    expect(html.match(/plant-card__preview-badge" data-active="true"/g)).toHaveLength(1)
  })

  it('always reserves the preview badge slot so card height stays constant', () => {
    const html = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({
          ownedPlants: ['plant-01', 'plant-02'],
          equipment: { status: 'equipped', plantId: 'plant-01' },
        })}
        activeTab="plants"
        previewPlantId="plant-02"
        pending={false}
        errorMessage={null}
      />,
    )

    expect(html.match(/plant-card__preview-badge"/g)).toHaveLength(3)
    expect(html.match(/plant-card__preview-badge" data-active="false"/g)).toHaveLength(2)
  })

  it('uses the same equipment and preview indicators for the none card', () => {
    const equippedNone = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({ ownedPlants: ['plant-01'], equipment: { status: 'unequipped' } })}
        activeTab="plants"
        previewPlantId="plant-01"
        pending={false}
        errorMessage={null}
      />,
    )
    const previewNone = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({
          ownedPlants: ['plant-01'],
          equipment: { status: 'equipped', plantId: 'plant-01' },
        })}
        activeTab="plants"
        previewPlantId={null}
        pending={false}
        errorMessage={null}
      />,
    )

    expect(equippedNone).toMatch(
      /plant-card--none" data-selected="false" data-equipped="true"[^>]*>[\s\S]*?장착 중/,
    )
    expect(previewNone).toMatch(
      /plant-card--none" data-selected="true" data-equipped="false"[^>]*>[\s\S]*?plant-card__preview-badge" data-active="true"[^>]*>미리보기/,
    )
    expect(equippedNone.match(/plant-card--none[\s\S]*?plant-card__preview-badge" data-active="false"/)).not.toBeNull()
  })

  it('renders one aggregated seed card and its planting action', () => {
    const html = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({ seeds: { basic: 4 } })}
        activeTab="seeds"
        previewPlantId={null}
        pending={false}
        errorMessage={null}
      />,
    )

    expect(html.match(/기본 씨앗/g)).toHaveLength(2)
    expect(html).toContain('×4')
    expect(html).toContain('심기')
    expect(html).toContain('class="plant-storage__panel"')
    expect(html).not.toContain('plant-storage__panel--with-apply')
  })

  it('judges empty states independently for each tab', () => {
    const plantsEmpty = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({ ownedPlants: [], seeds: { basic: 3 } })}
        activeTab="plants"
        previewPlantId={null}
        pending={false}
        errorMessage={null}
      />,
    )
    const seedsEmpty = renderToStaticMarkup(
      <PlantStorageView
        {...callbacks}
        state={gameState({ ownedPlants: ['plant-01'], seeds: { basic: 0 } })}
        activeTab="seeds"
        previewPlantId={null}
        pending={false}
        errorMessage={null}
      />,
    )

    expect(plantsEmpty).toContain('아직 보관함이 비어 있어요')
    expect(plantsEmpty).not.toContain('가지고 있는 씨앗이 없어요')
    expect(plantsEmpty).not.toContain('plant-storage__panel--with-apply')
    expect(seedsEmpty).toContain('가지고 있는 씨앗이 없어요')
    expect(seedsEmpty).not.toContain('아직 보관함이 비어 있어요')
  })
})

describe('S04 storage and P03 navigation integration', () => {
  it('discards a preview-only change when navigating back home', async () => {
    const initialState = gameState({
      ownedPlants: ['plant-01', 'plant-02'],
      equipment: { status: 'equipped', plantId: 'plant-01' },
    })
    const { app, storage } = appStore(initialState)
    await app.initialize()
    expect(app.navigation.navigate('openPlantStorage')).toBe(true)

    const snapshot = app.getSnapshot()
    if (snapshot.status !== 'ready' || snapshot.gameState === null) {
      throw new Error('app was not ready')
    }
    const preview = createPlantStorageViewModel(snapshot.gameState, 'plant-02')

    expect(preview.previewPlantId).toBe('plant-02')
    expect(app.navigation.navigate('backHome')).toBe(true)
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'equipped', plantId: 'plant-01' } },
    })
    await expect(storage.load()).resolves.toMatchObject({
      ok: true,
      value: { equipment: { status: 'equipped', plantId: 'plant-01' } },
    })
  })

  it('persists an equipped plant and returns home only on apply', async () => {
    const { app, storage } = appStore(
      gameState({
        ownedPlants: ['plant-01', 'plant-02'],
        equipment: { status: 'equipped', plantId: 'plant-01' },
      }),
    )
    await app.initialize()
    app.navigation.navigate('openPlantStorage')

    await expect(app.actions.equipPlant('plant-02')).resolves.toEqual({
      ok: true,
      value: undefined,
    })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'equipped', plantId: 'plant-02' } },
    })
    await expect(storage.load()).resolves.toMatchObject({
      ok: true,
      value: { equipment: { status: 'equipped', plantId: 'plant-02' } },
    })
  })

  it('persists the none selection as unequipped and returns home', async () => {
    const { app, storage } = appStore(
      gameState({
        ownedPlants: ['plant-01'],
        equipment: { status: 'equipped', plantId: 'plant-01' },
      }),
    )
    await app.initialize()
    app.navigation.navigate('openPlantStorage')

    await expect(app.actions.unequipPlant()).resolves.toEqual({
      ok: true,
      value: undefined,
    })
    expect(app.getSnapshot()).toMatchObject({
      route: APP_ROUTES.home,
      gameState: { equipment: { status: 'unequipped' } },
    })
    await expect(storage.load()).resolves.toMatchObject({
      ok: true,
      value: { equipment: { status: 'unequipped' } },
    })
  })

  it('opens S03 directly from the seed tab contract', async () => {
    const { app } = appStore(gameState({ seeds: { basic: 3 } }))
    await app.initialize()
    app.navigation.navigate('openPlantStorage')

    expect(app.navigation.navigate('openPlanting')).toBe(true)
    expect(app.getSnapshot()).toMatchObject({ route: APP_ROUTES.planting })
  })
})
