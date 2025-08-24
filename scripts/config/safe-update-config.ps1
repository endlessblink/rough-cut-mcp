Write-Host "Safe Claude Desktop Configuration Updater" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$projectPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

# Check if config exists
if (-not (Test-Path $configPath)) {
    Write-Host "Claude Desktop config not found at: $configPath" -ForegroundColor Red
    Write-Host "Creating new configuration..." -ForegroundColor Yellow
    
    # Create directory if needed
    $configDir = Split-Path $configPath -Parent
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
}

# Read existing config or start fresh
$existingServers = @{}
if (Test-Path $configPath) {
    try {
        $existingContent = Get-Content $configPath -Raw
        $existingConfig = $existingContent | ConvertFrom-Json
        
        # Preserve existing servers
        if ($existingConfig.mcpServers) {
            foreach ($prop in $existingConfig.mcpServers.PSObject.Properties) {
                if ($prop.Name -ne "rough-cut-mcp") {
                    $existingServers[$prop.Name] = $prop.Value
                }
            }
        }
        Write-Host "Found existing configuration with $($existingServers.Count) other servers" -ForegroundColor Green
    }
    catch {
        Write-Host "WARNING: Could not parse existing config, starting fresh" -ForegroundColor Yellow
    }
}

# Build the new configuration manually
$configLines = @()
$configLines += '{'
$configLines += '  "mcpServers": {'

# Add existing servers first
$serverCount = 0
foreach ($serverName in $existingServers.Keys) {
    $server = $existingServers[$serverName]
    $serverCount++
    
    $configLines += "    `"$serverName`": {"
    $configLines += "      `"command`": `"$($server.command)`","
    
    # Handle args array
    $argsJson = ($server.args | ForEach-Object { "`"$_`"" }) -join ", "
    $configLines += "      `"args`": [$argsJson]"
    
    # Add env if it exists
    if ($server.env) {
        $configLines[-1] += ","
        $configLines += "      `"env`": {"
        $envProps = @()
        foreach ($envProp in $server.env.PSObject.Properties) {
            $envProps += "        `"$($envProp.Name)`": `"$($envProp.Value)`""
        }
        $configLines += ($envProps -join ",`n")
        $configLines += "      }"
    }
    
    $configLines += "    },"
}

# Add rough-cut-mcp
$configLines += '    "rough-cut-mcp": {'
$configLines += '      "command": "C:\\Program Files\\nodejs\\node.exe",'
$configLines += "      `"args`": [`"$projectPath\\build\\index.js`"],"
$configLines += '      "env": {'
$configLines += "        `"REMOTION_ASSETS_DIR`": `"$projectPath\\assets`","
$configLines += '        "NODE_ENV": "production"'
$configLines += '      }'
$configLines += '    }'
$configLines += '  }'
$configLines += '}'

# Join all lines
$finalJson = $configLines -join "`n"

# Backup existing config
if (Test-Path $configPath) {
    $backupPath = "$configPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $configPath $backupPath
    Write-Host ""
    Write-Host "Backed up existing config to:" -ForegroundColor Yellow
    Write-Host "  $backupPath" -ForegroundColor Gray
}

# Write the config
try {
    # Write without BOM
    [System.IO.File]::WriteAllText($configPath, $finalJson, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host ""
    Write-Host "Configuration updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "MCP Servers configured:" -ForegroundColor Cyan
    foreach ($serverName in $existingServers.Keys) {
        Write-Host "  - $serverName" -ForegroundColor White
    }
    Write-Host "  - rough-cut-mcp" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Restart Claude Desktop for changes to take effect" -ForegroundColor Yellow
}
catch {
    Write-Host ""
    Write-Host "ERROR: Failed to write configuration" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual configuration needed. Copy this to $configPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $finalJson -ForegroundColor Gray
}