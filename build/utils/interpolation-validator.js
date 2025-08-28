"use strict";
/**
 * Interpolation Validator for Remotion
 * Prevents "inputRange must be strictly monotonically increasing" errors
 * by ensuring all interpolation ranges are valid
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeInterpolationPatterns = exports.VALIDATION_HELPER_CODE = void 0;
exports.validateInterpolationRange = validateInterpolationRange;
exports.validateRangePair = validateRangePair;
exports.generateSafeInterpolate = generateSafeInterpolate;
exports.isValidRange = isValidRange;
/**
 * Validates and fixes interpolation ranges to be strictly monotonically increasing
 * Prevents Remotion errors from invalid ranges like [60, 90, 70, 90]
 * @param range Array of frame numbers
 * @returns Fixed array where each value is greater than the previous
 */
function validateInterpolationRange(range) {
    if (range.length <= 1)
        return range;
    const validRange = [...range]; // Create copy to avoid mutation
    for (let i = 1; i < validRange.length; i++) {
        if (validRange[i] <= validRange[i - 1]) {
            // Fix by making each value at least 1 frame higher than previous
            validRange[i] = validRange[i - 1] + 1;
        }
    }
    return validRange;
}
/**
 * Validates parallel arrays (input and output ranges) ensuring they have same length
 */
function validateRangePair(inputRange, outputRange) {
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
function generateSafeInterpolate(variable, inputRange, outputRange, options) {
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
exports.VALIDATION_HELPER_CODE = `
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
function isValidRange(range) {
    for (let i = 1; i < range.length; i++) {
        if (range[i] <= range[i - 1]) {
            return false;
        }
    }
    return true;
}
/**
 * Common interpolation patterns with validation
 */
exports.SafeInterpolationPatterns = {
    fadeIn: (frame, duration) => generateSafeInterpolate('frame', [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    fadeOut: (frame, startFrame, endFrame) => generateSafeInterpolate('frame', [startFrame, endFrame], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    slide: (frame, startFrame, endFrame, startPos, endPos) => generateSafeInterpolate('frame', [startFrame, endFrame], [startPos, endPos], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    scale: (frame, keyframes, scales) => generateSafeInterpolate('frame', keyframes, scales, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
};
//# sourceMappingURL=interpolation-validator.js.map