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
export function getSafeDimensions(config: {
  width?: number | undefined;
  height?: number | undefined;
  fps?: number | undefined;
  durationInFrames?: number | undefined;
}): SafeDimensions {
  // Default to 1080p HD resolution if not specified
  const width = (typeof config.width === 'number' && !isNaN(config.width)) 
    ? config.width 
    : 1920;
    
  const height = (typeof config.height === 'number' && !isNaN(config.height)) 
    ? config.height 
    : 1080;
    
  const fps = (typeof config.fps === 'number' && !isNaN(config.fps) && config.fps > 0) 
    ? config.fps 
    : 30;
    
  const durationInFrames = (typeof config.durationInFrames === 'number' && !isNaN(config.durationInFrames) && config.durationInFrames > 0) 
    ? config.durationInFrames 
    : 240; // 8 seconds at 30fps
    
  return { width, height, fps, durationInFrames };
}

/**
 * Create a safe interpolation wrapper that validates all inputs
 */
export function safeInterpolate(
  input: number,
  inputRange: number[],
  outputRange: number[],
  options?: any
): number {
  // Ensure all values in ranges are valid numbers
  const safeInputRange = inputRange.map(v => 
    (typeof v === 'number' && !isNaN(v)) ? v : 0
  );
  
  const safeOutputRange = outputRange.map(v => 
    (typeof v === 'number' && !isNaN(v)) ? v : 0
  );
  
  // Ensure input is a valid number
  const safeInput = (typeof input === 'number' && !isNaN(input)) ? input : 0;
  
  // Import interpolate dynamically to avoid circular dependencies
  const { interpolate } = require('remotion');
  
  try {
    return interpolate(safeInput, safeInputRange, safeOutputRange, options);
  } catch (error) {
    // Return the first output value as fallback (no console output for MCP)
    return safeOutputRange[0] || 0;
  }
}

/**
 * Template for safe video composition boilerplate
 */
export const SAFE_COMPOSITION_TEMPLATE = `
// Safe dimensions helper - prevents undefined width/height errors
const getSafeDimensions = (config) => ({
  width: config.width || 1920,
  height: config.height || 1080,
  fps: config.fps || 30,
  durationInFrames: config.durationInFrames || 240
});

// Safe interpolation helper - ensures all values are numbers
const safeInterpolate = (input, inputRange, outputRange, options) => {
  const safeInput = typeof input === 'number' && !isNaN(input) ? input : 0;
  const safeInputRange = inputRange.map(v => typeof v === 'number' && !isNaN(v) ? v : 0);
  const safeOutputRange = outputRange.map(v => typeof v === 'number' && !isNaN(v) ? v : 0);
  
  try {
    return interpolate(safeInput, safeInputRange, safeOutputRange, options);
  } catch (e) {
    return safeOutputRange[0] || 0;
  }
};
`;