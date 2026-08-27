# 개발용 기본 씨앗 보충

## 목적

production의 최초 기본 씨앗 3개 지급 규칙과 아직 정하지 않은 추가 씨앗 획득 정책은 그대로 유지하면서, 개발 및 수동 테스트에서 씨앗을 모두 소진한 뒤에도 새 돌 데이터를 만들지 않고 S03 성장 Flow를 반복 테스트할 수 있게 한다.

이 기능은 기존 `DEV 시간 제어` panel([development-growth-clock.md](./development-growth-clock.md))에 추가된 action이며, Vite development build에서만 로드된다. production build에는 보충 UI와 action을 제공하지 않는다.

## 사용 방법

1. `pet-rock` 디렉터리에서 `npm run dev`를 실행한다.
2. 돌을 데려온 뒤 화면 오른쪽 위의 `DEV 시간 제어` 표시를 연다.
3. panel 하단의 `기본 씨앗 보충` 영역에서 현재 보유한 기본 씨앗 수량을 확인한다.
4. `기본 씨앗 +3개` 버튼을 누르면 즉시 기본 씨앗 3개가 추가되고 저장된다.
5. S03과 S04는 같은 Store 상태를 구독하므로 두 화면 모두 갱신된 수량을 즉시 반영한다.
6. 보충 후에도 실제 씨앗 소비, 성장, 수집, 장착, 보관 경로는 변경 없이 그대로 동작한다.

## 동작 계약

- 보충은 진행 중인 성장(`plantGrowth`), 보유 식물(`ownedPlants`), 장착 상태(`equipment`), 돌 정보(`rock`)를 변경하지 않는다.
- 보충 수량은 클릭 1회당 고정된 양(`DEVELOPMENT_SEED_REFILL_AMOUNT`)이며, 임의 수치 입력이나 범용 state editor는 제공하지 않는다.
- 보충 action은 기존 game action과 동일한 저장 대기열(mutation queue)을 통해 처리되므로, 빠르게 여러 번 눌러도 저장이 순차적으로 처리되어 수량이 유실되거나 손상되지 않는다.
- 저장이 실패하면 기존 씨앗 수량을 그대로 유지하고, panel에 실패 메시지를 표시하며 개발자 콘솔에도 오류를 기록한다.
- 돌을 데려오기 전(게임 상태가 없는 경우)에는 보충 버튼이 비활성화된다.

## 자동화 검증

`npm test`는 다음 계약을 검증한다.

- `refillBasicSeeds`가 고정 수량만큼 기본 씨앗을 더하고 그 외 상태는 변경하지 않는지 (`src/dev/seed-refill.test.ts`)
- development build에서 `devActions.refillSeeds`가 노출되는지, 성장/식물/장착/돌 정보를 그대로 유지하는지, 씨앗이 0개인 상태에서 보충 후 다시 심기가 가능한지, 저장 실패 시 기존 상태를 유지하는지, 빠른 연속 호출이 순차 저장되어 수량이 유실되지 않는지 (`src/app/store.test.ts`)

`npm run build` 후 산출물에 `기본 씨앗 보충`, `refillSeeds`, `DEV 시간 제어` 문자열이 없는지 확인해 production build에서 진입점이 제거되었는지 검증한다.

## 제한 사항

- production의 최초 3개 지급 규칙과 추가 씨앗 획득 미정 계약을 이 기능으로 확정하거나 변경하지 않는다.
- 무제한 씨앗, 씨앗 소비 제거, 식물 결과 선택·확률 조작, 전체 게임 상태 초기화는 제공하지 않는다.
- storage schema는 변경하지 않는다.
