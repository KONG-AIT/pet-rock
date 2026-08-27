# Responsive Layout Contract

## 목적

S01~S04가 Apps in Toss 모바일 viewport에서 같은 높이, safe area, scroll 규칙을 사용하도록 공통 계약을 정의합니다. 화면 크기 때문에 새로운 navigation이나 상태를 추가하지 않고 핵심 행동의 접근성을 유지하는 것이 목표예요.

## 공통 계약

### Viewport 소유권

* 앱 shell만 viewport 높이를 소유해요. `100svh`(브라우저 UI가 모두 펼쳐진 상태 기준 최소 높이)를 사용합니다. `100dvh`는 일부 Android 브라우저에서 툴바 상태와 어긋나 모든 화면에 동일한 양의 phantom scroll을 유발하는 사례가 확인되어 채택하지 않습니다.
* `html`, `body`, `#root`, route transition layer에서는 document scroll을 허용하지 않아요.
* S01~S04는 shell의 `height: 100%`를 채우며 각자 `100svh` 또는 `100dvh`를 다시 선언하지 않아요.

### Safe area

* shell이 `--app-safe-top`, `--app-safe-right`, `--app-safe-bottom`, `--app-safe-left`를 제공해요.
* 화면의 배경은 edge-to-edge를 유지하고, header, 핵심 action, 입력 영역 같은 interactive content가 각 inset과 최소 여백 중 큰 값을 사용해요.
* fixed 성격의 action은 bottom inset 위에 놓고, scroll content의 마지막 항목에는 action 높이와 bottom inset을 포함한 여백을 확보해요.

### Scroll

* S01/S02는 기본 상태에서 scroll range가 생기지 않아야 해요.
* S01 목록은 text zoom처럼 실제 콘텐츠가 넘칠 때만 화면 내부에서 스크롤해요. 이름 입력 Overlay는 키보드로 동적 viewport가 줄어들면 panel 내부만 스크롤해 입력값과 `데려가기`에 접근할 수 있어요.
* S03는 header를 유지하고 상태 콘텐츠 영역만 실제 overflow가 있을 때 스크롤해요.
* S04는 header와 tab을 유지하고 현재 tab panel만 스크롤해요. 적용 action은 화면에 고정하고 Grid의 마지막 항목이 action 아래에 가려지지 않게 해요.
* 모든 scroll 영역은 overscroll을 route 내부에 가두며, scrollbar가 필요한 상태로 바뀌어도 해당 영역의 gutter가 갑자기 바뀌지 않게 해요.

### Route transition과 접근성

* arriving/departing route는 같은 shell 크기에 겹치고 route 바깥으로 overflow하지 않아요.
* `prefers-reduced-motion: reduce`에서는 route와 화면 내부 animation/transition을 제거해요.
* text zoom으로 콘텐츠가 실제로 넘치면 S01/S03/S04의 정의된 내부 영역에서 핵심 action까지 이동할 수 있어야 해요. touch target은 최소 44px을 유지합니다.

## 화면·상태 동작 Matrix

| 화면/상태 | 기본 viewport 동작 | 짧은 viewport 또는 text zoom | Safe area / 고정 action |
| --- | --- | --- | --- |
| S01 돌 목록 | page scroll 없음 | 목록 화면 내부만 필요할 때 scroll | 상·좌·우·하 inset 뒤에 콘텐츠 배치 |
| S01 선택 Overlay | 배경 scroll 없이 panel 고정 | 키보드로 높이가 줄면 panel 내부 scroll | close, 입력, `데려가기`가 inset 안쪽에 위치 |
| S02 기본 | page scroll 없음, 돌과 식물이 우선 노출 | 620px 이하 높이에서 돌 크기와 위치만 제한 | 이름은 top/left, action은 right/bottom inset 반영 |
| S02 action menu / 공유 notice | 홈 높이와 scroll range 유지 | menu는 action 위로 펼치고 notice는 하단에서 접근 | action과 notice 모두 bottom inset 반영 |
| S03 씨앗 없음 / 심기 전 | header 고정, 콘텐츠가 맞으면 scroll 없음 | 상태 콘텐츠 영역만 overflow scroll | header와 상태 하단에 top/bottom inset 반영 |
| S03 성장 중 / 완료 | 주요 시각 요소와 action을 같은 콘텐츠 영역에 유지 | 완료 action까지 상태 콘텐츠 영역에서 접근 | Back은 top inset 아래 최소 44px target 유지 |
| S04 식물 / 씨앗 / 빈 상태 | header와 tab 고정, panel만 필요할 때 scroll | panel 내부에서 마지막 항목까지 접근 | panel padding이 bottom inset 반영 |
| S04 Preview / apply action | Preview 선택이 page 높이를 바꾸지 않음 | Grid만 scroll, apply action은 화면에 유지 | 마지막 Grid 항목 아래 action 높이 + inset 여백 확보 |
| route transition | document scrollbar 없음 | arriving/departing 화면 모두 shell에 clip | 두 화면의 fixed 성격 요소가 각 route 안에 유지 |

## 대표 Viewport 검증 Matrix

| 범주 | 크기 | 확인 항목 |
| --- | --- | --- |
| 좁고 짧음 | 320×568 | 핵심 action 접근, S02 돌/action 비겹침, S03/S04 의도한 영역만 scroll |
| 일반 소형 | 360×640, 375×667 | 기본 상태의 의미 없는 scroll range 없음 |
| 일반 최신 | 390×844, 412×915 | 큰 빈 scroll range 없음, S04 Grid/action 비겹침 |
| 보고 비율 | 756×1465 | 넓은 화면에서도 route 높이와 scroll 정책 일치 |
| safe area | iOS/Android Apps in Toss | 상·하·좌·우 inset 안쪽 touch target과 action 확인 |
| 가로 방향 | 568×320 이상 | 전용 layout은 아니지만 내부 scroll로 핵심 행동 접근 가능 |
| 접근성 | text zoom, reduced motion | 확대 시 핵심 Flow 접근, motion 제거 시 layout 유지 |

Apps in Toss 기기 검증에서는 S01 이름 입력 중 키보드를 실제로 열고 입력값과 `데려가기`가 panel scroll로 함께 접근되는지 반드시 확인합니다.
