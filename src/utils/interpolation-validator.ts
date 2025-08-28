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
export function validateInterpolationRange(range: number[]): number[] {
  if (range.length <= 1) return range;
  
  const validRange = [...range]; // Create copy to avoid mutation
  
  for (let i = 1; i < validRange.length; i++) {
    if (validRange[i] <= validRange[i-1]) {
      // Fix by making each value at least 1 frame higher than previous
      validRange[i] = validRange[i-1] + 1;
    }
  }
  
  return validRange;
}

/**
 * Validates parallel arrays (input and output ranges) ensuring they have same length
 */
export function validateRangePair(
  inputRange: number[], 
  outputRange: number[]
): { input: number[], output: number[] } {
  const validInput = validateInterpolationRange(inputRange);
  
  // Ensure output range has same length as input
  if (outputRange.length !== inputRange.length) {
    console.warn(`Output range length (${outputRange.length}) doesn't match input range length (${inputRange.length})`);
    // Truncate or extend output range to match
    const validOutput = outputRange.slice(0, inputRange.length);
    while (validOutput.length < inputRange.length) {
      validOutput.push(validOutput[validOutput.length - 1] || 0);
    }
    return { input: validInput, output: validOutput };
  }
  
  return { input: validInput, output: outputRange };
}

/**
 * Generates safe interpolation code with validation
 * This creates the actual code string for Remotion compositions
 */
export function generateSafeInterpolate(
  variable: string,
  inputRange: number[],
  outputRange: number[],
  options?: { 
    extrapolateLeft?: 'clamp' | 'extend' | 'identity'; 
    extrapolateRight?: 'clamp' | 'extend' | 'identity';
  }
): string {
  const { input, output } = validateRangePair(inputRange, outputRange);
  
  const optionsStr = options 
    ? `, { extrapolateLeft: '${options.extrapolateLeft || 'extend'}', extrapolateRight: '${options.extrapolateRight || 'extend'}' }`
    : '';
    
  return `interpolate(
    ${variable},
    [${input.join(', ')}],
    [${output.join(', ')}]${optionsStr}
  )`;
}

/**
 * Helper function to be injected into generated Remotion code
 * This allows runtime validation in the generated compositions
 */
export const VALIDATION_HELPER_CODE = `
// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}
`;

/**
 * Checks if a range is valid (strictly monotonically increasing)
 */
export function isValidRange(range: number[]): boolean {
  for (let i = 1; i < range.length; i++) {
    if (range[i] <= range[i-1]) {
      return false;
    }
  }
  return true;
}

/**
 * Common interpolation patterns with validation
 */
export const SafeInterpolationPatterns = {
  fadeIn: (frame: number, duration: number) => 
    generateSafeInterpolate('frame', [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    
  fadeOut: (frame: number, startFrame: number, endFrame: number) =>
    generateSafeInterpolate('frame', [startFrame, endFrame], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    
  slide: (frame: number, startFrame: number, endFrame: number, startPos: number, endPos: number) =>
    generateSafeInterpolate('frame', [startFrame, endFrame], [startPos, endPos], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    
  scale: (frame: number, keyframes: number[], scales: number[]) =>
    generateSafeInterpolate('frame', keyframes, scales, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
};