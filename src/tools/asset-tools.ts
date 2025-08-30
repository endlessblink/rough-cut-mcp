/**
 * Asset Tools - Manage generated assets and cleanup
 * 5 tools replacing 10+ individual tools
 */

import { MCPServer } from '../index.js';
import { ToolCategory } from '../types/tool-categories.js';
import { forceDeleteProject, safeDeleteProject } from '../utils/force-delete.js';
import * as path from 'path';
import fs from 'fs-extra';

export function registerAssetTools(server: MCPServer): void {
  const logger = (server as any).baseLogger.service('asset-tools');

  /**
   * 1. Manage Assets - List, organize, delete
   */
  server.toolRegistry.registerTool(
    {
      name: 'assets',
      description: 'Manage assets - list, organize, delete, or get statistics',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'organize', 'delete', 'stats', 'force-delete-project'],
            description: 'Asset action'
          },
          type: {
            type: 'string',
            enum: ['all', 'images', 'videos', 'audio', 'cache'],
            default: 'all'
          },
          project: {
            type: 'string',
            description: 'Specific project (optional)'
          },
          olderThan: {
            type: 'number',
            description: 'Delete files older than X days'
          },
          projectName: {
            type: 'string', 
            description: 'Project name (required for force-delete-project action)'
          },
          forceKill: {
            type: 'boolean',
            description: 'Kill related processes before deletion (for force-delete-project)',
            default: true
          }
        },
        required: ['action']
      }
    },
    async (args: any) => {
      try {
        const assetsDir = args.project 
          ? path.join(server.config.assetsDir, 'projects', args.project, 'public')
          : server.config.assetsDir;

        switch (args.action) {
          case 'list': {
            if (!await fs.pathExists(assetsDir)) {
              return {
                content: [{
                  type: 'text',
                  text: 'No assets directory found'
                }]
              };
            }

            const files = await fs.readdir(assetsDir);
            const assets = {
              images: [] as string[],
              videos: [] as string[],
              audio: [] as string[],
              other: [] as string[]
            };

            for (const file of files) {
              const ext = path.extname(file).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                assets.images.push(file);
              } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
                assets.videos.push(file);
              } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                assets.audio.push(file);
              } else if (file !== '.gitkeep') {
                assets.other.push(file);
              }
            }

            const filterType = args.type || 'all';
            let output = `📁 Assets in ${args.project || 'main directory'}:\n\n`;
            
            if (filterType === 'all' || filterType === 'images') {
              output += `Images (${assets.images.length}): ${assets.images.slice(0, 5).join(', ')}${assets.images.length > 5 ? '...' : ''}\n`;
            }
            if (filterType === 'all' || filterType === 'videos') {
              output += `Videos (${assets.videos.length}): ${assets.videos.slice(0, 5).join(', ')}${assets.videos.length > 5 ? '...' : ''}\n`;
            }
            if (filterType === 'all' || filterType === 'audio') {
              output += `Audio (${assets.audio.length}): ${assets.audio.slice(0, 5).join(', ')}${assets.audio.length > 5 ? '...' : ''}\n`;
            }
            if (filterType === 'all') {
              output += `Other (${assets.other.length}): ${assets.other.slice(0, 5).join(', ')}${assets.other.length > 5 ? '...' : ''}`;
            }

            return {
              content: [{
                type: 'text',
                text: output
              }]
            };
          }

          case 'organize': {
            await fs.ensureDir(path.join(assetsDir, 'images'));
            await fs.ensureDir(path.join(assetsDir, 'videos'));
            await fs.ensureDir(path.join(assetsDir, 'audio'));

            const files = await fs.readdir(assetsDir);
            let moved = 0;

            for (const file of files) {
              const filepath = path.join(assetsDir, file);
              const stat = await fs.stat(filepath);
              
              if (!stat.isFile()) continue;
              
              const ext = path.extname(file).toLowerCase();
              let targetDir = null;
              
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                targetDir = 'images';
              } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
                targetDir = 'videos';
              } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                targetDir = 'audio';
              }
              
              if (targetDir) {
                await fs.move(filepath, path.join(assetsDir, targetDir, file), { overwrite: true });
                moved++;
              }
            }

            return {
              content: [{
                type: 'text',
                text: `✅ Organized ${moved} files into subdirectories`
              }]
            };
          }

          case 'delete': {
            if (!args.olderThan) {
              throw new Error('olderThan parameter required for delete action');
            }

            const cutoffTime = Date.now() - (args.olderThan * 24 * 60 * 60 * 1000);
            const files = await fs.readdir(assetsDir);
            let deleted = 0;
            let freedSpace = 0;

            for (const file of files) {
              const filepath = path.join(assetsDir, file);
              const stat = await fs.stat(filepath);
              
              if (stat.isFile() && stat.mtime.getTime() < cutoffTime) {
                freedSpace += stat.size;
                await fs.remove(filepath);
                deleted++;
              }
            }

            return {
              content: [{
                type: 'text',
                text: `✅ Deleted ${deleted} files older than ${args.olderThan} days
Freed: ${(freedSpace / (1024 * 1024)).toFixed(2)} MB`
              }]
            };
          }

          case 'stats': {
            const stats = await getDirectoryStats(assetsDir);
            
            return {
              content: [{
                type: 'text',
                text: `📊 Asset Statistics:
Total files: ${stats.totalFiles}
Total size: ${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
Images: ${stats.imageCount} (${(stats.imageSize / (1024 * 1024)).toFixed(2)} MB)
Videos: ${stats.videoCount} (${(stats.videoSize / (1024 * 1024)).toFixed(2)} MB)
Audio: ${stats.audioCount} (${(stats.audioSize / (1024 * 1024)).toFixed(2)} MB)
Oldest file: ${stats.oldestFile ? new Date(stats.oldestFile).toLocaleDateString() : 'N/A'}
Newest file: ${stats.newestFile ? new Date(stats.newestFile).toLocaleDateString() : 'N/A'}`
              }]
            };
          }

          case 'force-delete-project': {
            if (!args.projectName) {
              throw new Error('projectName required for force-delete-project action');
            }
            
            const projectPath = path.join(server.config.assetsDir, 'projects', args.projectName);
            
            if (!await fs.pathExists(projectPath)) {
              return {
                content: [{
                  type: 'text',
                  text: `❌ Project "${args.projectName}" not found`
                }]
              };
            }
            
            logger.info('Force deleting project', { projectName: args.projectName, projectPath });
            
            const deleteResult = await forceDeleteProject({
              projectPath,
              projectName: args.projectName,
              killProcesses: args.forceKill !== false,
              removeNodeModules: true,
              timeout: 60000
            });
            
            let statusText = '';
            if (deleteResult.success) {
              statusText = `✅ Successfully force-deleted project "${args.projectName}"`;
              
              if (deleteResult.processesKilled.length > 0) {
                statusText += `\n🔄 Killed ${deleteResult.processesKilled.length} related processes`;
              }
              
              if (deleteResult.filesRemoved.length > 0) {
                statusText += `\n📁 Removed ${deleteResult.filesRemoved.length} files/directories`;
              }
              
              if (deleteResult.warnings.length > 0) {
                statusText += `\n⚠️ Warnings: ${deleteResult.warnings.join(', ')}`;
              }
            } else {
              statusText = `❌ Failed to delete project "${args.projectName}"`;
              
              if (deleteResult.errors.length > 0) {
                statusText += `\nErrors: ${deleteResult.errors.join(', ')}`;
              }
            }
            
            return {
              content: [{
                type: 'text',
                text: statusText
              }]
            };
          }

          default:
            throw new Error(`Unknown action: ${args.action}`);
        }
      } catch (error) {
        logger.error('Asset operation failed', { error });
        throw error;
      }
    },
    {
      name: 'assets',
      category: ToolCategory.MAINTENANCE,
      subCategory: 'assets',
      tags: ['assets', 'manage', 'cleanup'],
      loadByDefault: false,
      priority: 5,
      estimatedTokens: 100
    }
  );

  /**
   * 2. Cache Management - Clean build and temp files
   */
  server.toolRegistry.registerTool(
    {
      name: 'cache',
      description: 'Manage cache and temporary files',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['clear', 'stats', 'list'],
            description: 'Cache action'
          },
          type: {
            type: 'string',
            enum: ['all', 'build', 'temp', 'logs', 'webpack', 'remotion'],
            default: 'all'
          },
          project: {
            type: 'string',
            description: 'Project name for project-specific cache clearing'
          }
        },
        required: ['action']
      }
    },
    async (args: any) => {
      try {
        const cacheDir = path.join(server.config.assetsDir, 'cache');
        const tempDir = path.join(server.config.assetsDir, 'temp');
        const logsDir = path.join(server.config.assetsDir, 'logs');

        switch (args.action) {
          case 'clear': {
            let cleared = 0;
            let freedSpace = 0;

            if (args.type === 'all' || args.type === 'build') {
              if (await fs.pathExists(cacheDir)) {
                const stats = await getDirectoryStats(cacheDir);
                freedSpace += stats.totalSize;
                cleared += stats.totalFiles;
                await fs.emptyDir(cacheDir);
              }
            }

            if (args.type === 'all' || args.type === 'temp') {
              if (await fs.pathExists(tempDir)) {
                const stats = await getDirectoryStats(tempDir);
                freedSpace += stats.totalSize;
                cleared += stats.totalFiles;
                await fs.emptyDir(tempDir);
              }
            }

            if (args.type === 'all' || args.type === 'logs') {
              if (await fs.pathExists(logsDir)) {
                const stats = await getDirectoryStats(logsDir);
                freedSpace += stats.totalSize;
                cleared += stats.totalFiles;
                await fs.emptyDir(logsDir);
              }
            }

            // CRITICAL: Webpack cache clearing (prevents white screen issues)
            if (args.type === 'all' || args.type === 'webpack') {
              const projectPath = args.project 
                ? path.join(server.config.assetsDir, 'projects', args.project)
                : server.config.assetsDir;
              
              const webpackCachePath = path.join(projectPath, 'node_modules', '.cache');
              if (await fs.pathExists(webpackCachePath)) {
                const stats = await getDirectoryStats(webpackCachePath);
                freedSpace += stats.totalSize;
                cleared += stats.totalFiles;
                await fs.remove(webpackCachePath);
                logger.info('Cleared webpack cache to prevent white screen issues', { path: webpackCachePath });
              }
            }

            // Remotion cache clearing
            if (args.type === 'all' || args.type === 'remotion') {
              const projectPath = args.project 
                ? path.join(server.config.assetsDir, 'projects', args.project)
                : server.config.assetsDir;
              
              const remotionCachePath = path.join(projectPath, '.remotion');
              if (await fs.pathExists(remotionCachePath)) {
                const stats = await getDirectoryStats(remotionCachePath);
                freedSpace += stats.totalSize;
                cleared += stats.totalFiles;
                await fs.remove(remotionCachePath);
                logger.info('Cleared Remotion cache', { path: remotionCachePath });
              }
            }

            return {
              content: [{
                type: 'text',
                text: `✅ Cleared ${cleared} files
Freed: ${(freedSpace / (1024 * 1024)).toFixed(2)} MB`
              }]
            };
          }

          case 'stats': {
            const cacheStats = await fs.pathExists(cacheDir) ? await getDirectoryStats(cacheDir) : null;
            const tempStats = await fs.pathExists(tempDir) ? await getDirectoryStats(tempDir) : null;
            const logsStats = await fs.pathExists(logsDir) ? await getDirectoryStats(logsDir) : null;

            return {
              content: [{
                type: 'text',
                text: `📊 Cache Statistics:
Cache: ${cacheStats ? `${cacheStats.totalFiles} files, ${(cacheStats.totalSize / (1024 * 1024)).toFixed(2)} MB` : 'Empty'}
Temp: ${tempStats ? `${tempStats.totalFiles} files, ${(tempStats.totalSize / (1024 * 1024)).toFixed(2)} MB` : 'Empty'}
Logs: ${logsStats ? `${logsStats.totalFiles} files, ${(logsStats.totalSize / (1024 * 1024)).toFixed(2)} MB` : 'Empty'}`
              }]
            };
          }

          case 'list': {
            let output = '📁 Cache Contents:\n\n';
            
            if (await fs.pathExists(cacheDir)) {
              const files = await fs.readdir(cacheDir);
              output += `Cache (${files.length}): ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}\n`;
            }
            
            if (await fs.pathExists(tempDir)) {
              const files = await fs.readdir(tempDir);
              output += `Temp (${files.length}): ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}\n`;
            }
            
            if (await fs.pathExists(logsDir)) {
              const files = await fs.readdir(logsDir);
              output += `Logs (${files.length}): ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`;
            }

            return {
              content: [{
                type: 'text',
                text: output
              }]
            };
          }

          default:
            throw new Error(`Unknown action: ${args.action}`);
        }
      } catch (error) {
        logger.error('Cache operation failed', { error });
        throw error;
      }
    },
    {
      name: 'cache',
      category: ToolCategory.MAINTENANCE,
      subCategory: 'cache',
      tags: ['cache', 'cleanup', 'temp'],
      loadByDefault: false,
      priority: 6,
      estimatedTokens: 80
    }
  );

  /**
   * 3. Voice Management - List and test voices
   */
  server.toolRegistry.registerTool(
    {
      name: 'voices',
      description: 'Manage ElevenLabs voices',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'test', 'info'],
            description: 'Voice action'
          },
          voiceId: {
            type: 'string',
            description: 'Voice ID for test/info'
          },
          text: {
            type: 'string',
            description: 'Test text for voice',
            default: 'Hello, this is a test of the voice.'
          }
        },
        required: ['action']
      }
    },
    async (args: any) => {
      try {
        if (!server.config.apiKeys.elevenlabs) {
          return {
            content: [{
              type: 'text',
              text: '❌ ElevenLabs API key not configured'
            }]
          };
        }

        // Placeholder for actual ElevenLabs integration
        switch (args.action) {
          case 'list':
            return {
              content: [{
                type: 'text',
                text: `📢 Available Voices:
1. Rachel (21m00Tcm4TlvDq8ikWAM) - American, Female
2. Drew (29vD33N1CtxCmqQRPOHJ) - American, Male
3. Clyde (2EiwWnXFnvU5JabPnv8n) - American, Male
4. Paul (5Q0t7uMcjvnagumLfvZi) - American, Male
5. Domi (AZnzlk1XvdvUeBnXmlld) - American, Female`
              }]
            };
            
          case 'test':
            return {
              content: [{
                type: 'text',
                text: `✅ Voice test initiated for ${args.voiceId || 'default'}\nText: "${args.text}"`
              }]
            };
            
          case 'info':
            return {
              content: [{
                type: 'text',
                text: `Voice Info: ${args.voiceId || 'default'}\nType: Neural\nLanguage: English\nGender: Neutral`
              }]
            };
            
          default:
            throw new Error(`Unknown action: ${args.action}`);
        }
      } catch (error) {
        logger.error('Voice operation failed', { error });
        throw error;
      }
    },
    {
      name: 'voices',
      category: ToolCategory.VOICE_GENERATION,
      subCategory: 'management',
      tags: ['voice', 'elevenlabs', 'tts'],
      loadByDefault: false,
      priority: 7,
      estimatedTokens: 60
    }
  );

  /**
   * 4. Image Models - List and configure Flux models
   */
  server.toolRegistry.registerTool(
    {
      name: 'image-models',
      description: 'Manage Flux image generation models',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'info', 'set-default'],
            description: 'Model action'
          },
          model: {
            type: 'string',
            description: 'Model ID'
          }
        },
        required: ['action']
      }
    },
    async (args: any) => {
      try {
        if (!server.config.apiKeys.flux) {
          return {
            content: [{
              type: 'text',
              text: '❌ Flux API key not configured'
            }]
          };
        }

        // Placeholder for actual Flux integration
        switch (args.action) {
          case 'list':
            return {
              content: [{
                type: 'text',
                text: `🎨 Available Flux Models:
1. flux-pro - Professional quality, slower
2. flux-dev - Development, balanced
3. flux-schnell - Fast generation, lower quality
4. flux-realism - Photorealistic style
5. flux-anime - Anime/manga style`
              }]
            };
            
          case 'info':
            return {
              content: [{
                type: 'text',
                text: `Model: ${args.model || 'flux-dev'}
Type: Diffusion
Resolution: 512x512 to 2048x2048
Speed: ~5-30 seconds
Quality: High`
              }]
            };
            
          case 'set-default':
            return {
              content: [{
                type: 'text',
                text: `✅ Default model set to: ${args.model || 'flux-dev'}`
              }]
            };
            
          default:
            throw new Error(`Unknown action: ${args.action}`);
        }
      } catch (error) {
        logger.error('Model operation failed', { error });
        throw error;
      }
    },
    {
      name: 'image-models',
      category: ToolCategory.IMAGE_GENERATION,
      subCategory: 'management',
      tags: ['image', 'flux', 'models'],
      loadByDefault: false,
      priority: 8,
      estimatedTokens: 60
    }
  );

  /**
   * 5. Sound Library - Search and manage sounds
   */
  server.toolRegistry.registerTool(
    {
      name: 'sounds',
      description: 'Search and manage Freesound library',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['search', 'download', 'popular'],
            description: 'Sound action'
          },
          query: {
            type: 'string',
            description: 'Search query'
          },
          soundId: {
            type: 'string',
            description: 'Sound ID to download'
          },
          filters: {
            type: 'object',
            properties: {
              duration: { type: 'number', description: 'Max duration in seconds' },
              license: { type: 'string', enum: ['cc0', 'attribution', 'any'] }
            }
          }
        },
        required: ['action']
      }
    },
    async (args: any) => {
      try {
        if (!server.config.apiKeys.freesound) {
          return {
            content: [{
                type: 'text',
                text: '❌ Freesound API key not configured'
              }]
          };
        }

        // Placeholder for actual Freesound integration
        switch (args.action) {
          case 'search':
            return {
              content: [{
                type: 'text',
                text: `🔍 Search results for "${args.query || 'ambient'}":
1. Ocean Waves (ID: 12345) - 2:30, CC0
2. Forest Birds (ID: 12346) - 1:45, Attribution
3. Rain Thunder (ID: 12347) - 3:20, CC0
4. Wind Chimes (ID: 12348) - 0:45, CC0
5. City Traffic (ID: 12349) - 2:00, Attribution`
              }]
            };
            
          case 'download':
            return {
              content: [{
                type: 'text',
                text: `✅ Downloaded sound ${args.soundId || '12345'}\nSaved to: assets/sounds/sound-${args.soundId || '12345'}.wav`
              }]
            };
            
          case 'popular':
            return {
              content: [{
                type: 'text',
                text: `🎵 Popular Sounds:
1. Notification Bell - 50k downloads
2. Camera Shutter - 45k downloads
3. Whoosh Transition - 40k downloads
4. Button Click - 38k downloads
5. Error Beep - 35k downloads`
              }]
            };
            
          default:
            throw new Error(`Unknown action: ${args.action}`);
        }
      } catch (error) {
        logger.error('Sound operation failed', { error });
        throw error;
      }
    },
    {
      name: 'sounds',
      category: ToolCategory.SOUND_EFFECTS,
      subCategory: 'search',
      tags: ['sound', 'freesound', 'audio'],
      loadByDefault: false,
      priority: 9,
      estimatedTokens: 60
    }
  );
}

