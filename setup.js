#!/usr/bin/env node

/**
 * Remotion MCP Server - Cross-Platform Setup Script
 * Complements the Windows-specific setup-windows.ps1
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
  const isWSL = process.env.WSL_DISTRO_NAME || fs.existsSync('/proc/version');
  
  return {
    platform,
    isWindows: platform === 'win32',
    isMacOS: platform === 'darwin',
    isLinux: platform === 'linux',
    isWSL: isWSL && platform === 'linux'
  };
}

function findNodePath() {
  const platform = detectPlatform();
  
  if (platform.isWindows) {
    // Windows paths
    const windowsPaths = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
      path.join(os.homedir(), 'AppData\\Roaming\\npm\\node.exe'),
      'node' // fallback to PATH
    ];
    
    for (const nodePath of windowsPaths) {
      try {
        if (nodePath === 'node' || fs.existsSync(nodePath)) {
          return nodePath;
        }
      } catch (error) {
        // Continue checking
      }
    }
  }
  
  // macOS/Linux paths
  const unixPaths = [
    '/usr/local/bin/node',
    '/usr/bin/node',
    '/opt/homebrew/bin/node', // Apple Silicon Homebrew
    path.join(os.homedir(), '.nvm/versions/node/*/bin/node'),
    'node' // fallback to PATH
  ];
  
  for (const nodePath of unixPaths) {
    try {
      if (nodePath.includes('*')) {
        // Handle NVM glob pattern
        const nvmVersions = path.join(os.homedir(), '.nvm/versions/node');
        if (fs.existsSync(nvmVersions)) {
          const versions = fs.readdirSync(nvmVersions);
          if (versions.length > 0) {
            const latestVersion = versions.sort().reverse()[0];
            const nvmNodePath = path.join(nvmVersions, latestVersion, 'bin/node');
            if (fs.existsSync(nvmNodePath)) {
              return nvmNodePath;
            }
          }
        }
      } else if (nodePath === 'node' || fs.existsSync(nodePath)) {
        return nodePath;
      }
    } catch (error) {
      // Continue checking
    }
  }
  
  return 'node'; // Final fallback
}

async function testNodeVersion(nodePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(nodePath, ['--version'], { stdio: 'pipe' });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        const version = output.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        resolve({ version, majorVersion, supported: majorVersion >= 18 });
      } else {
        reject(new Error(`Node.js not found or failed to execute`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
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

async function main() {
  try {
    log('cyan', '🚀 Remotion MCP Server V5.0 - Cross-Platform Setup');
    log('white', '='.repeat(55));
    
    const platform = detectPlatform();
    log('blue', `🔍 Platform: ${platform.platform}${platform.isWSL ? ' (WSL)' : ''}`);
    
    // Check if we're in the right directory
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found. Please run this script from the project root directory.');
    }
    
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.name !== 'remotion-mcp-server') {
      log('yellow', '⚠️  Warning: Not in expected project directory, but continuing...');
    }
    
    // Find and test Node.js
    log('yellow', '🔍 Detecting Node.js installation...');
    const nodePath = findNodePath();
    log('blue', `Found Node.js at: ${nodePath}`);
    
    try {
      const nodeInfo = await testNodeVersion(nodePath);
      log('green', `✅ Node.js version: ${nodeInfo.version}`);
      
      if (!nodeInfo.supported) {
        throw new Error(`Node.js v18+ required. Found: ${nodeInfo.version}`);
      }
    } catch (error) {
      log('red', `❌ Node.js test failed: ${error.message}`);
      throw error;
    }
    
    // Install dependencies
    log('yellow', '📦 Installing dependencies...');
    await runCommand('npm', ['install']);
    log('green', '✅ Dependencies installed successfully');
    
    // Build TypeScript
    log('yellow', '🔧 Building TypeScript...');
    await runCommand('npx', ['tsc']);
    log('green', '✅ TypeScript built successfully');
    
    // Create assets directory
    log('yellow', '📁 Creating assets directory...');
    const assetsDir = path.join(currentDir, 'assets', 'projects');
    await fs.ensureDir(assetsDir);
    log('green', '✅ Assets directory ready');
    
    // Test MCP server briefly
    log('yellow', '🧪 Testing MCP server startup...');
    const buildPath = path.join(currentDir, 'build', 'index.js');
    
    if (!fs.existsSync(buildPath)) {
      throw new Error('Build file not found. TypeScript compilation may have failed.');
    }
    
    // Quick test - spawn and kill after 2 seconds
    const testProcess = spawn(nodePath, [buildPath], {
      stdio: 'pipe',
      detached: false
    });
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        testProcess.kill('SIGTERM');
        log('green', '✅ MCP server test successful');
        resolve();
      }, 2000);
      
      testProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`MCP server test failed: ${error.message}`));
      });
      
      testProcess.on('exit', (code) => {
        if (code && code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`MCP server exited with code ${code}`));
        }
      });
    });
    
    // Generate platform-specific Claude Desktop config
    log('cyan', '📋 Claude Desktop Configuration:');
    
    const fullBuildPath = path.resolve(buildPath);
    const config = {
      mcpServers: {
        remotion: {
          command: nodePath,
          args: [fullBuildPath]
        }
      }
    };
    
    console.log(JSON.stringify(config, null, 2));
    
    // Platform-specific config location info
    log('yellow', '📍 Config file locations:');
    if (platform.isWindows) {
      log('white', `Windows: %APPDATA%\\Claude\\claude_desktop_config.json`);
    } else if (platform.isMacOS) {
      log('white', `macOS: ~/Library/Application Support/Claude/claude_desktop_config.json`);
    } else {
      log('white', `Linux: ~/.config/claude/claude_desktop_config.json`);
    }
    
    log('green', '\\n🎯 Setup Complete!');
    log('yellow', 'Next Steps:');
    log('white', '1. Add the config above to your Claude Desktop configuration');
    log('white', '2. Restart Claude Desktop completely');
    log('white', "3. Test with: 'Create a Remotion project called test with bouncing ball'");
    
    log('yellow', '\\n🛠️ Troubleshooting:');
    log('white', '- Check Claude Desktop logs for MCP server errors');
    log('white', '- Verify Node.js is accessible from the configured path');
    log('white', `- Test manually: ${nodePath} ${fullBuildPath}`);
    
  } catch (error) {
    log('red', `❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Remotion MCP Server - Cross-Platform Setup

Usage: node setup.js [options]

Options:
  --help, -h    Show this help message
  
This script will:
1. Detect your platform and Node.js installation
2. Install npm dependencies
3. Build the TypeScript source
4. Test the MCP server
5. Generate Claude Desktop configuration

For Windows users: You can also use setup-windows.ps1 for a PowerShell experience.
`);
  process.exit(0);
}

// Run setup
if (require.main === module) {
  main().catch((error) => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { detectPlatform, findNodePath, testNodeVersion };