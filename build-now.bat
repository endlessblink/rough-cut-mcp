@echo off
echo Building RoughCut MCP Server...
echo.
cd /d "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
npm run build
echo.
if %ERRORLEVEL% EQU 0 (
    echo Build completed successfully!
    echo.
    echo Critical fixes applied:
    echo - Fixed initialization order: handlers registered before transport connection
    echo - Added child method to logger service for compatibility  
    echo - Fixed TypeScript errors in ast-manipulation.ts
    echo.
    echo Next: Restart Claude Desktop to test the MCP server
) else (
    echo Build failed! Please check the errors above.
)
pause