#!/usr/bin/env node

/**
 * Pre-Publish Validation Script
 * Comprehensive testing before npm publish to catch environment issues early
 */

import { spawn, execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { platform } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

console.log('🚀 Pre-Publish Validation for RoughCut MCP\n');
console.log(`Platform: ${platform()}`);
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${projectRoot}\n`);

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

/**
 * Log test result
 */
function logResult(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ ${testName}`);
  } else {
    console.log(`❌ ${testName}`);
    if (details) {
      console.log(`   ${details}`);
    }
    failedTests.push({ name: testName, details });
  }
}

/**
 * Validate package.json configuration
 */
function validatePackageJson() {
  console.log('📋 Validating package.json configuration...\n');
  
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    // Required fields
    const requiredFields = [
      { field: 'name', validator: (v) => typeof v === 'string' && v.length > 0 },
      { field: 'version', validator: (v) => typeof v === 'string' && /^\d+\.\d+\.\d+/.test(v) },
      { field: 'description', validator: (v) => typeof v === 'string' && v.length > 10 },
      { field: 'main', validator: (v) => typeof v === 'string' && existsSync(join(projectRoot, v)) },
      { field: 'repository', validator: (v) => typeof v === 'object' && v.url },
      { field: 'license', validator: (v) => typeof v === 'string' },
      { field: 'keywords', validator: (v) => Array.isArray(v) && v.length > 0 },
      { field: 'engines', validator: (v) => typeof v === 'object' && v.node }
    ];
    
    for (const { field, validator } of requiredFields) {
      const value = packageJson[field];
      logResult(
        `package.json.${field}`,
        validator(value),
        value ? `Current: ${JSON.stringify(value)}` : 'Missing field'
      );
    }
    
    // Check bin configuration
    if (packageJson.bin) {
      const binEntries = typeof packageJson.bin === 'string' 
        ? { [packageJson.name]: packageJson.bin }
        : packageJson.bin;
      
      for (const [command, path] of Object.entries(binEntries)) {
        const binPath = join(projectRoot, path);
        logResult(
          `Binary ${command}`,
          existsSync(binPath),
          `Path: ${path}`
        );
      }
    }
    
    // Check scripts
    const requiredScripts = ['build', 'test', 'postinstall'];
    for (const script of requiredScripts) {
      logResult(
        `Script: ${script}`,
        packageJson.scripts && packageJson.scripts[script],
        packageJson.scripts?.[script] || 'Missing'
      );
    }
    
    // Check files array
    if (packageJson.files) {
      for (const filePattern of packageJson.files) {
        const filePath = join(projectRoot, filePattern);
        const exists = existsSync(filePath) || filePattern.includes('*');
        logResult(
          `Files: ${filePattern}`,
          exists,
          exists ? 'Found' : 'Missing'
        );
      }
    }
    
    console.log();
    
  } catch (error) {
    logResult('package.json parsing', false, error.message);
  }
}

/**
 * Validate build output
 */
function validateBuildOutput() {
  console.log('📋 Validating build output...\n');
  
  try {
    // Check if build exists
    const buildDir = join(projectRoot, 'build');
    logResult('Build directory exists', existsSync(buildDir));
    
    const mainBuildFile = join(buildDir, 'index.js');
    logResult('Main build file exists', existsSync(mainBuildFile));
    
    if (existsSync(mainBuildFile)) {
      const buildContent = readFileSync(mainBuildFile, 'utf8');
      
      // Check for common issues
      logResult(
        'Build contains no WSL paths',
        !buildContent.includes('/mnt/'),
        buildContent.includes('/mnt/') ? 'Found WSL paths - rebuild on Windows!' : 'Clean'
      );
      
      logResult(
        'Build is valid JavaScript',
        buildContent.includes('import') || buildContent.includes('require') || buildContent.includes('export'),
        'Contains JS imports/exports'
      );
      
      // Check for console.log statements (breaks MCP protocol)
      const consoleStatements = (buildContent.match(/console\.(log|error|warn|debug)/g) || []).length;
      logResult(
        'No console statements (MCP protocol)',
        consoleStatements === 0,
        consoleStatements > 0 ? `Found ${consoleStatements} console statements` : 'Clean'
      );
      
      // Check for proper error handling
      logResult(
        'Contains error handling',
        buildContent.includes('catch') || buildContent.includes('Error'),
        'Has error handling patterns'
      );
    }
    
    console.log();
    
  } catch (error) {
    logResult('Build validation', false, error.message);
  }
}

/**
 * Test npm pack process
 */
