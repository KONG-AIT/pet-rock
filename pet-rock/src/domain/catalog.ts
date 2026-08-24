import type { PlantCatalogEntry } from './types'

export const PLANT_CATALOG = [
  { id: 'plant-01', displayName: '식물 1', assetKey: 'plant-01' },
  { id: 'plant-02', displayName: '식물 2', assetKey: 'plant-02' },
  { id: 'plant-03', displayName: '식물 3', assetKey: 'plant-03' },
] as const satisfies ReadonlyArray<PlantCatalogEntry>
