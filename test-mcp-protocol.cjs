const { spawn } = require('child_process');
const path = require('path');

// Test basic MCP JSON-RPC protocol
async function testMCPProtocol() {
  console.log('Testing MCP Server JSON-RPC Protocol...\n');
  
  const serverPath = path.join(__dirname, 'build', 'index.js');
  const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname,
    env: {
      ...process.env,
      REMOTION_ASSETS_DIR: path.join(__dirname, 'assets'),
      NODE_ENV: 'production'
    }
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
        name: 'test-client',
        version: '1.0.0'
      }
    },
    id: 1
  };

  console.log('Sending initialize request...');
  child.stdin.write(JSON.stringify(initRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: 2
  };

  console.log('Sending list tools request...');
  child.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Clean shutdown
  child.stdin.end();
  
  // Force kill after a short delay to ensure clean exit
  setTimeout(() => {
    child.kill('SIGTERM');
  }, 500);
  
  // Wait for process to exit
  await new Promise(resolve => {
    child.on('close', resolve);
    setTimeout(resolve, 1000); // Timeout after 1 second
  });

  console.log('\n=== STDOUT Response ===');
  if (response) {
    // Try to parse JSON-RPC responses
    const lines = response.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw output:', line);
      }
    }
  } else {
    console.log('No response received');
  }

  if (errorOutput) {
    console.log('\n=== STDERR Output ===');
    console.log(errorOutput);
  }

  console.log('\n=== Test Complete ===');
  
  // Force clean exit to prevent hanging
  process.exit(0);
}

testMCPProtocol().catch(console.error);