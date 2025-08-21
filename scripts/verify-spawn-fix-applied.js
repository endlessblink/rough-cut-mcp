#!/usr/bin/env node

// Verify the spawn fix is properly applied to process-isolation.js
import fs from 'fs-extra';
import os from 'os';

console.log("🔍 Verifying Spawn Fix in index-clean.js Server...\n");

const processIsolationPath = "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut/build/utils/process-isolation.js";

console.log(`📁 Checking: ${processIsolationPath}\n`);

if (fs.existsSync(processIsolationPath)) {
  const content = fs.readFileSync(processIsolationPath, 'utf8');
  
  const hasShellFix = content.includes('shell: (isWindows || isWSL) ? true : false');
  const hasPlatformDetection = content.includes('const isWSL = process.platform === \'linux\' && os.release().toLowerCase().includes(\'microsoft\')');
  
  console.log(`✅ File exists`);
  console.log(`🛠️  Has shell fix: ${hasShellFix ? '✅ YES' : '❌ NO'}`);
  console.log(`🔍 Has platform detection: ${hasPlatformDetection ? '✅ YES' : '❌ NO'}`);
  
  if (hasShellFix && hasPlatformDetection) {
    console.log(`\n🎉 SUCCESS: Spawn EINVAL fix is properly applied!`);
  } else {
    console.log(`\n❌ ISSUE: Spawn fix is missing or incomplete`);
  }
} else {
  console.log(`❌ File does not exist`);
}

console.log();

// Platform detection
console.log("🖥️  Platform Detection:");
console.log(`Current platform: ${process.platform}`);
console.log(`OS release: ${os.release()}`);
console.log(`Is WSL: ${process.platform === 'linux' && os.release().toLowerCase().includes('microsoft')}`);
console.log(`Should use shell: ${process.platform === 'win32' || (process.platform === 'linux' && os.release().toLowerCase().includes('microsoft'))}`);

console.log();
console.log("🎯 Ready for Testing:");
console.log("1. Close Claude Desktop completely");
console.log("2. Wait 10 seconds");
console.log("3. Restart Claude Desktop");
console.log("4. Test: 'Create a 5-second animation of a red car moving left to right'");
console.log();
console.log("Expected: No more spawn EINVAL errors! 🚀");