# Local Windows launcher: optional portable Node, optional port cleanup, then npm start.
# See docs/LOCAL_DEV.md for the full process.

param(
    [switch]$SkipInstall,
    [switch]$KillPort4200
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeDist = "v20.19.5"
$toolsDir = Join-Path $repoRoot ".tools\nodejs"
$nodeHome = Join-Path $toolsDir "node-$nodeDist-win-x64"

function Stop-ListenersOnPort4200 {
    $conns = Get-NetTCPConnection -LocalPort 4200 -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) {
        Write-Host "[dev-windows] Port 4200 is free."
        return
    }
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
        if ($procId -lt 1) { continue }
        Write-Host "[dev-windows] Stopping process $procId (was listening on :4200)..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 500
}

function Test-NodeMeetsAngular18 {
    try {
        $raw = (& node -v 2>$null).Trim()
        if (-not $raw) { return $false }
        $ver = [version]($raw.TrimStart("v"))
        return ($ver -ge [version]"18.19")
    }
    catch {
        return $false
    }
}

function Install-PortableNode {
    if (Test-Path (Join-Path $nodeHome "node.exe")) { return }
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
    $zipPath = Join-Path $env:TEMP "node-$nodeDist-win-x64.zip"
    $url = "https://nodejs.org/dist/$nodeDist/node-$nodeDist-win-x64.zip"
    Write-Host "[dev-windows] Downloading Node $nodeDist to .tools (one-time, no admin)..."
    Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
    Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
    if (-not (Test-Path (Join-Path $nodeHome "node.exe"))) {
        throw "Portable Node install failed: node.exe not found at $nodeHome"
    }
}

Write-Host "=== Book Review Blog — local launch (Windows) ==="

if ($KillPort4200) {
    Stop-ListenersOnPort4200
}

if (-not (Test-NodeMeetsAngular18)) {
    Install-PortableNode
    $env:Path = "$nodeHome;$nodeHome\node_modules\npm\bin;" + $env:Path
}

Set-Location $repoRoot
Write-Host "[dev-windows] Node: $(node -v) | npm: $(npm -v)"
Write-Host "[dev-windows] Repo: $repoRoot"
git status -sb 2>$null

if (-not $SkipInstall) {
    npm install
}

Write-Host "[dev-windows] Starting dev server — open http://127.0.0.1:4200/ when you see 'Compiled successfully'."
Write-Host "[dev-windows] Stop with Ctrl+C."
npm start
