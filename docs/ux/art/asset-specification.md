# Vertical Slice Asset Specification

## 문서 목적

이 문서는 [Art Direction](./art-direction.md)을 초기 Vertical Slice의 실제 에셋 제작과 구현에 연결하는 계약이에요.

아트 에셋 제작자는 이 문서로 제작 범위, canvas와 납품 조건을 확인하고, 구현 작업자는 같은 에셋을 화면별로 어떻게 배치하고 조합할지 판단합니다.

이 문서는 Art Direction을 변경하지 않아요. 화면의 역할과 상태는 [Screens](../screens.md), 화면 간 이동은 [Flows](../flows.md), 레이아웃과 시각적 우선순위는 [Wireframes](../wireframes/wireframes.md), viewport 동작은 [Responsive Layout Contract](../responsive-layout.md)를 기준으로 합니다.

## 결정 상태

이 문서에서는 항목의 상태를 다음처럼 구분해요.

| 상태 | 의미 |
| --- | --- |
| 확정 | 기존 제품, UX, 도메인 또는 Art Direction에서 이미 정한 계약 |
| 권장 | 현재 구현과 표시 크기를 기준으로 Vertical Slice에 적용할 기본값 |
| Vertical Slice 제작 전 결정 필요 | 제작을 시작하려면 담당자가 선택해야 하는 값 |
| Vertical Slice 제작 과정에서 결정 | 시안이나 실제 원본을 확인해야 선택할 수 있으며 제작 시작을 막지는 않는 값 |
| Vertical Slice 적용 후 검증 | 실제 Apps in Toss WebView에서 품질과 비용을 확인한 뒤 고정할 값 |

권장값은 근거 없이 영구 규칙으로 고정하지 않아요. 실제 에셋이 현재 화면에 적용된 뒤 선명도, 용량, crop과 조합 안정성을 확인하고 유지하거나 조정합니다.

---

# 1. 범위

## 포함하는 에셋

* `rock-01`
* `growth-planted`
* `growth-growing`
* `plant-01-final`
* `seed-basic`
* `pot-basic`
* `home-background`
* `weather-rain-layer`

이 목록은 최종 runtime 제작 단위예요. `rock-01~03` 비교 시안은 rock family의 visual reference를 만들기 위한 원본 제작 자료이며 runtime inventory에는 포함하지 않습니다.

## 검증하는 장면과 Interaction

* S01의 `rock-01` 목록과 선택 Overlay
* S02 기본 Home과 비 오는 Home
* 돌 터치
* S03 씨앗 심기
* S03 `planted → growing → grown` 상태 전환
* S03 성장 완료
* 완성 식물의 머리 장착
* S04 식물 card와 돌이 필요한 상태

## 범위 밖

* `rock-02`, `rock-03`의 최종 에셋
* `plant-02`, `plant-03`과 다른 식물의 최종 에셋
* 맑음 외의 시간대와 비 외의 날씨 에셋
* 사운드
* frame animation용 연속 이미지
* 새로운 화면, 상태 또는 Interaction

범위 밖 ID는 현재 임시 visual을 유지해요. Vertical Slice의 최종 에셋이 일부 ID에만 존재해도 기존 화면이 깨지지 않아야 합니다.

---

# 2. 현재 구현에서 확인한 계약

## Domain

현재 도메인은 다음 식별자와 성장 상태를 사용해요.

```text
RockId: rock-01 | rock-02 | rock-03
PlantId: plant-01 | plant-02 | plant-03
SeedType: basic
GrowthStage: planted | growing | grown
```

`PLANT_CATALOG`은 `PlantId`, 표시 이름과 `assetKey`를 분리합니다. `plant-01`의 현재 `assetKey`도 `plant-01`이에요.

완성 전의 `GrowthView`는 `PlantId`를 노출하지 않습니다. 따라서 `planted`, `growing` visual은 최종 식물의 정체를 직접 드러내지 않아야 해요. `grown`이 되면 처음 `PlantId`와 완성 식물을 공개합니다.

## Rock 모티프

`RockId`는 다음 실제 돌 종류를 모티프로 사용해요.

| RockId | 모티프 | 제작 의도 |
| --- | --- | --- |
| `rock-01` | 강자갈 | 둥글고 안정적인 실루엣, 따뜻한 회색 또는 베이지 계열, 절제된 작은 점무늬 |
| `rock-02` | 화강암 | 각과 면이 느껴지는 불규칙한 실루엣, 밝은 warm gray 계열, 단순화한 광물 점 |
| `rock-03` | 현무암 | 단단하고 묵직한 실루엣, dark gray 계열, 제한된 작은 기공 또는 점 형태 |

이 mapping은 확정이에요. 실제 돌을 사실적으로 복제하지 않고 종이 콜라주와 단순화된 손그림 질감으로 번역합니다. 얼굴은 최소한으로 유지하고, 세 돌은 실루엣, 색감, 질감과 점무늬를 중심으로 구분해요.

`rock-01~03` 비교 시안은 최종 에셋 제작의 visual reference예요. 비교 시안에서 세 돌의 차이를 먼저 확인하되, Vertical Slice runtime export는 `rock-01`만 제작합니다.

## 현재 표시 크기

현재 CSS와 SVG `viewBox`를 기준으로 한 주요 표시 범위는 다음과 같아요. 에셋 export 크기는 이 값보다 충분한 pixel density를 제공해야 합니다.

| 위치 | 현재 표시 계약 |
| --- | --- |
| S01 돌 목록 | 320px viewport에서 돌 canvas가 약 `75px` 폭까지 작아질 수 있고, 넓은 화면에서는 약 `170px`까지 커져요. |
| S01 선택 Overlay | 기본 `min(64vw, 250px)`, 높이 720px 이하에서는 `min(47vw, 190px)`를 사용해요. |
| S02 Home | 기본 `min(78vw, 460px)`, 높이 620px 이하에서는 `min(64vw, 340px)`를 사용해요. 현재 canvas 비율은 `310:250`입니다. |
| S03 화분 | visual 영역은 최대 높이 `330px`, 화분은 최대 폭 `300px`예요. |
| S03 성장 완료 | visual 영역은 최대 높이 `350px`, 현재 완성 식물과 화분의 합성 canvas는 최대 폭 `310px`예요. |
| S04 식물 card | visual 영역 높이는 `72px`, 현재 식물은 약 `53×57px`로 표시돼요. |
| S04 작은 돌 | `없음` card에서 약 `62×43px`, 빈 상태에서 약 `82×57px`로 표시돼요. |

