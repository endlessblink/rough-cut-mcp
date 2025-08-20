#!/usr/bin/env node

/**
 * Automatic installer for Remotion Creative MCP Server in Claude Desktop
 * 
 * Usage: npx install-to-claude.js
 * 
 * This script will:
 * 1. Build the project
 * 2. Find Claude Desktop config
 * 3. Add the MCP server configuration
 * 4. Provide instructions for completion
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = '') {
  console.log(color + message + colors.reset);
}

function getClaudeConfigPath() {
  const platform = os.platform();
  const homeDir = os.homedir();
  
  // Check if we're in WSL but targeting Windows Claude Desktop
  const isWSL = process.platform === 'linux' && fs.existsSync('/mnt/c');
  
  if (isWSL) {
    // Running in WSL, use Windows path
    const windowsUser = 'endle';
    return `/mnt/c/Users/${windowsUser}/AppData/Roaming/Claude/claude_desktop_config.json`;
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    return path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: true, ...options });
    
    proc.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });
    
    proc.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });
    
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  log('\n🚀 Rough Cut MCP - Claude Desktop Installer\n', colors.bright + colors.blue);
  log('=' .repeat(60));
  
  try {
    // Step 1: Check if we're in the right directory
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('package.json not found. Please run this from the project root directory.');
    }
    
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.name !== 'rough-cut-mcp') {
      throw new Error('This doesn\'t appear to be the Rough Cut MCP project.');
    }
    
    // Step 2: Install dependencies (only if needed)
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!await fs.pathExists(nodeModulesPath)) {
      log('\n📦 Installing dependencies...', colors.yellow);
      await runCommand('npm', ['install'], { cwd: __dirname });
      log('✅ Dependencies installed', colors.green);
    } else {
      log('\n✅ Dependencies already installed', colors.green);
    }
    
    // Step 3: Build the project
    log('\n🔨 Building the project...', colors.yellow);
    await runCommand('npm', ['run', 'build'], { cwd: __dirname });
    log('✅ Project built successfully', colors.green);
    
    // Step 4: Find Claude Desktop config
    log('\n🔍 Looking for Claude Desktop configuration...', colors.yellow);
    const configPath = getClaudeConfigPath();
    const configDir = path.dirname(configPath);
    
    // Create config directory if it doesn't exist (handle WSL permissions)
    const isWSL = process.platform === 'linux' && fs.existsSync('/mnt/c');
    try {
      await fs.ensureDir(configDir);
    } catch (error) {
      if (error.code === 'EACCES' && isWSL) {
        // Can't create directory from WSL, but that's okay if the file exists
        if (!await fs.pathExists(configPath)) {
          log('⚠️  Cannot create config directory from WSL', colors.yellow);
          log('The Claude config directory should exist. Please check:', colors.yellow);
          log(`   ${configDir}`, colors.yellow);
        }
      } else {
        throw error;
      }
    }
    
    // Load existing config or create new one
    let config = {};
    if (await fs.pathExists(configPath)) {
      log(`Found config at: ${configPath}`, colors.green);
      config = await fs.readJson(configPath);
    } else {
      log('Creating new Claude Desktop configuration', colors.yellow);
    }
    
    // Step 5: Add MCP server configuration
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    // Convert paths to Windows format if in WSL
    let serverPath = path.join(__dirname, 'build', 'index.js');
    let assetsPath = path.join(__dirname, 'assets');
    
    if (isWSL) {
      // Convert WSL paths to Windows paths
      serverPath = serverPath.replace('/mnt/d/', 'D:\\').replace(/\//g, '\\');
      assetsPath = assetsPath.replace('/mnt/d/', 'D:\\').replace(/\//g, '\\');
    }
    
    config.mcpServers['rough-cut-mcp'] = {
      command: 'node',
      args: [serverPath],
      env: {
        REMOTION_ASSETS_DIR: assetsPath,
      },
    };
    
    log('\n📝 Adding MCP server configuration...', colors.yellow);
    
    // Step 6: Save the configuration
    try {
      await fs.writeJson(configPath, config, { spaces: 2 });
      log('✅ Configuration saved successfully', colors.green);
    } catch (writeError) {
      // If we can't write (e.g., WSL to Windows), show manual instructions
      if (writeError.code === 'EACCES' && isWSL) {
        log('\n⚠️  Cannot write to Windows path from WSL', colors.yellow);
        log('The configuration has been prepared. Please:', colors.yellow);
        log('1. The config is already updated in your Claude Desktop', colors.green);
        log('2. Or copy the configuration shown below manually', colors.yellow);
        
        // Save config to local file for easy copying
        const localConfigPath = path.join(__dirname, 'claude-config-to-add.json');
        await fs.writeJson(localConfigPath, { 'rough-cut-mcp': config.mcpServers['rough-cut-mcp'] }, { spaces: 2 });
        log(`\n📁 Configuration saved to: ${localConfigPath}`, colors.green);
        log('You can copy this to your Claude config file', colors.yellow);
      } else {
        throw writeError;
      }
    }
    
    // Step 7: Show summary
    log('\n' + '=' .repeat(60), colors.bright);
    log('🎉 Installation Complete!', colors.bright + colors.green);
    log('=' .repeat(60), colors.bright);
    
    log('\n📋 What was installed:', colors.blue);
    log('   • Rough Cut MCP Server');
    log('   • 14 core tools (video, asset management, studio)');
    log('   • Remotion Studio integration');
    log('   • Support for AI services (optional)');
    
    log('\n🚀 Next Steps:', colors.blue);
    log('   1. Restart Claude Desktop');
    log('   2. The tools will be available immediately');
    log('   3. Try: "Create a 5-second welcome video"');
    log('   4. Try: "Launch Remotion Studio"');
    
    log('\n🔧 Optional: Add API Keys', colors.yellow);
    log('   Edit the config file to add API keys for AI features:');
    log(`   ${configPath}`);
    log('\n   Add to the env section:');
    log('   "ELEVENLABS_API_KEY": "your-key",');
    log('   "FREESOUND_API_KEY": "your-key",');
    log('   "FLUX_API_KEY": "your-key"');
    
    log('\n📚 Available Commands in Claude:', colors.blue);
    log('   • "Create a text video with [your text]"');
    log('   • "Launch Remotion Studio"');
    log('   • "Create a new Remotion project called [name]"');
    log('   • "Open my last video in the browser"');
    log('   • "Get asset statistics"');
    log('   • "Estimate render time for a 60-second video"');
    
    log('\n✨ Enjoy creating videos with Claude Desktop!', colors.bright + colors.green);
    
  } catch (error) {
    log('\n❌ Installation failed:', colors.red);
    log(error.message, colors.red);
    
    log('\n💡 Manual Installation:', colors.yellow);
    log('   1. Run: npm install && npm run build');
    log('   2. Find your Claude config file:');
    log(`      ${getClaudeConfigPath()}`);
    log('   3. Add this configuration:');
    
    // Generate proper paths for manual installation
    const isWSL = process.platform === 'linux' && fs.existsSync('/mnt/c');
    let serverPath = path.join(__dirname, 'build', 'index.js');
    let assetsPath = path.join(__dirname, 'assets');
    
    if (isWSL) {
      // Convert to Windows paths for manual instructions
      serverPath = serverPath.replace('/mnt/d/', 'D:\\\\').replace(/\//g, '\\\\');
      assetsPath = assetsPath.replace('/mnt/d/', 'D:\\\\').replace(/\//g, '\\\\');
    } else {
      serverPath = serverPath.replace(/\\/g, '\\\\');
      assetsPath = assetsPath.replace(/\\/g, '\\\\');
    }
    
    console.log(`
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "node",
      "args": ["${serverPath}"],
      "env": {
        "REMOTION_ASSETS_DIR": "${assetsPath}"
      }
    }
  }
}
    `);
    
    process.exit(1);
  }
}

// Run the installer
main().catch(console.error);