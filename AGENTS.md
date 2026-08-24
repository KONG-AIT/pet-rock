# AGENTS.md

이 프로젝트의 제품 관련 판단은 `/docs`의 문서를 기준으로 합니다.

제품 기능이나 UX를 변경하기 전에 아래 문서를 먼저 확인해주세요.

1. `docs/product/identity.md`
2. `docs/product/persona.md`
3. `docs/product/actors.md`
4. `docs/product/principles.md`
5. `docs/product/core-loop.md`

기능 구현에 대한 내용은 `docs/features/`, UX에 대한 내용은 `docs/ux/`를 참고합니다.

문서 간 내용이 충돌한다면 더 상위의 제품 문서를 우선합니다.

기존 구조와 규칙을 불필요하게 크게 변경하지 말고, 요청된 범위 안에서 가장 단순한 방법을 우선해주세요.

## Git 작업 규칙

- 모든 Issue 구현 작업은 Git Worktree에서 수행합니다.
- Issue 1개당 branch 1개, worktree 1개를 사용합니다.
- 새 작업을 시작하기 전에 반드시 `git fetch origin`을 수행합니다.
- 새 작업 branch는 stale한 local `main`이 아니라 최신 `origin/main`을 기준으로 생성합니다.
- 작업 시작 전에 현재 branch와 `origin/main`의 기준점을 확인합니다.
- 이미 존재하는 worktree에서 작업을 재개할 경우에도 먼저 remote 상태를 갱신하고 branch가 최신 `origin/main`을 기반으로 하는지 확인합니다.
- 공통 기반 변경이 merge되어 현재 branch의 base가 오래된 경우 substantive edit 전에 최신 `origin/main`을 반영합니다.
- 기본 `pet-rock` working tree에서는 Issue 구현 코드를 수정하지 않습니다.
- 각 worktree는 해당 Issue의 branch만 사용합니다.
- 다른 Issue의 worktree나 branch를 임의로 수정하지 않습니다.
- 사용자가 만든 미커밋 변경사항을 임의로 되돌리거나 포맷팅하지 않습니다.
- 특히 기존 사용자 변경이 있는 파일은 명시적인 작업 범위가 아니라면 건드리지 않습니다.
