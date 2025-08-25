# PowerShell Scripts - How to Run Them

## ⚠️ IMPORTANT: Always use `.\` before script names!

PowerShell requires you to use `.\` (dot-backslash) before local script names for security reasons.

## Available Scripts

### 1. Build Script
```powershell
.\build-windows.ps1
```
Builds the TypeScript project into JavaScript that Claude Desktop can run.

### 2. Config Updater
```powershell
.\update-claude-config.ps1
```
Updates Claude Desktop configuration to use the MCP server.

### 3. Test Script
```powershell
.\test-all-scripts.ps1
```
Tests all scripts and checks your setup.

### 4. Setup Runner
```powershell
.\run-setup.ps1
```
Interactive script that runs build and config update for you.

## Common Errors and Solutions

### Error: "The term 'build-windows.ps1' is not recognized"
**Solution**: Use `.\build-windows.ps1` (with dot-backslash)

### Error: "cannot be loaded because running scripts is disabled"
**Solution**: Run this command as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Unexpected token '}' in expression"
**Solution**: This was a syntax error that has been fixed. Use the current scripts.

## Quick Start

1. **First Time Setup**:
   ```powershell
   cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
   .\test-all-scripts.ps1  # Check everything is ready
   .\build-windows.ps1      # Build the project
   .\update-claude-config.ps1  # Update Claude config
   ```

2. **Or use the interactive runner**:
   ```powershell
   .\run-setup.ps1
   ```

## Script Locations

All scripts are in:
```
D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\
```

- `build-windows.ps1` - Builds the project
- `update-claude-config.ps1` - Updates Claude Desktop config
- `test-all-scripts.ps1` - Tests everything
- `run-setup.ps1` - Interactive setup helper

## Testing the Scripts

To verify all scripts work correctly:
```powershell
.\test-all-scripts.ps1
```

This will check:
- All scripts exist
- PowerShell syntax is valid
- Node.js is installed
- Build output exists
- Claude Desktop configuration
- Old files that can be cleaned up