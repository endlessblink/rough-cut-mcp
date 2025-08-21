#!/usr/bin/env node

// Simple test script to verify the MCP server works
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Testing Remotion Creative MCP Server...\n');

// Start the MCP server
const serverPath = path.join(__dirname, 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseReceived = false;

// Test with a list_tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

// Handle server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server response:', output);
  
  try {
    const response = JSON.parse(output);
    if (response.id === 1 && response.result && response.result.tools) {
      console.log('✅ Server responded with tools list!');
      console.log(`📋 Available tools: ${response.result.tools.length}`);
      console.log('🎯 Tool names:');
      response.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      responseReceived = true;
      server.kill();
    }
  } catch (error) {
    // Not JSON, might be initialization logs
  }
});

server.stderr.on('data', (data) => {
  console.log('⚠️  Server stderr:', data.toString());
});

server.on('close', (code) => {
  if (responseReceived) {
    console.log('\n🎉 Test completed successfully!');
    console.log('✅ MCP server is working correctly');
    process.exit(0);
  } else {
    console.log(`\n❌ Server exited with code ${code}`);
    console.log('❌ Test failed - server may have configuration issues');
    process.exit(1);
  }
});

// Send the test request after a short delay
setTimeout(() => {
  console.log('📝 Sending list_tools request...');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  if (!responseReceived) {
    console.log('\n⏰ Test timed out');
    console.log('❌ Server may not be responding correctly');
    server.kill();
    process.exit(1);
  }
}, 10000);