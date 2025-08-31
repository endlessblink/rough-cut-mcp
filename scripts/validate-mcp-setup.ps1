# 🎭 Playwright MCP Setup Validator (Windows PowerShell)
# Validates MCP setup for Windows users

param(
    [switch]$Detailed,
    [switch]$FixIssues
)

$ErrorActionPreference = "SilentlyContinue"

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Header {
    param($Message)
    Write-Host "`n$Message" -ForegroundColor Cyan -BackgroundColor DarkBlue
}

$script:SuccessCount = 0
$script:WarningCount = 0
$script:ErrorCount = 0

function Test-Command {
    param($Command, $ExpectedOutput = $null)
    
    try {
        $result = Invoke-Expression $Command 2>$null
        if ($ExpectedOutput -and $result -notlike "*$ExpectedOutput*") {
            return $null
        }
        return $result
    }
    catch {
        return $null
    }
}

function Test-ProjectStructure {
    Write-Header "🏗️  Validating Project Structure"
    
    # Check .mcp.json
    $mcpJsonPath = Join-Path $PWD ".mcp.json"
    if (Test-Path $mcpJsonPath) {
        Write-Success "Project MCP configuration (.mcp.json) found"
        $script:SuccessCount++
        
        try {
            $config = Get-Content $mcpJsonPath | ConvertFrom-Json
            if ($config.mcpServers.playwright) {
                Write-Success "Playwright MCP server configured"
                $script:SuccessCount++
            }
            else {
                Write-Error "Playwright MCP server not configured in .mcp.json"
                $script:ErrorCount++
            }
        }
        catch {
            Write-Error ".mcp.json contains invalid JSON"
            $script:ErrorCount++
        }
    }
    else {
        Write-Error "Project MCP configuration (.mcp.json) not found"
        $script:ErrorCount++
    }
    
    # Check package.json
    $packageJsonPath = Join-Path $PWD "package.json"
    if (Test-Path $packageJsonPath) {
        Write-Success "Package.json found"
        $script:SuccessCount++
    }
    else {
        Write-Warning "No package.json - may not be in project root"
        $script:WarningCount++
    }
}

function Test-NodeEnvironment {
    Write-Header "🟢 Validating Node.js Environment"
    
    # Test Node.js
    $nodeVersion = Test-Command "node --version"
    if ($nodeVersion) {
        $majorVersion = [int]($nodeVersion.Replace('v', '').Split('.')[0])
        if ($majorVersion -ge 16) {
            Write-Success "Node.js $nodeVersion (compatible)"
            $script:SuccessCount++
        }
        else {
            Write-Error "Node.js $nodeVersion is too old (need v16+)"
            $script:ErrorCount++
        }
    }
    else {
        Write-Error "Node.js not found or not accessible"
        $script:ErrorCount++
    }
    
    # Test npm
    $npmVersion = Test-Command "npm --version"
    if ($npmVersion) {
        Write-Success "npm v$npmVersion available"
        $script:SuccessCount++
    }
    else {
        Write-Error "npm not found"
        $script:ErrorCount++
    }
    
    # Test npx
    $npxVersion = Test-Command "npx --version"
    if ($npxVersion) {
        Write-Success "npx v$npxVersion available"
        $script:SuccessCount++
    }
    else {
        Write-Error "npx not found"
        $script:ErrorCount++
    }
}

function Test-PlaywrightMCP {
    Write-Header "🎭 Validating Playwright MCP"
    
    # Test MCP package accessibility
    Write-Info "Testing Playwright MCP package (may take a moment)..."
    $mcpHelp = Test-Command "npx @playwright/mcp@latest --help" "--isolated"
    if ($mcpHelp) {
        Write-Success "Playwright MCP package accessible"
        Write-Success "--isolated flag supported"
        $script:SuccessCount += 2
    }
    else {
        Write-Error "Playwright MCP package not accessible"
        $script:ErrorCount++
    }
    
    # Test Playwright installation
    $playwrightVersion = Test-Command "npx playwright --version"
    if ($playwrightVersion) {
        Write-Success "Playwright installed: $playwrightVersion"
        $script:SuccessCount++
    }
    else {
        Write-Warning "Playwright not installed - run: npx playwright install"
        $script:WarningCount++
    }
}

