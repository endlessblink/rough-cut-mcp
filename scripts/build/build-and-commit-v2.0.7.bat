@echo off
echo Building RoughCut MCP Server v2.0.7 with critical fixes...
echo.

cd /d "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

echo Step 1: Building TypeScript...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Step 2: Staging changes for git...
git add -A

echo.
echo Step 3: Creating commit...
git commit -m "Fix critical issues in v2.0.7 - Auto-install dependencies and fix Remotion Studio startup

- Auto-install npm dependencies after project creation
- Create missing src/index.ts entry point for Remotion Studio  
- Fix Root.tsx to properly register compositions
- Projects now work immediately without manual npm install
- Remotion Studio can now start without module errors"

echo.
echo Step 4: Creating git tag...
git tag -a v2.0.7 -m "Version 2.0.7 - Critical dependency and studio fixes"

echo.
echo Build and commit completed successfully!
echo.
echo Critical fixes applied in v2.0.7:
echo - Projects automatically install dependencies
echo - src/index.ts entry point created
echo - Root.tsx properly registers compositions  
echo - Remotion Studio starts without errors
echo.
echo Next steps:
echo 1. Login to npm: npm login
echo 2. Publish: npm publish
echo 3. Push to GitHub (if applicable): git push origin master --tags
echo.
pause