import { useEffect, useState, type FormEvent } from 'react'

import { useGameActions, useTransientHistoryEntry } from '../../app/index'
import { SelectionRockVisual } from '../../components/visuals'
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

function saveErrorMessage(): string {
  return '돌을 데려오지 못했어요. 잠시 후 다시 시도해주세요.'
}

export function RockSelectionScreen() {
  const { adoptRock } = useGameActions()
  const [draft, setDraft] = useState<RockSelectionDraft | null>(null)
  const [wasNameTouched, setWasNameTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function resetOverlay() {
    setDraft(cancelSelection())
    setWasNameTouched(false)
    setIsSubmitting(false)
    setSaveError(null)
  }

  const overlayHistoryEntry = useTransientHistoryEntry(
    HISTORY_STATE_KEY,
    resetOverlay,
  )

  function closeOverlay() {
    if (isSubmitting) {
      return
    }

    if (!overlayHistoryEntry.close()) {
      resetOverlay()
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && draft !== null) {
        closeOverlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  function selectRock(rockId: RockId) {
    overlayHistoryEntry.open()

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

    overlayHistoryEntry.close()
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
            <SelectionRockVisual label={label} rockId={id} />
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
              <SelectionRockVisual
                large
                label={ROCK_OPTIONS.find(({ id }) => id === draft.rockId)?.label ?? '돌'}
                rockId={draft.rockId}
              />
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
