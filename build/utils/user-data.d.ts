/**
 * Get the appropriate user data directory for rough-cut-mcp
 * Uses standard OS conventions:
 * - Windows: %APPDATA%/rough-cut-mcp
 * - macOS: ~/Library/Application Support/rough-cut-mcp
 * - Linux: ~/.local/share/rough-cut-mcp
 */
export declare function getUserDataDirectory(): string;
/**
 * Initialize user data directory structure
 */
export declare function initializeUserDataDirectory(): Promise<{
    userDataDir: string;
    projectsDir: string;
    assetsDir: string;
    cacheDir: string;
    templatesDir: string;
}>;
/**
 * Copy essential templates to user data directory
 */
export declare function copyEssentialTemplates(sourceTemplatesDir: string, userTemplatesDir: string): Promise<void>;
/**
 * Get the installation directory of the MCP server
 */
export declare function getInstallationDirectory(): string;
/**
 * Migrate existing projects from development location to user data directory
 */
export declare function migrateExistingProjects(oldProjectsDir: string, newProjectsDir: string): Promise<{
    migrated: number;
    skipped: number;
    errors: string[];
}>;
//# sourceMappingURL=user-data.d.ts.map