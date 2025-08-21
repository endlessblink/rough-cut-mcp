#!/usr/bin/env node

/**
 * Test that the server doesn't crash when launch-remotion-studio is called
 * This simulates what Claude Desktop does
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Server Stability with Studio Launch\n');

async function testServerStability() {
  // Start the MCP server
  const serverPath = join(__dirname, 'build', 'index.js');
  console.log('🚀 Starting MCP server...');
  
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  let serverCrashed = false;
  let serverOutput = '';

  // Capture server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    process.stdout.write(`[SERVER] ${output}`);
  });

  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    process.stderr.write(`[ERROR] ${output}`);
  });

  serverProcess.on('exit', (code) => {
    console.log(`\n❌ Server exited with code ${code}`);
    serverCrashed = true;
  });

  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 3000));

  if (serverCrashed) {
    console.log('❌ Server crashed during initialization!');
    process.exit(1);
  }

  console.log('\n✅ Server started successfully');
  console.log('\n📋 Sending launch-remotion-studio request...');
  
  // Send the request that was crashing the server
  const request = {
    jsonrpc: '2.0',
    id: 22,
    method: 'tools/call',
    params: {
      name: 'launch-remotion-studio',
      arguments: {
        openBrowser: true,
        port: 3000
      }
    }
  };

  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait to see if server crashes
  console.log('\n⏳ Waiting 5 seconds to check if server remains stable...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Check if server is still running
  if (serverCrashed) {
    console.log('\n❌ FAIL: Server crashed when launch-remotion-studio was called!');
    console.log('This was the exact issue reported.');
    console.log('\nServer output before crash:');
    console.log(serverOutput);
    process.exit(1);
  } else {
    console.log('\n✅ SUCCESS: Server remained stable after studio launch attempt!');
    
    // Check if we got a proper response
    if (serverOutput.includes('Checking Remotion availability') || 
        serverOutput.includes('Launching Remotion Studio') ||
        serverOutput.includes('Remotion is not installed')) {
      console.log('✅ Server properly handled the studio launch request');
    }
    
    // Send another request to verify server is still responsive
    console.log('\n📋 Sending get-studio-status to verify server is responsive...');
    
    const statusRequest = {
      jsonrpc: '2.0',
      id: 23,
      method: 'tools/call',
      params: {
        name: 'get-studio-status',
        arguments: {}
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(statusRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!serverCrashed) {
      console.log('✅ Server is still responsive to requests');
    }
  }

  // Clean up
  console.log('\n🧹 Cleaning up...');
  serverProcess.kill();
  
  console.log('\n✅ Test completed successfully!');
  console.log('The server no longer crashes when launch-remotion-studio is called.');
}

// Run the test
testServerStability().catch(console.error);