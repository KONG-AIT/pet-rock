#!/usr/bin/env bash
# 로컬 환경(Linux/WSL)에서 pet-rock 앱을 구동합니다.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/pet-rock"

MODE="dev"
PORT=""

usage() {
  cat <<'EOF'
사용법: ./run.sh [--dev|--prod] [--port <포트번호>]

  --dev              개발 환경으로 실행합니다. 시간 보내기 등 개발/테스트 전용 기능이 활성화됩니다. (기본값)
  --prod             운영 빌드로 실행합니다. 개발/테스트 전용 기능이 비활성화됩니다.
  --port <포트번호>    사용할 포트를 지정합니다. 지정하지 않으면 Vite 기본 포트를 사용하며,
                      이미 사용 중이면 다음으로 사용 가능한 포트를 자동으로 사용합니다.
  -h, --help         도움말을 출력합니다.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dev)
      MODE="dev"
      shift
      ;;
    --prod)
      MODE="prod"
      shift
      ;;
    --port)
      PORT="${2:-}"
      if [ -z "$PORT" ]; then
        echo "오류: --port 옵션에는 포트 번호가 필요합니다." >&2
        exit 1
      fi
      shift 2
      ;;
    --port=*)
      PORT="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "알 수 없는 옵션: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ ! -d "$APP_DIR" ]; then
  echo "오류: pet-rock 디렉터리를 찾을 수 없습니다: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

if [ ! -d node_modules ]; then
  echo "의존성이 설치되어 있지 않아 npm install을 실행합니다..."
  npm install
fi

PORT_ARGS=()
if [ -n "$PORT" ]; then
  PORT_ARGS=(--port "$PORT")
fi

if [ "$MODE" = "dev" ]; then
  echo "개발 환경으로 실행합니다. (시간 보내기 등 개발/테스트 전용 기능 활성화)"
  exec npx vite "${PORT_ARGS[@]}"
fi

echo "운영 빌드로 실행합니다. (개발/테스트 전용 기능 비활성화)"
npx vite build
exec npx vite preview "${PORT_ARGS[@]}"
