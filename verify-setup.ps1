# Verification script for Rough Cut MCP setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Rough Cut MCP - Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Get the directory where this script is located
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$projectRoot = $scriptDir

Write-Host "Project root: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js installation
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    (Get-Command node -ErrorAction SilentlyContinue).Path
)

$nodeCommand = $null
foreach ($path in $nodePaths) {
    if ($path -and (Test-Path $path)) {
        $nodeCommand = $path
        break
    }
}

if ($nodeCommand) {
    $nodeVersion = & $nodeCommand --version
    Write-Host "  Success: Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Host "  Path: $nodeCommand" -ForegroundColor Gray
}
else {
    Write-Host "  Error: Node.js not found!" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org" -ForegroundColor Gray
    $errors++
}

# 2. Check build files
Write-Host ""
Write-Host "[2/5] Checking build files..." -ForegroundColor Yellow
$buildPath = Join-Path $projectRoot "build\index.js"
if (Test-Path $buildPath) {
    $buildDate = (Get-Item $buildPath).LastWriteTime
    Write-Host "  Success: Build found (last modified: $buildDate)" -ForegroundColor Green
    
    # Check if VIDEO_CREATION is in the build
    $toolCategoriesPath = Join-Path $projectRoot "build\types\tool-categories.js"
    if (Test-Path $toolCategoriesPath) {
        $content = Get-Content $toolCategoriesPath -Raw
        if ($content -match "VIDEO_CREATION") {
            Write-Host "  Success: Video creation tools included in build" -ForegroundColor Green
        }
        else {
            Write-Host "  Warning: Video creation tools not found in build" -ForegroundColor Yellow
            Write-Host "    Run: npm run build" -ForegroundColor Gray
            $warnings++
        }
    }
}
else {
    Write-Host "  Error: Build not found at: $buildPath" -ForegroundColor Red
    Write-Host "    Run: npm run build (in Windows PowerShell)" -ForegroundColor Gray
    $errors++
}

# 3. Check assets directory
Write-Host ""
Write-Host "[3/5] Checking assets directory..." -ForegroundColor Yellow
$assetsPath = Join-Path $projectRoot "assets"
if (Test-Path $assetsPath) {
    Write-Host "  Success: Assets directory exists" -ForegroundColor Green
    
    # Check subdirectories
    $subdirs = @("projects", "videos", "images", "sounds", "cache")
    foreach ($subdir in $subdirs) {
        $subPath = Join-Path $assetsPath $subdir
        if (Test-Path $subPath) {
            Write-Host "    Success: $subdir/" -ForegroundColor Green
        }
        else {
            New-Item -ItemType Directory -Path $subPath -Force | Out-Null
            Write-Host "    + Created $subdir/" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "  Error: Assets directory not found" -ForegroundColor Red
    $errors++
}

# 4. Check Claude Desktop configuration
Write-Host ""
Write-Host "[4/5] Checking Claude Desktop configuration..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "  Success: Configuration file found" -ForegroundColor Green
    
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.mcpServers.'rough-cut-mcp') {
        Write-Host "  Success: Rough Cut MCP is configured" -ForegroundColor Green
        
        # Verify paths in config
        $configuredBuild = $config.mcpServers.'rough-cut-mcp'.args[0]
        $expectedBuild = Join-Path $projectRoot "build\index.js"
        
        # Normalize paths for comparison (handle different formats)
        $configuredBuildNorm = $configuredBuild -replace '\\', '/' -replace '/+', '/'
        $expectedBuildNorm = $expectedBuild -replace '\\', '/' -replace '/+', '/'
        
        if ($configuredBuildNorm -eq $expectedBuildNorm) {
            Write-Host "  Success: Build path is correct" -ForegroundColor Green
        }
        else {
            Write-Host "  Warning: Build path mismatch in config" -ForegroundColor Yellow
            Write-Host "    Expected: $expectedBuild" -ForegroundColor Gray
            Write-Host "    Found: $configuredBuild" -ForegroundColor Gray
            Write-Host "    Run: .\setup-claude-desktop.ps1 to update" -ForegroundColor Gray
            $warnings++
        }
    }
    else {
        Write-Host "  Warning: Rough Cut MCP not configured" -ForegroundColor Yellow
        Write-Host "    Run: .\setup-claude-desktop.ps1" -ForegroundColor Gray
        $warnings++
    }
}
else {
    Write-Host "  Warning: Claude Desktop config not found" -ForegroundColor Yellow
    Write-Host "    Run: .\setup-claude-desktop.ps1" -ForegroundColor Gray
    $warnings++
}

# 5. Check if Claude Desktop is running
Write-Host ""
Write-Host "[5/5] Checking Claude Desktop process..." -ForegroundColor Yellow
$claudeProcess = Get-Process -Name "Claude" -ErrorAction SilentlyContinue
if ($claudeProcess) {
    Write-Host "  Info: Claude Desktop is running" -ForegroundColor Cyan
    Write-Host "    Restart required to load changes" -ForegroundColor Yellow
    $warnings++
}
else {
    Write-Host "  Success: Claude Desktop is not running" -ForegroundColor Green
    Write-Host "    Ready to start with new configuration" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "Success: Everything is configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to use Rough Cut MCP with 9 tools:" -ForegroundColor Green
    Write-Host "  * Discovery: discover, activate, search" -ForegroundColor White
    Write-Host "  * Core: project, studio" -ForegroundColor White
    Write-Host "  * Video: create-video, composition, analyze-video, render" -ForegroundColor White
}
elseif ($errors -gt 0) {
    Write-Host "Error: Found $errors critical error(s)" -ForegroundColor Red
    Write-Host "Please fix the errors above before continuing." -ForegroundColor Yellow
}
else {
    Write-Host "Warning: Found $warnings warning(s)" -ForegroundColor Yellow
    Write-Host "The setup should work but may need adjustments." -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")