function Test-WSLEnvironment {
    Write-Header "🐧 Validating WSL2 Configuration"
    
    # Check if WSL is available
    $wslVersion = Test-Command "wsl --version"
    if ($wslVersion) {
        Write-Success "WSL2 is available"
        $script:SuccessCount++
        
        # Check .wslconfig
        $wslConfigPath = "$env:USERPROFILE\.wslconfig"
        if (Test-Path $wslConfigPath) {
            Write-Success ".wslconfig file found"
            $script:SuccessCount++
            
            $wslConfig = Get-Content $wslConfigPath -Raw
            if ($wslConfig -like "*networkingMode=mirrored*") {
                Write-Success "networkingMode=mirrored configured"
                $script:SuccessCount++
            }
            else {
                Write-Warning "networkingMode=mirrored not configured"
                $script:WarningCount++
                
                if ($FixIssues) {
                    Write-Info "Adding networkingMode=mirrored to .wslconfig..."
                    
                    if ($wslConfig -notlike "*[wsl2]*") {
                        Add-Content $wslConfigPath "`n[wsl2]"
                    }
                    Add-Content $wslConfigPath "networkingMode=mirrored"
                    Write-Success "Added networkingMode=mirrored to .wslconfig"
                    Write-Warning "Run 'wsl --shutdown' to apply changes"
                }
            }
        }
        else {
            Write-Warning ".wslconfig not found"
            $script:WarningCount++
            
            if ($FixIssues) {
                Write-Info "Creating .wslconfig with mirrored networking..."
                $wslConfigContent = @"
[wsl2]
networkingMode=mirrored
"@
                Set-Content $wslConfigPath $wslConfigContent
                Write-Success "Created .wslconfig with mirrored networking"
                Write-Warning "Run 'wsl --shutdown' to apply changes"
            }
        }
        
        # Check WSL status
        $wslList = Test-Command "wsl -l -v"
        if ($wslList -and $wslList -like "*Version 2*") {
            Write-Success "WSL2 distributions found"
            $script:SuccessCount++
        }
        else {
            Write-Warning "No WSL2 distributions found"
            $script:WarningCount++
        }
    }
    else {
        Write-Info "WSL2 not available - native Windows environment"
        Write-Success "No WSL-specific configuration needed"
        $script:SuccessCount++
    }
}

function Test-NetworkConnectivity {
    Write-Header "🌐 Validating Network Connectivity"
    
    # Test localhost (if server is running)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3333" -Method Head -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Success "Server on localhost:3333 is accessible"
            $script:SuccessCount++
        }
    }
    catch {
        Write-Info "No server running on localhost:3333 (normal if not started)"
    }
    
    # Test npm registry
    try {
        $response = Invoke-WebRequest -Uri "https://registry.npmjs.org" -Method Head -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "NPM registry accessible"
            $script:SuccessCount++
        }
    }
    catch {
        Write-Warning "Cannot reach npm registry - may affect downloads"
        $script:WarningCount++
    }
}

function Show-Summary {
    Write-Header "📊 Validation Summary"
    Write-Host ("=" * 50) -ForegroundColor Blue
    
    Write-Host "✅ Successful checks: $script:SuccessCount" -ForegroundColor Green
    if ($script:WarningCount -gt 0) {
        Write-Host "⚠️  Warnings: $script:WarningCount" -ForegroundColor Yellow
    }
    if ($script:ErrorCount -gt 0) {
        Write-Host "❌ Errors: $script:ErrorCount" -ForegroundColor Red
    }
    
    if ($script:ErrorCount -eq 0) {
        Write-Host "`n🎉 MCP Setup Validation PASSED!" -ForegroundColor Green
        Write-Host "Playwright MCP should work in Claude Code." -ForegroundColor Green
    }
    else {
        Write-Host "`n🔧 Setup Issues Detected" -ForegroundColor Red
        Write-Host "Please resolve the errors above." -ForegroundColor Red
    }
    
    if ($script:WarningCount -gt 0) {
        Write-Host "`n💡 Consider running with -FixIssues to auto-resolve some warnings" -ForegroundColor Yellow
    }
    
    Write-Host "`n📖 For detailed instructions, see SETUP-MCP.md" -ForegroundColor Blue
}

# Main execution
Write-Host "🎭 Playwright MCP Setup Validator (Windows)" -ForegroundColor Cyan -BackgroundColor DarkBlue
Write-Host "Validating MCP setup for Windows environment...`n" -ForegroundColor Blue

Test-ProjectStructure
Test-NodeEnvironment  
Test-PlaywrightMCP
Test-WSLEnvironment
Test-NetworkConnectivity
Show-Summary

# Exit with appropriate code
exit ($script:ErrorCount -gt 0 ? 1 : 0)