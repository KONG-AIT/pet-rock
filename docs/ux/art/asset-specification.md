# Runtime Art Asset Specification

## 목적과 기준

이 문서는 Issue #89에 전달된 PNG 37종과 성장 정체를 숨기기 위한 이름 중립 runtime alias 2종을 기록합니다. 이전 문서의 WebP 8종 제안보다 이 PNG 구조를 우선합니다. 제품의 `RockId`, `PlantId`, 성장 시간, 저장 형식과 navigation 계약은 변경하지 않습니다.

에셋은 사용자 제공본이며 코드에서 재압축하거나 색을 보정하지 않았습니다. 편집 가능한 원본, 제작 도구, export 설정, 저작권과 제3자 라이선스 정보는 전달되지 않아 **미확인**입니다. PNG header와 alpha channel, 실제 pixel alpha bounds, 파일 hash만 저장소에서 확인했습니다.

전체 revision은 파일의 상대 경로와 SHA-256을 정렬해 연결한 manifest의 SHA-256인 `9b3b8ed8b80601ea668d86ddf1e43600183c752eef82a8dfc49c9b330864ccf2`입니다. 아래 표의 revision은 각 파일 SHA-256 앞 12자리이며 원본 대조에는 전체 hash를 사용합니다.

## 좌표 계약

runtime `visible bounds`는 육안으로 보이지 않는 edge noise를 제외하기 위해 alpha가 128 이상인 pixel을 포함하는 `[x, y, width, height]` normalized 값입니다. 좌상단은 `(0, 0)`, 우하단은 `(1, 1)`입니다. 배경은 전체 canvas가 불투명하여 `[0,0,1,1]`입니다.

runtime anchor는 다음과 같습니다.

| 역할 | ID | visible bounds | anchor |
| --- | --- | --- | --- |
| rock | `rock-01` | `[.082,.171,.864,.687]` | `groundY=.858`, `plant=(.5,.19)` |
| rock | `rock-02` | `[.039,.320,.926,.438]` | `groundY=.758`, `plant=(.5,.34)` |
| rock | `rock-03` | `[.065,.289,.880,.469]` | `groundY=.758`, `plant=(.5,.31)` |
| shared planted | `growth/growth-planted` | `[.286,.706,.427,.289]` | `stem=(.5,.9953)` |
| shared growing | `growth/growth-growing` | `[.178,.344,.645,.650]` | `stem=(.5,.9953)` |
| final | `plant-01/stage-03` | `[0,.0167,.9904,.9530]` | `stem=(.5,.9697)` |
| final | `plant-02/stage-03` | `[.0734,.0234,.8531,.9719]` | `stem=(.5,.9953)` |
| final | `plant-03/stage-03` | `[0,.0112,.9633,.9633]` | `stem=(.5,.9745)` |

anchor는 현재 합성 접점의 runtime 기준입니다. runtime visible bounds는 alpha 128 threshold pixel scan 측정값이고 anchor는 접합 위치를 육안 검수해 정한 값입니다. 아래 inventory 표의 bounds는 파일 무결성 기록을 위한 alpha 0 초과 envelope이므로 runtime 배치에는 사용하지 않습니다. renderer와 위 표는 같은 normalized metadata를 사용합니다.

## 실제 inventory

### Rocks와 faces

| 파일 | canvas | alpha | normalized bounds | revision |
| --- | ---: | --- | --- | --- |
| `rocks/rock-01.png` | 1254×1254 | yes | `[0,.0159,.9522,.9841]` | `a65fa48021b7` |
| `rocks/rock-02.png` | 1254×1254 | yes | `[.0367,.0415,.9370,.9250]` | `c54eb2dbe92f` |
| `rocks/rock-03.png` | 1254×1254 | yes | `[.0622,.0415,.8852,.8756]` | `56ad5a9f3ae8` |
| `faces/face-neutral.png` | 1254×1254 | yes | `[.1675,.0167,.6930,.6467]` | `082d96f0b638` |
| `faces/face-happy.png` | 1254×1254 | yes | `[.1675,.0167,.6930,.6356]` | `c02cbcaa5baf` |
| `faces/face-sleepy.png` | 1254×1254 | yes | `[.1292,.0167,.7376,.7337]` | `75fc579b9be3` |
| `faces/face-surprised.png` | 1254×1254 | yes | `[.1164,.0423,.7584,.8748]` | `23ec2546822b` |
| `faces/face-content.png` | 1254×1254 | yes | `[.2049,.0167,.7584,.8469]` | `f8fb6871975d` |

