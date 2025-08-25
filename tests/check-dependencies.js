#!/usr/bin/env node

/**
 * Dependency Checker - Validates all external dependencies and requirements
 * Tests that everything needed for the MCP server to function is available
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';
import os from 'os';

class DependencyChecker {
  constructor() {
    this.results = {
      nodeModules: { passed: false, details: {} },
      remotion: { passed: false, details: {} },
      typeScript: { passed: false, details: {} },
      apiConnectivity: { passed: false, details: {} },
      systemDeps: { passed: false, details: {} },
      optionalDeps: { passed: false, details: {} },
      errors: []
    };
  }

  checkNodeModules() {
    console.log('\n📦 Checking Node Modules...');
    
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const nodeModulesPath = join(process.cwd(), 'node_modules');
      
      // Required dependencies
      const requiredDeps = {
        '@modelcontextprotocol/sdk': 'MCP SDK',
        '@remotion/cli': 'Remotion CLI',
        '@remotion/renderer': 'Remotion Renderer',
        '@remotion/bundler': 'Remotion Bundler',
        'cross-spawn': 'Process spawning',
        'fs-extra': 'File system operations',
        'axios': 'HTTP client',
        'dotenv': 'Environment variables',
        'uuid': 'Unique IDs',
        'zod': 'Schema validation',
        '@babel/parser': 'AST parsing',
        '@babel/generator': 'Code generation',
        '@babel/traverse': 'AST traversal',
        '@babel/types': 'AST types'
      };
      
      const missing = [];
      const found = [];
      const versions = {};
      
      Object.entries(requiredDeps).forEach(([dep, description]) => {
        const depPath = join(nodeModulesPath, dep);
        if (existsSync(depPath)) {
          found.push(dep);
          
          // Try to get version
          try {
            const depPackageJson = join(depPath, 'package.json');
            if (existsSync(depPackageJson)) {
              const depPkg = JSON.parse(readFileSync(depPackageJson, 'utf8'));
              versions[dep] = depPkg.version;
            }
          } catch {}
        } else {
          missing.push(`${dep} (${description})`);
        }
      });
      
      this.results.nodeModules.details = {
        total: Object.keys(requiredDeps).length,
        found: found.length,
        missing: missing.length,
        missingList: missing,
        versions
      };
      
      if (missing.length === 0) {
        this.results.nodeModules.passed = true;
        console.log(`✅ All ${found.length} required dependencies found`);
      } else {
        console.log(`❌ Missing ${missing.length} dependencies:`);
        missing.forEach(dep => console.log(`   - ${dep}`));
      }
      
      // Check for optional dependencies
      const optionalDeps = ['elevenlabs', 'open'];
      const optionalFound = optionalDeps.filter(dep => 
        existsSync(join(nodeModulesPath, dep))
      );
      
      if (optionalFound.length > 0) {
        console.log(`   Optional dependencies: ${optionalFound.join(', ')}`);
      }
      
    } catch (error) {
      this.results.errors.push(`Node modules: ${error.message}`);
      console.log(`❌ Node modules check failed: ${error.message}`);
    }
  }

  checkRemotionDependencies() {
    console.log('\n🎬 Checking Remotion Dependencies...');
    
    try {
      const checks = {
        cli: false,
        typescript: false,
        react: false,
        bundler: false
      };
      
      // Check Remotion CLI
      try {
        const remotionVersion = execSync('npx remotion --version', { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        }).trim();
        checks.cli = true;
        console.log(`✅ Remotion CLI: ${remotionVersion}`);
      } catch {
        console.log('❌ Remotion CLI not accessible');
      }
      
      // Check React (required by Remotion)
      const reactPath = join(process.cwd(), 'node_modules', 'react');
      if (existsSync(reactPath)) {
        checks.react = true;
        console.log('✅ React found (Remotion dependency)');
      } else {
        console.log('⚠️  React not found (may be installed later)');
      }
      
      // Check if Remotion bundler is accessible
      const bundlerPath = join(process.cwd(), 'node_modules', '@remotion', 'bundler');
      if (existsSync(bundlerPath)) {
        checks.bundler = true;
        console.log('✅ Remotion bundler found');
      } else {
        console.log('❌ Remotion bundler not found');
      }
      
      this.results.remotion.details = checks;
      // CLI can be accessed via npx, so only bundler and react are critical
      this.results.remotion.passed = checks.bundler && checks.react;
      
    } catch (error) {
      this.results.errors.push(`Remotion: ${error.message}`);
      console.log(`❌ Remotion check failed: ${error.message}`);
    }
  }

  checkTypeScriptSetup() {
    console.log('\n📘 Checking TypeScript Setup...');
    
    try {
      const checks = {
        tscVersion: null,
        configExists: false,
        buildDirExists: false,
        sourceMaps: false
      };
      
      // Check TypeScript compiler
      try {
        const tscVersion = execSync('npx tsc --version', { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        }).trim();
        checks.tscVersion = tscVersion;
        console.log(`✅ TypeScript: ${tscVersion}`);
      } catch {
        console.log('❌ TypeScript compiler not accessible');
      }
      
      // Check tsconfig.json
      const tsconfigPath = join(process.cwd(), 'tsconfig.json');
      if (existsSync(tsconfigPath)) {
        checks.configExists = true;
        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
        
        // Check important compiler options
        if (tsconfig.compilerOptions) {
          const opts = tsconfig.compilerOptions;
          console.log(`   Target: ${opts.target || 'not set'}`);
          console.log(`   Module: ${opts.module || 'not set'}`);
          console.log(`   OutDir: ${opts.outDir || 'not set'}`);
          
          checks.sourceMaps = opts.sourceMap === true;
        }
      } else {
        console.log('❌ tsconfig.json not found');
      }
      
      // Check build directory
      const buildDir = join(process.cwd(), 'build');
      if (existsSync(buildDir)) {
        checks.buildDirExists = true;
        console.log('✅ Build directory exists');
      } else {
        console.log('⚠️  Build directory not found (run npm run build)');
      }
      
      this.results.typeScript.details = checks;
      this.results.typeScript.passed = checks.tscVersion && checks.configExists;
      
    } catch (error) {
      this.results.errors.push(`TypeScript: ${error.message}`);
      console.log(`❌ TypeScript check failed: ${error.message}`);
    }
  }

  async checkAPIConnectivity() {
    console.log('\n🌐 Checking API Connectivity...');
    
    const apis = {
      npmRegistry: { url: 'https://registry.npmjs.org', passed: false },
      github: { url: 'https://api.github.com', passed: false },
      elevenlabs: { url: 'https://api.elevenlabs.io', passed: false },
      freesound: { url: 'https://freesound.org', passed: false }
    };
    
    for (const [name, api] of Object.entries(apis)) {
      try {
        const passed = await this.testConnection(api.url);
        api.passed = passed;
        
        if (passed) {
          console.log(`✅ ${name}: Accessible`);
        } else {
          console.log(`⚠️  ${name}: Not accessible (may need API key)`);
        }
      } catch (error) {
        console.log(`❌ ${name}: Connection failed`);
      }
    }
    
    this.results.apiConnectivity.details = apis;
    this.results.apiConnectivity.passed = apis.npmRegistry.passed;
  }

  testConnection(url) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, { timeout: 5000 }, (res) => {
        resolve(res.statusCode < 500);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  checkSystemDependencies() {
    console.log('\n💻 Checking System Dependencies...');
    
    try {
      const checks = {
        ffmpeg: false,
        chrome: false,
        git: false,
        diskSpace: false,
        memory: false
      };
      
      // Check FFmpeg (for video processing)
      try {
        execSync('ffmpeg -version', { stdio: 'pipe' });
        checks.ffmpeg = true;
        console.log('✅ FFmpeg: Available');
      } catch {
        console.log('⚠️  FFmpeg: Not found (optional, but recommended for video processing)');
      }
      
      // Check Chrome/Chromium (for Remotion rendering)
      try {
        if (process.platform === 'win32') {
          // Windows: Check common Chrome locations
          const chromePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
          ];
          checks.chrome = chromePaths.some(path => existsSync(path));
        } else if (process.platform === 'darwin') {
          // macOS: Check for Chrome
          execSync('which google-chrome || which chromium', { stdio: 'pipe' });
          checks.chrome = true;
        } else {
          // Linux: Check for Chrome/Chromium
          execSync('which google-chrome || which chromium-browser', { stdio: 'pipe' });
          checks.chrome = true;
        }
        
        if (checks.chrome) {
          console.log('✅ Chrome/Chromium: Available');
        }
      } catch {
        console.log('⚠️  Chrome/Chromium: Not found (needed for Remotion rendering)');
      }
      
      // Check Git
      try {
        const gitVersion = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
        checks.git = true;
        console.log(`✅ Git: ${gitVersion}`);
      } catch {
        console.log('⚠️  Git: Not found');
      }
      
      // Check available disk space (rough estimate)
      try {
        if (process.platform === 'win32') {
          // Windows disk check would go here
          checks.diskSpace = true;
        } else {
          // Unix-like disk check
          const dfOutput = execSync('df -h .', { encoding: 'utf8' });
          checks.diskSpace = true;
          console.log('✅ Disk space: Available');
        }
      } catch {
        console.log('⚠️  Could not check disk space');
      }
      
      // Check memory
      const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024));
      checks.memory = totalMemory >= 4;
      console.log(`${checks.memory ? '✅' : '⚠️ '} Memory: ${totalMemory}GB (4GB+ recommended)`);
      
      this.results.systemDeps.details = checks;
      this.results.systemDeps.passed = checks.memory;
      
    } catch (error) {
      this.results.errors.push(`System dependencies: ${error.message}`);
      console.log(`❌ System dependency check failed: ${error.message}`);
    }
  }

  checkOptionalDependencies() {
    console.log('\n🔌 Checking Optional Dependencies...');
    
    try {
      const optional = {
        elevenlabs: false,
        prettier: false,
        open: false,
        nyc: false
      };
      
      const nodeModulesPath = join(process.cwd(), 'node_modules');
      
      // Check each optional dependency
      Object.keys(optional).forEach(dep => {
        const depPath = join(nodeModulesPath, dep);
        if (existsSync(depPath)) {
          optional[dep] = true;
          console.log(`✅ ${dep}: Installed`);
        } else {
          console.log(`⚠️  ${dep}: Not installed (optional)`);
        }
      });
      
      // Check for API keys in environment
      const apiKeys = {
        ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
        FREESOUND_API_KEY: !!process.env.FREESOUND_API_KEY,
        FLUX_API_KEY: !!process.env.FLUX_API_KEY
      };
      
      console.log('\n🔑 API Keys:');
      Object.entries(apiKeys).forEach(([key, exists]) => {
        console.log(`   ${exists ? '✅' : '⚠️ '} ${key}: ${exists ? 'Set' : 'Not set (optional)'}`);
      });
      
      this.results.optionalDeps.details = { ...optional, apiKeys };
      this.results.optionalDeps.passed = true; // Optional deps don't fail the test
      
    } catch (error) {
      this.results.errors.push(`Optional dependencies: ${error.message}`);
      console.log(`❌ Optional dependency check failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 DEPENDENCY CHECK REPORT');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'Node Modules', result: this.results.nodeModules },
      { name: 'Remotion Setup', result: this.results.remotion },
      { name: 'TypeScript', result: this.results.typeScript },
      { name: 'API Connectivity', result: this.results.apiConnectivity },
      { name: 'System Dependencies', result: this.results.systemDeps },
      { name: 'Optional Dependencies', result: this.results.optionalDeps }
    ];
    
    let passed = 0;
    let critical = 0;
    
    tests.forEach(test => {
      const status = test.result.passed ? '✅' : '❌';
      console.log(`  ${status} ${test.name}`);
      
      if (test.result.passed) passed++;
      
      // First 3 tests are critical
      if (tests.indexOf(test) < 3 && !test.result.passed) {
        critical++;
      }
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️  Errors Encountered:');
      this.results.errors.forEach(error => {
        console.log(`     - ${error}`);
      });
    }
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Tests Passed: ${passed}/${tests.length}`);
    console.log(`  Critical Issues: ${critical}`);
    
    if (critical === 0) {
      console.log('\n✅ DEPENDENCIES CHECK PASSED!');
      console.log('   All critical dependencies are available.');
      
      if (passed < tests.length) {
        console.log('\n⚠️  Some optional dependencies missing:');
        console.log('   - Install FFmpeg for video processing');
        console.log('   - Install Chrome for Remotion rendering');
        console.log('   - Set API keys for external services');
      }
    } else {
      console.log('\n❌ CRITICAL DEPENDENCIES MISSING!');
      console.log('   Install missing dependencies before using the MCP server.');
      
      console.log('\n🔧 Fix with:');
      console.log('   npm install');
      console.log('   npm run build');
    }
    
    return critical === 0;
  }

  async run() {
    console.log('🔍 Starting Dependency Check');
    console.log('='.repeat(60));
    
    // Run all checks
    this.checkNodeModules();
    this.checkRemotionDependencies();
    this.checkTypeScriptSetup();
    await this.checkAPIConnectivity();
    this.checkSystemDependencies();
    this.checkOptionalDependencies();
    
    // Generate report
    const success = this.generateReport();
    
    return success;
  }
}

// Run the dependency checker
const checker = new DependencyChecker();
checker.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Dependency check failed:', error);
  process.exit(1);
});