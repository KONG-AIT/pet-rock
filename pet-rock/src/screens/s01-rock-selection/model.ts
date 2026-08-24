import { ROCK_IDS, validateRockName, type RockId } from '../../domain'

const ROCK_LABELS = ['돌 A', '돌 B', '돌 C'] as const

export const ROCK_OPTIONS = ROCK_IDS.map((id, index) => ({
  id,
  label: ROCK_LABELS[index],
}))

export type RockSelectionDraft = Readonly<{
  rockId: RockId
  name: string
}>

export function createSelectionDraft(rockId: RockId): RockSelectionDraft {
  return { rockId, name: '' }
}

export function updateSelectionName(
  draft: RockSelectionDraft,
  name: string,
): RockSelectionDraft {
  return { ...draft, name }
}

export function cancelSelection(): null {
  return null
}

export function getConfirmedSelection(draft: RockSelectionDraft) {
  const validation = validateRockName(draft.name)

  if (!validation.valid) {
    return null
  }

  return { rockId: draft.rockId, name: validation.name }
}

export function getNameValidationMessage(name: string): string | null {
  const validation = validateRockName(name)

  if (validation.valid) {
    return null
  }

  switch (validation.reason) {
    case 'required':
      return '이름을 입력해주세요.'
    case 'too_long':
      return '이름은 10자까지 입력할 수 있어요.'
    case 'invalid_characters':
      return '한글, 영문, 숫자만 사용할 수 있어요.'
  }
}
