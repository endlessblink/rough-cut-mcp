#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs standalone Docker Engine for Windows containers without Docker Desktop
.DESCRIPTION
    This script installs Docker Engine directly on Windows, enabling Windows container support
    without interfering with WSL2 or existing Docker Desktop Linux containers.
.NOTES
    Must be run as Administrator
    May require system restart for Hyper-V features
#>

param(
    [switch]$SkipFeatureCheck,
    [switch]$Force,
    [string]$DockerVersion = "24.0.7"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Standalone Docker Engine Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Function to check if a Windows feature is enabled
function Test-WindowsFeature {
    param([string]$FeatureName)
    $feature = Get-WindowsOptionalFeature -Online -FeatureName $FeatureName -ErrorAction SilentlyContinue
    return $feature -and $feature.State -eq "Enabled"
}

# Step 1: Enable Required Windows Features
if (-not $SkipFeatureCheck) {
    Write-Host "Step 1: Checking Windows Features..." -ForegroundColor Green
    
    $containersEnabled = Test-WindowsFeature "containers"
    $hyperVEnabled = Test-WindowsFeature "Microsoft-Hyper-V"
    
    if (-not $containersEnabled) {
        Write-Host "  Enabling Windows Containers feature..." -ForegroundColor Yellow
        Enable-WindowsOptionalFeature -Online -FeatureName containers -All -NoRestart
        $restartNeeded = $true
    }
    else {
        Write-Host "  Windows Containers feature already enabled" -ForegroundColor Green
    }
    
    if (-not $hyperVEnabled) {
        Write-Host "  Enabling Hyper-V feature..." -ForegroundColor Yellow
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All -NoRestart
        $restartNeeded = $true
    }
    else {
        Write-Host "  Hyper-V feature already enabled" -ForegroundColor Green
    }
    
    if ($restartNeeded) {
        Write-Host ""
        Write-Host "RESTART REQUIRED!" -ForegroundColor Red
        Write-Host "Windows features have been enabled but require a restart." -ForegroundColor Yellow
        Write-Host "Please run this script again after restarting." -ForegroundColor Yellow
        $answer = Read-Host "Restart now? (Y/N)"
        if ($answer -eq "Y") {
            Restart-Computer -Force
        }
        exit 0
    }
}

# Step 2: Check for existing Docker service
Write-Host ""
Write-Host "Step 2: Checking for existing Docker installation..." -ForegroundColor Green

$existingService = Get-Service -Name "docker" -ErrorAction SilentlyContinue
if ($existingService) {
    if (-not $Force) {
        Write-Host "  Docker service already exists!" -ForegroundColor Yellow
        Write-Host "  Use -Force to overwrite existing installation" -ForegroundColor Yellow
        $answer = Read-Host "Continue anyway? (Y/N)"
        if ($answer -ne "Y") {
            Write-Host "Installation cancelled" -ForegroundColor Red
            exit 0
        }
    }
    
    Write-Host "  Stopping existing Docker service..." -ForegroundColor Yellow
    Stop-Service docker -Force -ErrorAction SilentlyContinue
    & sc.exe delete docker | Out-Null
}

# Step 3: Download Docker Engine
Write-Host ""
Write-Host "Step 3: Downloading Docker Engine v$DockerVersion..." -ForegroundColor Green

$dockerUrl = "https://download.docker.com/win/static/stable/x86_64/docker-$DockerVersion.zip"
$tempPath = "$env:TEMP\docker.zip"
$dockerPath = "$env:ProgramFiles\docker"

try {
    Write-Host "  Downloading from $dockerUrl..." -ForegroundColor Cyan
    Invoke-WebRequest -UseBasicParsing -Uri $dockerUrl -OutFile $tempPath
    Write-Host "  Download complete!" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Failed to download Docker Engine!" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    exit 1
}

# Step 4: Extract Docker Engine
Write-Host ""
Write-Host "Step 4: Installing Docker Engine..." -ForegroundColor Green

if (Test-Path $dockerPath) {
    Write-Host "  Removing old Docker installation..." -ForegroundColor Yellow
    Remove-Item -Path $dockerPath -Recurse -Force
}

Write-Host "  Extracting Docker binaries..." -ForegroundColor Cyan
Expand-Archive -Path $tempPath -DestinationPath "$env:ProgramFiles" -Force
Remove-Item $tempPath -Force

# Step 5: Add Docker to PATH
Write-Host ""
Write-Host "Step 5: Configuring environment..." -ForegroundColor Green

$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
if ($currentPath -notlike "*$dockerPath*") {
    Write-Host "  Adding Docker to system PATH..." -ForegroundColor Cyan
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$dockerPath", [EnvironmentVariableTarget]::Machine)
    $env:Path = "$env:Path;$dockerPath"
}
else {
    Write-Host "  Docker already in PATH" -ForegroundColor Green
}

# Step 6: Register Docker as Windows Service
Write-Host ""
Write-Host "Step 6: Registering Docker service..." -ForegroundColor Green

try {
    Write-Host "  Creating Docker service..." -ForegroundColor Cyan
    & "$dockerPath\dockerd.exe" --register-service
    Write-Host "  Docker service registered successfully!" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: Failed to register service automatically" -ForegroundColor Yellow
    Write-Host "  Trying manual registration..." -ForegroundColor Yellow
    
    & sc.exe create docker binPath= "$dockerPath\dockerd.exe --run-service" start= auto
}

# Step 7: Start Docker Service
Write-Host ""
Write-Host "Step 7: Starting Docker service..." -ForegroundColor Green

try {
    Start-Service docker
    Write-Host "  Docker service started!" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Failed to start Docker service!" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  You may need to start it manually:" -ForegroundColor Yellow
    Write-Host "  Start-Service docker" -ForegroundColor Cyan
}

# Step 8: Verify Installation
Write-Host ""
Write-Host "Step 8: Verifying installation..." -ForegroundColor Green

Start-Sleep -Seconds 3

try {
    $version = & docker version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Docker Engine installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Docker Version Info:" -ForegroundColor Cyan
        & docker version
    }
    else {
        Write-Host "  WARNING: Docker installed but not responding yet" -ForegroundColor Yellow
        Write-Host "  Try running 'docker version' in a few seconds" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "  WARNING: Could not verify Docker installation" -ForegroundColor Yellow
}

# Step 9: Create Docker contexts
Write-Host ""
Write-Host "Step 9: Setting up Docker contexts..." -ForegroundColor Green

Write-Host "  Creating 'windows-standalone' context..." -ForegroundColor Cyan
& docker context create windows-standalone --docker "host=npipe:////./pipe/docker_engine" --description "Standalone Windows Docker Engine" 2>&1 | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Use 'docker context use windows-standalone' to switch to Windows containers" -ForegroundColor White
Write-Host "2. Run 'docker version' to verify installation" -ForegroundColor White
Write-Host "3. Run '.\scripts\test-windows-containers.ps1' to test your containers" -ForegroundColor White
Write-Host ""
Write-Host "To switch between contexts:" -ForegroundColor Cyan
Write-Host "  Windows: docker context use windows-standalone" -ForegroundColor White
Write-Host "  WSL2:    docker context use desktop-linux" -ForegroundColor White
Write-Host ""