import { useEffect, useRef, useState } from 'react'

import {
  useAppNavigation,
  useGameQueries,
  useTransientHistoryEntry,
} from '../../app/index'
import {
  createDefaultRockShareService,
  type RockShareService,
} from '../../share'
import { HomeView } from './HomeView'
import {
  createHomeShareNotice,
  createHomeRenderModel,
  nextMenuOpenState,
  requestHomeMenuAction,
  type HomeMenuAction,
} from './home-model'
import { requestRockShareOnce, shareThenUnwindMenu } from './home-share'
import '../../components/visuals/visuals.css'
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
  const [sharePending, setSharePending] = useState(false)
  const [shareNotice, setShareNotice] = useState<ReturnType<typeof createHomeShareNotice>>(null)
  const reactionTimer = useRef<number | null>(null)
  const shareNoticeTimer = useRef<number | null>(null)
  const shareInFlight = useRef(false)
  const menuHistoryEntry = useTransientHistoryEntry(
    'petRockS02ActionMenu',
    () => setMenuOpen(nextMenuOpenState(true, 'system-back')),
  )

  useEffect(
    () => () => {
      if (reactionTimer.current !== null) {
        window.clearTimeout(reactionTimer.current)
      }
      if (shareNoticeTimer.current !== null) {
        window.clearTimeout(shareNoticeTimer.current)
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
    setMenuOpen(nextMenuOpenState(menuOpen, 'selection'))

    if (action === 'share') {
      // Start the share call before traversing history so browser user activation is preserved,
      // and keep the history entry open until the share flow settles (see shareThenUnwindMenu).
      requestHomeMenuAction(action, navigation, () => {
        shareThenUnwindMenu(performShare, unwindMenuHistory)
      })
      return
    }

    unwindMenuHistory()
    requestHomeMenuAction(action, navigation, () => {
      void performShare()
    })
  }

  async function performShare() {
    if (shareInFlight.current) {
      return
    }

    if (shareNoticeTimer.current !== null) {
      window.clearTimeout(shareNoticeTimer.current)
      shareNoticeTimer.current = null
    }

    setShareNotice(null)
    setSharePending(true)
    const result = await requestRockShareOnce(
      currentGameState,
      shareService,
      shareInFlight,
    )
    setSharePending(false)

    if (result === null) {
      return
    }

    const notice = createHomeShareNotice(result)
    setShareNotice(notice)

    if (notice !== null) {
      shareNoticeTimer.current = window.setTimeout(() => {
        setShareNotice(null)
        shareNoticeTimer.current = null
      }, notice.tone === 'error' ? 4_000 : 2_500)
    }
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
      shareNotice={shareNotice}
      sharePending={sharePending}
      onRockTouch={touchRock}
      onToggleMenu={toggleMenu}
      onDismissMenu={dismissMenu}
      onMenuAction={selectMenuAction}
    />
  )
}
