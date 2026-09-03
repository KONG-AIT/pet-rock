import { useState } from 'react'

import growthFxFallbackSrc from '../../assets/fx/fx-growth-01.png'
import soilFxFallbackSrc from '../../assets/fx/fx-soil-01.png'
import sparkleFxFallbackSrc from '../../assets/fx/fx-sparkle-01.png'
import plantedSrc from '../../assets/growth/growth-planted.png'
import growingSrc from '../../assets/growth/growth-growing.png'
import plantedFallbackSrc from '../../assets/plants/plant-02/stage-01.png'
import growingFallbackSrc from '../../assets/plants/plant-02/stage-02.png'
import plant01FallbackSrc from '../../assets/plants/plant-01/stage-03.png'
import plant02FallbackSrc from '../../assets/plants/plant-02/stage-03.png'
import plant03FallbackSrc from '../../assets/plants/plant-03/stage-03.png'
import growthFxSrc from '../../assets/runtime/fx/fx-growth.png'
import soilFxSrc from '../../assets/runtime/fx/fx-soil.png'
import sparkleFxSrc from '../../assets/runtime/fx/fx-sparkle.png'
import plant01Src from '../../assets/runtime/plants/plant-01.png'
import plant02Src from '../../assets/runtime/plants/plant-02.png'
import plant03Src from '../../assets/runtime/plants/plant-03.png'
import type { PlantId } from '../../domain'

type Bounds = Readonly<{ x: number; y: number; width: number; height: number }>

export type PlantVisualSpec = Readonly<{
  src: string
  fallbackSrc: string
  visibleBounds: Bounds
  stemAnchor: Readonly<{ x: number; y: number }>
}>

// eslint-disable-next-line react-refresh/only-export-components
export const PLANT_STAGE_THREE_SPECS: Readonly<Record<PlantId, PlantVisualSpec>> = {
  'plant-01': { src: plant01Src, fallbackSrc: plant01FallbackSrc, visibleBounds: { x: 0, y: 0.0167, width: 0.9904, height: 0.953 }, stemAnchor: { x: 0.5, y: 0.9697 } },
  'plant-02': { src: plant02Src, fallbackSrc: plant02FallbackSrc, visibleBounds: { x: 0.0734, y: 0.0234, width: 0.8531, height: 0.9719 }, stemAnchor: { x: 0.5, y: 0.9953 } },
  'plant-03': { src: plant03Src, fallbackSrc: plant03FallbackSrc, visibleBounds: { x: 0, y: 0.0112, width: 0.9633, height: 0.9633 }, stemAnchor: { x: 0.5, y: 0.9745 } },
}

// eslint-disable-next-line react-refresh/only-export-components
export const SHARED_GROWTH_SPECS = {
  planted: { src: plantedSrc, visibleBounds: { x: 0.2859, y: 0.7063, width: 0.4281, height: 0.2891 }, stemAnchor: { x: 0.5, y: 0.9953 } },
  growing: { src: growingSrc, visibleBounds: { x: 0.1766, y: 0.3422, width: 0.6484, height: 0.6531 }, stemAnchor: { x: 0.5, y: 0.9953 } },
} as const

function PlantImage({ src, fallbackSrc, layer, className, loading = 'eager' }: Readonly<{ src: string; fallbackSrc: string; layer: string; className: string; loading?: 'eager' | 'lazy' }>) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      {failed ? <span className={`${className} visual-asset-fallback`} data-layer="plant-unavailable" /> : null}
      {!failed ? <img className={className} data-layer={layer} src={src} alt="" decoding="async" loading={loading} draggable={false} onError={(event) => {
        const image = event.currentTarget
        if (image.dataset.fallbackAttempted !== 'true') {
          image.dataset.fallbackAttempted = 'true'
          image.src = fallbackSrc
          return
        }
        setFailed(true)
      }} /> : null}
    </>
  )
}

function DecorativeImage({ src, fallbackSrc, layer, className }: Readonly<{ src: string; fallbackSrc: string; layer: string; className: string }>) {
  return <img className={className} data-layer={layer} src={src} alt="" decoding="async" draggable={false} onError={(event) => {
    const image = event.currentTarget
    if (image.dataset.fallbackAttempted !== 'true') {
      image.dataset.fallbackAttempted = 'true'
      image.src = fallbackSrc
      return
    }
    image.hidden = true
  }} />
}

export function EquippedPlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className="visual-layer visual-layer--equipped-plant" data-plant-id={plantId} data-layer="equipped-plant">
      <PlantImage {...PLANT_STAGE_THREE_SPECS[plantId]} layer="plant-stage-03" className="visual-layer__image" />
    </span>
  )
}

export function CompletedPlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className={`s03-completed-plant s03-completed-plant--${plantId}`} data-plant-id={plantId} aria-hidden="true">
      <PlantImage {...PLANT_STAGE_THREE_SPECS[plantId]} layer="plant-stage-03" className="visual-layer visual-layer--growth-plant" />
      <DecorativeImage className="visual-layer visual-layer--sparkle-fx" layer="sparkle-fx" src={sparkleFxSrc} fallbackSrc={sparkleFxFallbackSrc} />
    </span>
  )
}

export function GrowthPlantVisual({ stage }: Readonly<{ stage: 'planted' | 'growing' }>) {
  const spec = SHARED_GROWTH_SPECS[stage]
  return (
    <span className={`s03-growth-visual s03-growth-visual--${stage}`} data-growth-stage={stage} aria-hidden="true">
      <PlantImage
        src={spec.src}
        fallbackSrc={stage === 'planted' ? plantedFallbackSrc : growingFallbackSrc}
        layer={`plant-stage-${stage === 'planted' ? '01' : '02'}`}
        className="visual-layer visual-layer--growth-plant"
      />
      <DecorativeImage className="visual-layer visual-layer--soil-fx" layer="soil-fx" src={soilFxSrc} fallbackSrc={soilFxFallbackSrc} />
      {stage === 'growing' ? <DecorativeImage className="visual-layer visual-layer--growth-fx" layer="growth-fx" src={growthFxSrc} fallbackSrc={growthFxFallbackSrc} /> : null}
    </span>
  )
}

export function StoragePlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className="storage-plant" data-plant={plantId} aria-hidden="true">
      <PlantImage {...PLANT_STAGE_THREE_SPECS[plantId]} layer="plant-stage-03" className="visual-layer visual-layer--storage-plant" loading="lazy" />
    </span>
  )
}
