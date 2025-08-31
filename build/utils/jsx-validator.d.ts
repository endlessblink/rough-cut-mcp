export interface JSXValidationResult {
    isValid: boolean;
    sanitizedJSX: string;
    originalJSX: string;
    issues: string[];
    wasModified: boolean;
}
export declare class JSXValidator {
    /**
     * Validates and sanitizes JSX content for safe file writing
     */
    static validateAndSanitize(jsxContent: string): JSXValidationResult;
    /**
     * Performs basic JSX syntax validation
     */
    private static performBasicJSXValidation;
    /**
     * Creates a backup of original JSX before modification
     */
    static createBackup(jsx: string, projectName: string): string;
    /**
     * Formats validation result for logging/debugging
     */
    static formatValidationReport(result: JSXValidationResult): string;
}
export declare function validateJSX(jsx: string): JSXValidationResult;
//# sourceMappingURL=jsx-validator.d.ts.map