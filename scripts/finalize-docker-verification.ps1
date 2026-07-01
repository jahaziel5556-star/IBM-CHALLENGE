$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Output "Checking Docker prerequisites..."
powershell -ExecutionPolicy Bypass -File (Join-Path $scriptRoot "verify-docker-prereqs.ps1")

Write-Output ""
Write-Output "If Docker prerequisites are healthy, running Compose smoke verification..."
powershell -ExecutionPolicy Bypass -File (Join-Path $scriptRoot "verify-compose-stack.ps1")
