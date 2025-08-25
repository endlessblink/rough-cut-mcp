import { VideoCreationSchema } from '../utils/validation.js';
import { ElevenLabsService } from '../services/elevenlabs.js';
import { FreesoundService } from '../services/freesound.js';
import { FluxService } from '../services/flux.js';
import { RemotionService } from '../services/remotion.js';
import { FileManagerService } from '../services/file-manager.js';
import { getLogger } from '../utils/logger.js';
import * as fs from 'fs-extra';
import path from 'path';
export function createVideoCreationTools(config) {
    const logger = getLogger().service('VideoTools');
    return [
        {
            name: 'create-complete-video',
            description: `ATTENTION CLAUDE: You MUST generate complete Remotion React component code using PROPER SEQUENCING.

⭐ CRITICAL: Use <Series> and <Series.Sequence> for multiple scenes to create SEPARATE TIMELINE CLIPS!

MANDATORY STEPS:
1. Generate a complete React component using Remotion hooks
2. Use <Series> for multiple scenes/segments (NOT conditional rendering based on frames)
3. Include the code in the compositionCode parameter

✅ CORRECT STRUCTURE FOR MULTIPLE SCENES:
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Series } from 'remotion';

export const VideoComposition: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={120}>
        <Scene1 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={90}>
        <Scene2 />
      </Series.Sequence>
    </Series>
  );
};

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  // Scene 1 animations using frame 0-119
  return <AbsoluteFill>{/* Scene 1 content */}</AbsoluteFill>;
};

❌ WRONG: Do NOT use conditional rendering like {frame < 120 && <Scene1 />}
❌ WRONG: Do NOT use frame offsets like frame - 120 for scenes
✅ RIGHT: Each scene uses useCurrentFrame() starting from 0

DO NOT call this tool without providing compositionCode with proper Series structure!`,
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
                        description: 'REQUIRED: Complete Remotion React component code that you generate',
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
                required: ['animationDesc', 'compositionCode'],
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
        {
            name: 'generate-remotion-code',
            description: 'Generate Remotion React component code for animations',
            inputSchema: {
                type: 'object',
                properties: {
                    animationType: {
                        type: 'string',
                        description: 'Type of animation (e.g., "moving car", "bouncing ball", "rotating square")'
                    }
                },
                required: ['animationType']
            }
        },
        {
            name: 'fix-composition-timeline',
            description: 'Fix existing Remotion compositions to use proper Series structure for separate timeline clips',
            inputSchema: {
                type: 'object',
                properties: {
                    projectName: {
                        type: 'string',
                        description: 'Name of the project to fix (e.g., "personal-brand-intro")'
                    },
                    compositionFilePath: {
                        type: 'string',
                        description: 'Optional: Path to the composition file. If not provided, will search for VideoComposition.tsx'
                    },
                    backupOriginal: {
                        type: 'boolean',
                        description: 'Whether to create a backup of the original file',
                        default: true
                    }
                },
                required: ['projectName']
            }
        },
    ];
}
export function createVideoCreationHandlers(config) {
    const logger = getLogger().service('VideoHandlers');
    // Initialize services
    let elevenlabsService = null;
    let freesoundService = null;
    let fluxService = null;
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
    }
    catch (error) {
        logger.warn('Some services could not be initialized', {
            error: error instanceof Error ? error.message : String(error)
        });
    }
    return {
        'create-complete-video': async (args) => {
            // Add logging to see what Claude is sending (using logger, not console)
            logger.debug('Received parameters:', {
                hasAnimationDesc: !!args.animationDesc,
                hasCompositionCode: !!args.compositionCode,
                codeLength: args.compositionCode?.length || 0
            });
            logger.info('Starting complete video creation', {
                animationDesc: args.animationDesc?.substring(0, 100) + '...',
                hasCompositionCode: !!args.compositionCode,
                compositionCodeLength: args.compositionCode?.length || 0
            });
            // Explicit check for missing code
            if (!args.compositionCode || args.compositionCode.trim().length === 0) {
                throw new Error(`MISSING COMPOSITIONCODE: Claude must generate complete Remotion React component code and include it in the compositionCode parameter.

Example code structure needed:
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 150], [0, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#87CEEB' }}>
      <div style={{
        width: 100,
        height: 50,
        backgroundColor: '#FF6B6B',
        position: 'absolute',
        left: interpolate(progress, [0, 1], ['0%', '80%']),
        top: '50%',
        transform: 'translateY(-50%)'
      }} />
    </AbsoluteFill>
  );
};`);
            }
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
                const voiceTracks = [];
                if (validatedArgs.narration && elevenlabsService) {
                    assetPromises.push(elevenlabsService.generateVoiceWithRetry({
                        text: validatedArgs.narration,
                    }).then(result => voiceTracks.push(result)));
                }
                // Sound effects
                const soundEffects = [];
                if (validatedArgs.sfxDesc?.length && freesoundService) {
                    for (const sfxQuery of validatedArgs.sfxDesc) {
                        assetPromises.push(freesoundService.searchAndDownload({
                            query: sfxQuery,
                            maxResults: 1,
                        }).then(results => soundEffects.push(...results)));
                    }
                }
                // Images
                const images = [];
                if (validatedArgs.imageDesc?.length && fluxService) {
                    for (const imagePrompt of validatedArgs.imageDesc) {
                        assetPromises.push(fluxService.generateImageWithRetry({
                            prompt: imagePrompt,
                        }).then(result => images.push(result)));
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
                // Verify project completeness
                const requiredFiles = [
                    'package.json',
                    'remotion.config.ts',
                    'tsconfig.json',
                    'src/index.ts',
                    'src/Composition.tsx',
                    'src/Video.tsx'
                ];
                const missingFiles = [];
                for (const file of requiredFiles) {
                    const filePath = path.join(studioProjectPath, file);
                    if (!await fs.pathExists(filePath)) {
                        missingFiles.push(file);
                        logger.error(`Required file missing: ${file}`);
                    }
                }
                if (missingFiles.length > 0) {
                    throw new Error(`Project creation incomplete. Missing files: ${missingFiles.join(', ')}`);
                }
                // Verify dependencies are installed
                const nodeModulesPath = path.join(studioProjectPath, 'node_modules');
                if (!await fs.pathExists(nodeModulesPath)) {
                    logger.warn('Dependencies not installed, attempting to install now...');
                    const { safeNpmInstall } = await import('../utils/safe-spawn.js');
                    const installResult = await safeNpmInstall(studioProjectPath, 120000);
                    if (!installResult.success) {
                        logger.error('Failed to install dependencies', { error: installResult.error });
                        // Don't throw error, just warn - dependencies will be installed on studio launch
                        logger.warn('Dependencies will be installed when studio launches');
                    }
                }
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
            }
            catch (error) {
                logger.error('Video creation failed:', error);
                logger.error('Video creation failed', { error: error instanceof Error ? error.message : String(error) });
                throw error;
            }
        },
        'create-text-video': async (args) => {
            logger.info('Creating text video', { text: args.text?.substring(0, 50) + '...' });
            try {
                const videoPath = await remotionService.createTextVideo(args.text, args.duration || 10, {
                    fontSize: args.fontSize,
                    backgroundColor: args.backgroundColor,
                    textColor: args.textColor,
                    fontFamily: args.fontFamily,
                });
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
            }
            catch (error) {
                logger.error('Text video creation failed', { error: error instanceof Error ? error.message : String(error) });
                throw error;
            }
        },
        'generate-video-assets': async (args) => {
            logger.info('Generating video assets', {
                voiceRequests: args.voiceRequests?.length || 0,
                imageRequests: args.imageRequests?.length || 0,
                soundRequests: args.soundRequests?.length || 0,
            });
            const results = {
                voiceTracks: [],
                images: [],
                soundEffects: [],
                errors: [],
            };
            try {
                await fileManager.initializeDirectories();
                // Generate voice tracks
                if (args.voiceRequests?.length && elevenlabsService) {
                    for (const request of args.voiceRequests) {
                        try {
                            const result = await elevenlabsService.generateVoice(request);
                            results.voiceTracks.push(result);
                        }
                        catch (error) {
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
                        }
                        catch (error) {
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
                        }
                        catch (error) {
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
            }
            catch (error) {
                logger.error('Asset generation failed', { error: error instanceof Error ? error.message : String(error) });
                throw error;
            }
        },
        'estimate-render-time': async (args) => {
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
            baseTime *= complexityMultipliers[complexity] || 1.0;
            // Asset complexity adjustments
            const assetAdjustment = ((assetCount.images || 0) * 500 +
                (assetCount.audioTracks || 0) * 200 +
                (assetCount.effects || 0) * 1000);
            const estimatedTime = baseTime + assetAdjustment;
            function formatDuration(ms) {
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                if (hours > 0) {
                    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
                }
                else if (minutes > 0) {
                    return `${minutes}m ${seconds % 60}s`;
                }
                else {
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
        'fix-composition-timeline': async (args) => {
            logger.info('Fixing composition timeline structure', {
                projectName: args.projectName,
                backupOriginal: args.backupOriginal
            });
            try {
                const projectPath = path.join(config.assetsDir, 'projects', args.projectName);
                // Check if project exists
                if (!await fs.pathExists(projectPath)) {
                    throw new Error(`Project '${args.projectName}' not found in assets/projects`);
                }
                // Find the composition file
                const compositionFile = args.compositionFilePath ||
                    path.join(projectPath, 'src', 'VideoComposition.tsx');
                if (!await fs.pathExists(compositionFile)) {
                    throw new Error(`Composition file not found: ${compositionFile}`);
                }
                // Read the current composition code
                const originalCode = await fs.readFile(compositionFile, 'utf-8');
                // Import analysis functions
                const { analyzeCompositionStructure, transformToSeriesStructure } = await import('../utils/composition-templates.js');
                // Analyze the composition structure
                const analysis = analyzeCompositionStructure(originalCode);
                // Check if transformation is needed
                if (!analysis.needsTransformation) {
                    return {
                        success: true,
                        message: `Project '${args.projectName}' already uses proper Series structure`,
                        analysis: {
                            sceneCount: analysis.sceneCount,
                            usesSeries: analysis.usesSeries,
                            usesConditionalRendering: analysis.usesConditionalRendering,
                            recommendedStructure: analysis.recommendedStructure
                        }
                    };
                }
                // Create backup if requested
                if (args.backupOriginal !== false) {
                    const backupFile = compositionFile + '.backup.' + Date.now();
                    await fs.writeFile(backupFile, originalCode);
                    logger.info('Original file backed up', { backupFile });
                }
                // Transform the composition
                const transformedCode = transformToSeriesStructure(originalCode, analysis);
                // Write the transformed code
                await fs.writeFile(compositionFile, transformedCode);
                // Also update the duration in the schema files if needed
                const videoTsxPath = path.join(projectPath, 'src', 'Video.tsx');
                const indexTsxPath = path.join(projectPath, 'src', 'index.tsx');
                for (const filePath of [videoTsxPath, indexTsxPath]) {
                    if (await fs.pathExists(filePath)) {
                        const content = await fs.readFile(filePath, 'utf-8');
                        // Update duration to match total scene durations
                        const totalDuration = analysis.detectedScenes.reduce((sum, scene) => sum + (scene.duration || 90), 0);
                        if (totalDuration > 0) {
                            const updatedContent = content.replace(/durationInFrames={(\d+)}/g, `durationInFrames={${totalDuration}}`);
                            await fs.writeFile(filePath, updatedContent);
                        }
                    }
                }
                logger.info('Composition transformation completed', {
                    projectName: args.projectName,
                    scenesDetected: analysis.sceneCount,
                    transformedFrom: 'conditional rendering',
                    transformedTo: 'Series structure'
                });
                return {
                    success: true,
                    message: `Successfully transformed '${args.projectName}' to use Series structure`,
                    transformation: {
                        originalStructure: 'conditional rendering',
                        newStructure: 'Series with separate sequences',
                        scenesDetected: analysis.sceneCount,
                        detectedScenes: analysis.detectedScenes.map(s => ({
                            name: s.name,
                            duration: s.duration,
                            startFrame: s.startFrame
                        }))
                    },
                    files: {
                        transformed: compositionFile,
                        backup: args.backupOriginal !== false ? compositionFile + '.backup.*' : null
                    },
                    instructions: [
                        `Project '${args.projectName}' has been transformed to use Series structure`,
                        'Each scene will now appear as a separate clip in the Remotion Studio timeline',
                        'Launch the project with launch-project-studio to see the separate clips',
                        'You can now edit each scene independently in the timeline'
                    ]
                };
            }
            catch (error) {
                logger.error('Failed to fix composition timeline', {
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        },
        'generate-remotion-code': async (args) => {
            logger.info('Generating Remotion code template', { animationType: args.animationType });
            const templates = {
                'moving car': `
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const carPosition = interpolate(frame, [0, 150], [0, 80]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#87CEEB' }}>
      <div style={{
        width: 100,
        height: 50,
        backgroundColor: '#FF6B6B',
        position: 'absolute',
        left: carPosition + '%',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: '10px'
      }} />
    </AbsoluteFill>
  );
};`,
                'bouncing ball': `
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const bounceHeight = interpolate(
    frame % 30,
    [0, 15, 30],
    [0, -100, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#87CEEB' }}>
      <div style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        backgroundColor: '#FF6B6B',
        position: 'absolute',
        left: '50%',
        top: '70%',
        transform: \`translate(-50%, \${bounceHeight}px)\`
      }} />
    </AbsoluteFill>
  );
};`,
                'rotating square': `
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, 60], [0, 360]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: 100,
        height: 100,
        backgroundColor: '#4ECDC4',
        transform: \`rotate(\${rotation}deg)\`
      }} />
    </AbsoluteFill>
  );
};`
            };
            const selectedCode = templates[args.animationType] || templates['moving car'];
            return {
                success: true,
                code: selectedCode.trim(),
                animationType: args.animationType,
                message: 'Use this code in the compositionCode parameter of create-complete-video',
                instructions: [
                    'Copy the generated code',
                    'Use it as the compositionCode parameter when calling create-complete-video',
                    'The code creates a complete Remotion React component with animations'
                ]
            };
        },
    };
}
//# sourceMappingURL=video-creation.js.map