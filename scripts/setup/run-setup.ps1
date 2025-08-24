Write-Host "MCP Server Setup Runner" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the right directory
$expectedPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
if ((Get-Location).Path -ne $expectedPath) {
    Set-Location $expectedPath
}

Write-Host "This script will help you run the setup scripts correctly." -ForegroundColor Yellow
Write-Host ""
Write-Host "Step 1: Build the project" -ForegroundColor Cyan
Write-Host "Command: .\build-windows.ps1" -ForegroundColor White
$response = Read-Host "Run build now? (y/n)"
if ($response -eq 'y') {
    Write-Host ""
    & .\build-windows.ps1
    Write-Host ""
}

Write-Host "Step 2: Update Claude Desktop configuration" -ForegroundColor Cyan
Write-Host "Command: .\update-claude-config.ps1" -ForegroundColor White
$response = Read-Host "Update config now? (y/n)"
if ($response -eq 'y') {
    Write-Host ""
    & .\update-claude-config.ps1
    Write-Host ""
}

Write-Host "Step 3: Restart Claude Desktop" -ForegroundColor Cyan
Write-Host "Please close and reopen Claude Desktop to apply changes." -ForegroundColor Yellow
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green