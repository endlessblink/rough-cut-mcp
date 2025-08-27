# Windows Build Script - Ensures Windows-compatible paths
# Run this from Windows PowerShell to create clean builds

Write-Host "Windows Build Script for RoughCut MCP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get the script's directory (project root)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Project root: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Step 1: Clean previous build
Write-Host "Step 1: Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Path "build" -Recurse -Force
    Write-Host "  Removed old build directory" -ForegroundColor Green
}
else {
    Write-Host "  No build directory to clean" -ForegroundColor Gray
}

# Step 2: Check Node.js is Windows version
Write-Host ""
Write-Host "Step 2: Verifying Windows Node.js..." -ForegroundColor Yellow
$nodePath = (Get-Command node).Source
Write-Host "  Node.js path: $nodePath" -ForegroundColor Cyan

if ($nodePath -like "*WSL*" -or $nodePath -like "*/usr/*") {
    Write-Host "  ERROR: Using WSL Node.js!" -ForegroundColor Red
    Write-Host "  Please use Windows Node.js from nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "  Using Windows Node.js - OK" -ForegroundColor Green

# Step 3: Install dependencies if needed
Write-Host ""
Write-Host "Step 3: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: npm install failed" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "  Dependencies already installed" -ForegroundColor Green
}

# Step 4: Build TypeScript
Write-Host ""
Write-Host "Step 4: Building TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Build successful" -ForegroundColor Green

# Step 5: Check for WSL paths in build
Write-Host ""
Write-Host "Step 5: Checking for WSL paths..." -ForegroundColor Yellow

$wslPathFound = $false
Get-ChildItem -Path "build" -Recurse -Filter "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "/mnt/[a-z]/") {
        Write-Host "  ERROR: WSL path found in $($_.Name)" -ForegroundColor Red
        $matches = [regex]::Matches($content, "/mnt/[a-z]/[^'`"]*")
        foreach ($match in $matches) {
            Write-Host "    Found: $($match.Value)" -ForegroundColor Yellow
        }
        $wslPathFound = $true
    }
}

if ($wslPathFound) {
    Write-Host ""
    Write-Host "  CRITICAL ERROR: WSL paths found in build!" -ForegroundColor Red
    Write-Host "  This build will fail on other Windows machines" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "  No WSL paths found - build is clean!" -ForegroundColor Green
}

# Step 6: Run basic test
Write-Host ""
Write-Host "Step 6: Running basic test..." -ForegroundColor Yellow

$testScript = @"
const path = require('path');
console.log('Testing path resolution...');
const testPath = path.resolve('./assets');
if (testPath.includes('/mnt/')) {
    console.error('ERROR: WSL path detected:', testPath);
    process.exit(1);
}
console.log('Path resolution OK:', testPath);
"@

$testScript | Out-File -FilePath "test-paths.js" -Encoding UTF8
node test-paths.js
$testResult = $LASTEXITCODE
Remove-Item "test-paths.js"

if ($testResult -ne 0) {
    Write-Host "  ERROR: Path test failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Path test passed" -ForegroundColor Green

# Step 7: Display summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build location: $projectRoot\build" -ForegroundColor Cyan
Write-Host "Main file: $projectRoot\build\index.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test locally: node `"$projectRoot\build\index.js`"" -ForegroundColor White
Write-Host "2. Update Claude Desktop config with Windows path" -ForegroundColor White
Write-Host "3. Push to GitHub to trigger CI tests" -ForegroundColor White
Write-Host ""