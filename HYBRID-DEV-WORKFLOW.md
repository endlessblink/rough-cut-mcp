# Hybrid Development Workflow: WSL2 + Windows

## The Best of Both Worlds

Keep using Claude Code in WSL2 for development, but build and test on Windows to ensure compatibility.

## Setup

### 1. Development in WSL2 (Claude Code)
- Continue using Claude Code as normal
- Edit files in `/mnt/d/MY PROJECTS/...`
- Use all Claude Code features

### 2. Build in Windows (PowerShell)
- Open Windows PowerShell
- Navigate to project: `cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"`
- Run: `.\build-windows.ps1`

## Workflow

### Step 1: Develop in WSL2
```bash
# In Claude Code / WSL2 terminal
cd "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut"
# Edit files, use Claude Code normally
```

### Step 2: Build in Windows
```powershell
# Open NEW Windows PowerShell window
cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
.\build-windows.ps1
```

### Step 3: Test in Windows
```powershell
# Still in Windows PowerShell
node test-layered-tools.js
```

## Quick Build Command

Add this alias to your PowerShell profile for quick builds:
```powershell
# Add to $PROFILE
function Build-RoughCut {
    & "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\build-windows.ps1"
}
```

Then just run `Build-RoughCut` from anywhere.

## Auto-Build Solution (Optional)

Create a file watcher that auto-builds when you save in WSL2:

### watch-and-build.ps1
```powershell
# Save this as watch-and-build.ps1
$projectPath = "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"

Write-Host "Watching for changes in WSL2 development..." -ForegroundColor Cyan
Write-Host "Will auto-build on Windows when files change" -ForegroundColor Yellow

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "$projectPath\src"
$watcher.Filter = "*.ts"
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite

$action = {
    Write-Host "`nFile changed, rebuilding..." -ForegroundColor Yellow
    & "$projectPath\build-windows.ps1"
}

Register-ObjectEvent $watcher "Changed" -Action $action

Write-Host "Press Ctrl+C to stop watching" -ForegroundColor Gray
while ($true) { Start-Sleep 1 }
```

## Critical Rules

### ✅ ALWAYS:
1. **Develop** in WSL2 with Claude Code
2. **Build** in Windows PowerShell
3. **Test** in Windows
4. **Verify** no `/mnt/` paths in build

### ❌ NEVER:
1. Run `npm run build` in WSL2
2. Run `node build/index.js` in WSL2
3. Test MCP server from WSL2
4. Push to GitHub without Windows build

## Verification Checklist

Before pushing to GitHub:
```powershell
# In Windows PowerShell
.\build-windows.ps1
# Should show: "No WSL paths found - build is clean!"

# Test the server works
node build\index.js
# Should start without errors

# Run tests
node test-layered-tools.js
# Should pass all tests
```

## Common Issues

### "WSL paths found in build"
- You ran `npm run build` in WSL2
- Solution: Run `.\build-windows.ps1` in Windows

### "Cannot find module"
- Dependencies installed in WSL2 not Windows
- Solution: Run `npm install` in Windows PowerShell

### "Process exited with code 1"
- WSL paths in compiled code
- Solution: Rebuild with `.\build-windows.ps1`

## Benefits

1. **Use Claude Code** - Keep your preferred development environment
2. **Windows compatibility** - Builds work on all Windows machines
3. **CI/CD ready** - GitHub Actions will pass
4. **No path issues** - Windows paths everywhere that matters

## Quick Reference

| Task | Where | Command |
|------|-------|---------|
| Edit code | WSL2/Claude Code | Use normally |
| Build | Windows PowerShell | `.\build-windows.ps1` |
| Test | Windows PowerShell | `node test-layered-tools.js` |
| Run MCP | Windows PowerShell | `node build\index.js` |
| Git commit | WSL2 or Windows | Either is fine |
| Git push | After Windows build | Ensure clean build first |

## Summary

This hybrid approach gives you the best of both worlds:
- **Development comfort** of Claude Code in WSL2
- **Production reliability** of Windows-native builds

Just remember the golden rule:
**Develop in WSL2, Build in Windows, Test in Windows**