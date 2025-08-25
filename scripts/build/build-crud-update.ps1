Write-Host "Building RoughCut MCP with CRUD updates..." -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Build the project
Write-Host "Running npm build..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New CRUD tools added:" -ForegroundColor Cyan
    Write-Host "  - add-video-element" -ForegroundColor White
    Write-Host "  - remove-video-element" -ForegroundColor White
    Write-Host "  - delete-video-project" -ForegroundColor White
    Write-Host "  - replace-video-composition" -ForegroundColor White
    Write-Host "  - duplicate-video-project" -ForegroundColor White
    Write-Host "  - adjust-element-timing" -ForegroundColor White
    Write-Host ""
    Write-Host "These tools are part of the video-creation category in the layered architecture." -ForegroundColor Yellow
    Write-Host "Use 'activate-toolset' with categories: ['video-creation'] to access them." -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}