### Plants

| 파일 | canvas | alpha | normalized bounds | revision |
| --- | ---: | --- | --- | --- |
| `growth/growth-planted.png` | 640×640 | yes | `[.2859,.7063,.4281,.2891]` | `02375623f927` |
| `growth/growth-growing.png` | 640×640 | yes | `[.1766,.3422,.6484,.6531]` | `f94274573bfa` |
| `plants/plant-01/stage-01.png` | 1254×1254 | yes | `[.0136,.0159,.9577,.9522]` | `f2386bab35ac` |
| `plants/plant-01/stage-02.png` | 1254×1254 | yes | `[.0136,.0152,.9673,.9530]` | `f04aaf4fbdea` |
| `plants/plant-01/stage-03.png` | 1254×1254 | yes | `[0,.0167,.9904,.9530]` | `fa57a1d6ab3e` |
| `plants/plant-02/stage-01.png` | 640×640 | yes | `[.2859,.7063,.4281,.2891]` | `02375623f927` |
| `plants/plant-02/stage-02.png` | 640×640 | yes | `[.1766,.3422,.6484,.6531]` | `f94274573bfa` |
| `plants/plant-02/stage-03.png` | 640×640 | yes | `[.0734,.0234,.8531,.9719]` | `7d010285ed25` |
| `plants/plant-03/stage-01.png` | 1254×1254 | yes | `[.0455,.0167,.9290,.9211]` | `6184d62849b3` |
| `plants/plant-03/stage-02.png` | 1254×1254 | yes | `[.0343,.0159,.9545,.9633]` | `518557e79bce` |
| `plants/plant-03/stage-03.png` | 1254×1254 | yes | `[0,.0112,.9633,.9633]` | `389f7f758d47` |
| `plants/plant-04/stage-01.png` | 1254×1254 | yes | `[0,.0359,.9721,.9322]` | `af6b39002666` |
| `plants/plant-04/stage-02.png` | 1254×1254 | yes | `[.0263,.0167,.9577,.9633]` | `bef20ab49a38` |
| `plants/plant-04/stage-03.png` | 1254×1254 | yes | `[.1085,.0152,.8836,.9609]` | `25db09167a21` |
| `plants/plant-05/stage-01.png` | 1254×1254 | yes | `[.0263,.0167,.9386,.9514]` | `7bcc9c759241` |
| `plants/plant-05/stage-02.png` | 1254×1254 | yes | `[0,.0152,.9856,.9721]` | `abe653da69c8` |
| `plants/plant-05/stage-03.png` | 1254×1254 | yes | `[.0470,.0072,.9434,.9928]` | `dc8d37616878` |

### FX와 environment

| 파일 | canvas | alpha | normalized bounds | revision |
| --- | ---: | --- | --- | --- |
| `fx/fx-growth-01.png` | 1254×1254 | yes | `[.0774,.0167,.8780,.9514]` | `2e55d355bc0e` |
| `fx/fx-growth-02.png` | 1254×1254 | yes | `[.0774,.0167,.8732,.9258]` | `be6deafae0dd` |
| `fx/fx-soil-01.png` | 1254×1254 | yes | `[.0774,.0167,.8860,.9258]` | `a1e0e334894d` |
| `fx/fx-soil-02.png` | 1254×1254 | yes | `[.0774,.0423,.8764,.9242]` | `0d6116d8477c` |
| `fx/fx-soil-03.png` | 1254×1254 | yes | `[.0343,.0167,.9306,.9498]` | `dc247a6552a9` |
| `fx/fx-sparkle-01.png` | 1254×1254 | yes | `[.0837,.0415,.8796,.9266]` | `66fe7f51080b` |
| `fx/fx-touch-01.png` | 1254×1254 | yes | `[.0774,.0167,.8860,.9258]` | `10a999c1d324` |
| `fx/fx-touch-02.png` | 1254×1254 | yes | `[.0774,.0167,.8876,.9258]` | `75ab4abf1e0c` |
| `environment/rock-ground.png` | 1448×1086 | yes | `[.0490,.0193,.8819,.8987]` | `48530d5f05e8` |
| `environment/backgrounds/background-home.png` | 941×1672 | no | `[0,0,1,1]` | `413b73000104` |
| `environment/backgrounds/background-draw.png` | 941×1672 | no | `[0,0,1,1]` | `71276e1abb16` |
| `environment/backgrounds/background-collection.png` | 941×1672 | no | `[0,0,1,1]` | `6c07fc728327` |
| `environment/props/prop-grass-01.png` | 1254×1254 | yes | `[.0486,.0167,.9322,.9833]` | `8d2c5ad991fa` |
| `environment/props/prop-leaf-01.png` | 1254×1254 | yes | `[.0582,.0167,.9131,.9498]` | `d80eb699302d` |

