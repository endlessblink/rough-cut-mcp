# 🚀 Deployment Guide - Remotion MCP Server

## Quick Start (Windows Users)

### Method 1: Automated (Recommended)
```powershell
# 1. Build the project (from Windows PowerShell, NOT WSL2!)
.\build-windows.ps1

# 2. Update Claude Desktop configuration
.\update-claude-config.ps1

# 3. Restart Claude Desktop
```

**Important**: These scripts follow PowerShell best practices:
- Use `else` on a new line (not same line as `}`)
- No Unicode/emoji characters
- Simple ASCII text only

### Method 2: Manual Steps

#### Step 1: Build on Windows
Open **Windows PowerShell** (not WSL2!) and run:
```powershell
cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
npm run build
```

#### Step 2: Update Claude Desktop Configuration
Edit `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\build\\index.js"
      ],
      "env": {
        "REMOTION_ASSETS_DIR": "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\assets",
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Step 3: Restart Claude Desktop
Close and reopen Claude Desktop for changes to take effect.

## For WSL2 Developers

### Development Workflow

1. **Edit in WSL2** (this is fine!):
   ```bash
   code .  # Open in VSCode
   ```

2. **Build in Windows** (required!):
   - Option A: Use the PowerShell script
     ```powershell
     .\build-windows.ps1
     ```
   - Option B: Manual build
     ```powershell
     npm run build
     ```
   - Option C: Dev build from WSL2 (testing only!)
     ```bash
     npm run build:dev
     ```

### Important Notes
- ❌ **NEVER** use `npm run build` from WSL2 for production
- ✅ **ALWAYS** build on Windows for Claude Desktop
- ✅ You can edit files in WSL2/VSCode
- ❌ The MCP will not work if built in WSL2

## Testing the MCP

After deployment, test in Claude Desktop:

1. **Basic Test**:
   - Say: "List my video projects"
   - Should list all 31 projects

2. **Studio Test**:
   - Say: "Launch the GitHub animation"
   - Should open Remotion Studio

3. **Project Status**:
   - Say: "Show me the status of the cinematic-fresh project"
   - Should show project details

## Troubleshooting

### "Process exited with code 1"
- **Cause**: Built in WSL2 instead of Windows
- **Fix**: Run `.\build-windows.ps1` in PowerShell

### "Cannot find module"
- **Cause**: TypeScript not compiled
- **Fix**: Run `npm run build` in Windows

### "MCP tools not available"
- **Cause**: Claude Desktop not restarted
- **Fix**: Close and reopen Claude Desktop

### "Path not found"
- **Cause**: Wrong path in Claude config
- **Fix**: Run `.\update-claude-config.ps1`

## File Locations

| File | Purpose |
|------|---------|
| `build-windows.ps1` | PowerShell build script |
| `build-windows.bat` | CMD build script |
| `update-claude-config.ps1` | Auto-update Claude config |
| `build/index.js` | Compiled MCP server |
| `index-clean.js` | Old redirect (can be deleted) |

## Platform Requirements

- **OS**: Windows 10/11
- **Node.js**: v18+ (Windows installation)
- **Claude Desktop**: Latest version
- **Build Location**: Must be on Windows, not WSL2

## Scripts Reference

| Script | Purpose | Run From |
|--------|---------|----------|
| `npm run build` | Production build | Windows only |
| `npm run build:dev` | Dev build (bypass check) | WSL2 OK (testing only) |
| `.\build-windows.ps1` | Full Windows build | PowerShell |
| `.\update-claude-config.ps1` | Update Claude config | PowerShell |

## Next Steps After Deployment

1. ✅ Verify MCP tools work in Claude Desktop
2. ✅ Delete `index-clean.js` (no longer needed)
3. 🔧 Implement missing features:
   - AST-based video editing (`edit-video-element`)
   - Browser auto-opening for Studio
   - Better port management

---

**Remember**: Build on Windows, run on Windows, deploy to Windows. WSL2 is for editing only!