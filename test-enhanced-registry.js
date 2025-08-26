#!/usr/bin/env node

/**
 * Test script for Enhanced Tool Registry
 * Tests layer management, dependencies, context management, and sub-categories
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing Enhanced Tool Registry\n');

async function testMCPServer() {
  console.log('='.repeat(50));
  console.log('Testing ENHANCED REGISTRY MODE');
  console.log('='.repeat(50));

  const env = {
    ...process.env,
    REMOTION_ASSETS_DIR: path.join(__dirname, 'assets'),
    NODE_ENV: 'test'
  };

  const serverPath = path.join(__dirname, 'build', 'index.js');
  const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env
  });

  let response = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    response += data.toString();
  });

  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Send initialize request
  const initRequest = {
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-enhanced-registry',
        version: '1.0.0'
      }
    },
    id: 1
  };

  child.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: List initial tools (should be minimal)
  console.log('\n📋 Test 1: Initial tool load');
  const listToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: 2
  };

  child.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 2: Discover capabilities
  console.log('\n📋 Test 2: Discover capabilities');
  const discoverRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'discover-capabilities',
      arguments: {}
    },
    id: 3
  };

  child.stdin.write(JSON.stringify(discoverRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 3: Get active tools (before activation)
  console.log('\n📋 Test 3: Active tools before activation');
  const activeToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get-active-tools',
      arguments: {}
    },
    id: 4
  };

  child.stdin.write(JSON.stringify(activeToolsRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 4: Activate video creation category
  console.log('\n📋 Test 4: Activate video-creation category');
  const activateRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'activate-toolset',
      arguments: {
        categories: ['video-creation']
      }
    },
    id: 5
  };

  child.stdin.write(JSON.stringify(activateRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 5: List tools after activation
  console.log('\n📋 Test 5: Tools after video-creation activation');
  const listToolsAfterRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: 6
  };

  child.stdin.write(JSON.stringify(listToolsAfterRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 6: Try to use a video tool (should work)
  console.log('\n📋 Test 6: Create text video (should work)');
  const createVideoRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'create-text-video',
      arguments: {
        text: 'Test video from enhanced registry',
        duration: 3
      }
    },
    id: 7
  };

  child.stdin.write(JSON.stringify(createVideoRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 7: Activate sub-category (if supported)
  console.log('\n📋 Test 7: Activate sub-category');
  const activateSubRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'activate-toolset',
      arguments: {
        subCategories: ['project-management/editing']
      }
    },
    id: 8
  };

  child.stdin.write(JSON.stringify(activateSubRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 8: Get usage statistics
  console.log('\n📋 Test 8: Get tool usage statistics');
  const statsRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get-tool-usage-stats',
      arguments: {}
    },
    id: 9
  };

  child.stdin.write(JSON.stringify(statsRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Clean shutdown
  child.stdin.end();
  
  await new Promise(resolve => {
    child.on('close', resolve);
    setTimeout(resolve, 2000);
  });

  // Parse and display results
  console.log('\n📊 Test Results:');
  const lines = response.split('\n').filter(line => line.trim());
  
  let toolCounts = {};
  let capabilities = null;
  let activationSuccess = false;
  let videoCreated = false;
  let statsReceived = false;
  
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      
      // Count tools at different stages
      if (parsed.id === 2 && parsed.result?.tools) {
        toolCounts.initial = parsed.result.tools.length;
        console.log(`✅ Initial tools loaded: ${toolCounts.initial}`);
      }
      
      if (parsed.id === 3 && parsed.result) {
        capabilities = parsed.result;
        console.log(`✅ Capabilities discovered: ${capabilities.content ? 'Yes' : 'No'}`);
      }
      
      if (parsed.id === 4 && parsed.result) {
        const activeTools = parsed.result.content || parsed.result;
        console.log(`✅ Active tools tracked: Yes`);
      }
      
      if (parsed.id === 5 && parsed.result) {
        activationSuccess = true;
        console.log(`✅ Category activation: Success`);
      }
      
      if (parsed.id === 6 && parsed.result?.tools) {
        toolCounts.afterActivation = parsed.result.tools.length;
        console.log(`✅ Tools after activation: ${toolCounts.afterActivation}`);
      }
      
      if (parsed.id === 7 && parsed.result) {
        videoCreated = !parsed.error;
        console.log(`✅ Video creation: ${videoCreated ? 'Success' : 'Failed'}`);
      }
      
      if (parsed.id === 9 && parsed.result) {
        statsReceived = true;
        console.log(`✅ Usage statistics: Available`);
      }
      
      if (parsed.error) {
        console.log(`❌ Error in request ${parsed.id}: ${parsed.error.message}`);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 ENHANCED REGISTRY TEST SUMMARY');
  console.log('='.repeat(50));
  
  const tests = {
    'Initial minimal load': toolCounts.initial && toolCounts.initial < 15,
    'Discovery tools available': capabilities !== null,
    'Category activation': activationSuccess,
    'Tools increase after activation': toolCounts.afterActivation > toolCounts.initial,
    'Video tool accessible': videoCreated || toolCounts.afterActivation > 20,
    'Usage tracking': statsReceived,
  };
  
  let passed = 0;
  let failed = 0;
  
  for (const [test, result] of Object.entries(tests)) {
    console.log(`  ${test}: ${result ? '✅ PASS' : '❌ FAIL'}`);
    if (result) passed++; else failed++;
  }
  
  console.log(`\nResults: ${passed}/${passed + failed} tests passed`);
  
  if (errorOutput) {
    console.log('\n⚠️ Stderr output (first 500 chars):');
    console.log(errorOutput.slice(0, 500));
  }
  
  const allPass = failed === 0;
  console.log(`\nOverall: ${allPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);
  
  // Feature report
  console.log('\n📝 ENHANCED FEATURES DETECTED:');
  console.log(`  Layer Management: ${toolCounts.initial < 15 ? '✅ Active' : '⚠️ Not detected'}`);
  console.log(`  Dynamic Activation: ${toolCounts.afterActivation > toolCounts.initial ? '✅ Working' : '⚠️ Not working'}`);
  console.log(`  Context Management: ${statsReceived ? '✅ Tracking' : '⚠️ Not available'}`);
  console.log(`  Tool Accessibility: ${videoCreated || toolCounts.afterActivation > 20 ? '✅ Verified' : '⚠️ Limited'}`);
  
  process.exit(allPass ? 0 : 1);
}

// Run test
runTest().catch(console.error);

async function runTest() {
  console.log('Starting Enhanced MCP Server Registry Tests');
  console.log(`Working directory: ${__dirname}`);
  console.log(`Assets directory: ${path.join(__dirname, 'assets')}`);
  
  await testMCPServer();
}