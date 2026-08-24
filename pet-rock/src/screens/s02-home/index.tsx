import { useEffect, useRef, useState } from 'react'

import {
  useAppNavigation,
  useGameQueries,
  useTransientHistoryEntry,
} from '../../app/index'
import {
  createDefaultRockShareService,
  shareRock,
  type RockShareService,
} from '../../share'
import { HomeView } from './HomeView'
import {
  createHomeRenderModel,
  nextMenuOpenState,
  requestHomeMenuAction,
  type HomeMenuAction,
} from './home-model'
import './styles.css'

export type HomeScreenProps = Readonly<{
  shareService?: RockShareService
}>

export function HomeScreen({
  shareService = createDefaultRockShareService(),
}: HomeScreenProps) {
  const { gameState, growth } = useGameQueries()
  const navigation = useAppNavigation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [reacting, setReacting] = useState(false)
  const [reactionKey, setReactionKey] = useState(0)
  const reactionTimer = useRef<number | null>(null)
  const menuHistoryEntry = useTransientHistoryEntry(
    'petRockS02ActionMenu',
    () => setMenuOpen(nextMenuOpenState(true, 'system-back')),
  )

  useEffect(
    () => () => {
      if (reactionTimer.current !== null) {
        window.clearTimeout(reactionTimer.current)
      }
    },
    [],
  )

  if (gameState === null) {
    return <main role="alert">돌 정보를 불러오지 못했어요.</main>
  }

  const currentGameState = gameState
  const model = createHomeRenderModel(currentGameState, growth)

  function unwindMenuHistory() {
    menuHistoryEntry.close()
  }

  function toggleMenu() {
    const nextOpen = nextMenuOpenState(menuOpen, 'action-button')

    if (nextOpen) {
      menuHistoryEntry.open()
    } else {
      unwindMenuHistory()
    }

    setMenuOpen(nextOpen)
  }

  function dismissMenu() {
    unwindMenuHistory()
    setMenuOpen(nextMenuOpenState(menuOpen, 'outside'))
  }

  function selectMenuAction(action: HomeMenuAction) {
    unwindMenuHistory()
    setMenuOpen(nextMenuOpenState(menuOpen, 'selection'))
    requestHomeMenuAction(action, navigation, () => {
      void shareRock(currentGameState, shareService)
    })
  }

  function touchRock() {
    if (reactionTimer.current !== null) {
      window.clearTimeout(reactionTimer.current)
    }

    setReactionKey((current) => current + 1)
    setReacting(true)
    reactionTimer.current = window.setTimeout(() => {
      setReacting(false)
      reactionTimer.current = null
    }, 750)
  }

  return (
    <HomeView
      model={model}
      menuOpen={menuOpen}
      reacting={reacting}
      reactionKey={reactionKey}
      onRockTouch={touchRock}
      onToggleMenu={toggleMenu}
      onDismissMenu={dismissMenu}
      onMenuAction={selectMenuAction}
    />
  )
}