이 크기는 현재 레이아웃을 바꾸기 위한 목표가 아니라, runtime export의 최소 해상도와 작은 크기에서의 형태 검수 기준이에요.

## 현재 Visual 구현

현재 `RockVisual.tsx`, `PlantVisual.tsx`와 화면별 CSS가 SVG/CSS placeholder를 렌더링해요.

* 돌은 S01, S02와 S04에서 서로 다른 SVG path 또는 CSS shape을 사용해요.
* 완성 식물도 Home, S03와 S04에서 서로 다른 형태로 그려져요.
* S03의 화분과 성장 상태는 하나의 SVG 안에서 조합돼요.
* S02 배경과 시간 변화는 CSS gradient와 작은 CSS 요소로 표현돼요.

현재 placeholder의 형태와 색은 강자갈, 화강암과 현무암 mapping을 기준으로 제작된 최종 visual이 아니에요. Vertical Slice 적용 시 `rock-01`부터 강자갈 모티프의 canonical asset으로 교체합니다.

Vertical Slice 적용 단계에서는 이 구조를 한 번에 폐기하지 않아요. 최종 에셋이 준비된 `rock-01`과 `plant-01`만 visual catalog를 통해 canonical asset으로 교체하고, 나머지 ID는 기존 placeholder를 fallback으로 유지하는 방향을 사용합니다.

---

# 3. 공통 에셋 제작 규칙

## Runtime 파일 형식

### 확정

Vertical Slice의 기본 runtime 형식은 **lossless WebP**를 사용해요. 투명한 게임 오브젝트와 날씨 오브젝트뿐 아니라 최초 Home 배경도 같은 기준으로 export합니다.

최초 Vertical Slice export에서는 모든 대상에 같은 canvas의 PNG 비교본을 한 번 함께 만들어요. PNG 비교본은 앱이 사용하는 runtime asset이나 상시 병행 납품물이 아니라 실제 Apps in Toss 환경에서 형식을 검증하기 위한 비교 자료예요.

SVG는 UI icon과 코드로 관리하는 단순 도형에는 계속 사용할 수 있지만, 종이 질감과 손그림 느낌을 가진 이번 Game Asset의 기본 납품 형식으로 사용하지 않아요.

### Vertical Slice 적용 후 검증

동일한 canvas의 lossless WebP와 PNG를 실제 Apps in Toss WebView에서 비교해요.

* alpha edge에 검거나 흰 halo가 생기지 않는지
* 종이 질감이 손상되지 않는지
* 작은 card와 Home에서 축소 품질이 유지되는지
* 첫 화면 로딩과 route 이동에서 decode 또는 render 문제가 없는지
* 두 형식의 파일 크기 차이가 어느 정도인지

문제가 없으면 이후 runtime asset도 lossless WebP를 기본으로 사용하고 PNG 비교본 제작은 반복하지 않아요. 문제가 확인되면 해당 증상과 범위를 기준으로 PNG 사용 여부를 다시 결정합니다.

## 원본과 Runtime export

### 확정

편집 가능한 원본 아트 파일과 앱 runtime asset은 분리해서 관리해요.

* 앱은 flatten한 runtime export만 사용해요.
* 원본 파일을 `src/assets`에서 직접 import하지 않아요.
* runtime export는 `pet-rock/src/assets/game/` 아래에서 관리해요.
* 원본은 앱 runtime 디렉터리 밖에서 관리해요.

### 권장

* 원본은 runtime export의 최소 2배 크기로 유지해요.
* 원본의 돌, 식물, 화분, 배경과 날씨 요소는 서로 분리된 layer로 관리해요.
* runtime export와 metadata는 같은 revision에서 함께 갱신해요.
* export 후 canvas를 자동 trim하지 않아요. trim은 anchor와 bounds 좌표를 바꾸기 때문이에요.

원본 제작 도구, 편집 가능한 파일 형식과 첫 작업 위치는 시안 제작 전에 정해요. 장기 저장 위치와 Git LFS 사용 여부는 실제 원본 파일 크기와 제작 도구를 확인한 뒤 판단하며, 이번 단계의 필수 계약으로 두지 않습니다.

## Canvas와 Pixel density

### 권장

* 모든 오브젝트는 고정된 canonical canvas에서 제작해요.
* runtime export 한 장이 현재 최대 CSS 표시 크기에서 약 `2x` 이상의 pixel density를 제공하도록 해요.
* 화면별 `@2x`, `@3x` 복제 파일은 만들지 않고 하나의 runtime export를 CSS로 축소해 사용해요.
* 작은 card에서만 쓰는 별도 축소본은 만들지 않아요.

`3x` 기기에서도 Art Direction의 약한 종이 질감이 충분히 보이는지는 실제 기기에서 확인해요. 흐림이 보일 때만 더 큰 단일 export 또는 density variant를 검토합니다.

## Transparent background

* 돌, 식물, 성장 상태, 씨앗, 화분과 구름은 transparent background를 사용해요.
* Home 배경만 전체 canvas를 채우는 불투명 이미지로 만들 수 있어요.
* 투명 오브젝트의 바깥 여백은 anchor와 motion에 필요한 만큼만 유지해요.
* 그림자, 선택 상태, 날씨 효과와 UI를 오브젝트 alpha 안에 미리 합치지 않아요.

## Color space

모든 runtime export는 `sRGB`를 사용해요. 다른 wide-gamut profile에 의존하지 않고, export 시 profile 차이로 색이 달라지지 않는지 확인합니다.

## Home Art Palette와 OS Theme

### 확정

Home의 raster background와 game object는 OS theme과 무관하게 [Art Direction](./art-direction.md)의 고정 Art Palette를 사용해요.

* OS `prefers-color-scheme: dark`를 게임 배경 아트의 palette 변경 기준으로 사용하지 않아요.
* 어두운 분위기와 야간 표현은 향후 `밤` 시간 layer로 구성해요.
* OS theme 때문에 별도 dark Home 배경이나 dark game object를 만들지 않아요.
* UI의 dark mode 대응 여부는 이 Game Asset 계약과 분리해서 결정해요.

