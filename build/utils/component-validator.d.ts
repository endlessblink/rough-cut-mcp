/**
 * Component Structure Validator - Prevents structural errors in Remotion compositions
 * Ensures all generated components have proper structure, imports, and exports
 */
export interface ComponentValidationResult {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
    warnings: string[];
}
/**
 * Validates the complete structure of a Remotion component
 */
export declare function validateComponentStructure(code: string): ComponentValidationResult;
/**
 * Process video code to fix component structure issues
 */
export declare function processComponentStructure(code: string): string;
/**
 * Generate safe index.ts content for any project
 */
export declare function generateSafeIndexTs(): string;
/**
 * Generate safe Root.tsx content for any project
 */
export declare function generateSafeRootTsx(options?: {
    compositionId?: string;
    fps?: number;
    durationInFrames?: number;
    width?: number;
    height?: number;
}): string;
/**
 * Validate that all required files exist for a Remotion project
 */
export declare function validateProjectStructure(projectPath: string): {
    valid: boolean;
    missingFiles: string[];
    requiredFiles: string[];
};
//# sourceMappingURL=component-validator.d.ts.map