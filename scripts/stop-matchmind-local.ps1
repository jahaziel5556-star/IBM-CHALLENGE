$ErrorActionPreference = "Stop"

$statePath = Join-Path $PSScriptRoot "matchmind-local-state.json"

if (-not (Test-Path $statePath)) {
    Write-Output "No local MatchMind One state file found."
    exit 0
}

$state = Get-Content -Raw $statePath | ConvertFrom-Json

foreach ($pid in @($state.backend_pid, $state.frontend_pid)) {
    if ($pid) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $pid -Force
        }
    }
}

Remove-Item -LiteralPath $statePath -Force
Write-Output "MatchMind One processes stopped."
