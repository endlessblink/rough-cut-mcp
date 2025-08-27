/**
 * Path utilities for scripts - centralizes path management
 * Replaces hardcoded paths across all scripts
 */

const path = require('path');
const fs = require('fs');

class ScriptPathManager {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.isWSL = this.detectWSL();
    this.isWindows = process.platform === 'win32';
  }

  /**
   * Find project root by looking for package.json
   */
  findProjectRoot() {
    let currentDir = __dirname;
    
    while (currentDir !== path.dirname(currentDir)) {
      const packagePath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          if (pkg.name === 'rough-cut-mcp') {
            return currentDir;
          }
        } catch {
          // Continue searching
        }
      }
      currentDir = path.dirname(currentDir);
    }
    
    // Fallback: assume we're in scripts/setup, so go up two levels
    return path.resolve(__dirname, '../..');
  }

  /**
   * Detect WSL environment
   */
  detectWSL() {
    try {
      return process.platform === 'linux' && 
             (fs.existsSync('/mnt/c') || 
              process.env.WSL_DISTRO_NAME !== undefined ||
              fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft'));
    } catch {
      return false;
    }
  }

  /**
   * Convert WSL path to Windows path
   */
  toWindowsPath(wslPath) {
    if (!this.isWSL) return wslPath;
    
    const wslMatch = wslPath.match(/^\/mnt\/([a-z])\/(.*)$/);
    if (wslMatch) {
      const [, drive, rest] = wslMatch;
      return `${drive.toUpperCase()}:\\${rest.replace(/\//g, '\\')}`;
    }
    
    return wslPath;
  }

  /**
   * Get platform-appropriate path
   */
  resolvePath(relativePath) {
    const fullPath = path.resolve(this.projectRoot, relativePath);
    return fullPath;
  }

  /**
   * Get Windows path (for MCP config)
   */
  getWindowsPath(relativePath) {
    const fullPath = path.resolve(this.projectRoot, relativePath);
    return this.toWindowsPath(fullPath);
  }

  // Common paths
  get buildPath() {
    return this.getWindowsPath('build/index.js');
  }

  get claudeConfigPath() {
    if (this.isWSL) {
      return '/mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json';
    } else if (this.isWindows) {
      return 'C:\\Users\\endle\\AppData\\Roaming\\Claude\\claude_desktop_config.json';
    } else {
      return path.join(process.env.HOME || '~', '.config/claude/claude_desktop_config.json');
    }
  }

  get nodeExecutable() {
    if (this.isWindows || process.env.NODE_ENV === 'production') {
      return 'C:\\Program Files\\nodejs\\node.exe';
    }
    return 'node';
  }

  get assetsDir() {
    return this.getWindowsPath('assets');
  }

  get scriptsDir() {
    return this.resolvePath('scripts');
  }

  get testDir() {
    return this.resolvePath('test');
  }

  // Environment info
  get environment() {
    return {
      isWSL: this.isWSL,
      isWindows: this.isWindows,
      platform: process.platform,
      nodeVersion: process.version,
      projectRoot: this.projectRoot
    };
  }
}

module.exports = new ScriptPathManager();