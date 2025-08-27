#!/usr/bin/env node

/**
 * Test script for layered tool architecture
 * Tests both layered and legacy modes of the MCP server
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing Layered Tool Architecture\n');

async function testMCPServer(legacyMode = false) {
  const modeLabel = legacyMode ? 'LEGACY MODE' : 'LAYERED MODE';
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing ${modeLabel}`);
  console.log('='.repeat(50));

  const env = {
    ...process.env,
    REMOTION_ASSETS_DIR: path.join(__dirname, 'assets'),
    NODE_ENV: 'test',
    MCP_LEGACY_MODE: legacyMode ? 'true' : 'false'
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
        name: 'test-layered-tools',
        version: '1.0.0'
      }
    },
    id: 1
  };

  child.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Send list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: 2
  };

  child.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test discovery tools (should always be available)
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

  // Test activate toolset (in layered mode)
  if (!legacyMode) {
    const activateRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'activate-toolset',
        arguments: {
          categories: ['video-creation', 'studio-management']
        }
      },
      id: 4
    };

    child.stdin.write(JSON.stringify(activateRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test video creation tool
  const videoToolRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'create-text-video',
      arguments: {
        text: 'Test video',
        duration: 5
      }
    },
    id: 5
  };

  child.stdin.write(JSON.stringify(videoToolRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Clean shutdown
  child.stdin.end();
  
  await new Promise(resolve => {
    child.on('close', resolve);
    setTimeout(resolve, 2000);
  });

  // Parse and display results
  console.log('\n📋 Results:');
  const lines = response.split('\n').filter(line => line.trim());
  
  let toolCount = 0;
  let hasDiscoveryTools = false;
  let hasVideoTools = false;
  
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      
      if (parsed.id === 2 && parsed.result?.tools) {
        toolCount = parsed.result.tools.length;
        const toolNames = parsed.result.tools.map(t => t.name);
        hasDiscoveryTools = toolNames.some(n => n.includes('discover'));
        hasVideoTools = toolNames.some(n => n.includes('video'));
        
        console.log(`✅ Tools loaded: ${toolCount}`);
        console.log(`   Discovery tools: ${hasDiscoveryTools ? '✅' : '❌'}`);
        console.log(`   Video tools: ${hasVideoTools ? '✅' : '❌'}`);
        
        if (toolCount < 10) {
          console.log(`   Active tools: ${toolNames.slice(0, 5).join(', ')}${toolNames.length > 5 ? '...' : ''}`);
        }
      }
      
      if (parsed.error) {
        console.log(`❌ Error: ${parsed.error.message}`);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (errorOutput) {
    console.log('\n⚠️ Stderr output:');
    console.log(errorOutput.slice(0, 200));
  }

  return { toolCount, hasDiscoveryTools, hasVideoTools };
}

// Run tests
async function runTests() {
  console.log('Starting MCP Server Tool Architecture Tests');
  console.log(`Working directory: ${__dirname}`);
  console.log(`Assets directory: ${path.join(__dirname, 'assets')}`);

  // Test layered mode
  const layeredResults = await testMCPServer(false);
  
  // Test legacy mode
  const legacyResults = await testMCPServer(true);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  console.log('\nLayered Mode:');
  console.log(`  Tools: ${layeredResults.toolCount}`);
  console.log(`  Expected: ~9-11 tools initially`);
  console.log(`  Status: ${layeredResults.toolCount >= 9 && layeredResults.toolCount <= 15 ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\nLegacy Mode:');
  console.log(`  Tools: ${legacyResults.toolCount}`);
  console.log(`  Expected: 40+ tools`);
  console.log(`  Status: ${legacyResults.toolCount >= 40 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPass = 
    layeredResults.hasDiscoveryTools && 
    legacyResults.toolCount >= 40;
  
  console.log(`\nOverall: ${allPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(allPass ? 0 : 1);
}

runTests().catch(console.error);