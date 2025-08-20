// Image generation MCP tools using Flux
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MCPConfig } from '../types/index.js';
import { ImageGenerationSchema } from '../utils/validation.js';
import { FluxService } from '../services/flux.js';
import { FileManagerService } from '../services/file-manager.js';
import { getLogger } from '../utils/logger.js';

export function createImageTools(config: MCPConfig): Tool[] {
  return [
    {
      name: 'generate-image',
      description: 'Generate an image from a text prompt using Flux AI',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Text prompt describing the image to generate',
            minLength: 1,
            maxLength: 1000,
          },
          model: {
            type: 'string',
            description: 'Flux model to use',
            enum: ['FLUX.1-pro', 'FLUX.1-dev', 'FLUX.1-schnell'],
            default: 'FLUX.1-pro',
          },
          width: {
            type: 'number',
            description: 'Image width in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          height: {
            type: 'number',
            description: 'Image height in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          outputPath: {
            type: 'string',
            description: 'Custom output file path (optional)',
          },
        },
        required: ['prompt'],
      },
    },

    {
      name: 'generate-image-variations',
      description: 'Generate multiple variations of an image from a prompt',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Base text prompt for image generation',
            minLength: 1,
            maxLength: 1000,
          },
          count: {
            type: 'number',
            description: 'Number of variations to generate',
            minimum: 1,
            maximum: 5,
            default: 3,
          },
          model: {
            type: 'string',
            description: 'Flux model to use',
            enum: ['FLUX.1-pro', 'FLUX.1-dev', 'FLUX.1-schnell'],
            default: 'FLUX.1-pro',
          },
          width: {
            type: 'number',
            description: 'Image width in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          height: {
            type: 'number',
            description: 'Image height in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          outputDir: {
            type: 'string',
            description: 'Directory to save variations (optional)',
          },
        },
        required: ['prompt'],
      },
    },

    {
      name: 'generate-styled-image',
      description: 'Generate an image with a specific artistic style',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Base prompt describing the subject',
            minLength: 1,
            maxLength: 800,
          },
          style: {
            type: 'string',
            description: 'Artistic style to apply',
            enum: [
              'photorealistic',
              'oil painting',
              'watercolor',
              'digital art',
              'anime',
              'cartoon',
              'sketch',
              'abstract',
              'surreal',
              'cyberpunk',
              'vintage',
              'minimalist',
            ],
          },
          model: {
            type: 'string',
            description: 'Flux model to use',
            default: 'FLUX.1-pro',
          },
          width: {
            type: 'number',
            description: 'Image width in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          height: {
            type: 'number',
            description: 'Image height in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          outputPath: {
            type: 'string',
            description: 'Custom output file path (optional)',
          },
        },
        required: ['prompt', 'style'],
      },
    },

    {
      name: 'batch-generate-images',
      description: 'Generate multiple images from different prompts',
      inputSchema: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            description: 'Array of prompts to generate images for',
            items: {
              type: 'string',
              minLength: 1,
              maxLength: 1000,
            },
            maxItems: 10,
          },
          model: {
            type: 'string',
            description: 'Flux model to use for all images',
            default: 'FLUX.1-pro',
          },
          width: {
            type: 'number',
            description: 'Image width in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          height: {
            type: 'number',
            description: 'Image height in pixels',
            minimum: 256,
            maximum: 2048,
            default: 1024,
          },
          outputDir: {
            type: 'string',
            description: 'Directory to save images (optional)',
          },
        },
        required: ['prompts'],
      },
    },

    {
      name: 'optimize-image-prompt',
      description: 'Optimize a prompt for better image generation results',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Original prompt to optimize',
            minLength: 1,
            maxLength: 1000,
          },
          style: {
            type: 'string',
            description: 'Desired style (optional)',
          },
          generateImage: {
            type: 'boolean',
            description: 'Whether to generate an image with the optimized prompt',
            default: false,
          },
        },
        required: ['prompt'],
      },
    },

    {
      name: 'get-flux-models',
      description: 'Get available Flux models and their capabilities',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

export function createImageHandlers(config: MCPConfig) {
  const logger = getLogger().service('ImageHandlers');
  
  if (!config.apiKeys.flux) {
    logger.warn('Flux API key not configured - image tools will not work');
  }

  const fluxService = config.apiKeys.flux ? new FluxService(config) : null;
  const fileManager = new FileManagerService(config);

  return {
    'generate-image': async (args: any) => {
      if (!fluxService) {
        throw new Error('Flux API key is required for image generation');
      }

      logger.info('Generating image', { 
        prompt: args.prompt?.substring(0, 100) + '...',
        model: args.model,
        dimensions: `${args.width || 1024}x${args.height || 1024}`
      });

      try {
        // Validate input
        const validatedArgs = ImageGenerationSchema.parse(args);

        await fileManager.initializeDirectories();

        const result = await fluxService.generateImageWithRetry(validatedArgs);

        logger.info('Image generation completed', { 
          imagePath: result.imagePath 
        });

        return {
          success: true,
          imagePath: result.imagePath,
          metadata: result.metadata,
          prompt: args.prompt,
        };

      } catch (error) {
        logger.error('Image generation failed', { 
          prompt: args.prompt?.substring(0, 100) + '...',
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'generate-image-variations': async (args: any) => {
      if (!fluxService) {
        throw new Error('Flux API key is required for image variations');
      }

      logger.info('Generating image variations', { 
        prompt: args.prompt?.substring(0, 100) + '...',
        count: args.count 
      });

      try {
        await fileManager.initializeDirectories();

        const results = await fluxService.generateVariations(
          args.prompt,
          args.count || 3,
          {
            model: args.model,
            width: args.width,
            height: args.height,
            outputDir: args.outputDir,
          }
        );

        logger.info('Image variations completed', { 
          generated: results.length 
        });

        return {
          success: true,
          prompt: args.prompt,
          variations: results.map((result, index) => ({
            index: index + 1,
            imagePath: result.imagePath,
            metadata: result.metadata,
          })),
          summary: {
            requested: args.count || 3,
            generated: results.length,
          },
        };

      } catch (error) {
        logger.error('Image variations failed', { 
          prompt: args.prompt?.substring(0, 100) + '...',
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'generate-styled-image': async (args: any) => {
      if (!fluxService) {
        throw new Error('Flux API key is required for styled image generation');
      }

      logger.info('Generating styled image', { 
        prompt: args.prompt?.substring(0, 100) + '...',
        style: args.style 
      });

      try {
        await fileManager.initializeDirectories();

        const result = await fluxService.generateWithStyle(
          args.prompt,
          args.style,
          {
            model: args.model,
            width: args.width,
            height: args.height,
            outputPath: args.outputPath,
          }
        );

        logger.info('Styled image generation completed', { 
          imagePath: result.imagePath,
          style: args.style 
        });

        return {
          success: true,
          imagePath: result.imagePath,
          metadata: result.metadata,
          prompt: args.prompt,
          style: args.style,
        };

      } catch (error) {
        logger.error('Styled image generation failed', { 
          prompt: args.prompt?.substring(0, 100) + '...',
          style: args.style,
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'batch-generate-images': async (args: any) => {
      if (!fluxService) {
        throw new Error('Flux API key is required for batch image generation');
      }

      logger.info('Starting batch image generation', { 
        count: args.prompts?.length 
      });

      try {
        if (!args.prompts || !Array.isArray(args.prompts) || args.prompts.length === 0) {
          throw new Error('prompts array is required and must not be empty');
        }

        await fileManager.initializeDirectories();

        const results = [];
        const errors = [];

        for (let i = 0; i < args.prompts.length; i++) {
          const prompt = args.prompts[i];
          
          try {
            logger.debug(`Generating image ${i + 1}/${args.prompts.length}`);
            
            const result = await fluxService.generateImage({
              prompt,
              model: args.model,
              width: args.width,
              height: args.height,
            });

            results.push({
              index: i,
              prompt: prompt.substring(0, 100) + '...',
              imagePath: result.imagePath,
              metadata: result.metadata,
            });

          } catch (error) {
            errors.push({
              index: i,
              prompt: prompt.substring(0, 100) + '...',
              error: error instanceof Error ? error.message : String(error),
            });
            
            logger.warn(`Failed to generate image for prompt ${i + 1}`, { 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        }

        logger.info('Batch image generation completed', { 
          successful: results.length,
          failed: errors.length 
        });

        return {
          success: true,
          results,
          errors,
          summary: {
            total: args.prompts.length,
            successful: results.length,
            failed: errors.length,
          },
        };

      } catch (error) {
        logger.error('Batch image generation failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'optimize-image-prompt': async (args: any) => {
      if (!fluxService) {
        throw new Error('Flux API key is required for prompt optimization');
      }

      logger.info('Optimizing image prompt', { 
        prompt: args.prompt?.substring(0, 100) + '...' 
      });

      try {
        const optimizedPrompt = fluxService.optimizePrompt(args.prompt);
        
        let generatedImage = null;
        if (args.generateImage) {
          await fileManager.initializeDirectories();
          
          const result = await fluxService.generateImage({
            prompt: optimizedPrompt,
          });
          
          generatedImage = {
            imagePath: result.imagePath,
            metadata: result.metadata,
          };
        }

        function getPromptImprovements(original: string, optimized: string): string[] {
          const improvements = [];
          
          if (optimized.includes('high quality') && !original.toLowerCase().includes('high quality')) {
            improvements.push('Added quality modifier');
          }
          
          if (optimized.includes('detailed') && !original.toLowerCase().includes('detailed')) {
            improvements.push('Added detail enhancement');
          }
          
          if (optimized.includes('professional') && !original.toLowerCase().includes('professional')) {
            improvements.push('Added professional styling');
          }
          
          if (optimized.length > original.length) {
            improvements.push('Enhanced with additional descriptors');
          }
          
          return improvements.length > 0 ? improvements : ['Minor formatting improvements'];
        }
        
        const improvements = getPromptImprovements(args.prompt, optimizedPrompt);
        
        return {
          success: true,
          originalPrompt: args.prompt,
          optimizedPrompt,
          improvements,
          generatedImage,
        };

      } catch (error) {
        logger.error('Prompt optimization failed', { 
          prompt: args.prompt?.substring(0, 100) + '...',
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    },

    'get-flux-models': async () => {
      if (!fluxService) {
        throw new Error('Flux API key is required to get models');
      }

      logger.info('Fetching available Flux models');

      try {
        const models = await fluxService.getModels();
        
        const modelInfo = {
          'FLUX.1-pro': {
            description: 'Highest quality model with best detail and accuracy',
            speed: 'Slow',
            quality: 'Highest',
            recommendedFor: 'Professional work, detailed artwork',
          },
          'FLUX.1-dev': {
            description: 'Balanced model for development and testing',
            speed: 'Medium',
            quality: 'High',
            recommendedFor: 'Development, experimentation',
          },
          'FLUX.1-schnell': {
            description: 'Fastest model for quick generation',
            speed: 'Fast',
            quality: 'Good',
            recommendedFor: 'Quick iterations, prototyping',
          },
        };

        return {
          success: true,
          availableModels: models,
          modelDetails: modelInfo,
          defaultModel: 'FLUX.1-pro',
        };

      } catch (error) {
        logger.error('Failed to fetch models', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        
        // Return default model info if API call fails
        return {
          success: true,
          availableModels: ['FLUX.1-pro', 'FLUX.1-dev', 'FLUX.1-schnell'],
          modelDetails: {
            'FLUX.1-pro': { description: 'Highest quality model', speed: 'Slow', quality: 'Highest' },
            'FLUX.1-dev': { description: 'Balanced model', speed: 'Medium', quality: 'High' },
            'FLUX.1-schnell': { description: 'Fastest model', speed: 'Fast', quality: 'Good' },
          },
          defaultModel: 'FLUX.1-pro',
          note: 'Model information retrieved from cache (API unavailable)',
        };
      }
    },
  };
}