import { useState, type CSSProperties } from 'react'

import faceHappyFallbackSrc from '../../assets/faces/face-happy.png'
import faceNeutralFallbackSrc from '../../assets/faces/face-neutral.png'
import groundFallbackSrc from '../../assets/environment/rock-ground.png'
import touchFxFallbackSrc from '../../assets/fx/fx-touch-01.png'
import rock01FallbackSrc from '../../assets/rocks/rock-01.png'
import rock02FallbackSrc from '../../assets/rocks/rock-02.png'
import rock03FallbackSrc from '../../assets/rocks/rock-03.png'
import groundSrc from '../../assets/runtime/environment/rock-ground.png'
import faceHappySrc from '../../assets/runtime/faces/face-happy.png'
import faceNeutralSrc from '../../assets/runtime/faces/face-neutral.png'
import touchFxSrc from '../../assets/runtime/fx/fx-touch.png'
import rock01Src from '../../assets/runtime/rocks/rock-01.png'
import rock02Src from '../../assets/runtime/rocks/rock-02.png'
import rock03Src from '../../assets/runtime/rocks/rock-03.png'
import type { PlantId, RockId } from '../../domain'
import { EquippedPlantVisual } from './PlantVisual'

type Bounds = Readonly<{ x: number; y: number; width: number; height: number }>

export type RockVisualSpec = Readonly<{
  src: string
  fallbackSrc: string
  visibleBounds: Bounds
  groundY: number
  plantAnchor: Readonly<{ x: number; y: number }>
}>

// eslint-disable-next-line react-refresh/only-export-components
export const ROCK_VISUAL_SPECS: Readonly<Record<RockId, RockVisualSpec>> = {
  'rock-01': {
    src: rock01Src,
    fallbackSrc: rock01FallbackSrc,
    visibleBounds: { x: 0.082, y: 0.171, width: 0.864, height: 0.687 },
    groundY: 0.858,
    plantAnchor: { x: 0.5, y: 0.19 },
  },
  'rock-02': {
    src: rock02Src,
    fallbackSrc: rock02FallbackSrc,
    visibleBounds: { x: 0.039, y: 0.32, width: 0.926, height: 0.438 },
    groundY: 0.758,
    plantAnchor: { x: 0.5, y: 0.34 },
  },
  'rock-03': {
    src: rock03Src,
    fallbackSrc: rock03FallbackSrc,
    visibleBounds: { x: 0.065, y: 0.289, width: 0.88, height: 0.469 },
    groundY: 0.758,
    plantAnchor: { x: 0.5, y: 0.31 },
  },
}

// eslint-disable-next-line react-refresh/only-export-components
export const FACE_VISUAL_SOURCES = {
  neutral: { src: faceNeutralSrc, fallbackSrc: faceNeutralFallbackSrc },
  happy: { src: faceHappySrc, fallbackSrc: faceHappyFallbackSrc },
} as const

const SELECTION_ROCK_PATHS: Readonly<Record<RockId, string>> = {
  'rock-01': 'M35 126C24 111 30 73 49 46 62 27 82 19 101 23c27 5 45 30 49 61 4 31-8 48-29 53-34 8-73 3-86-11Z',
  'rock-02': 'M29 120c-5-22 7-56 29-76 16-14 41-20 60-9 21 12 34 44 31 71-3 25-21 32-53 32-34 0-61 2-67-18Z',
  'rock-03': 'M31 113c0-22 8-63 33-78 24-15 61-7 76 18 12 20 15 51 4 70-11 18-35 17-61 16-27-1-52-4-52-26Z',
}

const HOME_ROCK_PATHS: Readonly<Record<RockId, string>> = {
  'rock-01': 'M55 165C59 104 85 57 139 49c62-9 109 38 119 116 5 40-30 58-99 58-70 0-108-18-104-58Z',
  'rock-02': 'M47 168c6-72 42-119 105-119 60 0 101 47 112 119 6 39-32 57-109 57-75 0-112-18-108-57Z',
  'rock-03': 'M51 172c17-78 52-123 109-123 55 0 86 42 104 123 9 39-29 54-106 54-76 0-115-16-107-54Z',
}

