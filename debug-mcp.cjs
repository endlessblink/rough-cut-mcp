#!/usr/bin/env node

// Simple MCP server debug script
const { spawn } = require('child_process');
const path = require('path');

async function debugMCP() {
  console.log('🔍 Debugging MCP Server...\n');
  
  const serverPath = path.join(__dirname, 'build', 'index.js');
  console.log('Server path:', serverPath);
  
  const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname,
    env: {
      ...process.env,
      REMOTION_ASSETS_DIR: path.join(__dirname, 'assets'),
      NODE_ENV: 'production'
    }
  });

  let hasOutput = false;
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    hasOutput = true;
    stdout += data.toString();
    console.log('📤 STDOUT:', data.toString());
  });

  child.stderr.on('data', (data) => {
    hasOutput = true;
    stderr += data.toString();
    console.log('📤 STDERR:', data.toString());
  });

  child.on('error', (error) => {
    console.log('💥 Process Error:', error.message);
  });

  child.on('exit', (code, signal) => {
    console.log(`🏁 Process exited with code ${code}, signal ${signal}`);
  });

  // Wait a moment to see if server starts
  console.log('⏳ Waiting 3 seconds for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  if (!hasOutput) {
    console.log('❌ No output from server - likely failed to start');
  } else {
    console.log('✅ Server produced output, testing protocol...');
    
    // Test initialize request
    const initRequest = JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'debug-client', version: '1.0.0' }
      },
      id: 1
    }) + '\n';

    console.log('📨 Sending initialize request...');
    child.stdin.write(initRequest);

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test tools/list request  
    const toolsRequest = JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 2
    }) + '\n';

    console.log('📨 Sending tools/list request...');
    child.stdin.write(toolsRequest);

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Cleanup
  child.kill('SIGTERM');
  
  console.log('\n📊 Debug Summary:');
  console.log('STDOUT Length:', stdout.length);
  console.log('STDERR Length:', stderr.length);
  console.log('Had Output:', hasOutput);
  
  if (stdout.length > 0) {
    console.log('\n📄 Full STDOUT:');
    console.log(stdout);
  }
  
  if (stderr.length > 0) {
    console.log('\n📄 Full STDERR:');
    console.log(stderr);
  }
}

debugMCP().catch(console.error);