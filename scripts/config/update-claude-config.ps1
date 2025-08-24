Write-Host "Updating Claude Desktop Configuration..." -ForegroundColor Cyan
Write-Host ""

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$projectPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

# Check if config exists
if (-not (Test-Path $configPath)) {
    Write-Host "ERROR: Claude Desktop config not found" -ForegroundColor Red
    Write-Host "Path: $configPath" -ForegroundColor Yellow
    Write-Host "Please ensure Claude Desktop is installed" -ForegroundColor Yellow
    exit 1
}

# Read config
try {
    $configContent = Get-Content $configPath -Raw
    $config = $configContent | ConvertFrom-Json
    Write-Host "Found Claude Desktop configuration" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to read config file" -ForegroundColor Red
    exit 1
}

# Ensure mcpServers exists
if (-not $config.mcpServers) {
    $config | Add-Member -MemberType NoteProperty -Name mcpServers -Value @{} -Force
}

# Create the rough-cut-mcp configuration
$roughCutConfig = @{
    command = "C:\Program Files\nodejs\node.exe"
    args = @("$projectPath\build\index.js")
    env = @{
        REMOTION_ASSETS_DIR = "$projectPath\assets"
        NODE_ENV = "production"
    }
}

# Add or update the configuration
if ($config.mcpServers.PSObject.Properties.Name -contains "rough-cut-mcp") {
    Write-Host "Updating existing rough-cut-mcp configuration..." -ForegroundColor Yellow
    $config.mcpServers."rough-cut-mcp" = $roughCutConfig
}
else {
    Write-Host "Adding new rough-cut-mcp configuration..." -ForegroundColor Yellow
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name "rough-cut-mcp" -Value $roughCutConfig -Force
}

# Save config
try {
    $jsonString = $config | ConvertTo-Json -Depth 10
    Set-Content -Path $configPath -Value $jsonString -Encoding UTF8
    Write-Host "Configuration updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration Details:" -ForegroundColor Cyan
    Write-Host "  Command: C:\Program Files\nodejs\node.exe" -ForegroundColor White
    Write-Host "  Script: $projectPath\build\index.js" -ForegroundColor White
    Write-Host "  Assets: $projectPath\assets" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANT: Restart Claude Desktop for changes to take effect" -ForegroundColor Yellow
}
catch {
    Write-Host "ERROR: Failed to save configuration" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Check for old redirect file
$redirectFile = "$projectPath\index-clean.js"
if (Test-Path $redirectFile) {
    Write-Host ""
    Write-Host "Found old redirect file: index-clean.js" -ForegroundColor Yellow
    $response = Read-Host "Delete it? (y/n)"
    if ($response -eq 'y') {
        Remove-Item $redirectFile -Force
        Write-Host "Redirect file deleted" -ForegroundColor Green
    }
}