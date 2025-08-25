import { MCPConfig, AssetCleanupInfo } from '../types/index.js';
export declare class FileManagerService {
    private config;
    private logger;
    constructor(config: MCPConfig);
    /**
     * Initialize asset directories
     */
    initializeDirectories(): Promise<void>;
    /**
     * Get disk usage for asset directories
     */
    getAssetDiskUsage(): Promise<{
        total: number;
        byType: Record<string, {
            size: number;
            count: number;
        }>;
        directories: Record<string, {
            size: number;
            count: number;
        }>;
    }>;
    /**
     * Clean up old assets based on age
     */
    cleanupOldAssets(maxAgeHours?: number, dryRun?: boolean): Promise<AssetCleanupInfo[]>;
    /**
     * Remove empty directories recursively
     */
    removeEmptyDirectories(): Promise<void>;
    /**
     * Organize assets by moving them to appropriate directories
     */
    organizeAssets(): Promise<{
        moved: number;
        errors: number;
    }>;
    /**
     * Create backup of important assets
     */
    createBackup(backupDir: string, includeTypes?: ('audio' | 'image' | 'video')[]): Promise<{
        backedUp: number;
        totalSize: number;
    }>;
    /**
     * Get unique file path to avoid conflicts
     */
    private getUniqueFilePath;
    /**
     * Check if file is in correct directory based on extension
     */
    private isCorrectDirectory;
    /**
     * Walk directory recursively
     */
    private walkDirectory;
    /**
     * Get directory size and file count
     */
    private getDirectorySize;
    /**
     * Format bytes as human readable string
     */
    private formatBytes;
    /**
     * Get asset statistics
     */
    getAssetStatistics(): Promise<{
        diskUsage: any;
        oldAssets: AssetCleanupInfo[];
        summary: {
            totalFiles: number;
            totalSize: string;
            oldestFile: {
                path: string;
                age: number;
            } | null;
            newestFile: {
                path: string;
                age: number;
            } | null;
        };
    }>;
}
//# sourceMappingURL=file-manager.d.ts.map