#!/usr/bin/env node

/**
 * Remotion MCP Server - Debug Tool
 * Diagnoses configuration and server issues
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

function getClaudeConfigPaths() {
  const platform = detectPlatform();
  
  let configDir, configFile;
  
  if (platform.isWindows) {
    configDir = path.join(process.env.APPDATA || os.homedir(), 'Claude');
  } else if (platform.isMacOS) {
    configDir = path.join(os.homedir(), 'Library', 'Application Support', 'Claude');
  } else {
    configDir = path.join(os.homedir(), '.config', 'claude');
  }
  
  configFile = path.join(configDir, 'claude_desktop_config.json');
  
  return { configDir, configFile };
}

function findNodePath() {
  const platform = detectPlatform();
  
  if (platform.isWindows) {
    const windowsPaths = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
      path.join(os.homedir(), 'AppData\\Roaming\\npm\\node.exe'),
      'node'
    ];
    
    for (const nodePath of windowsPaths) {
      try {
        if (nodePath === 'node' || fs.existsSync(nodePath)) {
          return nodePath;
        }
      } catch (error) {
        continue;
      }
    }
  } else {
    const unixPaths = [
      '/usr/local/bin/node',
      '/usr/bin/node',
      '/opt/homebrew/bin/node',
      path.join(os.homedir(), '.nvm/versions/node/*/bin/node'),
      'node'
    ];
    
    for (const nodePath of unixPaths) {
      try {
        if (nodePath.includes('*')) {
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
        continue;
      }
    }
  }
  
  return 'node';
}

function findGlobalPackagePath() {
  const packageName = 'rough-cut-mcp';
  const platform = detectPlatform();
  
  // Method 1: Try to resolve from current script location (most reliable for global installs)
  try {
    const scriptDir = __dirname;
    const packageJsonPath = path.join(scriptDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);
      if (packageJson.name === packageName) {
        log('blue', `📦 Found package via script location: ${scriptDir}`);
        return scriptDir;
      }
    }
  } catch (error) {
    // Continue with other methods
  }
  
  // Method 2: Try to use require.resolve (Node.js module resolution)
  try {
    const modulePath = require.resolve(packageName);
    const packageRoot = modulePath.substring(0, modulePath.indexOf(packageName) + packageName.length);
    if (fs.existsSync(path.join(packageRoot, 'package.json'))) {
      log('blue', `📦 Found package via require.resolve: ${packageRoot}`);
      return packageRoot;
    }
  } catch (error) {
    // Continue with other methods
  }
  
  // Method 3: Try common global npm paths for the current platform
  const globalPaths = [];
  
  if (platform.isWindows) {
    const userProfile = os.userInfo().username;
    globalPaths.push(
      path.join(process.env.APPDATA || os.homedir(), 'npm', 'node_modules', packageName),
      path.join('C:', 'Users', userProfile, 'AppData', 'Roaming', 'npm', 'node_modules', packageName),
      path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'nodejs', 'node_modules', packageName)
    );
  } else {
    globalPaths.push(
      `/usr/local/lib/node_modules/${packageName}`,
      `/usr/lib/node_modules/${packageName}`,
      path.join(os.homedir(), `.npm-global/lib/node_modules/${packageName}`),
      `/opt/homebrew/lib/node_modules/${packageName}`
    );
  }
  
  for (const globalPath of globalPaths) {
    try {
      if (fs.existsSync(globalPath) && fs.existsSync(path.join(globalPath, 'package.json'))) {
        log('blue', `📦 Found package via global path: ${globalPath}`);
        return globalPath;
      }
    } catch (error) {
      // Continue checking other paths
    }
  }
  
  // Method 4: Try npm root -g command as last resort
  try {
    const { execSync } = require('child_process');
    const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const npmGlobalPath = path.join(npmRoot, packageName);
    
    if (fs.existsSync(npmGlobalPath) && fs.existsSync(path.join(npmGlobalPath, 'package.json'))) {
      log('blue', `📦 Found package via npm root -g: ${npmGlobalPath}`);
      return npmGlobalPath;
    }
  } catch (error) {
    // npm command failed
  }
  
  log('red', `❌ Could not find global package installation for ${packageName}`);
  return null;
}

async function testServerStartup(nodePath, serverPath) {
  return new Promise((resolve) => {
    log('blue', `Testing server startup: ${nodePath} ${serverPath}`);
    
    const testProcess = spawn(nodePath, [serverPath], {
      stdio: 'pipe',
      timeout: 5000
    });
    
    let stdout = '';
    let stderr = '';
    
    testProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    testProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    const timeout = setTimeout(() => {
      testProcess.kill('SIGTERM');
      resolve({
        success: true,
        message: 'Server started successfully (killed after 3s)',
        stdout: stdout.slice(0, 500),
        stderr: stderr.slice(0, 500)
      });
    }, 3000);
    
    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        message: `Failed to start: ${error.message}`,
        stdout,
        stderr
      });
    });
    
    testProcess.on('exit', (code, signal) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({
          success: true,
          message: 'Server exited cleanly',
          stdout,
          stderr
        });
      } else {
        resolve({
          success: false,
          message: `Server exited with code ${code}, signal ${signal}`,
          stdout,
          stderr
        });
      }
    });
  });
}

