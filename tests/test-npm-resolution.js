#!/usr/bin/env node

/**
 * Quick test to verify npm/npx command resolution works
 */

import { getNpmCommand, getNpxCommand } from './build/utils/process-isolation.js';
import { spawn } from 'child_process';

console.log('🔍 Testing npm/npx command resolution...\n');

// Test npm resolution
const npmCmd = getNpmCommand();
console.log(`📦 npm command resolved to: ${npmCmd}`);

// Test npx resolution  
const npxCmd = getNpxCommand();
console.log(`⚡ npx command resolved to: ${npxCmd}`);

// Test if they actually work
console.log('\n🧪 Testing command execution...');

// Test npm --version
const testNpm = spawn(npmCmd, ['--version'], { stdio: 'pipe' });
testNpm.stdout.on('data', (data) => {
  console.log(`✅ npm version: ${data.toString().trim()}`);
});
testNpm.stderr.on('data', (data) => {
  console.log(`❌ npm error: ${data.toString().trim()}`);
});
testNpm.on('exit', (code) => {
  console.log(`npm test exit code: ${code}`);
  
  // Test npx --version after npm test completes
  const testNpx = spawn(npxCmd, ['--version'], { stdio: 'pipe' });
  testNpx.stdout.on('data', (data) => {
    console.log(`✅ npx version: ${data.toString().trim()}`);
  });
  testNpx.stderr.on('data', (data) => {
    console.log(`❌ npx error: ${data.toString().trim()}`);
  });
  testNpx.on('exit', (code) => {
    console.log(`npx test exit code: ${code}`);
    console.log('\n🎯 Command resolution test completed!');
    process.exit(code === 0 ? 0 : 1);
  });
});