// Sound effects MCP tools using Freesound
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MCPConfig } from '../types/index.js';
import { SoundEffectSearchSchema } from '../utils/validation.js';
import { FreesoundService } from '../services/freesound.js';
import { FileManagerService } from '../services/file-manager.js';
import { getLogger } from '../utils/logger.js';

export function createSoundTools(config: MCPConfig): Tool[] {
  return [
    {
      name: 'search-sound-effects',
      description: 'Search for sound effects on Freesound.org',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for sound effects',
            minLength: 1,
            maxLength: 200,
          },
          duration: {
            type: 'string',
            description: 'Duration filter (e.g., "[1 TO 10]" for 1-10 seconds)',
            default: '[1 TO 10]',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of results to return',
            minimum: 1,
            maximum: 20,
            default: 5,
          },
          downloadResults: {
            type: 'boolean',
            description: 'Whether to download the sound files',
            default: false,
          },
          outputDir: {
            type: 'string',
            description: 'Custom output directory for downloaded files',
          },
        },
        required: ['query'],
      },
    },

    {
      name: 'download-sound-effects',
      description: 'Download sound effects from Freesound search results',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for sound effects',
            minLength: 1,
            maxLength: 200,
          },
          duration: {
            type: 'string',
            description: 'Duration filter',
            default: '[1 TO 10]',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of sounds to download',
            minimum: 1,
            maximum: 10,
            default: 3,
          },
          outputDir: {
            type: 'string',
            description: 'Custom output directory',
          },
        },
        required: ['query'],
      },
    },

    {
      name: 'get-sound-details',
      description: 'Get detailed information about a specific sound',
      inputSchema: {
        type: 'object',
        properties: {
          soundId: {
            type: 'string',
            description: 'Freesound sound ID',
          },
        },
        required: ['soundId'],
      },
    },

    {
      name: 'search-popular-sounds',
      description: 'Get popular sound effects by category',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Sound category (e.g., "nature", "music", "ambient")',
            default: 'ambient',
          },
          maxResults: {
            type: 'number',
            description: 'Number of sounds to return',
            minimum: 1,
            maximum: 20,
            default: 10,
          },
        },
      },
    },

    {
      name: 'advanced-sound-search',
      description: 'Advanced sound search with multiple filters',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
            minLength: 1,
            maxLength: 200,
          },
          minDuration: {
            type: 'number',
            description: 'Minimum duration in seconds',
            minimum: 0,
          },
          maxDuration: {
            type: 'number',
            description: 'Maximum duration in seconds',
            maximum: 300,
          },
          license: {
            type: 'string',
            description: 'License type filter',
            enum: ['Creative Commons 0', 'Attribution', 'Attribution Noncommercial'],
          },
          fileType: {
            type: 'string',
            description: 'File type filter',
            enum: ['wav', 'aiff', 'mp3', 'ogg', 'flac'],
          },
          channels: {
            type: 'string',
            description: 'Channel configuration',
            enum: ['mono', 'stereo'],
          },
          page: {
            type: 'number',
            description: 'Page number for pagination',
            minimum: 1,
            default: 1,
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page',
            minimum: 1,
            maximum: 50,
            default: 15,
          },
        },
        required: ['query'],
      },
    },
  ];
}

