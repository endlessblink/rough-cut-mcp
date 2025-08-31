"use strict";
// JSX Validation and Sanitization Utility
// Fixes JSX syntax errors before writing to VideoComposition.tsx files
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSXValidator = void 0;
exports.validateJSX = validateJSX;
class JSXValidator {
    /**
     * Validates and sanitizes JSX content for safe file writing
     */
    static validateAndSanitize(jsxContent) {
        const issues = [];
        let sanitizedJSX = jsxContent;
        const originalJSX = jsxContent;
        let wasModified = false;
        try {
            // 1. Fix backslash escaping in JSX (PRIMARY FIX for the reported issue)
            // The issue is backslashes in JSX text content, not string literals
            // First, handle backslashes in quoted string literals
            sanitizedJSX = sanitizedJSX.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
                if (content.includes('\\')) {
                    let fixedContent = content.replace(/\\(?!\\)/g, '\\\\');
                    if (fixedContent !== content) {
                        issues.push(`Fixed unescaped backslashes in quoted string: ${quote}${content}${quote}`);
                        wasModified = true;
                    }
                    return quote + fixedContent + quote;
                }
                return match;
            });
            // Second, handle backslashes in JSX text content (the main issue)
            // Find JSX elements and fix backslashes in their text content
            sanitizedJSX = sanitizedJSX.replace(/>([^<]+)</g, (match, textContent) => {
                if (textContent.includes('\\') && !textContent.includes('\\\\')) {
                    // Only fix if it contains single backslashes (not already escaped)
                    let fixedText = textContent.replace(/\\(?!\\)/g, '\\\\');
                    if (fixedText !== textContent) {
                        issues.push(`Fixed unescaped backslashes in JSX text: "${textContent.trim()}"`);
                        wasModified = true;
                    }
                    return '>' + fixedText + '<';
                }
                return match;
            });
            // 2. Fix common JSX string issues
            // Escape unescaped quotes within strings
            sanitizedJSX = sanitizedJSX.replace(/(['"])([^'"]*?)(?<!\\)\1([^'"`]*?)\1/g, (match, quote, content, after) => {
                if (content.includes(quote)) {
                    const escaped = content.replace(new RegExp(quote, 'g'), `\\${quote}`);
                    issues.push(`Escaped quotes in string: ${quote}${content}${quote}`);
                    wasModified = true;
                    return `${quote}${escaped}${after}${quote}`;
                }
                return match;
            });
            // 3. Basic JSX syntax validation
            const basicValidation = this.performBasicJSXValidation(sanitizedJSX);
            if (!basicValidation.isValid) {
                issues.push(...basicValidation.errors);
            }
            return {
                isValid: basicValidation.isValid,
                sanitizedJSX,
                originalJSX,
                issues,
                wasModified
            };
        }
        catch (error) {
            issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
            return {
                isValid: false,
                sanitizedJSX: originalJSX, // Return original on validation failure
                originalJSX,
                issues,
                wasModified: false
            };
        }
    }
    /**
     * Performs basic JSX syntax validation
     */
    static performBasicJSXValidation(jsx) {
        const errors = [];
        try {
            // Check for basic JSX structure
            if (!jsx.includes('<') || !jsx.includes('>')) {
                errors.push('No JSX elements found');
            }
            // Check for unmatched brackets
            const openBrackets = (jsx.match(/</g) || []).length;
            const closeBrackets = (jsx.match(/>/g) || []).length;
            if (openBrackets !== closeBrackets) {
                errors.push(`Unmatched brackets: ${openBrackets} opening, ${closeBrackets} closing`);
            }
            // Check for obvious syntax errors that would cause build failures
            if (jsx.includes('<>') && !jsx.includes('</>')) {
                errors.push('Fragment opening tag without closing tag');
            }
            // Check for problematic characters in JSX attribute values
            const attributeRegex = /(\w+)=\{([^}]*)\}/g;
            let match;
            while ((match = attributeRegex.exec(jsx)) !== null) {
                const attributeValue = match[2];
                if (attributeValue.includes('\\') && !attributeValue.includes('\\\\')) {
                    errors.push(`Potential unescaped backslash in attribute: ${match[0]}`);
                }
            }
            return {
                isValid: errors.length === 0,
                errors
            };
        }
        catch (error) {
            errors.push(`Basic validation failed: ${error instanceof Error ? error.message : String(error)}`);
            return { isValid: false, errors };
        }
    }
    /**
     * Creates a backup of original JSX before modification
     */
    static createBackup(jsx, projectName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupComment = `/*
BACKUP: Original JSX before MCP validation/sanitization
Project: ${projectName}
Timestamp: ${timestamp}
Issues found and fixed by MCP JSX validator
*/

`;
        return backupComment + jsx;
    }
    /**
     * Formats validation result for logging/debugging
     */
    static formatValidationReport(result) {
        let report = `JSX Validation Report:\n`;
        report += `- Valid: ${result.isValid}\n`;
        report += `- Modified: ${result.wasModified}\n`;
        report += `- Issues Found: ${result.issues.length}\n`;
        if (result.issues.length > 0) {
            report += `\nIssues:\n${result.issues.map(issue => `  • ${issue}`).join('\n')}\n`;
        }
        if (result.wasModified) {
            report += `\n✅ JSX was automatically sanitized and should now compile correctly.\n`;
        }
        return report;
    }
}
exports.JSXValidator = JSXValidator;
// Export convenience function for direct use
function validateJSX(jsx) {
    return JSXValidator.validateAndSanitize(jsx);
}
//# sourceMappingURL=jsx-validator.js.map