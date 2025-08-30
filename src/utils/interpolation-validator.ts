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
export function detectColorValues(values: any[]): ColorInterpolationError {
  const colorValues: string[] = [];
  let hasColorValues = false;
  
  for (const value of values) {
    if (typeof value === 'string') {
      // Detect hex colors
      if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
        colorValues.push(value);
        hasColorValues = true;
      }
      // Detect rgb/rgba colors
      else if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(value)) {
        colorValues.push(value);
        hasColorValues = true;
      }
      // Detect common CSS color names
      else if (/^(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|brown|cyan|magenta)$/i.test(value)) {
        colorValues.push(value);
        hasColorValues = true;
      }
    }
  }
  
  const suggestion = hasColorValues 
    ? `Use interpolateColors() instead of interpolate() for color values: [${colorValues.join(', ')}]`
    : '';
    
  return { hasColorValues, colorValues, suggestion };
}

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
export function validateInterpolationRange(range: number[]): ValidationResult {
  if (range.length <= 1) {
    return {
      valid: true,
      original: [...range],
      corrected: [...range],
      changes: false
    };
  }

  const original = [...range];
  const corrected = [...range];
  let changes = false;

  // Sort first to get a reasonable starting point
  const sorted = [...range].sort((a, b) => a - b);
  
  // If completely out of order, use sorted version as base
  if (!isMonotonicallyIncreasing(range)) {
    corrected.splice(0, corrected.length, ...sorted);
    changes = true;
  }

  // Ensure strict monotonic increasing (no duplicates)
  for (let i = 1; i < corrected.length; i++) {
    if (corrected[i] <= corrected[i - 1]) {
      corrected[i] = corrected[i - 1] + 1;
      changes = true;
    }
  }

  return {
    valid: !changes,
    original,
    corrected,
    changes
  };
}

/**
 * Checks if array is monotonically increasing
 */
