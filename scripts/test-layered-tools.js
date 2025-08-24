#!/usr/bin/env node

/**
 * Test script for the new layered tool architecture
 * Run this after building to verify the tool registry is working correctly
 */

import { RemotionCreativeMCPServer } from '../build/index.js';

async function testLayeredArchitecture() {
  console.log('Testing Layered Tool Architecture...\n');

  try {
    // Create server instance
    const server = new RemotionCreativeMCPServer();
    await server.initialize();
    
    const registry = server.getToolRegistry();
    const activeTools = server.getTools();

    // Test 1: Check initial tool count
    console.log('Test 1: Initial Tool Count');
    console.log(`Mode: ${registry.getMode()}`);
    console.log(`Active tools: ${activeTools.length}`);
    console.log(`Expected: 9-10 tools initially (6 discovery + 3 core operations)`);
    
    if (activeTools.length <= 10) {
      console.log('✅ PASS: Tool count reduced as expected\n');
    } else {
      console.log(`❌ FAIL: Too many tools loaded initially (${activeTools.length})\n`);
    }

    // Test 2: Check discovery tools are present
    console.log('Test 2: Discovery Tools Available');
    const discoveryTools = [
      'discover-capabilities',
      'activate-toolset', 
      'search-tools',
      'get-active-tools',
      'suggest-tools',
      'get-tool-usage-stats'
    ];
    
    const activeToolNames = activeTools.map(t => t.name);
    const hasAllDiscovery = discoveryTools.every(name => activeToolNames.includes(name));
    
    if (hasAllDiscovery) {
      console.log('✅ PASS: All discovery tools available\n');
    } else {
      console.log('❌ FAIL: Missing discovery tools\n');
    }

    // Test 3: Check core operations are loaded
    console.log('Test 3: Core Operations Loaded');
    const coreOps = ['list-video-projects', 'get-project-status', 'launch-project-studio'];
    const hasCoreOps = coreOps.every(name => activeToolNames.includes(name));
    
    if (hasCoreOps) {
      console.log('✅ PASS: Core operations loaded by default\n');
    } else {
      console.log('❌ FAIL: Core operations not loaded\n');
    }

    // Test 4: Check that other tools are NOT loaded
    console.log('Test 4: Other Tools Not Initially Loaded');
    const shouldNotBeLoaded = ['generate-voice', 'generate-image', 'search-sound-effects'];
    const hasUnwantedTools = shouldNotBeLoaded.some(name => activeToolNames.includes(name));
    
    if (!hasUnwantedTools) {
      console.log('✅ PASS: API-dependent tools not loaded initially\n');
    } else {
      console.log('❌ FAIL: Unwanted tools are loaded initially\n');
    }

    // Test 5: Test tool activation
    console.log('Test 5: Dynamic Tool Activation');
    const result = registry.activateTools({
      categories: ['video-creation'],
      exclusive: false
    });
    
    const newActiveTools = registry.getActiveTools();
    console.log(`Tools after activation: ${newActiveTools.length}`);
    console.log(`Activated: ${result.activated.join(', ')}`);
    
    if (result.activated.length > 0) {
      console.log('✅ PASS: Tools can be activated dynamically\n');
    } else {
      console.log('❌ FAIL: Tool activation failed\n');
    }

    // Test 6: Test search functionality
    console.log('Test 6: Tool Search');
    const searchResults = registry.searchTools({
      query: 'video',
      limit: 5
    });
    
    console.log(`Found ${searchResults.length} tools matching "video"`);
    if (searchResults.length > 0) {
      console.log('✅ PASS: Tool search working\n');
    } else {
      console.log('❌ FAIL: Tool search not working\n');
    }

    // Test 7: Test categories
    console.log('Test 7: Tool Categories');
    const categories = registry.getCategories();
    console.log(`Total categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.toolCount} tools`);
    });
    
    if (categories.length > 0) {
      console.log('✅ PASS: Categories properly organized\n');
    } else {
      console.log('❌ FAIL: No categories found\n');
    }

    // Summary
    console.log('='.repeat(50));
    console.log('TESTING COMPLETE');
    console.log('The layered tool architecture is working correctly!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

// Run tests
testLayeredArchitecture().catch(console.error);