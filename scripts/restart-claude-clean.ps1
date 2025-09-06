# Reliable Claude Desktop Cache Clear and Restart Script
# Fixes MCP server disconnection issues caused by caching

param(
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

Write-Host "Claude Desktop Cache Clear & Restart Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "This script fixes MCP server disconnection issues." -ForegroundColor Green
Write-Host ""

function Write-Status($message, $color = "White") {
    if ($Verbose) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $message" -ForegroundColor $color
    }
}

function Kill-ClaudeProcesses {
    Write-Host "Step 1: FORCE KILLING ALL Claude Desktop processes..." -ForegroundColor Yellow
    
    # More aggressive process names and patterns
    $processPatterns = @("*Claude*", "*claude*")
    $processNames = @("Claude", "claude-desktop", "claude.exe", "claude-desktop.exe", "Claude.exe")
    $killed = 0
    
    # Kill by process name patterns first
    foreach ($pattern in $processPatterns) {
        try {
            $matchingProcs = Get-Process | Where-Object { $_.ProcessName -like $pattern }
            foreach ($proc in $matchingProcs) {
                Write-Host "  KILLING: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Red
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                $killed++
            }
        } catch {
            Write-Status "Error with pattern $pattern" "Yellow"
        }
    }
    
    # Also try specific process names
    foreach ($procName in $processNames) {
        try {
            $running = Get-Process -Name $procName -ErrorAction SilentlyContinue
            if ($running) {
                Write-Host "  KILLING: $procName (PID: $($running.Id))" -ForegroundColor Red
                Stop-Process -Name $procName -Force -ErrorAction SilentlyContinue
                $killed++
            }
        } catch {
            # Ignore errors, process may already be dead
        }
    }
    
    # Use taskkill as backup for stubborn processes
    try {
        Start-Process -FilePath "taskkill" -ArgumentList "/F", "/IM", "Claude.exe", "/T" -WindowStyle Hidden -ErrorAction SilentlyContinue
        Start-Process -FilePath "taskkill" -ArgumentList "/F", "/IM", "claude-desktop.exe", "/T" -WindowStyle Hidden -ErrorAction SilentlyContinue
        Write-Host "  BACKUP: Used taskkill for stubborn processes" -ForegroundColor Red
    } catch {
        # Ignore taskkill errors
    }
    
    Write-Host "  KILLED: $killed Claude processes total" -ForegroundColor Green
    Write-Host "  Waiting for complete termination..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8  # Longer wait for complete cleanup
    
    # Verify all Claude processes are dead
    $remaining = Get-Process | Where-Object { $_.ProcessName -like "*Claude*" -or $_.ProcessName -like "*claude*" }
    if ($remaining) {
        Write-Host "  WARNING: $($remaining.Count) Claude processes still running" -ForegroundColor Yellow
        foreach ($proc in $remaining) {
            Write-Host "    Still running: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  SUCCESS: All Claude processes terminated" -ForegroundColor Green
    }
}

function Clear-ClaudeCache {
    Write-Host "Step 2: Clearing Claude Desktop cache..." -ForegroundColor Yellow
    
    $cacheLocations = @(
        "$env:APPDATA\Claude\cache",
        "$env:APPDATA\Claude\logs", 
        "$env:APPDATA\Claude\tmp",
        "$env:LOCALAPPDATA\Claude\cache",
        "$env:LOCALAPPDATA\Claude\logs"
    )
    
    $cleared = 0
    foreach ($cache in $cacheLocations) {
        if (Test-Path $cache) {
            try {
                $size = (Get-ChildItem -Recurse $cache -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                $sizeStr = if ($size) { "{0:N1} KB" -f ($size / 1KB) } else { "Empty" }
                
                Remove-Item -Recurse -Force $cache -ErrorAction SilentlyContinue
                Write-Host "  SUCCESS: Cleared $cache ($sizeStr)" -ForegroundColor Green
                $cleared++
            } catch {
                Write-Host "  WARNING: Could not clear $cache" -ForegroundColor Yellow
            }
        } else {
            Write-Status "Not found: $cache" "Gray"
        }
    }
    
    if ($cleared -eq 0) {
        Write-Host "  No cache directories found" -ForegroundColor Blue
    } else {
        Write-Host "  Cleared $cleared cache locations" -ForegroundColor Green
    }
}

function Clear-NodeMCPCache {
    Write-Host "Step 3: Clearing Node.js MCP cache..." -ForegroundColor Yellow
    
    $nodeCacheLocations = @(
        "$env:APPDATA\npm-cache",
        "$env:LOCALAPPDATA\npm-cache"
    )
    
    foreach ($nodeCache in $nodeCacheLocations) {
        if (Test-Path $nodeCache) {
            try {
                Get-ChildItem -Path $nodeCache -Filter "*mcp*" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  SUCCESS: Cleared MCP cache from $nodeCache" -ForegroundColor Green
            } catch {
                Write-Status "Could not clear Node cache: $nodeCache" "Yellow"
            }
        }
    }
}

function Start-ClaudeDesktop {
    Write-Host "Step 4: Starting Claude Desktop..." -ForegroundColor Green
    
    $claudePaths = @(
        "$env:LOCALAPPDATA\Claude\Claude.exe",
        "$env:LOCALAPPDATA\Programs\Claude\Claude.exe",
        "$env:ProgramFiles\Claude\Claude.exe", 
        "$env:ProgramFiles(x86)\Claude\Claude.exe"
    )
    
    $claudeFound = $false
    foreach ($path in $claudePaths) {
        if (Test-Path $path) {
            try {
                Write-Host "  SUCCESS: Starting Claude from $path" -ForegroundColor Green
                Start-Process -FilePath $path -WindowStyle Normal
                $claudeFound = $true
                break
            } catch {
                Write-Status "Could not start Claude from: $path" "Yellow"
            }
        }
    }
    
    if (-not $claudeFound) {
        Write-Host "  INFO: Claude executable not found - please start manually" -ForegroundColor Yellow
        Write-Host "  Common locations checked:" -ForegroundColor Gray
        $claudePaths | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }
        Write-Host "  Please start Claude Desktop manually from Start Menu" -ForegroundColor Cyan
    }
}

# Main execution
try {
    Write-Host "Starting cache clear and restart process..." -ForegroundColor Cyan
    Write-Host ""
    
    Kill-ClaudeProcesses
    
    Clear-ClaudeCache
    
    if ($Force) {
        Clear-NodeMCPCache
    }
    
    Write-Host "Waiting for clean shutdown..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Start-ClaudeDesktop
    
    Write-Host ""
    Write-Host "SUCCESS: Process complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Wait for Claude Desktop to fully load" -ForegroundColor White  
    Write-Host "2. Check MCP version (should show 9.0.1)" -ForegroundColor White
    Write-Host "3. Look for log files in logs/ folder" -ForegroundColor White
    Write-Host "4. Test artifact conversion" -ForegroundColor White
    Write-Host ""
    Write-Host "Expected log files:" -ForegroundColor Cyan
    Write-Host "  - logs/mcp-tools-list.log" -ForegroundColor Gray
    Write-Host "  - logs/mcp-requests.log" -ForegroundColor Gray
    Write-Host "  - logs/mcp-tool-calls.log" -ForegroundColor Gray
    Write-Host "  - logs/mcp-function-calls.log" -ForegroundColor Gray
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running as Administrator" -ForegroundColor Yellow
}