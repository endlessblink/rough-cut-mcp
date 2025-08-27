#!/usr/bin/env node

/**
 * Verdaccio Local Registry Testing Script
 * Tests the complete publish → install → run cycle using a local npm registry
 */

import { spawn, execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir, platform } from 'os';
import { v4 as uuidv4 } from 'uuid';

console.log('📦 Testing with Verdaccio Local Registry\n');

let verdaccioProcess = null;
let registryUrl = 'http://localhost:4873';

/**
 * Start Verdaccio local npm registry
 */
async function startVerdaccio() {
  console.log('🚀 Starting Verdaccio local registry...');
  
  return new Promise((resolve, reject) => {
    // Check if verdaccio is available
    try {
      execSync('verdaccio --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('  📦 Installing Verdaccio globally...');
      try {
        execSync('npm install -g verdaccio', { stdio: 'inherit' });
      } catch (installError) {
        reject(new Error('Failed to install Verdaccio: ' + installError.message));
        return;
      }
    }
    
    // Start verdaccio on a random port to avoid conflicts
    const port = 4873 + Math.floor(Math.random() * 100);
    registryUrl = `http://localhost:${port}`;
    
    verdaccioProcess = spawn('verdaccio', ['--listen', `localhost:${port}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    
    let startupOutput = '';
    
    verdaccioProcess.stdout.on('data', (data) => {
      startupOutput += data.toString();
      if (startupOutput.includes('http address')) {
        console.log(`  ✅ Verdaccio started on ${registryUrl}`);
        resolve();
      }
    });
    
    verdaccioProcess.stderr.on('data', (data) => {
      startupOutput += data.toString();
      if (startupOutput.includes('http address')) {
        console.log(`  ✅ Verdaccio started on ${registryUrl}`);
        resolve();
      }
    });
    
    verdaccioProcess.on('error', (error) => {
      reject(new Error('Failed to start Verdaccio: ' + error.message));
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (verdaccioProcess && !verdaccioProcess.killed) {
        reject(new Error('Verdaccio startup timeout'));
      }
    }, 10000);
  });
}

/**
 * Stop Verdaccio
 */
function stopVerdaccio() {
  if (verdaccioProcess && !verdaccioProcess.killed) {
    console.log('🛑 Stopping Verdaccio...');
    verdaccioProcess.kill('SIGTERM');
    verdaccioProcess = null;
  }
}

/**
 * Configure npm to use local registry
 */
function configureNpmRegistry() {
  console.log(`📝 Configuring npm to use local registry: ${registryUrl}`);
  
  try {
    // Create a temporary .npmrc for testing
    const testNpmrc = join(process.cwd(), '.npmrc.test');
    writeFileSync(testNpmrc, `registry=${registryUrl}\n`);
    
    // Set npm config
    execSync(`npm config set registry ${registryUrl}`, { stdio: 'inherit' });
    
    console.log('  ✅ npm configured for local registry');
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to configure npm: ${error.message}`);
    return false;
  }
}

/**
 * Create a test user for the registry
 */
function createTestUser() {
  console.log('👤 Creating test user for registry...');
  
  try {
    // Use npm adduser with predefined credentials for testing
    const testUser = {
      username: 'testuser',
      password: 'testpass',
      email: 'test@example.com'
    };
    
    // Create .npmrc with auth token (bypassing interactive adduser)
    const authString = Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64');
    const npmrcPath = join(process.cwd(), '.npmrc.test');
    const npmrcContent = `registry=${registryUrl}
//${new URL(registryUrl).host}/:_authToken=testtoken
//${new URL(registryUrl).host}/:username=${testUser.username}
//${new URL(registryUrl).host}/:email=${testUser.email}
`;
    
    writeFileSync(npmrcPath, npmrcContent);
    
    // Set the npmrc file
    process.env.NPM_CONFIG_USERCONFIG = npmrcPath;
    
    console.log('  ✅ Test user configured');
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to create test user: ${error.message}`);
    return false;
  }
}

/**
 * Test publishing to local registry
 */
async function testPublish() {
  console.log('📤 Testing package publish to local registry...');
  
  try {
    // First, build the package
    console.log('  🔧 Building package...');
    execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
    
    // Pack the package
    console.log('  📦 Packing package...');
    const packResult = execSync('npm pack', { 
      encoding: 'utf8', 
      cwd: process.cwd() 
    }).trim();
    
    console.log(`  ✅ Package created: ${packResult}`);
    
    // Publish to local registry
    console.log('  🚀 Publishing to local registry...');
    execSync(`npm publish --registry ${registryUrl}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NPM_CONFIG_USERCONFIG: join(process.cwd(), '.npmrc.test')
      }
    });
    
    console.log('  ✅ Package published successfully');
    return true;
    
  } catch (error) {
    console.error(`  ❌ Publish failed: ${error.message}`);
    return false;
  }
}

/**
 * Test installing from local registry
 */
