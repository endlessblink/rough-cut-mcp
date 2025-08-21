#!/usr/bin/env node

/**
 * Complete test for Remotion Studio functionality
 * Tests both the MCP server integration and direct studio launch
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Complete Remotion Studio Test\n');

async function checkStudioProject() {
  console.log('1️⃣ Checking studio project setup...');
  
  const studioPath = join(__dirname, 'assets', 'studio-project');
  const packageJsonPath = join(studioPath, 'package.json');
  const srcPath = join(studioPath, 'src');
  const configPath = join(studioPath, 'remotion.config.ts');
  
  try {
    await fs.access(packageJsonPath);
    console.log('   ✅ package.json exists');
  } catch {
    console.log('   ❌ package.json missing');
    return false;
  }
  
  try {
    await fs.access(srcPath);
    console.log('   ✅ src directory exists');
  } catch {
    console.log('   ❌ src directory missing');
    return false;
  }
  
  try {
    await fs.access(configPath);
    console.log('   ✅ remotion.config.ts exists');
  } catch {
    console.log('   ❌ remotion.config.ts missing');
    return false;
  }
  
  // Check if dependencies are installed
  const nodeModulesPath = join(studioPath, 'node_modules');
  try {
    await fs.access(nodeModulesPath);
    console.log('   ✅ dependencies installed');
  } catch {
    console.log('   ❌ dependencies not installed');
    console.log('   Run: cd assets/studio-project && npm install');
    return false;
  }
  
  return true;
}

async function testDirectStudioLaunch() {
  console.log('\n2️⃣ Testing direct studio launch...');
  
  const studioPath = join(__dirname, 'assets', 'studio-project');
  
  console.log('   Starting studio on port 4010...');
  const studioProcess = spawn('npx', ['remotion', 'studio', '--port', '4010'], {
    cwd: studioPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  });
  
  let studioOutput = '';
  let studioReady = false;
  
  studioProcess.stdout?.on('data', (data) => {
    studioOutput += data.toString();
    if (data.toString().includes('Server ready')) {
      studioReady = true;
    }
  });
  
  studioProcess.stderr?.on('data', (data) => {
    studioOutput += data.toString();
  });
  
  // Wait up to 60 seconds for studio to start
  const maxWait = 60000;
  const startTime = Date.now();
  
  while (!studioReady && (Date.now() - startTime) < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to connect to the studio
    try {
      const response = await fetch('http://localhost:4010', {
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) {
        studioReady = true;
        break;
      }
    } catch {
      // Studio not ready yet
    }
  }
  
  if (studioReady) {
    console.log('   ✅ Studio launched successfully');
    console.log('   ✅ Studio is responding on http://localhost:4010');
    
    // Test if we can get the list of compositions
    try {
      const response = await fetch('http://localhost:4010/api/compositions', {
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const compositions = await response.json();
        console.log(`   ✅ Found ${compositions.length} compositions`);
        compositions.forEach(comp => {
          console.log(`      - ${comp.id} (${comp.durationInFrames} frames)`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  Could not fetch compositions:', error.message);
    }
    
  } else {
    console.log('   ❌ Studio failed to start within 60 seconds');
    console.log('   Studio output:');
    console.log(studioOutput);
  }
  
  // Clean up
  studioProcess.kill();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return studioReady;
}

async function testMCPServerStudioLaunch() {
  console.log('\n3️⃣ Testing MCP server studio launch...');
  
  // Start the MCP server
  const serverPath = join(__dirname, 'build', 'index.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });
  
  let serverReady = false;
  let serverOutput = '';
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    if (output.includes('Server initialization completed successfully')) {
      serverReady = true;
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    serverOutput += data.toString();
  });
  
  // Wait for server to be ready
  const serverStartTime = Date.now();
  while (!serverReady && (Date.now() - serverStartTime) < 10000) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (!serverReady) {
    console.log('   ❌ MCP server failed to start');
    serverProcess.kill();
    return false;
  }
  
  console.log('   ✅ MCP server started');
  
  // Send launch studio request
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'launch-remotion-studio',
      arguments: {
        openBrowser: false,
        port: 4011
      }
    }
  };
  
  console.log('   📤 Sending studio launch request...');
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for response
  let response = null;
  const responseTimeout = 120000; // 2 minutes
  const responseStartTime = Date.now();
  
  while (!response && (Date.now() - responseStartTime) < responseTimeout) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if studio is responding
    try {
      const studioResponse = await fetch('http://localhost:4011', {
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      if (studioResponse.ok) {
        response = { success: true };
        break;
      }
    } catch {
      // Not ready yet
    }
    
    // Check server output for success/failure
    if (serverOutput.includes('"success":true') && serverOutput.includes('4011')) {
      response = { success: true };
      break;
    }
    if (serverOutput.includes('"success":false') || serverOutput.includes('launch-failed')) {
      response = { success: false };
      break;
    }
  }
  
  if (response?.success) {
    console.log('   ✅ Studio launched successfully via MCP server');
    console.log('   ✅ Studio is responding on http://localhost:4011');
  } else {
    console.log('   ❌ Studio launch failed or timed out');
    console.log('   Server output:');
    console.log(serverOutput.slice(-1000)); // Last 1000 chars
  }
  
  // Clean up
  serverProcess.kill();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return response?.success || false;
}

async function main() {
  try {
    const setupOk = await checkStudioProject();
    if (!setupOk) {
      console.log('\n❌ Studio project setup incomplete');
      console.log('Run: npm run setup');
      process.exit(1);
    }
    
    const directLaunch = await testDirectStudioLaunch();
    const mcpLaunch = await testMCPServerStudioLaunch();
    
    console.log('\n📊 Test Results:');
    console.log(`   Studio Project Setup: ${setupOk ? '✅' : '❌'}`);
    console.log(`   Direct Studio Launch: ${directLaunch ? '✅' : '❌'}`);
    console.log(`   MCP Server Launch: ${mcpLaunch ? '✅' : '❌'}`);
    
    if (setupOk && directLaunch && mcpLaunch) {
      console.log('\n🎉 All tests passed! Remotion Studio is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above for troubleshooting steps.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);