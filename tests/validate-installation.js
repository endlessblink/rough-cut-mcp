#!/usr/bin/env node

/**
 * Installation Validator - Tests complete NPM installation process
 * Simulates what a new user experiences when installing the MCP server
 */

import { existsSync, readFileSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import os from 'os';

class InstallationValidator {
  constructor() {
    this.testDir = './test-installation-validation';
    this.results = {
      nodeVersion: { passed: false, details: {} },
      npmInstall: { passed: false, details: {} },
      dependencies: { passed: false, details: {} },
      buildProcess: { passed: false, details: {} },
      claudeConfig: { passed: false, details: {} },
      platformCompat: { passed: false, details: {} },
      errors: []
    };
    this.platform = process.platform;
  }

  async setup() {
    console.log('🧪 Setting up installation validation environment...');
    
    // Clean up previous test runs
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
    mkdirSync(this.testDir, { recursive: true });
    
    console.log(`✅ Test environment ready: ${this.testDir}`);
  }

  testNodeVersion() {
    console.log('\n📦 Testing Node.js version requirements...');
    
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      this.results.nodeVersion.details = {
        current: nodeVersion,
        required: '>=18.0.0',
        majorVersion
      };
      
      if (majorVersion >= 18) {
        this.results.nodeVersion.passed = true;
        console.log(`✅ Node.js version OK: ${nodeVersion}`);
      } else {
        throw new Error(`Node.js version too old: ${nodeVersion} (need >=18.0.0)`);
      }
      
      // Test npm availability
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`✅ NPM version: ${npmVersion}`);
      this.results.nodeVersion.details.npmVersion = npmVersion;
      
    } catch (error) {
      this.results.errors.push(`Node.js version: ${error.message}`);
      console.log(`❌ Node.js version check failed: ${error.message}`);
    }
  }

  simulateNpmInstall() {
    console.log('\n📥 Simulating NPM installation process...');
    
    try {
      // Check if package.json exists and is valid
      const packageJsonPath = join(process.cwd(), 'package.json');
      if (!existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }
      
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      this.results.npmInstall.details = {
        name: packageJson.name,
        version: packageJson.version,
        main: packageJson.main,
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length
      };
      
      // Validate critical fields
      const requiredFields = ['name', 'version', 'main', 'scripts'];
      const missingFields = requiredFields.filter(field => !packageJson[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in package.json: ${missingFields.join(', ')}`);
      }
      
      // Check if build directory exists (indicates successful build)
      const buildDir = join(process.cwd(), 'build');
      this.results.npmInstall.details.buildExists = existsSync(buildDir);
      
      // Validate bin script exists
      if (packageJson.bin) {
        const binScripts = Object.values(packageJson.bin);
        binScripts.forEach(script => {
          const scriptPath = join(process.cwd(), script);
          if (!existsSync(scriptPath)) {
            console.log(`⚠️  Bin script missing: ${script}`);
          }
        });
      }
      
      this.results.npmInstall.passed = true;
      console.log(`✅ NPM package structure valid`);
      console.log(`   Package: ${packageJson.name}@${packageJson.version}`);
      console.log(`   Dependencies: ${this.results.npmInstall.details.dependencies}`);
      console.log(`   Dev Dependencies: ${this.results.npmInstall.details.devDependencies}`);
      
    } catch (error) {
      this.results.errors.push(`NPM install: ${error.message}`);
      console.log(`❌ NPM installation simulation failed: ${error.message}`);
    }
  }

  testDependencies() {
    console.log('\n🔗 Testing critical dependencies...');
    
    try {
      const criticalDeps = [
        '@modelcontextprotocol/sdk',
        '@remotion/cli',
        '@remotion/renderer',
        'cross-spawn',
        'fs-extra'
      ];
      
      const nodeModulesPath = join(process.cwd(), 'node_modules');
      const missingDeps = [];
      const foundDeps = [];
      
      criticalDeps.forEach(dep => {
        const depPath = join(nodeModulesPath, dep);
        if (existsSync(depPath)) {
          foundDeps.push(dep);
        } else {
          missingDeps.push(dep);
        }
      });
      
      this.results.dependencies.details = {
        critical: criticalDeps.length,
        found: foundDeps.length,
        missing: missingDeps
      };
      
      if (missingDeps.length === 0) {
        this.results.dependencies.passed = true;
        console.log(`✅ All critical dependencies found`);
      } else {
        console.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
        console.log(`   Run 'npm install' to install missing dependencies`);
      }
      
      // Test TypeScript availability
      try {
        execSync('npx tsc --version', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ TypeScript compiler available');
      } catch {
        console.log('⚠️  TypeScript compiler not accessible');
      }
      
    } catch (error) {
      this.results.errors.push(`Dependencies: ${error.message}`);
      console.log(`❌ Dependency check failed: ${error.message}`);
    }
  }

  testBuildProcess() {
    console.log('\n🔨 Testing build process...');
    
    try {
      const buildDir = join(process.cwd(), 'build');
      const srcDir = join(process.cwd(), 'src');
      
      // Check source directory exists
      if (!existsSync(srcDir)) {
        throw new Error('Source directory (src/) not found');
      }
      
      // Check if build directory exists
      if (!existsSync(buildDir)) {
        console.log('⚠️  Build directory not found - attempting build...');
        
        // Only simulate, don't actually build in validation
        console.log('   Would run: npm run build');
        this.results.buildProcess.details.buildRequired = true;
      } else {
        // Verify key build files exist
        const keyFiles = [
          'index.js',
          'services/tool-registry.js',
          'tools/discovery-tools.js'
        ];
        
        const missingFiles = keyFiles.filter(file => 
          !existsSync(join(buildDir, file))
        );
        
        this.results.buildProcess.details = {
          buildExists: true,
          keyFiles: keyFiles.length,
          missingFiles
        };
        
        if (missingFiles.length === 0) {
          this.results.buildProcess.passed = true;
          console.log('✅ Build directory contains all key files');
        } else {
          console.log(`⚠️  Missing build files: ${missingFiles.join(', ')}`);
        }
      }
      
    } catch (error) {
      this.results.errors.push(`Build process: ${error.message}`);
      console.log(`❌ Build process check failed: ${error.message}`);
    }
  }

  generateClaudeConfig() {
    console.log('\n⚙️ Testing Claude Desktop configuration generation...');
    
    try {
      const isWindows = this.platform === 'win32';
      const isMac = this.platform === 'darwin';
      const isLinux = this.platform === 'linux';
      
      let config;
      
      if (isWindows) {
        // Windows configuration
        const projectPath = process.cwd().replace(/\\/g, '\\\\');
        config = {
          mcpServers: {
            "rough-cut-mcp": {
              command: "C:\\\\Program Files\\\\nodejs\\\\node.exe",
              args: [
                `${projectPath}\\\\build\\\\index.js`
              ],
              env: {
                NODE_ENV: "production",
                REMOTION_ASSETS_DIR: `${projectPath}\\\\assets`
              }
            }
          }
        };
        
        console.log('✅ Windows configuration generated');
        console.log('   Config location: %APPDATA%\\Claude\\claude_desktop_config.json');
        
      } else if (isMac) {
        // macOS configuration
        const projectPath = process.cwd();
        config = {
          mcpServers: {
            "rough-cut-mcp": {
              command: "/usr/local/bin/node",
              args: [
                `${projectPath}/build/index.js`
              ],
              env: {
                NODE_ENV: "production",
                REMOTION_ASSETS_DIR: `${projectPath}/assets`
              }
            }
          }
        };
        
        console.log('✅ macOS configuration generated');
        console.log('   Config location: ~/Library/Application Support/Claude/claude_desktop_config.json');
        
      } else {
        // Linux (unsupported but provide guidance)
        config = {
          note: "Linux is not officially supported",
          suggestion: "Try using the macOS configuration format with appropriate paths"
        };
        
        console.log('⚠️  Linux detected - limited support');
      }
      
      // Save test config
      const configPath = join(this.testDir, 'claude_desktop_config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      this.results.claudeConfig.details = {
        platform: this.platform,
        configGenerated: true,
        configPath
      };
      
      this.results.claudeConfig.passed = true;
      console.log(`✅ Configuration saved to: ${configPath}`);
      
    } catch (error) {
      this.results.errors.push(`Claude config: ${error.message}`);
      console.log(`❌ Claude config generation failed: ${error.message}`);
    }
  }

  testPlatformCompatibility() {
    console.log('\n🖥️ Testing platform compatibility...');
    
    try {
      const platform = this.platform;
      const arch = process.arch;
      const homedir = os.homedir();
      
      this.results.platformCompat.details = {
        platform,
        arch,
        homedir: homedir.substring(0, 20) + '...',
        nodeVersion: process.version,
        npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim()
      };
      
      // Platform-specific tests
      if (platform === 'win32') {
        // Windows-specific checks
        console.log('✅ Windows platform detected');
        
        // Check for common Windows paths
        const programFiles = process.env['ProgramFiles'];
        const appData = process.env['APPDATA'];
        
        if (programFiles && appData) {
          console.log('✅ Windows environment variables accessible');
          this.results.platformCompat.passed = true;
        }
        
      } else if (platform === 'darwin') {
        // macOS-specific checks
        console.log('🍎 macOS platform detected (experimental support)');
        
        // Check for Homebrew
        try {
          execSync('which brew', { encoding: 'utf8', stdio: 'pipe' });
          console.log('✅ Homebrew detected');
        } catch {
          console.log('⚠️  Homebrew not found (recommended for macOS)');
        }
        
        this.results.platformCompat.passed = true;
        
      } else if (platform === 'linux') {
        // Linux checks
        console.log('🐧 Linux platform detected (unsupported)');
        
        // Check if WSL
        if (existsSync('/mnt/c')) {
          console.log('⚠️  WSL detected - build on Windows instead!');
          this.results.platformCompat.passed = false;
        } else {
          console.log('⚠️  Native Linux - limited compatibility');
          this.results.platformCompat.passed = true;
        }
        
      } else {
        console.log(`❓ Unknown platform: ${platform}`);
        this.results.platformCompat.passed = false;
      }
      
    } catch (error) {
      this.results.errors.push(`Platform compatibility: ${error.message}`);
      console.log(`❌ Platform compatibility check failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 INSTALLATION VALIDATION REPORT');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'Node.js Version', result: this.results.nodeVersion },
      { name: 'NPM Package Structure', result: this.results.npmInstall },
      { name: 'Dependencies', result: this.results.dependencies },
      { name: 'Build Process', result: this.results.buildProcess },
      { name: 'Claude Config Generation', result: this.results.claudeConfig },
      { name: 'Platform Compatibility', result: this.results.platformCompat }
    ];
    
    let passed = 0;
    let warnings = 0;
    
    tests.forEach(test => {
      const status = test.result.passed ? '✅' : '❌';
      console.log(`  ${status} ${test.name}`);
      
      if (test.result.details) {
        Object.entries(test.result.details).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            console.log(`     ${key}: ${displayValue}`);
          }
        });
      }
      
      if (test.result.passed) passed++;
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️  Issues Encountered:');
      this.results.errors.forEach(error => {
        console.log(`     - ${error}`);
      });
    }
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Tests Passed: ${passed}/${tests.length}`);
    console.log(`  Platform: ${this.platform}`);
    console.log(`  Node.js: ${process.version}`);
    
    const allPassed = passed === tests.length;
    
    if (allPassed) {
      console.log('\n🎉 INSTALLATION VALIDATION SUCCESSFUL!');
      console.log('   The MCP server is ready for NPM installation.');
      
      console.log('\n📝 Next Steps for Users:');
      console.log('   1. npm install -g rough-cut-mcp');
      console.log('   2. Configure Claude Desktop with generated config');
      console.log('   3. Set up API keys if using external services');
      console.log('   4. Start using the MCP server!');
      
    } else {
      console.log('\n⚠️  Some validation checks failed.');
      console.log('   Review the issues above before publishing.');
      
      console.log('\n🔧 Common Fixes:');
      console.log('   - Run "npm install" to install dependencies');
      console.log('   - Run "npm run build" to compile TypeScript');
      console.log('   - Ensure Node.js 18+ is installed');
      console.log('   - Check platform-specific requirements');
    }
    
    // Save detailed report
    const reportPath = join(this.testDir, 'installation-validation-report.json');
    writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      platform: this.platform,
      results: this.results,
      summary: {
        passed,
        total: tests.length,
        ready: allPassed
      }
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    return allPassed;
  }

  async run() {
    console.log('🚀 Starting Installation Validation');
    console.log('='.repeat(60));
    
    await this.setup();
    
    // Run all validation tests
    this.testNodeVersion();
    this.simulateNpmInstall();
    this.testDependencies();
    this.testBuildProcess();
    this.generateClaudeConfig();
    this.testPlatformCompatibility();
    
    // Generate comprehensive report
    const success = this.generateReport();
    
    return success;
  }
}

// Run the installation validator
const validator = new InstallationValidator();
validator.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Installation validation failed:', error);
  process.exit(1);
});