async function testNpmPack() {
  console.log('📋 Testing npm pack process...\n');
  
  try {
    // Clean any existing packages
    const existingPackages = execSync('ls rough-cut-mcp-*.tgz 2>/dev/null || echo ""', { 
      encoding: 'utf8', 
      cwd: projectRoot 
    }).trim();
    
    if (existingPackages) {
      execSync('rm rough-cut-mcp-*.tgz', { cwd: projectRoot, stdio: 'ignore' });
    }
    
    // Run npm pack
    console.log('  🔧 Running npm pack...');
    const packResult = execSync('npm pack', { 
      encoding: 'utf8', 
      cwd: projectRoot 
    }).trim();
    
    const packageFile = packResult.split('\n').pop().trim();
    logResult('npm pack successful', Boolean(packageFile));
    
    if (packageFile) {
      const packagePath = join(projectRoot, packageFile);
      logResult('Package file created', existsSync(packagePath), `File: ${packageFile}`);
      
      // Check package size
      try {
        const stats = require('fs').statSync(packagePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        logResult(
          'Package size reasonable',
          stats.size < 50 * 1024 * 1024, // Less than 50MB
          `Size: ${sizeMB}MB`
        );
      } catch (e) {
        logResult('Package size check', false, 'Could not check size');
      }
    }
    
  } catch (error) {
    logResult('npm pack process', false, error.message);
  }
  
  console.log();
}

/**
 * Test MCP protocol compliance
 */
async function testMCPProtocol() {
  console.log('📋 Testing MCP protocol compliance...\n');
  
  const serverPath = join(projectRoot, 'build', 'index.js');
  
  if (!existsSync(serverPath)) {
    logResult('MCP server build exists', false, 'Run npm run build first');
    return;
  }
  
  logResult('MCP server build exists', true);
  
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        REMOTION_ASSETS_DIR: join(projectRoot, 'assets')
      }
    });
    
    let output = '';
    let errorOutput = '';
    let initializeResponse = null;
    let toolsResponse = null;
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      
      // Parse responses
      const lines = output.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.id === 1) initializeResponse = parsed;
          if (parsed.id === 2) toolsResponse = parsed;
        } catch (e) {
          // Continue parsing
        }
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
          clientInfo: { name: 'pre-publish-test', version: '1.0.0' }
        },
        id: 1
      }) + '\n';
      
      child.stdin.write(initRequest);
    }, 500);
    
    // Send tools/list request
    setTimeout(() => {
      const toolsRequest = JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      }) + '\n';
      
      child.stdin.write(toolsRequest);
    }, 1000);
    
    // Check results
    setTimeout(() => {
      child.kill('SIGTERM');
      
      // Validate responses
      logResult(
        'MCP initialize response',
        initializeResponse && initializeResponse.result,
        initializeResponse ? 'Valid response received' : 'No response'
      );
      
      if (initializeResponse && initializeResponse.result) {
        logResult(
          'Initialize has capabilities',
          Boolean(initializeResponse.result.capabilities),
          'Capabilities object present'
        );
        
        logResult(
          'Initialize has serverInfo',
          Boolean(initializeResponse.result.serverInfo),
          'Server info present'
        );
      }
      
      logResult(
        'Tools list response',
        toolsResponse && toolsResponse.result && toolsResponse.result.tools,
        toolsResponse ? `${toolsResponse.result?.tools?.length || 0} tools` : 'No response'
      );
      
      if (toolsResponse && toolsResponse.result && toolsResponse.result.tools) {
        const tools = toolsResponse.result.tools;
        const validTools = tools.filter(tool => 
          tool.name && tool.description && tool.inputSchema
        );
        
        logResult(
          'All tools valid',
          validTools.length === tools.length,
          `${validTools.length}/${tools.length} tools valid`
        );
      }
      
      // Check for console output contamination
      const hasConsoleOutput = errorOutput.length > 0 && 
        !errorOutput.includes('[DEBUG]') && 
        !errorOutput.includes('Warning:');
      
      logResult(
        'No console contamination',
        !hasConsoleOutput,
        hasConsoleOutput ? 'Found console output that breaks JSON-RPC' : 'Clean output'
      );
      
      console.log();
      resolve();
    }, 2000);
  });
}

/**
 * Test postinstall script
 */
