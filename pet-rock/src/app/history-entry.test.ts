import { describe, expect, it, vi } from 'vitest'

import { createTransientHistoryEntry } from './history-entry'

function historyPort(state: unknown = null) {
  return {
    state,
    pushState: vi.fn(),
    back: vi.fn(),
  }
}

describe('transient history entry', () => {
  it('opens only one entry and preserves the current history state', () => {
    const history = historyPort({ existing: true })
    const entry = createTransientHistoryEntry(history, 'overlay')

    entry.open()
    entry.open()

    expect(history.pushState).toHaveBeenCalledOnce()
    expect(history.pushState).toHaveBeenCalledWith(
      { existing: true, overlay: true },
      '',
    )
  })

  it('returns through history once when explicitly closed', () => {
    const history = historyPort()
    const entry = createTransientHistoryEntry(history, 'menu')
    entry.open()

    expect(entry.close()).toBe(true)
    expect(entry.close()).toBe(false)
    expect(history.back).toHaveBeenCalledOnce()
  })

  it('consumes system Back without adding another history traversal', () => {
    const history = historyPort()
    const entry = createTransientHistoryEntry(history, 'menu')
    entry.open()

    expect(entry.consumePop()).toBe(true)
    expect(entry.consumePop()).toBe(false)
    expect(entry.close()).toBe(false)
    expect(history.back).not.toHaveBeenCalled()
  })
})
