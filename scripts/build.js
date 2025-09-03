#!/usr/bin/env node

/**
 * Remotion MCP Server - Cross-Platform Build Script
 * Complements the Windows-specific build-windows.ps1
 * Works on Windows, macOS, and Linux
 */

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function detectPlatform() {
  const platform = os.platform();
  const isWSL = process.env.WSL_DISTRO_NAME || (
    platform === 'linux' && fs.existsSync('/proc/version') &&
    fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')
  );
  
  return {
    platform,
    isWindows: platform === 'win32',
    isMacOS: platform === 'darwin',
    isLinux: platform === 'linux',
    isWSL: !!isWSL
  };
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    log('blue', `Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function validateNodeVersion() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['--version'], { stdio: 'pipe' });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        const version = output.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        if (majorVersion >= 18) {
          log('green', `✅ Node.js version: ${version}`);
          resolve({ version, majorVersion });
        } else {
          reject(new Error(`Node.js v18+ required. Found: ${version}`));
        }
      } else {
        reject(new Error('Node.js not found. Please install Node.js v18+.'));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error('Node.js not found. Please install Node.js v18+.'));
    });
  });
}

async function validateTypeScript() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['tsc', '--version'], { stdio: 'pipe', shell: true });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        const version = output.trim();
        log('green', `✅ TypeScript: ${version}`);
        resolve(version);
      } else {
        reject(new Error('TypeScript not found. Run `npm install` first.'));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error('TypeScript not found. Run `npm install` first.'));
    });
  });
}

async function validateBuildOutput(buildPath) {
  if (!fs.existsSync(buildPath)) {
    throw new Error('Build file not found after compilation!');
  }
  
  const buildContent = await fs.readFile(buildPath, 'utf8');
  
  // Check for problematic WSL paths that would break Windows execution
  const wslPathPattern = /\/mnt\/[cd]\//g;
  if (wslPathPattern.test(buildContent)) {
    log('red', '❌ CRITICAL: WSL paths found in build!');
    log('red', 'This will break Windows execution. Build aborted.');
    throw new Error('WSL paths detected in build output');
  }
  
  // Show build statistics
  const buildStats = fs.statSync(buildPath);
  const sizeKB = Math.round(buildStats.size / 1024 * 10) / 10;
  log('blue', `Build size: ${sizeKB} KB`);
  
  return true;
}

async function main() {
  try {
    log('cyan', '🔧 Remotion MCP Server - Cross-Platform Build');
    log('white', '='.repeat(48));
    
    const platform = detectPlatform();
    log('blue', `Platform: ${platform.platform}${platform.isWSL ? ' (WSL)' : ''}`);
    
    // WSL2 Detection and Warning (not blocking like Windows script)
    if (platform.isWSL) {
      log('yellow', '⚠️  WSL2 detected - build output will be validated for Windows compatibility');
    }
    
    // Check if we're in the right directory
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found. Please run this script from the project root directory.');
    }
    
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.name !== 'rough-cut-mcp') {
      log('yellow', '⚠️  Warning: Not in expected project directory, but continuing...');
    }
    
    // Validate prerequisites
    log('yellow', '🔍 Checking prerequisites...');
    await validateNodeVersion();
    await validateTypeScript();
    
    // Clean build directory
    const buildDir = path.join(currentDir, 'build');
    if (fs.existsSync(buildDir)) {
      await fs.remove(buildDir);
      log('yellow', '🧹 Cleaned build directory');
    }
    
    // Ensure assets directory exists
    const assetsDir = path.join(currentDir, 'assets', 'projects');
    await fs.ensureDir(assetsDir);
    log('blue', '📁 Assets directory ready');
    
    // Compile TypeScript
    log('yellow', '⚙️  Compiling TypeScript...');
    await runCommand('npx', ['tsc']);
    
    // Validate build output
    const buildPath = path.join(buildDir, 'index.js');
    log('yellow', '🔍 Validating build output...');
    await validateBuildOutput(buildPath);
    
    log('green', '✅ Build successful!');
    log('blue', `Entry point: ${buildPath}`);
    
    // Display usage information
    log('cyan', '\\n🎯 Build completed successfully!');
    log('yellow', 'Usage:');
    log('white', '• Test server: node build/index.js');
    log('white', '• Setup Claude Desktop: node setup.js');
    log('white', '• Use existing Windows tools: build-windows.ps1, setup-windows.ps1');
    
    // Platform-specific notes
    if (platform.isWindows) {
      log('yellow', '\\n💡 Windows Note:');
      log('white', 'You can also use build-windows.ps1 for PowerShell experience');
    } else {
      log('yellow', '\\n💡 Cross-Platform Note:');
      log('white', 'Build output validated for Windows compatibility');
    }
    
  } catch (error) {
    log('red', `❌ Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Remotion MCP Server - Cross-Platform Build

Usage: node build.js [options]

Options:
  --help, -h    Show this help message
  
This script will:
1. Detect your platform and validate prerequisites
2. Clean the build directory
3. Compile TypeScript source
4. Validate build output for cross-platform compatibility
5. Prepare assets directory

For Windows users: You can also use build-windows.ps1 for a PowerShell experience.
`);
  process.exit(0);
}

// Run build
if (require.main === module) {
  main().catch((error) => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { detectPlatform, validateNodeVersion, validateTypeScript };