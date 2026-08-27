import { useState } from 'react'

import { useAppNavigation, useGameActions, useGameQueries } from '../../app/index'
import { StoragePlantVisual, StorageRockVisual } from '../../components/visuals'
import { PLANT_CATALOG, type GameState, type RockId } from '../../domain'
import {
  createPlantStorageViewModel,
  getEquippedPlantId,
  hasPendingEquipmentChange,
  type PreviewPlantId,
  type StorageTab,
} from './model'
import './styles.css'

function plantName(plantId: PreviewPlantId): string {
  if (plantId === null) {
    return '식물 없음'
  }

  return PLANT_CATALOG.find((plant) => plant.id === plantId)?.displayName ?? '식물'
}

function Preview({
  rockId,
  rockName,
  plantId,
}: Readonly<{
  rockId: RockId
  rockName: string
  plantId: PreviewPlantId
}>) {
  return (
    <section className="storage-preview" aria-label="선택 미리보기">
      <p className="storage-preview__eyebrow">내 돌 미리보기</p>
      <div className="storage-preview__scene">
        {plantId !== null && (
          <span key={plantId} className="storage-preview__plant">
            <StoragePlantVisual plantId={plantId} />
          </span>
        )}
        <StorageRockVisual rockId={rockId} />
        <span className="storage-preview__shadow" aria-hidden="true" />
      </div>
      <h2>{rockName}</h2>
      <p className="storage-preview__selection">{plantName(plantId)}</p>
    </section>
  )
}

function EmptyState({
  kind,
  onOpenPlanting,
}: Readonly<{
  kind: StorageTab
  onOpenPlanting: () => void
}>) {
  const plants = kind === 'plants'

  return (
    <section className="storage-empty" aria-label={`${plants ? '식물' : '씨앗'} 빈 상태`}>
      <div className="storage-empty__illustration" aria-hidden="true">
        {plants ? <StorageRockVisual rockId="rock-01" /> : <span className="storage-seed-icon" />}
      </div>
      <h2>{plants ? '아직 보관함이 비어 있어요' : '가지고 있는 씨앗이 없어요'}</h2>
      <p>
        {plants
          ? '씨앗을 심고 천천히 식물을 키워보세요.'
          : '새 씨앗을 만나면 이곳에서 확인할 수 있어요.'}
      </p>
      {plants && (
        <button className="storage-secondary-action" type="button" onClick={onOpenPlanting}>
          씨앗 심으러 가기
        </button>
      )}
    </section>
  )
}

type PlantStorageViewProps = Readonly<{
  state: GameState
  activeTab: StorageTab
  previewPlantId: PreviewPlantId
  pending: boolean
  errorMessage: string | null
  onBack: () => void
  onTabChange: (tab: StorageTab) => void
  onPreviewChange: (plantId: PreviewPlantId) => void
  onApply: () => void
  onOpenPlanting: () => void
}>

