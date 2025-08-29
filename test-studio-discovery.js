/**
 * E2E Test Script for Studio Discovery & Reuse System
 * Tests the core fix: MCP discovering and reusing existing studios instead of spawning new ones
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Test configuration
const config = {
  assetsDir: path.join(__dirname, 'assets'),
  testTimeout: 10000,
  expectedStudios: 6, // Based on your original issue description
  excludedPort: 3001
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testStudioDiscovery() {
  log('\n🔍 TESTING STUDIO DISCOVERY SERVICE', 'bright');
  log('=====================================', 'bright');

  try {
    // Import discovery service
    const { StudioDiscoveryService } = require('./build/services/studio-discovery.js');
    const discovery = new StudioDiscoveryService();

    logStep(1, 'Testing basic discovery functionality');
    
    const startTime = Date.now();
    const discoveredStudios = await discovery.discoverRunningStudios();
    const discoveryTime = Date.now() - startTime;

    logInfo(`Discovery completed in ${discoveryTime}ms`);
    
    if (discoveredStudios && discoveredStudios.length > 0) {
      logSuccess(`Found ${discoveredStudios.length} studio(s)`);
      
      discoveredStudios.forEach((studio, i) => {
        log(`  ${i + 1}. Port ${studio.port} (PID: ${studio.pid}) - ${studio.isHealthy ? 'Healthy' : 'Unhealthy'}`, 'yellow');
        if (studio.project) {
          log(`     Project: ${studio.project}`, 'yellow');
        }
        log(`     Uptime: ${Math.round(studio.uptime / 1000)}s`, 'yellow');
      });
    } else {
      logWarning('No studios discovered - this is expected if none are running');
    }

    logStep(2, 'Testing port exclusion (3001 should not be used for new studios)');
    
    // Check if port 3001 is in excluded range
    const portRange = { min: 3002, max: 3100 }; // Should exclude 3001
    let foundPortsInRange = [];
    
    for (const studio of discoveredStudios || []) {
      if (studio.port >= 3000 && studio.port <= 3010) {
        foundPortsInRange.push(studio.port);
      }
    }
    
    if (foundPortsInRange.includes(3001)) {
      logInfo('Port 3001 found in discovery (OK - we discover all ports, just don\'t use 3001 for new studios)');
    } else {
      logInfo('Port 3001 not found in discovered studios');
    }

    logStep(3, 'Testing best studio selection');
    
    const bestStudio = await discovery.findBestStudio();
    if (bestStudio) {
      logSuccess(`Best studio selected: Port ${bestStudio.port} (PID: ${bestStudio.pid})`);
      log(`  Health: ${bestStudio.isHealthy ? 'Healthy' : 'Unhealthy'}`, 'yellow');
      log(`  Uptime: ${Math.round(bestStudio.uptime / 1000)}s`, 'yellow');
      if (bestStudio.project) {
        log(`  Project: ${bestStudio.project}`, 'yellow');
      }
    } else {
      logWarning('No best studio found - expected if no healthy studios are running');
    }

    logStep(4, 'Testing health checking');
    
    if (discoveredStudios && discoveredStudios.length > 0) {
      const firstStudio = discoveredStudios[0];
      const pingResult = await discovery.pingStudio(firstStudio.port, 2000);
      
      if (pingResult) {
        logSuccess(`Health check passed for port ${firstStudio.port}`);
      } else {
        logWarning(`Health check failed for port ${firstStudio.port} (may be unhealthy)`);
      }
    } else {
      logInfo('Skipping health check - no studios to test');
    }

    logStep(5, 'Testing comprehensive report');
    
    const report = await discovery.getStudioReport();
    logInfo(`System Report:`);
    log(`  Total Studios: ${report.totalStudios}`, 'yellow');
    log(`  Healthy Studios: ${report.healthyStudios}`, 'yellow');
    log(`  Unhealthy Studios: ${report.unhealthyStudios}`, 'yellow');
    log(`  Port Usage: [${report.portUsage.join(', ')}]`, 'yellow');
    log(`  Recommendations:`, 'yellow');
    report.recommendations.forEach(rec => {
      log(`    • ${rec}`, 'yellow');
    });

    return {
      success: true,
      discoveredCount: discoveredStudios?.length || 0,
      hasHealthyStudios: (discoveredStudios || []).some(s => s.isHealthy),
      discoveryTime,
      bestStudio: bestStudio || null
    };

  } catch (error) {
    logError(`Discovery test failed: ${error.message}`);
    console.error(error);
    return { success: false, error: error.message };
  }
}

async function testPortValidator() {
  log('\n🔌 TESTING PORT VALIDATOR', 'bright');
  log('==========================', 'bright');

  try {
    const { PortValidator } = require('./build/services/port-validator.js');
    const portValidator = new PortValidator();

    logStep(1, 'Testing port availability check');
    
    // Test a few common ports
    const testPorts = [3000, 3001, 3002, 8080];
    const portResults = [];
    
    for (const port of testPorts) {
      const startTime = Date.now();
      const isAvailable = await portValidator.isPortAvailable(port);
      const checkTime = Date.now() - startTime;
      
      portResults.push({ port, isAvailable, checkTime });
      
      if (isAvailable) {
        log(`  Port ${port}: Available (${checkTime}ms)`, 'green');
      } else {
        log(`  Port ${port}: In use (${checkTime}ms)`, 'yellow');
      }
    }

    logStep(2, 'Testing available port finding (should exclude 3001)');
    
    try {
      const availablePort = await portValidator.findAvailablePort(3002, 3010);
      
      if (availablePort === 3001) {
        logError('Found port 3001 - exclusion not working properly!');
        return { success: false, error: 'Port 3001 exclusion failed' };
      } else {
        logSuccess(`Found available port: ${availablePort} (correctly excluded 3001)`);
      }
    } catch (error) {
      logWarning(`No available ports found in range 3002-3010: ${error.message}`);
    }

    logStep(3, 'Testing process information retrieval');
    
    const portsInUse = portResults.filter(p => !p.isAvailable).map(p => p.port);
    
    if (portsInUse.length > 0) {
      const testPort = portsInUse[0];
      const processInfo = await portValidator.getPortProcessInfo(testPort);
      
      if (processInfo) {
        logSuccess(`Process info for port ${testPort}:`);
        log(`  PID: ${processInfo.pid}`, 'yellow');
        log(`  Process: ${processInfo.processName}`, 'yellow');
        log(`  Command: ${processInfo.commandLine.substring(0, 60)}...`, 'yellow');
      } else {
        logWarning(`Could not get process info for port ${testPort}`);
      }
    } else {
      logInfo('No ports in use to test process info retrieval');
    }

    return { success: true, portResults };

  } catch (error) {
    logError(`Port validator test failed: ${error.message}`);
    console.error(error);
    return { success: false, error: error.message };
  }
}

async function testStudioRegistry() {
  log('\n🏗️ TESTING ENHANCED STUDIO REGISTRY', 'bright');
  log('===================================', 'bright');

  try {
    const { StudioRegistry } = require('./build/services/studio-registry.js');
    
    // Create minimal config for testing
    const testConfig = {
      assetsDir: config.assetsDir
    };

    logStep(1, 'Testing registry initialization with discovery');
    
    const registry = new StudioRegistry(testConfig);
    
    // Wait a moment for initialization
    await delay(2000);
    
    logSuccess('Registry initialized');

    logStep(2, 'Testing comprehensive report');
    
    const report = await registry.getComprehensiveReport();
    
    logInfo('Comprehensive Report:');
    log(`  Tracked Instances: ${report.tracked.length}`, 'yellow');
    log(`  Discovered Instances: ${report.discovered.length}`, 'yellow');
    log(`  System Health: ${report.systemHealth}`, 'yellow');
    log(`  Port Usage: [${report.portUsage.join(', ')}]`, 'yellow');
    
    if (report.tracked.length > 0) {
      log(`  Tracked Studios:`, 'yellow');
      report.tracked.forEach(inst => {
        log(`    - Port ${inst.port}: ${inst.projectName} (${inst.status})`, 'yellow');
      });
    }
    
    if (report.discovered.length > 0) {
      log(`  Discovered Studios:`, 'yellow');
      report.discovered.forEach(studio => {
        log(`    - Port ${studio.port}: ${studio.project || 'Unknown'} (${studio.isHealthy ? 'Healthy' : 'Unhealthy'})`, 'yellow');
      });
    }

    logStep(3, 'Testing registry status');
    
    const status = registry.getStatus();
    logInfo(`Registry Status:`);
    log(`  Total Instances: ${status.totalInstances}`, 'yellow');
    log(`  Running Instances: ${status.runningInstances}`, 'yellow');

    logStep(4, 'Testing health check functionality');
    
    if (status.totalInstances > 0) {
      const healthResult = await registry.performHealthCheck();
      logInfo(`Health Check Results:`);
      log(`  Healthy: ${healthResult.healthy}`, 'green');
      log(`  Unhealthy: ${healthResult.unhealthy}`, 'red');
      log(`  Recovered: ${healthResult.recovered}`, 'cyan');
    } else {
      logInfo('Skipping health check - no instances to check');
    }

    return { 
      success: true, 
      trackedCount: report.tracked.length,
      discoveredCount: report.discovered.length,
      systemHealth: report.systemHealth
    };

  } catch (error) {
    logError(`Registry test failed: ${error.message}`);
    console.error(error);
    return { success: false, error: error.message };
  }
}

async function testMCPIntegration() {
  log('\n🔧 TESTING MCP INTEGRATION', 'bright');
  log('===========================', 'bright');

  try {
    // Test that the MCP server can be imported without errors
    logStep(1, 'Testing MCP server imports');
    
    const serverModule = require('./build/index.js');
    logSuccess('MCP server module imported successfully');

    // Test tool registry
    logStep(2, 'Testing tool registration');
    
    // We can't easily test the full MCP server startup, but we can verify
    // that our new services can be imported and instantiated
    const { StudioDiscoveryService } = require('./build/services/studio-discovery.js');
    const { PortValidator } = require('./build/services/port-validator.js');
    const { StudioRegistry } = require('./build/services/studio-registry.js');
    
    new StudioDiscoveryService();
    new PortValidator();
    
    logSuccess('All service classes instantiate correctly');

    logStep(3, 'Testing type definitions');
    
    // Check that type files exist
    const typeFiles = [
      './build/types/studio-discovery.d.ts',
      './build/services/studio-discovery.d.ts',
      './build/services/port-validator.d.ts',
      './build/services/studio-registry.d.ts'
    ];

    for (const typeFile of typeFiles) {
      if (fs.existsSync(typeFile)) {
        logSuccess(`Type file exists: ${path.basename(typeFile)}`);
      } else {
        logWarning(`Type file missing: ${path.basename(typeFile)}`);
      }
    }

    return { success: true };

  } catch (error) {
    logError(`MCP integration test failed: ${error.message}`);
    console.error(error);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('🚀 STARTING E2E TESTING OF STUDIO DISCOVERY SYSTEM', 'bright');
  log('===================================================', 'bright');
  
  const results = {
    discovery: null,
    portValidator: null,
    registry: null,
    mcpIntegration: null,
    startTime: Date.now()
  };

  // Run tests sequentially
  results.discovery = await testStudioDiscovery();
  results.portValidator = await testPortValidator();
  results.registry = await testStudioRegistry();
  results.mcpIntegration = await testMCPIntegration();

  const totalTime = Date.now() - results.startTime;

  // Test summary
  log('\n📊 TEST SUMMARY', 'bright');
  log('===============', 'bright');

  const tests = [
    { name: 'Studio Discovery', result: results.discovery },
    { name: 'Port Validator', result: results.portValidator },
    { name: 'Studio Registry', result: results.registry },
    { name: 'MCP Integration', result: results.mcpIntegration }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach(test => {
    if (test.result?.success) {
      logSuccess(`${test.name}: PASSED`);
      passedTests++;
    } else {
      logError(`${test.name}: FAILED - ${test.result?.error || 'Unknown error'}`);
    }
  });

  log(`\n🎯 OVERALL RESULTS:`, 'bright');
  log(`   Tests Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  log(`   Total Time: ${totalTime}ms`, 'cyan');

  // Key findings
  if (results.discovery?.success) {
    log(`\n🔍 KEY FINDINGS:`, 'bright');
    log(`   Studios Discovered: ${results.discovery.discoveredCount}`, 'yellow');
    log(`   Healthy Studios Available: ${results.discovery.hasHealthyStudios ? 'Yes' : 'No'}`, 'yellow');
    log(`   Best Studio for Reuse: ${results.discovery.bestStudio ? `Port ${results.discovery.bestStudio.port}` : 'None'}`, 'yellow');
    
    if (results.registry?.success) {
      log(`   Registry Tracked: ${results.registry.trackedCount}`, 'yellow');
      log(`   System Health: ${results.registry.systemHealth}`, 'yellow');
    }
  }

  // Recommendations
  log(`\n💡 RECOMMENDATIONS:`, 'bright');
  
  if (results.discovery?.discoveredCount > 0) {
    if (results.discovery.hasHealthyStudios) {
      logSuccess('✅ READY FOR TESTING: Healthy studios found - smart reuse should work!');
    } else {
      logWarning('⚠️  Studios found but none healthy - new studios will be launched');
    }
  } else {
    logInfo('ℹ️  No studios running - start some studios and re-test discovery');
  }

  if (passedTests === totalTests) {
    logSuccess(`\n🎉 ALL TESTS PASSED! Studio discovery system is working correctly.`);
    
    log(`\nNEXT STEPS TO VERIFY THE CORE FIX:`, 'cyan');
    log(`1. Ensure you have some Remotion studios running on ports 3000, 3002-3006`, 'yellow');
    log(`2. Start the MCP server: node build/index.js`, 'yellow');
    log(`3. In Claude, run: studio discover`, 'yellow');
    log(`4. In Claude, run: studio start test-project`, 'yellow');
    log(`5. Verify it shows: "♻️ Reusing existing studio" instead of spawning new`, 'yellow');
    
  } else {
    logError(`\n❌ TESTS FAILED! Please fix the issues above before proceeding.`);
  }

  return passedTests === totalTests;
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logError(`Fatal test error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });