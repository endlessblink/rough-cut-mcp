# Reliable Claude Desktop Cache Clear and Restart Script
# Run this in PowerShell as Administrator

param(
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

Write-Host "Claude Desktop Cache Clear & Restart Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

function Write-Status($message, $color = "White") {
    if ($Verbose) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $message" -ForegroundColor $color
    }
}

function Kill-ClaudeProcesses {
    Write-Host "Killing Claude Desktop processes..." -ForegroundColor Yellow
    
    $processes = @("Claude", "claude-desktop", "claude.exe", "claude-desktop.exe")
    $killed = 0
    
    foreach ($proc in $processes) {
        try {
            $running = Get-Process -Name $proc -ErrorAction SilentlyContinue
            if ($running) {
                Write-Status "Killing $proc processes..." "Red"
                Stop-Process -Name $proc -Force -ErrorAction SilentlyContinue
                Write-Host "  SUCCESS: Stopped $proc" -ForegroundColor Green
                $killed++
            } else {
                Write-Status "$proc not running" "Gray"
            }
        } catch {
            Write-Status "Error stopping $proc - may not be running" "Yellow"
        }
    }
    
    if ($killed -gt 0) {
        Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "No Claude processes were running" -ForegroundColor Blue
    }
}

function Clear-ClaudeCache {
    Write-Host "Clearing Claude Desktop cache..." -ForegroundColor Yellow
    
    $cacheLocations = @(
        "$env:APPDATA\Claude\cache",
        "$env:APPDATA\Claude\logs", 
        "$env:APPDATA\Claude\tmp",
        "$env:APPDATA\Claude\DevTools Extensions",
        "$env:LOCALAPPDATA\Claude\cache",
        "$env:LOCALAPPDATA\Claude\logs"
    )
    
    $cleared = 0
    foreach ($cache in $cacheLocations) {
        if (Test-Path $cache) {
            try {
                Remove-Item -Recurse -Force $cache -ErrorAction SilentlyContinue
                Write-Host "  SUCCESS: Cleared $cache" -ForegroundColor Green
                $cleared++
            } catch {
                Write-Host "  WARNING: Could not clear $cache (may be in use)" -ForegroundColor Yellow
            }
        } else {
            Write-Status "Cache not found: $cache" "Gray"
        }
    }
    
    if ($cleared -eq 0) {
        Write-Host "No cache directories found to clear" -ForegroundColor Blue
    }
}

function Clear-NodeCache {
    Write-Host "Clearing Node.js MCP cache..." -ForegroundColor Yellow
    
    $nodeCacheLocations = @(
        "$env:APPDATA\npm-cache",
        "$env:LOCALAPPDATA\npm-cache"
    )
    
    foreach ($nodeCache in $nodeCacheLocations) {
        if (Test-Path $nodeCache) {
            try {
                # Only clear MCP-related cache
                $mcpCachePattern = "$nodeCache\*mcp*"
                Get-ChildItem -Path $nodeCache -Filter "*mcp*" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  SUCCESS: Cleared MCP cache from $nodeCache" -ForegroundColor Green
            } catch {
                Write-Status "Could not clear Node cache: $nodeCache" "Yellow"
            }
        }
    }
}

function Restart-Claude {
    Write-Host "Starting Claude Desktop..." -ForegroundColor Green
    
    $claudePaths = @(
        "$env:LOCALAPPDATA\Claude\Claude.exe",
        "$env:ProgramFiles\Claude\Claude.exe", 
        "$env:ProgramFiles(x86)\Claude\Claude.exe",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Claude\Claude.exe"
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
        Write-Host "  WARNING: Could not find Claude executable - please start manually" -ForegroundColor Yellow
        Write-Host "     Common locations:" -ForegroundColor Gray
        $claudePaths | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }
    }
}

function Test-MCPLoading {
    Write-Host "Testing MCP loading..." -ForegroundColor Cyan
    Write-Host "   After Claude starts, check for these files:"
    Write-Host "   - /tmp/mcp-tools-list.txt (tool listing)" -ForegroundColor Gray
    Write-Host "   - /tmp/mcp-request.txt (tool execution)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Expected version: 9.0.0 with AST-Based Conversion"
}

# Main execution
try {
    Kill-ClaudeProcesses
    
    Clear-ClaudeCache
    
    if ($Force) {
        Clear-NodeCache
        Write-Host "Force mode: Also cleared Node.js MCP cache" -ForegroundColor Blue
    }
    
    Write-Host "Waiting for clean shutdown..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Restart-Claude
    
    Write-Host ""
    Write-Host "SUCCESS: Claude Desktop restart complete!" -ForegroundColor Green
    Write-Host ""
    
    Test-MCPLoading
    
} catch {
    Write-Host "ERROR during restart: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Try running as Administrator or manual restart" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait for Claude Desktop to fully load" -ForegroundColor White  
Write-Host "2. Check version with get_mcp_info tool" -ForegroundColor White
Write-Host "3. Look for atomic tracking files in /tmp/" -ForegroundColor White
Write-Host "4. If v9.0.0 loads, test artifact conversion" -ForegroundColor White