export function PlantStorageView({
  state,
  activeTab,
  previewPlantId,
  pending,
  errorMessage,
  onBack,
  onTabChange,
  onPreviewChange,
  onApply,
  onOpenPlanting,
}: PlantStorageViewProps) {
  const model = createPlantStorageViewModel(state, previewPlantId)
  const equipmentChanged = hasPendingEquipmentChange(
    model.currentPlantId,
    model.previewPlantId,
  )

  return (
    <main className="plant-storage" data-screen="s04-plant-storage">
      <header className="plant-storage__header">
        <button
          className="plant-storage__back"
          type="button"
          aria-label="홈으로 돌아가기"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div>
          <p>천천히 모은 작은 정원</p>
          <h1>식물 보관함</h1>
        </div>
      </header>

      <div className="plant-storage__tabs" role="tablist" aria-label="보관함 종류">
        <button
          id="plants-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'plants'}
          aria-controls="plants-panel"
          onClick={() => onTabChange('plants')}
        >
          식물
          <span>{model.completedPlantCount}</span>
        </button>
        <button
          id="seeds-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'seeds'}
          aria-controls="seeds-panel"
          onClick={() => onTabChange('seeds')}
        >
          씨앗
          <span>{model.seedCount}</span>
        </button>
      </div>

      {activeTab === 'plants' ? (
        <div
          className={
            model.completedPlantCount === 0
              ? 'plant-storage__panel'
              : 'plant-storage__panel plant-storage__panel--with-apply'
          }
          id="plants-panel"
          key="plants"
          role="tabpanel"
          aria-labelledby="plants-tab"
        >
          {model.completedPlantCount === 0 ? (
            <EmptyState kind="plants" onOpenPlanting={onOpenPlanting} />
          ) : (
            <>
              <Preview
                rockId={state.rock.id}
                rockName={state.rock.name}
                plantId={model.previewPlantId}
              />

              <section className="plant-storage__collection" aria-labelledby="plant-list-title">
                <div className="plant-storage__section-heading">
                  <div>
                    <p>완전히 자란 식물만 보여요</p>
                    <h2 id="plant-list-title">내 식물</h2>
                  </div>
                  <span>{model.completedPlantCount} / {PLANT_CATALOG.length}</span>
                </div>

                <div className="plant-storage__grid">
                  <button
                    type="button"
                    className="plant-card plant-card--none"
                    data-selected={model.previewPlantId === null}
                    data-equipped={model.currentPlantId === null}
                    aria-pressed={model.previewPlantId === null}
                    onClick={() => onPreviewChange(null)}
                  >
                    <span className="plant-card__visual plant-card__visual--none" aria-hidden="true">
                      <StorageRockVisual rockId={state.rock.id} />
                    </span>
                    <span className="plant-card__name">없음</span>
                    {model.currentPlantId === null && (
                      <span className="plant-card__badge">현재</span>
                    )}
                  </button>

                  {model.plantItems.map((item) =>
                    item.owned ? (
                      <button
                        key={item.id}
                        type="button"
                        className="plant-card"
                        data-selected={item.selected}
                        data-equipped={item.equipped}
                        aria-pressed={item.selected}
                        onClick={() => onPreviewChange(item.id)}
                      >
                        <span className="plant-card__visual">
                          <StoragePlantVisual plantId={item.id} />
                        </span>
                        <span className="plant-card__name">{item.displayName}</span>
                        {item.equipped && <span className="plant-card__badge">현재</span>}
                      </button>
                    ) : (
                      <div
                        key={item.id}
                        className="plant-card plant-card--locked"
                        aria-label="아직 만나지 못한 식물"
                      >
                        <span className="plant-card__visual" aria-hidden="true">
                          <span className="plant-card__mystery">?</span>
                        </span>
                        <span className="plant-card__name">미획득</span>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <footer className="plant-storage__apply">
                <div>
                  <p>미리보기 선택</p>
                  <strong>{plantName(model.previewPlantId)}</strong>
                </div>
                <button
                  type="button"
                  disabled={!equipmentChanged || pending}
                  onClick={onApply}
                >
                  {pending ? '적용 중…' : '머리에 심기'}
                </button>
              </footer>
            </>
          )}
        </div>
      ) : (
        <div
          className="plant-storage__panel"
          id="seeds-panel"
          key="seeds"
          role="tabpanel"
          aria-labelledby="seeds-tab"
        >
          {model.seedCount === 0 ? (
            <EmptyState kind="seeds" onOpenPlanting={onOpenPlanting} />
          ) : (
            <section className="plant-storage__seeds" aria-labelledby="seed-list-title">
              <div className="plant-storage__section-heading">
                <div>
                  <p>다음 작은 기다림</p>
                  <h2 id="seed-list-title">보유 씨앗</h2>
                </div>
              </div>
              <article className="seed-card">
                <div className="seed-card__visual" aria-hidden="true">
                  <span className="storage-seed-icon" />
                  <span className="seed-card__spark seed-card__spark--one" />
                  <span className="seed-card__spark seed-card__spark--two" />
                </div>
                <div className="seed-card__content">
                  <p>한 종류로 차곡차곡 모여 있어요</p>
                  <h2>기본 씨앗</h2>
                  <strong aria-label={`기본 씨앗 ${model.seedCount}개`}>×{model.seedCount}</strong>
                </div>
                <button type="button" onClick={onOpenPlanting}>
                  심기
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            </section>
          )}
        </div>
      )}

      {errorMessage !== null && (
        <p className="plant-storage__error" role="alert">
          {errorMessage}
        </p>
      )}
    </main>
  )
}

export function PlantStorageScreen() {
  const { gameState } = useGameQueries()
  const actions = useGameActions()
  const navigation = useAppNavigation()
  const initialPlantId = gameState === null ? null : getEquippedPlantId(gameState)
  const [activeTab, setActiveTab] = useState<StorageTab>('plants')
  const [previewPlantId, setPreviewPlantId] = useState<PreviewPlantId>(initialPlantId)
  const [pending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (gameState === null) {
    return (
      <main className="plant-storage plant-storage--unavailable" data-screen="s04-plant-storage">
        <p role="alert">돌을 데려온 뒤 식물 보관함을 사용할 수 있어요.</p>
      </main>
    )
  }

  const navigate = (command: 'backHome' | 'openPlanting') => {
    setErrorMessage(null)
    if (!navigation.navigate(command)) {
      setErrorMessage('화면을 이동하지 못했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  const applyPreview = async () => {
    const currentPlantId = getEquippedPlantId(gameState)
    if (!hasPendingEquipmentChange(currentPlantId, previewPlantId)) {
      return
    }

    setPending(true)
    setErrorMessage(null)
    const result =
      previewPlantId === null
        ? await actions.unequipPlant()
        : await actions.equipPlant(previewPlantId)

    if (!result.ok) {
      setPending(false)
      setErrorMessage('선택한 식물을 적용하지 못했어요. 다시 시도해주세요.')
    }
  }

  return (
    <PlantStorageView
      state={gameState}
      activeTab={activeTab}
      previewPlantId={previewPlantId}
      pending={pending}
      errorMessage={errorMessage}
      onBack={() => navigate('backHome')}
      onTabChange={setActiveTab}
      onPreviewChange={setPreviewPlantId}
      onApply={() => void applyPreview()}
      onOpenPlanting={() => navigate('openPlanting')}
    />
  )
}