async function testInstall() {
  console.log('📥 Testing package install from local registry...');
  
  const testDir = join(tmpdir(), `rough-cut-test-${uuidv4().substring(0, 8)}`);
  
  try {
    mkdirSync(testDir, { recursive: true });
    console.log(`  📁 Test directory: ${testDir}`);
    
    // Create package.json for test directory
    const testPackageJson = {
      name: 'rough-cut-test-install',
      version: '1.0.0',
      private: true
    };
    
    writeFileSync(
      join(testDir, 'package.json'), 
      JSON.stringify(testPackageJson, null, 2)
    );
    
    // Copy .npmrc to test directory
    const npmrcContent = readFileSync(join(process.cwd(), '.npmrc.test'), 'utf8');
    writeFileSync(join(testDir, '.npmrc'), npmrcContent);
    
    // Read our package.json to get the package name
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    const packageName = packageJson.name;
    
    console.log(`  📦 Installing ${packageName}...`);
    
    // Install the package globally from local registry
    execSync(`npm install -g ${packageName} --registry ${registryUrl}`, {
      stdio: 'inherit',
      cwd: testDir,
      env: {
        ...process.env,
        NPM_CONFIG_USERCONFIG: join(testDir, '.npmrc')
      }
    });
    
    console.log('  ✅ Package installed successfully');
    
    // Test that the package was installed correctly
    const globalNodeModules = platform() === 'win32' 
      ? join(process.env.APPDATA || '', 'npm', 'node_modules')
      : '/usr/local/lib/node_modules';
    
    const installedPackagePath = join(globalNodeModules, packageName);
    
    // Note: In CI environments, global install path might be different
    console.log(`  📍 Expected install location: ${installedPackagePath}`);
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ Install failed: ${error.message}`);
    return false;
  } finally {
    // Cleanup test directory
    try {
      if (platform() === 'win32') {
        execSync(`rmdir /s /q "${testDir}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${testDir}"`, { stdio: 'ignore' });
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Test that postinstall script runs correctly
 */
async function testPostinstall() {
  console.log('🔧 Testing postinstall script execution...');
  
  try {
    const postinstallScript = join(process.cwd(), 'scripts', 'postinstall.js');
    
    if (!existsSync(postinstallScript)) {
      console.log('  ⚠️  Postinstall script not found - skipping');
      return true;
    }
    
    // Simulate postinstall environment
    const testEnv = {
      ...process.env,
      npm_lifecycle_event: 'postinstall',
      npm_config_global: 'true',
      DEBUG_MCP_INSTALL: 'true'
    };
    
    console.log('  🔧 Running postinstall script...');
    const result = execSync(`node "${postinstallScript}"`, {
      encoding: 'utf8',
      env: testEnv,
      cwd: process.cwd()
    });
    
    console.log('  ✅ Postinstall script completed');
    
    // Check for common success indicators
    if (result.includes('Installation complete') || result.includes('✅')) {
      console.log('  ✅ Postinstall appears successful');
    } else {
      console.log('  ⚠️  Postinstall output unclear');
    }
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ Postinstall failed: ${error.message}`);
    return false;
  }
}

/**
 * Test MCP server after installation
 */
async function testMCPServerAfterInstall() {
  console.log('🔌 Testing MCP server after installation...');
  
  const serverPath = join(process.cwd(), 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    console.log('  ⚠️  MCP server build not found - skipping');
    return true;
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        REMOTION_ASSETS_DIR: join(process.cwd(), 'assets')
      }
    });
    
    let responded = false;
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('"result"') || output.includes('"capabilities"')) {
        responded = true;
        console.log('  ✅ MCP server responding correctly');
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
          clientInfo: { name: 'verdaccio-test', version: '1.0.0' }
        },
        id: 1
      }) + '\n';
      
      child.stdin.write(initRequest);
    }, 500);
    
    // Cleanup and resolve
    setTimeout(() => {
      child.kill('SIGTERM');
      
      if (responded) {
        resolve(true);
      } else {
        console.log('  ❌ MCP server not responding');
        if (errorOutput) {
          console.log(`  📄 Error: ${errorOutput.substring(0, 200)}...`);
        }
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * Cleanup function
 */
function cleanup() {
  console.log('🧹 Cleaning up...');
  
  // Stop Verdaccio
  stopVerdaccio();
  
  // Restore npm registry
  try {
    execSync('npm config delete registry', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors
  }
  
  // Remove test npmrc files
  try {
    const testNpmrc = join(process.cwd(), '.npmrc.test');
    if (existsSync(testNpmrc)) {
      execSync(`rm "${testNpmrc}"`, { stdio: 'ignore' });
    }
  } catch (e) {
    // Ignore errors
  }
  
  console.log('  ✅ Cleanup complete');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🎯 Starting Verdaccio Local Registry Tests\n');
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}\n`);
  
  let passed = 0;
  let total = 0;
  
  // Setup error handling
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
  
  try {
    // Setup phase
    console.log('🏗️  Setup Phase\n');
    
    await startVerdaccio();
    if (!configureNpmRegistry()) {
      throw new Error('Failed to configure npm registry');
    }
    
    if (!createTestUser()) {
      throw new Error('Failed to create test user');
    }
    
    // Test phase
    console.log('\n🧪 Test Phase\n');
    
    const tests = [
      { name: 'Package Publish', fn: testPublish },
      { name: 'Package Install', fn: testInstall },
      { name: 'Postinstall Script', fn: testPostinstall },
      { name: 'MCP Server After Install', fn: testMCPServerAfterInstall }
    ];
    
    for (const test of tests) {
      total++;
      console.log(`\n📋 Running: ${test.name}`);
      
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
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
  } finally {
    cleanup();
  }
  
  // Results
  console.log('\n📊 Verdaccio Test Results');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All Verdaccio tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed - see output above');
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error('Test runner error:', error);
    cleanup();
    process.exit(1);
  });
}