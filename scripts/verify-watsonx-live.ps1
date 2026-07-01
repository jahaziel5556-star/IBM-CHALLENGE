$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
py (Join-Path $PSScriptRoot "verify-watsonx-live.py")
