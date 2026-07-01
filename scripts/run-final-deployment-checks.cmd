@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "VERIFY_SCRIPT=%SCRIPT_DIR%finalize-docker-verification.ps1"

if not exist "%VERIFY_SCRIPT%" (
  echo Missing script: %VERIFY_SCRIPT%
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%VERIFY_SCRIPT%"
endlocal
