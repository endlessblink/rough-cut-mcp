/**
 * Clean installation verification script
 * Replaces multiple verify-* scripts with centralized logic
 */

const fs = require('fs');
const path = require('path');
const pathUtils = require('./path-utils.cjs');

class InstallationVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
      case 'error':
        this.errors.push(logMessage);
        console.error(`❌ ${message}`);
        break;
      case 'warn':
        this.warnings.push(logMessage);
        console.warn(`⚠️  ${message}`);
        break;
      case 'info':
        this.info.push(logMessage);
        console.log(`ℹ️  ${message}`);
        break;
      case 'success':
        this.info.push(logMessage);
        console.log(`✅ ${message}`);
        break;
    }
  }

  /**
   * Check if build exists and is valid
   */
  checkBuildExists() {
    const buildPath = pathUtils.buildPath;
    
    if (!fs.existsSync(buildPath)) {
      this.log('error', `Build file not found: ${buildPath}`);
      return false;
    }

    // Check build content for WSL paths
    try {
      const buildContent = fs.readFileSync(buildPath, 'utf8');
      
      if (buildContent.includes('/mnt/')) {
        this.log('error', 'WSL paths found in build - this will cause failures on Windows!');
        this.log('error', 'Please rebuild using: .\\build-windows.ps1');
        return false;
      }

      this.log('success', 'Build file exists and is clean of WSL paths');
      return true;
    } catch (error) {
      this.log('error', `Cannot read build file: ${error.message}`);
      return false;
    }
  }

  /**
   * Check Claude Desktop configuration
   */
  checkClaudeConfig() {
    const configPath = pathUtils.claudeConfigPath;
    
    if (!fs.existsSync(configPath)) {
      this.log('warn', `Claude config not found: ${configPath}`);
      this.log('info', 'You may need to configure Claude Desktop manually');
      return false;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.mcpServers || !config.mcpServers['rough-cut-mcp']) {
        this.log('warn', 'RoughCut MCP server not configured in Claude Desktop');
        return false;
      }

      const mcpConfig = config.mcpServers['rough-cut-mcp'];
      const expectedPath = pathUtils.buildPath;

      // Check if the path matches what we expect
      if (mcpConfig.args && mcpConfig.args[0] !== expectedPath) {
        this.log('warn', `Claude config path mismatch:`);
        this.log('warn', `  Expected: ${expectedPath}`);
        this.log('warn', `  Actual: ${mcpConfig.args[0]}`);
        return false;
      }

      this.log('success', 'Claude Desktop configuration looks correct');
      return true;
    } catch (error) {
      this.log('error', `Cannot read Claude config: ${error.message}`);
      return false;
    }
  }

  /**
   * Check Node.js setup
   */
  checkNodeSetup() {
    const nodeCmd = pathUtils.nodeExecutable;
    
    try {
      const { execSync } = require('child_process');
      const nodeVersion = execSync(`"${nodeCmd}" --version`, { encoding: 'utf8' }).trim();
      
      this.log('success', `Node.js version: ${nodeVersion}`);
      
      // Check if it's the expected Windows Node.js
      if (pathUtils.isWindows && !nodeCmd.includes('Program Files')) {
        this.log('warn', 'Not using Windows Node.js installation');
        this.log('warn', 'Consider using Windows Node.js for production');
      }

      return true;
    } catch (error) {
      this.log('error', `Node.js check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check assets directory structure
   */
  checkAssetsStructure() {
    const requiredDirs = ['projects', 'videos', 'cache', 'temp', 'audio', 'images'];
    let allExist = true;

    for (const dir of requiredDirs) {
      const dirPath = pathUtils.resolvePath(`assets/${dir}`);
      
      if (!fs.existsSync(dirPath)) {
        this.log('warn', `Assets subdirectory missing: ${dir}`);
        allExist = false;
        
        // Try to create it
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          this.log('info', `Created directory: ${dir}`);
        } catch (error) {
          this.log('error', `Failed to create directory ${dir}: ${error.message}`);
        }
      }
    }

    if (allExist) {
      this.log('success', 'All required asset directories exist');
    }

    return true;
  }

  /**
   * Check package.json and dependencies
   */
  checkPackage() {
    const packagePath = pathUtils.resolvePath('package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.log('error', 'package.json not found');
      return false;
    }

    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (pkg.name !== 'rough-cut-mcp') {
        this.log('error', `Unexpected package name: ${pkg.name}`);
        return false;
      }

      this.log('success', `Package: ${pkg.name}@${pkg.version}`);

      // Check if node_modules exists
      const nodeModulesPath = pathUtils.resolvePath('node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        this.log('warn', 'node_modules not found - run npm install');
        return false;
      }

      this.log('success', 'Dependencies appear to be installed');
      return true;
    } catch (error) {
      this.log('error', `Cannot read package.json: ${error.message}`);
      return false;
    }
  }

  /**
   * Run all verification checks
   */
  async verify() {
    console.log('🔍 RoughCut MCP Installation Verification');
    console.log('==========================================');
    console.log('');

    // Environment info
    const env = pathUtils.environment;
    this.log('info', `Platform: ${env.platform}`);
    this.log('info', `WSL: ${env.isWSL}`);
    this.log('info', `Windows: ${env.isWindows}`);
    this.log('info', `Node: ${env.nodeVersion}`);
    this.log('info', `Project Root: ${env.projectRoot}`);
    console.log('');

    // Run checks
    const checks = [
      { name: 'Package & Dependencies', fn: () => this.checkPackage() },
      { name: 'Build File', fn: () => this.checkBuildExists() },
      { name: 'Assets Structure', fn: () => this.checkAssetsStructure() },
      { name: 'Node.js Setup', fn: () => this.checkNodeSetup() },
      { name: 'Claude Config', fn: () => this.checkClaudeConfig() },
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      console.log(`Running: ${check.name}`);
      try {
        const result = await check.fn();
        if (result) passed++;
        else failed++;
      } catch (error) {
        this.log('error', `${check.name} failed: ${error.message}`);
        failed++;
      }
      console.log('');
    }

    // Summary
    console.log('==========================================');
    console.log('📊 Verification Summary');
    console.log('==========================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log('');

    if (failed === 0) {
      console.log('🎉 All checks passed! RoughCut MCP should work correctly.');
    } else {
      console.log('🚨 Some checks failed. Please address the issues above.');
      
      if (this.errors.some(e => e.includes('WSL paths'))) {
        console.log('');
        console.log('💡 Quick fix for WSL path issues:');
        console.log('   1. Open Windows PowerShell');
        console.log('   2. Navigate to project directory');
        console.log('   3. Run: .\\build-windows.ps1');
      }
    }

    return failed === 0;
  }
}

// Run if called directly
if (require.main === module) {
  const verifier = new InstallationVerifier();
  verifier.verify().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = InstallationVerifier;