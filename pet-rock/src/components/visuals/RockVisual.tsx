import type { PlantId, RockId } from '../../domain'
import { EquippedPlantVisual } from './PlantVisual'

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

export function SelectionRockVisual({
  rockId,
  label,
  large = false,
}: Readonly<{
  rockId: RockId
  label: string
  large?: boolean
}>) {
  return (
    <svg
      aria-label={label}
      className={`s01-rock-illustration s01-rock-illustration--${rockId}${large ? ' s01-rock-illustration--large' : ''}`}
      role="img"
      viewBox="0 0 180 150"
    >
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

export function HomeRockVisual({
  rockId,
  equippedPlantId,
  reacting,
  reactionKey,
}: Readonly<{
  rockId: RockId
  equippedPlantId: PlantId | null
  reacting: boolean
  reactionKey: number
}>) {
  const rockPath = HOME_ROCK_PATHS[rockId]

  return (
    <div
      key={reactionKey}
      className={`home-rock${reacting ? ' home-rock--reacting' : ''}`}
    >
      <svg
        aria-hidden="true"
        className={`home-rock__art home-rock__art--${rockId}`}
        viewBox="0 0 310 250"
      >
        <defs>
          <filter id="rock-texture">
            <feTurbulence baseFrequency="0.7" numOctaves="2" seed="7" type="fractalNoise" />
            <feComposite in="SourceGraphic" operator="in" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        {equippedPlantId === null ? null : (
          <EquippedPlantVisual plantId={equippedPlantId} />
        )}
        <ellipse className="home-rock__shadow" cx="155" cy="222" rx="104" ry="14" />
        <path className="home-rock__body" d={rockPath} />
        <path className="home-rock__texture" d={rockPath} filter="url(#rock-texture)" />
        <path className="home-rock__shine" d="M84 158c8-49 30-78 65-88" />
      </svg>
    </div>
  )
}

export function StorageRockVisual({ rockId }: Readonly<{ rockId: RockId }>) {
  return (
    <span className="storage-rock" data-rock={rockId} aria-hidden="true">
      <span className="storage-rock__shine" />
    </span>
  )
}
