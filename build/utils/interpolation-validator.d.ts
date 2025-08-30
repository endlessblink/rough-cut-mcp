/**
 * Interpolation Range Validator - Prevents Remotion crashes
 * Ensures all interpolation ranges are strictly monotonically increasing
 * Detects and fixes color interpolation errors (use interpolateColors instead)
 */
export interface ColorInterpolationError {
    hasColorValues: boolean;
    colorValues: string[];
    suggestion: string;
}
/**
 * Detects if an array contains color values (hex, rgb, named colors)
 */
export declare function detectColorValues(values: any[]): ColorInterpolationError;
export interface ValidationResult {
    valid: boolean;
    original: number[];
    corrected: number[];
    changes: boolean;
}
/**
 * Validates and corrects interpolation ranges to be monotonically increasing
 * @param range - Array of numbers that should be monotonically increasing
 * @returns ValidationResult with corrected range
 */
export declare function validateInterpolationRange(range: number[]): ValidationResult;
/**
 * Legacy function for backward compatibility
 * @deprecated Use validateInterpolationRange instead
 */
export declare function validateInterpolationRangeLegacy(range: number[]): number[];
/**
 * Validates parallel arrays (input and output ranges) ensuring they have same length
 */
export declare function validateRangePair(inputRange: number[], outputRange: number[]): {
    input: number[];
    output: number[];
};
/**
 * Generates safe interpolation code with validation
 * This creates the actual code string for Remotion compositions
 */
export declare function generateSafeInterpolate(variable: string, inputRange: number[], outputRange: number[], options?: {
    extrapolateLeft?: 'clamp' | 'extend' | 'identity';
    extrapolateRight?: 'clamp' | 'extend' | 'identity';
}): string;
/**
 * Helper function to be injected into generated Remotion code
 * This allows runtime validation in the generated compositions
 */
export declare const VALIDATION_HELPER_CODE = "\n// Helper to ensure interpolation ranges are valid (prevents Remotion errors)\nfunction validateRange(range) {\n  if (range.length <= 1) return range;\n  const valid = [...range];\n  for (let i = 1; i < valid.length; i++) {\n    if (valid[i] <= valid[i-1]) {\n      valid[i] = valid[i-1] + 1;\n    }\n  }\n  return valid;\n}\n\n// Safe interpolate wrapper\nfunction safeInterpolate(frame, inputRange, outputRange, options) {\n  const validInput = validateRange(inputRange);\n  return interpolate(frame, validInput, outputRange, options);\n}\n";
/**
 * Fixes color interpolation by replacing interpolate() with interpolateColors()
 * This is the CRITICAL function that prevents "outputRange must contain only numbers" errors
 */
export declare function fixColorInterpolation(code: string): string;
/**
 * Processes React component code to fix all interpolation ranges
 * @param code - React component code string
 * @returns Processed code with validated interpolation ranges and color interpolation fixes
 */
export declare function processVideoCode(code: string): string;
/**
 * Checks if a range is valid (strictly monotonically increasing)
 */
export declare function isValidRange(range: number[]): boolean;
/**
 * Safe interpolate wrapper function code for injection into components
 */
export declare const SAFE_INTERPOLATE_HELPER = "\n// Helper to ensure interpolation ranges are valid (prevents Remotion errors)\nfunction validateRange(range) {\n  if (range.length <= 1) return range;\n  const valid = [...range];\n  for (let i = 1; i < valid.length; i++) {\n    if (valid[i] <= valid[i-1]) {\n      valid[i] = valid[i-1] + 1;\n    }\n  }\n  return valid;\n}\n\n// Safe interpolate wrapper\nfunction safeInterpolate(frame, inputRange, outputRange, options) {\n  const validInput = validateRange(inputRange);\n  return interpolate(frame, validInput, outputRange, options);\n}\n";
/**
 * Test cases for interpolation validation
 */
export declare const TEST_CASES: {
    input: number[];
    expected: number[];
    description: string;
}[];
/**
 * Run all test cases
 */
export declare function runValidationTests(): {
    passed: number;
    failed: number;
    results: any[];
};
/**
 * Common interpolation patterns with validation
 */
export declare const SafeInterpolationPatterns: {
    fadeIn: (frame: number, duration: number) => string;
    fadeOut: (frame: number, startFrame: number, endFrame: number) => string;
    slide: (frame: number, startFrame: number, endFrame: number, startPos: number, endPos: number) => string;
    scale: (frame: number, keyframes: number[], scales: number[]) => string;
};
//# sourceMappingURL=interpolation-validator.d.ts.map