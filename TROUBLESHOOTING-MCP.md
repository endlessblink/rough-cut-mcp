# 🛠️ Playwright MCP Troubleshooting Guide

Complete troubleshooting guide for Playwright MCP issues across all environments.

## 🚨 Quick Fixes - Common Issues

### Issue: "No such tool available: mcp__playwright__browser_navigate"

**Symptoms**: Claude Code can't find Playwright MCP tools
**Cause**: MCP server not loaded or configured incorrectly

**✅ Solutions (try in order):**

1. **Check project directory**:
   ```bash
   # Make sure you're in the project root with .mcp.json
   pwd
   ls -la .mcp.json
   ```

2. **Restart Claude Code completely**:
   - Close all Claude Code windows
   - Wait 10 seconds
   - Reopen project directory

3. **Validate configuration**:
   ```bash
   # Run validation script
   node scripts/validate-mcp-setup.js
   # Or on Windows PowerShell
   .\scripts\validate-mcp-setup.ps1
   ```

4. **Test MCP server manually**:
   ```bash
   npx @playwright/mcp@latest --help
   # Should show --isolated flag option
   ```

---

### Issue: "Failed to connect to localhost port 3000"

**Symptoms**: Browser automation can't reach your local server
**Cause**: Server not running or networking issues

**✅ Solutions:**

1. **Check what's actually running**:
   ```bash
   # Linux/WSL2/Mac
   ss -tlnp | grep :3000
   
   # Windows
   netstat -an | findstr :3000
   ```

2. **Start your development server**:
   ```bash
   # Common commands
   npm run dev
   npm start
   yarn dev
   # Make sure it binds to 0.0.0.0, not just 127.0.0.1
   ```

3. **Use correct port**:
   ```bash
   # Check what ports are actually available
   ss -tlnp | grep LISTEN
   # Use the correct port in your browser automation
   ```

---

### Issue: WSL2 "Browser is already in use" Error

**Symptoms**: Multiple browser instance conflicts in WSL2
**Cause**: WSL2 networking not configured for MCP

**✅ Solutions:**

1. **Add mirrored networking to .wslconfig**:
   ```ini
   # File: %USERPROFILE%\.wslconfig
   [wsl2]
   networkingMode=mirrored
   ```

2. **Restart WSL2** (from Windows PowerShell):
   ```powershell
   wsl --shutdown
   # Wait 10 seconds, then restart your WSL2 session
   ```

3. **Verify mirrored mode active**:
   ```bash
   wslinfo --networking-mode
   # Should return: mirrored
   ```

---

## 🐧 WSL2-Specific Issues

### Issue: "Cannot connect to MCP server"

**Advanced WSL2 debugging:**

1. **Check WSL version**:
   ```bash
   wsl -l -v
   # All distributions should show "Version 2"
   ```

2. **Test networking between Windows and WSL2**:
   ```bash
   # From WSL2, test Windows localhost
   curl -I http://$(grep nameserver /etc/resolv.conf | awk '{print $2}'):3333
   ```

3. **Alternative: Use Windows firewall rule**:
   ```powershell
   # Run as Administrator in Windows PowerShell
   New-NetFirewallRule -DisplayName "Allow WSL2 Internal Traffic" -Direction Inbound -Protocol TCP -Action Allow -RemoteAddress 172.21.0.0/16 -LocalAddress 172.21.0.0/16
   ```

### Issue: "Multiple users can't use WSL2 simultaneously"

**Known WSL2 limitation**: Only one user can use mirrored networking at a time.

**Workarounds:**
- Coordinate usage with other users
- Use different networking mode for some users
- Consider native Windows or Linux environments

---

## 📦 Node.js & Package Issues

### Issue: "npx command not found"

**Cause**: Node.js not installed or not in PATH

**✅ Solutions:**

1. **Install Node.js**:
   ```bash
   # Windows: Download from https://nodejs.org
   # Linux: Use package manager
   sudo apt install nodejs npm
   # Mac: Use Homebrew
   brew install node
   ```

2. **Fix PATH issues**:
   ```bash
   # Check if node is accessible
   which node
   which npm
   which npx
   
   # Add to PATH if needed
   export PATH=$PATH:/path/to/node/bin
   ```

### Issue: "Package installation fails"

**Corporate/Enterprise networks:**

1. **Configure npm proxy**:
   ```bash
   npm config set proxy http://your-proxy:port
   npm config set https-proxy https://your-proxy:port
   ```

2. **Trust corporate certificates**:
   ```bash
   npm config set strict-ssl false  # Temporary fix
   npm config set cafile /path/to/certificate.pem  # Better fix
   ```

3. **Use alternative registries**:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

---

## 🎭 Playwright-Specific Issues

### Issue: "No browser found" or browser installation fails

**✅ Solutions:**

1. **Manual browser installation**:
   ```bash
   # Install all browsers
   npx playwright install
   
   # Install specific browser
   npx playwright install chromium
   npx playwright install firefox
   npx playwright install webkit
   ```

2. **Fix permission issues**:
   ```bash
   # Linux: May need sudo for dependencies
   sudo npx playwright install-deps
   
   # Windows: Run as Administrator if needed
   ```

3. **Corporate environment - offline installation**:
   ```bash
   # Download browsers to a specific location
   PLAYWRIGHT_BROWSERS_PATH=/custom/path npx playwright install
   ```

