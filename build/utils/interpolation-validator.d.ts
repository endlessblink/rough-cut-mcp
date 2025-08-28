/**
 * Interpolation Validator for Remotion
 * Prevents "inputRange must be strictly monotonically increasing" errors
 * by ensuring all interpolation ranges are valid
 */
/**
 * Validates and fixes interpolation ranges to be strictly monotonically increasing
 * Prevents Remotion errors from invalid ranges like [60, 90, 70, 90]
 * @param range Array of frame numbers
 * @returns Fixed array where each value is greater than the previous
 */
export declare function validateInterpolationRange(range: number[]): number[];
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
 * Checks if a range is valid (strictly monotonically increasing)
 */
export declare function isValidRange(range: number[]): boolean;
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