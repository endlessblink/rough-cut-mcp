export interface AnimationRequest {
    animationDesc: string;
    duration: number;
    fps: number;
    dimensions: {
        width: number;
        height: number;
    };
    style?: string;
}
export interface AnimationType {
    type: 'walk-cycle' | 'bounce' | 'text-animation' | 'rotation' | 'fade' | 'slide' | 'unknown';
    confidence: number;
    keywords: string[];
    elements?: string[];
}
export interface GenerationResult {
    compositionCode: string;
    animationType: AnimationType;
    success: boolean;
    fallbackToTemplate: boolean;
}
export declare class AnimationGeneratorService {
    private logger;
    constructor();
    /**
     * Generate custom animation code based on description
     */
    generateAnimation(request: AnimationRequest): Promise<GenerationResult>;
    /**
     * Parse animation description to determine type and elements
     */
    private parseAnimationType;
    /**
     * Extract elements from description (characters, objects, etc.)
     */
    private extractElements;
    /**
     * Generate walk cycle animation code
     */
    private generateWalkCycle;
    /**
     * Generate bounce animation code
     */
    private generateBounceAnimation;
    /**
     * Generate text animation code
     */
    private generateTextAnimation;
    /**
     * Generate rotation animation code
     */
    private generateRotationAnimation;
    /**
     * Generate fade animation code
     */
    private generateFadeAnimation;
    /**
     * Generate slide animation code
     */
    private generateSlideAnimation;
}
//# sourceMappingURL=animation-generator.d.ts.map