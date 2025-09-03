# Remotion MCP Server - Windows Setup Script
# Automated installation and configuration for Windows + WSL2

param(
    [switch]$Force,
    [switch]$SkipNodeCheck
)

Write-Host "🚀 Remotion MCP Server V5.0 - Windows Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Function to test if WSL2 is available
function Test-WSL2 {
    try {
        $wslVersion = wsl --version 2>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# Function to test Node.js in WSL2
function Test-NodeInWSL {
    try {
        $nodeVersion = wsl bash -c "source ~/.nvm/nvm.sh 2>/dev/null && node --version" 2>$null
        if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
            Write-Host "✅ Node.js in WSL2: $nodeVersion" -ForegroundColor Green
            return $true
        }
    } catch {}
    return $false
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check WSL2
if (-not (Test-WSL2)) {
    Write-Host "❌ WSL2 not found or not working" -ForegroundColor Red
    Write-Host "   Please install WSL2: wsl --install" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ WSL2 is available" -ForegroundColor Green

# Check Node.js in WSL2
if (-not $SkipNodeCheck -and -not (Test-NodeInWSL)) {
    Write-Host "❌ Node.js not found in WSL2" -ForegroundColor Red
    Write-Host "   Please install Node.js in WSL2:" -ForegroundColor Yellow
    Write-Host "   wsl bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'" -ForegroundColor White
    Write-Host "   wsl bash -c 'source ~/.nvm/nvm.sh && nvm install node'" -ForegroundColor White
    exit 1
}

# Check current directory
$currentPath = Get-Location
$expectedPath = "*rough-cut_2*"

if ($currentPath -notlike $expectedPath -and -not $Force) {
    Write-Host "⚠️  Not in rough-cut_2 directory" -ForegroundColor Yellow
    Write-Host "   Current: $currentPath" -ForegroundColor Gray
    Write-Host "   Use -Force to continue anyway" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Build TypeScript
Write-Host "🔧 Building TypeScript..." -ForegroundColor Yellow
./node_modules/.bin/tsc
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript built successfully" -ForegroundColor Green

# Create assets directory
Write-Host "📁 Creating assets directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "assets/projects" -Force | Out-Null
Write-Host "✅ Assets directory ready" -ForegroundColor Green

# Test the MCP server quickly
Write-Host "🧪 Testing MCP server..." -ForegroundColor Yellow
$testProcess = Start-Process -FilePath "node" -ArgumentList "build/index.js" -PassThru -NoNewWindow
Start-Sleep -Seconds 2
if ($testProcess.HasExited) {
    Write-Host "❌ MCP server failed to start" -ForegroundColor Red
    exit 1
} else {
    $testProcess.Kill()
    Write-Host "✅ MCP server test successful" -ForegroundColor Green
}

# Generate Claude Desktop config
$fullPath = (Get-Location).Path
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host "📋 Claude Desktop Configuration:" -ForegroundColor Cyan
Write-Host @"
{
  "mcpServers": {
    "remotion": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["$fullPath\\build\\index.js"]
    }
  }
}
"@ -ForegroundColor White

Write-Host "`n🎯 Setup Complete!" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add the config above to: $configPath" -ForegroundColor White
Write-Host "2. Restart Claude Desktop completely" -ForegroundColor White
Write-Host "3. Test with: 'Create a Remotion project called test with bouncing ball'" -ForegroundColor White

Write-Host "`n🛠️ Troubleshooting:" -ForegroundColor Yellow
Write-Host "- Check logs at: %APPDATA%\Claude\logs\mcp-server-*.log" -ForegroundColor White
Write-Host "- Verify WSL2 with: wsl --version" -ForegroundColor White
Write-Host "- Test Node.js with: wsl bash -c 'source ~/.nvm/nvm.sh && node --version'" -ForegroundColor White