// Asset lifecycle management service
import fs from 'fs-extra';
import path from 'path';
import { MCPConfig, AssetCleanupInfo } from '../types/index.js';
import { getAssetPath } from '../utils/config.js';
import { getLogger } from '../utils/logger.js';
import { AudioExtensions, ImageExtensions, VideoExtensions } from '../utils/validation.js';

export class FileManagerService {
  private config: MCPConfig;
  private logger = getLogger().service('FileManager');

  constructor(config: MCPConfig) {
    this.config = config;
    this.logger.info('File manager service initialized');
  }

  /**
   * Initialize asset directories
   */
  async initializeDirectories(): Promise<void> {
    const directories = [
      getAssetPath(this.config, 'temp'),
      getAssetPath(this.config, 'videos'),
      getAssetPath(this.config, 'audio'),
      getAssetPath(this.config, 'images'),
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      this.logger.debug('Ensured directory exists', { dir });
    }

    this.logger.info('Asset directories initialized');
  }

  /**
   * Get disk usage for asset directories
   */
  async getAssetDiskUsage(): Promise<{
    total: number;
    byType: Record<string, { size: number; count: number }>;
    directories: Record<string, { size: number; count: number }>;
  }> {
    const directories = {
      temp: getAssetPath(this.config, 'temp'),
      videos: getAssetPath(this.config, 'videos'),
      audio: getAssetPath(this.config, 'audio'),
      images: getAssetPath(this.config, 'images'),
    };

    const result = {
      total: 0,
      byType: {} as Record<string, { size: number; count: number }>,
      directories: {} as Record<string, { size: number; count: number }>,
    };

    for (const [dirName, dirPath] of Object.entries(directories)) {
      try {
        if (await fs.pathExists(dirPath)) {
          const dirStats = await this.getDirectorySize(dirPath);
          result.directories[dirName] = dirStats;
          result.total += dirStats.size;

          // Count by file type
          await this.walkDirectory(dirPath, (filePath, stats) => {
            const ext = path.extname(filePath).toLowerCase().slice(1);
            let type = 'other';
            
            if (AudioExtensions.includes(ext)) type = 'audio';
            else if (ImageExtensions.includes(ext)) type = 'image';
            else if (VideoExtensions.includes(ext)) type = 'video';

            if (!result.byType[type]) {
              result.byType[type] = { size: 0, count: 0 };
            }
            
            result.byType[type].size += stats.size;
            result.byType[type].count++;
          });
        }
      } catch (error) {
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
  async cleanupOldAssets(maxAgeHours?: number, dryRun: boolean = false): Promise<AssetCleanupInfo[]> {
    const ageLimit = maxAgeHours || this.config.fileManagement.maxAssetAgeHours;
    const cutoffTime = Date.now() - (ageLimit * 60 * 60 * 1000);
    
    this.logger.info('Starting asset cleanup', { maxAgeHours: ageLimit, dryRun });

    const directories = {
      temp: getAssetPath(this.config, 'temp'),
      videos: getAssetPath(this.config, 'videos'),
      audio: getAssetPath(this.config, 'audio'),
      images: getAssetPath(this.config, 'images'),
    };

    const oldAssets: AssetCleanupInfo[] = [];

    for (const [dirType, dirPath] of Object.entries(directories)) {
      try {
        if (await fs.pathExists(dirPath)) {
          await this.walkDirectory(dirPath, async (filePath, stats) => {
            if (stats.mtime.getTime() < cutoffTime) {
              const ext = path.extname(filePath).toLowerCase().slice(1);
              let type: 'audio' | 'image' | 'video' | 'temp' = 'temp';
              
              if (AudioExtensions.includes(ext)) type = 'audio';
              else if (ImageExtensions.includes(ext)) type = 'image';
              else if (VideoExtensions.includes(ext)) type = 'video';

              const assetInfo: AssetCleanupInfo = {
                path: filePath,
                type,
                size: stats.size,
                lastModified: stats.mtime,
                age: (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60),
              };

              oldAssets.push(assetInfo);

              if (!dryRun) {
                await fs.remove(filePath);
                this.logger.debug('Removed old asset', { 
                  path: filePath, 
                  age: assetInfo.age.toFixed(1) + 'h' 
                });
              }
            }
          });
        }
      } catch (error) {
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
  async removeEmptyDirectories(): Promise<void> {
    const baseDir = getAssetPath(this.config);
    
    const removeEmpty = async (dirPath: string): Promise<boolean> => {
      try {
        const entries = await fs.readdir(dirPath);
        
        // Remove empty subdirectories first
        for (const entry of entries) {
          const entryPath = path.join(dirPath, entry);
          const stats = await fs.stat(entryPath);
          
          if (stats.isDirectory()) {
            const isEmpty = await removeEmpty(entryPath);
            if (isEmpty) {
              await fs.rmdir(entryPath);
              this.logger.debug('Removed empty directory', { path: entryPath });
            }
          }
        }
        
        // Check if current directory is now empty
        const remainingEntries = await fs.readdir(dirPath);
        return remainingEntries.length === 0;
        
      } catch (error) {
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
  async organizeAssets(): Promise<{ moved: number; errors: number }> {
    this.logger.info('Starting asset organization');
    
    const baseDir = getAssetPath(this.config);
    let moved = 0;
    let errors = 0;

    await this.walkDirectory(baseDir, async (filePath, stats) => {
      if (!stats.isFile()) return;

      const ext = path.extname(filePath).toLowerCase().slice(1);
      const relativePath = path.relative(baseDir, filePath);
      
      // Skip if already in correct directory
      if (relativePath.includes(path.sep)) {
        const currentDir = relativePath.split(path.sep)[0];
        if (this.isCorrectDirectory(ext, currentDir)) {
          return;
        }
      }

      let targetDir: string;
      if (AudioExtensions.includes(ext)) {
        targetDir = getAssetPath(this.config, 'audio');
      } else if (ImageExtensions.includes(ext)) {
        targetDir = getAssetPath(this.config, 'images');
      } else if (VideoExtensions.includes(ext)) {
        targetDir = getAssetPath(this.config, 'videos');
      } else {
        targetDir = getAssetPath(this.config, 'temp');
      }

      try {
        await fs.ensureDir(targetDir);
        const filename = path.basename(filePath);
        const targetPath = path.join(targetDir, filename);
        
        // Handle filename conflicts
        const finalPath = await this.getUniqueFilePath(targetPath);
        
        await fs.move(filePath, finalPath);
        moved++;
        
        this.logger.debug('Moved asset to correct directory', { 
          from: filePath, 
          to: finalPath 
        });
        
      } catch (error) {
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
  async createBackup(
    backupDir: string, 
    includeTypes: ('audio' | 'image' | 'video')[] = ['video']
  ): Promise<{ backedUp: number; totalSize: number }> {
    this.logger.info('Creating asset backup', { backupDir, includeTypes });
    
    await fs.ensureDir(backupDir);
    let backedUp = 0;
    let totalSize = 0;

    for (const type of includeTypes) {
      const sourceDir = getAssetPath(this.config, type);
      const targetDir = path.join(backupDir, type);
      
      if (await fs.pathExists(sourceDir)) {
        await fs.copy(sourceDir, targetDir);
        
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
  private async getUniqueFilePath(originalPath: string): Promise<string> {
    let counter = 0;
    let testPath = originalPath;
    
    while (await fs.pathExists(testPath)) {
      counter++;
      const ext = path.extname(originalPath);
      const base = path.basename(originalPath, ext);
      const dir = path.dirname(originalPath);
      testPath = path.join(dir, `${base}_${counter}${ext}`);
    }
    
    return testPath;
  }

  /**
   * Check if file is in correct directory based on extension
   */
  private isCorrectDirectory(extension: string, currentDir: string): boolean {
    if (AudioExtensions.includes(extension) && currentDir === 'audio') return true;
    if (ImageExtensions.includes(extension) && currentDir === 'images') return true;
    if (VideoExtensions.includes(extension) && currentDir === 'videos') return true;
    if (currentDir === 'temp') return true;
    return false;
  }

  /**
   * Walk directory recursively
   */
  private async walkDirectory(
    dirPath: string, 
    callback: (filePath: string, stats: fs.Stats) => Promise<void> | void
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath);
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry);
        const stats = await fs.stat(entryPath);
        
        if (stats.isDirectory()) {
          await this.walkDirectory(entryPath, callback);
        } else {
          await callback(entryPath, stats);
        }
      }
    } catch (error) {
      this.logger.warn('Error walking directory', { 
        dirPath, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Get directory size and file count
   */
  private async getDirectorySize(dirPath: string): Promise<{ size: number; count: number }> {
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
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(): Promise<{
    diskUsage: any;
    oldAssets: AssetCleanupInfo[];
    summary: {
      totalFiles: number;
      totalSize: string;
      oldestFile: { path: string; age: number } | null;
      newestFile: { path: string; age: number } | null;
    };
  }> {
    const diskUsage = await this.getAssetDiskUsage();
    const oldAssets = await this.cleanupOldAssets(this.config.fileManagement.maxAssetAgeHours, true);
    
    let oldestFile: { path: string; age: number } | null = null;
    let newestFile: { path: string; age: number } | null = null;
    
    if (oldAssets.length > 0) {
      oldestFile = oldAssets.reduce((oldest, current) => 
        current.age > oldest.age ? current : oldest
      );
      newestFile = oldAssets.reduce((newest, current) => 
        current.age < newest.age ? current : newest
      );
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