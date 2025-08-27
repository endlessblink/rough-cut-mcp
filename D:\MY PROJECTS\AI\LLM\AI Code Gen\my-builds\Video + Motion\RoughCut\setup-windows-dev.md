# Windows Development Setup Guide

## Why Windows-Only Development?

Building in WSL2 creates paths like `/mnt/d/...` that Windows Node.js cannot execute, causing "file not found" and "process exited with code 1" errors on other Windows machines.

## Required Setup

### 1. Install Windows Tools
- **VS Code** (Windows version, not WSL extension)
- **Node.js** (Windows installer from nodejs.org)
- **Git for Windows** (includes Git Bash)
- **Windows Terminal** (optional but recommended)

### 2. Clone Repository in Windows
```powershell
# Use Windows PowerShell or Git Bash
cd D:\
git clone [your-repo] "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
```

### 3. Always Build in Windows
```powershell
# Open PowerShell or CMD in project directory
cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
npm install
npm run build
```

### 4. VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "files.eol": "\r\n",
  "typescript.tsdk": "node_modules\\typescript\\lib"
}
```

## Development Workflow

### ✅ DO:
- Edit in VS Code (Windows)
- Build with Windows npm/node
- Test with Windows PowerShell
- Use Windows paths everywhere: `D:\...`

### ❌ DON'T:
- Build in WSL2 terminal
- Use WSL VS Code extension for this project
- Mix WSL and Windows tools
- Use paths with `/mnt/`

## Quick Commands

### Build and Test
```powershell
# Always in Windows PowerShell/CMD
npm run build
npm test
node test-layered-tools.js
```

### Run MCP Server
```powershell
node "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\build\index.js"
```

## Verification

After building, verify no WSL paths exist:
```powershell
# Check for WSL paths in build
Select-String -Path "build\*.js" -Pattern "/mnt/" -SimpleMatch
# Should return nothing
```

## Git Configuration

Configure Git to handle line endings correctly:
```powershell
git config core.autocrlf true
git config core.eol crlf
```

## Environment Variables

Set these in Windows:
```powershell
[Environment]::SetEnvironmentVariable("NODE_ENV", "production", "User")
[Environment]::SetEnvironmentVariable("MCP_LOG_LEVEL", "debug", "User")
```

## Troubleshooting

### If you see `/mnt/` paths in errors:
1. You built in WSL2 - rebuild in Windows
2. Delete `build/` folder
3. Run `npm run build` in Windows PowerShell

### If npm commands fail:
1. Ensure using Windows Node.js: `where node`
2. Should show: `C:\Program Files\nodejs\node.exe`
3. NOT: `/usr/bin/node` or WSL paths

## Benefits of Windows-Only Development

1. **No path translation issues** - What you build is what runs
2. **Consistent behavior** - Same environment as end users
3. **Faster builds** - No WSL2 filesystem overhead
4. **Simpler debugging** - Direct Windows process debugging
5. **GitHub Actions match** - CI/CD uses Windows too