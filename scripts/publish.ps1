# PowerShell script to publish to npm from Windows
Write-Host "Publishing Rough Cut MCP v2.0.0 to npm..." -ForegroundColor Cyan

# Ensure we're in the correct directory
$projectPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
Set-Location $projectPath

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Publish to npm
Write-Host "Publishing to npm..." -ForegroundColor Yellow
npm publish

if ($LASTEXITCODE -ne 0) {
    Write-Host "Publishing failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Successfully published rough-cut-mcp@2.0.0!" -ForegroundColor Green
Write-Host ""
Write-Host "Your friend can now install with:" -ForegroundColor Cyan
Write-Host "  npm install -g rough-cut-mcp" -ForegroundColor White
Write-Host ""
Write-Host "This will automatically:" -ForegroundColor Yellow
Write-Host "  - Install the MCP server globally"
Write-Host "  - Configure Claude Desktop"
Write-Host "  - Set up all required paths"
Write-Host ""