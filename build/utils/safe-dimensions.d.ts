/**
 * Safe Dimensions Utility
 * Ensures video dimensions are always valid numbers for interpolation
 * Prevents "outputRange must contain only numbers" errors
 */
export interface SafeDimensions {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
}
/**
 * Get safe video dimensions with guaranteed numeric values
 * Falls back to HD defaults if values are undefined or invalid
 */
export declare function getSafeDimensions(config: {
    width?: number | undefined;
    height?: number | undefined;
    fps?: number | undefined;
    durationInFrames?: number | undefined;
}): SafeDimensions;
/**
 * Create a safe interpolation wrapper that validates all inputs
 */
export declare function safeInterpolate(input: number, inputRange: number[], outputRange: number[], options?: any): number;
/**
 * Template for safe video composition boilerplate
 */
export declare const SAFE_COMPOSITION_TEMPLATE = "\n// Safe dimensions helper - prevents undefined width/height errors\nconst getSafeDimensions = (config) => ({\n  width: config.width || 1920,\n  height: config.height || 1080,\n  fps: config.fps || 30,\n  durationInFrames: config.durationInFrames || 240\n});\n\n// Safe interpolation helper - ensures all values are numbers\nconst safeInterpolate = (input, inputRange, outputRange, options) => {\n  const safeInput = typeof input === 'number' && !isNaN(input) ? input : 0;\n  const safeInputRange = inputRange.map(v => typeof v === 'number' && !isNaN(v) ? v : 0);\n  const safeOutputRange = outputRange.map(v => typeof v === 'number' && !isNaN(v) ? v : 0);\n  \n  try {\n    return interpolate(safeInput, safeInputRange, safeOutputRange, options);\n  } catch (e) {\n    return safeOutputRange[0] || 0;\n  }\n};\n";
//# sourceMappingURL=safe-dimensions.d.ts.map