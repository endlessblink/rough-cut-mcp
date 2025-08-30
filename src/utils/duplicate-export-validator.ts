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
export function validateDuplicateExports(code: string): DuplicateExportResult {
  const errors: string[] = [];
  const duplicates: Array<{ name: string; lines: number[]; exports: string[] }> = [];
  let correctedCode = code;

  // Track all exports by name
  const exportMap = new Map<string, Array<{ line: number; fullExport: string }>>();
  const lines = code.split('\n');

  // Find all export statements
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Match various export patterns
    const exportPatterns = [
      /export\s+const\s+(\w+)/g,
      /export\s+function\s+(\w+)/g,
      /export\s+class\s+(\w+)/g,
      /export\s+interface\s+(\w+)/g,
      /export\s+type\s+(\w+)/g,
      /export\s+default\s+(\w+)/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const exportName = match[1];
        
        if (!exportMap.has(exportName)) {
          exportMap.set(exportName, []);
        }
        
        exportMap.get(exportName)!.push({
          line: lineNumber,
          fullExport: line.trim()
        });
      }
    }
  }

  // Find duplicates
  for (const [exportName, exports] of exportMap) {
    if (exports.length > 1) {
      duplicates.push({
        name: exportName,
        lines: exports.map(e => e.line),
        exports: exports.map(e => e.fullExport)
      });

      errors.push(`Duplicate export "${exportName}" found on lines: ${exports.map(e => e.line).join(', ')}`);
    }
  }

  // Fix duplicates by removing all but the last export
  if (duplicates.length > 0) {
    const correctedLines = [...lines];
    
    for (const duplicate of duplicates) {
      const { name, lines: duplicateLines } = duplicate;
      
      // Keep only the last export (usually the most complete one)
      const keepLine = Math.max(...duplicateLines);
      
      for (const lineNum of duplicateLines) {
        if (lineNum !== keepLine) {
          // Remove or comment out the duplicate export
          const arrayIndex = lineNum - 1;
          const originalLine = correctedLines[arrayIndex];
          
          // Replace export with a comment
          correctedLines[arrayIndex] = `// REMOVED DUPLICATE EXPORT: ${originalLine}`;
          
          errors.push(`Removed duplicate export "${name}" from line ${lineNum}`);
        }
      }
    }
    
    correctedCode = correctedLines.join('\n');
  }

  return {
    isValid: duplicates.length === 0,
    correctedCode: duplicates.length > 0 ? correctedCode : undefined,
    errors,
    duplicates
  };
}

/**
 * Process code to remove duplicate exports with smart block handling
 */
export function processDuplicateExports(code: string): string {
  // First try advanced duplicate removal (handles complete blocks)
  const advancedResult = validateAdvancedDuplicates(code);
  
  if (advancedResult.correctedCode) {
    return advancedResult.correctedCode;
  }
  
  // Fallback to basic validation
  const validation = validateDuplicateExports(code);
  
  if (validation.correctedCode) {
    return validation.correctedCode;
  }
  
  return code;
}

/**
 * Advanced duplicate detection for complex cases
 */
export function validateAdvancedDuplicates(code: string): {
  isValid: boolean;
  correctedCode?: string;
  errors: string[];
} {
  const errors: string[] = [];
  let correctedCode = code;

  // 1. Check for duplicate component definitions
  const componentRegex = /const\s+(\w+):\s*React\.FC.*=/g;
  const components = new Map<string, number>();
  let match;

  while ((match = componentRegex.exec(code)) !== null) {
    const componentName = match[1];
    const count = components.get(componentName) || 0;
    components.set(componentName, count + 1);
  }

  for (const [name, count] of components) {
    if (count > 1) {
      errors.push(`Duplicate component definition: ${name} (${count} times)`);
    }
  }

  // 2. Check for export/import conflicts
  const importNames = new Set<string>();
  const importRegex = /import\s*\{\s*([^}]+)\s*\}/g;
  
  while ((match = importRegex.exec(code)) !== null) {
    const imports = match[1].split(',').map(imp => imp.trim());
    imports.forEach(imp => importNames.add(imp));
  }

  // Check if any exports conflict with imports
  for (const [exportName] of exportMap) {
    if (importNames.has(exportName)) {
      errors.push(`Export "${exportName}" conflicts with import - rename one of them`);
    }
  }

  // 3. Fix the most common case: VideoComposition declared multiple times
  const videoCompositionMatches = code.match(/export.*VideoComposition/g);
  if (code.includes('export const VideoComposition') && 
      videoCompositionMatches && videoCompositionMatches.length > 1) {
    
    correctedCode = removeCompleteVideoCompositionBlocks(code);
    errors.push(`Fixed: Removed duplicate VideoComposition blocks with complete code removal`);
  }

  return {
    isValid: errors.length === 0,
    correctedCode: errors.length > 0 ? correctedCode : undefined,
    errors
  };
}

/**
 * Remove complete VideoComposition blocks including all code between braces
 * This prevents orphaned closing braces that cause ESBuild "Unexpected '}'" errors
 */
function removeCompleteVideoCompositionBlocks(code: string): string {
  const lines = code.split('\n');
  const toRemove: number[] = [];
  
  // Find all VideoComposition export declarations
  const exportLines: Array<{ line: number; isFunction: boolean }> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for function-style export
    if (/export\s+const\s+VideoComposition.*=.*\(\)\s*=>\s*{/.test(line) || 
        /export\s+const\s+VideoComposition.*=.*\(\)\s*{/.test(line)) {
      exportLines.push({ line: i, isFunction: true });
    }
    // Check for assignment-style export  
    else if (/export\s+const\s+VideoComposition.*=\s*\w+;?/.test(line)) {
      exportLines.push({ line: i, isFunction: false });
    }
  }
  
  if (exportLines.length <= 1) {
    return code; // No duplicates found
  }
  
  // Remove all but the last export (keep the most complete one)
  for (let i = 0; i < exportLines.length - 1; i++) {
    const exportInfo = exportLines[i];
    
    if (exportInfo.isFunction) {
      // Find the complete function block
      const startLine = exportInfo.line;
      let braceCount = 0;
      let endLine = startLine;
      let foundOpenBrace = false;
      
      // Count braces to find the end of the function
      for (let j = startLine; j < lines.length; j++) {
        const currentLine = lines[j];
        
        for (const char of currentLine) {
          if (char === '{') {
            braceCount++;
            foundOpenBrace = true;
          } else if (char === '}') {
            braceCount--;
          }
        }
        
        // Found the end of the function block
        if (foundOpenBrace && braceCount === 0) {
          endLine = j;
          break;
        }
      }
      
      // Mark all lines in this block for removal
      for (let k = startLine; k <= endLine; k++) {
        toRemove.push(k);
      }
    } else {
      // Simple assignment - just remove this line
      toRemove.push(exportInfo.line);
    }
  }
  
  // Remove marked lines by replacing with empty lines (preserve line numbers)
  const result = lines.map((line, index) => {
    if (toRemove.includes(index)) {
      return ''; // Empty line instead of comment to clean up
    }
    return line;
  });
  
  // Clean up multiple empty lines
  const cleanedResult = result.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return cleanedResult;
}

const exportMap = new Map<string, Array<{ line: number; fullExport: string }>>();