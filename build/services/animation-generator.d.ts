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
    type: 'walk-cycle' | 'bounce' | 'text-animation' | 'rotation' | 'fade' | 'slide' | 'airplane' | 'unknown';
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
    private intelligentGenerator;
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
    /**
     * CRITICAL SAFEGUARD: Generate a minimal working animation that NEVER fails
     * This ensures no animation request ever results in empty code
     * DO NOT REMOVE OR DISABLE - This prevents the "undefined component" error
     */
    private generateMinimalWorkingAnimation;
}
//# sourceMappingURL=animation-generator.d.ts.map