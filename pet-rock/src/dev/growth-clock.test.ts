import { describe, expect, it } from 'vitest'

import { DEVELOPMENT_GROWTH_TARGETS, createDevelopmentClock } from './growth-clock'

class MemoryStorage {
  readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

describe('development growth clock', () => {
  it.each(DEVELOPMENT_GROWTH_TARGETS)(
    'moves to $label relative to plantedAt',
    ({ elapsedMs }) => {
      const clock = createDevelopmentClock(new MemoryStorage(), () => 50_000)

      expect(clock.moveTo(10_000, elapsedMs)).toBe(true)
      expect(clock.now()).toBe(10_000 + elapsedMs)
    },
  )

  it('restores its offset without changing game storage', () => {
    const storage = new MemoryStorage()
    const firstClock = createDevelopmentClock(storage, () => 50_000)
    firstClock.moveTo(10_000, 1_000)

    const restoredClock = createDevelopmentClock(storage, () => 60_000)
    expect(restoredClock.getOffset()).toBe(-39_000)
    expect(restoredClock.now()).toBe(21_000)
  })

  it('moves a second planted growth through the same boundaries', () => {
    const systemNow = 50_000
    const clock = createDevelopmentClock(new MemoryStorage(), () => systemNow)
    const completedElapsed = DEVELOPMENT_GROWTH_TARGETS.at(-1)?.elapsedMs

    expect(completedElapsed).toBeDefined()
    if (completedElapsed === undefined) {
      return
    }

    const firstPlantedAt = clock.now()
    expect(clock.moveTo(firstPlantedAt, completedElapsed)).toBe(true)
    const secondPlantedAt = clock.now()
    expect(clock.moveTo(secondPlantedAt, completedElapsed)).toBe(true)
    expect(clock.now()).toBe(secondPlantedAt + completedElapsed)
  })

  it('ignores corrupt offsets and rejects invalid past targets', () => {
    const storage = new MemoryStorage()
    storage.setItem('pet-rock:development-clock-offset-ms', 'not-a-number')
    const clock = createDevelopmentClock(storage, () => 50_000)

    expect(clock.now()).toBe(50_000)
    expect(clock.moveTo(10_000, -1)).toBe(false)
    expect(clock.now()).toBe(50_000)
  })

  it('rejects an unsafe offset without replacing the current clock', () => {
    const clock = createDevelopmentClock(new MemoryStorage(), () => 50_000)

    expect(clock.moveTo(10_000, 31 * 24 * 60 * 60 * 1_000)).toBe(false)
    expect(clock.now()).toBe(50_000)
  })
})