현재 Home 구현에는 `prefers-color-scheme: dark`에 따라 CSS 배경색을 바꾸는 규칙이 있어요. 이는 고정 Art Palette 계약과 다른 현재 구현이므로, 향후 Vertical Slice를 적용할 때 게임 배경 아트에는 적용되지 않도록 정리해야 합니다.

## Naming

파일명은 소문자 kebab-case를 사용해요.

```text
<domain-or-visual-id>-<state>.<extension>
```

예:

```text
rock-01.webp
plant-01-final.webp
growth-planted.webp
growth-growing.webp
seed-basic.webp
pot-basic.webp
home-background.webp
weather-rain-layer.webp
```

`rock-01-home`, `rock-01-selection`, `plant-01-storage`처럼 사용 화면을 파일명에 넣은 복제 에셋은 만들지 않아요.

## Runtime directory

### 확정

```text
pet-rock/src/assets/game/
├── backgrounds/
│   └── home-background.webp
├── garden/
│   ├── growth-growing.webp
│   ├── growth-planted.webp
│   ├── pot-basic.webp
│   └── seed-basic.webp
├── plants/
│   └── plant-01-final.webp
├── rocks/
│   └── rock-01.webp
└── weather/
    └── rain/
        └── weather-rain-layer.webp
```

폴더는 화면이 아니라 에셋의 역할을 기준으로 나눠요. Home과 S04에서 쓰는 `plant-01-final.webp`도 `plants/`에 한 번만 존재합니다.

최초 검증용 PNG 비교본은 이 runtime inventory에 상시 포함하거나 앱에서 import하지 않아요. WebP 검증이 끝나면 반복 제작하지 않으며, 비교 결과와 보존 필요성에 따라 원본 쪽 검증 자료로 관리합니다.

## Optimization

* export에 포함된 불필요한 metadata와 color profile을 제거해요.
* 눈에 보이는 품질을 먼저 확인하고 그다음 압축률을 조정해요.
* 투명 canvas를 임의로 trim하거나 object별 padding을 서로 다르게 최적화하지 않아요.
* 동일한 그림을 여러 크기로 앱 bundle에 넣지 않아요.
* 배경은 오브젝트보다 큰 파일을 허용하되, 날씨가 포함된 전체 배경 복제는 만들지 않아요.
* 파일별 크기 제한은 실제 decode와 bundle 측정 전에는 고정하지 않아요.

---

# 4. Asset Inventory

표의 canvas는 runtime export 기준 권장값이에요. 표시 크기는 현재 CSS에서 확인한 범위이며, 최종 layout을 새로 정의하지 않습니다.

| Asset ID / 파일명 | 역할 | 사용 화면과 재사용 | 형식 / canvas | 예상 표시 크기 | Alpha | Anchor | Animation과 코드 책임 | 우선순위 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `rock-01` / `rock-01.webp` | 강자갈 모티프의 canonical 돌 본체 | S01 목록·Overlay, S02 Home, S04 작은 돌과 문서상 Preview | lossless WebP, `960×768` (`5:4`) | 약 `62~460px` 폭 | 사용 | `groundY`, `plantAnchor`, `visibleBounds` | 이미지는 단순화한 강자갈 형태, 색감과 종이 질감만 담당. touch, scale, rotate, shadow는 코드 | P0 |
| `plant-01-final` / `plant-01-final.webp` | 공개 완료 후 사용하는 canonical 식물 | S03 완료, S02 장착, S04 card와 문서상 Preview | lossless WebP, `512×768` (`2:3`) | card 약 `53×57px`, Home·완료에서는 context에 맞춰 확대 | 사용 | `stemAnchor`, `visibleBounds` | 이미지는 완성 형태만 담당. sway, attach, reveal은 코드 | P0 |
| `growth-planted` / `growth-planted.webp` | 심은 직후의 비식별 성장 상태 | S03 `planted` | lossless WebP, `512×512` | 화분 위 영역에서 최대 약 `180px` 폭 이내 | 사용 | `stemAnchor`, `visibleBounds` | 단계 진입과 작은 opacity/translate는 코드 | P0 |
| `growth-growing` / `growth-growing.webp` | 중간 비식별 성장 상태 | S03 `growing` | lossless WebP, `512×512` | 화분 위 영역에서 최대 약 `180px` 폭 이내 | 사용 | `stemAnchor`, `visibleBounds` | 단계 전환과 약한 sway는 코드 | P0 |
| `seed-basic` / `seed-basic.webp` | 기본 씨앗 | S03 보유 수량 icon, 심기 전 visual과 심기 motion | lossless WebP, `128×128` (`1:1`) | 약 `31~38px` | 사용 | motion용 `center`만 사용 | 화분으로 이동, rotate와 opacity는 코드 | P0 |
| `pot-basic` / `pot-basic.webp` | 성장 공간인 canonical 기본 화분 | S03 empty, planted, growing, completed | lossless WebP, `600×600` (`1:1`) | 최대 약 `300×300px` | 사용 | `plantAnchor`, `visibleBounds` | 화분은 정적. 접지 shadow와 상태 transition은 코드 | P0 |
| `home-background` / `home-background.webp` | 날씨와 시간의 공통 Home 무대 | S02 기본 Home과 모든 환경 상태의 기반 | lossless WebP, `1080×2160` (`1:2`) | viewport 전체에 `cover` | 불투명 권장 | 없음. crop-safe 영역 문서화 | 위치 고정. 화면 비율 대응은 CSS `cover`와 base color | P0 |
| `weather-rain-layer` / `weather-rain-layer.webp` | 비 환경 layer의 정적 종이 구름 | S02 비 Home, 향후 다른 비 조합 | lossless WebP, `1024×512` (`2:1`) | viewport 폭의 약 `55~90%` 안에서 검증 | 사용 | `visibleBounds` | 정적 구름만 포함. 배치와 약한 opacity는 코드이고 빗방울은 코드로 별도 표현 | P1 |

## 이미지 파일을 만들지 않는 요소

다음 요소는 Vertical Slice에서 별도 raster asset으로 만들지 않아요.

| 요소 | 처리 방식 |
| --- | --- |
| 돌 접지 그림자 | CSS ellipse 또는 pseudo-element의 `opacity`, `scale`, blur |
| 움직이는 빗방울 | 제한된 수의 DOM/CSS layer, `translate`와 `opacity` |
| 비 상태의 전체 색조 | 반투명 CSS overlay |
| 돌 touch 반응 | wrapper의 `transform` |
| 식물 후행 motion | 식물 wrapper의 지연된 `transform` |
| 성장 완료 강조 | 짧은 `opacity` / `scale`, 필요한 경우 제한된 코드 기반 작은 강조 |
| 선택·장착 상태 | S04 UI border, badge와 icon |
| UI icon과 text | 기존 UI layer |

