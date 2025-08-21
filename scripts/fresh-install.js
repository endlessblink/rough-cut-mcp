#!/usr/bin/env node

// Complete fresh install script - removes all cache and reinstalls MCP server
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧹 Complete Fresh Install - Removing All Cache...\n");

// Get Claude Desktop config paths
const isWindows = process.platform === 'win32';
const claudeConfigDir = isWindows 
  ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude')
  : path.join(os.homedir(), '.config', 'claude');

const mcpConfigFile = path.join(claudeConfigDir, 'claude_desktop_config.json');

console.log("📍 Locations:");
console.log("   Claude Config Dir:", claudeConfigDir);
console.log("   MCP Config File:", mcpConfigFile);

// Step 1: Read current config
let config = {};
try {
  if (fs.existsSync(mcpConfigFile)) {
    config = fs.readJsonSync(mcpConfigFile);
    console.log("\n✅ Found existing Claude Desktop config");
  } else {
    console.log("\n⚠️  No existing Claude Desktop config found");
  }
} catch (error) {
  console.error("❌ Error reading config:", error.message);
}

// Step 2: Remove rough-cut-mcp from config
if (config.mcpServers && config.mcpServers['rough-cut-mcp']) {
  delete config.mcpServers['rough-cut-mcp'];
  console.log("🗑️  Removed rough-cut-mcp from Claude Desktop config");
} else {
  console.log("ℹ️  rough-cut-mcp not found in config");
}

// Step 3: Save cleaned config
try {
  if (!fs.existsSync(claudeConfigDir)) {
    fs.ensureDirSync(claudeConfigDir);
  }
  fs.writeJsonSync(mcpConfigFile, config, { spaces: 2 });
  console.log("✅ Saved cleaned config");
} catch (error) {
  console.error("❌ Error saving config:", error.message);
}

// Step 4: Add fresh installation
const projectPath = path.dirname(__dirname);
const serverCommand = path.join(projectPath, 'build', 'index.js');

if (!config.mcpServers) {
  config.mcpServers = {};
}

config.mcpServers['rough-cut-mcp'] = {
  command: 'node',
  args: [serverCommand],
  env: {
    NODE_ENV: 'production'
  }
};

console.log("\n🔧 Installing fresh MCP server...");
console.log("   Command: node");
console.log("   Args:", [serverCommand]);

// Step 5: Save new config
try {
  fs.writeJsonSync(mcpConfigFile, config, { spaces: 2 });
  console.log("✅ Installed fresh rough-cut-mcp server");
} catch (error) {
  console.error("❌ Error installing fresh server:", error.message);
  process.exit(1);
}

console.log("\n🎯 Next Steps:");
console.log("1. Close Claude Desktop completely");
console.log("2. Wait 10 seconds");
console.log("3. Restart Claude Desktop");
console.log("4. Test with: 'Create a 5-second animation of a red car moving from left to right'");

console.log("\n📋 What to Expect:");
console.log("- Claude should see the updated tool description with 'ATTENTION CLAUDE'");
console.log("- compositionCode should be REQUIRED in the schema");
console.log("- Debug logs should show '[DEBUG] Received parameters'");
console.log("- No more spawn EINVAL errors");

console.log("\n✨ Fresh install complete!");