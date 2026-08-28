import { describe, expect, it, vi } from 'vitest'

import { createTransientHistoryEntry } from './history-entry'

function historyPort(state: unknown = null) {
  return {
    state,
    pushState: vi.fn(),
    back: vi.fn(),
  }
}

function stackedHistoryPort() {
  const stack: unknown[] = [null]

  return {
    get state() {
      return stack[stack.length - 1]
    },
    pushState: vi.fn((data: unknown) => {
      stack.push(data)
    }),
    back: vi.fn(() => {
      if (stack.length > 1) {
        stack.pop()
      }
    }),
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

  it('ignores a pop consumed by a nested entry pushed on top of it', () => {
    const history = stackedHistoryPort()
    const outer = createTransientHistoryEntry(history, 'outer')
    const inner = createTransientHistoryEntry(history, 'inner')

    outer.open()
    inner.open()

    // Popping the top (inner) entry must not be claimed by the outer one.
    history.back()
    expect(outer.consumePop()).toBe(false)
    expect(inner.consumePop()).toBe(true)

    // The outer entry is still active and correctly claims its own pop.
    history.back()
    expect(outer.consumePop()).toBe(true)
  })
})
