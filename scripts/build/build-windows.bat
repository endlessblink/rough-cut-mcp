@echo off
REM Windows Build Script for Remotion MCP Server
REM Run this from Windows CMD to build the project properly

echo.
echo ===================================================
echo    Building Remotion MCP Server for Windows
echo ===================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Navigate to project directory
cd /d "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

REM Clean old build
if exist build (
    echo Cleaning old build...
    rmdir /s /q build
    echo [OK] Old build cleaned
    echo.
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Build the project
echo Building TypeScript...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo    BUILD SUCCESSFUL!
    echo ===================================================
    echo.
    echo Next Steps:
    echo 1. Update Claude Desktop config to use:
    echo    D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\build\index.js
    echo.
    echo 2. Restart Claude Desktop
    echo.
    echo 3. Test MCP tools in Claude
    echo.
) else (
    echo.
    echo ERROR: Build failed!
    echo Please check the error messages above
)

pause