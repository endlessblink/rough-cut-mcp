#!/usr/bin/env node

/**
 * Safe Claude Desktop Configuration Updater
 * Uses Node.js to ensure proper JSON formatting
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const configPath = path.join(
  process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
  'Claude',
  'claude_desktop_config.json'
);

const projectPath = 'D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut';

console.log('📝 Updating Claude Desktop Configuration...\n');

// Read existing config
let config = { mcpServers: {} };
if (fs.existsSync(configPath)) {
  try {
    const existing = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(existing);
    console.log('✅ Found existing configuration');
    
    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
  } catch (error) {
    console.log('⚠️  Could not parse existing config, starting fresh');
    config = { mcpServers: {} };
  }
} else {
  console.log('📁 Creating new configuration');
  
  // Ensure directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

// Backup existing config
if (fs.existsSync(configPath)) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = `${configPath}.backup_${timestamp}`;
  fs.copyFileSync(configPath, backupPath);
  console.log(`📦 Backed up to: ${backupPath}\n`);
}

// Update rough-cut-mcp configuration
config.mcpServers['rough-cut-mcp'] = {
  command: 'C:\\Program Files\\nodejs\\node.exe',
  args: [`${projectPath}\\build\\index.js`],
  env: {
    REMOTION_ASSETS_DIR: `${projectPath}\\assets`,
    NODE_ENV: 'production'
  }
};

// Write the config with proper formatting
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  
  console.log('✅ Configuration updated successfully!\n');
  console.log('📋 Configuration Details:');
  console.log(`  Command: C:\\Program Files\\nodejs\\node.exe`);
  console.log(`  Script: ${projectPath}\\build\\index.js`);
  console.log(`  Assets: ${projectPath}\\assets\n`);
  
  console.log('🔄 MCP Servers configured:');
  Object.keys(config.mcpServers).forEach(server => {
    console.log(`  - ${server}`);
  });
  
  console.log('\n⚠️  IMPORTANT: Restart Claude Desktop for changes to take effect');
} catch (error) {
  console.error('❌ Failed to write configuration:', error.message);
  console.log('\n📋 Manual configuration needed. Copy this to:', configPath);
  console.log(JSON.stringify(config, null, 2));
}