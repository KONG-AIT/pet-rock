import { useEffect, useRef, useState } from 'react'

type HistoryPort = Readonly<{
  state: unknown
  pushState(data: unknown, unused: string, url?: string | URL | null): void
  back(): void
}>

export type TransientHistoryEntry = Readonly<{
  open(): void
  close(): boolean
  consumePop(): boolean
}>

function ownsCurrentState(history: HistoryPort, stateKey: string): boolean {
  const state = history.state
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as Record<string, unknown>)[stateKey] === true
  )
}

export function createTransientHistoryEntry(
  history: HistoryPort,
  stateKey: string,
): TransientHistoryEntry {
  let active = false

  return {
    open() {
      if (active) {
        return
      }

      const currentState =
        typeof history.state === 'object' && history.state !== null
          ? history.state
          : {}
      history.pushState({ ...currentState, [stateKey]: true }, '')
      active = true
    },

    close() {
      if (!active) {
        return false
      }

      active = false
      history.back()
      return true
    },

    consumePop() {
      // A pop that still carries this entry's key belongs to another
      // (nested) transient entry pushed on top of this one, not this one.
      if (!active || ownsCurrentState(history, stateKey)) {
        return false
      }

      active = false
      return true
    },
  }
}

export function useTransientHistoryEntry(
  stateKey: string,
  onPop: () => void,
): TransientHistoryEntry {
  const onPopRef = useRef(onPop)
  const [entry] = useState(() => createTransientHistoryEntry(window.history, stateKey))

  useEffect(() => {
    onPopRef.current = onPop
  }, [onPop])

  useEffect(() => {
    function handlePopState() {
      if (entry.consumePop()) {
        onPopRef.current()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      entry.close()
    }
  }, [entry])

  return entry
}
