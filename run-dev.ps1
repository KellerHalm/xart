param(
  [switch]$InstallDeps,
  [int]$BackendPort = 8080,
  [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

if (-not (Test-Path $backendDir)) {
  throw "Backend directory not found: $backendDir"
}
if (-not (Test-Path $frontendDir)) {
  throw "Frontend directory not found: $frontendDir"
}

$backendCmd = @"
`$env:PORT='$BackendPort';
Set-Location '$backendDir';
go run .
"@

$frontendCmd = @"
Set-Location '$frontendDir';
if ($InstallDeps) { npm install --legacy-peer-deps };
npm run dev -- --port $FrontendPort
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null

Write-Host "Backend:  http://localhost:$BackendPort"
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "Close the opened PowerShell windows to stop the servers."
