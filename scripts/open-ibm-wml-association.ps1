$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"

if (-not (Test-Path $envPath)) {
    throw "Missing .env file at $envPath"
}

$projectId = ""
foreach ($line in Get-Content $envPath) {
    if ($line -match "^IBM_WATSONX_PROJECT_ID=(.+)$") {
        $projectId = $Matches[1].Trim()
        break
    }
}

if (-not $projectId) {
    throw "IBM_WATSONX_PROJECT_ID is missing from .env"
}

$projectUrl = "https://dataplatform.cloud.ibm.com/projects/$projectId/manage?context=wx"

Write-Output "Opening IBM watsonx project Manage page:"
Write-Output $projectUrl
Write-Output ""
Write-Output "In IBM Cloud:"
Write-Output "1. Open the Manage tab."
Write-Output "2. Find Services and integrations or Associated services."
Write-Output "3. Associate the active Watson Machine Learning service instance."
Write-Output "4. Return here and run: py .\scripts\diagnose-ibm-wml-runtime.py"

Start-Process $projectUrl
