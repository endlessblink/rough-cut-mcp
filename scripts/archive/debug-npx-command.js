#!/usr/bin/env node

// Debug what getNpxCommand returns in our environment
import { getNpxCommand } from '../build/utils/process-isolation.js';
import { execSync } from 'child_process';
import os from 'os';

console.log("🔍 Debugging getNpxCommand in WSL2 Environment...\n");

console.log("🖥️  Platform Info:");
console.log(`Platform: ${process.platform}`);
console.log(`OS Release: ${os.release()}`);
console.log(`Is WSL: ${process.platform === 'linux' && os.release().toLowerCase().includes('microsoft')}`);
console.log();

console.log("📍 Command Resolution:");
try {
  const npxCmd = getNpxCommand();
  console.log(`getNpxCommand() returns: "${npxCmd}"`);
  console.log(`Type: ${typeof npxCmd}`);
  console.log(`Length: ${npxCmd.length}`);
  console.log();
  
  // Test if the command exists
  console.log("🧪 Testing command existence:");
  try {
    const result = execSync(`which "${npxCmd}"`, { encoding: 'utf8', timeout: 5000 });
    console.log(`"which" result: ${result.trim()}`);
  } catch (error) {
    console.log(`"which" failed: ${error.message}`);
  }
  
  // Try finding npx manually
  console.log("\n🔍 Manual npx detection:");
  try {
    const manualResult = execSync('which npx', { encoding: 'utf8', timeout: 5000 });
    console.log(`Manual "which npx": ${manualResult.trim()}`);
  } catch (error) {
    console.log(`Manual detection failed: ${error.message}`);
  }
  
} catch (error) {
  console.error(`Error getting npx command: ${error.message}`);
}

console.log();
console.log("💡 Analysis:");
console.log("If getNpxCommand() returns a path with spaces without proper quoting,");
console.log("that's the source of the 'C:\\Program' error.");
console.log("The fix would be to ensure proper path quoting in spawnIsolated.");