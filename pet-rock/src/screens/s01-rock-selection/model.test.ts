import { describe, expect, it } from 'vitest'

import {
  ROCK_OPTIONS,
  cancelSelection,
  createSelectionDraft,
  getConfirmedSelection,
  getNameValidationMessage,
  updateSelectionName,
} from './model'

describe('S01 rock selection model', () => {
  it('offers the three P00 rocks', () => {
    expect(ROCK_OPTIONS.map(({ id }) => id)).toEqual(['rock-01', 'rock-02', 'rock-03'])
  })

  it('keeps selection and name as an unpersisted draft until confirmation', () => {
    const selected = createSelectionDraft('rock-02')
    const named = updateSelectionName(selected, '  몽돌  ')

    expect(selected).toEqual({ rockId: 'rock-02', name: '' })
    expect(named).toEqual({ rockId: 'rock-02', name: '  몽돌  ' })
    expect(cancelSelection()).toBeNull()
    expect(getConfirmedSelection(named)).toEqual({ rockId: 'rock-02', name: '몽돌' })
  })

  it('blocks empty, too-long, and unsupported names', () => {
    const draft = createSelectionDraft('rock-01')

    expect(getConfirmedSelection(updateSelectionName(draft, '   '))).toBeNull()
    expect(getConfirmedSelection(updateSelectionName(draft, '12345678901'))).toBeNull()
    expect(getConfirmedSelection(updateSelectionName(draft, '돌🪨'))).toBeNull()
    expect(getNameValidationMessage('   ')).toBe('이름을 입력해주세요.')
    expect(getNameValidationMessage('12345678901')).toBe('이름은 10자까지 입력할 수 있어요.')
    expect(getNameValidationMessage('돌🪨')).toBe('한글, 영문, 숫자만 사용할 수 있어요.')
  })
})
