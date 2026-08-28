import { useEffect, useState } from 'react'

import {
  useAppNavigation,
  useAppSnapshot,
  useGameActions,
  useGameQueries,
} from '../../app/index'
import type { AppActionResult } from '../../app/index'
import { CompletedPlantVisual } from '../../components/visuals'
import {
  formatRemainingTime,
  getGrowthPollDelayMs,
  getSeedPlantingViewState,
  type SeedPlantingViewState,
} from './view-state'
import './S03SeedPlanting.css'

type PendingAction = 'plant' | 'equip' | 'store' | null

function viewStateMotionKey(viewState: SeedPlantingViewState): string {
  switch (viewState.status) {
    case 'unavailable':
    case 'empty':
      return viewState.status
    case 'growing':
      return `${viewState.status}-${viewState.stage}`
    case 'completed':
      return `${viewState.status}-${viewState.plantId}`
  }
}

function SeedIcon() {
  return (
    <svg className="s03-seed" viewBox="0 0 56 56" aria-hidden="true">
      <path d="M43 10C24 11 12 22 13 38c14 7 29-2 30-28Z" />
      <path d="M15 41c7-12 14-18 25-26" />
    </svg>
  )
}

function SeedCount({ count }: { count: number }) {
  return (
    <div className="s03-seed-count" aria-label={`보유 기본 씨앗 ${count}개`}>
      <SeedIcon />
      <span>기본 씨앗</span>
      <strong>×{count}</strong>
    </div>
  )
}

function PotIllustration({ stage }: { stage: 'empty' | 'planted' | 'growing' }) {
  return (
    <svg className={`s03-pot s03-pot--${stage}`} viewBox="0 0 280 300" aria-hidden="true">
      <ellipse className="s03-pot__shadow" cx="140" cy="274" rx="91" ry="16" />
      {stage === 'planted' ? (
        <path className="s03-sprout s03-sprout--planted" d="M140 105v35" />
      ) : null}
      {stage === 'growing' ? (
        <g className="s03-sprout s03-sprout--growing">
          <path d="M140 49v91" />
          <path d="M140 88c-29 1-45-12-47-35 27-3 45 8 47 35Z" />
          <path d="M140 73c24 1 40-10 43-31-24-3-40 8-43 31Z" />
        </g>
      ) : null}
      <ellipse className="s03-pot__rim" cx="140" cy="145" rx="102" ry="38" />
      <ellipse className="s03-pot__soil" cx="140" cy="141" rx="86" ry="25" />
      <path className="s03-pot__body" d="M51 153h178l-24 108c-2 10-11 17-21 17H96c-10 0-19-7-21-17L51 153Z" />
      <path className="s03-pot__lip" d="M43 143h194v35c0 8-7 15-15 15H58c-8 0-15-7-15-15v-35Z" />
      <path className="s03-pot__shine" d="M81 195 94 253" />
    </svg>
  )
}

type SeedPlantingContentProps = Readonly<{
  viewState: SeedPlantingViewState
  pendingAction: PendingAction
  onPlant(): void
  onEquip(): void
  onStore(): void
}>