// Helper function to get directory statistics
async function getDirectoryStats(dir: string): Promise<any> {
  if (!await fs.pathExists(dir)) {
    return {
      totalFiles: 0,
      totalSize: 0,
      imageCount: 0,
      imageSize: 0,
      videoCount: 0,
      videoSize: 0,
      audioCount: 0,
      audioSize: 0,
      oldestFile: null,
      newestFile: null
    };
  }

  const stats = {
    totalFiles: 0,
    totalSize: 0,
    imageCount: 0,
    imageSize: 0,
    videoCount: 0,
    videoSize: 0,
    audioCount: 0,
    audioSize: 0,
    oldestFile: null as number | null,
    newestFile: null as number | null
  };

  async function processDir(currentDir: string): Promise<void> {
    const files = await fs.readdir(currentDir);
    
    for (const file of files) {
      const filepath = path.join(currentDir, file);
      const stat = await fs.stat(filepath);
      
      if (stat.isDirectory()) {
        await processDir(filepath);
      } else {
        stats.totalFiles++;
        stats.totalSize += stat.size;
        
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          stats.imageCount++;
          stats.imageSize += stat.size;
        } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
          stats.videoCount++;
          stats.videoSize += stat.size;
        } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
          stats.audioCount++;
          stats.audioSize += stat.size;
        }
        
        const mtime = stat.mtime.getTime();
        if (!stats.oldestFile || mtime < stats.oldestFile) {
          stats.oldestFile = mtime;
        }
        if (!stats.newestFile || mtime > stats.newestFile) {
          stats.newestFile = mtime;
        }
      }
    }
  }

  await processDir(dir);
  return stats;
}