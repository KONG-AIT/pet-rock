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
