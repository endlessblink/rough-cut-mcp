/**
 * Easing Function Validator - Prevents invalid easing function usage
 * Ensures all Easing function names are correct according to Remotion 4.0 API
 */
export interface EasingValidationResult {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
}
/**
 * Validates and fixes easing function usage in React component code
 */
export declare function validateEasing(code: string): EasingValidationResult;
/**
 * Process video code to fix easing function errors
 */
export declare function processEasingInCode(code: string): string;
/**
 * Template for safe easing usage examples
 */
export declare const SAFE_EASING_EXAMPLES = "\n// \u2705 CORRECT Easing usage examples:\neasing: Easing.sin              // Sinusoidal easing\neasing: Easing.quad             // Quadratic easing  \neasing: Easing.cubic            // Cubic easing\neasing: Easing.inOut(Easing.sin) // Combined easing\neasing: Easing.bezier(0.25, 0.46, 0.45, 0.94) // Bezier curve\n\n// \u274C INCORRECT usage (will cause errors):\neasing: Easing.sine             // Should be Easing.sin\neasing: Easing.quadratic        // Should be Easing.quad\neasing: Easing.easeInOut        // Should be Easing.inOut\neasing: Easing.poly             // Should be Easing.poly(n)\n";
//# sourceMappingURL=easing-validator.d.ts.map