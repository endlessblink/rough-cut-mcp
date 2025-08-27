import * as t from '@babel/types';
/**
 * Template generators for common Remotion animation patterns
 * These generate code snippets dynamically - never reference specific projects
 */
export interface AnimationTemplate {
    name: string;
    description: string;
    generateCode: (params?: any) => string;
    generateAST?: (params?: any) => t.JSXElement;
}
/**
 * Generate a text element with animation
 */
export declare function generateTextElement(params: {
    text: string;
    fontSize?: number;
    color?: string;
    animation?: 'fade' | 'slide' | 'scale' | 'none';
    position?: {
        x: string | number;
        y: string | number;
    };
}): string;
/**
 * Generate a shape element (circle, square, etc.)
 */
export declare function generateShapeElement(params: {
    shape: 'circle' | 'square' | 'rectangle';
    size?: {
        width: number;
        height: number;
    };
    color?: string;
    animation?: 'rotate' | 'pulse' | 'bounce' | 'none';
}): string;
/**
 * Generate an image element with effects
 */
export declare function generateImageElement(params: {
    src: string;
    width?: number;
    height?: number;
    effect?: 'fade' | 'zoom' | 'slide' | 'none';
}): string;
/**
 * Generate a moving element along a path
 */
export declare function generateMovingElement(params: {
    elementType: 'div' | 'img';
    path: 'linear' | 'circular' | 'sine';
    speed?: number;
    content?: string;
}): string;
/**
 * Generate particle system background
 */
export declare function generateParticleSystem(params: {
    count?: number;
    color?: string;
    size?: number;
    speed?: number;
}): string;
/**
 * Generate a sequence of elements with staggered animation
 */
export declare function generateStaggeredElements(params: {
    count?: number;
    elementCode: string;
    staggerDelay?: number;
    arrangement?: 'horizontal' | 'vertical' | 'grid';
}): string;
/**
 * Generate transition effects between scenes
 */
export declare function generateTransition(params: {
    type: 'fade' | 'wipe' | 'slide' | 'zoom';
    duration?: number;
    startFrame?: number;
}): string;
/**
 * Collection of ready-to-use animation templates
 */
export declare const animationTemplates: AnimationTemplate[];
/**
 * Get a template by name
 */
export declare function getTemplate(name: string): AnimationTemplate | undefined;
/**
 * Generate code from a template
 */
export declare function generateFromTemplate(templateName: string, params?: any): string;
/**
 * Analyze composition code to detect scene patterns and structure
 */
export interface SceneAnalysis {
    hasMultipleScenes: boolean;
    sceneCount: number;
    usesSeries: boolean;
    usesConditionalRendering: boolean;
    detectedScenes: SceneInfo[];
    needsTransformation: boolean;
    recommendedStructure: 'single' | 'series' | 'sequence';
}
export interface SceneInfo {
    name: string;
    startFrame?: number;
    endFrame?: number;
    duration?: number;
    condition?: string;
    content: string;
}
/**
 * Analyze provided composition code structure
 */
export declare function analyzeCompositionStructure(code: string): SceneAnalysis;
/**
 * Transform conditional rendering to Series-based structure
 */
export declare function transformToSeriesStructure(code: string, analysis: SceneAnalysis): string;
/**
 * Generate a complete Series-based composition template
 */
export declare function generateSeriesComposition(params: {
    scenes: Array<{
        name: string;
        duration: number;
        content: string;
    }>;
    totalDuration: number;
    fps: number;
}): string;
//# sourceMappingURL=composition-templates.d.ts.map