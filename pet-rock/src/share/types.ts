import type { PlantId, RockId } from '../domain'

export type ShareResult =
  | Readonly<{ status: 'shared' }>
  | Readonly<{ status: 'cancelled' }>
  | Readonly<{ status: 'unavailable' }>
  | Readonly<{ status: 'failed' }>

export type RockShareModel = Readonly<{
  rock: Readonly<{
    id: RockId
    name: string
  }>
  plant: Readonly<{
    id: PlantId
    displayName: string
    assetKey: string
  }> | null
}>

export interface RockShareService {
  share(model: RockShareModel): Promise<ShareResult>
}
