import { VoiceGenerationSchema } from '../utils/validation.js';
import { ElevenLabsService } from '../services/elevenlabs.js';
import { FileManagerService } from '../services/file-manager.js';
import { getLogger } from '../utils/logger.js';
export function createVoiceTools(config) {
    return [
        {
            name: 'generate-voice',
            description: 'Generate AI voice audio from text using ElevenLabs',
            inputSchema: {
                type: 'object',
                properties: {
                    text: {
                        type: 'string',
                        description: 'Text to convert to speech',
                        minLength: 1,
                        maxLength: 10000,
                    },
                    voiceId: {
                        type: 'string',
                        description: 'Voice ID to use (default: Adam)',
                        default: 'Adam',
                    },
                    modelId: {
                        type: 'string',
                        description: 'Model ID to use (default: eleven_multilingual_v2)',
                        default: 'eleven_multilingual_v2',
                    },
                    outputPath: {
                        type: 'string',
                        description: 'Custom output file path (optional)',
                    },
                },
                required: ['text'],
            },
        },
        {
            name: 'list-voices',
            description: 'Get list of available voices from ElevenLabs',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get-voice-details',
            description: 'Get detailed information about a specific voice',
            inputSchema: {
                type: 'object',
                properties: {
                    voiceId: {
                        type: 'string',
                        description: 'Voice ID to get details for',
                    },
                },
                required: ['voiceId'],
            },
        },
        {
            name: 'test-voice-generation',
            description: 'Test voice generation with a short sample text',
            inputSchema: {
                type: 'object',
                properties: {
                    voiceId: {
                        type: 'string',
                        description: 'Voice ID to test (default: Adam)',
                        default: 'Adam',
                    },
                    sampleText: {
                        type: 'string',
                        description: 'Sample text to generate (default provided)',
                        default: 'This is a test of the voice generation system.',
                    },
                },
            },
        },
        {
            name: 'batch-generate-voice',
            description: 'Generate multiple voice clips from an array of texts',
            inputSchema: {
                type: 'object',
                properties: {
                    texts: {
                        type: 'array',
                        description: 'Array of texts to convert to speech',
                        items: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 5000,
                        },
                        maxItems: 10,
                    },
                    voiceId: {
                        type: 'string',
                        description: 'Voice ID to use for all generations',
                        default: 'Adam',
                    },
                    modelId: {
                        type: 'string',
                        description: 'Model ID to use for all generations',
                        default: 'eleven_multilingual_v2',
                    },
                    outputDir: {
                        type: 'string',
                        description: 'Directory to save audio files (optional)',
                    },
                },
                required: ['texts'],
            },
        },
    ];
}
export function createVoiceHandlers(config) {
    const logger = getLogger().service('VoiceHandlers');
    if (!config.apiKeys.elevenlabs) {
        logger.warn('ElevenLabs API key not configured - voice tools will not work');
    }
    const elevenlabsService = config.apiKeys.elevenlabs ? new ElevenLabsService(config) : null;
    const fileManager = new FileManagerService(config);
    return {
        'generate-voice': async (args) => {
            if (!elevenlabsService) {
                throw new Error('ElevenLabs API key is required for voice generation');
            }
            logger.info('Generating voice', {
                textLength: args.text?.length,
                voiceId: args.voiceId
            });
            try {
                // Validate input
                const validatedArgs = VoiceGenerationSchema.parse(args);
                await fileManager.initializeDirectories();
                const result = await elevenlabsService.generateVoiceWithRetry(validatedArgs);
                logger.info('Voice generation completed', {
                    audioPath: result.audioPath,
                    duration: result.duration
                });
                return {
                    success: true,
                    audioPath: result.audioPath,
                    duration: result.duration,
                    metadata: result.metadata,
                    textLength: args.text.length,
                };
            }
            catch (error) {
                logger.error('Voice generation failed', {
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        },
        'list-voices': async () => {
            if (!elevenlabsService) {
                throw new Error('ElevenLabs API key is required to list voices');
            }
            logger.info('Fetching available voices');
            try {
                const voices = await elevenlabsService.getVoices();
                const formattedVoices = voices.map((voice) => ({
                    voice_id: voice.voice_id,
                    name: voice.name,
                    category: voice.category,
                    description: voice.description,
                    accent: voice.labels?.accent,
                    age: voice.labels?.age,
                    gender: voice.labels?.gender,
                    use_case: voice.labels?.use_case,
                }));
                logger.info('Voices retrieved', { count: formattedVoices.length });
                return {
                    success: true,
                    voices: formattedVoices,
                    count: formattedVoices.length,
                };
            }
            catch (error) {
                logger.error('Failed to fetch voices', {
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        },
        'get-voice-details': async (args) => {
            if (!elevenlabsService) {
                throw new Error('ElevenLabs API key is required to get voice details');
            }
            logger.info('Fetching voice details', { voiceId: args.voiceId });
            try {
                const voice = await elevenlabsService.getVoiceById(args.voiceId);
                return {
                    success: true,
                    voice: {
                        voice_id: voice.voice_id,
                        name: voice.name,
                        category: voice.category,
                        description: voice.description,
                        labels: voice.labels,
                        preview_url: voice.preview_url,
                        settings: voice.settings,
                    },
                };
            }
            catch (error) {
                logger.error('Failed to fetch voice details', {
                    voiceId: args.voiceId,
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        },
        'test-voice-generation': async (args) => {
            if (!elevenlabsService) {
                throw new Error('ElevenLabs API key is required for voice testing');
            }
            const sampleText = args.sampleText || 'This is a test of the voice generation system.';
            const voiceId = args.voiceId || 'Adam';
            logger.info('Testing voice generation', { voiceId, sampleText });
            try {
                await fileManager.initializeDirectories();
                const result = await elevenlabsService.generateVoice({
                    text: sampleText,
                    voiceId,
                });
                return {
                    success: true,
                    message: 'Voice generation test completed successfully',
                    audioPath: result.audioPath,
                    duration: result.duration,
                    voiceId,
                    sampleText,
                };
            }
            catch (error) {
                logger.error('Voice generation test failed', {
                    voiceId,
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        },
        'batch-generate-voice': async (args) => {
            if (!elevenlabsService) {
                throw new Error('ElevenLabs API key is required for batch voice generation');
            }
            logger.info('Starting batch voice generation', {
                count: args.texts?.length,
                voiceId: args.voiceId
            });
            try {
                if (!args.texts || !Array.isArray(args.texts) || args.texts.length === 0) {
                    throw new Error('texts array is required and must not be empty');
                }
                await fileManager.initializeDirectories();
                const results = [];
                const errors = [];
                for (let i = 0; i < args.texts.length; i++) {
                    const text = args.texts[i];
                    try {
                        logger.debug(`Generating voice ${i + 1}/${args.texts.length}`);
                        const result = await elevenlabsService.generateVoice({
                            text,
                            voiceId: args.voiceId,
                            modelId: args.modelId,
                        });
                        results.push({
                            index: i,
                            text: text.substring(0, 50) + '...',
                            audioPath: result.audioPath,
                            duration: result.duration,
                            metadata: result.metadata,
                        });
                    }
                    catch (error) {
                        errors.push({
                            index: i,
                            text: text.substring(0, 50) + '...',
                            error: error instanceof Error ? error.message : String(error),
                        });
                        logger.warn(`Failed to generate voice for text ${i + 1}`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                }
                logger.info('Batch voice generation completed', {
                    successful: results.length,
                    failed: errors.length
                });
                return {
                    success: true,
                    results,
                    errors,
                    summary: {
                        total: args.texts.length,
                        successful: results.length,
                        failed: errors.length,
                        totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
                    },
                };
            }
            catch (error) {
                logger.error('Batch voice generation failed', {
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            }
        },
    };
}
//# sourceMappingURL=voice-tools.js.map