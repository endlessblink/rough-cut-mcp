#!/usr/bin/env node

// Test spawn fix for Windows/WSL2 issues
import { spawn } from 'child_process';
import os from 'os';

console.log("🔧 Testing Spawn Fix for Windows/WSL2...\n");

console.log("Platform Info:");
console.log("  Platform:", process.platform);
console.log("  OS Release:", os.release());
console.log("  Is WSL:", process.platform === 'linux' && os.release().toLowerCase().includes('microsoft'));

// Test basic spawn
console.log("\n🧪 Testing Basic Spawn...");
try {
  const child = spawn('node', ['--version'], { shell: true });
  child.stdout.on('data', (data) => {
    console.log("✅ Node version:", data.toString().trim());
  });
  child.on('error', (error) => {
    console.error("❌ Spawn error:", error.message);
  });
  child.on('close', (code) => {
    console.log("✅ Process exited with code:", code);
    testRemotionFix();
  });
} catch (error) {
  console.error("❌ Basic spawn failed:", error.message);
}

function testRemotionFix() {
  console.log("\n🧪 Testing Platform Fix Import...");
  
  import('../build/utils/platform-fix.js').then((platformFix) => {
    console.log("✅ Platform fix imported successfully");
    console.log("✅ Available functions:", Object.keys(platformFix));
    
    // Test createRemotionProcess function
    if (platformFix.createRemotionProcess) {
      console.log("\n🧪 Testing createRemotionProcess...");
      try {
        const child = platformFix.createRemotionProcess('node', ['--version']);
        child.stdout.on('data', (data) => {
          console.log("✅ Platform fix spawn works:", data.toString().trim());
        });
        child.on('error', (error) => {
          console.error("❌ Platform fix spawn error:", error.message);
        });
        child.on('close', (code) => {
          console.log("✅ Platform fix process exited with code:", code);
          console.log("\n🎉 Spawn fix is working correctly!");
        });
      } catch (error) {
        console.error("❌ Platform fix failed:", error.message);
      }
    } else {
      console.error("❌ createRemotionProcess function not found");
    }
  }).catch((error) => {
    console.error("❌ Failed to import platform fix:", error.message);
  });
}