### Issue: "Playwright MCP server starts but doesn't respond"

**Advanced debugging:**

1. **Enable verbose logging**:
   ```bash
   DEBUG=pw:* npx @playwright/mcp@latest --isolated
   ```

2. **Test without headless mode**:
   ```bash
   # Remove --headless to see browser window
   npx @playwright/mcp@latest --isolated
   ```

3. **Check browser process**:
   ```bash
   # Find browser processes
   ps aux | grep -i chrome
   ps aux | grep -i firefox
   
   # Kill if stuck
   pkill -f chrome
   pkill -f firefox
   ```

---

## 🔧 Configuration Issues

### Issue: "Environment variables not working"

**✅ Solutions:**

1. **Check variable syntax in .mcp.json**:
   ```json
   {
     "env": {
       "DEBUG": "${DEBUG_PLAYWRIGHT:-pw:api}",
       "CUSTOM_VAR": "${CUSTOM_VAR:-default_value}"
     }
   }
   ```

2. **Set environment variables properly**:
   ```bash
   # Linux/Mac/WSL2
   export DEBUG_PLAYWRIGHT="pw:*"
   export PLAYWRIGHT_BROWSER="firefox"
   
   # Windows PowerShell
   $env:DEBUG_PLAYWRIGHT = "pw:*"
   $env:PLAYWRIGHT_BROWSER = "firefox"
   
   # Windows CMD
   set DEBUG_PLAYWRIGHT=pw:*
   set PLAYWRIGHT_BROWSER=firefox
   ```

3. **Verify variables are set**:
   ```bash
   # Linux/Mac/WSL2
   env | grep PLAYWRIGHT
   
   # Windows PowerShell
   Get-ChildItem Env: | Where-Object Name -like "*PLAYWRIGHT*"
   ```

---

## 🚨 Emergency Fixes

### Nuclear Option: Complete Reset

If nothing else works, complete reset:

1. **Kill all processes**:
   ```bash
   # Kill any stuck processes
   pkill -f playwright
   pkill -f chrome
   pkill -f firefox
   
   # Windows
   taskkill /F /IM chrome.exe
   taskkill /F /IM firefox.exe
   ```

2. **Clear caches**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Clear Playwright cache
   rm -rf ~/.cache/ms-playwright
   
   # Windows
   rmdir /S %USERPROFILE%\AppData\Local\ms-playwright
   ```

3. **Reinstall everything**:
   ```bash
   # Reinstall Playwright
   npx playwright install --force
   
   # Reinstall MCP package
   npm cache clean --force
   npx @playwright/mcp@latest --help
   ```

4. **Restart everything**:
   ```bash
   # WSL2 users
   wsl --shutdown  # From Windows PowerShell
   
   # Then restart WSL2, Claude Code, and any development servers
   ```

---

## 📋 Diagnostic Commands

### Complete System Check

Run these commands to gather diagnostic information:

```bash
# System information
echo "=== System Information ==="
uname -a
node --version
npm --version
npx --version

# WSL2 information (if applicable)
echo "=== WSL2 Information ==="
wslinfo --networking-mode 2>/dev/null || echo "Not in WSL2"
cat /proc/version 2>/dev/null | grep Microsoft || echo "Not in WSL2"

# Network connectivity
echo "=== Network Connectivity ==="
curl -I https://registry.npmjs.org --max-time 5
ss -tlnp | head -10

# Playwright status
echo "=== Playwright Status ==="
npx playwright --version
npx @playwright/mcp@latest --help | head -5

# Project configuration
echo "=== Project Configuration ==="
ls -la .mcp.json
cat .mcp.json | head -20
```

### Performance Check

```bash
# Check system resources
echo "=== System Resources ==="
df -h
free -h 2>/dev/null || echo "Memory info not available"
ps aux | grep -E "(node|chrome|firefox)" | wc -l
```

---

## 📞 Getting Help

### Before asking for help, run:

1. **Validation script**:
   ```bash
   node scripts/validate-mcp-setup.js
   # Or Windows:
   .\scripts\validate-mcp-setup.ps1 -Detailed
   ```

2. **Collect diagnostic information** using the commands above

3. **Include**:
   - Your operating system and version
   - Node.js version (`node --version`)
   - Whether you're using WSL2
   - Complete error messages
   - What you were trying to do when the error occurred

### Common Support Resources

- **Playwright MCP GitHub**: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **Claude Code Documentation**: [Anthropic MCP Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)
- **WSL2 Networking**: [Microsoft WSL Documentation](https://learn.microsoft.com/en-us/windows/wsl/networking)

---

## 🎯 Prevention Tips

### Keep your setup healthy:

1. **Regular updates**:
   ```bash
   # Update npm packages
   npm update -g
   
   # Update Playwright browsers
   npx playwright install
   ```

2. **Monitor resources**:
   ```bash
   # Check for stuck processes regularly
   ps aux | grep -E "(node|chrome|firefox)" | grep -v grep
   ```

3. **Clean up periodically**:
   ```bash
   # Clean npm cache monthly
   npm cache clean --force
   
   # Remove old browser versions
   npx playwright install --force
   ```

---

**✅ Most issues can be resolved by following this guide systematically. Start with Quick Fixes and work your way down!**