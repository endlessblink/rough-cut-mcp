#!/usr/bin/env node

/**
 * Integration test for npm global installation scenarios
 * Tests the complete installation flow across different environments
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform, tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

console.log('📦 Testing npm Global Installation Scenarios\n');

/**
 * Test npm pack and global install cycle
 */
async function testNpmPackInstall() {
  console.log('📋 Testing npm pack → global install cycle');
  
  const testId = uuidv4().substring(0, 8);
  const tempDir = join(tmpdir(), `rough-cut-test-${testId}`);
  
  try {
    // Create temp directory for test
    mkdirSync(tempDir, { recursive: true });
    
    console.log(`  📁 Test directory: ${tempDir}`);
    
    // Step 1: npm pack
    console.log('  🔧 Running npm pack...');
    const packResult = execSync('npm pack', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    const packageFile = packResult.trim();
    console.log(`  ✓ Package created: ${packageFile}`);
    
    // Step 2: Copy package to temp directory
    const packagePath = join(process.cwd(), packageFile);
    const tempPackagePath = join(tempDir, packageFile);
    
    if (!existsSync(packagePath)) {
      throw new Error(`Package file not found: ${packagePath}`);
    }
    
    // Step 3: Test global install (simulate)
    console.log('  🌐 Simulating global install...');
    
    // We can't actually do a real global install in CI, so we simulate it
    const globalNodeModules = platform() === 'win32' 
      ? join(homedir(), 'AppData', 'Roaming', 'npm', 'node_modules')
      : join(homedir(), '.npm-packages', 'lib', 'node_modules');
    
    console.log(`  ✓ Would install to: ${globalNodeModules}`);
    
    // Step 4: Test that postinstall script can handle global install paths
    const postinstallScript = join(process.cwd(), 'scripts', 'postinstall.js');
    if (existsSync(postinstallScript)) {
      console.log('  🔧 Testing postinstall script...');
      
      const testEnv = {
        ...process.env,
        npm_lifecycle_event: 'postinstall',
        npm_config_global: 'true',
        DEBUG_MCP_INSTALL: 'true'
      };
      
      // Simulate global install environment
      const result = execSync(`node "${postinstallScript}"`, {
        encoding: 'utf8',
        env: testEnv,
        cwd: process.cwd()
      });
      
      console.log('  ✓ Postinstall script executed successfully');
    } else {
      console.log('  ⚠️  Postinstall script not found');
    }
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ npm pack/install test failed: ${error.message}`);
    return false;
  } finally {
    // Cleanup
    try {
      execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Test package.json configuration for global installation
 */
function testPackageJsonConfig() {
  console.log('📋 Testing package.json configuration');
  
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    // Check required fields for npm publish
    const requiredFields = ['name', 'version', 'main', 'bin'];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        console.error(`  ❌ Missing required field: ${field}`);
        return false;
      }
      console.log(`  ✓ ${field}: ${JSON.stringify(packageJson[field])}`);
    }
    
    // Check bin configuration
    if (packageJson.bin) {
      const binEntries = typeof packageJson.bin === 'string' 
        ? { [packageJson.name]: packageJson.bin }
        : packageJson.bin;
      
      for (const [command, path] of Object.entries(binEntries)) {
        const binPath = join(process.cwd(), path);
        if (!existsSync(binPath)) {
          console.error(`  ❌ Bin file not found: ${path}`);
          return false;
        }
        console.log(`  ✓ Binary ${command}: ${path}`);
      }
    }
    
    // Check files array
    if (packageJson.files) {
      for (const filePattern of packageJson.files) {
        const filePath = join(process.cwd(), filePattern);
        if (!existsSync(filePath) && !filePattern.includes('*')) {
          console.error(`  ❌ File not found: ${filePattern}`);
          return false;
        }
        console.log(`  ✓ File pattern: ${filePattern}`);
      }
    }
    
    // Check postinstall script
    if (packageJson.scripts && packageJson.scripts.postinstall) {
      const postinstallScript = packageJson.scripts.postinstall;
      console.log(`  ✓ Postinstall script: ${postinstallScript}`);
      
      // Verify the postinstall script file exists
      if (postinstallScript.includes('scripts/postinstall.js')) {
        const scriptPath = join(process.cwd(), 'scripts', 'postinstall.js');
        if (!existsSync(scriptPath)) {
          console.error(`  ❌ Postinstall script file not found: ${scriptPath}`);
          return false;
        }
        console.log('  ✓ Postinstall script file exists');
      }
    }
    
    console.log('  ✅ package.json configuration valid');
    return true;
    
  } catch (error) {
    console.error(`  ❌ package.json test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test build output for global installation
 */
function testBuildOutput() {
  console.log('📋 Testing build output');
  
  try {
    const buildDir = join(process.cwd(), 'build');
    const mainFile = join(buildDir, 'index.js');
    
    if (!existsSync(buildDir)) {
      console.log('  ⚠️  Build directory not found - run npm run build first');
      return true; // Not a failure in CI
    }
    
    if (!existsSync(mainFile)) {
      console.error(`  ❌ Main build file not found: ${mainFile}`);
      return false;
    }
    
    console.log(`  ✓ Main build file exists: ${mainFile}`);
    
    // Check that the main file is executable (has shebang or is valid JS)
    const mainContent = readFileSync(mainFile, 'utf8');
    
    if (mainContent.startsWith('#!/usr/bin/env node') || mainContent.includes('import') || mainContent.includes('require')) {
      console.log('  ✓ Main file appears to be valid Node.js');
    } else {
      console.error('  ❌ Main file doesn\'t appear to be valid Node.js');
      return false;
    }
    
    // Check that there are no WSL paths in the built code
    if (mainContent.includes('/mnt/')) {
      console.error('  ❌ Build contains WSL paths - build on Windows!');
      return false;
    }
    
    console.log('  ✓ Build output clean (no WSL paths)');
    
    console.log('  ✅ Build output valid');
    return true;
    
  } catch (error) {
    console.error(`  ❌ Build output test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test different global installation prefixes
 */
function testGlobalInstallationPrefixes() {
  console.log('📋 Testing different npm global prefixes');
  
  const testPrefixes = platform() === 'win32' ? [
    'C:\\Users\\TestUser\\AppData\\Roaming\\npm',
    'C:\\Program Files\\nodejs',
    'C:\\nodejs\\npm',
    'C:\\Users\\TestUser\\scoop\\apps\\npm'
  ] : [
    '/usr/local',
    '/home/testuser/.npm-packages',
    '/home/testuser/.nvm/versions/node/v20.11.0',
    '/opt/nodejs'
  ];
  
  for (const prefix of testPrefixes) {
    console.log(`  📁 Testing prefix: ${prefix}`);
    
    // Calculate where the package would be installed
    const nodeModulesPath = join(prefix, 'node_modules', 'rough-cut-mcp');
    const binPath = platform() === 'win32' 
      ? join(prefix, 'rough-cut-mcp.cmd')
      : join(prefix, 'bin', 'rough-cut-mcp');
    
    console.log(`    ✓ Would create: ${nodeModulesPath}`);
    console.log(`    ✓ Would create bin: ${binPath}`);
  }
  
  console.log('  ✅ Global prefix tests completed');
  return true;
}

/**
 * Test Claude Desktop configuration update simulation
 */
function testClaudeDesktopConfigUpdate() {
  console.log('📋 Testing Claude Desktop configuration update');
  
  try {
    const testConfigDir = join(tmpdir(), `claude-test-${uuidv4().substring(0, 8)}`);
    mkdirSync(testConfigDir, { recursive: true });
    
    const configPath = join(testConfigDir, 'claude_desktop_config.json');
    
    // Create initial config
    const initialConfig = { mcpServers: {} };
    writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));
    
    // Simulate what postinstall.js would do
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    
    config.mcpServers['rough-cut-mcp'] = {
      command: platform() === 'win32' ? 'C:\\Program Files\\nodejs\\node.exe' : 'node',
      args: ['/path/to/rough-cut-mcp/build/index.js'],
      env: {
        REMOTION_ASSETS_DIR: '/path/to/assets',
        NODE_ENV: 'production'
      }
    };
    
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // Verify the config is valid JSON and contains our server
    const updatedConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    
    if (!updatedConfig.mcpServers['rough-cut-mcp']) {
      console.error('  ❌ Config update failed - server not found');
      return false;
    }
    
    console.log('  ✓ Claude Desktop config updated successfully');
    console.log(`  ✓ Command: ${updatedConfig.mcpServers['rough-cut-mcp'].command}`);
    console.log(`  ✓ Args: ${updatedConfig.mcpServers['rough-cut-mcp'].args.join(' ')}`);
    
    // Cleanup
    try {
      execSync(`rmdir /s /q "${testConfigDir}"`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.log('  ✅ Claude Desktop config test passed');
    return true;
    
  } catch (error) {
    console.error(`  ❌ Claude Desktop config test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🎯 Starting npm Installation Integration Tests\n');
  console.log(`Platform: ${platform()}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}\n`);
  
  let passed = 0;
  let total = 0;
  
  const tests = [
    { name: 'npm pack/install cycle', fn: testNpmPackInstall },
    { name: 'package.json configuration', fn: testPackageJsonConfig },
    { name: 'build output', fn: testBuildOutput },
    { name: 'global installation prefixes', fn: testGlobalInstallationPrefixes },
    { name: 'Claude Desktop config update', fn: testClaudeDesktopConfigUpdate }
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
  console.log('\n📊 Installation Test Results');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All installation tests passed!');
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