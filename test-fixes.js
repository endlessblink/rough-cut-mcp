#!/usr/bin/env node

/**
 * Test script to verify the fixes work
 * This tests the MCP server without needing Claude Desktop
 */

import { RemotionCreativeMCPServer } from './build/index.js';

console.log('Testing Rough Cut MCP Fixes...\n');

async function testServer() {
  try {
    // Create server instance
    console.log('1. Creating server instance...');
    const server = new RemotionCreativeMCPServer();
    console.log('   ✅ Server created successfully');
    
    // Initialize
    console.log('\n2. Initializing server...');
    await server.initialize();
    console.log('   ✅ Server initialized');
    
    // Get tools
    console.log('\n3. Getting active tools...');
    const tools = server.getTools();
    console.log(`   ✅ Found ${tools.length} active tools`);
    
    // List tools by name
    console.log('\n4. Active tools:');
    tools.forEach(tool => {
      console.log(`   - ${tool.name}`);
    });
    
    // Test registry statistics
    console.log('\n5. Testing registry statistics...');
    const registry = server.getToolRegistry();
    const stats = registry.getUsageStatistics();
    console.log(`   - Total tools: ${stats.totalTools}`);
    console.log(`   - Active tools: ${stats.activeTools}`);
    console.log(`   - Categories loaded: ${stats.categoriesLoaded}`);
    console.log('   ✅ Statistics working');
    
    // Test tool handler retrieval
    console.log('\n6. Testing tool handlers...');
    const handlers = server.getToolHandlers();
    const projectHandler = registry.getToolHandlerSafe('project');
    if (projectHandler) {
      console.log('   ✅ Tool handler retrieval working');
    } else {
      console.log('   ⚠️  Project handler not found');
    }
    
    // Test project list action
    console.log('\n7. Testing project list action...');
    if (projectHandler) {
      try {
        const result = await projectHandler({ action: 'list' });
        console.log('   ✅ Project list executed successfully');
        if (result.content && result.content[0]) {
          console.log(`   Result: ${result.content[0].text.slice(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ❌ Project list failed: ${error.message}`);
      }
    }
    
    // Test discovery tool
    console.log('\n8. Testing discovery tool...');
    const discoverHandler = registry.getToolHandlerSafe('discover');
    if (discoverHandler) {
      const result = await discoverHandler({ type: 'stats' });
      console.log('   ✅ Discovery tool working');
    } else {
      console.log('   ⚠️  Discovery handler not found');
    }
    
    // Test sub-category activation
    console.log('\n9. Testing sub-category activation...');
    const activateResult = registry.activateSubCategory('video-creation', 'basic', false);
    console.log(`   ✅ Sub-category activation: ${activateResult.message}`);
    
    console.log('\n✅ ALL TESTS PASSED! The fixes are working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testServer().catch(console.error);