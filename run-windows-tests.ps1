# Windows E2E Test Validation Script
# Must be run in Windows PowerShell or CMD, NOT WSL2!

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ROUGHCUT MCP - WINDOWS E2E TEST SUITE" -ForegroundColor Cyan
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
    Write-Host "ERROR: This script is running in WSL2!" -ForegroundColor Red
    Write-Host "You MUST run this in Windows PowerShell or CMD!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run properly:" -ForegroundColor Yellow
    Write-Host "1. Open Windows PowerShell (not WSL terminal)" -ForegroundColor Yellow
    Write-Host "2. Navigate to: D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut" -ForegroundColor Yellow
    Write-Host "3. Run: .\run-windows-tests.ps1" -ForegroundColor Yellow
    exit 1
}

# Verify we're in the correct directory
$expectedPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
$currentPath = (Get-Location).Path

if ($currentPath -ne $expectedPath) {
    Write-Host "WARNING: Not in expected directory" -ForegroundColor Yellow
    Write-Host "Current: $currentPath" -ForegroundColor Yellow
    Write-Host "Expected: $expectedPath" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne 'y') {
        exit 1
    }
}

Write-Host "Platform Verification:" -ForegroundColor Green
Write-Host "  OS: $([System.Environment]::OSVersion.Platform)" -ForegroundColor White
Write-Host "  Version: $([System.Environment]::OSVersion.Version)" -ForegroundColor White
Write-Host "  Path Style: Windows Native" -ForegroundColor White
Write-Host "  Current Dir: $currentPath" -ForegroundColor White
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js Installation..." -ForegroundColor Cyan
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

# Function to run test and capture results
function Run-Test {
    param(
        [string]$TestName,
        [string]$TestFile,
        [string]$Description
    )
    
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Running: $TestName" -ForegroundColor Yellow
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host "================================================" -ForegroundColor Cyan
    
    if (-not (Test-Path $TestFile)) {
        Write-Host "ERROR: Test file not found: $TestFile" -ForegroundColor Red
        return @{
            Name = $TestName
            Status = "FAILED"
            Error = "Test file not found"
        }
    }
    
    $startTime = Get-Date
    # Set UTF-8 encoding to fix garbled characters
    $oldEncoding = [Console]::OutputEncoding
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $output = node $TestFile 2>&1
    $exitCode = $LASTEXITCODE
    [Console]::OutputEncoding = $oldEncoding
    $duration = ((Get-Date) - $startTime).TotalSeconds
    
    if ($exitCode -eq 0) {
        Write-Host "SUCCESS: Test passed in $duration seconds" -ForegroundColor Green
        Write-Host ""
        return @{
            Name = $TestName
            Status = "PASSED"
            Duration = $duration
            Output = $output
        }
    }
    else {
        Write-Host "FAILED: Test failed with exit code $exitCode" -ForegroundColor Red
        Write-Host "Error Output:" -ForegroundColor Red
        Write-Host $output
        Write-Host ""
        return @{
            Name = $TestName
            Status = "FAILED"
            Duration = $duration
            ExitCode = $exitCode
            Output = $output
        }
    }
}

# Initialize results array
$testResults = @()

# Test 1: Validate Installation
Write-Host ""
$result = Run-Test `
    -TestName "Installation Validation" `
    -TestFile "tests\validate-installation.js" `
    -Description "Validates Node.js version, NPM package structure, and Claude Desktop config generation"
$testResults += $result

# Test 2: Check Dependencies
Write-Host ""
$result = Run-Test `
    -TestName "Dependency Check" `
    -TestFile "tests\check-dependencies.js" `
    -Description "Checks all required dependencies, Remotion setup, and API connectivity"
$testResults += $result

# Test 3: Complete Workflow Test
Write-Host ""
$result = Run-Test `
    -TestName "Complete Workflow" `
    -TestFile "tests\test-complete-workflow.js" `
    -Description "Tests full MCP workflow including tool discovery, video creation, and asset management"
$testResults += $result

# Test 4: Fresh Install Simulation
Write-Host ""
$result = Run-Test `
    -TestName "Fresh Install Simulation" `
    -TestFile "scripts\test-fresh-install.js" `
    -Description "Simulates complete new user experience from NPM install to first use"
$testResults += $result

