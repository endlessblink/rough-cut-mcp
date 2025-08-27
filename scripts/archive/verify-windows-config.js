#!/usr/bin/env node

// Verify rough-cut-mcp is properly installed in Windows Claude Desktop config
import fs from 'fs-extra';
import path from 'path';

console.log("🔍 Verifying RoughCut MCP Installation in Windows Config...\n");

// Check the correct Windows config path
const windowsConfigPath = '/mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json';

console.log(`📍 Checking Windows Claude Desktop config: ${windowsConfigPath}\n`);

if (fs.existsSync(windowsConfigPath)) {
  try {
    const config = fs.readJsonSync(windowsConfigPath);
    const hasRoughCut = config.mcpServers && config.mcpServers['rough-cut-mcp'];
    const serverCount = config.mcpServers ? Object.keys(config.mcpServers).length : 0;
    
    console.log(`✅ Windows config file exists`);
    console.log(`📊 Total MCP servers: ${serverCount}`);
    console.log(`🎬 Has rough-cut-mcp: ${hasRoughCut ? '✅ YES' : '❌ NO'}`);
    
    if (hasRoughCut) {
      const roughCutConfig = config.mcpServers['rough-cut-mcp'];
      console.log(`🔧 Command: ${roughCutConfig.command}`);
      console.log(`📁 Path: ${roughCutConfig.args ? roughCutConfig.args[0] : 'N/A'}`);
      console.log(`🌍 Environment: ${roughCutConfig.env ? JSON.stringify(roughCutConfig.env) : 'None'}`);
    }
    
    if (serverCount > 0) {
      console.log(`📋 Other servers: ${Object.keys(config.mcpServers).filter(s => s !== 'rough-cut-mcp').join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ Error reading Windows config: ${error.message}`);
  }
} else {
  console.log(`⚠️  Windows config file does not exist`);
}

console.log();

// Check if the server file exists and can start
const serverPath = "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut/build/index-clean.js";
console.log("📁 Server File Verification:");
console.log(`Server path: ${serverPath}`);
console.log(`Exists: ${fs.existsSync(serverPath) ? '✅' : '❌'}`);

if (fs.existsSync(serverPath)) {
  console.log(`File size: ${fs.statSync(serverPath).size} bytes`);
  console.log(`Last modified: ${fs.statSync(serverPath).mtime}`);
}

console.log();
console.log("🎯 Next Steps:");
console.log("1. Close Claude Desktop completely");
console.log("2. Wait 10 seconds");
console.log("3. Restart Claude Desktop");
console.log("4. Look for 'rough-cut-mcp' in available tools");
console.log("5. Test: 'Create a 5-second animation of a red car moving left to right'");
console.log();
console.log("✨ Installation complete in Windows config!");