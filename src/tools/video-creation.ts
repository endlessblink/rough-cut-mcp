// Main video creation MCP tools
import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MCPConfig } from '../types/index.js';
import { VideoCreationSchema } from '../utils/validation.js';
import { ElevenLabsService } from '../services/elevenlabs.js';
import { FreesoundService } from '../services/freesound.js';
import { FluxService } from '../services/flux.js';
import { RemotionService } from '../services/remotion.js';
import { FileManagerService } from '../services/file-manager.js';
import { getLogger } from '../utils/logger.js';
import { validateApiKeys } from '../utils/config.js';

export function createVideoCreationTools(config: MCPConfig): Tool[] {
  const logger = getLogger().service('VideoTools');

  return [
    {
      name: 'create-complete-video',
      description: 'Create a complete video with AI-generated voice narration, sound effects, and visuals using Remotion',
      inputSchema: {
        type: 'object',
        properties: {
          animationDesc: {
            type: 'string',
            description: 'Description of the video animation and content',
            minLength: 1,
            maxLength: 2000,
          },
          narration: {
            type: 'string',
            description: 'Text for AI voice narration (optional)',
            maxLength: 5000,
          },
          sfxDesc: {
            type: 'array',
            description: 'Array of sound effect descriptions to search for',
            items: {
              type: 'string',
              maxLength: 200,
            },
            maxItems: 5,
          },
          imageDesc: {
            type: 'array',
            description: 'Array of image generation prompts for visual elements',
            items: {
              type: 'string',
              maxLength: 1000,
            },
            maxItems: 5,
          },
          duration: {
            type: 'number',
            description: 'Video duration in seconds',
            minimum: 1,
            maximum: 300,
            default: 30,
          },
          style: {
            type: 'string',
            description: 'Visual style or theme for the video',
            maxLength: 500,
          },
          compositionCode: {
            type: 'string',
            description: 'Complete Remotion React component code for the animation (optional - Claude can provide this directly)',
            maxLength: 50000,
          },
          fps: {
            type: 'number',
            description: 'Frames per second',
            minimum: 24,
            maximum: 60,
            default: 30,
          },
          dimensions: {
            type: 'object',
            description: 'Video dimensions',
            properties: {
              width: {
                type: 'number',
                minimum: 256,
                maximum: 4096,
                default: 1920,
              },
              height: {
                type: 'number',
                minimum: 256,
                maximum: 4096,
                default: 1080,
              },
            },
          },
        },
        required: ['animationDesc'],
      },
    },

    {
      name: 'create-text-video',
      description: 'Create a simple text-only video with customizable styling',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to display in the video',
            minLength: 1,
            maxLength: 1000,
          },
          duration: {
            type: 'number',
            description: 'Video duration in seconds',
            minimum: 1,
            maximum: 60,
            default: 10,
          },
          fontSize: {
            type: 'number',
            description: 'Font size for the text',
            minimum: 12,
            maximum: 200,
            default: 48,
          },
          backgroundColor: {
            type: 'string',
            description: 'Background color (hex code)',
            pattern: '^#[0-9A-Fa-f]{6}$',
            default: '#000000',
          },
          textColor: {
            type: 'string',
            description: 'Text color (hex code)',
            pattern: '^#[0-9A-Fa-f]{6}$',
            default: '#FFFFFF',
          },
          fontFamily: {
            type: 'string',
            description: 'Font family',
            default: 'Arial, sans-serif',
          },
          compositionCode: {
            type: 'string',
            description: 'Complete Remotion React component code for the text animation (optional - Claude can provide this directly)',
            maxLength: 50000,
          },
        },
        required: ['text'],
      },
    },

    {
      name: 'generate-video-assets',
      description: 'Generate individual assets (voice, images, sound effects) for video creation',
      inputSchema: {
        type: 'object',
        properties: {
          voiceRequests: {
            type: 'array',
            description: 'Voice generation requests',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string', minLength: 1, maxLength: 10000 },
                voiceId: { type: 'string', default: 'Adam' },
                modelId: { type: 'string', default: 'eleven_multilingual_v2' },
              },
              required: ['text'],
            },
          },
          imageRequests: {
            type: 'array',
            description: 'Image generation requests',
            items: {
              type: 'object',
              properties: {
                prompt: { type: 'string', minLength: 1, maxLength: 1000 },
                model: { type: 'string', default: 'FLUX.1-pro' },
                width: { type: 'number', minimum: 256, maximum: 2048, default: 1024 },
                height: { type: 'number', minimum: 256, maximum: 2048, default: 1024 },
              },
              required: ['prompt'],
            },
          },
          soundRequests: {
            type: 'array',
            description: 'Sound effect search requests',
            items: {
              type: 'object',
              properties: {
                query: { type: 'string', minLength: 1, maxLength: 200 },
                duration: { type: 'string', default: '[1 TO 10]' },
                maxResults: { type: 'number', minimum: 1, maximum: 5, default: 3 },
              },
              required: ['query'],
            },
          },
        },
      },
    },

    {
      name: 'estimate-render-time',
      description: 'Estimate video rendering time based on parameters',
      inputSchema: {
        type: 'object',
        properties: {
          duration: {
            type: 'number',
            description: 'Video duration in seconds',
            minimum: 1,
            maximum: 300,
          },
          fps: {
            type: 'number',
            description: 'Frames per second',
            minimum: 24,
            maximum: 60,
            default: 30,
          },
          complexity: {
            type: 'string',
            description: 'Complexity level of the video',
            enum: ['low', 'medium', 'high'],
            default: 'medium',
          },
          assetCount: {
            type: 'object',
            description: 'Number of assets to be included',
            properties: {
              images: { type: 'number', minimum: 0, default: 0 },
              audioTracks: { type: 'number', minimum: 0, default: 0 },
              effects: { type: 'number', minimum: 0, default: 0 },
            },
          },
        },
        required: ['duration'],
      },
    },
  ];
}

