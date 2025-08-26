#!/usr/bin/env node

/**
 * Fix Claude Desktop config to use globally installed rough-cut-mcp
 * Run this after npm install -g rough-cut-mcp
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

console.log('\n🔧 Fixing Claude Desktop config for global rough-cut-mcp\n');

// Find npm global prefix
let npmPrefix;
try {
  npmPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
  console.log(`📦 npm global prefix: ${npmPrefix}`);
} catch (e) {
  console.error('❌ Could not find npm global prefix');
  process.exit(1);
}

// Build path to globally installed rough-cut-mcp
const globalModulePath = join(npmPrefix, 'node_modules', 'rough-cut-mcp');
const globalBuildPath = join(globalModulePath, 'build', 'index.js');
const globalAssetsPath = join(globalModulePath, 'assets');

console.log(`📍 Looking for global installation at: ${globalModulePath}`);

if (!existsSync(globalBuildPath)) {
  console.error(`❌ rough-cut-mcp not found globally installed`);
  console.error(`   Expected at: ${globalBuildPath}`);
  console.error(`\n   Please run: npm install -g rough-cut-mcp`);
  process.exit(1);
}

console.log(`✅ Found global installation`);

// Find Claude Desktop config
const claudeConfigDir = join(homedir(), 'AppData', 'Roaming', 'Claude');
const configPath = join(claudeConfigDir, 'claude_desktop_config.json');

if (!existsSync(configPath)) {
  console.error('❌ Claude Desktop config not found');
  process.exit(1);
}

// Read and update config
let config;
try {
  const configContent = readFileSync(configPath, 'utf-8');
  config = JSON.parse(configContent);
  console.log('✅ Read Claude Desktop config');
} catch (e) {
  console.error('❌ Failed to read config:', e.message);
  process.exit(1);
}

// Update rough-cut-mcp configuration
const oldPath = config.mcpServers?.['rough-cut-mcp']?.args?.[0];
console.log(`\n📝 Updating configuration:`);
console.log(`   Old path: ${oldPath}`);
console.log(`   New path: ${globalBuildPath}`);

config.mcpServers = config.mcpServers || {};
config.mcpServers['rough-cut-mcp'] = {
  command: 'node',
  args: [globalBuildPath.replace(/\\/g, '\\\\')],
  env: {
    REMOTION_ASSETS_DIR: globalAssetsPath.replace(/\\/g, '\\\\'),
    NODE_ENV: 'production'
  }
};

// Write updated config
try {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('\n✅ Updated Claude Desktop config successfully');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart Claude Desktop');
  console.log('   2. Test with: "Use the discover tool"');
} catch (e) {
  console.error('❌ Failed to write config:', e.message);
  process.exit(1);
}