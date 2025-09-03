#!/usr/bin/env node

/**
 * Rough Cut MCP - Cross-Platform Setup Script
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

/**
 * Dynamically find the global installation path for rough-cut-mcp
 */
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

/**
 * Get platform-specific Claude Desktop config directory and file path
 */
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

/**
 * Safely read existing Claude Desktop configuration
 */
async function readExistingClaudeConfig(configFile) {
  try {
    if (await fs.pathExists(configFile)) {
      const content = await fs.readFile(configFile, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    log('yellow', `⚠️  Could not read existing config: ${error.message}`);
  }
  
  return { mcpServers: {} };
}

/**
 * Safely write Claude Desktop configuration with backup and validation
 */
async function writeClaudeConfig(configFile, config) {
  const configDir = path.dirname(configFile);
  
  // Ensure config directory exists
  await fs.ensureDir(configDir);
  
  // Create backup of existing config if it exists
  if (await fs.pathExists(configFile)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(configDir, `claude_desktop_config.backup.${timestamp}.json`);
    await fs.copy(configFile, backupFile);
    log('blue', `📋 Backed up existing config to: ${path.basename(backupFile)}`);
  }
  
  // Write new config
  const configJson = JSON.stringify(config, null, 2);
  await fs.writeFile(configFile, configJson);
  
  // Validate what was written
  try {
    const writtenContent = await fs.readFile(configFile, 'utf8');
    const parsedConfig = JSON.parse(writtenContent);
    
    // Verify our MCP server is in the config
    if (parsedConfig.mcpServers && parsedConfig.mcpServers['rough-cut-mcp']) {
      log('green', '✅ Config file written and validated successfully');
      return { success: true, config: parsedConfig };
    } else {
      throw new Error('rough-cut-mcp MCP server not found in written config');
    }
  } catch (error) {
    throw new Error(`Config validation failed: ${error.message}`);
  }
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
  // Declare variables at function scope to avoid scope errors
  let fullBuildPath = null;
  
  try {
    log('cyan', '🚀 Rough Cut MCP V5.0 - Cross-Platform Setup');
    log('white', '='.repeat(55));
    
    const platform = detectPlatform();
    log('blue', `🔍 Platform: ${platform.platform}${platform.isWSL ? ' (WSL)' : ''}`);
    
    // Dynamically determine package root and installation type
    const currentDir = process.cwd();
    let packageRoot, isGlobalInstallation;
    
    // First check if we're in local development directory
    const localPackageJson = path.join(currentDir, 'package.json');
    if (fs.existsSync(localPackageJson)) {
      try {
        const packageJson = await fs.readJson(localPackageJson);
        if (packageJson.name === 'rough-cut-mcp') {
          packageRoot = currentDir;
          isGlobalInstallation = false;
          log('blue', '📍 Running from local development directory');
        }
      } catch (error) {
        // Invalid package.json, continue with global detection
      }
    }
    
    // If not local development, find global installation dynamically
    if (!packageRoot) {
      log('yellow', '🔍 Detecting global package installation...');
      packageRoot = findGlobalPackagePath();
      
      if (packageRoot) {
        isGlobalInstallation = true;
        log('blue', `📍 Running from global npm installation: ${packageRoot}`);
      } else {
        throw new Error('Cannot find rough-cut-mcp installation. Please run: npm install -g rough-cut-mcp');
      }
    }
    
    // Verify package root contains required files
    log('yellow', '🔍 Verifying package installation...');
    const requiredFiles = [
      path.join(packageRoot, 'package.json'),
      path.join(packageRoot, 'build', 'index.js')
    ];
    
    for (const filePath of requiredFiles) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${filePath}. Package installation may be corrupted.`);
      }
    }
    
    log('green', '✅ Package installation verified');
    log('blue', `📦 Package root: ${packageRoot}`);
    log('blue', `📁 Build path: ${path.join(packageRoot, 'build', 'index.js')}`);
    
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
    
    // Install dependencies and build (only for local development)
    if (!isGlobalInstallation) {
      log('yellow', '📦 Installing dependencies...');
      await runCommand('npm', ['install'], { cwd: packageRoot });
      log('green', '✅ Dependencies installed successfully');
      
      log('yellow', '🔧 Building TypeScript...');
      await runCommand('npx', ['tsc'], { cwd: packageRoot });
      log('green', '✅ TypeScript built successfully');
    } else {
      log('green', '✅ Using pre-built global installation');
    }
    
    // Create assets directory and auto-configure .env
    log('yellow', '📁 Creating assets directory...');
    const assetsDir = path.join(packageRoot, 'assets', 'projects');
    await fs.ensureDir(assetsDir);
    log('green', '✅ Assets directory ready');
    
    // Auto-generate .env file with correct paths
    log('yellow', '📝 Auto-configuring .env file...');
    await createDefaultEnvFile(packageRoot);
    log('green', '✅ .env file auto-configured');
    
    // Test MCP server briefly
    log('yellow', '🧪 Testing MCP server startup...');
    const buildPath = path.join(packageRoot, 'build', 'index.js');
    
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
    
    // Automatically configure Claude Desktop
    log('cyan', '🔧 Configuring Claude Desktop automatically...');
    
    const { configDir, configFile } = getClaudeConfigPaths();
    
    try {
      // Verify paths exist before writing config
      fullBuildPath = path.resolve(buildPath);
      
      if (!fs.existsSync(fullBuildPath)) {
        throw new Error(`MCP server build not found: ${fullBuildPath}`);
      }
      
      log('blue', `📍 Config will be written to: ${configFile}`);
      log('blue', `🎯 Node.js command: ${nodePath}`);
      log('blue', `📦 MCP server path: ${fullBuildPath}`);
      
      // Read existing configuration
      const existingConfig = await readExistingClaudeConfig(configFile);
      log('blue', `📋 Found ${Object.keys(existingConfig.mcpServers || {}).length} existing MCP servers`);
      
      // Add our MCP server configuration with environment variables
      existingConfig.mcpServers = existingConfig.mcpServers || {};
      existingConfig.mcpServers['rough-cut-mcp'] = {
        command: nodePath,
        args: [fullBuildPath],
        env: {
          REMOTION_PROJECTS_DIR: path.join(packageRoot, 'assets', 'projects')
        }
      };
      
      // Write updated configuration with validation
      const result = await writeClaudeConfig(configFile, existingConfig);
      
      log('green', '✅ Claude Desktop configuration updated successfully!');
      log('blue', `📁 Config file: ${configFile}`);
      log('green', `✅ MCP server "rough-cut-mcp" added (total: ${Object.keys(result.config.mcpServers).length})`);
      
      // Show what was written
      log('blue', '📋 Configuration written:');
      console.log(JSON.stringify(result.config.mcpServers['rough-cut-mcp'], null, 2));
      
      // Additional verification - read back the file to ensure it actually contains our config
      log('yellow', '🔍 Verifying config file was written correctly...');
      try {
        const verificationContent = await fs.readFile(configFile, 'utf8');
        const verificationConfig = JSON.parse(verificationContent);
        
        if (verificationConfig.mcpServers && 
            verificationConfig.mcpServers['rough-cut-mcp'] && 
            verificationConfig.mcpServers['rough-cut-mcp'].command === nodePath &&
            verificationConfig.mcpServers['rough-cut-mcp'].args &&
            verificationConfig.mcpServers['rough-cut-mcp'].args[0] === fullBuildPath &&
            verificationConfig.mcpServers['rough-cut-mcp'].env &&
            verificationConfig.mcpServers['rough-cut-mcp'].env.REMOTION_PROJECTS_DIR === path.join(packageRoot, 'assets', 'projects')) {
          log('green', '✅ Config file verification successful - all paths and environment variables match!');
        } else {
          throw new Error('Config verification failed - written config does not match expected values');
        }
      } catch (verificationError) {
        throw new Error(`Config verification failed: ${verificationError.message}`);
      }
      
    } catch (error) {
      log('red', `❌ Failed to update Claude Desktop config: ${error.message}`);
      
      // Provide specific error diagnosis
      log('yellow', '🔧 Detailed Diagnostics:');
      
      // Check config directory exists and is writable
      try {
        const configDir = path.dirname(configFile);
        if (!fs.existsSync(configDir)) {
          log('red', `   ❌ Config directory does not exist: ${configDir}`);
          log('white', '   💡 Claude Desktop may not be installed properly');
        } else {
          log('green', `   ✅ Config directory exists: ${configDir}`);
          
          // Test write permissions
          const testFile = path.join(configDir, 'test-write.tmp');
          try {
            await fs.writeFile(testFile, 'test');
            await fs.remove(testFile);
            log('green', '   ✅ Write permissions OK');
          } catch (writeError) {
            log('red', `   ❌ No write permission: ${writeError.message}`);
            log('white', '   💡 Run as administrator or check folder permissions');
          }
        }
      } catch (diagError) {
        log('red', `   ❌ Diagnostic failed: ${diagError.message}`);
      }
      
      // Show current paths for debugging (with null safety)
      log('blue', '📍 Current paths being used:');
      log('white', `   • Node.js: ${nodePath || 'not detected'}`);
      log('white', `   • MCP Server: ${fullBuildPath || 'not resolved'}`);
      log('white', `   • Config file: ${configFile || 'not determined'}`);
      
      log('yellow', '🛠️ Troubleshooting steps:');
      log('white', '   1. Close Claude Desktop completely (important!)');
      log('white', '   2. Run: remotion-mcp-debug for full diagnostics');
      log('white', '   3. If still failing, try manual configuration below');
      
      // Only show manual config if we have the required paths
      if (nodePath && fullBuildPath && configFile) {
        log('yellow', '📋 Manual Configuration (copy to Claude Desktop config):');
        
        const manualConfig = {
          mcpServers: {
            'rough-cut-mcp': {
              command: nodePath,
              args: [fullBuildPath],
              env: {
                REMOTION_PROJECTS_DIR: path.join(packageRoot, 'assets', 'projects')
              }
            }
          }
        };
        
        console.log(JSON.stringify(manualConfig, null, 2));
        log('yellow', `📍 Add to: ${configFile}`);
      } else {
        log('yellow', '📋 Manual Configuration:');
        log('white', '   Cannot generate config - some paths were not resolved');
        log('white', '   Run: remotion-mcp-debug for detailed path diagnostics');
      }
    }
    
    log('green', '\\n🎯 Setup Complete!');
    
    if (isGlobalInstallation) {
      log('yellow', 'Global Installation Ready:');
      log('white', `• Assets will be created in: ${currentDir}/assets/projects/`);
      log('white', '• Run commands from any directory using: rough-cut-setup, rough-cut-build');
      log('white', '• Projects will be created in your current working directory');
    }
    
    log('yellow', '🚀 Next Steps - CRITICAL for MCP to appear:');
    log('white', '1. ✅ Claude Desktop configuration automatically updated');
    
    log('cyan', '\\n2. 🔄 RESTART CLAUDE DESKTOP COMPLETELY:');
    if (platform.isWindows) {
      log('white', '   • Right-click Claude Desktop in system tray → Exit');
      log('white', '   • OR: Press Ctrl+Shift+Esc → Task Manager → End Claude Desktop');
      log('white', '   • Wait 3 seconds, then restart Claude Desktop from Start menu');
    } else if (platform.isMacOS) {
      log('white', '   • Press Cmd+Q in Claude Desktop (or Claude → Quit Claude Desktop)');
      log('white', '   • Wait 3 seconds, then restart from Applications or Dock');
    } else {
      log('white', '   • Close Claude Desktop completely (not minimize)');
      log('white', '   • Wait 3 seconds, then restart the application');
    }
    
    log('white', "\\n3. 🎬 Test MCP Server:");
    log('white', "   Ask Claude: 'Create a Remotion project called test with bouncing ball'");
    log('white', "   You should see MCP tools available!");
    
    log('white', '\\n4. 🔧 If MCP still not visible:');
    log('white', '   • Run: rough-cut-debug');
    log('white', '   • Check Claude Desktop logs for errors');
    
    log('white', '\\n5. 🎵 Optional: Configure audio features');
    log('white', "   Ask Claude: 'Configure audio with my ElevenLabs API key'");
    
    log('yellow', '\\n🛠️ Troubleshooting:');
    log('white', '- Check Claude Desktop logs for MCP server errors');
    log('white', '- Verify Node.js is accessible from the configured path');
    log('white', `- Test manually: ${nodePath} ${fullBuildPath || 'build/index.js'}`);
    
  } catch (error) {
    log('red', `❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Rough Cut MCP - Cross-Platform Setup

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

/**
 * Create or update .env file with correct paths for this installation
 */
async function createDefaultEnvFile(packageRoot) {
  const envPath = path.join(packageRoot, '.env');
  const envExamplePath = path.join(packageRoot, '.env.example');
  
  // Use the same logic as getBaseDirectory to determine correct project path
  const baseDir = packageRoot; // For this installation, projects go in package root
  const projectsPath = path.resolve(baseDir, 'assets', 'projects');
  
  // Ensure projects directory exists
  await fs.ensureDir(projectsPath);
  
  let envContent = '';
  
  // Read existing .env if it exists
  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, 'utf8');
    log('blue', '📝 Updating existing .env file');
  } else {
    // Start with .env.example if .env doesn't exist
    if (await fs.pathExists(envExamplePath)) {
      envContent = await fs.readFile(envExamplePath, 'utf8');
      log('blue', '📝 Creating .env from .env.example');
    } else {
      envContent = '# Remotion MCP Server Configuration\n\n';
      log('blue', '📝 Creating new .env file');
    }
  }
  
  // Update or add REMOTION_PROJECTS_DIR (point directly to projects directory)
  const projectsDirLine = `REMOTION_PROJECTS_DIR=${path.join(packageRoot, 'assets', 'projects')}`;
  const regex = /^REMOTION_PROJECTS_DIR=.*$/m;
  
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, projectsDirLine);
    log('yellow', '🔄 Updated REMOTION_PROJECTS_DIR in .env');
  } else {
    envContent = envContent + '\n' + projectsDirLine + '\n';
    log('green', '✅ Added REMOTION_PROJECTS_DIR to .env');
  }
  
  // Write updated .env file
  await fs.writeFile(envPath, envContent);
  
  log('green', `✅ .env file configured with projects path: ${projectsPath}`);
  log('blue', `📁 Projects will be created in: ${projectsPath}`);
  
  return { envPath, projectsPath };
}

module.exports = { detectPlatform, findNodePath, testNodeVersion, createDefaultEnvFile };