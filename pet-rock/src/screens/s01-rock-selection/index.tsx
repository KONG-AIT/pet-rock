import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useGameActions } from '../../app/index'
import type { RockId } from '../../domain'
import {
  ROCK_OPTIONS,
  cancelSelection,
  createSelectionDraft,
  getConfirmedSelection,
  getNameValidationMessage,
  updateSelectionName,
  type RockSelectionDraft,
} from './model'
import './styles.css'

const HISTORY_STATE_KEY = 'petRockS01Overlay'

function RockIllustration({ rockId, large = false }: { rockId: RockId; large?: boolean }) {
  const label = ROCK_OPTIONS.find(({ id }) => id === rockId)?.label ?? '돌'

  return (
    <svg
      aria-label={label}
      className={`s01-rock-illustration s01-rock-illustration--${rockId}${large ? ' s01-rock-illustration--large' : ''}`}
      role="img"
      viewBox="0 0 180 150"
    >
      <ellipse className="s01-rock-shadow" cx="90" cy="137" rx="62" ry="9" />
      {rockId === 'rock-01' && (
        <path className="s01-rock-body" d="M35 126C24 111 30 73 49 46 62 27 82 19 101 23c27 5 45 30 49 61 4 31-8 48-29 53-34 8-73 3-86-11Z" />
      )}
      {rockId === 'rock-02' && (
        <path className="s01-rock-body" d="M29 120c-5-22 7-56 29-76 16-14 41-20 60-9 21 12 34 44 31 71-3 25-21 32-53 32-34 0-61 2-67-18Z" />
      )}
      {rockId === 'rock-03' && (
        <path className="s01-rock-body" d="M31 113c0-22 8-63 33-78 24-15 61-7 76 18 12 20 15 51 4 70-11 18-35 17-61 16-27-1-52-4-52-26Z" />
      )}
      <circle className="s01-rock-speck s01-rock-speck--one" cx="62" cy="67" r="5" />
      <circle className="s01-rock-speck s01-rock-speck--two" cx="125" cy="104" r="3" />
      <circle className="s01-rock-eye" cx="72" cy="92" r="5" />
      <circle className="s01-rock-eye" cx="108" cy="92" r="5" />
      <path className="s01-rock-mouth" d="M80 108c7 8 14 8 21 0" />
    </svg>
  )
}

function saveErrorMessage(): string {
  return '돌을 데려오지 못했어요. 잠시 후 다시 시도해주세요.'
}

export function RockSelectionScreen() {
  const { adoptRock } = useGameActions()
  const [draft, setDraft] = useState<RockSelectionDraft | null>(null)
  const [wasNameTouched, setWasNameTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const overlayHistoryActive = useRef(false)

  function resetOverlay() {
    setDraft(cancelSelection())
    setWasNameTouched(false)
    setIsSubmitting(false)
    setSaveError(null)
  }

  function closeOverlay() {
    if (isSubmitting) {
      return
    }

    if (overlayHistoryActive.current) {
      window.history.back()
      return
    }

    resetOverlay()
  }

  useEffect(() => {
    function handleBack() {
      if (!overlayHistoryActive.current) {
        return
      }

      overlayHistoryActive.current = false
      resetOverlay()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && overlayHistoryActive.current) {
        closeOverlay()
      }
    }

    window.addEventListener('popstate', handleBack)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('popstate', handleBack)
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  function selectRock(rockId: RockId) {
    if (!overlayHistoryActive.current) {
      window.history.pushState(
        { ...window.history.state, [HISTORY_STATE_KEY]: true },
        '',
      )
      overlayHistoryActive.current = true
    }

    setDraft(createSelectionDraft(rockId))
    setWasNameTouched(false)
    setSaveError(null)
  }

  async function confirmSelection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (draft === null) {
      return
    }

    setWasNameTouched(true)
    setSaveError(null)
    const confirmed = getConfirmedSelection(draft)

    if (confirmed === null) {
      return
    }

    setIsSubmitting(true)
    const result = await adoptRock(confirmed)

    if (!result.ok) {
      setIsSubmitting(false)
      setSaveError(saveErrorMessage())
      return
    }

    if (overlayHistoryActive.current) {
      overlayHistoryActive.current = false
      window.history.back()
    }
  }

  const confirmedSelection = draft === null ? null : getConfirmedSelection(draft)
  const validationMessage = draft === null ? null : getNameValidationMessage(draft.name)
  const showValidationMessage =
    draft !== null && validationMessage !== null && (wasNameTouched || draft.name.length > 0)

  return (
    <main className="s01-screen" data-screen="s01-rock-selection">
      <div className="s01-intro">
        <h1>
          같이 지낼 돌을
          <br />
          골라주세요
        </h1>
      </div>

      <div aria-label="돌 후보" className="s01-rock-list" role="group">
        {ROCK_OPTIONS.map(({ id, label }) => (
          <button
            aria-label={`${label} 선택`}
            aria-pressed={draft?.rockId === id}
            className={`s01-rock-card${draft?.rockId === id ? ' s01-rock-card--selected' : ''}`}
            key={id}
            onClick={() => selectRock(id)}
            type="button"
          >
            <RockIllustration rockId={id} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {draft !== null && (
        <div aria-label="선택한 돌 이름 짓기" aria-modal="true" className="s01-overlay" role="dialog">
          <form className="s01-overlay-panel" onSubmit={confirmSelection}>
            <button
              aria-label="돌 선택 취소"
              className="s01-close-button"
              disabled={isSubmitting}
              onClick={closeOverlay}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="s01-selected-rock">
              <p>이 돌과 함께할까요?</p>
              <RockIllustration large rockId={draft.rockId} />
            </div>

            <div className="s01-name-section">
              <label htmlFor="rock-name">이름을 지어주세요</label>
              <div className={`s01-name-field${showValidationMessage ? ' s01-name-field--error' : ''}`}>
                <input
                  aria-describedby="rock-name-help rock-name-error"
                  aria-invalid={showValidationMessage}
                  autoComplete="off"
                  autoFocus
                  disabled={isSubmitting}
                  id="rock-name"
                  onBlur={() => setWasNameTouched(true)}
                  onChange={(event) => {
                    setDraft(updateSelectionName(draft, event.target.value))
                    setSaveError(null)
                  }}
                  placeholder="1~10자"
                  value={draft.name}
                />
                <span aria-hidden="true">{[...draft.name.trim()].length}/10</span>
              </div>
              <div className="s01-field-message" id="rock-name-error">
                {showValidationMessage ? validationMessage : ''}
              </div>
              <p id="rock-name-help">이름은 나중에 변경할 수 없어요.</p>
            </div>

            {saveError !== null && (
              <p className="s01-save-error" role="alert">
                {saveError}
              </p>
            )}

            <button
              className="s01-confirm-button"
              disabled={confirmedSelection === null || isSubmitting}
              type="submit"
            >
              {isSubmitting ? '데려오는 중...' : '데려가기'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
