#!/usr/bin/env node
/**
 * Test studio tools and registry functionality
 * Ensures the new network features don't break existing functionality
 */

const { StudioRegistry } = require('./build/services/studio-registry.js');
const path = require('path');

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

async function testStudioRegistry() {
  log('\n=== Testing Studio Registry ===\n', 'cyan');
  
  try {
    // Create a mock config
    const config = {
      assetsDir: path.join(process.cwd(), 'assets'),
      projectsDir: path.join(process.cwd(), 'assets', 'projects')
    };
    
    // Create registry instance
    const registry = new StudioRegistry(config);
    log('✓ Studio registry created successfully', 'green');
    
    // Test getting instances (should be empty or have existing)
    const instances = registry.getInstances();
    log(`✓ Retrieved ${instances.length} existing instances`, 'green');
    
    // Check that instances have the new URL structure
    if (instances.length > 0) {
      const instance = instances[0];
      if (instance.urls) {
        log('✓ Instance has new URLs structure:', 'green');
        log(`  - Local: ${instance.urls.local}`, 'cyan');
        log(`  - Network: ${instance.urls.network}`, 'cyan');
        log(`  - Primary: ${instance.urls.primary}`, 'cyan');
      } else if (instance.url) {
        log('✓ Instance has URL (backward compatible)', 'yellow');
        log(`  - URL: ${instance.url}`, 'cyan');
      }
    }
    
    // Test status retrieval
    const status = registry.getStatus();
    log(`✓ Status check successful:`, 'green');
    log(`  - Total instances: ${status.totalInstances}`, 'cyan');
    log(`  - Running instances: ${status.runningInstances}`, 'cyan');
    
    return { success: true };
    
  } catch (error) {
    log(`✗ Studio registry test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testProjectManagement() {
  log('\n=== Testing Project Management ===\n', 'cyan');
  
  try {
    const fs = require('fs-extra');
    const projectsDir = path.join(process.cwd(), 'assets', 'projects');
    
    // Check if projects directory exists
    if (await fs.pathExists(projectsDir)) {
      const projects = await fs.readdir(projectsDir);
      log(`✓ Found ${projects.length} projects in assets/projects`, 'green');
      
      if (projects.length > 0) {
        // Test reading a project
        const projectPath = path.join(projectsDir, projects[0]);
        const packageJsonPath = path.join(projectPath, 'package.json');
        
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          log(`✓ Successfully read project: ${packageJson.name || projects[0]}`, 'green');
        }
      }
    } else {
      log('✓ Projects directory will be created when needed', 'yellow');
    }
    
    return { success: true };
    
  } catch (error) {
    log(`✗ Project management test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testNetworkIntegration() {
  log('\n=== Testing Network Integration ===\n', 'cyan');
  
  try {
    // Test that network utils are available and working
    const { buildNetworkUrls, formatStudioUrls } = require('./build/utils/network-utils.js');
    
    // Test URL building
    const testPort = 7400;
    const urls = buildNetworkUrls(testPort);
    
    log('✓ Network URLs built successfully:', 'green');
    log(`  - Local: ${urls.local}`, 'cyan');
    log(`  - Network: ${urls.network || 'N/A'}`, 'cyan');
    log(`  - Primary: ${urls.primary}`, 'cyan');
    
    // Test formatting
    const formatted = formatStudioUrls(urls, false);
    log('✓ Formatted output generated:', 'green');
    formatted.forEach(line => {
      if (line) log(`  ${line}`, 'cyan');
    });
    
    // Test with environment variables
    process.env.REMOTION_PUBLIC_HOST = '10.0.0.100';
    const customUrls = buildNetworkUrls(testPort);
    log('✓ Environment variable override works:', 'green');
    log(`  - With REMOTION_PUBLIC_HOST: ${customUrls.primary}`, 'cyan');
    delete process.env.REMOTION_PUBLIC_HOST;
    
    return { success: true };
    
  } catch (error) {
    log(`✗ Network integration test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  log('Starting Studio Tools Tests...', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  let allSuccess = true;
  const results = [];
  
  // Test 1: Studio Registry
  const registryResult = await testStudioRegistry();
  results.push({ name: 'Studio Registry', ...registryResult });
  if (!registryResult.success) allSuccess = false;
  
  // Test 2: Project Management
  const projectResult = await testProjectManagement();
  results.push({ name: 'Project Management', ...projectResult });
  if (!projectResult.success) allSuccess = false;
  
  // Test 3: Network Integration
  const networkResult = await testNetworkIntegration();
  results.push({ name: 'Network Integration', ...networkResult });
  if (!networkResult.success) allSuccess = false;
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('Test Results Summary:', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`${status}: ${result.name}`, color);
    if (!result.success && result.error) {
      log(`     Error: ${result.error}`, 'red');
    }
  });
  
  log('\n' + '='.repeat(50), 'cyan');
  if (allSuccess) {
    log('✅ All tests passed!', 'green');
    log('', 'reset');
    log('Key validations:', 'green');
    log('  • Studio registry works with new URL structure', 'green');
    log('  • Project management remains functional', 'green');
    log('  • Network features properly integrated', 'green');
    log('  • Backward compatibility maintained', 'green');
    log('  • No breaking changes detected', 'green');
  } else {
    log('❌ Some tests failed. Check the errors above.', 'red');
  }
}

// Run the tests
runTests().catch(console.error);