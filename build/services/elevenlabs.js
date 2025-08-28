"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsService = void 0;
// ElevenLabs voice generation service
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const config_js_1 = require("../utils/config.js");
const logger_js_1 = require("../utils/logger.js");
const validation_js_1 = require("../utils/validation.js");
class ElevenLabsService {
    client;
    config;
    logger = (0, logger_js_1.getLogger)().service('ElevenLabs');
    constructor(config) {
        this.config = config;
        if (!config.apiKeys.elevenlabs) {
            throw new Error('ElevenLabs API key is required');
        }
        this.client = axios_1.default.create({
            baseURL: 'https://api.elevenlabs.io/v1',
            headers: {
                'xi-api-key': config.apiKeys.elevenlabs,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
        this.logger.info('ElevenLabs service initialized');
    }
    /**
     * Generate voice audio from text
     */
    async generateVoice(request) {
        const startTime = Date.now();
        this.logger.info('Starting voice generation', {
            textLength: request.text.length,
            voiceId: request.voiceId,
            modelId: request.modelId
        });
        try {
            // Validate input text
            const textValidation = (0, validation_js_1.validateTextContent)(request.text, 10000);
            if (!textValidation.isValid) {
                throw new Error(`Invalid text content: ${textValidation.errors.join(', ')}`);
            }
            // Prepare output path
            const audioDir = (0, config_js_1.getAssetPath)(this.config, 'audio');
            await fs_extra_1.default.ensureDir(audioDir);
            const filename = request.outputPath || `voice_${(0, uuid_1.v4)()}.mp3`;
            const audioPath = path_1.default.isAbsolute(filename) ? filename : path_1.default.join(audioDir, filename);
            // Generate audio using REST API
            const response = await this.client.post(`/text-to-speech/${request.voiceId || 'pNInz6obpgDQGcFmaJgB'}`, // Default Adam voice ID
            {
                text: request.text,
                model_id: request.modelId || 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true,
                },
            }, {
                responseType: 'arraybuffer',
            });
            // Convert response to buffer
            const audioBuffer = Buffer.from(response.data);
            // Save audio file
            await fs_extra_1.default.writeFile(audioPath, audioBuffer);
            // Get audio duration (approximate based on text length and speaking rate)
            // Rough estimate: 150 words per minute, average 5 characters per word
            const estimatedDuration = (request.text.length / 5 / 150) * 60;
            const result = {
                audioPath,
                duration: estimatedDuration,
                metadata: {
                    voiceId: request.voiceId || 'Adam',
                    modelId: request.modelId || 'eleven_multilingual_v2',
                    textLength: request.text.length,
                    timestamp: new Date().toISOString(),
                },
            };
            const endTime = Date.now();
            this.logger.info('Voice generation completed', {
                duration: endTime - startTime,
                audioPath,
                fileSize: audioBuffer.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Voice generation failed', {
                error: error instanceof Error ? error.message : String(error),
                request: { ...request, text: request.text.substring(0, 100) + '...' }
            });
            throw error;
        }
    }
    /**
     * Get available voices
     */
    async getVoices() {
        try {
            this.logger.debug('Fetching available voices');
            const response = await this.client.get('/voices');
            const voices = response.data.voices || [];
            this.logger.debug('Retrieved voices', { count: voices.length });
            return voices;
        }
        catch (error) {
            this.logger.error('Failed to fetch voices', { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
    /**
     * Get voice by ID with details
     */
    async getVoiceById(voiceId) {
        try {
            this.logger.debug('Fetching voice details', { voiceId });
            const response = await this.client.get(`/voices/${voiceId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch voice details', {
                voiceId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Test the ElevenLabs connection
     */
    async testConnection() {
        try {
            this.logger.info('Testing ElevenLabs connection');
            await this.getVoices();
            this.logger.info('ElevenLabs connection test successful');
            return true;
        }
        catch (error) {
            this.logger.error('ElevenLabs connection test failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
    /**
     * Generate voice with retry logic
     */
    async generateVoiceWithRetry(request, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.debug(`Voice generation attempt ${attempt}/${maxRetries}`);
                return await this.generateVoice(request);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`Voice generation attempt ${attempt} failed`, {
                    error: lastError.message,
                    remaining: maxRetries - attempt
                });
                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    this.logger.debug(`Retrying in ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
}
exports.ElevenLabsService = ElevenLabsService;
//# sourceMappingURL=elevenlabs.js.map