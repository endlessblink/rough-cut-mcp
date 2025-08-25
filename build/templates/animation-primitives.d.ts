export interface AnimationPrimitive {
    name: string;
    description: string;
    generateCode: (params: any) => string;
    requiredParams: string[];
    defaultParams?: Record<string, any>;
}
export interface CharacterFrame {
    head: string;
    leftArm: string;
    rightArm: string;
    body: string;
    leftLeg: string;
    rightLeg: string;
}
export interface BounceParams {
    objectSize: number;
    groundLevel: number;
    bounceCount: number;
    dampening: number;
}
export interface RotationParams {
    rotations: number;
    direction: 'clockwise' | 'counterclockwise';
    objectSize: number;
}
/**
 * Character Walk Cycle Primitive
 */
export declare const walkCyclePrimitive: AnimationPrimitive;
/**
 * Physics Bounce Primitive
 */
export declare const physicsBounce: AnimationPrimitive;
/**
 * Smooth Rotation Primitive
 */
export declare const smoothRotation: AnimationPrimitive;
/**
 * Typewriter Text Primitive
 */
export declare const typewriterText: AnimationPrimitive;
/**
 * Fade Transition Primitive
 */
export declare const fadeTransition: AnimationPrimitive;
/**
 * Scale Animation Primitive
 */
export declare const scaleAnimation: AnimationPrimitive;
/**
 * Path Following Primitive
 */
export declare const pathFollowing: AnimationPrimitive;
/**
 * Get all available animation primitives
 */
export declare function getAllPrimitives(): AnimationPrimitive[];
/**
 * Get primitive by name
 */
export declare function getPrimitive(name: string): AnimationPrimitive | null;
/**
 * Combine multiple primitives into a single code block
 */
export declare function combinePrimitives(primitives: Array<{
    name: string;
    params: any;
}>, baseParams: any): string;
//# sourceMappingURL=animation-primitives.d.ts.map