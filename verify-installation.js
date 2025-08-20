#!/usr/bin/env node

/**
 * Verification script for Remotion Creative MCP Server installation
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Remotion Creative MCP Server Installation\n');
console.log('=' .repeat(60));

let allGood = true;

// 1. Check build exists
console.log('\n1️⃣  Checking build files...');
const buildPath = path.join(__dirname, 'build', 'index.js');
if (await fs.pathExists(buildPath)) {
  console.log('   ✅ Build files exist');
} else {
  console.log('   ❌ Build files missing - run: npm run build');
  allGood = false;
}

// 2. Check assets directories
console.log('\n2️⃣  Checking asset directories...');
const assetDirs = ['temp', 'videos', 'audio', 'images'];
for (const dir of assetDirs) {
  const dirPath = path.join(__dirname, 'assets', dir);
  if (await fs.pathExists(dirPath)) {
    console.log(`   ✅ ${dir}/ directory exists`);
  } else {
    console.log(`   ❌ ${dir}/ directory missing`);
    allGood = false;
  }
}

// 3. Check Node.js version
console.log('\n3️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (18+ required)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} - version 18+ required`);
  allGood = false;
}

// 4. Check dependencies
console.log('\n4️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (await fs.pathExists(nodeModulesPath)) {
  console.log('   ✅ Dependencies installed');
} else {
  console.log('   ❌ Dependencies missing - run: npm install');
  allGood = false;
}

// 5. Check Windows Claude config (if in WSL)
console.log('\n5️⃣  Checking Claude Desktop configuration...');
const isWSL = process.platform === 'linux' && fs.existsSync('/mnt/c');
if (isWSL) {
  const configPath = '/mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json';
  try {
    const config = await fs.readJson(configPath);
    if (config.mcpServers && config.mcpServers['remotion-creative']) {
      console.log('   ✅ Remotion Creative configured in Claude Desktop');
      console.log('      Server path:', config.mcpServers['remotion-creative'].args[0]);
    } else {
      console.log('   ⚠️  Remotion Creative not found in Claude config');
      console.log('      Run: npm run install-to-claude');
      allGood = false;
    }
  } catch (error) {
    console.log('   ⚠️  Could not read Claude config');
  }
} else {
  console.log('   ℹ️  Not in WSL - check your platform\'s config location');
}

// Summary
console.log('\n' + '=' .repeat(60));
if (allGood) {
  console.log('✅ Installation verified successfully!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Restart Claude Desktop');
  console.log('   2. Try: "Create a 5-second welcome video"');
  console.log('   3. Try: "Launch Remotion Studio"');
} else {
  console.log('⚠️  Some issues found - please fix them before using');
}

console.log('\n📚 Available commands:');
console.log('   npm run build         - Compile TypeScript');
console.log('   npm run install-to-claude - Configure Claude Desktop');
console.log('   npm start             - Test the MCP server');
console.log('   npm run studio        - Launch Remotion Studio');

process.exit(allGood ? 0 : 1);