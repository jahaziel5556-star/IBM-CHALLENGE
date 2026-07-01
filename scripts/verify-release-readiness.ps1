$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot "frontend"
$backendRoot = Join-Path $repoRoot "backend"

function Invoke-NativeChecked {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Native command failed with exit code $LASTEXITCODE."
    }
}

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )

    Write-Output ""
    Write-Output "==> $Label"
    & $Action
}

Invoke-Step -Label "Backend test suite" -Action {
    Push-Location $backendRoot
    try {
        Invoke-NativeChecked { py -m pytest }
    } finally {
        Pop-Location
    }
}

Invoke-Step -Label "Frontend unit tests" -Action {
    Push-Location $frontendRoot
    try {
        Invoke-NativeChecked { npm.cmd run test }
    } finally {
        Pop-Location
    }
}

Invoke-Step -Label "Frontend production build" -Action {
    Push-Location $frontendRoot
    try {
        Invoke-NativeChecked { npm.cmd run build }
    } finally {
        Pop-Location
    }
}

Invoke-Step -Label "Browser end-to-end validation" -Action {
    Push-Location $frontendRoot
    try {
        Invoke-NativeChecked { npm.cmd run test:e2e }
    } finally {
        Pop-Location
    }
}

Invoke-Step -Label "Live watsonx verification" -Action {
    Invoke-NativeChecked { py (Join-Path $PSScriptRoot "verify-watsonx-live.py") }
}

Invoke-Step -Label "Demo bundle packaging" -Action {
    Invoke-NativeChecked { powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "package-demo-bundle.ps1") }
}

Write-Output ""
Write-Output "MatchMind One non-Docker release readiness passed."
