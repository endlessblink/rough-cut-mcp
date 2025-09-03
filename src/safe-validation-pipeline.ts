// Safe Validation Pipeline - Zero Security Risk JSX Validation
// ONLY static analysis - no eval(), no execution, no unsafe operations

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as ts from 'typescript';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  summary: {
    syntaxValid: boolean;
    variablesValid: boolean;
    typesValid: boolean;
    templatesValid: boolean;
    remotionValid: boolean;
  };
}

interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ValidationWarning {
  message: string;
  line?: number;
  column?: number;
  type: string;
  suggestion?: string;
}

/**
 * MASTER SAFE VALIDATION PIPELINE
 * Pure static analysis - no code execution, no security risks
 */
export class SafeValidationPipeline {
  private readonly parserOptions = {
    sourceType: 'module' as const,
    plugins: [
      'jsx',
      'typescript',
      'objectRestSpread',
      ['decorators', { legacy: true }],
      'classProperties',
      'asyncGenerators',
      'optionalChaining',
      'nullishCoalescingOperator',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'throwExpressions',
      'topLevelAwait',
      'importMeta'
    ] as any[],
    errorRecovery: true,
    strictMode: false,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: false,
    ranges: false,
    tokens: false
  };

  /**
   * Main validation entry point - SAFE static analysis only
   */
  async validate(jsx: string, filename = 'component.tsx'): Promise<ValidationResult> {
    console.error('[SAFE-VALIDATION] Starting comprehensive static analysis...');
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];
    
