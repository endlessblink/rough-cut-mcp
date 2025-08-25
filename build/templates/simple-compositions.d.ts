export interface VideoAssets {
    voiceTracks: Array<{
        audioPath: string;
        duration: number;
        metadata: any;
    }>;
    soundEffects: Array<{
        audioPath: string;
        duration: number;
        metadata: any;
    }>;
    images: Array<{
        imagePath: string;
        metadata: any;
    }>;
}
export interface CompositionRequest {
    animationDesc: string;
    assets: VideoAssets;
    style?: string;
    duration: number;
    fps: number;
    dimensions: {
        width: number;
        height: number;
    };
    compositionCode?: string;
}
/**
 * Generate composition code from Claude-provided code or basic fallback
 */
export declare function generateBasicComposition(request: CompositionRequest): Promise<string>;
/**
 * Generate index file for Remotion composition
 */
export declare function generateIndexFile(duration: number, fps: number, dimensions: {
    width: number;
    height: number;
}): string;
/**
 * Generate complete package.json with all required dependencies and scripts
 */
export declare function generateCompletePackageJson(): string;
/**
 * Generate legacy package.json (deprecated - use generateCompletePackageJson)
 */
export declare function generatePackageJson(): string;
/**
 * Generate remotion.config.ts file
 */
export declare function generateRemotionConfig(): string;
/**
 * Generate tsconfig.json for TypeScript compilation
 */
export declare function generateTsConfig(): string;
//# sourceMappingURL=simple-compositions.d.ts.map