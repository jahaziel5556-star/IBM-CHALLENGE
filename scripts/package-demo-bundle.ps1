$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $repoRoot "artifacts"
$bundleRoot = Join-Path $artifactRoot "demo-bundle"
$zipPath = Join-Path $artifactRoot "MatchMind-One-demo-bundle.zip"

$filesToCopy = @(
    "README.md",
    ".env.example",
    "docs\00_PROJECT_OVERVIEW.md",
    "docs\01_PRODUCT_SPECIFICATION.md",
    "docs\03_TECH_STACK.md",
    "docs\05_API.md",
    "docs\11_TESTING.md",
    "docs\12_DEMO.md",
    "docs\14_IMPLEMENTATION_ROADMAP.md",
    "docs\15_EVENT_ENGINE_SPECIFICATION.md",
    "docs\16_DEPLOYMENT_RUNBOOK.md",
    "scripts\run-matchmind-local.ps1",
    "scripts\stop-matchmind-local.ps1",
    "scripts\verify-watsonx-live.ps1",
    "scripts\verify-ibm-free-tier.md"
)

if (Test-Path $bundleRoot) {
    Remove-Item -LiteralPath $bundleRoot -Recurse -Force
}

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

New-Item -ItemType Directory -Path $bundleRoot | Out-Null

foreach ($relativePath in $filesToCopy) {
    $sourcePath = Join-Path $repoRoot $relativePath
    if (-not (Test-Path $sourcePath)) {
        throw "Missing expected bundle file: $relativePath"
    }

    $destinationPath = Join-Path $bundleRoot $relativePath
    $destinationDir = Split-Path -Parent $destinationPath
    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }

    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
}

$commitSha = (git -C $repoRoot rev-parse HEAD).Trim()
$manifest = [ordered]@{
    created_at = (Get-Date).ToString("o")
    git_commit = $commitSha
    included_files = $filesToCopy
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $bundleRoot "bundle-manifest.json")
Compress-Archive -Path (Join-Path $bundleRoot "*") -DestinationPath $zipPath -Force

Write-Output "Demo bundle created at:"
Write-Output $zipPath
