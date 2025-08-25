Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RoughCut MCP - Build & Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "TypeScript Errors Fixed:" -ForegroundColor Green
Write-Host "✅ ToolHandlers type now allows optional args" -ForegroundColor White
Write-Host "✅ Added null checks for modifiedCode before file writing" -ForegroundColor White
Write-Host "✅ Fixed import statements for createStudioHandlers" -ForegroundColor White
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
$expectedDir = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

if ($currentDir.Path -ne $expectedDir) {
    Write-Host "Changing to project directory..." -ForegroundColor Yellow
    Set-Location $expectedDir
}

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Building TypeScript..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart Claude Desktop to load the updated MCP server" -ForegroundColor White
    Write-Host "2. Test with: 'List my video projects'" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " BUILD FAILED - Check errors above" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}