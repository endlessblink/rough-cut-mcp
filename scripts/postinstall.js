#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Only run postinstall when installed globally or via npm, not during development
if (process.env.npm_lifecycle_event !== 'postinstall') {
  process.exit(0);
}

// Check if this is a global install
const isGlobal = process.env.npm_config_global === 'true';

console.log('\n🎬 Rough Cut MCP Server - Installation\n');

if (platform() !== 'win32') {
  console.warn('⚠️  WARNING: This MCP server is designed for Windows.');
  console.warn('   Installation will continue, but functionality may be limited on other platforms.\n');
}

/**
 * Robust Node.js executable path detection
 * Tries multiple methods to find the correct Node.js path
 */
function getNodeExecutablePath() {
  const debugLog = (msg) => {
    if (process.env.DEBUG_MCP_INSTALL) {
      console.error(`[DEBUG] ${msg}`);
    }
  };

  debugLog('Starting Node.js path detection...');
  debugLog(`process.execPath: ${process.execPath}`);
  debugLog(`npm_node_execpath: ${process.env.npm_node_execpath}`);
  debugLog(`npm_execpath: ${process.env.npm_execpath}`);

  // Method 1: Check environment variables first (most reliable for npm installs)
  if (process.env.npm_node_execpath && existsSync(process.env.npm_node_execpath)) {
    debugLog(`Found via npm_node_execpath: ${process.env.npm_node_execpath}`);
    return process.env.npm_node_execpath;
  }

  // Method 2: Use npm config get prefix
  try {
    const npmPrefix = execSync('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
    const nodePath = join(npmPrefix, nodeExe);
    
    if (existsSync(nodePath)) {
      debugLog(`Found via npm prefix: ${nodePath}`);
      return nodePath;
    }
  } catch (e) {
    debugLog(`npm prefix method failed: ${e.message}`);
  }

  // Method 3: Use which/where command
  try {
    const whichCmd = platform() === 'win32' ? 'where node' : 'which node';
    const result = execSync(whichCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const paths = result.split('\n').map(p => p.trim()).filter(p => p);
    
    for (const nodePath of paths) {
      if (existsSync(nodePath)) {
        debugLog(`Found via where/which command: ${nodePath}`);
        return nodePath;
      }
    }
  } catch (e) {
    debugLog(`where/which method failed: ${e.message}`);
  }

  // Method 4: Use npm bin command
  try {
    const npmBin = execSync('npm bin -g', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
    const nodePath = join(dirname(npmBin), nodeExe);
    
    if (existsSync(nodePath)) {
      debugLog(`Found via npm bin: ${nodePath}`);
      return nodePath;
    }
  } catch (e) {
    debugLog(`npm bin method failed: ${e.message}`);
  }

  // Method 5: Check npm_execpath (derive node from npm location)
  if (process.env.npm_execpath) {
    const npmDir = dirname(process.env.npm_execpath);
    const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
    const nodePath = join(npmDir, nodeExe);
    
    if (existsSync(nodePath)) {
      debugLog(`Found via npm_execpath: ${nodePath}`);
      return nodePath;
    }
  }

  // Method 6: Check common Windows paths
  if (platform() === 'win32') {
    const commonPaths = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
      'C:\\nodejs\\node.exe',
      'C:\\pinokio\\bin\\miniconda\\node.exe'
    ];
    
    for (const path of commonPaths) {
      if (existsSync(path)) {
        debugLog(`Found at common path: ${path}`);
        return path;
      }
    }
  }

  // Method 7: Check process.execPath if it's valid
  if (process.execPath && existsSync(process.execPath) && !process.execPath.includes('\\Temp\\')) {
    debugLog(`Using process.execPath: ${process.execPath}`);
    return process.execPath;
  }

  // Fallback: Just use 'node' command and hope it's in PATH
  debugLog('Falling back to "node" command (relies on PATH)');
  console.warn('⚠️  Could not detect Node.js installation path.');
  console.warn('   Using "node" command - ensure Node.js is in your PATH.\n');
  return 'node';
}

/**
 * Collect anonymous telemetry data (opt-in only)
 * Helps improve compatibility across different environments
 */
async function collectTelemetry(nodeCommand, buildPath) {
  // Only collect if explicitly opted in
  if (process.env.ROUGH_CUT_TELEMETRY === 'false' || 
      process.env.NO_TELEMETRY === 'true' ||
      process.env.CI === 'true') {
    return; // Skip telemetry
  }
  
  try {
    // Collect anonymous environment data
    const telemetryData = {
      timestamp: new Date().toISOString(),
      version: require('../package.json').version,
      platform: platform(),
      nodeVersion: process.version,
      npmVersion: process.env.npm_version || 'unknown',
      installationType: isGlobal ? 'global' : 'local',
      success: true,
      environment: {
        // Detect Node.js installation method
        nodeMethod: detectNodeInstallMethod(nodeCommand),
        npmConfigGlobal: process.env.npm_config_global || 'false',
        hasNpmNodeExecpath: Boolean(process.env.npm_node_execpath),
        hasNpmExecpath: Boolean(process.env.npm_execpath),
        pathMethod: getPathDetectionMethod(),
        claudeConfigExists: existsSync(dirname(configPath))
      }
    };
    
    // Send telemetry (non-blocking, with timeout)
    const telemetryPromise = sendTelemetry(telemetryData);
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    // Race against timeout - don't block installation
    await Promise.race([telemetryPromise, timeoutPromise]);
    
  } catch (error) {
    // Silent fail - never break installation due to telemetry
  }
}

/**
 * Detect Node.js installation method from path
 */
function detectNodeInstallMethod(nodeCommand) {
  if (!nodeCommand || nodeCommand === 'node') {
    return 'unknown';
  }
  
  const nodePath = nodeCommand.toLowerCase();
  
  if (nodePath.includes('nvm')) {
    return 'nvm';
  } else if (nodePath.includes('volta')) {
    return 'volta';
  } else if (nodePath.includes('chocolatey') || nodePath.includes('choco')) {
    return 'chocolatey';
  } else if (nodePath.includes('scoop')) {
    return 'scoop';
  } else if (nodePath.includes('program files\\nodejs')) {
    return 'standard-installer';
  } else if (nodePath.includes('appdata\\local') || nodePath.includes('localappdata')) {
    return 'user-space';
  } else {
    return 'other';
  }
}

/**
 * Get which path detection method was successful
 */
function getPathDetectionMethod() {
  if (process.env.npm_node_execpath && existsSync(process.env.npm_node_execpath)) {
    return 'npm_node_execpath';
  }
  
  try {
    const npmPrefix = execSync('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const nodeExe = platform() === 'win32' ? 'node.exe' : 'node';
    const nodePath = join(npmPrefix, nodeExe);
    if (existsSync(nodePath)) {
      return 'npm_prefix';
    }
  } catch (e) {
    // Continue to next method
  }
  
  try {
    const whichCmd = platform() === 'win32' ? 'where node' : 'which node';
    execSync(whichCmd, { stdio: 'ignore' });
    return 'which_where';
  } catch (e) {
    // Continue to next method
  }
  
  return 'process_execpath';
}

/**
 * Send telemetry data to collection endpoint
 */
async function sendTelemetry(data) {
  // Only attempt to send if we have fetch available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    return;
  }
  
  const telemetryUrl = 'https://api.rough-cut-mcp.dev/telemetry/install';
  
  try {
    await fetch(telemetryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `rough-cut-mcp/${data.version} (${data.platform}; Node.js ${data.nodeVersion})`
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(1500) // 1.5 second timeout
    });
  } catch (error) {
    // Silent fail - telemetry should never break installation
  }
}

// Find Claude Desktop config location
const claudeConfigDir = join(homedir(), 'AppData', 'Roaming', 'Claude');
const configPath = join(claudeConfigDir, 'claude_desktop_config.json');

if (!existsSync(claudeConfigDir)) {
  console.log('Claude Desktop configuration directory not found.');
  console.log('Please ensure Claude Desktop is installed.\n');
  console.log('Manual setup instructions:');
  console.log('1. Create the directory: %APPDATA%\\Claude');
  console.log('2. Create claude_desktop_config.json with the MCP server configuration');
  console.log('3. See README.md for configuration details\n');
  process.exit(0);
}

// Get the installed package location
// When installed globally via npm, __dirname will be in the global node_modules
// e.g., C:\Users\username\AppData\Roaming\npm\node_modules\rough-cut-mcp\scripts
const packageRoot = join(__dirname, '..');
const buildPath = join(packageRoot, 'build', 'index.js');
const assetsPath = join(packageRoot, 'assets');

console.log(`📦 Package installed at: ${packageRoot}`);

// Verify the build files exist
if (!existsSync(buildPath)) {
  console.error(`❌ Error: Build file not found at ${buildPath}`);
  console.error('   The package may not have been built correctly.');
  console.error('   Try reinstalling or contact support.');
  process.exit(1);
}

// Read existing config or create new one
let config = { mcpServers: {} };
if (existsSync(configPath)) {
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
    console.log('✓ Found existing Claude Desktop configuration');
  } catch (error) {
    console.error('Error reading existing config:', error.message);
    process.exit(1);
  }
} else {
  console.log('✓ Creating new Claude Desktop configuration');
}

