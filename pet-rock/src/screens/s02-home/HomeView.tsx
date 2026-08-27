import { HomeRockVisual } from '../../components/visuals'
import type { HomeMenuAction, HomeRenderModel, HomeShareNotice } from './home-model'

type HomeViewProps = Readonly<{
  model: HomeRenderModel
  menuOpen: boolean
  reacting: boolean
  reactionKey: number
  shareNotice: HomeShareNotice
  sharePending: boolean
  onRockTouch: () => void
  onToggleMenu: () => void
  onDismissMenu: () => void
  onMenuAction: (action: HomeMenuAction) => void
}>

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
  shareNotice,
  sharePending,
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
          <HomeRockVisual
            equippedPlantId={model.equippedPlantId}
            reacting={reacting}
            reactionKey={reactionKey}
            rockId={model.rockId}
          />
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
            <button
              disabled={sharePending}
              type="button"
              role="menuitem"
              onClick={() => onMenuAction('share')}
            >
              <span>{sharePending ? '공유하는 중' : '공유'}</span>
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

      {sharePending ? (
        <p aria-live="polite" className="home__share-notice" role="status">
          공유를 준비하고 있어요.
        </p>
      ) : shareNotice === null ? null : (
        <p
          aria-live="polite"
          className={`home__share-notice home__share-notice--${shareNotice.tone}`}
          role="status"
        >
          {shareNotice.message}
        </p>
      )}
    </main>
  )
}
