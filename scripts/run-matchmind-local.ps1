$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend"
$backendPython = Join-Path $backendPath ".venv\Scripts\python.exe"

if (-not (Test-Path $backendPython)) {
    throw "Backend virtual environment not found at $backendPython. Create it first with: cd backend; python -m venv .venv"
}

if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    throw "Frontend dependencies are missing. Run: cd frontend; npm install"
}

$backendProcess = Start-Process -FilePath $backendPython `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000" `
    -WorkingDirectory $backendPath `
    -WindowStyle Hidden `
    -PassThru

$frontendProcess = Start-Process -FilePath "npm.cmd" `
    -ArgumentList "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173" `
    -WorkingDirectory $frontendPath `
    -WindowStyle Hidden `
    -PassThru

$state = @{
    backend_pid = $backendProcess.Id
    frontend_pid = $frontendProcess.Id
    started_at = (Get-Date).ToString("o")
}

$state | ConvertTo-Json | Set-Content -Path (Join-Path $PSScriptRoot "matchmind-local-state.json")

Write-Output "MatchMind One started."
Write-Output "Backend:  http://127.0.0.1:8000"
Write-Output "Frontend: http://127.0.0.1:5173"
Write-Output "Use scripts\\stop-matchmind-local.ps1 to stop both processes."
