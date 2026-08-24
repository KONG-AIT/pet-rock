import type { NameValidationResult, RockName } from './types'

export const ROCK_NAME_MAX_LENGTH = 10

const ALLOWED_NAME_PATTERN = /^[A-Za-z0-9\p{Script=Hangul} ]+$/u

export function validateRockName(input: string): NameValidationResult {
  const normalized = input.trim()

  if (normalized.length === 0) {
    return { valid: false, reason: 'required' }
  }

  if ([...normalized].length > ROCK_NAME_MAX_LENGTH) {
    return { valid: false, reason: 'too_long' }
  }

  if (!ALLOWED_NAME_PATTERN.test(normalized)) {
    return { valid: false, reason: 'invalid_characters' }
  }

  return { valid: true, name: normalized as RockName }
}
