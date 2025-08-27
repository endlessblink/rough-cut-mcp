#!/usr/bin/env node

/**
 * Test script for Node.js path detection
 * Run this to see which Node.js path would be detected
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { platform } from 'os';
import { execSync } from 'child_process';

console.log('🔍 Testing Node.js Path Detection\n');
console.log('=' .repeat(50));

// Show environment
console.log('\n📋 Environment Variables:');
console.log(`  process.execPath: ${process.execPath}`);
console.log(`  npm_node_execpath: ${process.env.npm_node_execpath || '(not set)'}`);
console.log(`  npm_execpath: ${process.env.npm_execpath || '(not set)'}`);
console.log(`  PATH includes: ${process.env.PATH?.split(';').slice(0, 3).join('; ')}...`);

console.log('\n🔎 Testing Detection Methods:');
console.log('-'.repeat(50));

let detectedPath = null;
let methodUsed = null;

// Method 1: npm_node_execpath
console.log('\n1. Checking npm_node_execpath...');
if (process.env.npm_node_execpath && existsSync(process.env.npm_node_execpath)) {
  console.log(`   ✅ Found: ${process.env.npm_node_execpath}`);
  if (!detectedPath) {
    detectedPath = process.env.npm_node_execpath;
    methodUsed = 'npm_node_execpath';
  }
} else {
  console.log(`   ❌ Not available or doesn't exist`);
}

// Method 2: npm config get prefix
console.log('\n2. Checking npm config prefix...');
try {
  const npmPrefix = execSync('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
  const nodePath = join(npmPrefix, nodeExe);
  
  console.log(`   npm prefix: ${npmPrefix}`);
  console.log(`   Looking for: ${nodePath}`);
  
  if (existsSync(nodePath)) {
    console.log(`   ✅ Found: ${nodePath}`);
    if (!detectedPath) {
      detectedPath = nodePath;
      methodUsed = 'npm prefix';
    }
  } else {
    console.log(`   ❌ File doesn't exist at that path`);
  }
} catch (e) {
  console.log(`   ❌ Failed: ${e.message}`);
}

// Method 3: where/which command
console.log('\n3. Checking where/which command...');
try {
  const whichCmd = platform() === 'win32' ? 'where node' : 'which node';
  const result = execSync(whichCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  const paths = result.split('\n').map(p => p.trim()).filter(p => p);
  
  console.log(`   Found ${paths.length} path(s):`);
  paths.forEach(p => console.log(`     - ${p}`));
  
  for (const nodePath of paths) {
    if (existsSync(nodePath)) {
      console.log(`   ✅ Using: ${nodePath}`);
      if (!detectedPath) {
        detectedPath = nodePath;
        methodUsed = 'where/which command';
      }
      break;
    }
  }
} catch (e) {
  console.log(`   ❌ Failed: ${e.message}`);
}

// Method 4: npm bin
console.log('\n4. Checking npm bin -g...');
try {
  const npmBin = execSync('npm bin -g', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
  const nodePath = join(dirname(npmBin), nodeExe);
  
  console.log(`   npm bin: ${npmBin}`);
  console.log(`   Looking for: ${nodePath}`);
  
  if (existsSync(nodePath)) {
    console.log(`   ✅ Found: ${nodePath}`);
    if (!detectedPath) {
      detectedPath = nodePath;
      methodUsed = 'npm bin';
    }
  } else {
    console.log(`   ❌ File doesn't exist at that path`);
  }
} catch (e) {
  console.log(`   ❌ Failed: ${e.message}`);
}

// Method 5: npm_execpath
console.log('\n5. Checking npm_execpath...');
if (process.env.npm_execpath) {
  const npmDir = dirname(process.env.npm_execpath);
  const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
  const nodePath = join(npmDir, nodeExe);
  
  console.log(`   npm_execpath: ${process.env.npm_execpath}`);
  console.log(`   Looking for: ${nodePath}`);
  
  if (existsSync(nodePath)) {
    console.log(`   ✅ Found: ${nodePath}`);
    if (!detectedPath) {
      detectedPath = nodePath;
      methodUsed = 'npm_execpath';
    }
  } else {
    console.log(`   ❌ File doesn't exist at that path`);
  }
} else {
  console.log(`   ❌ npm_execpath not set`);
}

// Method 6: Common Windows paths
if (platform() === 'win32') {
  console.log('\n6. Checking common Windows paths...');
  const commonPaths = [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
    'C:\\nodejs\\node.exe',
    'C:\\pinokio\\bin\\miniconda\\node.exe'
  ];
  
  for (const path of commonPaths) {
    console.log(`   Checking: ${path}`);
    if (existsSync(path)) {
      console.log(`   ✅ Found: ${path}`);
      if (!detectedPath) {
        detectedPath = path;
        methodUsed = 'common Windows path';
      }
      break;
    }
  }
}

// Method 7: process.execPath
console.log('\n7. Checking process.execPath...');
if (process.execPath && existsSync(process.execPath) && !process.execPath.includes('\\Temp\\')) {
  console.log(`   ✅ Valid: ${process.execPath}`);
  if (!detectedPath) {
    detectedPath = process.execPath;
    methodUsed = 'process.execPath';
  }
} else {
  console.log(`   ❌ Invalid or temp path: ${process.execPath}`);
}

// Results
console.log('\n' + '='.repeat(50));
console.log('📊 Detection Results:\n');

if (detectedPath) {
  console.log(`✅ SELECTED PATH: ${detectedPath}`);
  console.log(`   Method used: ${methodUsed}`);
  
  // Test if we can execute it
  try {
    const version = execSync(`"${detectedPath}" --version`, { encoding: 'utf8' }).trim();
    console.log(`   Node version: ${version}`);
  } catch (e) {
    console.log(`   ⚠️  Warning: Could not execute Node.js at this path`);
  }
} else {
  console.log('❌ No valid Node.js path found!');
  console.log('   Would fall back to "node" command (relies on PATH)');
}

console.log('\n💡 To see debug output during install, set:');
console.log('   SET DEBUG_MCP_INSTALL=true');
console.log('   npm install -g rough-cut-mcp');