## 화면별 합성 순서

같은 canonical asset을 화면별로 다시 그리지 않고 다음 순서로 조합해요. 선택 표시, 버튼과 문구는 모두 game object와 분리된 UI layer입니다.

### S01 돌 선택

```text
card 또는 Overlay 배경
→ 접지 그림자 (code)
→ rock-01
→ 선택 표시 또는 이름 입력 UI
```

목록과 Overlay는 같은 `rock-01.webp`를 사용하고 context별 scale만 바꿔요. 선택 테두리나 강조를 돌 이미지에 포함하지 않습니다.

### S02 Home

```text
CSS base color
→ home-background
→ 날씨 / 시간 tone과 정적 layer
→ background 환경 효과 (code)
→ 접지 그림자 (code)
→ rock-01
→ equipped plant
→ 필요한 foreground 환경 효과 (code)
→ 이름과 action UI
```

비 Home의 세부 순서는 [비 날씨 Layer](#9-비-날씨-layer)를 따라요. 기본 Home은 같은 구조에서 비 관련 layer만 제거합니다.

### S03 내 정원

```text
정원 배경과 접지 그림자 (code)
→ seed-basic 또는 growth state / final plant
→ pot-basic
→ 성장 완료 강조 (code, 필요한 경우)
→ 상태 문구와 action UI
```

씨앗 심기 motion 중에는 `seed-basic`이 `pot.plantAnchor` 쪽으로 이동한 뒤 사라지고 `growth-planted`로 교체돼요. 성장 상태와 완성 식물은 같은 anchor 규칙을 사용합니다.

### S04 식물 보관함

```text
card 또는 Preview 배경
→ 접지 그림자 (Preview에서 필요한 경우, code)
→ rock-01 (없음 card, 빈 상태 또는 Preview)
→ selected plant (plant card 또는 Preview)
→ 선택 / 장착 표시와 action UI
```

식물 card에서는 `plant-01-final`의 전체 visible bounds를 보여주고, 선택 테두리와 장착 badge를 이미지에 포함하지 않아요. 돌 Preview가 구현될 때는 Home과 같은 rock + plant anchor 조합을 사용합니다.

---

# 5. `rock-01` Contract

## 모티프와 제작 의도

### 확정

`rock-01`은 **강자갈**을 모티프로 해요. generic gray rock에 얼굴만 더한 형태가 아니라, 물에 닳은 듯 둥글고 안정적인 실루엣, 따뜻한 회색 또는 베이지 계열과 절제된 작은 점무늬로 개성을 만들어요.

실제 강자갈의 사진 질감을 그대로 사용하지 않아요. 형태와 표면 특징을 종이 콜라주와 단순화된 손그림 질감으로 번역하고, 작은 모바일 화면에서 먼저 읽히는 큰 형태를 우선합니다.

얼굴은 작은 점 형태의 눈처럼 최소한으로 사용해요. `rock-01`의 정체성과 `rock-02`, `rock-03`과의 차이를 얼굴 모양이나 표정으로 만들지 않습니다.

## 비교 시안

[`rock-01~03` 비교 시안](./rocks/rock-design-guide.png)은 다음을 확인하는 제작 reference예요.

* `rock-01`이 강자갈, `rock-02`가 화강암, `rock-03`이 현무암 모티프로 구분되는지
* 세 돌이 서로 다르지만 같은 종이 콜라주 세계의 family로 보이는지
* 얼굴을 가려도 실루엣, 색감, 질감과 점무늬로 구분되는지
* 약 `75px` 폭에서도 각 모티프의 큰 특징이 유지되는지

비교 시안은 최종 runtime 파일이 아니에요. Vertical Slice에서는 비교 결과를 반영한 `rock-01.webp` 한 장만 canonical runtime asset으로 export합니다.

## Canvas와 Bounds

### 권장

* runtime canvas: `960×768`, 비율 `5:4`
* canvas에는 돌 본체만 포함하고 식물과 접지 그림자는 포함하지 않아요.
* 돌의 visible bounds는 canvas 폭을 충분히 사용하되, rotate와 touch motion에서 잘리지 않을 여백을 남겨요.
* 바닥 접점은 visible bounds 하단과 가깝게 두고, 불필요하게 큰 아래쪽 투명 여백은 만들지 않아요.

`visibleBounds`, `groundY`와 `plantAnchor`의 최종 수치는 완성된 export에서 실제 alpha bounds와 머리 실루엣을 측정해 기록합니다.

## 바닥 기준선과 접지 그림자

`groundY`는 돌이 바닥에 닿는 수평 기준선이에요. Home과 S01에서 이 선을 장면의 바닥 위치에 맞춥니다.

접지 그림자는 `rock-01.webp`에 포함하지 않아요. 화면별로 같은 돌을 다른 크기로 배치하고 touch할 때 그림자가 독립적으로 반응할 수 있도록 코드가 담당합니다.

* 기본: 매우 약한 타원형 그림자
* 돌이 눌릴 때: 폭이 조금 넓어지고 opacity가 약하게 증가할 수 있어요.
* 돌이 들리거나 기울 때: 그림자는 본체와 함께 회전하지 않아요.

## 식물 장착 Anchor

`plantAnchor`는 식물 줄기가 돌 표면과 만나는 점이에요. 돌의 bounding box 중앙이 아니라 실제 머리 실루엣 위에 둡니다.

식물의 `stemAnchor`를 이 점에 맞추면 Home, S01 이후 화면과 S04 Preview에서 같은 조합을 만들 수 있어야 해요.

```text
rock.plantAnchor == plant.stemAnchor의 화면 좌표
```

장착 위치를 맞추기 위해 식물 그림 안에 돌 일부를 그리거나, 돌 그림 안에 특정 식물을 넣지 않아요.

## 화면별 Scale

한 파일을 context wrapper에서 비율을 유지해 축소하거나 확대해요.

| Context | Scale 원칙 |
| --- | --- |
| S01 목록 | card 안에 전체 visible bounds가 보이도록 `contain`. 약 `75px`에서도 눈과 실루엣을 구분할 수 있어야 해요. |
| S01 Overlay | 같은 canvas를 최대 `250px` 폭으로 확대. 별도 고해상도 이미지를 사용하지 않아요. |
| S02 Home | 같은 canvas를 현재 companion 폭 `205~460px` 안에서 사용하고 `groundY`를 장면 바닥에 맞춰요. |
| S04 card / 빈 상태 | 같은 canvas를 `62~82px` 폭으로 축소하고 crop하지 않아요. |
| S04 Preview | UX 문서의 Preview가 적용될 때 같은 canvas와 `plantAnchor`를 사용해 조합해요. |

작은 card에서는 종이 섬유 하나하나보다 실루엣, 눈과 큰 색면이 유지되어야 해요. 축소했을 때 사라지는 작은 점이나 선을 식별의 핵심으로 사용하지 않습니다.

## Touch Animation 책임

### Static Asset Responsibility

* 돌의 형태, 색, 약한 종이 질감
* 작은 점 형태의 눈처럼 고정된 얼굴 요소

### Motion Responsibility

* 돌 wrapper의 `scale`, `translate`와 작은 `rotate`
* 별도 접지 그림자의 `scale`과 `opacity`
* 장착 식물 wrapper의 약간 늦은 후행 반응

돌의 표정 frame이나 touch 전용 돌 이미지는 만들지 않아요.

---

# 6. `plant-01` Contract

## 디자인과 표시 이름

### 확정

`plant-01`은 Vertical Slice의 대표 식물 ID로 유지하지만 최종 형태와 표시 이름은 아직 확정하지 않아요. 실제 에셋 제작 과정에서 여러 시안을 비교한 뒤 디자인과 표시 이름을 함께 선택합니다.

현재 `PlantId`, `assetKey`와 성장 상태의 도메인 계약은 이 선택과 무관하게 유지해요. 시안별로 새로운 `PlantId`를 만들거나 `plant-01-variant-a` 같은 runtime asset을 catalog에 추가하지 않습니다. 선택되지 않은 시안은 최종 runtime inventory에 포함하지 않아요.

## 완성 식물 Canvas

### 권장

* runtime canvas: `512×768`, 비율 `2:3`
* 식물 전체가 같은 canvas 안에 들어오고 가장자리 motion 여백을 남겨요.
* 화분, 흙, 돌과 접지 그림자는 포함하지 않아요.
* 줄기의 뿌리 방향 끝점은 `stemAnchor`로 기록해요.

식물의 visible bounds는 가능한 한 tight하게 유지하되, 약한 rotate와 overshoot에서 잎이 잘리지 않을 여백을 둡니다.

## Anchor

`stemAnchor`는 식물이 다른 오브젝트에 붙는 유일한 기준점이에요.

* 돌에 장착할 때 `rock.plantAnchor`에 맞춰요.
* 화분에서 완성 식물을 보여줄 때 `pot.plantAnchor`에 맞춰요.
* S04 card에서는 anchor를 card 중앙 정렬의 기준으로 사용하되 전체 visible bounds가 보이도록 축소해요.

돌용 식물과 화분용 식물을 따로 그리지 않아요. context별 scale만 visual catalog에서 다르게 설정합니다.

## Context별 사용

| Context | 규칙 |
| --- | --- |
| S02 장착 | 돌과 별도 layer로 배치하고 `stemAnchor`를 `rock.plantAnchor`에 맞춰요. |
| S03 완료 | `stemAnchor`를 `pot.plantAnchor`에 맞춰 화분과 조합해요. 식물 형태가 완료 연출보다 먼저 보여야 해요. |
| S04 card | 전체 visible bounds를 `contain`하고 card 안에서 잘라내지 않아요. |
| S04 Preview | Home과 같은 canonical 조합을 사용하되 Preview context scale만 적용해요. |

## 성장 상태

### 확정

도메인에는 다음 세 단계가 있어요.

```text
planted
→ growing
→ grown
```

`grown`은 `plant-01-final.webp`를 사용합니다. `planted`와 `growing`은 최종 `PlantId`를 공개하지 않는 시각 상태가 필요해요.

Vertical Slice에서는 도메인의 두 비완성 상태에 각각 한 장을 대응시켜요.

```text
planted → growth-planted.webp
growing → growth-growing.webp
grown   → plant-01-final.webp
```

두 성장 에셋은 같은 `512×512` canvas와 같은 `stemAnchor` 규칙을 사용해 전환 시 layout shift가 없도록 합니다.

### Vertical Slice 적용 후 검증

대표 식물 하나를 적용한 뒤 다음을 결정해요.

* `planted`, `growing` 에셋을 이후 모든 식물이 공유할지
* 식물군별 공통 에셋이 필요한지
* 최종 정체를 숨기면서 식물별 성장 차이를 허용할지

이번 명세는 특정 잎이 순서대로 등장하는 형태나 `plant-01` 전용 성장 motion을 전체 식물의 규칙으로 만들지 않아요.

---

# 7. 씨앗, 화분과 성장 조합

## 기본 Layer 순서

현재 S03 SVG는 성장 오브젝트를 먼저 그리고 화분을 그 위에 배치해 줄기 하단이 화분 안에 들어간 것처럼 보여줘요. Vertical Slice에서도 같은 최소 구조를 유지합니다.

```text
접지 그림자 (code)
→ growth state 또는 final plant
→ pot-basic
→ 필요한 UI와 상태 문구
```

`pot-basic.webp`는 화분의 몸체, 테두리와 흙을 한 장에 포함할 수 있어요. 식물의 `stemAnchor`를 `pot.plantAnchor`에 맞춘 뒤 화분을 앞에 그려 줄기 하단을 가립니다.

## `pot-basic-back` / `pot-basic-front` 분리 여부

### 권장

Vertical Slice 시작 시에는 `pot-basic.webp` 한 장을 사용해요. 현재 조합은 식물 layer 위에 화분 전체를 올리는 것으로 표현할 수 있어, 제작과 metadata를 늘릴 이유가 없습니다.

### Vertical Slice 적용 후 검증

다음 문제가 실제로 보일 때만 `pot-basic-back.webp`와 `pot-basic-front.webp`로 분리해요.

* 줄기가 흙 위에 서 있는 것처럼 떠 보여요.
* 잎이나 줄기의 일부가 화분 뒤로 가야 하는데 한 장으로 표현할 수 없어요.
* 성장 상태마다 화분을 복제해야만 자연스러운 가림을 만들 수 있어요.

분리하더라도 두 파일은 같은 canvas와 `plantAnchor`를 공유하고, 성장 상태를 화분 이미지에 합치지 않아요.

## 씨앗 심기

씨앗은 화분과 별도 layer예요.

```text
seed-basic
→ code 기반 translate / rotate / opacity
→ pot.plantAnchor 부근에서 사라짐
→ planted 상태로 전환
```

화분에 들어간 씨앗을 별도 고정 이미지로 남겨야 할 필요는 없어요. `planted` 상태 에셋이 심기 결과를 전달합니다.

---

# 8. Home 배경 Contract

## 선택

### 권장

Vertical Slice에서는 정적인 종이 무대를 **하나의 기본 배경 이미지**로 제작하고, 날씨와 돌은 별도 layer로 조합해요.

배경의 작은 종이 조각을 모두 개별 runtime asset으로 나누지 않습니다. 현재 범위에서는 배치 관리와 요청 수가 늘고, 재사용 이득은 작아요.

```text
CSS base color
→ home-background.webp
→ 날씨 / 시간 layer
→ rock + equipped plant
→ 필요한 전경 효과
→ UI
```

## Canvas와 Crop

### 권장

* runtime canvas: `1080×2160`, 비율 `1:2`
* CSS `background-size: cover`에 해당하는 방식으로 viewport를 채워요.
* 중요한 장식은 중앙 crop-safe 영역 안에서도 돌과 경쟁하지 않도록 최소화해요.
* 좌우 또는 상하 일부가 잘려도 장면의 의미가 달라지지 않아야 해요.
* 돌, 식물, 화분, 비 구름과 UI는 배경에 포함하지 않아요.

현재 대표 viewport의 비율이 `320×568`부터 `412×915`까지 달라요. 따라서 배경 가장자리에 의미 있는 소품이나 정확히 맞아야 하는 프레임을 두지 않습니다.

### Vertical Slice 적용 후 검증

* `320×568`에서 상하 crop 후에도 바닥이 자연스러운지
* `412×915`에서 좌우 crop 후에도 콜라주 면이 어색하지 않은지
* `756×1465` 보고 비율에서 `1080px` 폭이 충분히 선명한지
* Home 이름과 action menu 뒤에서 대비가 유지되는지

## Home에서 금지하는 합성

* 화분을 배경에 넣지 않아요.
* 돌이나 장착 식물을 배경에 넣지 않아요.
* 비가 포함된 별도 전체 Home 배경을 만들지 않아요.
* 강한 전경 장식으로 돌의 바닥 기준선이나 실루엣을 가리지 않아요.

---

# 9. 비 날씨 Layer

## 이미지 에셋 책임

`weather-rain-layer.webp`는 비 환경 layer 가운데 종이 콜라주 질감이 필요한 정적 구름만 포함해요. 파일명이 전체 rain layer를 가리키더라도 움직이는 빗방울은 이미지에 포함하지 않습니다.

* 투명 배경을 사용해 기본 Home 배경과 분리해요.
* 구름 안에 빗방울을 대량으로 그리지 않아요.
* 구름의 대비와 크기는 돌보다 먼저 보이지 않도록 제한해요.
* 다른 날씨 layer와 같은 환경 slot에 배치할 수 있어야 해요.

## 코드 책임

* 전체 장면의 약한 채도 또는 밝기 조절
* 제한된 수의 빗방울
* 빗방울의 `opacity`와 `translateY`
* 반복 주기와 시작 지점의 작은 차이
* reduced motion에서 빗방울 animation 제거

빗방울을 위한 frame 이미지나 비가 포함된 돌·식물 이미지는 만들지 않아요.

## Home Layer 순서

```text
0. CSS base color
1. home-background
2. rain tone overlay (code)
3. weather-rain-layer
4. background rain (code, sparse)
5. rock contact shadow (code)
6. rock
7. equipped plant
8. foreground rain (code, 필요할 때만 매우 제한적으로)
9. UI
```

foreground rain이 돌의 얼굴이나 식물의 핵심 실루엣을 계속 가리지 않게 해요. 비를 제거하면 같은 `home-background`, `rock-01`과 `plant-01-final`이 그대로 기본 Home을 구성해야 합니다.

---

# 10. Anchor와 Bounds Contract

## 좌표 방식

### 확정

metadata 좌표는 전체 runtime canvas의 좌상단을 `(0, 0)`, 우하단을 `(1, 1)`로 하는 **normalized coordinate**를 사용해요.

```text
x = pixelX / canvasWidth
y = pixelY / canvasHeight
```

normalized coordinate를 선택하는 이유는 다음과 같아요.

* source와 runtime export 해상도가 달라도 같은 metadata를 사용할 수 있어요.
* 화면별 CSS 크기와 device pixel ratio에 독립적이에요.
* 한 에셋을 S01, S02, S03와 S04에서 같은 계약으로 배치할 수 있어요.

percentage 문자열은 계산과 validation이 불편하므로 저장 형식으로 사용하지 않아요. 원본 pixel 좌표는 제작 도구에서 측정할 수 있지만 runtime contract에는 normalized 값으로 변환합니다.

## 최소 Metadata

```text
Point = { x: 0..1, y: 0..1 }
Bounds = { x: 0..1, y: 0..1, width: 0..1, height: 0..1 }

rock
- visibleBounds
- groundY
- plantAnchor

plant / growth
- visibleBounds
- stemAnchor

pot
- visibleBounds
- plantAnchor
```

`canvasWidth`, `canvasHeight`는 asset validation과 제작 handoff에는 기록하지만 runtime 배치 계산의 기준은 normalized metadata예요.

씨앗은 중심 기준 transform만 사용하므로 별도 visual metadata를 만들지 않아도 됩니다. 배경은 object anchor 대신 crop-safe 영역을 제작 문서에 기록해요.

## 조합 규칙

### Rock + Plant

```text
1. context에 맞는 rock와 plant CSS 크기를 정함
2. rock.plantAnchor의 화면 좌표를 계산
3. plant.stemAnchor가 같은 화면 좌표에 오도록 plant를 이동
4. plant를 rock보다 위 layer에 그림
```

### Pot + Growth 또는 Final Plant

```text
1. pot의 화면 크기와 위치를 정함
2. pot.plantAnchor의 화면 좌표를 계산
3. growth.stemAnchor 또는 plant.stemAnchor를 같은 좌표에 맞춤
4. growth / plant를 그리고 pot을 앞에 그림
```

### Transform origin

* 돌 touch의 기본 transform origin은 `groundY` 부근의 가로 중심이에요.
* 식물 sway와 attach의 transform origin은 `stemAnchor`예요.
* 화분은 자체 visible bounds의 하단 중앙을 기준으로 settle할 수 있어요.

## Validation

metadata는 수동 입력 후 다음을 확인해야 해요.

* 모든 값이 `0..1` 범위에 있는지
* `visibleBounds`가 실제 alpha 영역을 포함하는지
* anchor가 투명한 임의 지점이 아니라 실제 접합 위치인지
* export를 다시 만들었을 때 canvas와 metadata가 함께 갱신되었는지

---

# 11. Visual Catalog와 코드 경계

## Domain 책임

Domain은 다음 정보만 소유해요.

* `RockId`, `PlantId`, `SeedType`
* 저장되는 돌, 보유 식물과 장착 상태
* 성장 상태와 시간 규칙
* 식물 표시 이름과 현재 `assetKey`

runtime 파일 경로, canvas, bounds, anchor와 화면별 scale을 `GameState`에 넣지 않아요.

## Visual 책임

Visual layer는 다음을 소유해요.

* domain ID 또는 `assetKey`에서 runtime asset을 찾는 mapping
* `visibleBounds`, `groundY`, `plantAnchor`, `stemAnchor`
* context별 scale과 최대 크기
* final asset 존재 여부와 fallback resolver
* asset load 실패 처리

## 권장 구조 개념

구현 시 현재 `components/visuals` 경계 안에 작은 visual catalog를 두는 방향이 적합해요.

```text
domain ID / assetKey
→ visual catalog lookup
→ final visual spec 또는 fallback key
→ shared visual renderer
```

개념적인 항목은 다음 정도면 충분해요.

```text
RockVisualSpec
- src
- visibleBounds
- groundY
- plantAnchor
- contextScale
- fallback

PlantVisualSpec
- src
- visibleBounds
- stemAnchor
- contextScale
- fallback
```

현재 `PLANT_CATALOG.assetKey`는 그대로 visual catalog lookup key로 사용할 수 있어요. 이번 단계에서 별도 asset registry framework나 범용 scene graph를 만들 필요는 없습니다.

---

# 12. Fallback과 점진적 교체

## 정책

| 상황 | 동작 |
| --- | --- |
| final asset과 metadata가 모두 존재 | canonical raster asset과 metadata를 사용해요. |
| final asset이 없음 | 해당 ID의 현재 SVG/CSS placeholder를 사용해요. |
| asset loading 실패 | 깨진 이미지 icon을 노출하지 않고 같은 ID의 placeholder로 전환해요. |
| visual metadata가 없음 또는 유효하지 않음 | 위치를 추측하지 않고 placeholder를 사용하며 개발 환경에서 식별 가능한 진단을 남겨요. |
| Home 배경 loading 실패 | 현재와 같은 CSS base color 또는 gradient를 유지해 화면과 UI를 읽을 수 있게 해요. |
| 비 구름 loading 실패 | 기본 Home은 유지하고, 불완전한 날씨 이미지 때문에 돌을 숨기지 않아요. |

## 적용 순서

```text
1. visual catalog와 fallback 경계 준비
2. rock-01 강자갈 canonical asset 적용
3. plant-01 final asset 적용
4. S03 성장 / 씨앗 / 화분 적용
5. Home 기본 배경 적용
6. 비 layer 적용
7. 각 단계에서 다른 ID의 placeholder 회귀 확인
```

이 순서는 후속 구현을 위한 제안이며 이번 문서 작업에서 코드를 변경하지 않아요.

---

# 13. Motion과 에셋 책임

모든 duration은 Art Direction의 직접 interaction 범위인 `150~350ms` 안에서 시작하는 권장값이에요.

| Interaction | Static Asset Responsibility | Motion Responsibility | Required Layers | Expected Duration | Reduced Motion |
| --- | --- | --- | --- | --- | --- |
| 돌 터치 | `rock-01`, 장착 중이면 `plant-01-final` | 돌 `scale/translate/rotate`, 그림자 반응, 식물의 짧은 후행 | shadow + rock + equipped plant | `220~300ms` | transform animation 없이 즉시 안정 상태 유지 |
| 씨앗 심기 | `seed-basic`, `pot-basic`, `growth-planted` | 씨앗이 pot anchor로 이동하며 약하게 회전·사라지고 상태 교체 | seed + pot + planted state | `240~320ms` | 씨앗 이동 없이 planted 상태로 즉시 전환 |
| 성장 상태 전환 | `growth-planted`, `growth-growing` | 짧은 cross-fade와 작은 translate/scale | pot + old growth + new growth | `220~300ms` | old state를 즉시 new state로 교체 |
| 성장 완료 | `plant-01-final`, `pot-basic` | 완성 식물의 짧은 opacity/scale 강조 | final plant + pot + UI badge | `300~350ms` | 완성 식물과 이름을 즉시 표시 |
| 식물 장착 | `rock-01`, `plant-01-final` | plant가 stem anchor로 이동하고 약한 overshoot 후 정착 | rock + plant + shadow | `260~350ms` | 최종 anchor 위치에 즉시 장착 |

성장 상태의 **형태**는 정적 에셋이 담당하고, 상태 사이의 **전환**만 코드가 담당해요. 특정 식물의 잎이 나타나는 순서를 공통 animation으로 만들지 않습니다.

지속적인 큰 idle animation은 추가하지 않아요. 식물의 약한 sway가 필요하더라도 돌을 바라보는 경험을 방해하지 않는 작은 각도와 느린 움직임으로 제한하고, reduced motion에서는 제거합니다.

---

# 14. 검증 Viewport

[Responsive Layout Contract](../responsive-layout.md)의 대표 크기 중 Vertical Slice 에셋 검수에는 다음 세 가지를 우선 사용해요.

| 범주 | Viewport | 선택 이유 |
| --- | --- | --- |
| 작은 화면 | `320×568` | S02가 짧은 높이 규칙을 사용하고, S01 card의 돌이 가장 작아지는 조건을 확인해요. |
| 일반 화면 | `390×844` | 일반적인 Home, S03와 S04의 조합과 선명도를 확인해요. |
| 긴 화면 | `412×915` | Home 배경의 좌우 crop, 큰 여백과 날씨 layer 위치를 확인해요. |

보조 검증으로 `756×1465` 보고 비율과 실제 Apps in Toss safe area를 확인합니다.

## Viewport별 공통 Check

* `rock-01`의 visible bounds가 잘리지 않나요?
* `plant-01`의 `stemAnchor`가 돌 머리와 분리되거나 파고들지 않나요?
* 식물이 돌 이름과 Home action UI에 겹치지 않나요?
* `pot-basic`과 성장 상태의 anchor가 맞고 단계 전환 시 layout shift가 없나요?
* 비 구름과 빗방울이 돌과 식물보다 먼저 보이지 않나요?
* 배경 crop 후에도 홈에 화분처럼 보이는 장식이 나타나지 않나요?
* 종이 질감, 눈과 실루엣이 흐리거나 aliasing되지 않나요?
* reduced motion에서 같은 상태와 결과를 이해할 수 있나요?

## Context별 추가 Check

### S01

* 약 `75px` 폭에서도 `rock-01` 실루엣과 눈이 유지되나요?
* 목록과 Overlay가 같은 돌로 인식되나요?

### S02

* 돌의 `groundY`가 배경 바닥과 맞나요?
* 장착 식물과 돌이 하나의 안정된 실루엣으로 보이나요?
* 기본 Home과 비 Home이 같은 canonical 조합을 사용하나요?

### S03

* 씨앗, 화분, 성장 상태와 완성 식물의 순서를 시각적으로 이해할 수 있나요?
* `planted`와 `growing`이 다르지만 최종 식물 정체를 직접 드러내지 않나요?

### S04

* 작은 card에서 `plant-01`이 crop되지 않나요?
* 작은 돌과 Preview가 필요한 위치에서 `rock-01`을 다시 그리지 않고 재사용하나요?

---

# 15. 제작 Handoff와 완료 기준

## 에셋 제작자 Handoff

각 runtime asset은 다음 정보와 함께 전달해요.

```text
asset ID
runtime filename
canvas width / height
color space
alpha 여부
normalized visibleBounds
필요한 normalized anchor
원본 revision
export 설정
```

배경은 anchor 대신 `cover` crop에서 지켜야 하는 crop-safe 영역과 의도한 base color를 함께 전달합니다.

## 문서 기준 완료 조건

이 명세로 다음 작업을 추가 설계 없이 시작할 수 있어야 해요.

* `rock-01` canonical asset 제작
* `growth-planted` 제작
* `growth-growing` 제작
* `plant-01-final` 제작
* `seed-basic` 제작
* `pot-basic` 제작
* `home-background` 제작
* `weather-rain-layer` 제작

`rock-01`은 강자갈 모티프와 비교 시안 검수 기준, 나머지 에셋은 inventory와 layer 계약이 정리되어 있어 원본 제작 도구와 첫 작업 위치를 정하면 시안 제작을 시작할 수 있는 상태예요.

구현자는 다음 조합과 fallback을 이해할 수 있어야 해요.

```text
rock + equipped plant
pot + growth state
pot + final plant
background + rain + rock + equipped plant + UI
final asset 또는 기존 placeholder fallback
```

실제 이미지와 코드를 만들기 전의 문서 명세가 이번 작업의 완료 범위예요.

---

# 16. 남은 결정과 재검토 조건

## Vertical Slice 제작 전 결정 필요

* 시안 제작에 사용할 원본 제작 도구와 편집 가능한 원본 파일 형식
* 첫 원본과 비교 export를 둘 작업 위치

## Vertical Slice 제작 과정에서 결정

* `rock-01~03` 비교 시안에서 구체화할 각 돌의 실루엣, 색감, 질감과 점무늬의 최종 강도
* 여러 시안을 비교한 뒤 선택할 `plant-01`의 최종 형태와 표시 이름
* Art Direction의 색상 계열 안에서 사용할 정확한 palette 값
* 실제 원본 파일 크기와 제작 도구를 확인한 뒤 정할 원본의 장기 저장 위치와 Git LFS 사용 여부

## Vertical Slice 적용 후 검증

* 권장 canvas 크기와 `2x` 기준이 실제 기기에서 충분한지
* lossless WebP와 최초 PNG 비교본의 alpha edge, 종이 질감, 축소 품질, decode/render와 파일 크기
* 문제가 없을 때 PNG 비교본 제작을 종료하고 lossless WebP를 기본 runtime 형식으로 유지할 수 있는지
* 각 파일의 최종 용량 기준
* `pot-basic`을 `pot-basic-back` / `pot-basic-front`로 분리해야 하는지
* `planted`, `growing` 에셋의 향후 공통 사용 범위
* 배경 `1080×2160`과 `cover` crop-safe 영역이 모든 대표 viewport에 적합한지
* 비 구름의 context scale, 빗방울 수와 반복 주기
* 돌과 식물의 정확한 context별 scale 값

## 기존 문서 또는 구현과 함께 재검토할 항목

* UX 문서는 S04의 돌 Preview를 정의하지만 현재 S04 구현은 식물 Grid 중심이며 돌 Preview를 렌더링하지 않아요. 에셋은 Preview에서도 재사용 가능하게 만들되, Preview 복원 여부는 별도 UX/구현 작업에서 결정해야 해요.
* 현재 S01, S02와 S04의 돌, 그리고 S02, S03와 S04의 식물 placeholder는 화면별로 서로 다른 형태예요. Vertical Slice 적용 시 `rock-01`과 `plant-01`부터 shared visual renderer로 연결해야 canonical asset 계약을 만족합니다.
* 현재 Home은 OS dark mode에서 별도 CSS 배경을 사용해요. Vertical Slice 적용 시 게임 배경 아트에는 이 규칙이 적용되지 않도록 정리하고 고정 Art Palette를 사용해야 합니다. UI의 dark mode 대응 여부는 별도 UI 계약에서 다뤄요.

다음 조건이 생기면 이 문서를 다시 검토해요.

* 대표 viewport 또는 Home 최대 표시 크기가 바뀔 때
* 성장 단계 도메인 계약이 바뀔 때
* 여러 식물에서 anchor와 공통 성장 에셋이 충분하지 않을 때
* 날씨와 시간이 동시에 조합되기 시작할 때
* Apps in Toss WebView의 image decode 또는 bundle 제약이 확인될 때
