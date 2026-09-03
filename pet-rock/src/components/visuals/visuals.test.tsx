import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PLANT_IDS, ROCK_IDS } from '../../domain'
import {
  CompletedPlantVisual,
  PLANT_STAGE_THREE_SPECS,
  ROCK_VISUAL_SPECS,
  HomeRockVisual,
  SelectionRockVisual,
  StoragePlantVisual,
  StorageRockVisual,
} from './index'

describe('shared rock visuals', () => {
  it.each(ROCK_IDS)('renders the %s selection identity and accessible label', (rockId) => {
    const markup = renderToStaticMarkup(
      <SelectionRockVisual label="돌 후보" rockId={rockId} />,
    )

    expect(markup).toContain(`s01-rock-illustration--${rockId}`)
    expect(markup).toContain('aria-label="돌 후보"')
    expect(markup).toContain('role="img"')
  })

  it.each(ROCK_IDS)('renders the %s storage identity', (rockId) => {
    const markup = renderToStaticMarkup(<StorageRockVisual rockId={rockId} />)

    expect(markup).toContain(`data-rock="${rockId}"`)
    expect(markup).toContain('aria-hidden="true"')
  })

  it.each(ROCK_IDS)('reuses the %s canonical source in every context', (rockId) => {
    const source = ROCK_VISUAL_SPECS[rockId].src
    const selection = renderToStaticMarkup(<SelectionRockVisual label="돌 후보" rockId={rockId} />)
    const home = renderToStaticMarkup(<HomeRockVisual rockId={rockId} equippedPlantId={null} reacting={false} reactionKey={0} />)
    const storage = renderToStaticMarkup(<StorageRockVisual rockId={rockId} />)

    expect(selection).toContain(`src="${source}"`)
    expect(selection).not.toContain('rock-visual__fallback')
    expect(home).toContain(`src="${source}"`)
    expect(storage).toContain(`src="${source}"`)
  })

  it('orders home layers and changes face and FX for a reaction', () => {
    const quiet = renderToStaticMarkup(<HomeRockVisual rockId="rock-01" equippedPlantId="plant-01" reacting={false} reactionKey={0} />)
    const reacting = renderToStaticMarkup(<HomeRockVisual rockId="rock-01" equippedPlantId="plant-01" reacting reactionKey={1} />)

    expect(quiet.indexOf('data-layer="ground"')).toBeLessThan(quiet.indexOf('data-layer="rock"'))
    expect(quiet.indexOf('data-layer="rock"')).toBeLessThan(quiet.indexOf('data-layer="face-neutral"'))
    expect(quiet.indexOf('data-layer="face-neutral"')).toBeLessThan(quiet.indexOf('data-layer="equipped-plant"'))
    expect(reacting).toContain('data-layer="face-happy"')
    expect(reacting.indexOf('data-layer="equipped-plant"')).toBeLessThan(reacting.indexOf('data-layer="touch-fx"'))
  })
})

describe('shared plant visuals', () => {
  it.each(PLANT_IDS)('renders the equipped %s with its home identity', (plantId) => {
    const markup = renderToStaticMarkup(
      <HomeRockVisual
        equippedPlantId={plantId}
        reacting={false}
        reactionKey={0}
        rockId="rock-01"
      />,
    )

    expect(markup).toContain(`data-plant-id="${plantId}"`)
  })

  it.each(PLANT_IDS)('renders the completed %s reveal identity', (plantId) => {
    const markup = renderToStaticMarkup(<CompletedPlantVisual plantId={plantId} />)

    expect(markup).toContain(`s03-completed-plant--${plantId}`)
    expect(markup).toContain('aria-hidden="true"')
  })

  it.each(PLANT_IDS)('renders the %s storage identity', (plantId) => {
    const markup = renderToStaticMarkup(<StoragePlantVisual plantId={plantId} />)

    expect(markup).toContain(`data-plant="${plantId}"`)
    expect(markup).toContain('aria-hidden="true"')
  })

  it.each(PLANT_IDS)('reuses the %s stage-03 source in every context', (plantId) => {
    const source = PLANT_STAGE_THREE_SPECS[plantId].src
    const home = renderToStaticMarkup(<HomeRockVisual rockId="rock-01" equippedPlantId={plantId} reacting={false} reactionKey={0} />)
    const completed = renderToStaticMarkup(<CompletedPlantVisual plantId={plantId} />)
    const storage = renderToStaticMarkup(<StoragePlantVisual plantId={plantId} />)

    expect(home).toContain(`src="${source}"`)
    expect(completed).toContain(`src="${source}"`)
    expect(storage).toContain(`src="${source}"`)
  })

  it('maps every current domain id to a distinct canonical PNG', () => {
    const rockSources = ROCK_IDS.map((rockId) => ROCK_VISUAL_SPECS[rockId].src)
    const plantSources = PLANT_IDS.map((plantId) => PLANT_STAGE_THREE_SPECS[plantId].src)

    expect(rockSources.every((src) => src.endsWith('.png'))).toBe(true)
    expect(plantSources.every((src) => src.endsWith('.png'))).toBe(true)
    expect(new Set(rockSources).size).toBe(ROCK_IDS.length)
    expect(new Set(plantSources).size).toBe(PLANT_IDS.length)
  })
})
