/**
 * Duplicate Export Validator - Prevents "Multiple exports with the same name" errors
 * Critical for Remotion Studio compilation - prevents ESBuild transform failures
 */
export interface DuplicateExportResult {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
    duplicates: Array<{
        name: string;
        lines: number[];
        exports: string[];
    }>;
}
/**
 * Detects and fixes duplicate exports in TypeScript/JSX code
 */
export declare function validateDuplicateExports(code: string): DuplicateExportResult;
/**
 * Process code to remove duplicate exports with smart block handling
 */
export declare function processDuplicateExports(code: string): string;
/**
 * Advanced duplicate detection for complex cases
 */
export declare function validateAdvancedDuplicates(code: string): {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
};
//# sourceMappingURL=duplicate-export-validator.d.ts.map