// Get the Node.js command using our robust detection
const nodeCommand = getNodeExecutablePath();

// Add or update rough-cut-mcp server configuration
config.mcpServers = config.mcpServers || {};

// For Windows paths in JSON, we need proper escaping
// But only escape if we're on Windows
const escapedBuildPath = platform() === 'win32' ? buildPath.replace(/\\/g, '\\\\') : buildPath;
const escapedAssetsPath = platform() === 'win32' ? assetsPath.replace(/\\/g, '\\\\') : assetsPath;

config.mcpServers['rough-cut-mcp'] = {
  command: nodeCommand,
  args: [escapedBuildPath],
  env: {
    REMOTION_ASSETS_DIR: escapedAssetsPath,
    NODE_ENV: 'production'
  }
};

console.log(`🎯 MCP server will run from: ${buildPath}`);

// Write updated config
try {
  if (!existsSync(claudeConfigDir)) {
    mkdirSync(claudeConfigDir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✓ Updated Claude Desktop configuration');
  console.log(`  Configuration saved to: ${configPath}`);
  console.log(`  Using Node.js: ${nodeCommand}`);
} catch (error) {
  console.error('Error writing config:', error.message);
  console.log('\nPlease manually add the following to your claude_desktop_config.json:');
  console.log(JSON.stringify({ 'rough-cut-mcp': config.mcpServers['rough-cut-mcp'] }, null, 2));
  process.exit(1);
}

// Create assets directory if it doesn't exist
if (!existsSync(assetsPath)) {
  mkdirSync(assetsPath, { recursive: true });
  console.log('✓ Created assets directory');
}

console.log('\n✅ Installation complete!');
console.log('\n📝 Next steps:');
console.log('1. Restart Claude Desktop');
console.log('2. Test the MCP server by typing: "Use the discover tool"');
console.log('\n🎯 Quick test commands:');
console.log('  • "Show available tool categories" - Lists all tools');
console.log('  • "Create a simple text animation" - Creates your first video');
console.log('  • "Launch Remotion Studio" - Opens the video editor');
console.log('\n📖 Full documentation: https://github.com/endlessblink/rough-cut-mcp\n');

// Debug mode hint
console.log('💡 Tip: Set DEBUG_MCP_INSTALL=true to see detailed path detection info\n');

// Optional telemetry collection (opt-in only)
await collectTelemetry(nodeCommand, buildPath);