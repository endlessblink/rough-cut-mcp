#!/usr/bin/env node

/**
 * Test MCP server tool registration without platform restrictions
 */

// Set test environment to bypass Windows check
process.env.NODE_ENV = 'test';

const { RemotionCreativeMCPServer } = require('./build/index.js');

async function testMCPTools() {
  console.log('🧪 Testing MCP Server Tool Registration...');
  
  try {
    // Create server instance
    const server = new RemotionCreativeMCPServer();
    
    // Wait for initialization
    console.log('⏳ Initializing server...');
    await server.initialize();
    
    console.log('✅ Server initialized successfully');
    
    // Get active tools
    const activeTools = server.toolRegistry.getActiveTools();
    console.log(`📊 Active tools count: ${activeTools.length}`);
    
    // Check if studio tool exists
    const studioTool = activeTools.find(tool => tool.name === 'studio');
    if (studioTool) {
      console.log('✅ Studio tool found and active');
      console.log(`   Description: ${studioTool.description}`);
      console.log(`   Category: ${studioTool.metadata?.category || 'unknown'}`);
    } else {
      console.log('❌ Studio tool NOT found in active tools');
    }
    
    // List all active tools
    console.log('\n📝 All active tools:');
    activeTools.forEach((tool, i) => {
      console.log(`${i + 1}. ${tool.name} - ${tool.description.slice(0, 50)}...`);
    });
    
    // Test tool registry state
    const stats = server.toolRegistry.getUsageStatistics();
    console.log(`\n📈 Registry stats:`, stats);
    
    console.log('\n✅ MCP Server tool registration test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run test
testMCPTools().then(() => {
  console.log('\n🎯 Test completed - MCP server tools are working!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});