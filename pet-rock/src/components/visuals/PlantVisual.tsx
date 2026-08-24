import type { PlantId } from '../../domain'

export function EquippedPlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  if (plantId === 'plant-02') {
    return (
      <g className="home-plant home-plant--flower" data-plant-id={plantId}>
        <path d="M155 82V35" />
        <path d="M155 59c-18-3-26-13-25-27 17 0 27 8 25 27Z" />
        <path d="M155 66c17-3 26-12 26-25-17 0-27 8-26 25Z" />
        <circle cx="155" cy="27" r="12" />
        <circle cx="143" cy="28" r="10" />
        <circle cx="167" cy="28" r="10" />
        <circle className="home-plant__center" cx="155" cy="28" r="7" />
      </g>
    )
  }

  if (plantId === 'plant-03') {
    return (
      <g className="home-plant home-plant--cactus" data-plant-id={plantId}>
        <path d="M145 83V39c0-12 20-12 20 0v44" />
        <path d="M145 61h-10c-8 0-8-8-8-16" />
        <path d="M165 54h9c8 0 8-8 8-15" />
      </g>
    )
  }

  return (
    <g className="home-plant home-plant--sprout" data-plant-id={plantId}>
      <path d="M155 84V43" />
      <path d="M154 56c-22-1-34-12-33-30 21 0 34 10 33 30Z" />
      <path d="M156 63c22-1 34-11 34-29-21 0-34 10-34 29Z" />
    </g>
  )
}

export function CompletedPlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <svg className={`s03-completed-plant s03-completed-plant--${plantId}`} viewBox="0 0 260 340" aria-hidden="true">
      <ellipse className="s03-pot__shadow" cx="130" cy="315" rx="86" ry="14" />
      <g className="s03-completed-plant__growth">
        <path className="s03-completed-plant__stem" d="M130 190V68" />
        {plantId === 'plant-01' ? (
          <>
            <path d="M129 131c-35 1-56-15-58-43 34-4 55 13 58 43Z" />
            <path d="M131 108c31 1 50-13 54-39-30-4-51 11-54 39Z" />
          </>
        ) : null}
        {plantId === 'plant-02' ? (
          <>
            <path d="M129 150c-29 1-46-12-48-35 28-4 46 11 48 35Z" />
            <path d="M131 128c27 0 44-12 47-35-27-3-44 10-47 35Z" />
            <circle cx="130" cy="63" r="31" />
            <circle className="s03-completed-plant__center" cx="130" cy="63" r="12" />
          </>
        ) : null}
        {plantId === 'plant-03' ? (
          <>
            <path d="M129 145c-28 1-45-12-47-35 27-3 45 10 47 35Z" />
            <path d="M131 119c26 1 43-11 46-34-26-3-43 10-46 34Z" />
            <path className="s03-completed-plant__crown" d="M95 79c3-30 17-49 35-49s32 19 35 49c-10 12-23 18-35 18S105 91 95 79Z" />
          </>
        ) : null}
      </g>
      <ellipse className="s03-pot__rim" cx="130" cy="195" rx="94" ry="34" />
      <ellipse className="s03-pot__soil" cx="130" cy="191" rx="79" ry="22" />
      <path className="s03-pot__body" d="M48 203h164l-22 99c-2 9-10 15-19 15H89c-9 0-17-6-19-15l-22-99Z" />
      <path className="s03-pot__lip" d="M40 194h180v31c0 8-6 14-14 14H54c-8 0-14-6-14-14v-31Z" />
    </svg>
  )
}

export function StoragePlantVisual({ plantId }: Readonly<{ plantId: PlantId }>) {
  return (
    <span className="storage-plant" data-plant={plantId} aria-hidden="true">
      <span className="storage-plant__stem" />
      <span className="storage-plant__leaf storage-plant__leaf--left" />
      <span className="storage-plant__leaf storage-plant__leaf--right" />
      <span className="storage-plant__bloom" />
    </span>
  )
}
