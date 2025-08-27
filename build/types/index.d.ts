export type ToolHandlers = Record<string, (args?: any) => Promise<any>>;
export interface MCPConfig {
    assetsDir: string;
    apiKeys: {
        elevenlabs?: string;
        freesound?: string;
        flux?: string;
    };
    apiEndpoints: {
        elevenlabs: string;
        flux: string;
    };
    remotion: {
        browserExecutable?: string;
        concurrency: number;
        timeout: number;
    };
    fileManagement: {
        cleanupTempFiles: boolean;
        maxAssetAgeHours: number;
    };
    logging: {
        level: string;
        file?: string;
    };
}
export interface VoiceGenerationRequest {
    text: string;
    voiceId?: string;
    modelId?: string;
    outputPath?: string;
}
export interface VoiceGenerationResult {
    audioPath: string;
    duration: number;
    metadata: {
        voiceId: string;
        modelId: string;
        textLength: number;
        timestamp: string;
    };
}
export interface SoundEffectRequest {
    query: string;
    duration?: string;
    maxResults?: number;
    outputDir?: string;
}
export interface SoundEffectResult {
    audioPath: string;
    filename: string;
    duration: number;
    metadata: {
        id: string;
        name: string;
        description: string;
        license: string;
        username: string;
        url: string;
        timestamp: string;
    };
}
export interface ImageGenerationRequest {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    outputPath?: string;
}
export interface ImageGenerationResult {
    imagePath: string;
    metadata: {
        prompt: string;
        model: string;
        dimensions: {
            width: number;
            height: number;
        };
        timestamp: string;
    };
}
export interface VideoCreationRequest {
    animationDesc: string;
    narration?: string;
    sfxDesc?: string[];
    imageDesc?: string[];
    duration?: number;
    style?: string;
    compositionCode?: string;
    fps?: number;
    dimensions?: {
        width: number;
        height: number;
    };
}
export interface VideoCreationResult {
    videoPath: string;
    duration: number;
    assets: {
        voiceTracks: VoiceGenerationResult[];
        soundEffects: SoundEffectResult[];
        images: ImageGenerationResult[];
    };
    metadata: {
        animationDesc: string;
        renderTime: number;
        fps: number;
        dimensions: {
            width: number;
            height: number;
        };
        timestamp: string;
    };
}
export interface AssetCleanupInfo {
    path: string;
    type: 'audio' | 'image' | 'video' | 'temp';
    size: number;
    lastModified: Date;
    age: number;
}
//# sourceMappingURL=index.d.ts.map