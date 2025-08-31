import { AnimationRequest, AnimationType } from '../services/animation-generator.js';
export interface ProfessionalAnimationTemplate {
    name: string;
    description: string;
    keywords: string[];
    difficulty: 'basic' | 'intermediate' | 'advanced';
    generateCode: (request: AnimationRequest, animationType: AnimationType) => string;
}
export declare const PROFESSIONAL_ANIMATION_TEMPLATES: ProfessionalAnimationTemplate[];
/**
 * Find best matching professional template
 * UNIVERSAL COMPATIBILITY - Works with any project name or description
 */
export declare function findProfessionalTemplate(animationType: AnimationType): ProfessionalAnimationTemplate | null;
/**
 * Generate professional animation with universal compatibility
 */
export declare function generateProfessionalAnimation(request: AnimationRequest, animationType: AnimationType): string;
export default PROFESSIONAL_ANIMATION_TEMPLATES;
//# sourceMappingURL=professional-animations.d.ts.map