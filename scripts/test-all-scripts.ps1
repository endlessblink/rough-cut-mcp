Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing All MCP PowerShell Scripts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
Set-Location $scriptPath

# Test 1: Check if scripts exist
Write-Host "Test 1: Checking script files..." -ForegroundColor Yellow
$scripts = @(
    ".\build-windows.ps1",
    ".\update-claude-config.ps1"
)

$allExist = $true
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "  [OK] Found: $script" -ForegroundColor Green
    }
    else {
        Write-Host "  [FAIL] Missing: $script" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "ERROR: Some scripts are missing!" -ForegroundColor Red
    exit 1
}

# Test 2: Validate PowerShell syntax
Write-Host ""
Write-Host "Test 2: Validating PowerShell syntax..." -ForegroundColor Yellow

foreach ($script in $scripts) {
    $errors = $null
    $tokens = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile(
        (Resolve-Path $script).Path,
        [ref]$tokens,
        [ref]$errors
    )
    
    if ($errors.Count -eq 0) {
        Write-Host "  [OK] Valid syntax: $script" -ForegroundColor Green
    }
    else {
        Write-Host "  [FAIL] Syntax errors in: $script" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "    - $($error.Message)" -ForegroundColor Red
        }
    }
}

# Test 3: Check Node.js availability
Write-Host ""
Write-Host "Test 3: Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  [OK] Node.js installed: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] Node.js not found" -ForegroundColor Red
}

# Test 4: Check if build directory exists
Write-Host ""
Write-Host "Test 4: Checking build output..." -ForegroundColor Yellow
if (Test-Path ".\build\index.js") {
    Write-Host "  [OK] Build output exists" -ForegroundColor Green
    $buildTime = (Get-Item ".\build\index.js").LastWriteTime
    Write-Host "  Last built: $buildTime" -ForegroundColor Gray
}
else {
    Write-Host "  [INFO] Build output not found (run build-windows.ps1 to build)" -ForegroundColor Yellow
}

# Test 5: Check Claude Desktop config path
Write-Host ""
Write-Host "Test 5: Checking Claude Desktop..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "  [OK] Claude config found" -ForegroundColor Green
    
    # Check if rough-cut-mcp is configured
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.mcpServers."rough-cut-mcp") {
        Write-Host "  [OK] rough-cut-mcp is configured" -ForegroundColor Green
        $currentPath = $config.mcpServers."rough-cut-mcp".args[0]
        Write-Host "  Current path: $currentPath" -ForegroundColor Gray
        
        # Check if it points to the right file
        if ($currentPath -like "*build\index.js") {
            Write-Host "  [OK] Points to build/index.js" -ForegroundColor Green
        }
        elseif ($currentPath -like "*index-clean.js") {
            Write-Host "  [INFO] Still points to index-clean.js (run update-claude-config.ps1)" -ForegroundColor Yellow
        }
        else {
            Write-Host "  [WARN] Points to unknown file" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  [INFO] rough-cut-mcp not configured (run update-claude-config.ps1)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  [WARN] Claude Desktop config not found" -ForegroundColor Yellow
    Write-Host "  Expected at: $configPath" -ForegroundColor Gray
}

# Test 6: Check for old redirect file
Write-Host ""
Write-Host "Test 6: Checking for old files..." -ForegroundColor Yellow
if (Test-Path ".\index-clean.js") {
    Write-Host "  [INFO] Old redirect file exists (index-clean.js)" -ForegroundColor Yellow
    Write-Host "  This can be deleted after updating config" -ForegroundColor Gray
}
else {
    Write-Host "  [OK] No old redirect files" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\build-windows.ps1" -ForegroundColor White
Write-Host "2. Run: .\update-claude-config.ps1" -ForegroundColor White
Write-Host "3. Restart Claude Desktop" -ForegroundColor White
Write-Host ""
Write-Host "Remember to always use .\ before script names!" -ForegroundColor Cyan