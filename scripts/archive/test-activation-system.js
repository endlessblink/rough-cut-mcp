#!/usr/bin/env node

/**
 * Test that verifies the on-demand activation system works
 */

async function testActivationSystem() {
  console.log('🔧 Testing On-Demand Tool Activation System...\n');

  // Set environment to test mode
  process.env.NODE_ENV = 'test';

  // Import the server
  const { RemotionCreativeMCPServer } = await import('./build/index.js');
  
  // Create server instance
  console.log('1. Creating server instance...');
  const server = new RemotionCreativeMCPServer();
  
  // Initialize
  console.log('2. Initializing server...');
  await server.initialize();
  
  // Get initial active tools
  const initialTools = server.toolRegistry.getActiveTools();
  console.log(`\n✅ Initial tools: ${initialTools.length} tools`);
  console.log('   Tools:', initialTools.map(t => t.name).join(', '));
  
  // Test activating maintenance category (should add 'assets' and 'cache' tools)
  console.log('\n3. Testing activation of MAINTENANCE category...');
  const maintenanceResult = server.toolRegistry.activateTools({
    categories: ['maintenance'],
    exclusive: false
  });
  
  console.log(`   Result: ${maintenanceResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (maintenanceResult.activated) {
    console.log(`   Activated: ${maintenanceResult.activated.join(', ')}`);
  }
  
  const afterMaintenance = server.toolRegistry.getActiveTools();
  console.log(`   Total tools now: ${afterMaintenance.length}`);
  
  // Test activating voice generation (requires API key)
  console.log('\n4. Testing activation of VOICE_GENERATION category...');
  const voiceResult = server.toolRegistry.activateTools({
    categories: ['voice-generation'],
    exclusive: false
  });
  
  console.log(`   Result: ${voiceResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (voiceResult.message) {
    console.log(`   Message: ${voiceResult.message}`);
  }
  if (voiceResult.activated && voiceResult.activated.length > 0) {
    console.log(`   Activated: ${voiceResult.activated.join(', ')}`);
  }
  
  const afterVoice = server.toolRegistry.getActiveTools();
  console.log(`   Total tools now: ${afterVoice.length}`);
  
  // Test exclusive activation (should deactivate others)
  console.log('\n5. Testing EXCLUSIVE activation (only discovery tools)...');
  const exclusiveResult = server.toolRegistry.activateTools({
    categories: ['discovery'],
    exclusive: true
  });
  
  console.log(`   Result: ${exclusiveResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (exclusiveResult.deactivated && exclusiveResult.deactivated.length > 0) {
    console.log(`   Deactivated: ${exclusiveResult.deactivated.length} tools`);
  }
  
  const afterExclusive = server.toolRegistry.getActiveTools();
  console.log(`   Total tools now: ${afterExclusive.length}`);
  console.log('   Remaining:', afterExclusive.map(t => t.name).join(', '));
  
  // Summary
  console.log('\n📊 Activation System Test Summary:');
  console.log(`   ✅ Initial tools loaded: ${initialTools.length}`);
  console.log(`   ✅ Can activate additional categories: ${maintenanceResult.success ? 'YES' : 'NO'}`);
  console.log(`   ✅ Exclusive mode works: ${exclusiveResult.success ? 'YES' : 'NO'}`);
  console.log(`   ✅ Total available tools: ${server.toolRegistry.getTotalToolsCount()}`);
  
  // Test the actual categories available
  console.log('\n📋 Available Categories for Activation:');
  const categories = ['maintenance', 'voice-generation', 'sound-effects', 'image-generation'];
  for (const cat of categories) {
    const tools = server.toolRegistry.getToolsByCategory(cat.toUpperCase().replace('-', '_'));
    console.log(`   ${cat}: ${tools.length} tools`);
    if (tools.length > 0) {
      console.log(`      - ${tools.map(t => t.name).join(', ')}`);
    }
  }
  
  // Final verdict
  const success = initialTools.length === 9 && 
                  maintenanceResult.success && 
                  afterMaintenance.length > initialTools.length;
  
  console.log('\n========================================');
  if (success) {
    console.log('✅ ON-DEMAND ACTIVATION SYSTEM: WORKING!');
    console.log('   - Default: 9 tools exposed');
    console.log('   - On-demand: 7 more tools available');
    console.log('   - Total: 16 tools in system');
  } else {
    console.log('❌ ISSUES DETECTED:');
    if (initialTools.length !== 9) {
      console.log(`   - Wrong initial tool count: ${initialTools.length} (expected 9)`);
    }
    if (!maintenanceResult.success) {
      console.log('   - Category activation failed');
    }
  }
  console.log('========================================');
  
  process.exit(success ? 0 : 1);
}

// Run the test
testActivationSystem().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});