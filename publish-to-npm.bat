@echo off
echo Publishing rough-cut-mcp v2.0.7 to npm...
echo.
cd /d "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

echo Ensuring we're logged in to npm...
npm whoami
if %ERRORLEVEL% NEQ 0 (
    echo Please login to npm first with: npm login
    pause
    exit /b 1
)

echo.
echo Publishing to npm registry...
npm publish

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Successfully published rough-cut-mcp v2.0.7 to npm!
    echo.
    echo Users can now install with: npm install -g rough-cut-mcp
    echo.
    echo Changes in v2.0.7:
    echo - Projects automatically install dependencies on creation
    echo - Creates src/index.ts entry point for Remotion Studio
    echo - Fixed Root.tsx to properly register compositions
    echo - Remotion Studio now starts without "Cannot find module" errors
    echo.
    echo Previous v2.0.6 fixes:
    echo - Fixed critical race condition in MCP initialization
    echo - Fixed logger API compatibility issues
    echo - MCP server now properly discoverable by Claude Desktop
) else (
    echo.
    echo Publishing failed! Please check the error above.
)
pause