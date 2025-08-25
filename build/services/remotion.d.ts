import { MCPConfig, VideoCreationRequest, VideoCreationResult, VoiceGenerationResult, SoundEffectResult, ImageGenerationResult } from '../types/index.js';
export declare class RemotionService {
    private config;
    private logger;
    constructor(config: MCPConfig);
    /**
     * Create a complete video with all assets
     */
    createVideo(request: VideoCreationRequest, assets: {
        voiceTracks: VoiceGenerationResult[];
        soundEffects: SoundEffectResult[];
        images: ImageGenerationResult[];
    }): Promise<VideoCreationResult>;
    /**
     * Create a simple text-only video
     */
    createTextVideo(text: string, duration?: number, options?: {
        fontSize?: number;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    }): Promise<string>;
    /**
     * Generate text composition code
     */
    private generateTextComposition;
    /**
     * Test Remotion functionality
     */
    testRemotionSetup(): Promise<boolean>;
    /**
     * Get estimated render time
     */
    estimateRenderTime(durationInFrames: number, fps: number): number;
    /**
     * Create a persistent Remotion project for Studio viewing
     */
    createStudioProject(request: VideoCreationRequest, assets: {
        voiceTracks: VoiceGenerationResult[];
        soundEffects: SoundEffectResult[];
        images: ImageGenerationResult[];
    }): Promise<string>;
    /**
     * Clean up old render files
     */
    cleanupOldRenders(maxAgeHours?: number): Promise<void>;
}
//# sourceMappingURL=remotion.d.ts.map