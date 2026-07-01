$ErrorActionPreference = "Stop"

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    throw "Run this script from an elevated PowerShell window (Run as Administrator)."
}

Write-Output "Enabling Windows features required for Docker Desktop's Linux engine..."

dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Output "Installing WSL core components..."
wsl.exe --install --no-distribution

Write-Output "Attempting to start Docker Desktop service..."
Start-Service com.docker.service

Write-Output ""
Write-Output "If Windows reports that a restart is required, reboot the machine before starting Docker Desktop."
Write-Output "After reboot, run:"
Write-Output "  .\\scripts\\verify-docker-prereqs.ps1"
Write-Output "Then launch Docker Desktop and verify:"
Write-Output "  docker info"
