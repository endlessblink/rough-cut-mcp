#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Only run postinstall when installed globally or via npm, not during development
if (process.env.npm_lifecycle_event !== 'postinstall') {
  process.exit(0);
}

// Check if this is a global install
const isGlobal = process.env.npm_config_global === 'true';

console.log('\n🎬 Rough Cut MCP Server - Installation\n');

if (platform() !== 'win32') {
  console.warn('⚠️  WARNING: This MCP server is designed for Windows.');
  console.warn('   Installation will continue, but functionality may be limited on other platforms.\n');
}

// Find Claude Desktop config location
const claudeConfigDir = join(homedir(), 'AppData', 'Roaming', 'Claude');
const configPath = join(claudeConfigDir, 'claude_desktop_config.json');

if (!existsSync(claudeConfigDir)) {
  console.log('Claude Desktop configuration directory not found.');
  console.log('Please ensure Claude Desktop is installed.\n');
  console.log('Manual setup instructions:');
  console.log('1. Create the directory: %APPDATA%\\Claude');
  console.log('2. Create claude_desktop_config.json with the MCP server configuration');
  console.log('3. See README.md for configuration details\n');
  process.exit(0);
}

// Get the installed package location
const packageRoot = join(__dirname, '..');
const buildPath = join(packageRoot, 'build', 'index.js');
const assetsPath = join(packageRoot, 'assets');

// Read existing config or create new one
let config = { mcpServers: {} };
if (existsSync(configPath)) {
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
    console.log('✓ Found existing Claude Desktop configuration');
  } catch (error) {
    console.error('Error reading existing config:', error.message);
    process.exit(1);
  }
} else {
  console.log('✓ Creating new Claude Desktop configuration');
}

// Add or update rough-cut-mcp server configuration
config.mcpServers = config.mcpServers || {};
config.mcpServers['rough-cut-mcp'] = {
  command: process.platform === 'win32' ? 
    'C:\\Program Files\\nodejs\\node.exe' : 
    'node',
  args: [buildPath.replace(/\\/g, '\\\\')],
  env: {
    REMOTION_ASSETS_DIR: assetsPath.replace(/\\/g, '\\\\'),
    NODE_ENV: 'production'
  }
};

// Write updated config
try {
  if (!existsSync(claudeConfigDir)) {
    mkdirSync(claudeConfigDir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✓ Updated Claude Desktop configuration');
  console.log(`  Configuration saved to: ${configPath}`);
} catch (error) {
  console.error('Error writing config:', error.message);
  console.log('\nPlease manually add the following to your claude_desktop_config.json:');
  console.log(JSON.stringify({ 'rough-cut-mcp': config.mcpServers['rough-cut-mcp'] }, null, 2));
  process.exit(1);
}

// Create assets directory if it doesn't exist
if (!existsSync(assetsPath)) {
  mkdirSync(assetsPath, { recursive: true });
  console.log('✓ Created assets directory');
}

console.log('\n✅ Installation complete!');
console.log('\n📝 Next steps:');
console.log('1. Restart Claude Desktop');
console.log('2. Test the MCP server by typing: "Use the discover tool"');
console.log('\n🎯 Quick test commands:');
console.log('  • "Show available tool categories" - Lists all tools');
console.log('  • "Create a simple text animation" - Creates your first video');
console.log('  • "Launch Remotion Studio" - Opens the video editor');
console.log('\n📖 Full documentation: https://github.com/YOUR_USERNAME/RoughCut\n');