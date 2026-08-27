import type { GameState } from '../../domain'
import { shareRock, type RockShareService, type ShareResult } from '../../share'

type InFlightShare = { current: boolean }

export async function requestRockShareOnce(
  gameState: GameState,
  service: RockShareService,
  inFlight: InFlightShare,
): Promise<ShareResult | null> {
  if (inFlight.current) {
    return null
  }

  inFlight.current = true

  try {
    return await shareRock(gameState, service)
  } catch {
    return { status: 'failed' }
  } finally {
    inFlight.current = false
  }
}

// Keeps the menu's history entry open until the share flow settles, so the
// history navigation used to close the menu never lands in the same tick as
// the still-pending navigator.share() call.
export function shareThenUnwindMenu(
  performShare: () => Promise<unknown>,
  unwindMenuHistory: () => void,
): void {
  void performShare().then(unwindMenuHistory, unwindMenuHistory)
}
