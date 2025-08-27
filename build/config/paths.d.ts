/**
 * Centralized path management for RoughCut MCP
 * Handles both WSL2 development and Windows production environments
 */
export declare class PathManager {
    private static _instance;
    private _projectRoot;
    private _isWSL;
    private _isWindows;
    private constructor();
    static getInstance(): PathManager;
    /**
     * Detect if we're running in WSL2
     */
    private detectWSL;
    /**
     * Find the project root directory
     */
    private findProjectRoot;
    /**
     * Convert WSL path to Windows path if needed
     */
    private toWindowsPath;
    /**
     * Convert Windows path to WSL path if needed for development
     */
    private toWSLPath;
    /**
     * Get platform-appropriate path
     */
    resolvePath(relativePath: string): string;
    /**
     * Get Windows-compatible path (for MCP server output)
     */
    getWindowsPath(relativePath: string): string;
    /**
     * Get development path (current environment)
     */
    getDevPath(relativePath: string): string;
    get projectRoot(): string;
    get assetsDir(): string;
    get buildDir(): string;
    get srcDir(): string;
    get projectsDir(): string;
    get videosDir(): string;
    get cacheDir(): string;
    get tempDir(): string;
    get scriptsDir(): string;
    get testDir(): string;
    get configDir(): string;
    get claudeConfigPath(): string;
    get nodeExecutable(): string;
    get environment(): {
        isWSL: boolean;
        isWindows: boolean;
        platform: string;
        nodeVersion: string;
    };
    /**
     * Validate that a path exists and is accessible
     */
    validatePath(pathToCheck: string): boolean;
    /**
     * Ensure directory exists
     */
    ensureDir(dirPath: string): void;
    /**
     * Get relative path from project root
     */
    getRelativePath(absolutePath: string): string;
}
export declare const paths: PathManager;
export declare const projectRoot: string, assetsDir: string, buildDir: string, srcDir: string, projectsDir: string, videosDir: string, cacheDir: string, tempDir: string, scriptsDir: string, testDir: string, configDir: string, claudeConfigPath: string, nodeExecutable: string;
//# sourceMappingURL=paths.d.ts.map