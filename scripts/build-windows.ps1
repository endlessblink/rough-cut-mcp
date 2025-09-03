# Remotion MCP Server Build Script
# Ensures Windows-only build to avoid WSL path issues

# WSL2 Detection and Block
if ($env:WSL_DISTRO_NAME -or (Test-Path "/proc/version")) {
    Write-Host "ERROR: Must build on Windows, not WSL2!" -ForegroundColor Red
    Write-Host "WSL paths break Windows execution." -ForegroundColor Red
    exit 1
}

Write-Host "Building Remotion MCP Server..." -ForegroundColor Green

# Check Node.js version
try {
    $nodeVersion = & node --version
    Write-Host "Using Node.js: $nodeVersion" -ForegroundColor Blue
    
    # Check if Node.js version is at least v18
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])
    
    if ($majorVersion -lt 18) {
        Write-Host "ERROR: Node.js v18+ required. Found: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js v18+." -ForegroundColor Red
    exit 1
}

# Check if TypeScript is available
try {
    $tscVersion = & npx tsc --version
    Write-Host "Using TypeScript: $tscVersion" -ForegroundColor Blue
} catch {
    Write-Host "ERROR: TypeScript not found. Run 'npm install' first." -ForegroundColor Red
    exit 1
}

# Clean build directory
if (Test-Path "build") {
    Remove-Item "build" -Recurse -Force
    Write-Host "Cleaned build directory" -ForegroundColor Yellow
}

# Create assets directory structure
Write-Host "Creating assets directory..." -ForegroundColor Blue
if (!(Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" | Out-Null
}
if (!(Test-Path "assets/projects")) {
    New-Item -ItemType Directory -Path "assets/projects" | Out-Null
}
Write-Host "Assets directory ready" -ForegroundColor Yellow

# Compile TypeScript
Write-Host "Compiling TypeScript..." -ForegroundColor Blue
& npx tsc

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: TypeScript compilation failed!" -ForegroundColor Red
    exit 1
}

# Validate build output for WSL paths
Write-Host "Validating build output..." -ForegroundColor Blue
$buildContent = Get-Content "build/index.js" -Raw -ErrorAction SilentlyContinue

if ($buildContent -match "/mnt/[cd]/") {
    Write-Host "CRITICAL: WSL paths found in build!" -ForegroundColor Red
    Write-Host "This will break Windows execution. Build aborted." -ForegroundColor Red
    exit 1
}

# Make index.js executable
if (Test-Path "build/index.js") {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Entry point: build/index.js" -ForegroundColor Blue
    
    # Show build stats
    $buildSize = (Get-Item "build/index.js").Length
    Write-Host "Build size: $([math]::Round($buildSize / 1KB, 1)) KB" -ForegroundColor Blue
    
    # Verify assets directory
    if (Test-Path "assets/projects") {
        Write-Host "Assets directory: assets/projects/" -ForegroundColor Blue
    } else {
        Write-Host "WARNING: Assets directory not found" -ForegroundColor Yellow
    }
    
    Write-Host "`nTo use with Claude Desktop:" -ForegroundColor Cyan
    Write-Host "Add to your Claude Desktop config:" -ForegroundColor Cyan
    $currentPath = (Get-Location).Path
    Write-Host @"
{
  "mcpServers": {
    "remotion": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["$currentPath\\build\\index.js"]
    }
  }
}
"@ -ForegroundColor White
    
} else {
    Write-Host "ERROR: Build file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nBuild completed successfully!" -ForegroundColor Green