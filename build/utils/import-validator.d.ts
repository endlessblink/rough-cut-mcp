/**
 * Import Validator - Ensures all required Remotion imports are present
 * Prevents runtime errors from missing imports and validates package usage
 */
export interface ImportValidationResult {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
    warnings: string[];
    missingImports: string[];
}
/**
 * Validates that all used functions have proper imports
 */
export declare function validateImports(code: string): ImportValidationResult;
/**
 * Process code to fix import and JSX syntax issues
 */
export declare function processImportsAndSyntax(code: string): string;
/**
 * Validate Composition component usage (Remotion 4.0 requirements)
 */
export declare function validateCompositionUsage(code: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
};
//# sourceMappingURL=import-validator.d.ts.map