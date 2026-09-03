import { useState } from 'react'

import growthFxSrc from '../../assets/fx/fx-growth-01.png'
import soilFxSrc from '../../assets/fx/fx-soil-01.png'
import sparkleFxSrc from '../../assets/fx/fx-sparkle-01.png'
import plantedSrc from '../../assets/plants/plant-02/stage-01.png'
import growingSrc from '../../assets/plants/plant-02/stage-02.png'
import plant01Src from '../../assets/plants/plant-01/stage-03.png'
import plant02Src from '../../assets/plants/plant-02/stage-03.png'
import plant03Src from '../../assets/plants/plant-03/stage-03.png'
import type { PlantId } from '../../domain'

type Bounds = Readonly<{ x: number; y: number; width: number; height: number }>

export type PlantVisualSpec = Readonly<{
  src: string
  visibleBounds: Bounds
  stemAnchor: Readonly<{ x: number; y: number }>
}>

// eslint-disable-next-line react-refresh/only-export-components
export const PLANT_STAGE_THREE_SPECS: Readonly<Record<PlantId, PlantVisualSpec>> = {
  'plant-01': { src: plant01Src, visibleBounds: { x: 0, y: 0.0167, width: 0.9904, height: 0.953 }, stemAnchor: { x: 0.5, y: 0.9697 } },
  'plant-02': { src: plant02Src, visibleBounds: { x: 0.0734, y: 0.0234, width: 0.8531, height: 0.9719 }, stemAnchor: { x: 0.5, y: 0.9953 } },
  'plant-03': { src: plant03Src, visibleBounds: { x: 0, y: 0.0112, width: 0.9633, height: 0.9633 }, stemAnchor: { x: 0.5, y: 0.9745 } },
}

// eslint-disable-next-line react-refresh/only-export-components
export const SHARED_GROWTH_SPECS = {
  planted: { src: plantedSrc, visibleBounds: { x: 0.2859, y: 0.7063, width: 0.4281, height: 0.2891 }, stemAnchor: { x: 0.5, y: 0.9953 } },
  growing: { src: growingSrc, visibleBounds: { x: 0.1766, y: 0.3422, width: 0.6484, height: 0.6531 }, stemAnchor: { x: 0.5, y: 0.9953 } },
} as const

function PlantFallback({ plantId, className }: Readonly<{ plantId: PlantId; className: string }>) {
  return (
    <svg className={className} viewBox="0 0 260 260" aria-hidden="true">
      <g className="plant-fallback__growth">
        <path d="M130 236V106" />
        <path d="M129 169c-35 1-56-15-58-43 34-4 55 13 58 43Z" />
        <path d="M131 146c31 1 50-13 54-39-30-4-51 11-54 39Z" />
        {plantId === 'plant-02' ? <circle cx="130" cy="91" r="28" /> : null}
        {plantId === 'plant-03' ? <path d="M98 112c3-35 16-56 32-56s29 21 32 56c-9 13-20 19-32 19s-23-6-32-19Z" /> : null}
      </g>
    </svg>
  )
}

function PlantImage({ src, layer, className, fallback }: Readonly<{ src: string; layer: string; className: string; fallback: React.ReactNode }>) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      {failed ? fallback : null}
      {!failed ? <img className={className} data-layer={layer} src={src} alt="" draggable={false} onError={() => setFailed(true)} /> : null}
    </>
  )
}

function DecorativeImage({ src, layer, className }: Readonly<{ src: string; layer: string; className: string }>) {
  return <img className={className} data-layer={layer} src={src} alt="" draggable={false} onError={(event) => { event.currentTarget.hidden = true }} />
}

export function EquippedPlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className="visual-layer visual-layer--equipped-plant" data-plant-id={plantId} data-layer="equipped-plant">
      <PlantImage src={PLANT_STAGE_THREE_SPECS[plantId].src} layer="plant-stage-03" className="visual-layer__image" fallback={<PlantFallback plantId={plantId} className="visual-layer__image plant-fallback" />} />
    </span>
  )
}

export function CompletedPlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className={`s03-completed-plant s03-completed-plant--${plantId}`} data-plant-id={plantId} aria-hidden="true">
      <PlantImage src={PLANT_STAGE_THREE_SPECS[plantId].src} layer="plant-stage-03" className="visual-layer visual-layer--growth-plant" fallback={<PlantFallback plantId={plantId} className="visual-layer plant-fallback" />} />
      <DecorativeImage className="visual-layer visual-layer--sparkle-fx" layer="sparkle-fx" src={sparkleFxSrc} />
    </span>
  )
}

export function GrowthPlantVisual({ stage }: Readonly<{ stage: 'planted' | 'growing' }>) {
  return (
    <span className={`s03-growth-visual s03-growth-visual--${stage}`} data-growth-stage={stage} aria-hidden="true">
      <span className={`s03-growth-fallback s03-growth-fallback--${stage}`} />
      <span className="visual-layer visual-layer--growth-plant" data-layer={`plant-stage-${stage === 'planted' ? '01' : '02'}`} />
      <DecorativeImage className="visual-layer visual-layer--soil-fx" layer="soil-fx" src={soilFxSrc} />
      {stage === 'growing' ? <DecorativeImage className="visual-layer visual-layer--growth-fx" layer="growth-fx" src={growthFxSrc} /> : null}
    </span>
  )
}

export function StoragePlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className="storage-plant" data-plant={plantId} aria-hidden="true">
      <PlantImage src={PLANT_STAGE_THREE_SPECS[plantId].src} layer="plant-stage-03" className="visual-layer visual-layer--storage-plant" fallback={<PlantFallback plantId={plantId} className="visual-layer plant-fallback" />} />
    </span>
  )
}
