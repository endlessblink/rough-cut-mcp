<#
.SYNOPSIS
    Sets up Docker contexts for dual Windows/Linux container management
.DESCRIPTION
    Creates and configures Docker contexts to easily switch between
    Windows containers (standalone) and Linux containers (WSL2)
#>

param(
    [switch]$SetupWSL2TCP,
    [int]$WSL2Port = 2375,
    [switch]$ListOnly
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Context Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to test a Docker endpoint
function Test-DockerEndpoint {
    param(
        [string]$Endpoint,
        [string]$ContextName
    )
    
    Write-Host "  Testing $ContextName..." -ForegroundColor Cyan -NoNewline
    
    try {
        $env:DOCKER_HOST = $Endpoint
        $version = & docker version --format json 2>&1 | ConvertFrom-Json
        $env:DOCKER_HOST = ""
        
        if ($version.Server) {
            Write-Host " Connected!" -ForegroundColor Green
            Write-Host "    OS: $($version.Server.Os)" -ForegroundColor Gray
            Write-Host "    Version: $($version.Server.Version)" -ForegroundColor Gray
            return $true
        }
        else {
            Write-Host " Not responding" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host " Failed" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Gray
        $env:DOCKER_HOST = ""
        return $false
    }
}

# List existing contexts
if ($ListOnly) {
    Write-Host "Current Docker Contexts:" -ForegroundColor Green
    Write-Host ""
    & docker context ls
    
    Write-Host ""
    Write-Host "Current active context:" -ForegroundColor Green
    $current = & docker context show
    Write-Host "  $current" -ForegroundColor Cyan
    
    exit 0
}

Write-Host "Step 1: Detecting available Docker endpoints..." -ForegroundColor Green
Write-Host ""

$contexts = @()

# Check for Windows Docker (standalone or Docker Desktop in Windows mode)
Write-Host "Checking Windows Docker endpoints:" -ForegroundColor Yellow

$windowsPipe = "npipe:////./pipe/docker_engine"
if (Test-DockerEndpoint -Endpoint $windowsPipe -ContextName "Windows Docker Engine") {
    $contexts += @{
        Name = "windows-standalone"
        Endpoint = $windowsPipe
        Description = "Standalone Windows Docker Engine"
        Type = "Windows"
    }
}

# Check for Docker Desktop contexts
$existingContexts = & docker context ls --format json | ConvertFrom-Json

foreach ($ctx in $existingContexts) {
    if ($ctx.Name -eq "desktop-linux") {
        Write-Host "  Testing desktop-linux..." -ForegroundColor Cyan -NoNewline
        Write-Host " Found" -ForegroundColor Green
        $contexts += @{
            Name = "desktop-linux"
            Endpoint = "existing"
            Description = "Docker Desktop Linux containers"
            Type = "Linux"
            Exists = $true
        }
    }
    elseif ($ctx.Name -eq "desktop-windows") {
        Write-Host "  Testing desktop-windows..." -ForegroundColor Cyan -NoNewline
        Write-Host " Found" -ForegroundColor Green
        $contexts += @{
            Name = "desktop-windows"
            Endpoint = "existing"
            Description = "Docker Desktop Windows containers"
            Type = "Windows"
            Exists = $true
        }
    }
}

# Check for WSL2 Docker
Write-Host ""
Write-Host "Checking WSL2 Docker endpoints:" -ForegroundColor Yellow

$wsl2TCP = "tcp://127.0.0.1:$WSL2Port"
if (Test-DockerEndpoint -Endpoint $wsl2TCP -ContextName "WSL2 Docker (TCP)") {
    $contexts += @{
        Name = "wsl2-docker"
        Endpoint = $wsl2TCP
        Description = "WSL2 Docker via TCP"
        Type = "Linux"
    }
}
elseif ($SetupWSL2TCP) {
    Write-Host ""
    Write-Host "  WSL2 Docker not accessible via TCP" -ForegroundColor Yellow
    Write-Host "  To enable, run this in WSL2:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  sudo nano /etc/docker/daemon.json" -ForegroundColor Cyan
    Write-Host "  Add: {`"hosts`": [`"unix:///var/run/docker.sock`", `"tcp://127.0.0.1:2375`"]}" -ForegroundColor Cyan
    Write-Host "  sudo systemctl restart docker" -ForegroundColor Cyan
    Write-Host ""
}

# Step 2: Create contexts
Write-Host ""
Write-Host "Step 2: Creating/updating Docker contexts..." -ForegroundColor Green
Write-Host ""

$created = 0
$skipped = 0

foreach ($ctx in $contexts) {
    if ($ctx.Exists) {
        Write-Host "  $($ctx.Name): Already exists (skipping)" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    Write-Host "  Creating $($ctx.Name)..." -ForegroundColor Cyan
    
    try {
        # Remove if exists
        & docker context rm $ctx.Name 2>&1 | Out-Null
        
        # Create new context
        & docker context create $ctx.Name `
            --docker "host=$($ctx.Endpoint)" `
            --description "$($ctx.Description)" 2>&1 | Out-Null
            
        Write-Host "    Created successfully!" -ForegroundColor Green
        $created++
    }
    catch {
        Write-Host "    Failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Created $created contexts, skipped $skipped existing" -ForegroundColor Green

# Step 3: Create helper scripts
Write-Host ""
Write-Host "Step 3: Creating helper scripts..." -ForegroundColor Green

$switchToWindowsScript = @'
# Switch to Windows containers
docker context use windows-standalone
docker version
'@

$switchToWindowsPath = Join-Path $PSScriptRoot "switch-to-windows.ps1"
$switchToWindowsScript | Set-Content $switchToWindowsPath
Write-Host "  Created: switch-to-windows.ps1" -ForegroundColor Green

$switchToLinuxScript = @'
# Switch to Linux containers
$contexts = @("desktop-linux", "wsl2-docker", "default")
foreach ($ctx in $contexts) {
    $exists = docker context ls --format "{{.Name}}" | Where-Object { $_ -eq $ctx }
    if ($exists) {
        docker context use $ctx
        docker version
        break
    }
}
'@

$switchToLinuxPath = Join-Path $PSScriptRoot "switch-to-linux.ps1"
$switchToLinuxScript | Set-Content $switchToLinuxPath
Write-Host "  Created: switch-to-linux.ps1" -ForegroundColor Green

# Step 4: Show summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Available contexts:" -ForegroundColor Cyan
& docker context ls

Write-Host ""
Write-Host "Quick switch commands:" -ForegroundColor Cyan
Write-Host "  Windows containers: .\scripts\switch-to-windows.ps1" -ForegroundColor White
Write-Host "  Linux containers:   .\scripts\switch-to-linux.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Manual switch:" -ForegroundColor Cyan
Write-Host "  docker context use <context-name>" -ForegroundColor White
Write-Host "  docker context ls                  (list all)" -ForegroundColor White
Write-Host "  docker context show                (show current)" -ForegroundColor White
Write-Host ""

# Test current context
Write-Host "Current context test:" -ForegroundColor Cyan
$current = & docker context show
Write-Host "  Active: $current" -ForegroundColor Green

try {
    $version = & docker version --format json | ConvertFrom-Json
    Write-Host "  OS: $($version.Server.Os)" -ForegroundColor Green
    Write-Host "  Ready for: $(if ($version.Server.Os -eq 'windows') { 'Windows containers' } else { 'Linux containers' })" -ForegroundColor Green
}
catch {
    Write-Host "  Could not connect to Docker daemon" -ForegroundColor Red
}