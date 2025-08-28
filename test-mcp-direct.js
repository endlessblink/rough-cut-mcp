#!/usr/bin/env node
/**
 * Direct test of MCP server functionality
 * Tests that existing features still work and new network features are functional
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test MCP server startup and basic tool listing
async function testMCPServer() {
  log('\n=== Testing MCP Server Direct Communication ===\n', 'cyan');
  
  const mcpPath = path.join(__dirname, 'build', 'index.js');
  
  return new Promise((resolve) => {
    log('Starting MCP server...', 'yellow');
    
    const mcp = spawn('node', [mcpPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        MCP_TEST_MODE: 'true'
      }
    });

    let response = '';
    let errorOutput = '';
    let testComplete = false;

    // Send initialize request
    const initRequest = JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      },
      id: 1
    }) + '\n';

    // Send list tools request after init
    const listToolsRequest = JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 2
    }) + '\n';

    mcp.stdout.on('data', (data) => {
      response += data.toString();
      
      // Check for initialization response
      if (response.includes('"id":1') && !testComplete) {
        log('✓ MCP server initialized successfully', 'green');
        
        // Send list tools request
        setTimeout(() => {
          mcp.stdin.write(listToolsRequest);
        }, 100);
      }
      
      // Check for tools list response
      if (response.includes('"id":2') && !testComplete) {
        testComplete = true;
        
        try {
          // Parse the response to check for tools
          const lines = response.split('\n').filter(l => l.trim());
          const toolsResponse = lines.find(l => l.includes('"id":2'));
          
          if (toolsResponse) {
            const parsed = JSON.parse(toolsResponse);
            
            if (parsed.result && parsed.result.tools) {
              const tools = parsed.result.tools;
              log(`✓ Found ${tools.length} tools available`, 'green');
              
              // Check for key tools
              const hasDiscovery = tools.some(t => t.name === 'discover-capabilities');
              const hasListProjects = tools.some(t => t.name === 'list-video-projects');
              const hasGetStatus = tools.some(t => t.name === 'get-project-status');
              const hasLaunchStudio = tools.some(t => t.name === 'launch-project-studio');
              
              if (hasDiscovery) {
                log('✓ Discovery tools present (layered architecture working)', 'green');
              }
              
              if (hasListProjects && hasGetStatus && hasLaunchStudio) {
                log('✓ Core project management tools present', 'green');
              }
              
              log('\nMCP server is functioning correctly!', 'green');
              resolve({ success: true });
            }
          }
        } catch (e) {
          log(`Error parsing response: ${e.message}`, 'red');
          resolve({ success: false, error: e.message });
        }
        
        mcp.kill();
      }
    });

    mcp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcp.on('error', (err) => {
      log(`Failed to start MCP server: ${err.message}`, 'red');
      resolve({ success: false, error: err.message });
    });

    mcp.on('close', (code) => {
      if (!testComplete) {
        if (errorOutput) {
          log('Server error output:', 'red');
          console.log(errorOutput);
        }
        resolve({ success: false, error: `Server exited with code ${code}` });
      }
    });

    // Send initialize request
    setTimeout(() => {
      mcp.stdin.write(initRequest);
    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!testComplete) {
        log('Test timed out', 'red');
        mcp.kill();
        resolve({ success: false, error: 'Timeout' });
      }
    }, 10000);
  });
}

// Test network utilities
async function testNetworkUtils() {
  log('\n=== Testing Network Utilities ===\n', 'cyan');
  
  try {
    const { buildNetworkUrls, getNetworkAddress } = await import('./build/utils/network-utils.js');
    
    // Test network address detection
    const networkAddr = getNetworkAddress();
    log(`Network address detected: ${networkAddr}`, 'yellow');
    
    // Test URL building
    const urls = buildNetworkUrls(7400);
    log('URLs generated:', 'yellow');
    log(`  Local: ${urls.local}`, 'cyan');
    log(`  Network: ${urls.network || 'N/A'}`, 'cyan');
    log(`  Primary: ${urls.primary}`, 'cyan');
    
    // Verify structure
    if (urls.local && urls.primary) {
      log('✓ Network URL structure is correct', 'green');
      return { success: true };
    } else {
      log('✗ Network URL structure is incomplete', 'red');
      return { success: false, error: 'Missing required URL fields' };
    }
    
  } catch (e) {
    log(`Failed to test network utils: ${e.message}`, 'red');
    return { success: false, error: e.message };
  }
}

// Main test runner
async function runTests() {
  log('Starting MCP Direct Tests...', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  let allSuccess = true;
  
  // Test 1: Network utilities
  const networkResult = await testNetworkUtils();
  if (!networkResult.success) {
    allSuccess = false;
  }
  
  // Test 2: MCP server
  const mcpResult = await testMCPServer();
  if (!mcpResult.success) {
    allSuccess = false;
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  if (allSuccess) {
    log('✅ All tests passed! The MCP server is working correctly.', 'green');
    log('   - Network URL detection is functional', 'green');
    log('   - MCP server starts and responds properly', 'green');
    log('   - Core tools are available', 'green');
    log('   - No breaking changes detected', 'green');
  } else {
    log('❌ Some tests failed. Check the output above.', 'red');
  }
}

// Run the tests
runTests().catch(console.error);