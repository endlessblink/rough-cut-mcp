/**
 * JSX Syntax Validator - Prevents JSX/CSS syntax errors that cause silent failures
 * Detects missing braces, unclosed tags, malformed styles, and common syntax issues
 */
export interface JSXValidationResult {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
    warnings: string[];
}
/**
 * Validates JSX syntax and CSS-in-JS patterns
 */
export declare function validateJSXSyntax(code: string): JSXValidationResult;
/**
 * Process JSX code to fix syntax issues
 */
export declare function processJSXSyntax(code: string): string;
/**
 * Specific validator for CSS-in-JS style objects
 */
export declare function validateCSSInJS(cssText: string): {
    isValid: boolean;
    correctedCSS?: string;
    errors: string[];
};
/**
 * Template for safe CSS-in-JS usage
 */
export declare const SAFE_CSS_TEMPLATE = "\n// \u2705 CORRECT CSS-in-JS syntax:\nstyle={{\n  position: 'absolute',\n  left: '50%',\n  top: '50%',\n  transform: 'translate(-50%, -50%)',\n  backgroundColor: '#ffffff',\n  fontSize: '24px'\n}}\n\n// \u274C INCORRECT syntax that causes errors:\nstyle={\n  position: 'absolute',  // Missing outer braces\n  left: '50%'\n}\n\nstyle=\"position: absolute; left: 50%\"  // String instead of object\nstyle={{ background-color: '#fff' }}  // kebab-case instead of camelCase\n";
//# sourceMappingURL=jsx-syntax-validator.d.ts.map