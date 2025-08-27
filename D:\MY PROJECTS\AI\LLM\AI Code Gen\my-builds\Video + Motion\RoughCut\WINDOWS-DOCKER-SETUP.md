# Windows Docker Standalone Setup Guide

## Overview

This guide helps you set up standalone Docker Engine on Windows to run comprehensive E2E Windows container tests without affecting your WSL2/Linux containers.

## Why Standalone Docker Engine?

- **Full Windows container support** without Docker Desktop limitations
- **Runs independently** from WSL2 Docker
- **No mode switching required** - Windows and Linux containers can coexist
- **Production-ready** - Used in enterprise CI/CD pipelines
- **100% Docker compatible** - All docker-compose features work

## Prerequisites

- Windows 10/11 Pro or Enterprise (or Windows Server)
- Administrator access
- PowerShell 5.1 or later
- At least 10GB free disk space

## Quick Start

### Option A: Automated Installation (Recommended)

1. **Open PowerShell as Administrator**
   ```powershell
   # Right-click PowerShell → Run as Administrator
   ```

2. **Navigate to project**
   ```powershell
   cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
   ```

3. **Run installation script**
   ```powershell
   .\scripts\install-standalone-docker.ps1
   ```

4. **If prompted to restart** (for Hyper-V), restart and run the script again

5. **Test the installation**
   ```powershell
   docker version
   # Should show OS: windows
   ```

### Option B: Manual Installation

If you prefer manual control or the script fails:

1. **Enable Windows Features**
   ```powershell
   # Run as Administrator
   Enable-WindowsOptionalFeature -Online -FeatureName containers -All
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   # Restart if prompted
   ```

2. **Download Docker Engine**
   ```powershell
   Invoke-WebRequest -UseBasicParsing "https://download.docker.com/win/static/stable/x86_64/docker-24.0.7.zip" -OutFile docker.zip
   ```

3. **Extract and Install**
   ```powershell
   Expand-Archive docker.zip -DestinationPath $Env:ProgramFiles
   Remove-Item docker.zip
   
   # Add to PATH
   [Environment]::SetEnvironmentVariable("Path", "$($Env:PATH);$Env:ProgramFiles\docker", [EnvironmentVariableTarget]::Machine)
   ```

4. **Register as Service**
   ```powershell
   & "$Env:ProgramFiles\docker\dockerd.exe" --register-service
   Start-Service docker
   ```

## Setting Up Docker Contexts

After installation, set up contexts to easily switch between Windows and Linux containers:

```powershell
# Run the context setup script
.\scripts\setup-docker-contexts.ps1

# Or manually create contexts:
docker context create windows-standalone --docker "host=npipe:////./pipe/docker_engine"
docker context create wsl2-docker --docker "host=tcp://127.0.0.1:2375"  # If WSL2 Docker exposed on TCP
```

## Running Tests

### 1. Switch to Windows Context
```powershell
docker context use windows-standalone
# Or use the helper script:
.\scripts\switch-to-windows.ps1
```

### 2. Run Windows Container Tests
```powershell
# Full test suite
.\scripts\test-windows-containers.ps1

# Quick test
.\scripts\test-windows-containers.ps1 -Quick

# Test specific service
.\scripts\test-windows-containers.ps1 -TestService test-node-standard

# Verbose output
.\scripts\test-windows-containers.ps1 -Verbose
```

### 3. Switch Back to Linux (When Done)
```powershell
docker context use desktop-linux
# Or use the helper script:
.\scripts\switch-to-linux.ps1
```

## Test Coverage

The test suite validates the MCP server with:

- **test-node-standard** - Standard Node.js installation
- **test-node-nvm** - NVM for Windows
- **test-node-volta** - Volta version manager
- **test-node-chocolatey** - Chocolatey package manager
- **test-node-scoop** - Scoop package manager  
- **test-node-user** - User-space installation

## Troubleshooting

### "Docker service won't start"
```powershell
# Check Windows features are enabled
Get-WindowsOptionalFeature -Online -FeatureName containers
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Check service status
Get-Service docker

# Try manual start
Start-Service docker

# Check event logs
Get-EventLog -LogName Application -Source Docker -Newest 10
```

### "Cannot connect to Docker daemon"
```powershell
# Verify service is running
Get-Service docker

# Check current context
docker context show

# Try direct connection
$env:DOCKER_HOST = "npipe:////./pipe/docker_engine"
docker version
```

### "docker-compose.test.yml fails with 'no matching manifest'"
This means Docker is in Linux mode. Switch to Windows:
```powershell
docker context use windows-standalone
# Verify with:
docker version  # Should show OS: windows
```

### "Permission denied"
Ensure you're running PowerShell as Administrator for installation and service management.

## Verification Commands

```powershell
# Check Docker version and mode
docker version

# List all contexts
docker context ls

# Show current context
docker context show

# Test container run
docker run --rm mcr.microsoft.com/windows/nanoserver:ltsc2022 cmd /c echo "Windows containers working!"

# Check running containers
docker ps

# Check Docker info
docker info
```

## Uninstalling

If you need to remove the standalone Docker Engine:

```powershell
# Run as Administrator

# Stop and remove service
Stop-Service docker
& sc.exe delete docker

# Remove Docker files
Remove-Item "$Env:ProgramFiles\docker" -Recurse -Force

# Remove from PATH (manual step - edit System Environment Variables)

# Optionally disable Windows features
Disable-WindowsOptionalFeature -Online -FeatureName containers
Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V
```

## Benefits of This Setup

1. **Complete Isolation** - Windows and Linux containers don't interfere
2. **No Mode Switching** - Both can run simultaneously with contexts
3. **CI/CD Ready** - Same setup used in production pipelines
4. **Full Compatibility** - All Docker and docker-compose features work
5. **Reproducible** - Can be automated on any Windows machine

## Next Steps

1. Run the installation script: `.\scripts\install-standalone-docker.ps1`
2. Set up contexts: `.\scripts\setup-docker-contexts.ps1`
3. Run tests: `.\scripts\test-windows-containers.ps1`
4. Review results in `test-results\` directory

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Docker logs: `Get-EventLog -LogName Application -Source Docker`
3. Ensure all prerequisites are met
4. Try manual installation steps
5. Check if Windows Updates are needed

## Script Files Reference

- `scripts\install-standalone-docker.ps1` - Automated installer
- `scripts\test-windows-containers.ps1` - Test runner
- `scripts\setup-docker-contexts.ps1` - Context configuration
- `scripts\switch-to-windows.ps1` - Quick switch to Windows containers
- `scripts\switch-to-linux.ps1` - Quick switch to Linux containers

All scripts include help:
```powershell
Get-Help .\scripts\install-standalone-docker.ps1 -Full
```