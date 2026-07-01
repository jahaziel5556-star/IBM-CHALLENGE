$ErrorActionPreference = "Stop"

$dockerPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

$report = [ordered]@{
    docker_cli_installed = Test-Path $dockerPath
    docker_desktop_installed = Test-Path $dockerDesktopPath
    docker_service_status = $null
    wsl_status = $null
    docker_daemon_ready = $false
    notes = @()
}

if (Get-Service com.docker.service -ErrorAction SilentlyContinue) {
    $report.docker_service_status = (Get-Service com.docker.service).Status.ToString()
} else {
    $report.docker_service_status = "missing"
}

try {
    $wslStatus = wsl --status 2>&1
    $report.wsl_status = (($wslStatus | Out-String) -replace "`0", "").Trim()
} catch {
    $report.wsl_status = ($_.Exception.Message -replace "`0", "").Trim()
}

if ($report.docker_cli_installed) {
    try {
        & $dockerPath info *> $null
        if ($LASTEXITCODE -eq 0) {
            $report.docker_daemon_ready = $true
        }
    } catch {
        $report.docker_daemon_ready = $false
    }
}

if (-not $report.docker_cli_installed) {
    $report.notes += "Docker CLI is not installed."
}

if (-not $report.docker_desktop_installed) {
    $report.notes += "Docker Desktop is not installed."
}

if ($report.docker_service_status -ne "Running") {
    $report.notes += "Docker Desktop service is not running."
}

if (-not $report.docker_daemon_ready) {
    $report.notes += "Docker daemon is not responding."
}

if ($report.wsl_status -match "not installed") {
    $report.notes += "WSL is not installed; Docker Desktop's Linux engine will not start until WSL is installed and configured."
}

$report | ConvertTo-Json -Depth 4
