"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManagerService = void 0;
// Asset lifecycle management service
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_js_1 = require("../utils/config.js");
const logger_js_1 = require("../utils/logger.js");
const validation_js_1 = require("../utils/validation.js");
class FileManagerService {
    config;
    logger = (0, logger_js_1.getLogger)().service('FileManager');
    constructor(config) {
        this.config = config;
        this.logger.info('File manager service initialized');
    }
    /**
     * Initialize asset directories
     */
    async initializeDirectories() {
        const directories = [
            (0, config_js_1.getAssetPath)(this.config, 'temp'),
            (0, config_js_1.getAssetPath)(this.config, 'videos'),
            (0, config_js_1.getAssetPath)(this.config, 'audio'),
            (0, config_js_1.getAssetPath)(this.config, 'images'),
        ];
        for (const dir of directories) {
            await fs_extra_1.default.ensureDir(dir);
            this.logger.debug('Ensured directory exists', { dir });
        }
        this.logger.info('Asset directories initialized');
    }
    /**
     * Get disk usage for asset directories
     */
    async getAssetDiskUsage() {
        const directories = {
            temp: (0, config_js_1.getAssetPath)(this.config, 'temp'),
            videos: (0, config_js_1.getAssetPath)(this.config, 'videos'),
            audio: (0, config_js_1.getAssetPath)(this.config, 'audio'),
            images: (0, config_js_1.getAssetPath)(this.config, 'images'),
        };
        const result = {
            total: 0,
            byType: {},
            directories: {},
        };
        for (const [dirName, dirPath] of Object.entries(directories)) {
            try {
                if (await fs_extra_1.default.pathExists(dirPath)) {
                    const dirStats = await this.getDirectorySize(dirPath);
                    result.directories[dirName] = dirStats;
                    result.total += dirStats.size;
                    // Count by file type
                    await this.walkDirectory(dirPath, (filePath, stats) => {
                        const ext = path_1.default.extname(filePath).toLowerCase().slice(1);
                        let type = 'other';
                        if (validation_js_1.AudioExtensions.includes(ext))
                            type = 'audio';
                        else if (validation_js_1.ImageExtensions.includes(ext))
                            type = 'image';
                        else if (validation_js_1.VideoExtensions.includes(ext))
                            type = 'video';
                        if (!result.byType[type]) {
                            result.byType[type] = { size: 0, count: 0 };
                        }
                        result.byType[type].size += stats.size;
                        result.byType[type].count++;
                    });
                }
            }
            catch (error) {
                this.logger.warn('Error calculating disk usage for directory', {
                    dirName,
                    dirPath,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        this.logger.info('Disk usage calculated', result);
        return result;
    }
    /**
     * Clean up old assets based on age
     */
    async cleanupOldAssets(maxAgeHours, dryRun = false) {
        const ageLimit = maxAgeHours || this.config.fileManagement.maxAssetAgeHours;
        const cutoffTime = Date.now() - (ageLimit * 60 * 60 * 1000);
        this.logger.info('Starting asset cleanup', { maxAgeHours: ageLimit, dryRun });
        const directories = {
            temp: (0, config_js_1.getAssetPath)(this.config, 'temp'),
            videos: (0, config_js_1.getAssetPath)(this.config, 'videos'),
            audio: (0, config_js_1.getAssetPath)(this.config, 'audio'),
            images: (0, config_js_1.getAssetPath)(this.config, 'images'),
        };
        const oldAssets = [];
        for (const [dirType, dirPath] of Object.entries(directories)) {
            try {
                if (await fs_extra_1.default.pathExists(dirPath)) {
                    await this.walkDirectory(dirPath, async (filePath, stats) => {
                        if (stats.mtime.getTime() < cutoffTime) {
                            const ext = path_1.default.extname(filePath).toLowerCase().slice(1);
                            let type = 'temp';
                            if (validation_js_1.AudioExtensions.includes(ext))
                                type = 'audio';
                            else if (validation_js_1.ImageExtensions.includes(ext))
                                type = 'image';
                            else if (validation_js_1.VideoExtensions.includes(ext))
                                type = 'video';
                            const assetInfo = {
                                path: filePath,
                                type,
                                size: stats.size,
                                lastModified: stats.mtime,
                                age: (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60),
                            };
                            oldAssets.push(assetInfo);
                            if (!dryRun) {
                                await fs_extra_1.default.remove(filePath);
                                this.logger.debug('Removed old asset', {
                                    path: filePath,
                                    age: assetInfo.age.toFixed(1) + 'h'
                                });
                            }
                        }
                    });
                }
            }
            catch (error) {
                this.logger.error('Error during cleanup in directory', {
                    dirType,
                    dirPath,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        // Clean up empty directories
        if (!dryRun) {
            await this.removeEmptyDirectories();
        }
        const totalSize = oldAssets.reduce((sum, asset) => sum + asset.size, 0);
        this.logger.info('Asset cleanup completed', {
            filesProcessed: oldAssets.length,
            totalSizeFreed: this.formatBytes(totalSize),
            dryRun
        });
        return oldAssets;
    }
    /**
     * Remove empty directories recursively
     */
    async removeEmptyDirectories() {
        const baseDir = (0, config_js_1.getAssetPath)(this.config);
        const removeEmpty = async (dirPath) => {
            try {
                const entries = await fs_extra_1.default.readdir(dirPath);
                // Remove empty subdirectories first
                for (const entry of entries) {
                    const entryPath = path_1.default.join(dirPath, entry);
                    const stats = await fs_extra_1.default.stat(entryPath);
                    if (stats.isDirectory()) {
                        const isEmpty = await removeEmpty(entryPath);
                        if (isEmpty) {
                            await fs_extra_1.default.rmdir(entryPath);
                            this.logger.debug('Removed empty directory', { path: entryPath });
                        }
                    }
                }
                // Check if current directory is now empty
                const remainingEntries = await fs_extra_1.default.readdir(dirPath);
                return remainingEntries.length === 0;
            }
            catch (error) {
                this.logger.warn('Error checking directory', {
                    dirPath,
                    error: error instanceof Error ? error.message : String(error)
                });
                return false;
            }
        };
        await removeEmpty(baseDir);
    }
    /**
     * Organize assets by moving them to appropriate directories
     */
    async organizeAssets() {
        this.logger.info('Starting asset organization');
        const baseDir = (0, config_js_1.getAssetPath)(this.config);
        let moved = 0;
        let errors = 0;
        await this.walkDirectory(baseDir, async (filePath, stats) => {
            if (!stats.isFile())
                return;
            const ext = path_1.default.extname(filePath).toLowerCase().slice(1);
            const relativePath = path_1.default.relative(baseDir, filePath);
            // Skip if already in correct directory
            if (relativePath.includes(path_1.default.sep)) {
                const currentDir = relativePath.split(path_1.default.sep)[0];
                if (this.isCorrectDirectory(ext, currentDir)) {
                    return;
                }
            }
            let targetDir;
            if (validation_js_1.AudioExtensions.includes(ext)) {
                targetDir = (0, config_js_1.getAssetPath)(this.config, 'audio');
            }
            else if (validation_js_1.ImageExtensions.includes(ext)) {
                targetDir = (0, config_js_1.getAssetPath)(this.config, 'images');
            }
            else if (validation_js_1.VideoExtensions.includes(ext)) {
                targetDir = (0, config_js_1.getAssetPath)(this.config, 'videos');
            }
            else {
                targetDir = (0, config_js_1.getAssetPath)(this.config, 'temp');
            }
            try {
                await fs_extra_1.default.ensureDir(targetDir);
                const filename = path_1.default.basename(filePath);
                const targetPath = path_1.default.join(targetDir, filename);
                // Handle filename conflicts
                const finalPath = await this.getUniqueFilePath(targetPath);
                await fs_extra_1.default.move(filePath, finalPath);
                moved++;
                this.logger.debug('Moved asset to correct directory', {
                    from: filePath,
                    to: finalPath
                });
            }
            catch (error) {
                errors++;
                this.logger.error('Failed to move asset', {
                    filePath,
                    targetDir,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
        this.logger.info('Asset organization completed', { moved, errors });
        return { moved, errors };
    }
    /**
     * Create backup of important assets
     */
    async createBackup(backupDir, includeTypes = ['video']) {
        this.logger.info('Creating asset backup', { backupDir, includeTypes });
        await fs_extra_1.default.ensureDir(backupDir);
        let backedUp = 0;
        let totalSize = 0;
        for (const type of includeTypes) {
            const sourceDir = (0, config_js_1.getAssetPath)(this.config, type);
            const targetDir = path_1.default.join(backupDir, type);
            if (await fs_extra_1.default.pathExists(sourceDir)) {
                await fs_extra_1.default.copy(sourceDir, targetDir);
                const dirStats = await this.getDirectorySize(targetDir);
                backedUp += dirStats.count;
                totalSize += dirStats.size;
                this.logger.debug('Backed up directory', {
                    type,
                    files: dirStats.count,
                    size: this.formatBytes(dirStats.size)
                });
            }
        }
        this.logger.info('Backup completed', {
            backedUp,
            totalSize: this.formatBytes(totalSize)
        });
        return { backedUp, totalSize };
    }
    /**
     * Get unique file path to avoid conflicts
     */
    async getUniqueFilePath(originalPath) {
        let counter = 0;
        let testPath = originalPath;
        while (await fs_extra_1.default.pathExists(testPath)) {
            counter++;
            const ext = path_1.default.extname(originalPath);
            const base = path_1.default.basename(originalPath, ext);
            const dir = path_1.default.dirname(originalPath);
            testPath = path_1.default.join(dir, `${base}_${counter}${ext}`);
        }
        return testPath;
    }
    /**
     * Check if file is in correct directory based on extension
     */
    isCorrectDirectory(extension, currentDir) {
        if (validation_js_1.AudioExtensions.includes(extension) && currentDir === 'audio')
            return true;
        if (validation_js_1.ImageExtensions.includes(extension) && currentDir === 'images')
            return true;
        if (validation_js_1.VideoExtensions.includes(extension) && currentDir === 'videos')
            return true;
        if (currentDir === 'temp')
            return true;
        return false;
    }
    /**
     * Walk directory recursively
     */
    async walkDirectory(dirPath, callback) {
        try {
            const entries = await fs_extra_1.default.readdir(dirPath);
            for (const entry of entries) {
                const entryPath = path_1.default.join(dirPath, entry);
                const stats = await fs_extra_1.default.stat(entryPath);
                if (stats.isDirectory()) {
                    await this.walkDirectory(entryPath, callback);
                }
                else {
                    await callback(entryPath, stats);
                }
            }
        }
        catch (error) {
            this.logger.warn('Error walking directory', {
                dirPath,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Get directory size and file count
     */
    async getDirectorySize(dirPath) {
        let size = 0;
        let count = 0;
        await this.walkDirectory(dirPath, (filePath, stats) => {
            if (stats.isFile()) {
                size += stats.size;
                count++;
            }
        });
        return { size, count };
    }
    /**
     * Format bytes as human readable string
     */
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Get asset statistics
     */
    async getAssetStatistics() {
        const diskUsage = await this.getAssetDiskUsage();
        const oldAssets = await this.cleanupOldAssets(this.config.fileManagement.maxAssetAgeHours, true);
        let oldestFile = null;
        let newestFile = null;
        if (oldAssets.length > 0) {
            oldestFile = oldAssets.reduce((oldest, current) => current.age > oldest.age ? current : oldest);
            newestFile = oldAssets.reduce((newest, current) => current.age < newest.age ? current : newest);
        }
        return {
            diskUsage,
            oldAssets,
            summary: {
                totalFiles: Object.values(diskUsage.byType).reduce((sum, type) => sum + type.count, 0),
                totalSize: this.formatBytes(diskUsage.total),
                oldestFile: oldestFile ? { path: oldestFile.path, age: oldestFile.age } : null,
                newestFile: newestFile ? { path: newestFile.path, age: newestFile.age } : null,
            },
        };
    }
}
exports.FileManagerService = FileManagerService;
//# sourceMappingURL=file-manager.js.map