Write-Host "Fixing Claude Desktop Configuration..." -ForegroundColor Cyan
Write-Host ""

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$projectPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

# Create the properly formatted JSON as a string
# Using here-string to maintain exact formatting
$jsonContent = @'
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx.cmd",
      "args": ["@wonderwhy-er/desktop-commander@latest"]
    },
    "rough-cut-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\build\\index.js"],
      "env": {
        "REMOTION_ASSETS_DIR": "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\assets",
        "NODE_ENV": "production"
      }
    }
  }
}
'@

# Backup existing config
$backupPath = "$configPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (Test-Path $configPath) {
    Copy-Item $configPath $backupPath
    Write-Host "Backed up existing config to: $backupPath" -ForegroundColor Yellow
}

# Write the new config
try {
    # Use Set-Content with UTF8 encoding and no BOM
    [System.IO.File]::WriteAllText($configPath, $jsonContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Configuration fixed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The configuration now includes:" -ForegroundColor Cyan
    Write-Host "  - desktop-commander" -ForegroundColor White
    Write-Host "  - rough-cut-mcp" -ForegroundColor White
    Write-Host ""
    Write-Host "Please restart Claude Desktop for changes to take effect" -ForegroundColor Yellow
}
catch {
    Write-Host "ERROR: Failed to write configuration" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "You can manually copy this JSON to $configPath" -ForegroundColor Yellow
    Write-Host $jsonContent -ForegroundColor Gray
}