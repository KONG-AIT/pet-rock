import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PLANT_IDS, ROCK_IDS } from '../../domain'
import {
  CompletedPlantVisual,
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
})