export function SeedPlantingContent({
  viewState,
  pendingAction,
  onPlant,
  onEquip,
  onStore,
}: SeedPlantingContentProps) {
  if (viewState.status === 'unavailable') {
    return (
      <section className="s03-state s03-state--message">
        <p className="s03-state__title">화분 상태를 확인하지 못했어요.</p>
        <p className="s03-state__description">잠시 후 다시 들어와 주세요.</p>
      </section>
    )
  }

  if (viewState.status === 'empty') {
    return (
      <section className="s03-state s03-state--empty">
        <SeedCount count={viewState.seedCount} />
        <div className="s03-copy">
          <p className="s03-state__title">씨앗을 화분에 심어볼까요?</p>
          <p className="s03-state__description">어떤 식물이 될지는 다 자란 뒤 알 수 있어요.</p>
        </div>
        <div className="s03-visual s03-visual--empty">
          <SeedIcon />
          <span className="s03-planting-guide" aria-hidden="true" />
          <PotIllustration stage="empty" />
        </div>
        <div className="s03-actions">
          <button
            className="s03-button s03-button--primary"
            type="button"
            disabled={!viewState.canPlant || pendingAction !== null}
            onClick={onPlant}
          >
            {pendingAction === 'plant' ? '심는 중…' : '씨앗 심기'}
          </button>
          {!viewState.canPlant ? <p className="s03-empty-note">보유한 씨앗이 없어요.</p> : null}
        </div>
      </section>
    )
  }

  if (viewState.status === 'growing') {
    const isPlanted = viewState.stage === 'planted'

    return (
      <section className="s03-state s03-state--growing">
        <SeedCount count={viewState.seedCount} />
        <div className="s03-copy">
          <p className="s03-state__title">
            {isPlanted ? '씨앗이 자리를 잡고 있어요.' : '조금씩 자라고 있어요.'}
          </p>
          <p className="s03-state__description">어떤 식물이 될까요?</p>
        </div>
        <div className="s03-visual">
          <PotIllustration stage={viewState.stage} />
        </div>
        <div className="s03-growth-details">
          <div className="s03-remaining-time" aria-label={`남은 시간 ${formatRemainingTime(viewState.remainingMs)}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5v5l3.2 1.8" />
            </svg>
            <span>남은 시간</span>
            <strong>{formatRemainingTime(viewState.remainingMs)}</strong>
          </div>
          <p className="s03-growing-note">
            {isPlanted
              ? '흙 속에서 작은 변화가 시작됐어요.'
              : '완성까지 조금만 더 기다려주세요.'}
          </p>
        </div>
      </section>
    )
  }

  const isCompletionActionPending = pendingAction === 'equip' || pendingAction === 'store'

  return (
    <section className="s03-state s03-state--completed">
      <div className="s03-copy">
        <p className="s03-state__title">다 자랐어요!</p>
        <p className="s03-state__description">새 식물을 만났어요.</p>
      </div>
      <div className="s03-visual s03-visual--completed">
        {viewState.isNew ? <span className="s03-new-badge">NEW</span> : null}
        <CompletedPlantVisual plantId={viewState.plantId} />
      </div>
      <p className="s03-plant-name">{viewState.displayName}</p>
      <div className="s03-actions s03-actions--completed">
        <button
          className="s03-button s03-button--primary"
          type="button"
          disabled={isCompletionActionPending}
          onClick={onEquip}
        >
          {pendingAction === 'equip' ? '심는 중…' : '머리에 심기'}
        </button>
        <button
          className="s03-button s03-button--secondary"
          type="button"
          disabled={isCompletionActionPending}
          onClick={onStore}
        >
          {pendingAction === 'store' ? '보관하는 중…' : '보관하기'}
        </button>
      </div>
    </section>
  )
}

export function S03SeedPlantingPage() {
  const actions = useGameActions()
  const navigation = useAppNavigation()
  const snapshot = useAppSnapshot()
  const queries = useGameQueries()
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const observedAt = snapshot.status === 'ready' ? snapshot.observedAt : 0
  const viewState = getSeedPlantingViewState(queries.gameState, queries.growth, observedAt)

  useEffect(() => {
    let isActive = true

    void actions.refreshGrowth().then((result) => {
      if (isActive && !result.ok) {
        setErrorMessage('성장 상태를 새로 확인하지 못했어요.')
      }
    })

    return () => {
      isActive = false
    }
  }, [actions])

  const growthPollDelayMs = getGrowthPollDelayMs(queries.growth, observedAt)

  useEffect(() => {
    if (growthPollDelayMs === null) {
      return
    }

    const refreshTimer = window.setTimeout(() => {
      void actions.refreshGrowth()
    }, growthPollDelayMs)

    return () => window.clearTimeout(refreshTimer)
  }, [actions, growthPollDelayMs])

  async function runAction(
    pending: Exclude<PendingAction, null>,
    action: () => Promise<AppActionResult>,
  ) {
    setPendingAction(pending)
    setErrorMessage(null)

    const result = await action()

    if (result.ok) {
      if (pending === 'plant') {
        setPendingAction(null)
      }
      return
    }

    setErrorMessage('저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    setPendingAction(null)
  }

  return (
    <main className="s03-seed-planting" data-screen="s03-seed-planting">
      <header className="s03-header">
        <button
          className="s03-back-button"
          type="button"
          aria-label="홈으로 돌아가기"
          onClick={() => navigation.navigate('backHome')}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <h1>내 정원</h1>
      </header>
      <SeedPlantingContent
        key={viewStateMotionKey(viewState)}
        viewState={viewState}
        pendingAction={pendingAction}
        onPlant={() => void runAction('plant', actions.plantSeed)}
        onEquip={() => void runAction('equip', actions.finishGrowthWithEquipment)}
        onStore={() => void runAction('store', actions.finishGrowthToStorage)}
      />
      <p className="s03-error" role="status" aria-live="polite">
        {errorMessage}
      </p>
    </main>
  )
}
