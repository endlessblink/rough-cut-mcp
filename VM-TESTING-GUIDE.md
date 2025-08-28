# 🖥️ VM Testing Guide for Rough Cut MCP

This guide helps you test the Rough Cut MCP package in a clean Windows virtual machine environment to ensure it works correctly for end users.

## Why Test in a VM?

- **Clean Environment**: No development tools or custom configurations
- **Real User Experience**: Tests the actual npm installation process
- **Cross-Platform Verification**: Ensures compatibility across different Windows versions
- **Dependency Validation**: Confirms all required dependencies are properly packaged

## 📋 Prerequisites

### Host System Requirements
- **RAM**: At least 8GB (12GB+ recommended)
- **Disk Space**: 50GB free space minimum
- **CPU**: Virtualization support enabled (Intel VT-x/AMD-V)
- **Network**: Stable internet connection

### Software Needed
1. **Virtualization Platform** (choose one):
   - [VirtualBox](https://www.virtualbox.org/) (Free - Recommended for most users)
   - [VMware Workstation](https://www.vmware.com/products/workstation-pro.html) (Commercial - Good if you already have it)
   - [Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/) (Windows Pro+)

2. **Windows ISO** (choose one):
   - Windows 10 (build 1909+)
   - Windows 11 (any version)
   - Get from [Microsoft](https://www.microsoft.com/software-download/)

## 🚀 Step-by-Step Setup

### 1. Create Virtual Machine

#### VirtualBox Settings (Recommended):
```
Name: Windows-RoughCut-Test
Type: Microsoft Windows
Version: Windows 10/11 (64-bit)
RAM: 4096MB (minimum) / 8192MB (recommended)
Disk: 60GB VDI (dynamically allocated)
CPU: 2-4 cores
Network: NAT
```

#### VMware Workstation Settings (Alternative):
```
Name: Windows-RoughCut-Test
OS: Windows 10/11 x64
RAM: 4GB (minimum) / 8GB (recommended)
Disk: 60GB (dynamic allocation)
CPU: 2-4 cores
Network: NAT (default)
```

> **💡 Note**: Both VirtualBox and VMware work equally well for testing MCP packages. VirtualBox is recommended because it's free and has all the features needed for this testing scenario.

### 2. Install Windows

1. **Boot from ISO**: Mount the Windows ISO and boot the VM
2. **Basic Installation**: Follow standard Windows installation
3. **User Account**: Create a local user account (avoid Microsoft account for testing)
4. **Updates**: Install critical Windows updates
5. **Guest Tools**: Install VMware Tools or VirtualBox Guest Additions

### 3. Install Node.js

Choose **ONE** installation method to test:

#### Option A: Standard Installer (Most Common)
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Use the Windows Installer (.msi)
3. Install with default settings
4. Verify: Open Command Prompt, run `node --version`

#### Option B: Node Version Manager (Advanced Users)
1. Install [nvm-windows](https://github.com/coreybutler/nvm-windows)
2. Install Node.js: `nvm install latest`
3. Use Node.js: `nvm use latest`

#### Option C: Package Manager (Power Users)
```powershell
# Using Chocolatey
choco install nodejs

# Using Scoop
scoop install nodejs
```

### 4. Install Claude Desktop

1. Download from [Claude.ai](https://claude.ai/download)
2. Install with default settings
3. **Don't sign in yet** - we'll test the MCP setup first

## 🧪 Testing Procedure

### Phase 1: Package Installation

1. **Install from npm**:
   ```powershell
   npm install -g rough-cut-mcp
   ```

2. **Verify Installation**:
   ```powershell
   # Check if command is available
   rough-cut-mcp --help
   
   # Check installation location
   npm list -g rough-cut-mcp
   ```

3. **Expected Results**:
   - ✅ Package installs without errors
   - ✅ Postinstall script runs successfully
   - ✅ Claude Desktop config is created/updated
   - ✅ Build files exist and are executable

### Phase 2: Configuration Verification

1. **Check Claude Config**:
   ```powershell
   # Check if config exists
   type "%APPDATA%\Claude\claude_desktop_config.json"
   ```

2. **Expected Config Structure**:
   ```json
   {
     "mcpServers": {
       "rough-cut-mcp": {
         "command": "C:\\Program Files\\nodejs\\node.exe",
         "args": ["C:\\Users\\[USER]\\AppData\\Roaming\\npm\\node_modules\\rough-cut-mcp\\build\\index.js"],
         "env": {
           "REMOTION_ASSETS_DIR": "C:\\Users\\[USER]\\AppData\\Roaming\\npm\\node_modules\\rough-cut-mcp\\assets",
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

3. **Verify Paths**:
   - ✅ All paths use Windows format (`C:\...`)
   - ✅ No WSL paths (`/mnt/...`) anywhere
   - ✅ Node.js executable path is correct
   - ✅ Build file exists and is accessible

### Phase 3: Claude Desktop Integration

1. **Start Claude Desktop**:
   - Launch Claude Desktop
   - Sign in with your account
   - Wait for full initialization

2. **Test MCP Connection**:
   ```
   Type: "Use the discover tool"
   ```

3. **Expected Response**:
   ```
   🎯 Rough Cut MCP - Discovery Tools

   Available Tool Categories:
   📋 DISCOVERY (3 tools) - Always active
   🎬 CORE_OPERATIONS (2 tools) - Default active  
   🎥 VIDEO_CREATION (4 tools) - Default active
   🎵 VOICE_GENERATION (3 tools) - Activate on demand
   🔊 SOUND_EFFECTS (3 tools) - Activate on demand
   🎨 IMAGE_GENERATION (3 tools) - Activate on demand
   🧹 MAINTENANCE (2 tools) - Activate on demand

   Currently Active: 9 tools
   Available on-demand: 7 tools
   ```

### Phase 4: Functionality Testing

1. **Test Core Functions**:
   ```
   "List available video projects"
   "Launch Remotion Studio"  
   "Create a simple bouncing ball animation"
   ```

2. **Test Tool Activation**:
   ```
   "Activate maintenance tools"
   "Show me the active tools now"
   ```

3. **Expected Behavior**:
   - ✅ Commands execute without errors
   - ✅ Remotion Studio launches successfully
   - ✅ Projects can be created and managed
   - ✅ Tool activation works correctly

## 🐛 Common Issues & Solutions

### Installation Issues

**Issue**: `npm install -g rough-cut-mcp` fails
- **Cause**: Insufficient permissions
- **Solution**: Run PowerShell as Administrator

**Issue**: "Build file not found" during postinstall
- **Cause**: Package not built correctly
- **Solution**: Check npm package contents, rebuild package

**Issue**: Node.js path detection fails
- **Cause**: Non-standard Node.js installation
- **Solution**: Set `DEBUG_MCP_INSTALL=true` to see path detection details

### Claude Desktop Issues

**Issue**: "MCP server failed to start"
- **Check**: Claude Desktop logs in `%APPDATA%\Claude\logs\`
- **Solution**: Verify Node.js path and build file exist

**Issue**: "Process exited with code 1"
- **Cause**: WSL paths in configuration
- **Solution**: Check config for `/mnt/` paths, reinstall if needed

**Issue**: Tools not appearing
- **Check**: MCP connection status in Claude Desktop
- **Solution**: Restart Claude Desktop, check logs

### Path-Related Issues

**Issue**: "Cannot find module" errors
- **Cause**: Incorrect path format (WSL vs Windows)
- **Solution**: Ensure all paths use Windows format (`C:\...`)

**Issue**: "ENOENT: no such file or directory"
- **Cause**: Path contains invalid characters or doesn't exist
- **Solution**: Verify build files exist at specified paths

## 📊 Test Results Template

Create a test report using this template:

```markdown
# Rough Cut MCP - VM Test Results

## Test Environment
- **OS**: Windows [10/11] Build [number]
- **VM Platform**: [VMware/VirtualBox/Hyper-V]
- **Node.js**: v[version] ([installation method])
- **npm**: v[version]
- **Test Date**: [date]

## Installation Results
- [ ] Package installs without errors
- [ ] Postinstall script completes successfully  
- [ ] Claude Desktop config is created/updated
- [ ] All paths use Windows format

## Integration Results
- [ ] Claude Desktop recognizes MCP server
- [ ] Discovery tool responds correctly
- [ ] Shows 9 default tools available
- [ ] Tool activation works
- [ ] Remotion Studio launches

## Issues Found
- None / [List any issues]

## Overall Result
✅ PASS / ❌ FAIL

## Notes
[Additional observations]
```

## 💡 Pro Tips

### Performance Optimization
- **Increase VM RAM** to 8GB+ for better Remotion Studio performance
- **Enable Hardware Acceleration** if available
- **Use SSD Storage** for the VM for better I/O performance

### Testing Variations
- **Test Multiple Node.js Versions**: 18.x, 20.x, 22.x
- **Test Different Installation Methods**: Standard, NVM, Chocolatey
- **Test Both Windows 10 and 11**: Ensure compatibility

### Debugging Tools
- **Windows Event Viewer**: Check system logs
- **PowerShell Execution Policy**: May need to be adjusted
- **Claude Desktop Logs**: `%APPDATA%\Claude\logs\`

## 🔄 Cleanup

After testing, you can:

1. **Save VM Snapshot**: For future testing
2. **Export Results**: Document findings
3. **Delete VM**: Free up disk space
4. **Keep Template**: For testing updates

## 📞 Getting Help

If you encounter issues during testing:

1. **Check Logs**: Windows Event Viewer, Claude Desktop logs
2. **Enable Debug Mode**: `set DEBUG_MCP_INSTALL=true`
3. **Create Issue**: [GitHub Repository](https://github.com/endlessblink/rough-cut-mcp/issues)
4. **Include Details**: VM specs, Windows version, error messages

---

**Happy Testing! 🚀**

This VM testing ensures Rough Cut MCP works perfectly for real users across different Windows configurations.