    try {
      // Layer 1: AST Syntax Validation (SAFE)
      const astResult = this.validateSyntaxWithAST(jsx);
      errors.push(...astResult.errors);
      warnings.push(...astResult.warnings);
      
      if (astResult.ast) {
        // Layer 2: Variable Flow Analysis (SAFE - AST only)
        const variableResult = this.analyzeVariableFlowSafely(astResult.ast);
        errors.push(...variableResult.errors);
        warnings.push(...variableResult.warnings);
        
        // Layer 3: TypeScript Type Checking (SAFE)
        const typeResult = await this.validateTypesStatically(jsx, filename);
        errors.push(...typeResult.errors);
        warnings.push(...typeResult.warnings);
        
        // Layer 4: Template Validation (SAFE - string analysis)
        const templateResult = this.validateTemplatesStatically(jsx);
        errors.push(...templateResult.errors);
        warnings.push(...templateResult.warnings);
        
        // Layer 5: Remotion-Specific Validation (SAFE - AST only)
        const remotionResult = this.validateRemotionPatternsSafely(astResult.ast);
        errors.push(...remotionResult.errors);
        warnings.push(...remotionResult.warnings);
        suggestions.push(...remotionResult.suggestions);
      }
      
      const summary = {
        syntaxValid: astResult.errors.length === 0,
        variablesValid: errors.filter(e => e.type.includes('variable')).length === 0,
        typesValid: errors.filter(e => e.type.includes('type')).length === 0,
        templatesValid: errors.filter(e => e.type.includes('template')).length === 0,
        remotionValid: errors.filter(e => e.type.includes('remotion')).length === 0
      };
      
      const isValid = errors.filter(e => e.severity === 'critical').length === 0;
      
      console.error(`[SAFE-VALIDATION] Complete: ${isValid ? 'VALID' : 'INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);
      
      return {
        isValid,
        errors,
        warnings, 
        suggestions,
        summary
      };
      
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          message: `Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'system-error',
          severity: 'critical'
        }],
        warnings: [],
        suggestions: [],
        summary: {
          syntaxValid: false,
          variablesValid: false,
          typesValid: false,
          templatesValid: false,
          remotionValid: false
        }
      };
    }
  }

  /**
   * Layer 1: AST Syntax Validation - SAFE (no execution)
   */
  private validateSyntaxWithAST(jsx: string): { 
    ast?: t.File; 
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    try {
      const ast = parse(jsx, this.parserOptions);
      
      // Validate JSX structure through AST traversal
      traverse(ast, {
        JSXElement(path) {
          const { openingElement, closingElement, selfClosing } = path.node;
          
          // Check for unclosed elements
          if (!closingElement && !selfClosing) {
            const elementName = t.isJSXIdentifier(openingElement.name) 
              ? openingElement.name.name 
              : t.isJSXMemberExpression(openingElement.name)
                ? `${(openingElement.name.object as any).name}.${openingElement.name.property.name}`
                : 'UnknownElement';
            
            errors.push({
              message: `Unclosed JSX element: <${elementName}>`,
              line: openingElement.loc?.start.line,
              column: openingElement.loc?.start.column,
              type: 'jsx-unclosed-element',
              severity: 'critical'
            });
          }
          
          // Check for invalid attribute names
          openingElement.attributes.forEach(attr => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
              if (attr.name.name === 'class') {
                warnings.push({
                  message: 'Use "className" instead of "class" in JSX',
                  line: attr.loc?.start.line,
                  column: attr.loc?.start.column,
                  type: 'jsx-invalid-attribute',
                  suggestion: 'Replace "class" with "className"'
                });
              }
            }
          });
        },
        
        JSXExpressionContainer(path) {
          // Validate expressions within JSX are not empty
          if (t.isJSXEmptyExpression(path.node.expression)) {
            warnings.push({
              message: 'Empty JSX expression {}',
              line: path.node.loc?.start.line,
              type: 'jsx-empty-expression'
            });
          }
        }
      });
      
      return { ast, errors, warnings };
      
    } catch (parseError) {
      const error = parseError as any;
      return {
        errors: [{
          message: `JSX syntax error: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`,
          line: error.loc?.line || 1,
          column: error.loc?.column || 1,
          type: 'syntax-error',
          severity: 'critical'
        }],
        warnings: []
      };
    }
  }

  /**
   * Layer 2: Variable Flow Analysis - SAFE (AST traversal only)
   */
  private analyzeVariableFlowSafely(ast: t.File): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Track scopes and variables
    const scopes = new Map<string, Map<string, { line: number; used: boolean }>>();
    let currentScopeId = 'global';
    let scopeCounter = 0;
    
    const getCurrentScope = () => scopes.get(currentScopeId) || new Map();
    const setCurrentScope = (variables: Map<string, any>) => scopes.set(currentScopeId, variables);
    
    traverse(ast, {
      Program: {
        enter() {
          scopes.set('global', new Map());
        }
      },
      
      FunctionDeclaration: {
        enter(path) {
          const funcName = path.node.id?.name || `anonymous-${++scopeCounter}`;
          const parentScope = currentScopeId;
          currentScopeId = `${parentScope}->${funcName}`;
          scopes.set(currentScopeId, new Map());
          
          // Declare function parameters
          path.node.params.forEach(param => {
            if (t.isIdentifier(param)) {
              getCurrentScope().set(param.name, { 
                line: param.loc?.start.line || 0, 
                used: false 
              });
            }
          });
        },
        exit() {
          currentScopeId = currentScopeId.includes('->') ? 
            currentScopeId.substring(0, currentScopeId.lastIndexOf('->')) : 'global';
        }
      },
      
      ArrowFunctionExpression: {
        enter(path) {
          const parentScope = currentScopeId;
          currentScopeId = `${parentScope}->arrow-${++scopeCounter}`;
          scopes.set(currentScopeId, new Map());
          
          // Declare arrow function parameters
          path.node.params.forEach(param => {
            if (t.isIdentifier(param)) {
              getCurrentScope().set(param.name, { 
                line: param.loc?.start.line || 0, 
                used: false 
              });
            }
          });
        },
        exit() {
          currentScopeId = currentScopeId.includes('->') ? 
            currentScopeId.substring(0, currentScopeId.lastIndexOf('->')) : 'global';
        }
      },
      
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id)) {
          const varName = path.node.id.name;
          const line = path.node.id.loc?.start.line || 0;
          
          // Check for duplicate declarations in same scope
          if (getCurrentScope().has(varName)) {
            warnings.push({
              message: `Variable '${varName}' is already declared in this scope`,
              line,
              type: 'duplicate-variable'
            });
          }
          
          getCurrentScope().set(varName, { line, used: false });
        }
      },
      
      Identifier(path: any) {
        // Only check references, not declarations or property keys
        if (path.isReferencedIdentifier && path.isBindingIdentifier &&
            typeof path.isReferencedIdentifier === 'function' && 
            typeof path.isBindingIdentifier === 'function' &&
            path.isReferencedIdentifier() && !path.isBindingIdentifier() && 
            path.node && 'name' in path.node) {
          const varName = path.node.name;
          let found = false;
          
          // Walk up scope chain to find variable
          let checkScope = currentScopeId;
          while (checkScope && !found) {
            const scope = scopes.get(checkScope);
            if (scope?.has(varName)) {
              scope.get(varName)!.used = true;
              found = true;
            }
            checkScope = checkScope.includes('->') ? 
              checkScope.substring(0, checkScope.lastIndexOf('->')) : '';
          }
          
          // Check if it's a known React/JS/Remotion built-in
          const builtIns = [
            // React hooks and components
            'React', 'useState', 'useEffect', 'useContext', 'useRef', 'useMemo', 'useCallback',
            // Remotion hooks and components
            'useCurrentFrame', 'useVideoConfig', 'interpolate', 'spring', 'Easing',
            'AbsoluteFill', 'Sequence', 'Video', 'Audio', 'Img', 'Loop', 'Series',
            // JavaScript globals
            'Math', 'console', 'Array', 'Object', 'JSON', 'Date', 'String', 'Number', 'Boolean',
            'RegExp', 'Error', 'TypeError', 'ReferenceError', 'Promise', 'Set', 'Map', 'WeakMap', 'WeakSet',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI', 'setTimeout', 'setInterval',
            // Browser/DOM globals (commonly available)
            'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
            // Node.js globals (if in server context)
            'process', 'Buffer', 'global', '__dirname', '__filename', 'require', 'module', 'exports'
          ];
          
          if (!found && !builtIns.includes(varName) && !/^[A-Z]/.test(varName)) {
            const node = path.node as any;
            errors.push({
              message: `Variable '${varName}' is not defined`,
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              type: 'undefined-variable',
              severity: 'critical'
            });
          }
        }
      }
    });
    
    // Check for unused variables
    scopes.forEach((variables, scopeId) => {
      variables.forEach((info, varName) => {
        if (!info.used && !varName.startsWith('_')) {
          warnings.push({
            message: `Variable '${varName}' is declared but never used`,
            line: info.line,
            type: 'unused-variable',
            suggestion: `Remove unused variable or prefix with underscore: _${varName}`
          });
        }
      });
    });
    
    return { errors, warnings };
  }

  /**
   * Layer 3: TypeScript Type Checking - SAFE (no execution)
   */
  private async validateTypesStatically(jsx: string, filename: string): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    try {
      // Create temporary in-memory files for TS compiler
      const files = new Map<string, string>();
      files.set(filename, jsx);
      
      // TypeScript compiler configuration
      const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        noImplicitAny: false, // Allow some flexibility for creative coding
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        lib: ['ES2020', 'DOM']
      };
      
      // Create virtual file system for TS compiler
      const host: ts.CompilerHost = {
        getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget) => {
          if (files.has(fileName)) {
            return ts.createSourceFile(fileName, files.get(fileName)!, languageVersion, true);
          }
          // Try to read from actual file system for imports
          try {
            const content = require('fs').readFileSync(fileName, 'utf-8');
            return ts.createSourceFile(fileName, content, languageVersion, true);
          } catch {
            return undefined;
          }
        },
        writeFile: () => {}, // No-op - we don't write files
        getCurrentDirectory: () => process.cwd(),
        getDirectories: () => [],
        fileExists: (fileName: string) => files.has(fileName) || require('fs').existsSync(fileName),
        readFile: (fileName: string) => files.get(fileName) || '',
        getCanonicalFileName: (fileName: string) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n',
        getDefaultLibFileName: (options: ts.CompilerOptions) => 'lib.d.ts'
      };
      
      // Create TypeScript program
      const program = ts.createProgram([filename], compilerOptions, host);
      
      // Get diagnostics
      const diagnostics = [
        ...program.getSyntacticDiagnostics(),
        ...program.getSemanticDiagnostics()
      ];
      
      diagnostics.forEach(diagnostic => {
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          
          if (diagnostic.category === ts.DiagnosticCategory.Error) {
            errors.push({
              message,
              line: line + 1,
              column: character + 1,
              type: 'typescript-error',
              severity: 'high'
            });
          } else {
            warnings.push({
              message,
              line: line + 1,
              column: character + 1,
              type: 'typescript-warning'
            });
          }
        }
      });
      
    } catch (error) {
      errors.push({
        message: `TypeScript validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'typescript-system-error',
        severity: 'high'
      });
    }
    
    return { errors, warnings };
  }

  /**
   * Layer 4: Template Validation - SAFE (string analysis only)  
   */
  private validateTemplatesStatically(jsx: string): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const lines = jsx.split('\n');
    
    lines.forEach((line, lineIndex) => {
      // Check for template literals with variables
      const templateMatches = line.match(/\`[^`]*\$\{[^}]*\}[^`]*\`/g);
      if (templateMatches) {
        templateMatches.forEach(template => {
          // Extract variables from template
          const variables = template.match(/\$\{([^}]+)\}/g);
          if (variables) {
            variables.forEach(variable => {
              const expression = variable.slice(2, -1).trim();
              
              // Check for potentially dangerous expressions
              if (!expression) {
                errors.push({
                  message: 'Empty template expression ${}',
                  line: lineIndex + 1,
                  type: 'template-empty',
                  severity: 'medium'
                });
              }
              
              // Check for undefined/null values that would render as strings
              if (expression === 'undefined' || expression === 'null') {
                warnings.push({
                  message: `Template expression \${${expression}} will render as text`,
                  line: lineIndex + 1,
                  type: 'template-literal-value',
                  suggestion: 'Use conditional rendering: {value && <div>{value}</div>}'
                });
              }
            });
          }
        });
      }
      
      // Check for React-specific template issues
      if (line.includes('className={') && line.includes('undefined')) {
        warnings.push({
          message: 'className may be undefined',
          line: lineIndex + 1,
          type: 'classname-undefined',
          suggestion: 'Use conditional className or default value'
        });
      }
    });
    
    return { errors, warnings };
  }

  /**
   * Layer 5: Remotion-Specific Validation - SAFE (AST analysis only)
   */
  private validateRemotionPatternsSafely(ast: t.File): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: string[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];
    
    let hasRemotionImport = false;
    let hasUseCurrentFrame = false;
    let hasUseVideoConfig = false;
    const interpolateCalls: number[] = [];
    
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === 'remotion') {
          hasRemotionImport = true;
          
          // Check for common Remotion imports
          path.node.specifiers.forEach(spec => {
            if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
              const importName = spec.imported.name;
              
              if (importName === 'useCurrentFrame') {
                hasUseCurrentFrame = true;
              } else if (importName === 'useVideoConfig') {
                hasUseVideoConfig = true;
              }
            }
          });
        }
      },
      
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const functionName = path.node.callee.name;
          
          // Validate interpolate calls
          if (functionName === 'interpolate') {
            const line = path.node.loc?.start.line || 0;
            interpolateCalls.push(line);
            
            if (path.node.arguments.length < 3) {
              errors.push({
                message: 'interpolate() requires at least 3 arguments: frame, inputRange, outputRange',
                line,
                type: 'remotion-interpolate-args',
                severity: 'critical'
              });
            }
            
            // Check for potential range issues
            const [, inputRange, outputRange] = path.node.arguments;
            if (t.isArrayExpression(inputRange) && t.isArrayExpression(outputRange)) {
              if (inputRange.elements.length !== outputRange.elements.length) {
                errors.push({
                  message: 'interpolate() inputRange and outputRange must have same length',
                  line,
                  type: 'remotion-interpolate-range-mismatch',
                  severity: 'critical'
                });
              }
              
              // Check for descending input ranges (common error)
              if (inputRange.elements.length >= 2) {
                const firstElement = inputRange.elements[0];
                const lastElement = inputRange.elements[inputRange.elements.length - 1];
                
                if (t.isNumericLiteral(firstElement) && t.isNumericLiteral(lastElement)) {
                  if (firstElement.value > lastElement.value) {
                    warnings.push({
                      message: 'interpolate() inputRange appears to be descending - check if this is intended',
                      line,
                      type: 'remotion-interpolate-descending',
                      suggestion: 'Ensure inputRange values are in ascending order'
                    });
                  }
                }
              }
            }
          }
          
          // Validate spring calls
          if (functionName === 'spring') {
            const line = path.node.loc?.start.line || 0;
            
            if (path.node.arguments.length === 0) {
              errors.push({
                message: 'spring() requires configuration object',
                line,
                type: 'remotion-spring-args',
                severity: 'critical'
              });
            }
          }
        }
      }
    });
    
    // Check for missing essential Remotion patterns
    if (hasRemotionImport && !hasUseCurrentFrame) {
      suggestions.push('Consider using useCurrentFrame() for frame-based animations');
    }
    
    if (interpolateCalls.length > 0 && !hasUseCurrentFrame) {
      errors.push({
        message: 'Using interpolate() but useCurrentFrame() not imported or called',
        type: 'remotion-missing-frame',
        severity: 'high'
      });
    }
    
    if (interpolateCalls.length > 3 && !hasUseVideoConfig) {
      suggestions.push('Consider using useVideoConfig() for fps and duration when using multiple animations');
    }
    
    return { errors, warnings, suggestions };
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport(result: ValidationResult, projectName: string): string {
    let report = `🔍 **Safe Validation Report: ${projectName}**\n\n`;
    
    if (result.isValid) {
      report += `✅ **VALIDATION PASSED** - Safe to use\n\n`;
    } else {
      report += `❌ **VALIDATION FAILED** - ${result.errors.filter(e => e.severity === 'critical').length} critical errors\n\n`;
    }
    
    // Summary
    report += `**Validation Summary:**\n`;
    report += `• Syntax: ${result.summary.syntaxValid ? '✅ Valid' : '❌ Errors'}\n`;
    report += `• Variables: ${result.summary.variablesValid ? '✅ Complete' : '❌ Missing'}\n`;
    report += `• Types: ${result.summary.typesValid ? '✅ Safe' : '❌ Issues'}\n`;
    report += `• Templates: ${result.summary.templatesValid ? '✅ Complete' : '❌ Issues'}\n`;
    report += `• Remotion: ${result.summary.remotionValid ? '✅ Compatible' : '❌ Issues'}\n\n`;
    
    // Critical errors
    const criticalErrors = result.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      report += `🚨 **Critical Errors** (${criticalErrors.length}):\n`;
      criticalErrors.forEach(error => {
        report += `• Line ${error.line}: ${error.message}\n`;
      });
      report += '\n';
    }
    
    // High priority errors
    const highErrors = result.errors.filter(e => e.severity === 'high');
    if (highErrors.length > 0) {
      report += `⚠️ **High Priority** (${highErrors.length}):\n`;
      highErrors.forEach(error => {
        report += `• Line ${error.line}: ${error.message}\n`;
      });
      report += '\n';
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      report += `💡 **Warnings** (${result.warnings.length}):\n`;
      result.warnings.slice(0, 10).forEach(warning => { // Limit to first 10
        report += `• Line ${warning.line}: ${warning.message}\n`;
        if (warning.suggestion) {
          report += `  💡 ${warning.suggestion}\n`;
        }
      });
      if (result.warnings.length > 10) {
        report += `... and ${result.warnings.length - 10} more warnings\n`;
      }
      report += '\n';
    }
    
    // Suggestions
    if (result.suggestions.length > 0) {
      report += `🎯 **Improvement Suggestions:**\n`;
      result.suggestions.forEach(suggestion => {
        report += `• ${suggestion}\n`;
      });
    }
    
    return report;
  }
}

/**
 * Main validation function for MCP integration
 */
export async function validateJSXSafely(jsx: string, projectName: string, options: {
  skipValidation?: boolean;
} = {}): Promise<{
  isValid: boolean;
  report: string;
  errors: ValidationError[];
}> {
  // If validation is skipped, return success immediately
  if (options.skipValidation) {
    console.error('[SAFE-VALIDATION] Validation skipped by user option');
    return {
      isValid: true,
      report: `✅ **VALIDATION BYPASSED** - Project: ${projectName}\n\nValidation was skipped by user option. Code accepted as-is.`,
      errors: []
    };
  }

  const pipeline = new SafeValidationPipeline();
  const result = await pipeline.validate(jsx, `${projectName}/src/VideoComposition.tsx`);
  const report = pipeline.generateReport(result, projectName);
  
  return {
    isValid: result.isValid,
    report,
    errors: result.errors
  };
}