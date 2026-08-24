import type { HomeMenuAction, HomeRenderModel } from './home-model'

type HomeViewProps = Readonly<{
  model: HomeRenderModel
  menuOpen: boolean
  reacting: boolean
  reactionKey: number
  onRockTouch: () => void
  onToggleMenu: () => void
  onDismissMenu: () => void
  onMenuAction: (action: HomeMenuAction) => void
}>

const ROCK_PATHS = {
  'rock-01': 'M55 165C59 104 85 57 139 49c62-9 109 38 119 116 5 40-30 58-99 58-70 0-108-18-104-58Z',
  'rock-02': 'M47 168c6-72 42-119 105-119 60 0 101 47 112 119 6 39-32 57-109 57-75 0-112-18-108-57Z',
  'rock-03': 'M51 172c17-78 52-123 109-123 55 0 86 42 104 123 9 39-29 54-106 54-76 0-115-16-107-54Z',
} as const

function Plant({ plantId }: Readonly<{ plantId: NonNullable<HomeRenderModel['equippedPlantId']> }>) {
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

function RockIllustration({
  model,
  reacting,
  reactionKey,
}: Readonly<{
  model: HomeRenderModel
  reacting: boolean
  reactionKey: number
}>) {
  return (
    <div
      key={reactionKey}
      className={`home-rock${reacting ? ' home-rock--reacting' : ''}`}
    >
      <svg
        aria-hidden="true"
        className={`home-rock__art home-rock__art--${model.rockId}`}
        viewBox="0 0 310 250"
      >
        <defs>
          <filter id="rock-texture">
            <feTurbulence baseFrequency="0.7" numOctaves="2" seed="7" type="fractalNoise" />
            <feComposite in="SourceGraphic" operator="in" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        {model.equippedPlantId === null ? null : <Plant plantId={model.equippedPlantId} />}
        <ellipse className="home-rock__shadow" cx="155" cy="222" rx="104" ry="14" />
        <path className="home-rock__body" d={ROCK_PATHS[model.rockId]} />
        <path className="home-rock__texture" d={ROCK_PATHS[model.rockId]} filter="url(#rock-texture)" />
        <path className="home-rock__shine" d="M84 158c8-49 30-78 65-88" />
      </svg>
    </div>
  )
}

function MenuIcon({ action }: Readonly<{ action: HomeMenuAction }>) {
  if (action === 'plant-seed') {
    return <span aria-hidden="true" className="home-menu__icon">•</span>
  }
  if (action === 'plant-storage') {
    return <span aria-hidden="true" className="home-menu__icon">♧</span>
  }
  return <span aria-hidden="true" className="home-menu__icon">↗</span>
}

export function HomeView({
  model,
  menuOpen,
  reacting,
  reactionKey,
  onRockTouch,
  onToggleMenu,
  onDismissMenu,
  onMenuAction,
}: HomeViewProps) {
  return (
    <main className="home" data-screen="s02-home">
      <h1 className="home__name">{model.rockName}</h1>

      <div
        aria-hidden="true"
        className={`home__time-layer home__time-layer--${model.elapsedState}`}
        data-elapsed-state={model.elapsedState}
      >
        <span />
        <span />
        <span />
      </div>

      <section className="home__companion" aria-label={`${model.rockName}의 모습`}>
        <button
          className="home__rock-button"
          type="button"
          onClick={onRockTouch}
          aria-label={`${model.rockName} 쓰다듬기`}
        >
          <RockIllustration model={model} reacting={reacting} reactionKey={reactionKey} />
        </button>
        <p className="home__reaction" aria-live="polite">
          {reacting ? '방금 살짝 움직인 것 같아요.' : '오늘도 가만히 있네요.'}
        </p>
      </section>

      {menuOpen ? (
        <button
          aria-label="액션 메뉴 닫기"
          className="home__menu-backdrop"
          type="button"
          onClick={onDismissMenu}
        />
      ) : null}

      <div className="home__actions">
        {menuOpen ? (
          <div className="home-menu" id="home-action-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => onMenuAction('plant-seed')}>
              <span>씨앗 심기</span>
              <MenuIcon action="plant-seed" />
            </button>
            <button type="button" role="menuitem" onClick={() => onMenuAction('plant-storage')}>
              <span>식물 보관함</span>
              <MenuIcon action="plant-storage" />
            </button>
            <button type="button" role="menuitem" onClick={() => onMenuAction('share')}>
              <span>공유</span>
              <MenuIcon action="share" />
            </button>
          </div>
        ) : null}

        <button
          aria-controls="home-action-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? '액션 메뉴 닫기' : '액션 메뉴 열기'}
          className={`home__action-button${menuOpen ? ' home__action-button--open' : ''}`}
          type="button"
          onClick={onToggleMenu}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
    </main>
  )
}
