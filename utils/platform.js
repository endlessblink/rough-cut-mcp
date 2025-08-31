#!/usr/bin/env node

/**
 * Cross-Platform Utilities for Remotion MCP Server
 * Environment detection and path resolution utilities
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Detect the current platform and environment
 * @returns {Object} Platform information
 */
function detectPlatform() {
  const platform = os.platform();
  let isWSL = false;
  
  // Enhanced WSL detection
  if (platform === 'linux') {
    try {
      // Check for WSL environment variables
      isWSL = !!(process.env.WSL_DISTRO_NAME || process.env.WSLENV);
      
      // If not detected via env vars, check /proc/version
      if (!isWSL && fs.existsSync('/proc/version')) {
        const procVersion = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
        isWSL = procVersion.includes('microsoft') || procVersion.includes('wsl');
      }
    } catch (error) {
      // If we can't detect WSL, assume native Linux
      isWSL = false;
    }
  }
  
  return {
    platform,
    isWindows: platform === 'win32',
    isMacOS: platform === 'darwin',
    isLinux: platform === 'linux',
    isWSL,
    nodeArch: process.arch,
    nodeVersion: process.version
  };
}

/**
 * Find the best Node.js executable path for the current platform
 * @returns {string} Node.js executable path
 */
function findNodePath() {
  const platformInfo = detectPlatform();
  
  if (platformInfo.isWindows) {
    // Windows-specific Node.js paths
    const windowsPaths = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
      path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'nodejs', 'node.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'nodejs', 'node.exe'),
      path.join(os.homedir(), 'AppData\\Roaming\\npm\\node.exe'),
      'node.exe', // fallback to PATH
      'node' // final fallback
    ];
    
    for (const nodePath of windowsPaths) {
      try {
        if (nodePath.endsWith('node') || nodePath.endsWith('node.exe')) {
          if (nodePath === 'node' || nodePath === 'node.exe' || fs.existsSync(nodePath)) {
            return nodePath;
          }
        }
      } catch (error) {
        continue;
      }
    }
  } else {
    // macOS/Linux paths
    const unixPaths = [
      '/usr/local/bin/node',
      '/usr/bin/node',
      '/opt/homebrew/bin/node', // Apple Silicon Homebrew
      path.join(os.homedir(), '.nvm/versions/node/*/bin/node'), // NVM pattern
      path.join('/usr/local/lib/nodejs/*/bin/node'), // Manual installations
      'node' // fallback to PATH
    ];
    
    for (const nodePath of unixPaths) {
      try {
        if (nodePath.includes('*')) {
          // Handle glob patterns (like NVM)
          const result = expandGlobPath(nodePath);
          if (result) return result;
        } else if (nodePath === 'node' || fs.existsSync(nodePath)) {
          return nodePath;
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  return 'node'; // Final fallback - hope it's in PATH
}

/**
 * Expand glob patterns in paths (specifically for NVM detection)
 * @param {string} globPath Path with glob pattern
 * @returns {string|null} Expanded path or null if not found
 */
function expandGlobPath(globPath) {
  try {
    if (globPath.includes('.nvm/versions/node/*/bin/node')) {
      const nvmDir = path.join(os.homedir(), '.nvm/versions/node');
      if (fs.existsSync(nvmDir)) {
        const versions = fs.readdirSync(nvmDir)
          .filter(v => fs.statSync(path.join(nvmDir, v)).isDirectory())
          .sort((a, b) => {
            // Sort versions semantically (rough approximation)
            const aVersion = a.replace(/^v/, '').split('.').map(Number);
            const bVersion = b.replace(/^v/, '').split('.').map(Number);
            
            for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
              const aPart = aVersion[i] || 0;
              const bPart = bVersion[i] || 0;
              if (aPart !== bPart) return bPart - aPart; // Descending
            }
            return 0;
          });
        
        if (versions.length > 0) {
          const latestVersion = versions[0];
          const nvmNodePath = path.join(nvmDir, latestVersion, 'bin/node');
          if (fs.existsSync(nvmNodePath)) {
            return nvmNodePath;
          }
        }
      }
    }
  } catch (error) {
    // Continue with other paths
  }
  
  return null;
}

/**
 * Get platform-specific Claude Desktop config directory
 * @returns {string} Config directory path
 */
function getClaudeConfigDir() {
  const platformInfo = detectPlatform();
  
  if (platformInfo.isWindows) {
    return path.join(process.env.APPDATA || os.homedir(), 'Claude');
  } else if (platformInfo.isMacOS) {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude');
  } else {
    return path.join(os.homedir(), '.config', 'claude');
  }
}

/**
 * Get platform-specific Claude Desktop config file path
 * @returns {string} Config file path
 */
function getClaudeConfigPath() {
  return path.join(getClaudeConfigDir(), 'claude_desktop_config.json');
}

/**
 * Generate Claude Desktop MCP server configuration
 * @param {string} projectPath Path to the built MCP server
 * @param {string} nodePath Path to Node.js executable
 * @returns {Object} MCP server configuration
 */
function generateClaudeConfig(projectPath, nodePath = null) {
  if (!nodePath) {
    nodePath = findNodePath();
  }
  
  const buildPath = path.resolve(projectPath, 'build', 'index.js');
  
  return {
    mcpServers: {
      remotion: {
        command: nodePath,
        args: [buildPath]
      }
    }
  };
}

/**
 * Test if a Node.js path is valid and get version info
 * @param {string} nodePath Path to Node.js executable
 * @returns {Promise<Object>} Node.js version information
 */
function testNodePath(nodePath) {
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const child = spawn(nodePath, ['--version'], { 
      stdio: 'pipe',
      timeout: 5000 
    });
    
    let output = '';
    let error = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0 && output.trim()) {
        const version = output.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        resolve({
          path: nodePath,
          version,
          majorVersion,
          supported: majorVersion >= 18
        });
      } else {
        reject(new Error(`Node.js test failed: ${error || 'unknown error'}`));
      }
    });
    
    child.on('error', (err) => {
      reject(new Error(`Failed to execute Node.js: ${err.message}`));
    });
  });
}

/**
 * Get environment-appropriate shell command for spawning processes
 * @returns {Object} Shell configuration
 */
function getShellConfig() {
  const platformInfo = detectPlatform();
  
  if (platformInfo.isWindows) {
    return {
      shell: true,
      windowsHide: true
    };
  } else {
    return {
      shell: '/bin/bash',
      env: { ...process.env, PATH: process.env.PATH }
    };
  }
}

module.exports = {
  detectPlatform,
  findNodePath,
  expandGlobPath,
  getClaudeConfigDir,
  getClaudeConfigPath,
  generateClaudeConfig,
  testNodePath,
  getShellConfig
};