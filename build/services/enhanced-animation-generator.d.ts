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
    type: 'logo-reveal' | 'data-visualization' | 'text-reveal' | 'particle-system' | 'walk-cycle' | 'bounce' | 'text-animation' | 'rotation' | 'fade' | 'slide' | 'product-showcase' | 'explainer-graphic' | 'social-media' | 'corporate-intro' | 'ai-generated' | 'unknown';
    confidence: number;
    keywords: string[];
    elements?: string[];
    professionalLevel?: 'basic' | 'intermediate' | 'advanced';
}
export interface GenerationResult {
    compositionCode: string;
    animationType: AnimationType;
    success: boolean;
    fallbackToTemplate: boolean;
    qualityScore?: number;
    professionalFeatures?: string[];
}
export declare class EnhancedAnimationGenerator {
    constructor();
    /**
     * MAIN GENERATION METHOD - Enhanced with professional templates
     * UNIVERSAL COMPATIBILITY - Works for any content, any user
     */
    generateAnimation(request: AnimationRequest): Promise<GenerationResult>;
    /**
     * ENHANCED ANIMATION TYPE DETECTION
     * Detects more animation types with better accuracy
     */
    private parseAnimationTypeEnhanced;
    /**
     * ENHANCED FALLBACK GENERATION
     * Multiple fallback layers for better quality
     */
    private generateWithEnhancedFallbacks;
    /**
     * NEW: AI-GUIDED ANIMATION GENERATION
     * Uses system prompts to guide better generation
     */
    private generateAIGuidedAnimation;
    /**
     * LEGACY ANIMATION SUPPORT
     * Preserves existing functionality while enhancing quality
     */
    private generateLegacyAnimation;
    /**
     * ENHANCED BOUNCE ANIMATION
     * Upgraded version of the original with professional styling
     */
    private generateEnhancedBounce;
    /**
     * Generate other enhanced animations...
     */
    private generateEnhancedRotation;
    private generateEnhancedFade;
    /**
     * UNIVERSAL TEXT ANIMATION
     * Always works, professional quality
     */
    private generateUniversalTextAnimation;
    /**
     * PROFESSIONAL STYLING ENHANCEMENT
     * Adds professional design elements to any animation
     */
    private enhanceWithProfessionalStyling;
    /**
     * UNIVERSAL SAFEGUARD ANIMATION
     * NEVER FAILS - Always generates working code
     */
    private generateUniversalSafeguardAnimation;
    /**
     * QUALITY ASSESSMENT
     * Calculate quality score for generated animations
     */
    private calculateQualityScore;
    /**
     * IDENTIFY PROFESSIONAL FEATURES
     * List professional features used in animation
     */
    private identifyProfessionalFeatures;
}
export default EnhancedAnimationGenerator;
//# sourceMappingURL=enhanced-animation-generator.d.ts.map