"use strict";
/**
 * Easing Function Validator - Prevents invalid easing function usage
 * Ensures all Easing function names are correct according to Remotion 4.0 API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAFE_EASING_EXAMPLES = void 0;
exports.validateEasing = validateEasing;
exports.processEasingInCode = processEasingInCode;
/**
 * Valid Easing function names from Remotion documentation
 */
const VALID_EASING_FUNCTIONS = new Set([
    'step0',
    'step1',
    'linear',
    'ease',
    'quad',
    'cubic',
    'sin', // NOT 'sine'
    'circle',
    'exp',
    'bounce',
    'poly', // function call: poly(n)
    'elastic', // function call: elastic(n)
    'back', // function call: back(n)
    'bezier', // function call: bezier(x1, y1, x2, y2)
    'in', // modifier: in(easing)
    'out', // modifier: out(easing)
    'inOut' // modifier: inOut(easing)
]);
/**
 * Common incorrect easing function names and their corrections
 */
const EASING_CORRECTIONS = new Map([
    ['sine', 'sin'],
    ['cosine', 'sin'],
    ['cos', 'sin'],
    ['quadratic', 'quad'],
    ['cubic-bezier', 'bezier'],
    ['ease-in', 'in'],
    ['ease-out', 'out'],
    ['ease-in-out', 'inOut'],
    ['easeIn', 'in'],
    ['easeOut', 'out'],
    ['easeInOut', 'inOut']
]);
/**
 * Validates and fixes easing function usage in React component code
 */
function validateEasing(code) {
    const errors = [];
    let correctedCode = code;
    let hasChanges = false;
    // Find all Easing.functionName patterns
    const easingRegex = /Easing\.(\w+)/g;
    let match;
    while ((match = easingRegex.exec(code)) !== null) {
        const functionName = match[1];
        if (!VALID_EASING_FUNCTIONS.has(functionName)) {
            // Check if we have a correction
            if (EASING_CORRECTIONS.has(functionName)) {
                const correction = EASING_CORRECTIONS.get(functionName);
                correctedCode = correctedCode.replace(`Easing.${functionName}`, `Easing.${correction}`);
                errors.push(`Fixed: Easing.${functionName} → Easing.${correction}`);
                hasChanges = true;
            }
            else {
                errors.push(`Invalid easing function: Easing.${functionName}. Use one of: ${Array.from(VALID_EASING_FUNCTIONS).join(', ')}`);
            }
        }
    }
    // Find Easing function calls that need parameters
    const functionCallRegex = /Easing\.(poly|elastic|back|bezier)\s*\(/g;
    const standaloneCallRegex = /Easing\.(poly|elastic|back|bezier)(?!\s*\()/g;
    let functionMatch;
    while ((functionMatch = standaloneCallRegex.exec(code)) !== null) {
        const functionName = functionMatch[1];
        errors.push(`${functionName} requires parameters: Easing.${functionName}(...)`);
    }
    return {
        isValid: errors.length === 0,
        correctedCode: hasChanges ? correctedCode : undefined,
        errors
    };
}
/**
 * Process video code to fix easing function errors
 */
function processEasingInCode(code) {
    const validation = validateEasing(code);
    if (validation.correctedCode) {
        return validation.correctedCode;
    }
    return code;
}
/**
 * Template for safe easing usage examples
 */
exports.SAFE_EASING_EXAMPLES = `
// ✅ CORRECT Easing usage examples:
easing: Easing.sin              // Sinusoidal easing
easing: Easing.quad             // Quadratic easing  
easing: Easing.cubic            // Cubic easing
easing: Easing.inOut(Easing.sin) // Combined easing
easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) // Bezier curve

// ❌ INCORRECT usage (will cause errors):
easing: Easing.sine             // Should be Easing.sin
easing: Easing.quadratic        // Should be Easing.quad
easing: Easing.easeInOut        // Should be Easing.inOut
easing: Easing.poly             // Should be Easing.poly(n)
`;
//# sourceMappingURL=easing-validator.js.map