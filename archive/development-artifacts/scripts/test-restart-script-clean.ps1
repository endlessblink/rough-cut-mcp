# Safe Test Version of Claude Desktop Restart Script
# This version only CHECKS what it would do, doesn't actually kill processes

param(
    [switch]$WhatIf = $true,
    [switch]$Verbose = $true
)

Write-Host "TESTING Claude Desktop Cache Clear Script (Safe Mode)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "This test will only CHECK what would be done, not actually do it." -ForegroundColor Green
Write-Host ""

function Write-Status($message, $color = "White") {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $message" -ForegroundColor $color
}

function Test-ClaudeProcesses {
    Write-Host "Checking for Claude Desktop processes..." -ForegroundColor Yellow
    
    $processes = @("Claude", "claude-desktop", "claude.exe", "claude-desktop.exe")
    $foundProcesses = @()
    
    foreach ($proc in $processes) {
        try {
            $running = Get-Process -Name $proc -ErrorAction SilentlyContinue
            if ($running) {
                $foundProcesses += $proc
                Write-Status "FOUND: $proc (PID: $($running.Id)) - WOULD KILL" "Red"
            } else {
                Write-Status "NOT RUNNING: $proc - No action needed" "Green"
            }
        } catch {
            Write-Status "ERROR checking $proc - May need admin rights" "Yellow"
        }
    }
    
    return $foundProcesses
}

function Test-ClaudeCache {
    Write-Host "Checking Claude Desktop cache locations..." -ForegroundColor Yellow
    
    $cacheLocations = @(
        "$env:APPDATA\Claude\cache",
        "$env:APPDATA\Claude\logs", 
        "$env:APPDATA\Claude\tmp",
        "$env:APPDATA\Claude\DevTools Extensions",
        "$env:LOCALAPPDATA\Claude\cache",
        "$env:LOCALAPPDATA\Claude\logs"
    )
    
    $foundCaches = @()
    foreach ($cache in $cacheLocations) {
        if (Test-Path $cache) {
            try {
                $size = (Get-ChildItem -Recurse $cache -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                $sizeStr = if ($size) { "{0:N1} KB" -f ($size / 1KB) } else { "Empty" }
                $foundCaches += $cache
                Write-Status "FOUND: $cache ($sizeStr) - WOULD DELETE" "Red"
            } catch {
                Write-Status "FOUND: $cache (Size unknown) - WOULD DELETE" "Red"
                $foundCaches += $cache
            }
        } else {
            Write-Status "NOT FOUND: $cache - No action needed" "Green"
        }
    }
    
    return $foundCaches
}

function Test-ClaudeExecutable {
    Write-Host "Looking for Claude Desktop executable..." -ForegroundColor Yellow
    
    $claudePaths = @(
        "$env:LOCALAPPDATA\Claude\Claude.exe",
        "$env:ProgramFiles\Claude\Claude.exe", 
        "$env:ProgramFiles(x86)\Claude\Claude.exe",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Claude\Claude.exe"
    )
    
    $foundExe = $null
    foreach ($path in $claudePaths) {
        if (Test-Path $path) {
            try {
                $version = (Get-Item $path).VersionInfo.FileVersion
                Write-Status "FOUND: $path (Version: $version) - WOULD START" "Green"
                $foundExe = $path
                break
            } catch {
                Write-Status "FOUND: $path (Version unknown) - WOULD START" "Green"
                $foundExe = $path
                break
            }
        } else {
            Write-Status "NOT FOUND: $path" "Gray"
        }
    }
    
    return $foundExe
}

# Run safe tests
try {
    Write-Host "PHASE 1: Process Check" -ForegroundColor Magenta
    $processes = Test-ClaudeProcesses
    
    Write-Host ""
    Write-Host "PHASE 2: Cache Check" -ForegroundColor Magenta  
    $caches = Test-ClaudeCache
    
    Write-Host ""
    Write-Host "PHASE 3: Executable Check" -ForegroundColor Magenta
    $executable = Test-ClaudeExecutable
    
    # Summary
    Write-Host ""
    Write-Host "TEST SUMMARY:" -ForegroundColor Cyan
    Write-Host "=============" -ForegroundColor Cyan
    
    if ($processes.Count -gt 0) {
        Write-Host "SAFE: Would stop $($processes.Count) Claude processes" -ForegroundColor Green
    } else {
        Write-Host "INFO: No Claude processes currently running" -ForegroundColor Blue
    }
    
    if ($caches.Count -gt 0) {
        Write-Host "SAFE: Would clear $($caches.Count) cache locations" -ForegroundColor Green  
    } else {
        Write-Host "INFO: No cache directories found" -ForegroundColor Blue
    }
    
    if ($executable) {
        Write-Host "SAFE: Would restart Claude from: $executable" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Could not find Claude executable - manual start needed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "READY TO RUN SAFELY!" -ForegroundColor Green
    Write-Host "To actually execute: .\restart-claude-clean.ps1" -ForegroundColor White
    
} catch {
    Write-Host "ERROR: Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Script may need administrator rights" -ForegroundColor Yellow
}