## Runtime 사용 범위

| 화면 | 조합과 순서 |
| --- | --- |
| S01 | canonical rock → neutral face → 기존 UI |
| S02 | CSS fallback → `background-home` → `rock-ground` → rock → neutral/happy face → equipped stage-03 plant → touch FX → UI |
| S03 planted | 기존 pot SVG 뒤의 공통 stage-01 → soil FX → pot front/UI |
| S03 growing | 기존 pot SVG 뒤의 공통 stage-02 → soil/growth FX → pot front/UI |
| S03 completed | ID별 stage-03 → sparkle FX → 기존 pot SVG → UI |
| S04 | 배경 → owned stage-03 또는 rock+neutral face → badge/action UI |

S03의 공통 stage-01/02 alias는 전달된 `plant-02/stage-01/02`와 byte 및 SHA-256이 같은 파일입니다. 중립 이름의 alias를 import해 성장 중 DOM과 개발 asset URL에도 `resultPlantId`가 나타나지 않게 합니다. 실제 `PlantId`와 stage-03은 완료 후에만 공개합니다.

현재 domain ID 세 개에 필요한 rock, neutral/happy face, stage-03 세 개, 공통 stage-01/02, 사용 FX, ground와 세 배경만 정적으로 import합니다. `plant-04/05`, sleepy/surprised/content face, props와 나머지 FX는 전달 inventory로 보존하지만 현재 상태나 새 domain ID를 만들지 않으며 production bundle에 포함하지 않습니다.

seed, pot, weather 대응 PNG는 제공되지 않았습니다. seed와 pot은 기존 SVG를 유지하고 weather state는 추가하지 않습니다.

## Fallback, motion과 반응형

rock/face/plant 이미지가 load 또는 decode되지 않으면 broken-image icon 대신 같은 context의 기존 SVG/CSS placeholder를 보여줍니다. 배경은 CSS gradient/base color를 뒤에 유지합니다. 외부 wrapper의 기존 크기와 button을 유지하므로 투명 canvas가 touch target을 줄이지 않습니다.

Home touch와 S03 FX는 transform/opacity만 사용하며 직접 interaction은 기존 220~320ms 범위를 유지합니다. `prefers-reduced-motion: reduce`에서는 touch/soil/growth/sparkle transform animation을 제거하지만 happy face와 최종 상태는 즉시 표시합니다. OS dark mode는 게임 배경을 다른 palette로 교체하지 않습니다.

검수 viewport는 `320×568`, `390×844`, `412×915`, `756×1465`입니다. 모든 viewport에서 object는 `contain`, 배경은 `cover`를 사용하며 rock/face canvas는 동일 크기로 겹칩니다. plant는 normalized stem anchor 기준으로 context scale과 offset을 적용합니다.

## 확인되지 않은 handoff 정보

다음 항목은 사용자 제공 PNG만으로 확인할 수 없어 추정하지 않습니다.

* 편집 가능한 원본 위치와 형식
* 제작 도구와 export preset
* ICC profile을 포함한 의도된 작업 color space
* 저작권자, 사용 허가와 제3자 소재 권리
* 향후 재export 시 사용할 원본 revision 체계

이 정보가 전달되면 manifest revision과 함께 갱신합니다.
