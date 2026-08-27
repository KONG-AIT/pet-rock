/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function css(relativeUrl: string): string {
  return readFileSync(new URL(relativeUrl, import.meta.url), 'utf8')
}

const shellCss = css('../index.css')
const routerCss = css('./AppRouter.css')
const screenCss = {
  s01: css('../screens/s01-rock-selection/styles.css'),
  s02: css('../screens/s02-home/styles.css'),
  s03: css('../pages/S03SeedPlanting/S03SeedPlanting.css'),
  s04: css('../pages/S04PlantStorage/styles.css'),
}

describe('responsive layout contract', () => {
  it('lets the app shell exclusively own the dynamic viewport', () => {
    expect(shellCss).toContain('--app-viewport-height: 100svh')
    expect(shellCss).not.toMatch(/--app-viewport-height:\s*100dvh/)
    expect(shellCss).toMatch(/#root\s*{[^}]*height:\s*var\(--app-viewport-height\)/s)
    expect(routerCss).toMatch(/\.app-router\s*{[^}]*height:\s*100%/s)

    for (const styles of Object.values(screenCss)) {
      expect(styles).not.toMatch(/100[sd]vh/)
    }
  })

  it('prevents document scrolling and contains route transitions', () => {
    expect(shellCss).toMatch(/html,\s*body,\s*#root\s*{[^}]*overflow:\s*hidden/s)
    expect(routerCss).toMatch(/\.app-router\s*{[^}]*overflow:\s*hidden/s)
    expect(routerCss).toMatch(/\.app-route-view\s*{[^}]*overflow:\s*hidden/s)
  })

  it('keeps S01 and S02 within the shell while preserving keyboard access', () => {
    expect(screenCss.s01).toMatch(/\.s01-screen\s*{[^}]*height:\s*100%/s)
    expect(screenCss.s01).toMatch(/\.s01-screen\s*{[^}]*overflow-y:\s*auto/s)
    expect(screenCss.s01).toMatch(/\.s01-overlay-panel\s*{[^}]*overflow-y:\s*auto/s)
    expect(screenCss.s02).toMatch(/\.home\s*{[^}]*height:\s*100%/s)
    expect(screenCss.s02).toMatch(/\.home\s*{[^}]*overflow:\s*hidden/s)
  })

  it('scrolls only the defined content regions on S03 and S04', () => {
    expect(screenCss.s03).toMatch(/\.s03-seed-planting\s*{[^}]*overflow:\s*hidden/s)
    expect(screenCss.s03).toMatch(/\.s03-state\s*{[^}]*overflow-y:\s*auto/s)
    expect(screenCss.s04).toMatch(/\.plant-storage\s*{[^}]*overflow:\s*hidden/s)
    expect(screenCss.s04).toMatch(/\.plant-storage__panel\s*{[^}]*overflow-y:\s*auto/s)
    expect(screenCss.s04).toMatch(/\.plant-storage__apply\s*{[^}]*position:\s*absolute/s)
  })
})