async function main() {
  try {
    log('cyan', '🔍 Rough Cut MCP - Debug Tool');
    log('white', '='.repeat(45));
    
    const platform = detectPlatform();
    log('blue', `Platform: ${platform.platform}${platform.isWSL ? ' (WSL)' : ''}`);
    
    // 1. Check Node.js
    log('yellow', '\\n1️⃣  Node.js Detection');
    const nodePath = findNodePath();
    log('blue', `Found Node.js: ${nodePath}`);
    
    try {
      const nodeVersion = await new Promise((resolve, reject) => {
        const child = spawn(nodePath, ['--version'], { stdio: 'pipe' });
        let output = '';
        child.stdout?.on('data', (data) => { output += data.toString(); });
        child.on('close', (code) => {
          if (code === 0) resolve(output.trim());
          else reject(new Error(`Exit code ${code}`));
        });
        child.on('error', reject);
      });
      log('green', `✅ Node.js version: ${nodeVersion}`);
    } catch (error) {
      log('red', `❌ Node.js test failed: ${error.message}`);
    }
    
    // 2. Check Global Package Installation
    log('yellow', '\\n2️⃣  Global Package Installation');
    const packagePath = findGlobalPackagePath();
    
    if (packagePath) {
      log('green', `✅ Package found: ${packagePath}`);
      
      const buildPath = path.join(packagePath, 'build', 'index.js');
      if (fs.existsSync(buildPath)) {
        log('green', `✅ Server built: ${buildPath}`);
        
        // Test server startup
        log('yellow', '\\n3️⃣  Server Startup Test');
        const serverTest = await testServerStartup(nodePath, buildPath);
        
        if (serverTest.success) {
          log('green', `✅ ${serverTest.message}`);
        } else {
          log('red', `❌ ${serverTest.message}`);
          if (serverTest.stderr) {
            log('red', `Errors: ${serverTest.stderr}`);
          }
        }
      } else {
        log('red', `❌ Server not built: ${buildPath}`);
        log('yellow', '   Run: rough-cut-build');
      }
    } else {
      log('red', '❌ Global package not found');
      log('yellow', '   Run: npm install -g rough-cut-mcp');
    }
    
    // 3. Check Claude Desktop Configuration
    log('yellow', '\\n4️⃣  Claude Desktop Configuration');
    const { configDir, configFile } = getClaudeConfigPaths();
    
    log('blue', `Config directory: ${configDir}`);
    log('blue', `Config file: ${configFile}`);
    
    if (fs.existsSync(configFile)) {
      log('green', '✅ Config file exists');
      
      try {
        const configContent = fs.readFileSync(configFile, 'utf8');
        const config = JSON.parse(configContent);
        
        log('green', '✅ Config file is valid JSON');
        
        if (config.mcpServers && config.mcpServers['rough-cut-mcp']) {
          log('green', '✅ rough-cut-mcp MCP server found in config');
          
          const roughCutConfig = config.mcpServers['rough-cut-mcp'];
          log('blue', `Command: ${roughCutConfig.command}`);
          log('blue', `Args: ${JSON.stringify(roughCutConfig.args)}`);
          
          // Verify the configured paths exist
          if (fs.existsSync(roughCutConfig.command)) {
            log('green', '✅ Node.js command path exists');
          } else {
            log('red', `❌ Node.js command path not found: ${roughCutConfig.command}`);
          }
          
          if (roughCutConfig.args && roughCutConfig.args[0] && fs.existsSync(roughCutConfig.args[0])) {
            log('green', '✅ MCP server path exists');
          } else {
            log('red', `❌ MCP server path not found: ${roughCutConfig.args?.[0]}`);
          }
          
        } else {
          log('red', '❌ rough-cut-mcp MCP server not found in config');
          log('yellow', '   Run: rough-cut-setup');
        }
        
      } catch (error) {
        log('red', `❌ Config file is invalid JSON: ${error.message}`);
      }
      
    } else {
      log('red', '❌ Config file does not exist');
      log('yellow', '   Run: remotion-mcp-setup');
    }
    
    // 4. Summary and Recommendations
    log('yellow', '\\n5️⃣  Recommendations');
    
    if (!fs.existsSync(configFile)) {
      log('white', '1. Run: remotion-mcp-setup');
    }
    
    log('white', '2. Completely restart Claude Desktop (not just refresh)');
    log('white', '3. Check Claude Desktop logs for MCP server errors');
    
    if (platform.isWindows) {
      log('white', '4. Claude Desktop logs: %APPDATA%\\Claude\\logs\\');
    } else if (platform.isMacOS) {
      log('white', '4. Claude Desktop logs: ~/Library/Logs/Claude/');
    } else {
      log('white', '4. Claude Desktop logs: ~/.local/share/Claude/logs/');
    }
    
  } catch (error) {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Rough Cut MCP - Debug Tool

Usage: rough-cut-debug [options]

Options:
  --help, -h    Show this help message
  
This tool will:
1. Check Node.js installation and version
2. Verify global package installation
3. Test MCP server startup
4. Validate Claude Desktop configuration
5. Provide specific troubleshooting recommendations

Use this when the MCP server doesn't appear in Claude Desktop.
`);
  process.exit(0);
}

// Run debug
if (require.main === module) {
  main().catch((error) => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { detectPlatform, getClaudeConfigPaths, findNodePath, findGlobalPackagePath };