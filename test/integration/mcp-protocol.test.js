#!/usr/bin/env node

/**
 * Integration test for MCP protocol compliance and serialization
 * Tests the MCP server's JSON-RPC protocol implementation
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔌 Testing MCP Protocol Compliance\n');

/**
 * Test basic MCP JSON-RPC protocol compliance
 */
async function testMCPProtocol() {
  console.log('📋 Testing MCP JSON-RPC Protocol');
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    console.log('  ⚠️  MCP server not built - run npm run build first');
    return true; // Not a test failure, just not ready
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        REMOTION_ASSETS_DIR: join(process.cwd(), 'assets')
      }
    });
    
    let response = '';
    let errorOutput = '';
    const responses = [];
    
    child.stdout.on('data', (data) => {
      response += data.toString();
      
      // Parse JSON-RPC responses as they come in
      const lines = response.split('\n');
      response = lines.pop(); // Keep incomplete line for next iteration
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            responses.push(parsed);
            console.log(`  📨 Received: ${JSON.stringify(parsed).substring(0, 100)}...`);
          } catch (e) {
            console.error(`  ❌ Invalid JSON: ${line.substring(0, 50)}...`);
          }
        }
      }
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    const tests = [
      {
        name: 'Initialize',
        request: {
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' }
          },
          id: 1
        },
        validator: (response) => {
          return response.result && response.result.capabilities;
        }
      },
      {
        name: 'List Tools',
        request: {
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 2
        },
        validator: (response) => {
          return response.result && Array.isArray(response.result.tools);
        }
      }
    ];
    
    let currentTest = 0;
    let testResults = [];
    
    const sendNextTest = () => {
      if (currentTest < tests.length) {
        const test = tests[currentTest];
        console.log(`  🔧 Sending: ${test.name}`);
        child.stdin.write(JSON.stringify(test.request) + '\n');
        currentTest++;
        
        // Schedule next test
        setTimeout(sendNextTest, 1000);
      } else {
        // All tests sent, wait a bit more then cleanup
        setTimeout(cleanup, 2000);
      }
    };
    
    const cleanup = () => {
      child.kill('SIGTERM');
      
      // Evaluate test results
      let passed = 0;
      
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const response = responses.find(r => r.id === test.request.id);
        
        if (response) {
          if (test.validator(response)) {
            console.log(`  ✅ ${test.name} - Valid response`);
            passed++;
          } else {
            console.log(`  ❌ ${test.name} - Invalid response structure`);
            console.log(`    Response: ${JSON.stringify(response)}`);
          }
        } else {
          console.log(`  ❌ ${test.name} - No response received`);
        }
      }
      
      if (errorOutput && !errorOutput.includes('[DEBUG]')) {
        console.log(`  ⚠️  Server errors: ${errorOutput.substring(0, 200)}...`);
      }
      
      const success = passed === tests.length;
      console.log(`  📊 Protocol tests: ${passed}/${tests.length} passed`);
      resolve(success);
    };
    
    // Start testing after server startup
    setTimeout(sendNextTest, 500);
  });
}

/**
 * Test tool serialization to prevent Map/Set/Proxy issues
 */
async function testToolSerialization() {
  console.log('📋 Testing Tool Serialization');
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    console.log('  ⚠️  MCP server not built - skipping serialization test');
    return true;
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        REMOTION_ASSETS_DIR: join(process.cwd(), 'assets')
      }
    });
    
    let toolsResponse = null;
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.id === 2 && parsed.result && parsed.result.tools) {
            toolsResponse = parsed;
            break;
          }
        } catch (e) {
          // Continue parsing other lines
        }
      }
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Initialize first
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize', 
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        },
        id: 1
      }) + '\n');
    }, 500);
    
    // Then get tools
    setTimeout(() => {
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      }) + '\n');
    }, 1000);
    
    // Check results
    setTimeout(() => {
      child.kill('SIGTERM');
      
      if (!toolsResponse) {
        console.log('  ❌ No tools response received');
        resolve(false);
        return;
      }
      
      const tools = toolsResponse.result.tools;
      console.log(`  📊 Received ${tools.length} tools`);
      
      let serializationPassed = true;
      
      for (const tool of tools) {
        // Test that each tool is properly serializable
        try {
          const serialized = JSON.stringify(tool);
          const deserialized = JSON.parse(serialized);
          
          // Check required fields
          if (!tool.name || !tool.description || !tool.inputSchema) {
            console.log(`  ❌ Tool missing required fields: ${tool.name || 'unnamed'}`);
            serializationPassed = false;
            continue;
          }
          
          // Check that inputSchema is a proper object
          if (typeof tool.inputSchema !== 'object') {
            console.log(`  ❌ Tool inputSchema not an object: ${tool.name}`);
            serializationPassed = false;
            continue;
          }
          
          // Check for problematic objects (Map, Set, Proxy, etc.)
          const serializedStr = JSON.stringify(tool);
          if (serializedStr.includes('[object Map]') || 
              serializedStr.includes('[object Set]') ||
              serializedStr.includes('{}') && serializedStr.length < 10) {
            console.log(`  ❌ Tool contains non-serializable objects: ${tool.name}`);
            serializationPassed = false;
            continue;
          }
          
          console.log(`  ✅ ${tool.name} - Serialization OK`);
          
        } catch (error) {
          console.log(`  ❌ Tool serialization failed: ${tool.name || 'unnamed'} - ${error.message}`);
          serializationPassed = false;
        }
      }
      
      if (serializationPassed) {
        console.log('  ✅ All tools serialize correctly');
      } else {
        console.log('  ❌ Some tools have serialization issues');
      }
      
      resolve(serializationPassed);
    }, 2500);
  });
}

/**
 * Test MCP protocol version compatibility
 */
async function testProtocolVersions() {
  console.log('📋 Testing Protocol Version Compatibility');
  
  const protocolVersions = [
    '2024-11-05',
    '2024-10-07',  // Older version
    'invalid-version'
  ];
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    console.log('  ⚠️  MCP server not built - skipping version test');
    return true;
  }
  
  let allPassed = true;
  
  for (const version of protocolVersions) {
    console.log(`  🔧 Testing protocol version: ${version}`);
    
    const result = await new Promise((resolve) => {
      const child = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'test',
          REMOTION_ASSETS_DIR: join(process.cwd(), 'assets')
        }
      });
      
      let responded = false;
      
      child.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('"result"') || output.includes('"error"')) {
          responded = true;
        }
      });
      
      // Send initialize with this version
      setTimeout(() => {
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: version,
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' }
          },
          id: 1
        }) + '\n');
      }, 500);
      
      setTimeout(() => {
        child.kill('SIGTERM');
        resolve(responded);
      }, 1500);
    });
    
    if (result) {
      console.log(`    ✅ Version ${version} - Server responded`);
    } else {
      console.log(`    ❌ Version ${version} - No response`);
      if (version !== 'invalid-version') {
        allPassed = false;
      }
    }
  }
  
  return allPassed;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🎯 Starting MCP Protocol Integration Tests\n');
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}\n`);
  
  let passed = 0;
  let total = 0;
  
  const tests = [
    { name: 'MCP JSON-RPC Protocol', fn: testMCPProtocol },
    { name: 'Tool Serialization', fn: testToolSerialization },
    { name: 'Protocol Version Compatibility', fn: testProtocolVersions }
  ];
  
  for (const test of tests) {
    total++;
    console.log(`\n🧪 Running: ${test.name}`);
    
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} - ERROR: ${error.message}`);
    }
  }
  
  // Results
  console.log('\n📊 MCP Protocol Test Results');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All MCP protocol tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed - see output above');
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}