export function createSoundHandlers(config: MCPConfig) {
  const logger = getLogger().service('SoundHandlers');
  
  if (!config.apiKeys.freesound) {
    logger.warn('Freesound API key not configured - sound tools will not work');
  }

  const freesoundService = config.apiKeys.freesound ? new FreesoundService(config) : null;
  const fileManager = new FileManagerService(config);

  return {
    'search-sound-effects': async (args: any) => {
      if (!freesoundService) {
        throw new Error('Freesound API key is required for sound search');
      }

      logger.info('Searching sound effects', { 
        query: args.query,
        maxResults: args.maxResults 
      });

      try {
        // Validate input
        const validatedArgs = SoundEffectSearchSchema.parse(args);

        const searchResponse = await freesoundService.searchSounds(
          validatedArgs.query,
          {
            duration: validatedArgs.duration,
            pageSize: validatedArgs.maxResults,
          }
        );

        let downloadedSounds: any[] = [];
        
        if (args.downloadResults && searchResponse.results) {
          logger.info('Downloading search results');
          await fileManager.initializeDirectories();

          const downloadPromises = searchResponse.results
            .slice(0, validatedArgs.maxResults)
            .map(sound => freesoundService!.downloadSound(sound, args.outputDir));

          const downloadResults = await Promise.allSettled(downloadPromises);
          
          downloadResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              downloadedSounds.push(result.value);
            } else {
              logger.warn(`Failed to download sound ${searchResponse.results![index].id}`, {
                error: result.reason
              });
            }
          });
        }

        const formattedResults = searchResponse.results?.map(sound => ({
          id: sound.id,
          name: sound.name,
          description: sound.description,
          username: sound.username,
          duration: sound.duration,
          license: sound.license,
          tags: sound.tags,
          previewUrl: sound.previews['preview-hq-mp3'],
          downloadUrl: sound.download,
          url: sound.url,
        })) || [];

        logger.info('Sound search completed', { 
          found: searchResponse.count,
          returned: formattedResults.length,
          downloaded: downloadedSounds.length 
        });

        return {
          success: true,
          query: args.query,
          totalFound: searchResponse.count,
          results: formattedResults,
          downloadedSounds: args.downloadResults ? downloadedSounds : undefined,
          pagination: {
            hasNext: !!searchResponse.next,
            hasPrevious: !!searchResponse.previous,
          },
        };

      } catch (error) {
        logger.error('Sound search failed', { 
          query: args.query,
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'download-sound-effects': async (args: any) => {
      if (!freesoundService) {
        throw new Error('Freesound API key is required for sound download');
      }

      logger.info('Downloading sound effects', { 
        query: args.query,
        maxResults: args.maxResults 
      });

      try {
        await fileManager.initializeDirectories();

        const results = await freesoundService.searchAndDownload({
          query: args.query,
          duration: args.duration,
          maxResults: args.maxResults,
          outputDir: args.outputDir,
        });

        logger.info('Sound effects downloaded', { count: results.length });

        return {
          success: true,
          query: args.query,
          downloadedSounds: results.map(result => ({
            audioPath: result.audioPath,
            filename: result.filename,
            duration: result.duration,
            metadata: result.metadata,
          })),
          summary: {
            count: results.length,
            totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
          },
        };

      } catch (error) {
        logger.error('Sound download failed', { 
          query: args.query,
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'get-sound-details': async (args: any) => {
      if (!freesoundService) {
        throw new Error('Freesound API key is required to get sound details');
      }

      logger.info('Fetching sound details', { soundId: args.soundId });

      try {
        const sound = await freesoundService.getSoundById(args.soundId);

        return {
          success: true,
          sound: {
            id: sound.id,
            name: sound.name,
            description: sound.description,
            username: sound.username,
            created: sound.created,
            duration: sound.duration,
            filesize: sound.filesize,
            samplerate: sound.samplerate,
            bitrate: sound.bitrate,
            bitdepth: sound.bitdepth,
            channels: sound.channels,
            type: sound.type,
            license: sound.license,
            tags: sound.tags,
            previews: sound.previews,
            images: sound.images,
            pack: sound.pack,
            pack_name: sound.pack_name,
            url: sound.url,
          },
        };

      } catch (error) {
        logger.error('Failed to fetch sound details', { 
          soundId: args.soundId,
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'search-popular-sounds': async (args: any) => {
      if (!freesoundService) {
        throw new Error('Freesound API key is required for popular sounds');
      }

      logger.info('Fetching popular sounds', { category: args.category });

      try {
        const sounds = await freesoundService.getPopularSounds(
          args.category,
          args.maxResults || 10
        );

        const formattedSounds = sounds.map(sound => ({
          id: sound.id,
          name: sound.name,
          description: sound.description,
          username: sound.username,
          duration: sound.duration,
          license: sound.license,
          tags: sound.tags,
          previewUrl: sound.previews['preview-hq-mp3'],
          url: sound.url,
        }));

        logger.info('Popular sounds retrieved', { 
          category: args.category,
          count: formattedSounds.length 
        });

        return {
          success: true,
          category: args.category,
          sounds: formattedSounds,
          count: formattedSounds.length,
        };

      } catch (error) {
        logger.error('Failed to fetch popular sounds', { 
          category: args.category,
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'advanced-sound-search': async (args: any) => {
      if (!freesoundService) {
        throw new Error('Freesound API key is required for advanced search');
      }

      logger.info('Performing advanced sound search', { 
        query: args.query,
        filters: {
          duration: args.minDuration || args.maxDuration ? 
            `${args.minDuration || 0}-${args.maxDuration || 300}` : undefined,
          license: args.license,
          fileType: args.fileType,
          channels: args.channels,
        }
      });

      try {
        const searchResponse = await freesoundService.advancedSearch({
          query: args.query,
          minDuration: args.minDuration,
          maxDuration: args.maxDuration,
          license: args.license,
          fileType: args.fileType,
          channels: args.channels,
          page: args.page,
          pageSize: args.pageSize,
        });

        const formattedResults = searchResponse.results?.map(sound => ({
          id: sound.id,
          name: sound.name,
          description: sound.description,
          username: sound.username,
          duration: sound.duration,
          filesize: sound.filesize,
          samplerate: sound.samplerate,
          channels: sound.channels,
          type: sound.type,
          license: sound.license,
          tags: sound.tags,
          previewUrl: sound.previews['preview-hq-mp3'],
          url: sound.url,
        })) || [];

        logger.info('Advanced search completed', { 
          query: args.query,
          totalFound: searchResponse.count,
          returned: formattedResults.length 
        });

        return {
          success: true,
          query: args.query,
          totalFound: searchResponse.count,
          results: formattedResults,
          pagination: {
            page: args.page || 1,
            pageSize: args.pageSize || 15,
            hasNext: !!searchResponse.next,
            hasPrevious: !!searchResponse.previous,
          },
          filters: {
            minDuration: args.minDuration,
            maxDuration: args.maxDuration,
            license: args.license,
            fileType: args.fileType,
            channels: args.channels,
          },
        };

      } catch (error) {
        logger.error('Advanced sound search failed', { 
          query: args.query,
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },
  };
}