function SelectionFallback({ rockId }: Readonly<{ rockId: RockId }>) {
  return (
    <svg className="rock-visual__fallback" viewBox="0 0 180 150" aria-hidden="true">
      <ellipse className="s01-rock-shadow" cx="90" cy="137" rx="62" ry="9" />
      <path className="s01-rock-body" d={SELECTION_ROCK_PATHS[rockId]} />
      <circle className="s01-rock-speck s01-rock-speck--one" cx="62" cy="67" r="5" />
      <circle className="s01-rock-speck s01-rock-speck--two" cx="125" cy="104" r="3" />
      <circle className="s01-rock-eye" cx="72" cy="92" r="5" />
      <circle className="s01-rock-eye" cx="108" cy="92" r="5" />
      <path className="s01-rock-mouth" d="M80 108c7 8 14 8 21 0" />
    </svg>
  )
}

function HomeFallback({ rockId }: Readonly<{ rockId: RockId }>) {
  const rockPath = HOME_ROCK_PATHS[rockId]
  return (
    <svg className="home-rock__fallback" viewBox="0 0 310 250" aria-hidden="true">
      <ellipse className="home-rock__shadow" cx="155" cy="222" rx="104" ry="14" />
      <path className="home-rock__body" d={rockPath} />
      <path className="home-rock__shine" d="M84 158c8-49 30-78 65-88" />
    </svg>
  )
}

function HomeFaceFallback() {
  return (
    <svg className="home-rock__face-fallback" viewBox="0 0 310 250" aria-hidden="true">
      <circle className="home-rock__fallback-face" cx="125" cy="154" r="6" />
      <circle className="home-rock__fallback-face" cx="185" cy="154" r="6" />
    </svg>
  )
}

function RasterLayer({ className, layer, src, fallbackSrc, onError }: Readonly<{
  className: string
  layer: string
  src: string
  fallbackSrc: string
  onError(): void
}>) {
  return <img className={className} data-layer={layer} src={src} alt="" decoding="async" draggable={false} onError={(event) => {
    const image = event.currentTarget
    if (image.dataset.fallbackAttempted !== 'true') {
      image.dataset.fallbackAttempted = 'true'
      image.src = fallbackSrc
      return
    }
    image.hidden = true
    onError()
  }} />
}

type TouchFxMotion = Readonly<{
  x: number
  y: number
  driftX: number
  driftY: number
  rotation: number
  scale: number
}>

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

// eslint-disable-next-line react-refresh/only-export-components
export function createTouchFxMotion(reactionKey: number): TouchFxMotion {
  const side = seededUnit(reactionKey + 1) < 0.5 ? -1 : 1
  const edgeDistance = 13 + seededUnit(reactionKey + 2) * 8

  return {
    x: side < 0 ? edgeDistance : 100 - edgeDistance,
    y: 42 + seededUnit(reactionKey + 3) * 28,
    driftX: side * (22 + seededUnit(reactionKey + 4) * 18),
    driftY: -(18 + seededUnit(reactionKey + 5) * 20),
    rotation: side * (18 + seededUnit(reactionKey + 6) * 34),
    scale: 0.82 + seededUnit(reactionKey + 7) * 0.24,
  }
}

function TouchFxBurst({ reactionKey }: Readonly<{ reactionKey: number }>) {
  const motion = createTouchFxMotion(reactionKey)
  const burstStyle = {
    '--touch-x': `${motion.x}%`,
    '--touch-y': `${motion.y}%`,
  } as CSSProperties
  const particles = [
    { x: motion.driftX, y: motion.driftY, rotation: motion.rotation, scale: motion.scale, delay: 0 },
    { x: motion.driftX * 0.7, y: motion.driftY * 1.18, rotation: -motion.rotation * 0.75, scale: motion.scale * 0.68, delay: 55 },
    { x: motion.driftX * 1.12, y: motion.driftY * 0.62, rotation: motion.rotation * 1.3, scale: motion.scale * 0.48, delay: 105 },
  ]

  return (
    <span className="visual-layer visual-layer--touch-fx" data-layer="touch-fx" style={burstStyle}>
      {particles.map((particle, index) => {
        const particleStyle = {
          '--particle-drift-x': `${particle.x}px`,
          '--particle-drift-y': `${particle.y}px`,
          '--particle-rotation': `${particle.rotation}deg`,
          '--particle-scale': particle.scale,
          '--particle-delay': `${particle.delay}ms`,
        } as CSSProperties
        return (
          <span key={index} className="touch-fx__particle-slot" style={particleStyle}>
            <RasterLayer
              className="visual-layer__image touch-fx__particle"
              layer={`touch-particle-${index + 1}`}
              src={touchFxSrc}
              fallbackSrc={touchFxFallbackSrc}
              onError={() => undefined}
            />
          </span>
        )
      })}
    </span>
  )
}

