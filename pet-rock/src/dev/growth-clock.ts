import { GROWING_STAGE_START_MS, GROWTH_COMPLETE_MS } from '../domain'

const STORAGE_KEY = 'pet-rock:development-clock-offset-ms'
const MAX_OFFSET_MS = 30 * 24 * 60 * 60 * 1_000

export const DEVELOPMENT_GROWTH_TARGETS = [
  { id: 'planted', label: '+0시간 · 심은 직후', elapsedMs: 0 },
  { id: 'growing-before', label: '+3시간 직전', elapsedMs: GROWING_STAGE_START_MS - 1 },
  { id: 'growing-after', label: '+3시간 직후', elapsedMs: GROWING_STAGE_START_MS + 1 },
  { id: 'grown-before', label: '+6시간 직전', elapsedMs: GROWTH_COMPLETE_MS - 1 },
  { id: 'grown-after', label: '+6시간 직후', elapsedMs: GROWTH_COMPLETE_MS + 1 },
] as const

type OffsetStorage = Pick<Storage, 'getItem' | 'setItem'>

export type DevelopmentGrowthTarget = (typeof DEVELOPMENT_GROWTH_TARGETS)[number]

export interface DevelopmentClock {
  now(): number
  getOffset(): number
  moveTo(plantedAt: number, elapsedMs: number): boolean
}

function isSafeOffset(offset: number): boolean {
  return Number.isFinite(offset) && Math.abs(offset) <= MAX_OFFSET_MS
}

function readOffset(storage: OffsetStorage | null): number {
  if (storage === null) {
    return 0
  }

  try {
    const offset = Number(storage.getItem(STORAGE_KEY))
    return isSafeOffset(offset) ? offset : 0
  } catch {
    return 0
  }
}

function browserStorage(): OffsetStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function createDevelopmentClock(
  storage: OffsetStorage | null = browserStorage(),
  systemNow: () => number = Date.now,
): DevelopmentClock {
  let offsetMs = readOffset(storage)

  function persistOffset(): void {
    try {
      storage?.setItem(STORAGE_KEY, String(offsetMs))
    } catch {
      // The in-memory offset still works when storage is unavailable.
    }
  }

  return {
    now: () => systemNow() + offsetMs,
    getOffset: () => offsetMs,
    moveTo(plantedAt, elapsedMs) {
      const target = plantedAt + elapsedMs
      const nextOffset = target - systemNow()

      if (
        !Number.isFinite(plantedAt) ||
        !Number.isFinite(elapsedMs) ||
        elapsedMs < 0 ||
        !Number.isFinite(target) ||
        !isSafeOffset(nextOffset)
      ) {
        return false
      }

      offsetMs = nextOffset
      persistOffset()
      return true
    },
  }
}
