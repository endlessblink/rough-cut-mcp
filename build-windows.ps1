# Windows Build Script for RoughCut MCP
# MUST be run in Windows PowerShell or CMD, NOT WSL2!

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ROUGHCUT MCP - WINDOWS BUILD SCRIPT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verify we're running on Windows, not WSL2
$isWSL = $false
if (Test-Path "/proc/version") {
    $procVersion = Get-Content "/proc/version" -ErrorAction SilentlyContinue
    if ($procVersion -match "Microsoft|WSL") {
        $isWSL = $true
    }
}

if ($isWSL -or $env:WSL_DISTRO_NAME) {
    Write-Host "CRITICAL ERROR: This script is running in WSL2!" -ForegroundColor Red
    Write-Host ""
    Write-Host "WSL paths should NEVER exist in the first place!" -ForegroundColor Red
    Write-Host "Building in WSL2 creates paths like /mnt/d/... that Windows cannot execute." -ForegroundColor Red
    Write-Host ""
    Write-Host "To build correctly:" -ForegroundColor Yellow
    Write-Host "1. Open Windows PowerShell (not WSL terminal)" -ForegroundColor Yellow
    Write-Host "2. Navigate to: D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut" -ForegroundColor Yellow
    Write-Host "3. Run: .\build-windows.ps1" -ForegroundColor Yellow
    exit 1
}

# Get current directory
$currentPath = (Get-Location).Path
Write-Host "Build Environment:" -ForegroundColor Green
Write-Host "  Platform: Windows Native" -ForegroundColor White
Write-Host "  Current Directory: $currentPath" -ForegroundColor White
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

$npmVersion = npm --version 2>$null
Write-Host "  NPM: $npmVersion" -ForegroundColor Green
Write-Host ""

# Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Cyan
if (Test-Path "build") {
    Remove-Item -Path "build" -Recurse -Force
    Write-Host "  Removed old build directory" -ForegroundColor Yellow
}
Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Run the build
Write-Host "Building TypeScript..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  Build completed successfully" -ForegroundColor Green
Write-Host ""

# Verify build output doesn't contain WSL paths
Write-Host "Validating build output..." -ForegroundColor Cyan
$buildFile = "build\index.js"
if (Test-Path $buildFile) {
    $content = Get-Content $buildFile -Raw
    if ($content -match "/mnt/[cd]/") {
        Write-Host "CRITICAL ERROR: WSL paths found in build output!" -ForegroundColor Red
        Write-Host "The build contains paths like /mnt/d/... which will fail on Windows!" -ForegroundColor Red
        Write-Host ""
        Write-Host "This should never happen if you're building on Windows." -ForegroundColor Red
        Write-Host "Make sure you're not running this from WSL2!" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "  No WSL paths found in build" -ForegroundColor Green
    }
    
    # Check for proper Windows paths
    if ($content -match '[A-Z]:\\') {
        Write-Host "  Windows paths detected in build" -ForegroundColor Green
    }
}
else {
    Write-Host "WARNING: Could not find build output to validate" -ForegroundColor Yellow
}
Write-Host ""

# Create assets directory structure if needed
Write-Host "Ensuring asset directories exist..." -ForegroundColor Cyan
$assetDirs = @(
    "assets",
    "assets\projects",
    "assets\videos",
    "assets\cache",
    "assets\audio",
    "assets\images"
)

foreach ($dir in $assetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Yellow
    }
}
Write-Host "  Asset directories ready" -ForegroundColor Green
Write-Host ""

# Generate timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Summary
Write-Host "================================================" -ForegroundColor Green
Write-Host "    BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build Summary:" -ForegroundColor White
Write-Host "  Platform: Windows Native" -ForegroundColor White
Write-Host "  Node Version: $nodeVersion" -ForegroundColor White
Write-Host "  NPM Version: $npmVersion" -ForegroundColor White
Write-Host "  Build Time: $timestamp" -ForegroundColor White
Write-Host "  Output: .\build\" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure Claude Desktop with this MCP server" -ForegroundColor White
Write-Host "  2. Set environment variables for API keys (optional)" -ForegroundColor White
Write-Host "  3. Run tests: .\run-windows-tests.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Remember: ALWAYS build on Windows, NEVER in WSL2!" -ForegroundColor Yellow