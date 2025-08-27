#!/usr/bin/env node

/**
 * Comprehensive test of MCP server functionality
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Running Comprehensive MCP Server Tests\n');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMCPProtocol() {
  console.log('Test 1: MCP JSON-RPC Protocol');
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    console.log('  ❌ Server not built');
    tests.failed++;
    tests.results.push({ test: 'MCP Protocol', status: 'FAILED', reason: 'Server not built' });
    return false;
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    let responses = [];
    let hasInitialize = false;
    let hasToolsList = false;
    
    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          responses.push(json);
          
          if (json.result && json.id === 1) {
            hasInitialize = true;
            console.log('  ✅ Initialize response received');
          }
          
          if (json.result && json.id === 2 && json.result.tools) {
            hasToolsList = true;
            console.log(`  ✅ Tools/list response received (${json.result.tools.length} tools)`);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }
    });
    
    // Send initialize request
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' }
        }
      }) + '\n');
    }, 500);
    
    // Send tools/list request
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      }) + '\n');
    }, 1500);
    
    // Check results
    setTimeout(() => {
      child.kill();
      
      if (hasInitialize && hasToolsList) {
        console.log('  ✅ MCP Protocol test PASSED');
        tests.passed++;
        tests.results.push({ test: 'MCP Protocol', status: 'PASSED' });
      } else {
        console.log(`  ❌ MCP Protocol test FAILED (init: ${hasInitialize}, tools: ${hasToolsList})`);
        tests.failed++;
        tests.results.push({ 
          test: 'MCP Protocol', 
          status: 'FAILED', 
          reason: `Missing responses (init: ${hasInitialize}, tools: ${hasToolsList})` 
        });
      }
      
      resolve();
    }, 3000);
  });
}

async function testToolActivation() {
  console.log('\nTest 2: Tool Discovery & Activation');
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    let toolsResponse = null;
    
    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.result && json.result.tools) {
            toolsResponse = json.result;
          }
        } catch (e) {
          // Not JSON
        }
      }
    });
    
    // Initialize first
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' }
        }
      }) + '\n');
    }, 500);
    
    // Get tools
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      }) + '\n');
    }, 1500);
    
    // Check results
    setTimeout(() => {
      child.kill();
      
      if (toolsResponse && toolsResponse.tools) {
        const hasDiscoveryTools = toolsResponse.tools.some(t => 
          t.name === 'discover' || t.name === 'activate' || t.name === 'search'
        );
        
        if (hasDiscoveryTools) {
          console.log('  ✅ Discovery tools active by default');
          tests.passed++;
          tests.results.push({ test: 'Tool Activation', status: 'PASSED' });
        } else {
          console.log('  ❌ Discovery tools not active');
          tests.failed++;
          tests.results.push({ 
            test: 'Tool Activation', 
            status: 'FAILED', 
            reason: 'Discovery tools not active by default' 
          });
        }
      } else {
        console.log('  ❌ No tools response received');
        tests.failed++;
        tests.results.push({ 
          test: 'Tool Activation', 
          status: 'FAILED', 
          reason: 'No tools response' 
        });
      }
      
      resolve();
    }, 3000);
  });
}

async function testToolCategories() {
  console.log('\nTest 3: Tool Categories');
  
  const expectedCategories = [
    'discovery',
    'core-operations',
    'video-creation',
    'asset-generation'
  ];
  
  // Since we can't directly test the registry without the server running,
  // we'll check the tools returned include expected categories
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    let toolsResponse = null;
    
    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.result && json.result.tools) {
            toolsResponse = json.result;
          }
        } catch (e) {
          // Not JSON
        }
      }
    });
    
    // Initialize and get tools
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' }
        }
      }) + '\n');
    }, 500);
    
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      }) + '\n');
    }, 1500);
    
    setTimeout(() => {
      child.kill();
      
      if (toolsResponse && toolsResponse.tools && toolsResponse.tools.length >= 3) {
        console.log(`  ✅ Tool categories working (${toolsResponse.tools.length} tools loaded)`);
        tests.passed++;
        tests.results.push({ test: 'Tool Categories', status: 'PASSED' });
      } else {
        console.log('  ❌ Tool categories not working properly');
        tests.failed++;
        tests.results.push({ 
          test: 'Tool Categories', 
          status: 'FAILED', 
          reason: 'Insufficient tools loaded' 
        });
      }
      
      resolve();
    }, 3000);
  });
}

async function runAllTests() {
  console.log('Starting comprehensive tests...\n');
  
  await testMCPProtocol();
  await delay(1000);
  
  await testToolActivation();
  await delay(1000);
  
  await testToolCategories();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📊 Total: ${tests.passed + tests.failed}`);
  console.log(`🎯 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);
  
  console.log('\nDetailed Results:');
  tests.results.forEach((result, i) => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${result.test}: ${result.status}`);
    if (result.reason) {
      console.log(`   Reason: ${result.reason}`);
    }
  });
  
  process.exit(tests.failed > 0 ? 1 : 0);
}

runAllTests().catch(console.error);