/**
 * Cross-platform build script
 * Works in both WSL2 development and Windows production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Builder {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.isWSL = this.detectWSL();
    this.isWindows = process.platform === 'win32';
    this.buildStartTime = Date.now();
  }

  findProjectRoot() {
    let currentDir = __dirname;
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'));
        if (pkg.name === 'rough-cut-mcp') {
          return currentDir;
        }
      }
      currentDir = path.dirname(currentDir);
    }
    return path.resolve(__dirname, '..');
  }

  detectWSL() {
    try {
      return process.platform === 'linux' && 
             (fs.existsSync('/mnt/c') || 
              process.env.WSL_DISTRO_NAME !== undefined);
    } catch {
      return false;
    }
  }

  log(message, level = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warn: '\x1b[33m',
      reset: '\x1b[0m'
    };

    const timestamp = new Date().toISOString().slice(11, 19);
    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  /**
   * Clean previous build
   */
  cleanBuild() {
    const buildDir = path.join(this.projectRoot, 'build');
    
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
      this.log('Removed old build directory', 'success');
    } else {
      this.log('No build directory to clean', 'info');
    }
    return true; // Always return success
  }

  /**
   * Check Node.js version and location
   */
  checkNodeJs() {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      
      this.log(`Node.js: ${nodeVersion}`, 'info');
      this.log(`npm: ${npmVersion}`, 'info');

      // Check for Windows Node.js when building for production
      if (process.env.NODE_ENV === 'production' && this.isWSL) {
        const which = execSync('which node', { encoding: 'utf8' }).trim();
        if (!which.includes('/mnt/c/Program Files') && !which.includes('Program Files')) {
          this.log('Warning: Not using Windows Node.js for production build', 'warn');
          this.log('Consider using Windows Node.js for maximum compatibility', 'warn');
        }
      }

      return true;
    } catch (error) {
      this.log(`Node.js check failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Install dependencies if needed
   */
  checkDependencies() {
    const nodeModulesDir = path.join(this.projectRoot, 'node_modules');
    
    if (!fs.existsSync(nodeModulesDir)) {
      this.log('Installing dependencies...', 'info');
      try {
        execSync('npm install', { 
          cwd: this.projectRoot, 
          stdio: 'inherit' 
        });
        this.log('Dependencies installed', 'success');
      } catch (error) {
        this.log(`Dependency installation failed: ${error.message}`, 'error');
        return false;
      }
    } else {
      this.log('Dependencies already installed', 'info');
    }
    return true;
  }

  /**
   * Run TypeScript build
   */
  buildTypeScript() {
    this.log('Building TypeScript...', 'info');
    
    try {
      // Set environment to ensure Windows-compatible paths in production
      const env = { 
        ...process.env, 
        NODE_ENV: process.env.NODE_ENV || 'production',
        FORCE_WINDOWS_PATHS: 'true' 
      };

      execSync('npm run build', { 
        cwd: this.projectRoot, 
        stdio: 'inherit',
        env
      });
      
      this.log('TypeScript build successful', 'success');
      return true;
    } catch (error) {
      this.log(`TypeScript build failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Validate build output
   */
  validateBuild() {
    const buildPath = path.join(this.projectRoot, 'build', 'index.js');
    
    if (!fs.existsSync(buildPath)) {
      this.log('Build file not found', 'error');
      return false;
    }

    try {
      const buildContent = fs.readFileSync(buildPath, 'utf8');
      
      // Check for WSL paths
      const wslPathRegex = /\/mnt\/[a-z]\//g;
      const wslMatches = buildContent.match(wslPathRegex);
      
      if (wslMatches) {
        this.log(`WSL paths found in build: ${wslMatches.length} instances`, 'error');
        this.log('This will cause failures on Windows machines!', 'error');
        
        // Show first few matches
        const lines = buildContent.split('\n');
        let foundCount = 0;
        for (let i = 0; i < lines.length && foundCount < 3; i++) {
          if (lines[i].includes('/mnt/')) {
            this.log(`  Line ${i + 1}: ${lines[i].substring(0, 100)}...`, 'error');
            foundCount++;
          }
        }
        return false;
      }

      // Check for basic MCP structure
      if (!buildContent.includes('mcp/server')) {
        this.log('Build does not contain MCP server structure', 'warn');
      }

      const sizeKB = Math.round(buildContent.length / 1024);
      this.log(`Build validation passed (${sizeKB}KB)`, 'success');
      return true;

    } catch (error) {
      this.log(`Build validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Ensure asset directories exist
   */
  ensureAssetDirs() {
    const requiredDirs = ['assets/cache', 'assets/temp', 'assets/projects', 'assets/videos'];
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.log(`Created: ${dir}`, 'info');
      }
    }
    
    this.log('Asset directories ready', 'success');
  }

  /**
   * Main build process
   */
  async build() {
    this.log('🏗️  RoughCut MCP Build System', 'info');
    this.log('=' .repeat(50), 'info');
    
    // Environment info
    this.log(`Platform: ${process.platform}`, 'info');
    this.log(`WSL: ${this.isWSL}`, 'info');
    this.log(`Windows: ${this.isWindows}`, 'info');
    this.log(`Project: ${this.projectRoot}`, 'info');
    this.log('', 'info');

    const steps = [
      { name: 'Check Node.js', fn: () => this.checkNodeJs() },
      { name: 'Clean build', fn: () => this.cleanBuild() },
      { name: 'Check dependencies', fn: () => this.checkDependencies() },
      { name: 'Build TypeScript', fn: () => this.buildTypeScript() },
      { name: 'Validate build', fn: () => this.validateBuild() },
      { name: 'Ensure assets', fn: () => this.ensureAssetDirs() },
    ];

    for (const step of steps) {
      this.log(`Step: ${step.name}`, 'info');
      
      try {
        const success = step.fn();
        if (!success) {
          this.log(`❌ ${step.name} failed`, 'error');
          return false;
        }
      } catch (error) {
        this.log(`❌ ${step.name} error: ${error.message}`, 'error');
        return false;
      }
      
      this.log('', 'info');
    }

    const duration = Date.now() - this.buildStartTime;
    this.log('=' .repeat(50), 'success');
    this.log(`✅ Build completed successfully in ${duration}ms`, 'success');
    this.log('=' .repeat(50), 'success');
    this.log('', 'info');
    
    this.log('Next steps:', 'info');
    this.log('• Test: npm test', 'info');
    this.log('• Verify: npm run test:verify', 'info');
    this.log('• Configure: Update Claude Desktop with path below', 'info');
    this.log(`• MCP Path: ${path.join(this.projectRoot, 'build', 'index.js')}`, 'info');

    return true;
  }
}

// Run if called directly
if (require.main === module) {
  const builder = new Builder();
  builder.build().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
  });
}

module.exports = Builder;