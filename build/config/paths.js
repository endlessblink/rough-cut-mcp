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
    static _instance;
    _projectRoot;
    _isWSL;
    _isWindows;
    constructor() {
        this._isWSL = this.detectWSL();
        this._isWindows = process.platform === 'win32';
        this._projectRoot = this.findProjectRoot();
    }
    static getInstance() {
        if (!PathManager._instance) {
            PathManager._instance = new PathManager();
        }
        return PathManager._instance;
    }
    /**
     * Detect if we're running in WSL2
     */
    detectWSL() {
        try {
            return process.platform === 'linux' &&
                (fs.existsSync('/mnt/c') ||
                    process.env.WSL_DISTRO_NAME !== undefined ||
                    fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft'));
        }
        catch {
            return false;
        }
    }
    /**
     * Find the project root directory
     */
    findProjectRoot() {
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
    toWindowsPath(wslPath) {
        if (!this._isWSL)
            return wslPath;
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
    toWSLPath(windowsPath) {
        if (!windowsPath.match(/^[A-Z]:\\/))
            return windowsPath;
        const drive = windowsPath.charAt(0).toLowerCase();
        const rest = windowsPath.substring(3).replace(/\\/g, '/');
        return `/mnt/${drive}/${rest}`;
    }
    /**
     * Get platform-appropriate path
     */
    resolvePath(relativePath) {
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
    getWindowsPath(relativePath) {
        const fullPath = path.resolve(this._projectRoot, relativePath);
        return this.toWindowsPath(fullPath);
    }
    /**
     * Get development path (current environment)
     */
    getDevPath(relativePath) {
        return path.resolve(this._projectRoot, relativePath);
    }
    // Pre-defined paths
    get projectRoot() {
        return this._projectRoot;
    }
    get assetsDir() {
        return this.resolvePath('assets');
    }
    get buildDir() {
        return this.resolvePath('build');
    }
    get srcDir() {
        return this.resolvePath('src');
    }
    get projectsDir() {
        return this.resolvePath('assets/projects');
    }
    get videosDir() {
        return this.resolvePath('assets/videos');
    }
    get cacheDir() {
        return this.resolvePath('assets/cache');
    }
    get tempDir() {
        return this.resolvePath('assets/temp');
    }
    get scriptsDir() {
        return this.resolvePath('scripts');
    }
    get testDir() {
        return this.resolvePath('test');
    }
    get configDir() {
        return this.resolvePath('config');
    }
    // Claude Desktop config paths
    get claudeConfigPath() {
        if (this._isWSL) {
            return '/mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json';
        }
        else if (this._isWindows) {
            return 'C:\\Users\\endle\\AppData\\Roaming\\Claude\\claude_desktop_config.json';
        }
        else {
            // macOS/Linux
            return path.join(process.env.HOME || '~', '.config/claude/claude_desktop_config.json');
        }
    }
    // Node.js executable paths
    get nodeExecutable() {
        if (this._isWindows || process.env.NODE_ENV === 'production') {
            return 'C:\\Program Files\\nodejs\\node.exe';
        }
        return 'node';
    }
    // Environment info
    get environment() {
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
    validatePath(pathToCheck) {
        try {
            return fs.existsSync(pathToCheck);
        }
        catch {
            return false;
        }
    }
    /**
     * Ensure directory exists
     */
    ensureDir(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }
    /**
     * Get relative path from project root
     */
    getRelativePath(absolutePath) {
        return path.relative(this._projectRoot, absolutePath);
    }
}
// Singleton instance
export const paths = PathManager.getInstance();
// Convenience exports
export const { projectRoot, assetsDir, buildDir, srcDir, projectsDir, videosDir, cacheDir, tempDir, scriptsDir, testDir, configDir, claudeConfigPath, nodeExecutable } = paths;
//# sourceMappingURL=paths.js.map