cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
$env:REMOTION_ASSETS_DIR = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\assets"
$env:NODE_ENV = "production"

Write-Host "Testing MCP Server from Windows..." -ForegroundColor Cyan
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow

$initRequest = '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'
$response = $initRequest | node build\index.js 2>&1 | Select-Object -First 1
Write-Host "Response: $response" -ForegroundColor Green