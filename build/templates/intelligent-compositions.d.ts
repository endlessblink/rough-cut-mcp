import { AnimationRequest, AnimationType, GenerationResult } from '../services/animation-generator.js';
export interface CompositionTemplate {
    name: string;
    description: string;
    matchKeywords: string[];
    primitives: Array<{
        name: string;
        params?: any;
        required: boolean;
    }>;
    baseTemplate: string;
    customizations?: (request: AnimationRequest, animationType: AnimationType) => any;
}
export declare class IntelligentCompositionGenerator {
    private logger;
    private templates;
    constructor();
    /**
     * Generate composition using intelligent primitive combination
     */
    generateComposition(request: AnimationRequest, animationType: AnimationType): GenerationResult;
    /**
     * Initialize built-in composition templates
     */
    private initializeTemplates;
    /**
     * Find best matching template for animation type
     */
    private findBestTemplate;
    /**
     * Build composition using template and primitives
     */
    private buildComposition;
    private getCharacterWalkTemplate;
    private getBouncingObjectTemplate;
    private getRotatingElementTemplate;
    private getTextTypewriterTemplate;
    private getFadeTransitionTemplate;
    private getSlidingElementTemplate;
}
//# sourceMappingURL=intelligent-compositions.d.ts.map