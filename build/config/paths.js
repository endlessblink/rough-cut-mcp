"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeExecutable = exports.claudeConfigPath = exports.configDir = exports.testDir = exports.scriptsDir = exports.tempDir = exports.cacheDir = exports.videosDir = exports.projectsDir = exports.srcDir = exports.buildDir = exports.assetsDir = exports.projectRoot = exports.paths = exports.PathManager = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Use CommonJS __dirname which TypeScript provides
// This works in both CommonJS and ESM contexts
/**
 * Centralized path management for RoughCut MCP
 * Handles both WSL2 development and Windows production environments
 */
class PathManager {
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
                (fs_1.default.existsSync('/mnt/c') ||
                    process.env.WSL_DISTRO_NAME !== undefined ||
                    fs_1.default.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft'));
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
        while (currentDir !== path_1.default.dirname(currentDir)) {
            if (fs_1.default.existsSync(path_1.default.join(currentDir, 'package.json'))) {
                const packageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join(currentDir, 'package.json'), 'utf8'));
                if (packageJson.name === 'rough-cut-mcp') {
                    return currentDir;
                }
            }
            currentDir = path_1.default.dirname(currentDir);
        }
        // Fallback - go up from src/config to project root
        return path_1.default.resolve(__dirname, '../..');
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
        const fullPath = path_1.default.resolve(this._projectRoot, relativePath);
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
        const fullPath = path_1.default.resolve(this._projectRoot, relativePath);
        return this.toWindowsPath(fullPath);
    }
    /**
     * Get development path (current environment)
     */
    getDevPath(relativePath) {
        return path_1.default.resolve(this._projectRoot, relativePath);
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
            return path_1.default.join(process.env.HOME || '~', '.config/claude/claude_desktop_config.json');
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
            return fs_1.default.existsSync(pathToCheck);
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
        if (!fs_1.default.existsSync(fullPath)) {
            fs_1.default.mkdirSync(fullPath, { recursive: true });
        }
    }
    /**
     * Get relative path from project root
     */
    getRelativePath(absolutePath) {
        return path_1.default.relative(this._projectRoot, absolutePath);
    }
}
exports.PathManager = PathManager;
// Singleton instance
exports.paths = PathManager.getInstance();
// Convenience exports
exports.projectRoot = exports.paths.projectRoot, exports.assetsDir = exports.paths.assetsDir, exports.buildDir = exports.paths.buildDir, exports.srcDir = exports.paths.srcDir, exports.projectsDir = exports.paths.projectsDir, exports.videosDir = exports.paths.videosDir, exports.cacheDir = exports.paths.cacheDir, exports.tempDir = exports.paths.tempDir, exports.scriptsDir = exports.paths.scriptsDir, exports.testDir = exports.paths.testDir, exports.configDir = exports.paths.configDir, exports.claudeConfigPath = exports.paths.claudeConfigPath, exports.nodeExecutable = exports.paths.nodeExecutable;
//# sourceMappingURL=paths.js.map