# Additional Windows-specific tests
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Running Windows-Specific Validations" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Check for Windows paths in build output
Write-Host "Checking for correct Windows paths in build..." -ForegroundColor Cyan
$buildFile = "build\index.js"
if (Test-Path $buildFile) {
    $content = Get-Content $buildFile -Raw
    if ($content -match "/mnt/[cd]/") {
        Write-Host "ERROR: WSL paths found in build!" -ForegroundColor Red
        Write-Host "Build must be created on Windows, not WSL2!" -ForegroundColor Red
        Write-Host "Run 'npm run build' in Windows PowerShell!" -ForegroundColor Red
        $testResults += @{
            Name = "Windows Path Validation"
            Status = "FAILED"
            Error = "WSL paths found in build output"
        }
    }
    else {
        Write-Host "SUCCESS: No WSL paths found in build" -ForegroundColor Green
        $testResults += @{
            Name = "Windows Path Validation"
            Status = "PASSED"
        }
    }
}
else {
    Write-Host "WARNING: Build file not found. Run 'npm run build' first." -ForegroundColor Yellow
    $testResults += @{
        Name = "Windows Path Validation"
        Status = "SKIPPED"
        Error = "Build file not found"
    }
}

# Check MCP configuration format
Write-Host ""
Write-Host "Validating MCP Configuration Format..." -ForegroundColor Cyan
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.mcpServers.'rough-cut-mcp') {
        $mcpConfig = $config.mcpServers.'rough-cut-mcp'
        if ($mcpConfig.command -match "^[A-Z]:\\") {
            Write-Host "SUCCESS: MCP config uses Windows paths" -ForegroundColor Green
            $testResults += @{
                Name = "MCP Configuration"
                Status = "PASSED"
            }
        }
        else {
            Write-Host "ERROR: MCP config doesn't use Windows paths!" -ForegroundColor Red
            $testResults += @{
                Name = "MCP Configuration"
                Status = "FAILED"
                Error = "Invalid path format in config"
            }
        }
    }
    else {
        Write-Host "INFO: RoughCut MCP not configured in Claude Desktop" -ForegroundColor Yellow
        $testResults += @{
            Name = "MCP Configuration"
            Status = "NOT_CONFIGURED"
        }
    }
}
else {
    Write-Host "INFO: Claude Desktop config not found" -ForegroundColor Yellow
    $testResults += @{
        Name = "MCP Configuration"
        Status = "NOT_FOUND"
    }
}

# Generate test report
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "          WINDOWS E2E TEST REPORT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$skipped = ($testResults | Where-Object { $_.Status -eq "SKIPPED" -or $_.Status -eq "NOT_CONFIGURED" -or $_.Status -eq "NOT_FOUND" }).Count
$total = $testResults.Count

Write-Host "Test Results Summary:" -ForegroundColor White
Write-Host "  Total Tests: $total" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "  Skipped/Info: $skipped" -ForegroundColor Yellow
Write-Host ""

Write-Host "Individual Test Results:" -ForegroundColor White
foreach ($test in $testResults) {
    $statusColor = switch ($test.Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        default { "Yellow" }
    }
    Write-Host "  [$($test.Status)]" -ForegroundColor $statusColor -NoNewline
    Write-Host " $($test.Name)" -ForegroundColor White
    if ($test.Error) {
        Write-Host "         Error: $($test.Error)" -ForegroundColor Gray
    }
}

# Generate timestamp for report
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportPath = "test-results\windows-e2e-report_$timestamp.json"

# Create test-results directory if it doesn't exist
if (-not (Test-Path "test-results")) {
    New-Item -ItemType Directory -Path "test-results" | Out-Null
}

# Save detailed report
$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Platform = @{
        OS = [System.Environment]::OSVersion.Platform.ToString()
        Version = [System.Environment]::OSVersion.Version.ToString()
        IsWSL = $false
        NodeVersion = $nodeVersion
        NpmVersion = $npmVersion
    }
    Summary = @{
        Total = $total
        Passed = $passed
        Failed = $failed
        Skipped = $skipped
        SuccessRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
    }
    Tests = $testResults
}

$report | ConvertTo-Json -Depth 10 | Out-File $reportPath

Write-Host ""
Write-Host "Detailed report saved: $reportPath" -ForegroundColor Cyan
Write-Host ""

# Final verdict
if ($failed -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "    ALL TESTS PASSED - READY FOR PRODUCTION!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor White
    Write-Host "1. Publish to NPM: npm publish" -ForegroundColor White
    Write-Host "2. Share installation instructions with users" -ForegroundColor White
    Write-Host "3. Monitor for issues and feedback" -ForegroundColor White
    exit 0
}
else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "    TESTS FAILED - FIXES REQUIRED!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Critical Issues to Fix:" -ForegroundColor Yellow
    foreach ($test in ($testResults | Where-Object { $_.Status -eq "FAILED" })) {
        Write-Host "  - $($test.Name): $($test.Error)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Run 'npm run build' in Windows PowerShell if WSL paths were found" -ForegroundColor Yellow
    exit 1
}