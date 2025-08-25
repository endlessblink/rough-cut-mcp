#!/usr/bin/env node

/**
 * Install script for RoughCut MCP Server
 * Automatically configures Claude Desktop to use the MCP server
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎬 RoughCut MCP Server - Claude Desktop Installer');
console.log('='.repeat(60));

// Determine platform
const platform = process.platform;
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';

if (!isWindows && !isMac) {
  console.error('❌ Unsupported platform:', platform);
  console.error('   This MCP server only supports Windows and macOS');
  process.exit(1);
}

// Get Claude Desktop config path
const configDir = isWindows 
  ? join(homedir(), 'AppData', 'Roaming', 'Claude')
  : join(homedir(), 'Library', 'Application Support', 'Claude');

const configPath = join(configDir, 'claude_desktop_config.json');

// Ensure config directory exists
if (!existsSync(configDir)) {
  mkdirSync(configDir, { recursive: true });
  console.log('✅ Created Claude config directory');
}

// Load or create config
let config = {};
if (existsSync(configPath)) {
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
    console.log('✅ Found existing Claude Desktop config');
  } catch (error) {
    console.error('⚠️  Error reading config, creating new one');
    config = {};
  }
} else {
  console.log('📝 Creating new Claude Desktop config');
}

// Ensure mcpServers section exists
if (!config.mcpServers) {
  config.mcpServers = {};
}

// Get paths
const nodePath = process.argv[0];
const mcpPath = resolve(join(__dirname, 'build', 'index.js'));
const assetsDir = resolve(join(__dirname, 'assets'));

// Verify build exists
if (!existsSync(mcpPath)) {
  console.error('❌ Build not found! Run "npm run build" first');
  process.exit(1);
}

// Configure MCP server
config.mcpServers['rough-cut-mcp'] = {
  command: nodePath,
  args: [mcpPath],
  env: {
    NODE_ENV: 'production',
    REMOTION_ASSETS_DIR: assetsDir,
    MCP_LEGACY_MODE: 'false'
  }
};

// Write config
try {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Updated Claude Desktop configuration');
  console.log('');
  console.log('📍 Configuration written to:');
  console.log('   ' + configPath);
  console.log('');
  console.log('🎬 RoughCut MCP Server has been configured!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart Claude Desktop');
  console.log('2. The RoughCut MCP tools will be available');
  console.log('3. Start with "discover-capabilities" to see available tools');
  console.log('');
  console.log('Happy video creation! 🎥');
} catch (error) {
  console.error('❌ Failed to write config:', error.message);
  process.exit(1);
}