#!/usr/bin/env node

/**
 * Direct test of safe spawn functionality
 */

import { safeSpawn, isRemotionAvailable, commandExists } from './build/utils/safe-spawn.js';

console.log('🧪 Testing Safe Spawn Functionality\n');

async function runTests() {
  console.log('1️⃣ Testing command existence checks...');
  
  const npxExists = await commandExists('npx');
  console.log(`   npx exists: ${npxExists ? '✅' : '❌'}`);
  
  const nodeExists = await commandExists('node');
  console.log(`   node exists: ${nodeExists ? '✅' : '❌'}`);
  
  const fakeCommandExists = await commandExists('this-command-does-not-exist');
  console.log(`   fake command exists: ${!fakeCommandExists ? '✅ (correctly false)' : '❌'}`);
  
  console.log('\n2️⃣ Testing Remotion availability...');
  const remotionAvailable = await isRemotionAvailable();
  console.log(`   Remotion available: ${remotionAvailable ? '✅' : '❌'}`);
  
  console.log('\n3️⃣ Testing safe spawn with valid command...');
  const echoResult = await safeSpawn('echo', ['Hello, World!'], {
    stdio: 'pipe',
    timeout: 5000
  });
  console.log(`   Echo command: ${echoResult.success ? '✅' : '❌'}`);
  if (echoResult.error) {
    console.log(`   Error: ${echoResult.error}`);
  }
  
  console.log('\n4️⃣ Testing safe spawn with invalid command...');
  const invalidResult = await safeSpawn('this-command-does-not-exist', [], {
    stdio: 'pipe',
    timeout: 5000
  });
  console.log(`   Invalid command handled: ${!invalidResult.success ? '✅' : '❌'}`);
  console.log(`   Error message: ${invalidResult.error}`);
  
  console.log('\n5️⃣ Testing safe spawn with timeout...');
  console.log('   Starting long-running command with 2-second timeout...');
  const timeoutResult = await safeSpawn('sleep', ['10'], {
    stdio: 'pipe',
    timeout: 2000
  });
  console.log(`   Timeout triggered: ${!timeoutResult.success && timeoutResult.error?.includes('timeout') ? '✅' : '❌'}`);
  if (timeoutResult.error) {
    console.log(`   Error: ${timeoutResult.error}`);
  }
  
  console.log('\n6️⃣ Testing Remotion Studio spawn (if available)...');
  if (remotionAvailable) {
    console.log('   Attempting to check Remotion Studio help...');
    const studioResult = await safeSpawn('npx', ['remotion', 'studio', '--help'], {
      stdio: 'pipe',
      timeout: 10000
    });
    console.log(`   Studio help command: ${studioResult.success ? '✅' : '❌'}`);
    if (!studioResult.success) {
      console.log(`   Error: ${studioResult.error}`);
    }
  } else {
    console.log('   Skipping - Remotion not available');
  }
  
  console.log('\n✅ All safe spawn tests completed!');
}

// Run tests
runTests().catch(console.error);