export function createVideoCreationHandlers(config: MCPConfig) {
  const logger = getLogger().service('VideoHandlers');

  // Initialize services
  let elevenlabsService: ElevenLabsService | null = null;
  let freesoundService: FreesoundService | null = null;
  let fluxService: FluxService | null = null;
  const remotionService = new RemotionService(config);
  const fileManager = new FileManagerService(config);

  // Initialize services based on available API keys
  try {
    if (config.apiKeys.elevenlabs) {
      elevenlabsService = new ElevenLabsService(config);
    }
    if (config.apiKeys.freesound) {
      freesoundService = new FreesoundService(config);
    }
    if (config.apiKeys.flux) {
      fluxService = new FluxService(config);
    }
  } catch (error) {
    logger.warn('Some services could not be initialized', { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }

  return {
    'create-complete-video': async (args: any) => {
      logger.info('Starting complete video creation', { animationDesc: args.animationDesc?.substring(0, 100) + '...' });

      try {
        // Validate input
        const validatedArgs = VideoCreationSchema.parse(args);

        // Check required services - make image generation optional
        const requiredServices = [];
        if (validatedArgs.narration && !elevenlabsService) {
          logger.warn('ElevenLabs API key not available - skipping voice narration');
          validatedArgs.narration = undefined; // Skip voice generation
        }
        if (validatedArgs.sfxDesc?.length && !freesoundService) {
          logger.warn('Freesound API key not available - skipping sound effects');
          validatedArgs.sfxDesc = []; // Skip sound effects
        }
        if (validatedArgs.imageDesc?.length && !fluxService) {
          logger.warn('Flux API key not available - skipping image generation, using procedural animation instead');
          validatedArgs.imageDesc = []; // Skip image generation, let intelligent generation handle it
        }

        // Initialize asset directories
        await fileManager.initializeDirectories();

        // Generate assets in parallel
        const assetPromises = [];

        // Voice generation
        const voiceTracks: any[] = [];
        if (validatedArgs.narration && elevenlabsService) {
          assetPromises.push(
            elevenlabsService.generateVoiceWithRetry({
              text: validatedArgs.narration,
            }).then(result => voiceTracks.push(result))
          );
        }

        // Sound effects
        const soundEffects: any[] = [];
        if (validatedArgs.sfxDesc?.length && freesoundService) {
          for (const sfxQuery of validatedArgs.sfxDesc) {
            assetPromises.push(
              freesoundService.searchAndDownload({
                query: sfxQuery,
                maxResults: 1,
              }).then(results => soundEffects.push(...results))
            );
          }
        }

        // Images
        const images: any[] = [];
        if (validatedArgs.imageDesc?.length && fluxService) {
          for (const imagePrompt of validatedArgs.imageDesc) {
            assetPromises.push(
              fluxService.generateImageWithRetry({
                prompt: imagePrompt,
              }).then(result => images.push(result))
            );
          }
        }

        // Wait for all assets to be generated
        await Promise.all(assetPromises);

        logger.info('Assets generated', { 
          voiceTracks: voiceTracks.length,
          soundEffects: soundEffects.length,
          images: images.length 
        });

        // Create the video
        const result = await remotionService.createVideo(validatedArgs, {
          voiceTracks,
          soundEffects,
          images,
        });

        // Create a Studio project for the animation
        const studioProjectPath = await remotionService.createStudioProject(validatedArgs, {
          voiceTracks,
          soundEffects,
          images,
        });

        logger.info('Video creation completed successfully', { 
          videoPath: result.videoPath,
          studioProjectPath 
        });

        return {
          success: true,
          videoPath: result.videoPath,
          studioProjectPath,
          duration: result.duration,
          metadata: result.metadata,
          assets: {
            voiceTracks: result.assets.voiceTracks.length,
            soundEffects: result.assets.soundEffects.length,
            images: result.assets.images.length,
          },
          instructions: [
            `Video rendered to: ${result.videoPath}`,
            `Studio project created at: ${studioProjectPath}`,
            'Use launch-remotion-studio tool to view and edit the animation',
            'Studio will automatically open with THIS project (not previous ones)',
            'The project contains all your custom assets and can be modified in Studio',
          ],
        };

      } catch (error) {
        logger.error('Video creation failed', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },

    'create-text-video': async (args: any) => {
      logger.info('Creating text video', { text: args.text?.substring(0, 50) + '...' });

      try {
        const videoPath = await remotionService.createTextVideo(
          args.text,
          args.duration || 10,
          {
            fontSize: args.fontSize,
            backgroundColor: args.backgroundColor,
            textColor: args.textColor,
            fontFamily: args.fontFamily,
          }
        );

        // Create a basic Studio project for text video
        const textRequest = {
          animationDesc: args.text,
          duration: args.duration || 10,
          fps: 30,
          dimensions: { width: 1920, height: 1080 },
          style: 'text-only',
          compositionCode: args.compositionCode,
        };

        const studioProjectPath = await remotionService.createStudioProject(textRequest, {
          voiceTracks: [],
          soundEffects: [],
          images: [],
        });

        return {
          success: true,
          videoPath,
          studioProjectPath,
          duration: args.duration || 10,
          text: args.text,
          instructions: [
            `Text video rendered to: ${videoPath}`,
            `Studio project created at: ${studioProjectPath}`,
            'Use launch-remotion-studio tool to view and edit the text animation',
            'Studio will automatically open with THIS project (not previous ones)',
            'You can modify the text, colors, and animations in Studio',
          ],
        };

      } catch (error) {
        logger.error('Text video creation failed', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },

    'generate-video-assets': async (args: any) => {
      logger.info('Generating video assets', { 
        voiceRequests: args.voiceRequests?.length || 0,
        imageRequests: args.imageRequests?.length || 0,
        soundRequests: args.soundRequests?.length || 0,
      });

      const results = {
        voiceTracks: [] as any[],
        images: [] as any[],
        soundEffects: [] as any[],
        errors: [] as any[],
      };

      try {
        await fileManager.initializeDirectories();

        // Generate voice tracks
        if (args.voiceRequests?.length && elevenlabsService) {
          for (const request of args.voiceRequests) {
            try {
              const result = await elevenlabsService.generateVoice(request);
              results.voiceTracks.push(result);
            } catch (error) {
              results.errors.push({ type: 'voice', request, error: error instanceof Error ? error.message : String(error) });
            }
          }
        }

        // Generate images
        if (args.imageRequests?.length && fluxService) {
          for (const request of args.imageRequests) {
            try {
              const result = await fluxService.generateImage(request);
              results.images.push(result);
            } catch (error) {
              results.errors.push({ type: 'image', request, error: error instanceof Error ? error.message : String(error) });
            }
          }
        }

        // Search and download sound effects
        if (args.soundRequests?.length && freesoundService) {
          for (const request of args.soundRequests) {
            try {
              const sfxResults = await freesoundService.searchAndDownload(request);
              results.soundEffects.push(...sfxResults);
            } catch (error) {
              results.errors.push({ type: 'sound', request, error: error instanceof Error ? error.message : String(error) });
            }
          }
        }

        logger.info('Asset generation completed', {
          voiceTracks: results.voiceTracks.length,
          images: results.images.length,
          soundEffects: results.soundEffects.length,
          errors: results.errors.length,
        });

        return {
          success: true,
          assets: results,
        };

      } catch (error) {
        logger.error('Asset generation failed', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },

    'estimate-render-time': async (args: any) => {
      const fps = args.fps || 30;
      const duration = args.duration;
      const complexity = args.complexity || 'medium';
      const assetCount = args.assetCount || {};

      const durationInFrames = Math.round(duration * fps);
      
      // Base estimation (1 second per frame for medium complexity)
      let baseTime = durationInFrames * 1000;
      
      // Complexity multipliers
      const complexityMultipliers = {
        low: 0.5,
        medium: 1.0,
        high: 2.0,
      };
      
      baseTime *= complexityMultipliers[complexity as keyof typeof complexityMultipliers] || 1.0;
      
      // Asset complexity adjustments
      const assetAdjustment = (
        (assetCount.images || 0) * 500 +
        (assetCount.audioTracks || 0) * 200 +
        (assetCount.effects || 0) * 1000
      );
      
      const estimatedTime = baseTime + assetAdjustment;

      function formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
          return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
          return `${minutes}m ${seconds % 60}s`;
        } else {
          return `${seconds}s`;
        }
      }
      
      return {
        estimatedRenderTime: Math.round(estimatedTime),
        estimatedRenderTimeFormatted: formatDuration(estimatedTime),
        factors: {
          durationInFrames,
          fps,
          complexity,
          assetCount,
          baseTime,
          assetAdjustment,
        },
      };
    },
  };
}