Write-Host "Building Remotion MCP Server for Windows..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green

# Set location
$projectPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
Set-Location $projectPath

# Clean build
Write-Host ""
Write-Host "Cleaning old build..." -ForegroundColor Yellow
if (Test-Path ".\build") {
    Remove-Item -Path ".\build" -Recurse -Force
    Write-Host "Old build cleaned" -ForegroundColor Green
}

# Build project
Write-Host ""
Write-Host "Building TypeScript..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New Layered Tool Architecture Features:" -ForegroundColor Cyan
    Write-Host "- Only 9-10 tools exposed initially (vs 40+ before)" -ForegroundColor Green
    Write-Host "- Discovery tools always available" -ForegroundColor White
    Write-Host "- Core operations loaded by default" -ForegroundColor White
    Write-Host "- Dynamic tool loading on demand" -ForegroundColor White
    Write-Host "- Better performance and tool selection" -ForegroundColor White
    Write-Host ""
    Write-Host "Legacy Mode:" -ForegroundColor Yellow
    Write-Host "Set environment variable MCP_LEGACY_MODE=true to load all tools at once" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Run: .\update-claude-config.ps1" -ForegroundColor White
    Write-Host "2. Restart Claude Desktop" -ForegroundColor White
    Write-Host "3. Test MCP tools in Claude" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    exit 1
}
