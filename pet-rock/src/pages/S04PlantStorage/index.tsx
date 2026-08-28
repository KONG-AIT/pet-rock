import { useState } from 'react'

import { useAppNavigation, useGameActions, useGameQueries } from '../../app/index'
import { StoragePlantVisual, StorageRockVisual } from '../../components/visuals'
import { PLANT_CATALOG, type GameState } from '../../domain'
import {
  createPlantStorageViewModel,
  getEquippedPlantId,
  hasPendingEquipmentChange,
  type PreviewPlantId,
} from './model'
import './styles.css'

function plantName(plantId: PreviewPlantId): string {
  if (plantId === null) {
    return '식물 없음'
  }

  return PLANT_CATALOG.find((plant) => plant.id === plantId)?.displayName ?? '식물'
}

function EmptyState({
  onOpenPlanting,
}: Readonly<{
  onOpenPlanting: () => void
}>) {
  return (
    <section className="storage-empty" aria-label="식물 빈 상태">
      <div className="storage-empty__illustration" aria-hidden="true">
        <StorageRockVisual rockId="rock-01" />
      </div>
      <h2>아직 보관함이 비어 있어요</h2>
      <p>씨앗을 심고 천천히 식물을 키워보세요.</p>
      <button className="storage-secondary-action" type="button" onClick={onOpenPlanting}>
        씨앗 심으러 가기
      </button>
    </section>
  )
}

type PlantStorageViewProps = Readonly<{
  state: GameState
  previewPlantId: PreviewPlantId
  pending: boolean
  errorMessage: string | null
  onBack: () => void
  onPreviewChange: (plantId: PreviewPlantId) => void
  onApply: () => void
  onOpenPlanting: () => void
}>

export function PlantStorageView({
  state,
  previewPlantId,
  pending,
  errorMessage,
  onBack,
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
        <h1>식물 보관함</h1>
      </header>

      <div
        className={
          model.completedPlantCount === 0
            ? 'plant-storage__panel'
            : 'plant-storage__panel plant-storage__panel--with-apply'
        }
      >
        {model.completedPlantCount === 0 ? (
          <EmptyState onOpenPlanting={onOpenPlanting} />
        ) : (
          <>
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
                    <span className="plant-card__equipped-badge">장착 중</span>
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
                      {item.equipped && (
                        <span className="plant-card__equipped-badge">장착 중</span>
                      )}
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
      previewPlantId={previewPlantId}
      pending={pending}
      errorMessage={errorMessage}
      onBack={() => navigate('backHome')}
      onPreviewChange={setPreviewPlantId}
      onApply={() => void applyPreview()}
      onOpenPlanting={() => navigate('openPlanting')}
    />
  )
}
