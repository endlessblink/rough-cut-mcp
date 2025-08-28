@echo off
echo Building RoughCut MCP v2.0.8 - Critical Config Files Fix
echo.
echo CRITICAL FIXES IN THIS VERSION:
echo - Added remotion.config.ts generation
echo - Added tsconfig.json generation
echo - Improved npm install with Windows support
echo - Better error reporting
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
echo Build completed successfully!
echo.
echo CRITICAL FIXES APPLIED:
echo - remotion.config.ts will be created for all new projects
echo - tsconfig.json will be created for all new projects
echo - npm install uses platform-specific commands
echo - Better error messages when installation fails
echo.
echo To test locally:
echo 1. Run: node build/index.js
echo 2. Create a new video project
echo 3. Check that all config files exist
echo 4. Verify studio launches without errors
echo.
echo To publish to npm:
echo 1. git add -A
echo 2. git commit -m "Critical fix v2.0.8: Add missing Remotion config files"
echo 3. git tag -a v2.0.8 -m "Version 2.0.8 - Critical config files"
echo 4. npm login (if needed)
echo 5. npm publish
echo.
pause