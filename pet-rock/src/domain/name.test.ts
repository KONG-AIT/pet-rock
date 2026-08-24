import { describe, expect, it } from 'vitest'

import { ROCK_NAME_MAX_LENGTH, validateRockName } from './name'

describe('validateRockName', () => {
  it('trims and accepts a 1 to 10 character Korean, English, or numeric name', () => {
    expect(validateRockName('  몽돌 1  ')).toEqual({ valid: true, name: '몽돌 1' })
    expect(validateRockName('A'.repeat(ROCK_NAME_MAX_LENGTH))).toEqual({
      valid: true,
      name: 'A'.repeat(ROCK_NAME_MAX_LENGTH),
    })
  })

  it.each([
    ['', 'required'],
    ['     ', 'required'],
    ['A'.repeat(ROCK_NAME_MAX_LENGTH + 1), 'too_long'],
    ['돌!', 'invalid_characters'],
    ['돌\n이', 'invalid_characters'],
  ] as const)('rejects %j with %s', (input, reason) => {
    expect(validateRockName(input)).toEqual({ valid: false, reason })
  })
})