async function testPostinstallScript() {
  console.log('📋 Testing postinstall script...\n');
  
  const postinstallScript = join(projectRoot, 'scripts', 'postinstall.js');
  
  logResult('Postinstall script exists', existsSync(postinstallScript));
  
  if (!existsSync(postinstallScript)) {
    return;
  }
  
  try {
    // Test with debug mode
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
      cwd: projectRoot
    });
    
    logResult('Postinstall script runs', true, 'Executed without errors');
    
    // Check for success indicators
    const hasSuccessIndicators = result.includes('Installation complete') || 
                                 result.includes('✅') ||
                                 result.includes('✓');
    
    logResult(
      'Postinstall shows success',
      hasSuccessIndicators,
      hasSuccessIndicators ? 'Found success indicators' : 'No clear success message'
    );
    
    // Check for path detection
    logResult(
      'Node.js path detected',
      result.includes('Node.js:') || result.includes('Using Node.js:'),
      'Node.js path detection working'
    );
    
  } catch (error) {
    logResult('Postinstall script execution', false, error.message);
  }
  
  console.log();
}

/**
 * Run Docker container tests if Docker is available
 */
async function testDockerContainers() {
  console.log('📋 Testing Docker container builds...\n');
  
  try {
    // Check if Docker is available
    execSync('docker --version', { stdio: 'ignore' });
    logResult('Docker available', true);
    
    // Check if docker-compose.test.yml exists
    const composeFile = join(projectRoot, 'docker-compose.test.yml');
    logResult('Docker compose file exists', existsSync(composeFile));
    
    if (existsSync(composeFile)) {
      console.log('  🔧 Testing Docker compose validation...');
      
      try {
        execSync('docker-compose -f docker-compose.test.yml config', {
          stdio: 'ignore',
          cwd: projectRoot
        });
        logResult('Docker compose config valid', true, 'Compose file syntax OK');
      } catch (error) {
        logResult('Docker compose config valid', false, 'Syntax errors in compose file');
      }
    }
    
  } catch (error) {
    logResult('Docker available', false, 'Docker not installed or not running');
  }
  
  console.log();
}

/**
 * Test TypeScript compilation
 */
function testTypeScriptCompilation() {
  console.log('📋 Testing TypeScript compilation...\n');
  
  try {
    console.log('  🔧 Running TypeScript check...');
    execSync('npx tsc --noEmit', { 
      stdio: 'pipe',
      cwd: projectRoot,
      encoding: 'utf8'
    });
    
    logResult('TypeScript compilation', true, 'No type errors');
    
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || error.message;
    const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
    
    logResult(
      'TypeScript compilation',
      false,
      `${errorCount} type errors found`
    );
  }
  
  console.log();
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('📊 Pre-Publish Validation Report\n');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${Math.round(passedTests / totalTests * 100)}%)`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log('=' .repeat(60));
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    for (const { name, details } of failedTests) {
      console.log(`  • ${name}`);
      if (details) {
        console.log(`    ${details}`);
      }
    }
  }
  
  console.log('\n📝 Recommendations:');
  
  if (failedTests.length === 0) {
    console.log('  🎉 All tests passed! Ready for publishing.');
  } else {
    console.log('  🔧 Fix the failed tests before publishing.');
    
    const criticalFailures = failedTests.filter(test => 
      test.name.includes('Build') || 
      test.name.includes('MCP') || 
      test.name.includes('package.json')
    );
    
    if (criticalFailures.length > 0) {
      console.log('  ⚠️  Critical failures detected - do not publish until fixed.');
    }
  }
  
  // Save report to file
  const reportPath = join(projectRoot, 'pre-publish-report.txt');
  const reportContent = `Pre-Publish Validation Report
Generated: ${new Date().toISOString()}
Node Version: ${process.version}
Platform: ${platform()}

Results: ${passedTests}/${totalTests} tests passed

${failedTests.length > 0 ? `
Failed Tests:
${failedTests.map(({ name, details }) => `- ${name}: ${details}`).join('\n')}
` : 'All tests passed!'}`;
  
  writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

/**
 * Main validation runner
 */
async function runValidation() {
  console.log('🎯 Starting comprehensive pre-publish validation...\n');
  
  // Change to project root
  process.chdir(projectRoot);
  
  // Run all validation tests
  validatePackageJson();
  validateBuildOutput();
  await testNpmPack();
  await testMCPProtocol();
  await testPostinstallScript();
  await testDockerContainers();
  testTypeScriptCompilation();
  
  // Generate final report
  generateReport();
  
  // Exit with appropriate code
  const success = failedTests.length === 0;
  process.exit(success ? 0 : 1);
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation().catch((error) => {
    console.error('Validation runner error:', error);
    process.exit(1);
  });
}