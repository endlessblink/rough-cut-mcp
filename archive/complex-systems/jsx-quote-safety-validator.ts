// JSX Quote Safety Validator - Prevent Font Family Quote Escaping Issues
// Comprehensive validation system to prevent JSX syntax errors

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

interface QuoteSafetyIssue {
  type: 'quote-escape' | 'malformed-string' | 'embedded-quotes' | 'css-corruption';
  severity: 'critical' | 'high' | 'medium';
  line: number;
  column: number;
  property: string;
  currentValue: string;
  suggestedFix: string;
  description: string;
}

interface QuoteSafetyResult {
  isValid: boolean;
  issues: QuoteSafetyIssue[];
  correctedJSX?: string;
  validationPassed: boolean;
}

/**
 * JSX Quote Safety Validator - Main Class
 * Prevents the font family quote escaping bug and similar issues
 */
export class JSXQuoteSafetyValidator {

  /**
   * Validate JSX for quote safety issues before generation
   */
  validateJSXQuoteSafety(jsx: string): QuoteSafetyResult {
    console.error('[JSX-QUOTE-SAFETY] Validating JSX for quote safety issues...');
    
    const issues: QuoteSafetyIssue[] = [];
    let correctedJSX = jsx;
    
    try {
      // Parse JSX to AST for analysis
      const ast = parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      // Traverse AST looking for quote safety issues
      traverse(ast, {
        JSXExpressionContainer: (path) => {
          if (path.node.expression.type === 'ObjectExpression') {
            this.validateStyleObject(path.node.expression, jsx, issues);
          }
        }
      });
      
      // Apply corrections if issues found
      if (issues.length > 0) {
        correctedJSX = this.applyQuoteSafetyCorrections(jsx, issues);
      }
      
    } catch (parseError) {
      console.error('[JSX-QUOTE-SAFETY] Parse error - JSX may already be malformed:', parseError);
      issues.push({
        type: 'malformed-string',
        severity: 'critical',
        line: 0,
        column: 0,
        property: 'jsx-structure',
        currentValue: jsx.substring(0, 100) + '...',
        suggestedFix: 'Fix JSX syntax errors before validation',
        description: 'JSX contains syntax errors that prevent parsing'
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      correctedJSX: issues.length > 0 ? correctedJSX : jsx,
      validationPassed: issues.filter(i => i.severity === 'critical').length === 0
    };
  }
  
  /**
   * Validate style object for quote safety issues
   */
  private validateStyleObject(styleObj: any, jsx: string, issues: QuoteSafetyIssue[]) {
    styleObj.properties.forEach((prop: any) => {
      if (prop.type === 'ObjectProperty' && prop.value?.type === 'StringLiteral') {
        const propName = prop.key.name || '<unknown>';
        const value = prop.value.value;
        
        // Check for font family quote issues (main problem)
        if (propName === 'fontFamily') {
          this.validateFontFamilyQuotes(prop, jsx, issues);
        }
        
        // Check for general embedded quote issues
        this.validateEmbeddedQuotes(prop, jsx, issues);
        
        // Check for CSS corruption patterns
        this.validateCSSCorruption(prop, jsx, issues);
      }
    });
  }
  
  /**
   * Validate font family property for quote safety
   */
  private validateFontFamilyQuotes(prop: any, jsx: string, issues: QuoteSafetyIssue[]) {
    const value = prop.value.value;
    const propName = prop.key.name;
    
    // Pattern 1: Check for quote corruption like 'SF Pro Display'", -apple-system
    const quotingIssuePattern = /^[^"]*"[^"]*",.*$/;
    if (quotingIssuePattern.test(value)) {
      issues.push({
        type: 'quote-escape',
        severity: 'critical',
        line: prop.loc?.start?.line || 0,
        column: prop.loc?.start?.column || 0,
        property: propName,
        currentValue: value,
        suggestedFix: value.replace(/"/g, ''),
        description: 'Font family contains embedded quotes that will break JSX compilation'
      });
    }
    
    // Pattern 2: Check for mixed quote styles
    const mixedQuotesPattern = /['"][^'"]*["'][^'"]*['"][^'"]*["']/;
    if (mixedQuotesPattern.test(value)) {
      issues.push({
        type: 'embedded-quotes',
        severity: 'high',
        line: prop.loc?.start?.line || 0,
        column: prop.loc?.start?.column || 0,
        property: propName,
        currentValue: value,
        suggestedFix: value.replace(/["']/g, ''),
        description: 'Font family contains mixed quote styles that may cause issues'
      });
    }
  }
  
  /**
   * Validate for embedded quotes in any string property
   */
  private validateEmbeddedQuotes(prop: any, jsx: string, issues: QuoteSafetyIssue[]) {
    const value = prop.value.value;
    const propName = prop.key.name;
    
    // Check for embedded quotes that could break JSX
    if (typeof value === 'string' && value.includes('"') && value.includes("'")) {
      issues.push({
        type: 'embedded-quotes',
        severity: 'medium',
        line: prop.loc?.start?.line || 0,
        column: prop.loc?.start?.column || 0,
        property: propName,
        currentValue: value,
        suggestedFix: value.replace(/["']/g, ''),
        description: 'Property contains both single and double quotes - potential syntax issue'
      });
    }
  }
  
  /**
   * Validate for CSS corruption patterns
   */
  private validateCSSCorruption(prop: any, jsx: string, issues: QuoteSafetyIssue[]) {
    const value = prop.value.value;
    const propName = prop.key.name;
    
    if (typeof value !== 'string') return;
    
    // Check for CSS unit corruption
    const corruptions = [
      { pattern: /\d+px+px/g, name: 'pxpx duplication' },
      { pattern: /\d+%%/g, name: 'percentage duplication' },
      { pattern: /\d+(em|rem){2,}/g, name: 'unit duplication' }
    ];
    
    corruptions.forEach(({ pattern, name }) => {
      if (pattern.test(value)) {
        issues.push({
          type: 'css-corruption',
          severity: 'medium',
          line: prop.loc?.start?.line || 0,
          column: prop.loc?.start?.column || 0,
          property: propName,
          currentValue: value,
          suggestedFix: value.replace(pattern, (match) => match.replace(/(.+)\1+/, '$1')),
          description: `CSS corruption detected: ${name} in ${propName}`
        });
      }
    });
  }
  
  /**
   * Apply quote safety corrections to JSX
   */
  private applyQuoteSafetyCorrections(jsx: string, issues: QuoteSafetyIssue[]): string {
    let correctedJSX = jsx;
    
    // Apply corrections for critical issues first
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    
    criticalIssues.forEach(issue => {
      if (issue.type === 'quote-escape' || issue.type === 'embedded-quotes') {
        // Find and replace the problematic value
        const searchPattern = new RegExp(`${issue.property}:\\s*['"][^'"]*${issue.currentValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*['"]`, 'g');
        correctedJSX = correctedJSX.replace(searchPattern, `${issue.property}: '${issue.suggestedFix}'`);
      }
    });
    
    return correctedJSX;
  }
  
  /**
   * Safe font family string generator
   */
  static generateSafeFontFamily(fonts: string[]): string {
    return fonts
      .map(font => font.trim())
      .filter(font => font.length > 0)
      .join(', ');
  }
  
  /**
   * Quick validation for common patterns
   */
  static quickValidateString(value: string): { isValid: boolean; corrected: string } {
    // Remove embedded quotes and fix common issues
    const corrected = value
      .replace(/["']/g, '')  // Remove all quotes
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
    
    const isValid = !value.includes('"') || !value.includes("'");
    
    return { isValid, corrected };
  }
}

/**
 * Export convenience function for quick validation
 */
export function validateJSXQuoteSafety(jsx: string): QuoteSafetyResult {
  const validator = new JSXQuoteSafetyValidator();
  return validator.validateJSXQuoteSafety(jsx);
}

/**
 * Export safe font family generator
 */
export function generateSafeFontFamily(fonts: string[]): string {
  return JSXQuoteSafetyValidator.generateSafeFontFamily(fonts);
}