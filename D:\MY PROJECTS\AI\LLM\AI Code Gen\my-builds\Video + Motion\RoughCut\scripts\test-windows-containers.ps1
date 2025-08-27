<#
.SYNOPSIS
    Tests the MCP server in Windows containers using standalone Docker Engine
.DESCRIPTION
    Runs comprehensive Windows container tests for the RoughCut MCP server
    testing various Node.js installation methods
#>

param(
    [switch]$Quick,
    [switch]$Verbose,
    [string]$TestService = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RoughCut MCP Windows Container Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Function to check Docker context
function Test-DockerContext {
    Write-Host "Checking Docker configuration..." -ForegroundColor Green
    
    $context = & docker context show 2>&1
    Write-Host "  Current context: $context" -ForegroundColor Cyan
    
    $version = & docker version --format json 2>&1 | ConvertFrom-Json
    
    if ($version.Server.Os -ne "windows") {
        Write-Host "  ERROR: Docker is not in Windows container mode!" -ForegroundColor Red
        Write-Host "  Current OS: $($version.Server.Os)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  To switch to Windows containers:" -ForegroundColor Yellow
        Write-Host "  docker context use windows-standalone" -ForegroundColor Cyan
        Write-Host "  OR" -ForegroundColor Gray
        Write-Host "  Use Docker Desktop and switch to Windows containers" -ForegroundColor Cyan
        return $false
    }
    
    Write-Host "  Docker OS: $($version.Server.Os) (Correct!)" -ForegroundColor Green
    Write-Host "  Docker Version: $($version.Server.Version)" -ForegroundColor Green
    return $true
}

# Check Docker is in Windows mode
if (-not (Test-DockerContext)) {
    exit 1
}

Write-Host ""
Write-Host "Building MCP server..." -ForegroundColor Green

# Build the project first
if (Test-Path "package.json") {
    Write-Host "  Installing dependencies..." -ForegroundColor Cyan
    & npm install
    
    Write-Host "  Building TypeScript..." -ForegroundColor Cyan
    & npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Build successful!" -ForegroundColor Green
}
else {
    Write-Host "  ERROR: package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting container tests..." -ForegroundColor Green
Write-Host ""

# Define which services to test
$services = @()
if ($TestService -eq "all") {
    $services = @(
        "test-node-standard",
        "test-node-nvm",
        "test-node-volta",
        "test-node-chocolatey",
        "test-node-scoop",
        "test-node-user"
    )
}
else {
    $services = @($TestService)
}

# Run tests
$testResults = @{}
$failedTests = @()

foreach ($service in $services) {
    Write-Host "Testing: $service" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    $startTime = Get-Date
    
    try {
        if ($Quick) {
            # Quick test - just build and run briefly
            Write-Host "  Building container..." -ForegroundColor Yellow
            & docker-compose -f docker-compose.test.yml build $service 2>&1 | Out-String
            
            Write-Host "  Running container..." -ForegroundColor Yellow
            $output = & docker-compose -f docker-compose.test.yml run --rm $service 2>&1 | Out-String
            
            if ($Verbose) {
                Write-Host $output -ForegroundColor Gray
            }
            
            $testResults[$service] = "PASSED"
            Write-Host "  Result: PASSED" -ForegroundColor Green
        }
        else {
            # Full test with output capture
            Write-Host "  Starting full test..." -ForegroundColor Yellow
            
            $output = & docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit $service 2>&1 | Out-String
            
            if ($Verbose) {
                Write-Host $output -ForegroundColor Gray
            }
            
            # Check for success indicators in output
            if ($output -match "test.*pass" -or $output -match "success" -or $output -match "MCP server found") {
                $testResults[$service] = "PASSED"
                Write-Host "  Result: PASSED" -ForegroundColor Green
            }
            else {
                $testResults[$service] = "FAILED"
                $failedTests += $service
                Write-Host "  Result: FAILED" -ForegroundColor Red
                
                if (-not $Verbose) {
                    Write-Host "  Last 10 lines of output:" -ForegroundColor Yellow
                    $lines = $output -split "`n"
                    $lines[-10..-1] | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
                }
            }
        }
    }
    catch {
        $testResults[$service] = "ERROR"
        $failedTests += $service
        Write-Host "  Result: ERROR - $_" -ForegroundColor Red
    }
    
    $duration = (Get-Date) - $startTime
    Write-Host "  Duration: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Gray
    Write-Host ""
}

# Clean up
Write-Host "Cleaning up containers..." -ForegroundColor Yellow
& docker-compose -f docker-compose.test.yml down 2>&1 | Out-Null

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults.Values | Where-Object { $_ -eq "PASSED" }).Count
$failed = ($testResults.Values | Where-Object { $_ -eq "FAILED" }).Count
$errors = ($testResults.Values | Where-Object { $_ -eq "ERROR" }).Count

foreach ($service in $services) {
    $result = $testResults[$service]
    $color = switch ($result) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "ERROR" { "Magenta" }
        default { "Gray" }
    }
    
    Write-Host "$service : $result" -ForegroundColor $color
}

Write-Host ""
Write-Host "Results: $passed passed, $failed failed, $errors errors" -ForegroundColor $(if ($failed -eq 0 -and $errors -eq 0) { "Green" } else { "Red" })

# Create test report
$reportPath = Join-Path $projectRoot "test-results\windows-container-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$reportDir = Split-Path $reportPath -Parent

if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    dockerContext = & docker context show
    dockerVersion = & docker version --format json | ConvertFrom-Json
    results = $testResults
    summary = @{
        passed = $passed
        failed = $failed
        errors = $errors
        total = $services.Count
    }
}

$report | ConvertTo-Json -Depth 10 | Set-Content $reportPath
Write-Host ""
Write-Host "Test report saved to: $reportPath" -ForegroundColor Cyan

# Exit code
if ($failed -gt 0 -or $errors -gt 0) {
    Write-Host ""
    Write-Host "Tests FAILED! See report for details." -ForegroundColor Red
    exit 1
}
else {
    Write-Host ""
    Write-Host "All tests PASSED!" -ForegroundColor Green
    exit 0
}