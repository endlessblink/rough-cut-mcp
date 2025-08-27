import { MCPConfig, ImageGenerationRequest, ImageGenerationResult } from '../types/index.js';
export declare class FluxService {
    private client;
    private config;
    private logger;
    constructor(config: MCPConfig);
    /**
     * Generate image from text prompt
     */
    generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
    /**
     * Generate multiple images with different variations
     */
    generateVariations(prompt: string, count?: number, options?: {
        model?: string;
        width?: number;
        height?: number;
        outputDir?: string;
    }): Promise<ImageGenerationResult[]>;
    /**
     * Generate image with style transfer
     */
    generateWithStyle(prompt: string, style: string, options?: {
        model?: string;
        width?: number;
        height?: number;
        outputPath?: string;
    }): Promise<ImageGenerationResult>;
    /**
     * Test the Flux connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Generate image with retry logic
     */
    generateImageWithRetry(request: ImageGenerationRequest, maxRetries?: number): Promise<ImageGenerationResult>;
    /**
     * Get available models (if endpoint exists)
     */
    getModels(): Promise<string[]>;
    /**
     * Optimize prompt for better image generation
     */
    optimizePrompt(prompt: string): string;
}
//# sourceMappingURL=flux.d.ts.map