export function SelectionRockVisual({ rockId, label, large = false }: Readonly<{
  rockId: RockId
  label: string
  large?: boolean
}>) {
  const [failed, setFailed] = useState(false)
  return (
    <span
      aria-label={label}
      className={`s01-rock-illustration s01-rock-illustration--${rockId}${large ? ' s01-rock-illustration--large' : ''}`}
      role="img"
    >
      {failed ? <SelectionFallback rockId={rockId} /> : null}
      {!failed ? <RasterLayer className="visual-layer visual-layer--rock" layer="rock" src={ROCK_VISUAL_SPECS[rockId].src} fallbackSrc={ROCK_VISUAL_SPECS[rockId].fallbackSrc} onError={() => setFailed(true)} /> : null}
      {!failed ? <RasterLayer className="visual-layer visual-layer--face" layer="face-neutral" src={faceNeutralSrc} fallbackSrc={faceNeutralFallbackSrc} onError={() => setFailed(true)} /> : null}
    </span>
  )
}

export function HomeRockVisual({ rockId, equippedPlantId, reacting, reactionKey }: Readonly<{
  rockId: RockId
  equippedPlantId: PlantId | null
  reacting: boolean
  reactionKey: number
}>) {
  const [rockFailed, setRockFailed] = useState(false)
  const [faceFailed, setFaceFailed] = useState(false)
  return (
    <div className={`home-rock home-rock--${rockId}`}>
      <RasterLayer className="visual-layer home-rock__ground" layer="ground" src={groundSrc} fallbackSrc={groundFallbackSrc} onError={() => undefined} />
      <div key={reactionKey} className={`home-rock__character${reacting ? ' home-rock__character--reacting' : ''}`}>
        {rockFailed ? <HomeFallback rockId={rockId} /> : null}
        {!rockFailed ? <RasterLayer className="visual-layer visual-layer--rock" layer="rock" src={ROCK_VISUAL_SPECS[rockId].src} fallbackSrc={ROCK_VISUAL_SPECS[rockId].fallbackSrc} onError={() => setRockFailed(true)} /> : null}
        {faceFailed ? <HomeFaceFallback /> : null}
        {!faceFailed ? <RasterLayer className="visual-layer visual-layer--face" layer={reacting ? 'face-happy' : 'face-neutral'} src={reacting ? faceHappySrc : faceNeutralSrc} fallbackSrc={reacting ? faceHappyFallbackSrc : faceNeutralFallbackSrc} onError={() => setFaceFailed(true)} /> : null}
        {equippedPlantId === null ? null : <EquippedPlantVisual plantId={equippedPlantId} />}
        {reacting ? <TouchFxBurst reactionKey={reactionKey} /> : null}
      </div>
    </div>
  )
}

export function StorageRockVisual({ rockId }: Readonly<{ rockId: RockId }>) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="storage-rock" data-rock={rockId} aria-hidden="true">
      {failed ? <span className="storage-rock__fallback"><span className="storage-rock__shine" /></span> : null}
      {!failed ? <RasterLayer className="visual-layer visual-layer--rock" layer="rock" src={ROCK_VISUAL_SPECS[rockId].src} fallbackSrc={ROCK_VISUAL_SPECS[rockId].fallbackSrc} onError={() => setFailed(true)} /> : null}
      {!failed ? <RasterLayer className="visual-layer visual-layer--face" layer="face-neutral" src={faceNeutralSrc} fallbackSrc={faceNeutralFallbackSrc} onError={() => setFailed(true)} /> : null}
    </span>
  )
}
