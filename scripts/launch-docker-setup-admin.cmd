@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "POWERSHELL_SCRIPT=%SCRIPT_DIR%enable-docker-runtime-prereqs.ps1"

if not exist "%POWERSHELL_SCRIPT%" (
  echo Missing script: %POWERSHELL_SCRIPT%
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%POWERSHELL_SCRIPT%' -Verb RunAs"

echo Elevated Docker prerequisite setup launched.
echo If Windows prompts for permission, approve it.
endlocal
