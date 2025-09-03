// Comprehensive JSX Validation Pipeline - Prevent ALL Forms of Corruption
// Multi-layer defense system for safe project creation

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctionsSuggested: string[];
  runtimeSafe: boolean;
}

interface VariableAnalysis {
  declared: string[];
  referenced: string[];
  missing: string[];
  unused: string[];
}

/**
 * MASTER VALIDATION PIPELINE - Multi-Layer Defense Against Corruption
 * Layer 1: Syntax validation
 * Layer 2: Variable completeness checking  
 * Layer 3: Runtime safety analysis
 * Layer 4: Template placeholder detection
 */
export function validateJSXComprehensively(jsx: string, projectName: string): ValidationResult {
  console.error('[JSX-VALIDATION] Running comprehensive validation pipeline...');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const corrections: string[] = [];
  
  try {
    // Layer 1: Syntax Validation using AST Parser
    const syntaxResult = validateJSXSyntax(jsx);
    errors.push(...syntaxResult.errors);
    warnings.push(...syntaxResult.warnings);
    
    // Layer 2: Variable Completeness Analysis  
    const variableResult = analyzeVariableCompleteness(jsx);
    if (variableResult.missing.length > 0) {
      errors.push(`Missing variable declarations: ${variableResult.missing.join(', ')}`);
      corrections.push(`Add: ${variableResult.missing.map(v => `const ${v} = /* appropriate value */;`).join(' ')}`);
    }
    
    if (variableResult.unused.length > 0) {
      warnings.push(`Unused variables detected: ${variableResult.unused.join(', ')}`);
    }
    
    // Layer 3: Runtime Safety Checks
    const runtimeResult = validateRuntimeSafety(jsx);
    errors.push(...runtimeResult.errors);
    warnings.push(...runtimeResult.warnings);
    
    // Layer 4: Template Placeholder Detection
    const placeholderResult = detectTemplatePlaceholders(jsx);
    errors.push(...placeholderResult.errors);
    corrections.push(...placeholderResult.corrections);
    
    const isValid = errors.length === 0;
    const runtimeSafe = isValid && variableResult.missing.length === 0;
    
    console.error(`[JSX-VALIDATION] Validation complete: ${isValid ? 'PASS' : 'FAIL'} (${errors.length} errors, ${warnings.length} warnings)`);
    
    return {
      isValid,
      errors,
      warnings,
      correctionsSuggested: corrections,
      runtimeSafe
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`AST parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      correctionsSuggested: ['Fix JSX syntax before running validation'],
      runtimeSafe: false
    };
  }
}

/**
 * Layer 1: Comprehensive Syntax Validation
 */
function validateJSXSyntax(jsx: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Parse with full JSX/TypeScript support
    const ast = parse(jsx, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'objectRestSpread', 'decorators-legacy'],
      strictMode: false,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: false
    });
    
    // AST parsed successfully - basic syntax is valid
    console.error('[JSX-VALIDATION] ✅ AST parsing successful - valid JSX syntax');
    
    // Check for common JSX issues
    traverse(ast, {
      JSXElement(path) {
        // Check for unclosed elements
        if (!path.node.closingElement && !path.node.selfClosing) {
          const elementName = t.isJSXIdentifier(path.node.openingElement.name) 
            ? path.node.openingElement.name.name 
            : t.isJSXMemberExpression(path.node.openingElement.name)
              ? `${(path.node.openingElement.name.object as any).name}.${path.node.openingElement.name.property.name}`
              : 'UnknownElement';
          errors.push(`Unclosed JSX element: ${elementName}`);
        }
      },
      
      JSXAttribute(path) {
        // Check for malformed style attributes
        if (path.node.name.name === 'style' && path.node.value?.type === 'JSXExpressionContainer') {
          if (path.node.value.expression.type !== 'ObjectExpression') {
            warnings.push('Style attribute should be an object expression');
          }
        }
      }
    });
    
  } catch (parseError) {
    errors.push(`JSX syntax error: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`);
  }
  
  return { errors, warnings };
}

/**
 * Layer 2: Variable Completeness Analysis
 */
function analyzeVariableCompleteness(jsx: string): VariableAnalysis {
  const declared: string[] = [];
  const referenced: string[] = [];
  
  try {
    const ast = parse(jsx, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Find all variable declarations
    traverse(ast, {
      VariableDeclarator(path) {
        if (path.node.id.type === 'Identifier') {
          declared.push(path.node.id.name);
        }
      },
      
      // Find all variable references in template expressions
      Identifier(path: any) {
        // Check if it's being referenced (not declared)
        if (path.isReferencedIdentifier && path.isBindingIdentifier && 
            typeof path.isReferencedIdentifier === 'function' && 
            typeof path.isBindingIdentifier === 'function' &&
            path.isReferencedIdentifier() && !path.isBindingIdentifier() && 
            path.node && 'name' in path.node) {
          referenced.push(path.node.name);
        }
      }
    });
    
  } catch (error) {
    console.error('[JSX-VALIDATION] Variable analysis failed:', error);
  }
  
  // Find missing and unused variables
  const missing = [...new Set(referenced.filter(ref => !declared.includes(ref)))];
  const unused = declared.filter(decl => !referenced.includes(decl));
  
  // Filter out React/Remotion built-ins and common variables
  const builtIns = ['React', 'frame', 'fps', 'durationInFrames', 'Math', 'console', 'interpolate', 'spring', 'useCurrentFrame', 'useVideoConfig'];
  const filteredMissing = missing.filter(v => !builtIns.includes(v));
  
  return {
    declared: [...new Set(declared)],
    referenced: [...new Set(referenced)],
    missing: filteredMissing,
    unused: unused.filter(v => !['React'].includes(v))
  };
}

/**
 * Layer 3: Runtime Safety Validation
 */
function validateRuntimeSafety(jsx: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for common runtime pitfalls
  
  // Division by zero risk
  if (jsx.includes('/ 0') || jsx.includes('/0')) {
    errors.push('Potential division by zero detected');
  }
  
  // Undefined property access
  if (jsx.match(/\.\w+\?\./)) {
    warnings.push('Optional chaining detected - verify object exists');
  }
  
  // Array access without bounds checking
  if (jsx.match(/\[\d+\]/) && !jsx.includes('.length')) {
    warnings.push('Direct array index access - consider bounds checking');
  }
  
  // Missing useCurrentFrame when frame is used
  if (jsx.includes('frame') && !jsx.includes('useCurrentFrame')) {
    errors.push('Variable "frame" used but useCurrentFrame() not called');
  }
  
  return { errors, warnings };
}

/**
 * Layer 4: Template Placeholder Detection
 */
function detectTemplatePlaceholders(jsx: string): { errors: string[]; corrections: string[] } {
  const errors: string[] = [];
  const corrections: string[] = [];
  
  // Common placeholder patterns that indicate incomplete generation
  const placeholders = [
    { pattern: /\$\{[^}]*PLACEHOLDER[^}]*\}/g, name: 'PLACEHOLDER variables' },
    { pattern: /\/\* TODO:.*\*\//g, name: 'TODO comments' },
    { pattern: /\/\/ FIXME:.*$/gm, name: 'FIXME comments' },
    { pattern: /\$\{[^}]*undefined[^}]*\}/g, name: 'undefined template variables' },
    { pattern: /\$\{[^}]*null[^}]*\}/g, name: 'null template variables' }
  ];
  
  placeholders.forEach(({ pattern, name }) => {
    const matches = jsx.match(pattern);
    if (matches) {
      errors.push(`Incomplete template detected: ${name} (${matches.length} instances)`);
      corrections.push(`Complete template by replacing ${name}`);
    }
  });
  
  return { errors, corrections };
}

/**
 * Pre-Creation Safety Check - Run before writing any JSX files
 */
export function validateBeforeProjectCreation(jsx: string, projectName: string): { safe: boolean; report: string } {
  const validation = validateJSXComprehensively(jsx, projectName);
  
  let report = `🔍 **JSX Validation Report: ${projectName}**\n\n`;
  
  if (validation.isValid) {
    report += `✅ **VALIDATION PASSED** - Safe to create project\n\n`;
  } else {
    report += `❌ **VALIDATION FAILED** - ${validation.errors.length} critical errors\n\n`;
    
    if (validation.errors.length > 0) {
      report += `🚨 **Critical Errors**:\n`;
      validation.errors.forEach(error => report += `• ${error}\n`);
      report += '\n';
    }
  }
  
  if (validation.warnings.length > 0) {
    report += `⚠️ **Warnings**:\n`;
    validation.warnings.forEach(warning => report += `• ${warning}\n`);
    report += '\n';
  }
  
  if (validation.correctionsSuggested.length > 0) {
    report += `🔧 **Suggested Corrections**:\n`;
    validation.correctionsSuggested.forEach(correction => report += `• ${correction}\n`);
    report += '\n';
  }
  
  report += `🛡️ **Runtime Safety**: ${validation.runtimeSafe ? '✅ Safe' : '❌ Unsafe'}\n`;
  report += `📊 **Recommendation**: ${validation.isValid ? 'Proceed with project creation' : 'Fix errors before creating project'}`;
  
  return {
    safe: validation.isValid && validation.runtimeSafe,
    report
  };
}

/**
 * Auto-Correction System - Attempt to fix common issues automatically  
 */
export function autoCorrectCommonIssues(jsx: string): { corrected: string; fixes: string[] } {
  let corrected = jsx;
  const fixes: string[] = [];
  
  // Fix missing useCurrentFrame when frame is referenced
  if (jsx.includes('frame') && !jsx.includes('useCurrentFrame()')) {
    if (jsx.includes('const frame =') === false) {
      // Add useCurrentFrame call after imports
      const importEndMatch = jsx.match(/(import.*from.*['"];?\n)/g);
      if (importEndMatch) {
        const lastImport = importEndMatch[importEndMatch.length - 1];
        const insertPoint = jsx.indexOf(lastImport) + lastImport.length;
        corrected = jsx.slice(0, insertPoint) + 
                   '\n  const frame = useCurrentFrame();\n' + 
                   jsx.slice(insertPoint);
        fixes.push('Added missing useCurrentFrame() call');
      }
    }
  }
  
  // Fix missing useVideoConfig when fps/durationInFrames referenced
  if ((jsx.includes('fps') || jsx.includes('durationInFrames')) && !jsx.includes('useVideoConfig()')) {
    if (jsx.includes('const { fps') === false) {
      const frameDeclaration = corrected.indexOf('const frame =');
      if (frameDeclaration !== -1) {
        const insertPoint = corrected.indexOf('\n', frameDeclaration) + 1;
        corrected = corrected.slice(0, insertPoint) + 
                   '  const { fps, durationInFrames } = useVideoConfig();\n' + 
                   corrected.slice(insertPoint);
        fixes.push('Added missing useVideoConfig() call');
      }
    }
  }
  
  return { corrected, fixes };
}