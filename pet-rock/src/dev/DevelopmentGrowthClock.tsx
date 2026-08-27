import { useState } from 'react'

import { useDevGameActions, useGameActions, useGameQueries } from '../app/index'
import {
  DEVELOPMENT_GROWTH_TARGETS,
  type DevelopmentClock,
  type DevelopmentGrowthTarget,
} from './growth-clock'
import { DEVELOPMENT_SEED_REFILL_AMOUNT } from './seed-refill'

const DEVELOPMENT_CLOCK_STYLES = `
.development-clock { position: fixed; z-index: 1000; top: max(8px, env(safe-area-inset-top)); right: 8px; color: #342d20; font: 12px/1.4 system-ui, sans-serif; }
.development-clock button { border: 1px solid #8b6d31; border-radius: 8px; background: #fff8d7; color: inherit; font: inherit; cursor: pointer; }
.development-clock button:disabled { cursor: not-allowed; opacity: .45; }
.development-clock__toggle { padding: 6px 9px; box-shadow: 0 2px 8px rgb(52 45 32 / 18%); font-weight: 700 !important; }
.development-clock__panel { width: min(280px, calc(100vw - 16px)); margin-top: 6px; padding: 12px; border: 1px solid #c9ad68; border-radius: 10px; background: #fffdf3; box-shadow: 0 6px 18px rgb(52 45 32 / 20%); }
.development-clock__panel p { margin: 4px 0 10px; }
.development-clock__targets { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.development-clock__targets button { padding: 7px; }
.development-clock__panel small { display: block; margin-top: 8px; }
.development-clock__seeds { margin-top: 12px; padding-top: 10px; border-top: 1px solid #e4d6a3; }
.development-clock__seeds button { width: 100%; padding: 7px; margin-top: 6px; }
.development-clock__seeds-error { color: #a12b2b; }
`

type DevelopmentGrowthClockProps = Readonly<{
  clock: DevelopmentClock
}>

function formatElapsed(elapsedMs: number): string {
  const totalMinutes = Math.round(Math.max(0, elapsedMs) / (60 * 1_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `+${hours}시간 ${minutes}분`
}

export function DevelopmentGrowthClock({ clock }: DevelopmentGrowthClockProps) {
  const { gameState } = useGameQueries()
  const actions = useGameActions()
  const devActions = useDevGameActions()
  const [open, setOpen] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)
  const [seedRefillPending, setSeedRefillPending] = useState(false)
  const [seedRefillError, setSeedRefillError] = useState<string | null>(null)
  const growingPlant = gameState?.plantGrowth ?? null
  const growthElapsed =
    growingPlant === null ? null : clock.now() - growingPlant.plantedAt

  async function moveTo(target: DevelopmentGrowthTarget) {
    if (growingPlant === null) {
      return
    }

    setPendingTarget(target.id)
    if (clock.moveTo(growingPlant.plantedAt, target.elapsedMs)) {
      await actions.refreshGrowth()
    }
    setPendingTarget(null)
  }

  async function refillSeeds() {
    if (devActions === null || seedRefillPending) {
      return
    }

    setSeedRefillPending(true)
    const result = await devActions.refillSeeds()

    if (!result.ok) {
      console.error('[DEV] 씨앗 보충 저장 실패', result.error)
      setSeedRefillError('씨앗 보충 저장에 실패했습니다. 기존 수량을 유지합니다.')
    } else {
      setSeedRefillError(null)
    }

    setSeedRefillPending(false)
  }

  return (
    <>
      <style>{DEVELOPMENT_CLOCK_STYLES}</style>
      <aside className="development-clock" aria-label="개발 시간 제어">
        <button
          className="development-clock__toggle"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {growthElapsed === null
            ? 'DEV 시간 제어'
            : `DEV 성장 ${formatElapsed(growthElapsed)}`}
        </button>
        {open ? (
          <div className="development-clock__panel">
            <strong>식물 성장 시각</strong>
            <p>현재 식물을 심은 시점을 기준으로 이동합니다.</p>
            <div className="development-clock__targets">
              {DEVELOPMENT_GROWTH_TARGETS.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  disabled={growingPlant === null || pendingTarget !== null}
                  onClick={() => void moveTo(target)}
                >
                  {pendingTarget === target.id ? '이동 중…' : target.label}
                </button>
              ))}
            </div>
            {growingPlant === null ? <small>먼저 씨앗을 심어주세요.</small> : null}
            {devActions === null ? null : (
              <div className="development-clock__seeds">
                <strong>기본 씨앗 보충</strong>
                <p>
                  현재 보유: {gameState === null ? '-' : `${gameState.seeds.basic}개`}
                </p>
                <button
                  type="button"
                  disabled={gameState === null || seedRefillPending}
                  onClick={() => void refillSeeds()}
                >
                  {seedRefillPending
                    ? '보충 중…'
                    : `기본 씨앗 +${DEVELOPMENT_SEED_REFILL_AMOUNT}개`}
                </button>
                {seedRefillError === null ? null : (
                  <small className="development-clock__seeds-error">{seedRefillError}</small>
                )}
              </div>
            )}
          </div>
        ) : null}
      </aside>
    </>
  )
}
