$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$dockerCommandInfo = Get-Command docker -ErrorAction SilentlyContinue
$dockerCommand = $null
if ($dockerCommandInfo) {
    $dockerCommand = $dockerCommandInfo.Source
}

if (-not $dockerCommand) {
    $candidate = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    if (Test-Path $candidate) {
        $dockerCommand = $candidate
    }
}

if (-not $dockerCommand) {
    throw "Docker CLI is not installed or not on PATH."
}

try {
    & $dockerCommand info *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker daemon is not ready."
    }
} catch {
    throw "Docker daemon is not ready. Run .\scripts\verify-docker-prereqs.ps1 first."
}

function Wait-ForUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$Label,
        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                Write-Output "$Label ready at $Url"
                return
            }
        } catch {
        }
        Start-Sleep -Seconds 5
    }

    throw "$Label did not become ready within $TimeoutSeconds seconds."
}

Write-Output "Starting Compose stack..."
& $dockerCommand compose up -d --build

Write-Output "Waiting for API and frontend..."
Wait-ForUrl -Url "http://127.0.0.1:8000/health" -Label "Backend health"
Wait-ForUrl -Url "http://127.0.0.1:5173" -Label "Frontend"

Write-Output "Running API smoke checks..."
$health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get
$summary = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/system/summary" -Method Get
$explainBody = @{
    profile = "new_fan"
    event_id = "evt-penalty-62"
} | ConvertTo-Json
$explain = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/explain" -Method Post -ContentType "application/json" -Body $explainBody

$report = [ordered]@{
    backend_status = $health.status
    backend_ibm_mode = $health.ibm_mode
    backend_database_backend = $health.database_backend
    supported_event_types = $summary.event_types_supported.Count
    demo_step_count = $summary.demo_step_count
    explain_headline = $explain.headline
    explain_prompt_template = $explain.prompt_template
}

Write-Output "Compose smoke test passed."
$report | ConvertTo-Json -Depth 4
