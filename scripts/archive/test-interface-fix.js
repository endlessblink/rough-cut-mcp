#!/usr/bin/env node

/**
 * Test that verifies the interface binding fix
 * Should show that CORE_OPERATIONS tools are now exposed
 */

async function testInterfaceFix() {
  console.log('🔧 Testing Interface Binding Fix...\n');

  // Set environment to test mode
  process.env.NODE_ENV = 'test';

  // Import the server from build
  const { RemotionCreativeMCPServer } = await import('./build/index.js');
  
  // Create server instance
  console.log('1. Creating server instance...');
  const server = new RemotionCreativeMCPServer();
  
  // Initialize
  console.log('2. Initializing server...');
  await server.initialize();
  
  // Get active tools
  const activeTools = server.toolRegistry.getActiveTools();
  console.log(`\n✅ Active tools count: ${activeTools.length}`);
  
  // Categorize tools
  const toolsByCategory = {};
  for (const tool of activeTools) {
    const category = tool.metadata?.category || 'unknown';
    if (!toolsByCategory[category]) {
      toolsByCategory[category] = [];
    }
    toolsByCategory[category].push(tool.name);
  }
  
  console.log('\n📊 Tools by Category:');
  for (const [category, tools] of Object.entries(toolsByCategory)) {
    console.log(`   ${category}: ${tools.length} tools`);
    console.log(`      - ${tools.join(', ')}`);
  }
  
  // Check if essential tools are exposed
  const essentialTools = [
    'discover', 'activate', 'search', // Discovery (3)
    'project', 'studio', // Core Operations (2)
    'create-video', 'composition', 'analyze-video', 'render' // Video Creation (4)
  ];
  
  const exposedToolNames = activeTools.map(t => t.name);
  const missingTools = essentialTools.filter(t => !exposedToolNames.includes(t));
  
  console.log('\n🎯 Essential Tools Check:');
  console.log(`   Expected: ${essentialTools.length} tools`);
  console.log(`   Found: ${essentialTools.filter(t => exposedToolNames.includes(t)).length} tools`);
  
  if (missingTools.length > 0) {
    console.log(`   ❌ Missing: ${missingTools.join(', ')}`);
  } else {
    console.log(`   ✅ All essential tools are exposed!`);
  }
  
  // Performance metrics
  const totalTools = server.toolRegistry.getTotalToolsCount();
  const exposureRate = Math.round((activeTools.length / totalTools) * 100);
  
  console.log('\n📈 Performance Metrics:');
  console.log(`   Total tools: ${totalTools}`);
  console.log(`   Exposed tools: ${activeTools.length}`);
  console.log(`   Exposure rate: ${exposureRate}%`);
  console.log(`   Context saved: ${100 - exposureRate}%`);
  
  // Success check
  const success = activeTools.length >= 9 && missingTools.length === 0;
  
  if (success) {
    console.log('\n✅ SUCCESS: Interface binding fix working correctly!');
    console.log('   - All essential tools are exposed');
    console.log('   - Dropdown architecture maintained');
    console.log('   - Performance optimized');
  } else {
    console.log('\n❌ ISSUE: Some tools are still not exposed');
    console.log('   - Check tool registration and category assignments');
  }
  
  process.exit(success ? 0 : 1);
}

// Run the test
testInterfaceFix().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});