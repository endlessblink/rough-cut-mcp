# PowerShell script to set up Rough Cut MCP in Claude Desktop
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Rough Cut MCP - Claude Desktop Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Find Claude Desktop config file
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Write-Host "Looking for Claude Desktop config at: $configPath" -ForegroundColor Yellow

if (Test-Path $configPath) {
    Write-Host "Found Claude Desktop configuration!" -ForegroundColor Green
    
    # Backup existing config
    $backupPath = "$configPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $configPath $backupPath
    Write-Host "Created backup at: $backupPath" -ForegroundColor Green
    
    # Read existing config
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    
    # Check if rough-cut-mcp already exists
    if ($config.mcpServers.'rough-cut-mcp') {
        Write-Host "Rough Cut MCP already configured. Updating..." -ForegroundColor Yellow
    }
    else {
        Write-Host "Adding Rough Cut MCP to configuration..." -ForegroundColor Yellow
    }
    
    # Add or update rough-cut-mcp configuration
    if (-not $config.mcpServers) {
        $config | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue @{} -Force
    }
    
    $roughCutConfig = @{
        command = "C:\Program Files\nodejs\node.exe"
        args = @(
            "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\build\index.js"
        )
        env = @{
            NODE_ENV = "production"
            REMOTION_ASSETS_DIR = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\assets"
            MCP_LEGACY_MODE = "false"
        }
    }
    
    $config.mcpServers | Add-Member -NotePropertyName 'rough-cut-mcp' -NotePropertyValue $roughCutConfig -Force
    
    # Save updated config
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath
    Write-Host "Configuration updated successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Close Claude Desktop completely (check system tray)" -ForegroundColor White
    Write-Host "2. Wait 5 seconds" -ForegroundColor White
    Write-Host "3. Reopen Claude Desktop" -ForegroundColor White
    Write-Host "4. Test with: 'Show me the Rough Cut tools'" -ForegroundColor White
    
}
else {
    Write-Host "Claude Desktop configuration not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating new configuration file..." -ForegroundColor Yellow
    
    # Create directory if it doesn't exist
    $claudeDir = "$env:APPDATA\Claude"
    if (-not (Test-Path $claudeDir)) {
        New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
        Write-Host "Created directory: $claudeDir" -ForegroundColor Green
    }
    
    # Create new config
    $newConfig = @{
        mcpServers = @{
            'rough-cut-mcp' = @{
                command = "C:\Program Files\nodejs\node.exe"
                args = @(
                    "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\build\index.js"
                )
                env = @{
                    NODE_ENV = "production"
                    REMOTION_ASSETS_DIR = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\assets"
                    MCP_LEGACY_MODE = "false"
                }
            }
        }
    }
    
    $newConfig | ConvertTo-Json -Depth 10 | Set-Content $configPath
    Write-Host "Configuration file created at: $configPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please restart Claude Desktop to load the MCP server." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tools now available (9 total):" -ForegroundColor Yellow
Write-Host "  Discovery: discover, activate, search" -ForegroundColor White
Write-Host "  Core: project, studio" -ForegroundColor White
Write-Host "  Video: create-video, composition, analyze-video, render" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")