# 🎭 Playwright MCP Setup Guide - Universal Configuration

This guide ensures Playwright MCP works on **any Claude Code instance** across different environments and setups.

## 📋 Quick Setup Checklist

- [ ] ✅ **Project MCP Configuration**: `.mcp.json` exists (auto-included with project)
- [ ] 🖥️ **Windows WSL2**: Configure `.wslconfig` for networking (Windows users only)
- [ ] 🌐 **Playwright**: Install browsers (`npx playwright install`)
- [ ] 🔄 **Restart**: WSL2 shutdown and restart (Windows users only)
- [ ] ✅ **Test**: Verify MCP tools are available

---

## 🚀 Universal Setup (Works Everywhere)

### Step 1: Project Configuration ✅ **ALREADY DONE**

The project includes a `.mcp.json` file with Playwright MCP configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--isolated"],
      "env": {
        "DEBUG": "pw:api"
      }
    }
  }
}
```

**✅ This works on any system with Node.js - no additional setup needed!**

---

## 🖥️ Windows WSL2 Setup (Windows Users Only)

### Step 2: WSL2 Networking Configuration

**Why needed**: WSL2 networking isolation prevents Claude Code from accessing MCP servers.

#### Create/Edit `.wslconfig`

**Location**: `%UserProfile%\.wslconfig` (e.g., `C:\Users\YourName\.wslconfig`)

**Add this section**:
```ini
[wsl2]
networkingMode=mirrored
```

**If file doesn't exist**: Create it with the above content.  
**If file exists**: Add the `networkingMode=mirrored` line under `[wsl2]` section.

#### Apply Changes

**From Windows PowerShell/CMD**:
```powershell
wsl --shutdown
```

**Wait 10 seconds, then restart your WSL2 session**.

---

## 🌐 Install Playwright Browsers

### Step 3: Browser Installation

**From any terminal (WSL2, Linux, Mac)**:
```bash
npx playwright install
```

**Alternative** (install specific browsers):
```bash
npx playwright install chromium firefox webkit
```

---

## 🔧 Alternative Configurations

### For Non-WSL2 Environments

**If you're NOT using WSL2** (native Linux, Mac, Windows without WSL), the project configuration works out-of-the-box. No additional setup required.

### For Different Node.js Setups

**Using Yarn**:
```bash
yarn dlx @playwright/mcp@latest --isolated
```

**Using pnpm**:
```bash
pnpx @playwright/mcp@latest --isolated
```

---

## ✅ Verification & Testing

### Test MCP Tools Availability

**In Claude Code**:
1. Open this project directory
2. Start a new conversation
3. Ask: "Can you take a screenshot of example.com?"
4. If MCP tools are available, you'll see: `mcp__playwright__browser_navigate` and related tools

### Test WSL2 Networking (Windows)

**Check if mirrored mode is active**:
```bash
wslinfo --networking-mode
```
**Should return**: `mirrored`

**Test localhost access**:
```bash
curl -I http://localhost:3333
```
**Should return**: HTTP response headers (if server is running on port 3333)

---

## 🚨 Troubleshooting

### MCP Tools Not Available

**Symptoms**: Claude Code says "No such tool available: mcp__playwright__browser_navigate"

**Solutions**:
1. **Check `.mcp.json` exists** in project root
2. **Restart Claude Code** completely  
3. **Verify Node.js installed**: `node --version`
4. **Try manual test**: `npx @playwright/mcp@latest --help`

### WSL2 Networking Issues (Windows)

**Symptoms**: "Failed to connect to localhost"

**Solutions**:
1. **Verify `.wslconfig` has** `networkingMode=mirrored`
2. **Complete WSL shutdown**: `wsl --shutdown` from Windows
3. **Check WSL version**: `wsl -l -v` (should show Version 2)
4. **Restart Windows** if networking still broken

### Browser Installation Problems

**Symptoms**: "No browser found" or installation errors

**Solutions**:
1. **Manual install**: `npx playwright install --force`
2. **Check disk space**: Browsers need ~1GB total
3. **Permission issues**: Run with proper permissions
4. **Corporate networks**: May need proxy configuration

### Port Conflicts

**Symptoms**: Server not accessible or MCP connection fails

**Solutions**:
1. **Check what's running**: `ss -tlnp | grep :3000`
2. **Use different port**: Update server to bind to available port
3. **Kill conflicting process**: `pkill -f node` (be careful!)

---

## 🌐 Environment-Specific Notes

### Windows 11 Requirements
- **Windows 11 22H2 or higher** required for `networkingMode=mirrored`
- **Windows 10 users**: Use alternative network forwarding methods

### Corporate/Enterprise Networks
- **Proxy settings**: May need to configure npm/yarn proxy
- **Firewall rules**: WSL2 networking may need Windows Firewall exceptions
- **Security policies**: Some organizations block npx/external package execution

### Multi-User Machines
- **WSL2 limitation**: Only one user can use mirrored mode at a time
- **Solution**: Use different networking approaches or coordinate usage

---

## 📚 Additional Resources

- **Playwright MCP Documentation**: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **Claude Code MCP Guide**: [Anthropic Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- **WSL2 Networking**: [Microsoft Learn - WSL Networking](https://learn.microsoft.com/en-us/windows/wsl/networking)

---

## 🎯 Quick Commands Reference

```bash
# Install Playwright browsers
npx playwright install

# Test MCP server manually  
npx @playwright/mcp@latest --help

# Check WSL networking mode (Windows)
wslinfo --networking-mode

# Restart WSL2 (Windows PowerShell)
wsl --shutdown

# Test localhost connectivity
curl -I http://localhost:3333
```

---

**✅ This configuration works across:**
- ✅ Windows 10/11 with WSL2
- ✅ Native Linux distributions  
- ✅ macOS systems
- ✅ Any Claude Code installation
- ✅ Team collaboration (via version control)

**🎭 Happy automating with Playwright MCP!**