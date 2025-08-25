# Quick Windows Test Script for RoughCut MCP
# Fast validation without running all tests

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ROUGHCUT MCP - QUICK WINDOWS TEST" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verify Windows platform
$isWSL = $false
if (Test-Path "/proc/version") {
    $procVersion = Get-Content "/proc/version" -ErrorAction SilentlyContinue
    if ($procVersion -match "Microsoft|WSL") {
        $isWSL = $true
    }
}

if ($isWSL -or $env:WSL_DISTRO_NAME) {
    Write-Host "ERROR: Running in WSL2 - Switch to Windows PowerShell!" -ForegroundColor Red
    exit 1
}

Write-Host "Platform Check:" -ForegroundColor Green
Write-Host "  OS: Windows Native" -ForegroundColor White
Write-Host "  Path Style: Windows (D:\...)" -ForegroundColor White
Write-Host ""

# Check Node.js
Write-Host "Node.js Check:" -ForegroundColor Green
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor White
    $npmVersion = npm --version 2>$null
    Write-Host "  NPM: $npmVersion" -ForegroundColor White
}
else {
    Write-Host "  ERROR: Node.js not installed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check build
Write-Host "Build Check:" -ForegroundColor Green
if (Test-Path "build\index.js") {
    $buildContent = Get-Content "build\index.js" -Raw -ErrorAction SilentlyContinue
    if ($buildContent -match "/mnt/[cd]/") {
        Write-Host "  ERROR: WSL paths in build!" -ForegroundColor Red
        Write-Host "  Run .\build-windows.ps1 to rebuild" -ForegroundColor Yellow
        $buildStatus = "FAILED"
    }
    else {
        Write-Host "  Build exists with Windows paths" -ForegroundColor White
        $buildStatus = "PASSED"
    }
}
else {
    Write-Host "  Build not found - run .\build-windows.ps1" -ForegroundColor Yellow
    $buildStatus = "MISSING"
}
Write-Host ""

# Check dependencies
Write-Host "Dependencies Check:" -ForegroundColor Green
if (Test-Path "node_modules") {
    $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "  Node modules: $moduleCount packages" -ForegroundColor White
}
else {
    Write-Host "  No dependencies installed - run npm install" -ForegroundColor Yellow
}
Write-Host ""

# Check MCP config
Write-Host "MCP Configuration Check:" -ForegroundColor Green
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "  Claude config exists" -ForegroundColor White
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.mcpServers.'rough-cut-mcp') {
        Write-Host "  RoughCut MCP is configured" -ForegroundColor White
    }
    else {
        Write-Host "  RoughCut MCP not in config" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  Claude Desktop not configured" -ForegroundColor Yellow
}
Write-Host ""

# Check test files
Write-Host "Test Files Check:" -ForegroundColor Green
$testFiles = @(
    "tests\validate-installation.js",
    "tests\check-dependencies.js",
    "tests\test-complete-workflow.js",
    "scripts\test-fresh-install.js"
)
$foundTests = 0
foreach ($test in $testFiles) {
    if (Test-Path $test) {
        $foundTests++
    }
}
Write-Host "  Test files: $foundTests/$($testFiles.Count) found" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   QUICK TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$issues = @()

if ($buildStatus -eq "FAILED") {
    $issues += "Build contains WSL paths"
}
elseif ($buildStatus -eq "MISSING") {
    $issues += "Build not found"
}

if ($foundTests -lt $testFiles.Count) {
    $issues += "Some test files missing"
}

if ($issues.Count -eq 0) {
    Write-Host "  STATUS: READY" -ForegroundColor Green
    Write-Host ""
    Write-Host "All checks passed! You can:" -ForegroundColor White
    Write-Host "  - Run full tests: .\run-windows-tests.ps1" -ForegroundColor White
    Write-Host "  - Use the MCP server in Claude Desktop" -ForegroundColor White
}
else {
    Write-Host "  STATUS: ISSUES FOUND" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Issues to fix:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Recommended actions:" -ForegroundColor White
    if ($buildStatus -ne "PASSED") {
        Write-Host "  1. Run: .\build-windows.ps1" -ForegroundColor White
    }
    if ($foundTests -lt $testFiles.Count) {
        Write-Host "  2. Ensure all test files are present" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "For detailed testing run: .\run-windows-tests.ps1" -ForegroundColor Cyan