function isMonotonicallyIncreasing(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= arr[i - 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateInterpolationRange instead
 */
export function validateInterpolationRangeLegacy(range: number[]): number[] {
  const result = validateInterpolationRange(range);
  return result.corrected;
}

/**
 * Validates parallel arrays (input and output ranges) ensuring they have same length
 */
export function validateRangePair(
  inputRange: number[], 
  outputRange: number[]
): { input: number[], output: number[] } {
  const validInputResult = validateInterpolationRange(inputRange);
  const validInput = validInputResult.corrected;
  
  // Ensure output range has same length as input
  if (outputRange.length !== validInput.length) {
    // Output range length doesn't match input range length, truncate or extend
    const validOutput = outputRange.slice(0, validInput.length);
    while (validOutput.length < validInput.length) {
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
 * Fixes color interpolation by replacing interpolate() with interpolateColors()
 * This is the CRITICAL function that prevents "outputRange must contain only numbers" errors
 */
export function fixColorInterpolation(code: string): string {
  // Add interpolateColors import if not present
  let processedCode = code;
  
  if (!processedCode.includes('interpolateColors')) {
    // Add interpolateColors to existing import
    processedCode = processedCode.replace(
      /import\s*\{\s*([^}]*?)\s*\}\s*from\s*['"]remotion['"];/,
      (match, imports) => {
        if (!imports.includes('interpolateColors')) {
          const cleanImports = imports.trim();
          const newImports = cleanImports 
            ? `${cleanImports}, interpolateColors`
            : 'interpolateColors';
          return match.replace(imports, newImports);
        }
        return match;
      }
    );
  }
  
  // Find interpolate() calls with color values and replace with interpolateColors()
  const interpolateRegex = /interpolate\s*\(\s*([^,]+),\s*\[([^\]]+)\],\s*\[([^\]]+)\]([^)]*)\)/g;
  
  processedCode = processedCode.replace(interpolateRegex, (match, frame, inputRange, outputRange, options) => {
    // Parse output range to check for colors
    try {
      const outputValues = outputRange
        .split(',')
        .map(s => s.trim().replace(/['"]/g, ''));
      
      const colorCheck = detectColorValues(outputValues);
      
      if (colorCheck.hasColorValues) {
        // Replace with interpolateColors
        const quotedOutputRange = outputValues.map(val => 
          colorCheck.colorValues.includes(val) ? `'${val}'` : val
        ).join(', ');
        
        return `interpolateColors(${frame.trim()}, [${inputRange}], [${quotedOutputRange}]${options.trim()})`;
      }
    } catch (error) {
      // If parsing fails, leave unchanged
    }
    
    return match;
  });
  
  return processedCode;
}

/**
 * Processes React component code to fix all interpolation ranges
 * @param code - React component code string
 * @returns Processed code with validated interpolation ranges and color interpolation fixes
 */
export function processVideoCode(code: string): string {
  // CRITICAL: Check for color interpolation errors first
  let processedCode = fixColorInterpolation(code);
  
  // Then fix numeric interpolation ranges
  const interpolateRegex = /interpolate\s*\(\s*([^,]+),\s*\[([^\]]+)\],\s*\[([^\]]+)\]([^)]*)\)/g;
  
  let hasChanges = false;
  const changes: string[] = [];
  
  processedCode = processedCode.replace(interpolateRegex, (match, frame, inputStr, outputStr, options) => {
    try {
      // Parse the input range
      const inputRange = inputStr.split(',').map((s: string) => parseFloat(s.trim())).filter((n: number) => !isNaN(n));
      const outputRange = outputStr.split(',').map((s: string) => parseFloat(s.trim()));
      
      if (inputRange.length === 0) {
        return match; // Keep original if parsing fails
      }

      // Validate and fix the range
      const validation = validateInterpolationRange(inputRange);
      
      if (validation.changes) {
        hasChanges = true;
        changes.push(`[${validation.original.join(', ')}] → [${validation.corrected.join(', ')}]`);
        
        // Return corrected interpolate call
        return `interpolate(${frame.trim()}, [${validation.corrected.join(', ')}], [${outputRange.join(', ')}]${options.trim()})`;
      }
      
      return match; // No changes needed
      
    } catch (error) {
      // If parsing fails, return original
      return match;
    }
  });
  
  // Log changes if any were made
  if (hasChanges && typeof console !== 'undefined') {
    // Fixed interpolation ranges
  }
  
  return processedCode;
}

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
 * Safe interpolate wrapper function code for injection into components
 */
export const SAFE_INTERPOLATE_HELPER = `
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
 * Test cases for interpolation validation
 */
export const TEST_CASES = [
  // Valid cases (should not change)
  { input: [0, 30, 60, 90], expected: [0, 30, 60, 90], description: 'Already valid range' },
  { input: [10, 20, 30], expected: [10, 20, 30], description: 'Simple valid range' },
  
  // Invalid cases (should be corrected)
  { input: [60, 90, 70, 100], expected: [60, 70, 90, 100], description: 'Out of order range' },
  { input: [10, 5, 15, 20], expected: [5, 10, 15, 20], description: 'Completely scrambled' },
  { input: [0, 30, 30, 60], expected: [0, 30, 31, 60], description: 'Duplicate values' },
  { input: [100, 50, 75], expected: [50, 75, 100], description: 'Reverse order' },
  { input: [0, 0, 0], expected: [0, 1, 2], description: 'All same values' },
  { input: [5, 3, 8, 3, 10], expected: [3, 4, 5, 8, 10], description: 'Multiple duplicates' },
  
  // Edge cases
  { input: [], expected: [], description: 'Empty array' },
  { input: [42], expected: [42], description: 'Single value' },
  { input: [1, 2], expected: [1, 2], description: 'Two values valid' },
  { input: [2, 1], expected: [1, 2], description: 'Two values invalid' }
];

/**
 * Run all test cases
 */
export function runValidationTests(): { passed: number; failed: number; results: any[] } {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  TEST_CASES.forEach((testCase, index) => {
    const result = validateInterpolationRange(testCase.input);
    const success = JSON.stringify(result.corrected) === JSON.stringify(testCase.expected);
    
    results.push({
      index: index + 1,
      description: testCase.description,
      input: testCase.input,
      expected: testCase.expected,
      actual: result.corrected,
      success,
      changes: result.changes
    });
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
  });

  return { passed, failed, results };
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