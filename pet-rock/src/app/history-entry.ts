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
      if (!active) {
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
