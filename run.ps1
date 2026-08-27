<#
.SYNOPSIS
    로컬 환경(Windows)에서 pet-rock 앱을 구동합니다.

.PARAMETER Mode
    dev  - 개발 환경으로 실행합니다. 시간 보내기 등 개발/테스트 전용 기능이 활성화됩니다. (기본값)
    prod - 운영 빌드로 실행합니다. 개발/테스트 전용 기능이 비활성화됩니다.

.PARAMETER Port
    사용할 포트를 지정합니다. 지정하지 않으면 Vite 기본 포트를 사용하며,
    이미 사용 중이면 다음으로 사용 가능한 포트를 자동으로 사용합니다.

.EXAMPLE
    .\run.ps1
    .\run.ps1 -Mode prod -Port 4000
#>
[CmdletBinding()]
param(
    [ValidateSet('dev', 'prod')]
    [string]$Mode = 'dev',

    [Nullable[int]]$Port = $null
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppDir = Join-Path $ScriptDir 'pet-rock'

if (-not (Test-Path $AppDir)) {
    Write-Error "pet-rock 디렉터리를 찾을 수 없습니다: $AppDir"
    exit 1
}

Set-Location $AppDir

$currentPlatform = (node -e "process.stdout.write(process.platform + '-' + process.arch)")
$nodeModulesDir = Join-Path $AppDir 'node_modules'
$platformMarker = Join-Path $nodeModulesDir '.pet-rock-install-platform'

$needsInstall = $false
if (-not (Test-Path $nodeModulesDir)) {
    $needsInstall = $true
} elseif (-not (Test-Path $platformMarker) -or (Get-Content $platformMarker -Raw).Trim() -ne $currentPlatform) {
    Write-Host '다른 플랫폼에서 설치된 의존성을 감지해 node_modules를 다시 설치합니다...'
    Remove-Item -Recurse -Force $nodeModulesDir
    $needsInstall = $true
}

if ($needsInstall) {
    Write-Host "의존성을 설치합니다 ($currentPlatform)..."
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Set-Content -Path $platformMarker -Value $currentPlatform -NoNewline
}

$viteArgs = @()
if ($Port) {
    $viteArgs += @('--port', $Port)
}

if ($Mode -eq 'dev') {
    Write-Host '개발 환경으로 실행합니다. (시간 보내기 등 개발/테스트 전용 기능 활성화)'
    npx vite @viteArgs
    exit $LASTEXITCODE
}

Write-Host '운영 빌드로 실행합니다. (개발/테스트 전용 기능 비활성화)'
npx vite build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx vite preview @viteArgs
exit $LASTEXITCODE
