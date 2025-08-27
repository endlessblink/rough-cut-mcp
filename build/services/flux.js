// Flux (Black Forest Labs) image generation service
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAssetPath } from '../utils/config.js';
import { getLogger } from '../utils/logger.js';
import { validateTextContent } from '../utils/validation.js';
export class FluxService {
    client;
    config;
    logger = getLogger().service('Flux');
    constructor(config) {
        this.config = config;
        if (!config.apiKeys.flux) {
            throw new Error('Flux API key is required');
        }
        this.client = axios.create({
            baseURL: config.apiEndpoints.flux,
            headers: {
                'Authorization': `Bearer ${config.apiKeys.flux}`,
                'Content-Type': 'application/json',
            },
            timeout: 120000, // 2 minutes for image generation
        });
        this.logger.info('Flux service initialized');
    }
    /**
     * Generate image from text prompt
     */
    async generateImage(request) {
        const startTime = Date.now();
        this.logger.info('Starting image generation', {
            prompt: request.prompt.substring(0, 100) + '...',
            model: request.model,
            dimensions: `${request.width || 1024}x${request.height || 1024}`
        });
        try {
            // Validate input prompt
            const promptValidation = validateTextContent(request.prompt, 1000);
            if (!promptValidation.isValid) {
                throw new Error(`Invalid prompt: ${promptValidation.errors.join(', ')}`);
            }
            // Prepare output path
            const imageDir = getAssetPath(this.config, 'images');
            await fs.ensureDir(imageDir);
            const filename = request.outputPath || `flux_${uuidv4()}.png`;
            const imagePath = path.isAbsolute(filename) ? filename : path.join(imageDir, filename);
            // Generate image
            const generateResponse = await this.client.post('/image/generate', {
                prompt: request.prompt,
                model: request.model || 'FLUX.1-pro',
                width: request.width || 1024,
                height: request.height || 1024,
                steps: 25,
                guidance_scale: 7.5,
                safety_checker: true,
                seed: Math.floor(Math.random() * 1000000),
            });
            const taskId = generateResponse.data.id;
            this.logger.debug('Image generation started', { taskId });
            // Poll for completion
            let imageData;
            let attempts = 0;
            const maxAttempts = 60; // 5 minutes max (5s intervals)
            do {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                attempts++;
                const statusResponse = await this.client.get(`/image/status/${taskId}`);
                imageData = statusResponse.data;
                this.logger.debug('Checking generation status', {
                    taskId,
                    status: imageData.status,
                    attempt: attempts
                });
                if (imageData.status === 'error') {
                    throw new Error(`Image generation failed: ${imageData.error || 'Unknown error'}`);
                }
                if (attempts >= maxAttempts) {
                    throw new Error('Image generation timeout - took too long to complete');
                }
            } while (imageData.status !== 'ready');
            if (!imageData.result?.sample) {
                throw new Error('No image data received from Flux API');
            }
            // Handle the image data (could be base64 or URL)
            let imageBuffer;
            if (imageData.result.sample.startsWith('data:image/')) {
                // Base64 encoded image
                const base64Data = imageData.result.sample.split(',')[1];
                imageBuffer = Buffer.from(base64Data, 'base64');
            }
            else if (imageData.result.sample.startsWith('http')) {
                // URL to download
                const downloadResponse = await axios.get(imageData.result.sample, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                });
                imageBuffer = Buffer.from(downloadResponse.data);
            }
            else {
                // Assume it's raw base64
                imageBuffer = Buffer.from(imageData.result.sample, 'base64');
            }
            // Save image file
            await fs.writeFile(imagePath, imageBuffer);
            const result = {
                imagePath,
                metadata: {
                    prompt: request.prompt,
                    model: request.model || 'FLUX.1-pro',
                    dimensions: {
                        width: request.width || 1024,
                        height: request.height || 1024,
                    },
                    timestamp: new Date().toISOString(),
                },
            };
            const endTime = Date.now();
            this.logger.info('Image generation completed', {
                taskId,
                duration: endTime - startTime,
                imagePath,
                fileSize: imageBuffer.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Image generation failed', {
                error: error instanceof Error ? error.message : String(error),
                prompt: request.prompt.substring(0, 100) + '...'
            });
            throw error;
        }
    }
    /**
     * Generate multiple images with different variations
     */
    async generateVariations(prompt, count = 3, options) {
        this.logger.info('Generating image variations', { prompt: prompt.substring(0, 100) + '...', count });
        const variations = Array.from({ length: count }, (_, i) => ({
            prompt: `${prompt} (variation ${i + 1})`,
            model: options?.model,
            width: options?.width,
            height: options?.height,
            outputPath: options?.outputDir ? path.join(options.outputDir, `variation_${i + 1}_${uuidv4()}.png`) : undefined,
        }));
        const results = await Promise.allSettled(variations.map(variation => this.generateImage(variation)));
        const successful = [];
        const failures = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successful.push(result.value);
            }
            else {
                failures.push({
                    variation: index + 1,
                    error: result.reason,
                });
            }
        });
        if (failures.length > 0) {
            this.logger.warn('Some image variations failed', {
                successCount: successful.length,
                failureCount: failures.length,
                failures: failures.map(f => f.error.message || f.error)
            });
        }
        this.logger.info('Image variations completed', {
            prompt: prompt.substring(0, 100) + '...',
            generated: successful.length,
            failed: failures.length,
        });
        return successful;
    }
    /**
     * Generate image with style transfer
     */
    async generateWithStyle(prompt, style, options) {
        const styledPrompt = `${prompt}, in the style of ${style}`;
        return this.generateImage({
            prompt: styledPrompt,
            model: options?.model,
            width: options?.width,
            height: options?.height,
            outputPath: options?.outputPath,
        });
    }
    /**
     * Test the Flux connection
     */
    async testConnection() {
        try {
            this.logger.info('Testing Flux connection');
            // Try to get model information or generate a simple test image
            const testResponse = await this.client.get('/models', {
                timeout: 10000,
            });
            this.logger.info('Flux connection test successful');
            return true;
        }
        catch (error) {
            // If models endpoint doesn't exist, try a simple generation test
            try {
                this.logger.debug('Models endpoint failed, trying generation test');
                // This would be a very simple test generation
                // In a real scenario, you might want to skip this in test mode
                await this.generateImage({
                    prompt: 'test',
                    width: 256,
                    height: 256,
                });
                this.logger.info('Flux connection test successful via generation');
                return true;
            }
            catch (genError) {
                this.logger.error('Flux connection test failed', {
                    error: error instanceof Error ? error.message : String(error),
                    genError: genError instanceof Error ? genError.message : String(genError)
                });
                return false;
            }
        }
    }
    /**
     * Generate image with retry logic
     */
    async generateImageWithRetry(request, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.debug(`Image generation attempt ${attempt}/${maxRetries}`);
                return await this.generateImage(request);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`Image generation attempt ${attempt} failed`, {
                    error: lastError.message,
                    remaining: maxRetries - attempt
                });
                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 2000; // Start with 4 seconds
                    this.logger.debug(`Retrying in ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    /**
     * Get available models (if endpoint exists)
     */
    async getModels() {
        try {
            this.logger.debug('Fetching available models');
            const response = await this.client.get('/models');
            return response.data.models || ['FLUX.1-pro', 'FLUX.1-dev', 'FLUX.1-schnell'];
        }
        catch (error) {
            this.logger.warn('Could not fetch models, using defaults', {
                error: error instanceof Error ? error.message : String(error)
            });
            return ['FLUX.1-pro', 'FLUX.1-dev', 'FLUX.1-schnell'];
        }
    }
    /**
     * Optimize prompt for better image generation
     */
    optimizePrompt(prompt) {
        // Add quality modifiers if not already present
        const qualityModifiers = [
            'high quality', 'detailed', 'professional', '4k', 'masterpiece',
            'realistic', 'photorealistic', 'sharp focus', 'vivid colors'
        ];
        const lowerPrompt = prompt.toLowerCase();
        const hasQualityModifier = qualityModifiers.some(modifier => lowerPrompt.includes(modifier));
        if (!hasQualityModifier) {
            return `${prompt}, high quality, detailed, professional`;
        }
        return prompt;
    }
}
//# sourceMappingURL=flux.js.map