# PowerShell script to set up Rough Cut MCP in Claude Desktop
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Rough Cut MCP - Claude Desktop Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$projectRoot = $scriptDir

# Verify we're in the correct directory
if (-not (Test-Path (Join-Path $projectRoot "package.json"))) {
    Write-Host "Error: package.json not found in $projectRoot" -ForegroundColor Red
    Write-Host "Please run this script from the Rough Cut MCP project directory." -ForegroundColor Yellow
    exit 1
}

# Build paths relative to project root
$buildIndexPath = Join-Path $projectRoot "build\index.js"
$assetsPath = Join-Path $projectRoot "assets"

# Check if build exists
if (-not (Test-Path $buildIndexPath)) {
    Write-Host "Warning: Build not found at $buildIndexPath" -ForegroundColor Yellow
    Write-Host "Please run 'npm run build' first in Windows PowerShell." -ForegroundColor Yellow
    Write-Host "Continue anyway? (y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -ne 'y') {
        exit 1
    }
}

# Find Node.js installation
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    (Get-Command node -ErrorAction SilentlyContinue).Path
)

$nodeCommand = $null
foreach ($path in $nodePaths) {
    if ($path -and (Test-Path $path)) {
        $nodeCommand = $path
        break
    }
}

if (-not $nodeCommand) {
    Write-Host "Error: Node.js not found!" -ForegroundColor Red
    Write-Host "Please ensure Node.js is installed and available in PATH." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found Node.js at: $nodeCommand" -ForegroundColor Green
Write-Host "Project root: $projectRoot" -ForegroundColor Green

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
        command = $nodeCommand
        args = @($buildIndexPath)
        env = @{
            NODE_ENV = "production"
            REMOTION_ASSETS_DIR = $assetsPath
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
                command = $nodeCommand
                args = @($buildIndexPath)
                env = @{
                    NODE_ENV = "production"
                    REMOTION_ASSETS_DIR = $assetsPath
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
Write-Host "Configured paths:" -ForegroundColor Yellow
Write-Host "  Node.js: $nodeCommand" -ForegroundColor White
Write-Host "  Build: $buildIndexPath" -ForegroundColor White
Write-Host "  Assets: $assetsPath" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")