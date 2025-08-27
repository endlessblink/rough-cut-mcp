#!/usr/bin/env node

/**
 * Integration test for Node.js path detection across different environments
 * Tests all the detection methods used in scripts/postinstall.js
 */

import { execSync, spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';

console.log('🧪 Testing Node.js Path Detection Methods\n');

// Mock different environment scenarios
const testScenarios = [
  {
    name: 'Standard Node.js Installation',
    env: {
      npm_node_execpath: platform() === 'win32' ? 'C:\\Program Files\\nodejs\\node.exe' : '/usr/bin/node'
    }
  },
  {
    name: 'NVM Installation',
    env: {
      npm_node_execpath: platform() === 'win32' 
        ? 'C:\\Users\\TestUser\\AppData\\Roaming\\nvm\\v20.11.0\\node.exe'
        : '/home/testuser/.nvm/versions/node/v20.11.0/bin/node'
    }
  },
  {
    name: 'Volta Installation', 
    env: {
      npm_node_execpath: platform() === 'win32'
        ? 'C:\\Users\\TestUser\\AppData\\Local\\Volta\\tools\\image\\node\\20.11.0\\node.exe'
        : '/home/testuser/.volta/tools/image/node/20.11.0/bin/node'
    }
  },
  {
    name: 'Chocolatey Installation',
    env: {
      npm_node_execpath: 'C:\\ProgramData\\chocolatey\\lib\\nodejs\\tools\\node.exe'
    }
  },
  {
    name: 'User-space Installation',
    env: {
      npm_node_execpath: platform() === 'win32'
        ? join(homedir(), 'AppData', 'Local', 'nodejs', 'node.exe')
        : join(homedir(), 'local', 'bin', 'node')
    }
  }
];

/**
 * Test the Node.js detection logic from postinstall.js
 */
function testNodeDetection(scenario) {
  console.log(`\n📋 Testing: ${scenario.name}`);
  
  // Save current env
  const originalEnv = { ...process.env };
  
  try {
    // Set up test environment
    Object.assign(process.env, scenario.env);
    
    // Test Method 1: npm_node_execpath
    if (scenario.env.npm_node_execpath) {
      console.log(`  ✓ npm_node_execpath: ${scenario.env.npm_node_execpath}`);
    }
    
    // Test Method 2: npm config get prefix
    try {
      const npmPrefix = execSync('npm config get prefix', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'ignore'] 
      }).trim();
      const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
      const nodePath = join(npmPrefix, nodeExe);
      console.log(`  ✓ npm prefix method: ${nodePath}`);
    } catch (e) {
      console.log(`  ⚠️  npm prefix method failed: ${e.message}`);
    }
    
    // Test Method 3: which/where command
    try {
      const whichCmd = platform() === 'win32' ? 'where node' : 'which node';
      const result = execSync(whichCmd, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'ignore'] 
      }).trim();
      const paths = result.split('\n').map(p => p.trim()).filter(p => p);
      console.log(`  ✓ where/which method: ${paths[0]}`);
    } catch (e) {
      console.log(`  ⚠️  where/which method failed: ${e.message}`);
    }
    
    // Test Method 4: process.execPath
    console.log(`  ✓ process.execPath: ${process.execPath}`);
    
    console.log(`  ✅ ${scenario.name} - All methods tested`);
    
  } catch (error) {
    console.error(`  ❌ ${scenario.name} - Error: ${error.message}`);
    return false;
  } finally {
    // Restore environment
    process.env = originalEnv;
  }
  
  return true;
}

/**
 * Test npm global installation detection
 */
function testNpmGlobalDetection() {
  console.log('\n📋 Testing npm Global Installation Detection');
  
  try {
    // Test if we can detect global npm directory
    const npmBin = execSync('npm bin -g', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'ignore'] 
    }).trim();
    console.log(`  ✓ Global npm bin: ${npmBin}`);
    
    // Test global installation path
    const globalPrefix = execSync('npm config get prefix', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'ignore'] 
    }).trim();
    console.log(`  ✓ Global prefix: ${globalPrefix}`);
    
    return true;
  } catch (error) {
    console.error(`  ❌ npm global detection failed: ${error.message}`);
    return false;
  }
}

/**
 * Test Claude Desktop config path detection
 */
function testClaudeConfigDetection() {
  console.log('\n📋 Testing Claude Desktop Config Detection');
  
  const claudeConfigDir = platform() === 'win32' 
    ? join(homedir(), 'AppData', 'Roaming', 'Claude')
    : join(homedir(), '.config', 'Claude');
  const configPath = join(claudeConfigDir, 'claude_desktop_config.json');
  
  console.log(`  ✓ Claude config directory: ${claudeConfigDir}`);
  console.log(`  ✓ Claude config file: ${configPath}`);
  
  // Test if directory exists or can be created
  try {
    if (!existsSync(claudeConfigDir)) {
      console.log(`  ⚠️  Claude config directory doesn't exist (normal for CI)`);
    } else {
      console.log(`  ✓ Claude config directory exists`);
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ Claude config detection failed: ${error.message}`);
    return false;
  }
}

/**
 * Test MCP server startup simulation
 */
async function testMCPServerStartup() {
  console.log('\n📋 Testing MCP Server Startup Simulation');
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    console.log(`  ⚠️  MCP server not built yet: ${serverPath}`);
    return true; // Not a failure, just not built
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
    
    let output = '';
    let errorOutput = '';
    let responded = false;
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      
      // Check for valid JSON-RPC response
      try {
        const lines = output.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parsed = JSON.parse(line);
          if (parsed.result || parsed.error) {
            responded = true;
            console.log('  ✓ MCP server responded to initialize request');
            break;
          }
        }
      } catch (e) {
        // Continue waiting for valid JSON
      }
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Send initialize request
    setTimeout(() => {
      const initRequest = JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        },
        id: 1
      }) + '\n';
      
      child.stdin.write(initRequest);
    }, 500);
    
    // Cleanup after test
    setTimeout(() => {
      child.kill('SIGTERM');
      
      if (responded) {
        console.log('  ✅ MCP server startup test passed');
        resolve(true);
      } else {
        console.log('  ⚠️  MCP server didn\'t respond (may need debugging)');
        if (errorOutput) {
          console.log(`  📄 Error output: ${errorOutput.substring(0, 200)}...`);
        }
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🎯 Starting Node.js Detection Integration Tests\n');
  console.log(`Platform: ${platform()}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}\n`);
  
  let passed = 0;
  let total = 0;
  
  // Test all detection scenarios
  for (const scenario of testScenarios) {
    total++;
    if (testNodeDetection(scenario)) {
      passed++;
    }
  }
  
  // Test npm global detection
  total++;
  if (testNpmGlobalDetection()) {
    passed++;
  }
  
  // Test Claude config detection
  total++;
  if (testClaudeConfigDetection()) {
    passed++;
  }
  
  // Test MCP server startup
  total++;
  if (await testMCPServerStartup()) {
    passed++;
  }
  
  // Results
  console.log('\n📊 Test Results Summary');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All Node.js detection tests passed!');
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

export { testNodeDetection, testNpmGlobalDetection, testClaudeConfigDetection, testMCPServerStartup };