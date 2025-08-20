#!/usr/bin/env node

/**
 * Test script for studio launch functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Studio Launch Functionality\n');

async function testStudioLaunch() {
  // Start the MCP server
  const serverPath = join(__dirname, 'build', 'index.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  let serverReady = false;
  let outputBuffer = '';

  // Capture server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    outputBuffer += output;
    
    if (output.includes('Server initialization completed successfully')) {
      serverReady = true;
    }
    
    // Log server output for debugging
    if (output.includes('ERROR') || output.includes('WARN')) {
      console.log('Server:', output.trim());
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('Server Error:', data.toString());
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    const checkReady = setInterval(() => {
      if (serverReady) {
        clearInterval(checkReady);
        resolve();
      }
    }, 100);
  });

  console.log('✅ Server started successfully\n');

  // Test launch-remotion-studio tool
  console.log('📋 Testing launch-remotion-studio tool...');
  
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'launch-remotion-studio',
      arguments: {
        openBrowser: false,
        port: 3000
      }
    }
  };

  // Send request to server
  serverProcess.stdin.write(JSON.stringify(request) + '\n');

  // Wait for response
  await new Promise((resolve) => {
    let responseReceived = false;
    
    const checkResponse = setInterval(() => {
      if (outputBuffer.includes('Checking Remotion availability') || 
          outputBuffer.includes('Remotion is not available') ||
          outputBuffer.includes('Launching Remotion Studio')) {
        responseReceived = true;
      }
      
      if (responseReceived) {
        clearInterval(checkResponse);
        resolve();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkResponse);
      resolve();
    }, 10000);
  });

  // Give it a moment to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check server status
  console.log('\n📊 Checking server status...');
  
  const statusRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get-studio-status',
      arguments: {}
    }
  };
  
  serverProcess.stdin.write(JSON.stringify(statusRequest) + '\n');
  
  // Wait a moment for status
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Clean up
  console.log('\n🧹 Cleaning up...');
  serverProcess.kill();
  
  // Check if server crashed
  const serverCrashed = outputBuffer.includes('Server transport closed') || 
                       outputBuffer.includes('ENOENT') ||
                       outputBuffer.includes('spawn npx ENOENT');
  
  if (serverCrashed) {
    console.log('❌ Server crashed during studio launch');
    console.log('Output:', outputBuffer);
    process.exit(1);
  } else {
    console.log('✅ Server handled studio launch gracefully');
    
    if (outputBuffer.includes('Remotion is not available')) {
      console.log('✅ Correctly detected missing Remotion');
    }
    
    if (outputBuffer.includes('Remotion is not installed')) {
      console.log('✅ Returned proper error message for missing Remotion');
    }
    
    console.log('\n✅ All tests passed!');
  }
}

// Run the test
testStudioLaunch().catch(console.error);