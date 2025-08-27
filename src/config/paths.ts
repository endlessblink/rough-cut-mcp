import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Centralized path management for RoughCut MCP
 * Handles both WSL2 development and Windows production environments
 */

export class PathManager {
  private static _instance: PathManager;
  private _projectRoot: string;
  private _isWSL: boolean;
  private _isWindows: boolean;

  private constructor() {
    this._isWSL = this.detectWSL();
    this._isWindows = process.platform === 'win32';
    this._projectRoot = this.findProjectRoot();
  }

  static getInstance(): PathManager {
    if (!PathManager._instance) {
      PathManager._instance = new PathManager();
    }
    return PathManager._instance;
  }

  /**
   * Detect if we're running in WSL2
   */
  private detectWSL(): boolean {
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
   * Find the project root directory
   */
  private findProjectRoot(): string {
    let currentDir = __dirname;
    
    // Walk up until we find package.json
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'));
        if (packageJson.name === 'rough-cut-mcp') {
          return currentDir;
        }
      }
      currentDir = path.dirname(currentDir);
    }

    // Fallback - go up from src/config to project root
    return path.resolve(__dirname, '../..');
  }

  /**
   * Convert WSL path to Windows path if needed
   */
  private toWindowsPath(wslPath: string): string {
    if (!this._isWSL) return wslPath;
    
    // Convert /mnt/d/... to D:\...
    const wslMatch = wslPath.match(/^\/mnt\/([a-z])\/(.*)$/);
    if (wslMatch) {
      const [, drive, rest] = wslMatch;
      return `${drive.toUpperCase()}:\\${rest.replace(/\//g, '\\')}`;
    }
    
    return wslPath;
  }

  /**
   * Convert Windows path to WSL path if needed for development
   */
  private toWSLPath(windowsPath: string): string {
    if (!windowsPath.match(/^[A-Z]:\\/)) return windowsPath;
    
    const drive = windowsPath.charAt(0).toLowerCase();
    const rest = windowsPath.substring(3).replace(/\\/g, '/');
    return `/mnt/${drive}/${rest}`;
  }

  /**
   * Get platform-appropriate path
   */
  public resolvePath(relativePath: string): string {
    const fullPath = path.resolve(this._projectRoot, relativePath);
    
    // For production builds, always use Windows paths
    if (process.env.NODE_ENV === 'production' || process.env.FORCE_WINDOWS_PATHS === 'true') {
      return this.toWindowsPath(fullPath);
    }
    
    return fullPath;
  }

  /**
   * Get Windows-compatible path (for MCP server output)
   */
  public getWindowsPath(relativePath: string): string {
    const fullPath = path.resolve(this._projectRoot, relativePath);
    return this.toWindowsPath(fullPath);
  }

  /**
   * Get development path (current environment)
   */
  public getDevPath(relativePath: string): string {
    return path.resolve(this._projectRoot, relativePath);
  }

  // Pre-defined paths
  public get projectRoot(): string {
    return this._projectRoot;
  }

  public get assetsDir(): string {
    return this.resolvePath('assets');
  }

  public get buildDir(): string {
    return this.resolvePath('build');
  }

  public get srcDir(): string {
    return this.resolvePath('src');
  }

  public get projectsDir(): string {
    return this.resolvePath('assets/projects');
  }

  public get videosDir(): string {
    return this.resolvePath('assets/videos');
  }

  public get cacheDir(): string {
    return this.resolvePath('assets/cache');
  }

  public get tempDir(): string {
    return this.resolvePath('assets/temp');
  }

  public get scriptsDir(): string {
    return this.resolvePath('scripts');
  }

  public get testDir(): string {
    return this.resolvePath('test');
  }

  public get configDir(): string {
    return this.resolvePath('config');
  }

  // Claude Desktop config paths
  public get claudeConfigPath(): string {
    if (this._isWSL) {
      return '/mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json';
    } else if (this._isWindows) {
      return 'C:\\Users\\endle\\AppData\\Roaming\\Claude\\claude_desktop_config.json';
    } else {
      // macOS/Linux
      return path.join(process.env.HOME || '~', '.config/claude/claude_desktop_config.json');
    }
  }

  // Node.js executable paths
  public get nodeExecutable(): string {
    if (this._isWindows || process.env.NODE_ENV === 'production') {
      return 'C:\\Program Files\\nodejs\\node.exe';
    }
    return 'node';
  }

  // Environment info
  public get environment(): {
    isWSL: boolean;
    isWindows: boolean;
    platform: string;
    nodeVersion: string;
  } {
    return {
      isWSL: this._isWSL,
      isWindows: this._isWindows,
      platform: process.platform,
      nodeVersion: process.version
    };
  }

  /**
   * Validate that a path exists and is accessible
   */
  public validatePath(pathToCheck: string): boolean {
    try {
      return fs.existsSync(pathToCheck);
    } catch {
      return false;
    }
  }

  /**
   * Ensure directory exists
   */
  public ensureDir(dirPath: string): void {
    const fullPath = this.resolvePath(dirPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  /**
   * Get relative path from project root
   */
  public getRelativePath(absolutePath: string): string {
    return path.relative(this._projectRoot, absolutePath);
  }
}

// Singleton instance
export const paths = PathManager.getInstance();

// Convenience exports
export const {
  projectRoot,
  assetsDir,
  buildDir,
  srcDir,
  projectsDir,
  videosDir,
  cacheDir,
  tempDir,
  scriptsDir,
  testDir,
  configDir,
  claudeConfigPath,
  nodeExecutable
} = paths;