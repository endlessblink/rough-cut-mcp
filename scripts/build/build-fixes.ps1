Write-Host "Building RoughCut MCP Server with critical fixes..." -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$projectDir = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
Set-Location $projectDir

# Build the project
Write-Host "Running npm build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Critical fixes applied:" -ForegroundColor Cyan
    Write-Host "1. Fixed initialization order - handlers registered before transport connection" -ForegroundColor White
    Write-Host "2. Added child() method to logger service for compatibility" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart Claude Desktop" -ForegroundColor White
    Write-Host "2. Test MCP server discovery and tool availability" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}