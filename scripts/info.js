#!/usr/bin/env node

/**
 * Rough Cut MCP - Info Tool
 * Shows version and build information
 */

const fs = require('fs-extra');
const path = require('path');
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

function findGlobalPackagePath() {
  const packageName = 'rough-cut-mcp';
  
  // Method 1: Script location (most reliable for global installs)
  try {
    const scriptDir = __dirname;
    const packageJsonPath = path.join(scriptDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);
      if (packageJson.name === packageName) {
        return scriptDir;
      }
    }
  } catch (error) {
    // Continue with other methods
  }
  
  // Method 2: npm root -g
  try {
    const { execSync } = require('child_process');
    const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const npmGlobalPath = path.join(npmRoot, packageName);
    
    if (fs.existsSync(npmGlobalPath)) {
      return npmGlobalPath;
    }
  } catch (error) {
    // Continue
  }
  
  return null;
}

async function main() {
  try {
    log('cyan', '📋 Rough Cut MCP - Package Information');
    log('white', '='.repeat(45));
    
    const platform = detectPlatform();
    log('blue', `Platform: ${platform.platform}${platform.isWSL ? ' (WSL)' : ''}`);
    
    // Find package installation
    const packagePath = findGlobalPackagePath();
    
    if (packagePath) {
      log('green', `✅ Package found: ${packagePath}`);
      
      // Read package.json for version info
      const packageJsonPath = path.join(packagePath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);
        
        log('white', '\\n📦 Package Details:');
        log('blue', `   Name: ${packageJson.name}`);
        log('blue', `   Version: ${packageJson.version}`);
        log('blue', `   Description: ${packageJson.description}`);
        
        if (packageJson.homepage) {
          log('blue', `   Homepage: ${packageJson.homepage}`);
        }
        
        if (packageJson.repository) {
          log('blue', `   Repository: ${packageJson.repository.url}`);
        }
        
        // Check build status
        const buildPath = path.join(packagePath, 'build', 'index.js');
        if (fs.existsSync(buildPath)) {
          const buildStats = fs.statSync(buildPath);
          const sizeKB = Math.round(buildStats.size / 1024 * 10) / 10;
          log('green', `\\n✅ MCP Server Built:`);
          log('blue', `   Path: ${buildPath}`);
          log('blue', `   Size: ${sizeKB} KB`);
          log('blue', `   Modified: ${buildStats.mtime.toLocaleString()}`);
        } else {
          log('red', '❌ MCP Server not built');
          log('yellow', '   Run: rough-cut-build');
        }
        
        // Available commands
        log('white', '\\n🛠️ Available Commands:');
        if (packageJson.bin) {
          Object.keys(packageJson.bin).forEach(command => {
            log('blue', `   ${command}`);
          });
        }
        
        // Installation info
        log('white', '\\n📍 Installation:');
        log('blue', `   Global install: npm install -g ${packageJson.name}`);
        log('blue', `   Setup: rough-cut-setup`);
        log('blue', `   Debug: rough-cut-debug`);
        
        // Node.js info
        log('white', '\\n🔧 Runtime:');
        log('blue', `   Node.js: ${process.version}`);
        log('blue', `   Platform: ${process.platform} ${process.arch}`);
        
      } else {
        log('red', '❌ Package.json not found');
      }
      
    } else {
      log('red', '❌ Package not found');
      log('yellow', 'Install with: npm install -g rough-cut-mcp');
    }
    
  } catch (error) {
    log('red', `Error: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Rough Cut MCP - Package Information

Usage: rough-cut-info [options]

Options:
  --help, -h    Show this help message
  
This tool shows:
- Package version and details
- Installation location and status
- Build information and size
- Available commands
- Runtime environment details

Use this to verify your rough-cut-mcp installation.
`);
  process.exit(0);
}

// Run info
if (require.main === module) {
  main().catch((error) => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { detectPlatform, findGlobalPackagePath };