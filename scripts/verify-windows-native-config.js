#!/usr/bin/env node

// Verify Windows-native configuration for Claude Desktop
import fs from 'fs-extra';

console.log("🔍 Verifying Windows-Native Claude Desktop Configuration...\n");

// Check Windows config
const configPath = '/mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json';
console.log(`📁 Reading: ${configPath}\n`);

if (fs.existsSync(configPath)) {
  const config = fs.readJsonSync(configPath);
  const roughCutConfig = config.mcpServers?.['rough-cut-mcp'];
  
  if (roughCutConfig) {
    console.log("✅ rough-cut-mcp configuration found:");
    console.log(`🔧 Command: ${roughCutConfig.command}`);
    console.log(`📄 Script: ${roughCutConfig.args[0]}`);
    console.log(`📁 Assets: ${roughCutConfig.env?.REMOTION_ASSETS_DIR}`);
    console.log(`🛤️  PATH: ${roughCutConfig.env?.PATH}`);
    console.log();
    
    // Verify Windows paths
    const isWindowsCommand = roughCutConfig.command.includes('C:\\');
    const isWindowsScript = roughCutConfig.args[0].includes('D:\\');
    const isWindowsAssets = roughCutConfig.env?.REMOTION_ASSETS_DIR?.includes('D:\\');
    
    console.log("🪟 Windows Path Verification:");
    console.log(`Command uses Windows path: ${isWindowsCommand ? '✅' : '❌'}`);
    console.log(`Script uses Windows path: ${isWindowsScript ? '✅' : '❌'}`);
    console.log(`Assets use Windows path: ${isWindowsAssets ? '✅' : '❌'}`);
    
    if (isWindowsCommand && isWindowsScript && isWindowsAssets) {
      console.log(`\n🎉 SUCCESS: Configuration is Windows-native!`);
    } else {
      console.log(`\n⚠️  WARNING: Some paths are not Windows-native`);
    }
  } else {
    console.log("❌ rough-cut-mcp not found in config");
  }
} else {
  console.log("❌ Config file not found");
}

console.log();

// Check if server file exists (from WSL2 perspective)
const serverPath = "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut/build/index-clean.js";
console.log("📄 Server File Check:");
console.log(`WSL2 path: ${serverPath}`);
console.log(`Exists: ${fs.existsSync(serverPath) ? '✅' : '❌'}`);
console.log(`Windows equivalent: D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\build\\index-clean.js`);

console.log();
console.log("🎯 Key Changes Made:");
console.log("1. ✅ Using Windows Node.js: C:\\Program Files\\nodejs\\node.exe");
console.log("2. ✅ Windows-style paths with backslashes");
console.log("3. ✅ Pure Windows PATH environment");
console.log("4. ✅ Chrome executable path for Puppeteer");
console.log("5. ✅ Removed WSL2-specific code");
console.log();
console.log("🚀 Ready for Testing:");
console.log("1. Close Claude Desktop completely");
console.log("2. Wait 10 seconds");
console.log("3. Restart Claude Desktop");
console.log("4. Test: 'Create a 5-second animation of a red car moving left to right'");
console.log();
console.log("Expected: Windows-native execution without path conversion issues!");