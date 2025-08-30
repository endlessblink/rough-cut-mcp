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
 * Map of functions/components to their required imports
 */
const REMOTION_IMPORT_MAP = new Map([
  // Core Remotion
  ['useCurrentFrame', 'remotion'],
  ['useVideoConfig', 'remotion'],
  ['AbsoluteFill', 'remotion'],
  ['Sequence', 'remotion'],
  ['interpolate', 'remotion'],
  ['interpolateColors', 'remotion'],
  ['Composition', 'remotion'],
  ['registerRoot', 'remotion'],
  
  // Media components
  ['Audio', 'remotion'],
  ['Video', 'remotion'], 
  ['Img', 'remotion'],
  ['OffthreadVideo', 'remotion'],
  
  // Advanced functions
  ['spring', 'remotion'],
  ['staticFile', 'remotion'],
  ['delayRender', 'remotion'],
  ['continueRender', 'remotion'],
  ['cancelRender', 'remotion'],
  
  // Easing
  ['Easing', 'remotion'],
  
  // Specialized packages
  ['Lottie', '@remotion/lottie'],
  ['LottieAnimationData', '@remotion/lottie'],
  ['Player', '@remotion/player'],
  ['PlayerRef', '@remotion/player'],
  ['getLength', '@remotion/paths'],
  ['getPointAtLength', '@remotion/paths'],
  ['getSubpaths', '@remotion/paths'],
  ['getTangentAtLength', '@remotion/paths'],
  ['Trail', '@remotion/motion-blur'],
  ['zColor', '@remotion/zod-types'],
  
  // Config (special case)
  ['Config', '@remotion/cli/config']
]);

/**
 * Validates that all used functions have proper imports
 */
export function validateImports(code: string): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingImports: string[] = [];
  let correctedCode = code;

  // Find all import statements
  const existingImports = new Map<string, Set<string>>();
  const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"];?/g;
  let importMatch;

  while ((importMatch = importRegex.exec(code)) !== null) {
    const imports = importMatch[1].split(',').map(imp => imp.trim());
    const packageName = importMatch[2];
    
    if (!existingImports.has(packageName)) {
      existingImports.set(packageName, new Set());
    }
    
    imports.forEach(imp => existingImports.get(packageName)!.add(imp));
  }

  // Check for usage of functions without imports
  for (const [functionName, packageName] of REMOTION_IMPORT_MAP) {
    const functionRegex = new RegExp(`\\b${functionName}\\b`, 'g');
    
    if (functionRegex.test(code)) {
      // Function is used, check if imported
      const packageImports = existingImports.get(packageName);
      
      if (!packageImports || !packageImports.has(functionName)) {
        missingImports.push(`${functionName} from '${packageName}'`);
        errors.push(`Missing import: ${functionName} from '${packageName}'`);
      }
    }
  }

  // Add missing imports
  if (missingImports.length > 0) {
    correctedCode = addMissingImports(correctedCode, missingImports, existingImports);
  }

  // 2. Check for deprecated imports (Remotion 4.0)
  const deprecatedImports = [
    { old: "import {Config} from 'remotion'", new: "import {Config} from '@remotion/cli/config'" },
    { old: "import { MotionBlur }", new: "import { Trail } from '@remotion/motion-blur'" },
    { old: "downloadVideo", new: "downloadMedia" },
    { old: "getParts", new: "getSubpaths from '@remotion/paths'" }
  ];

  for (const deprecated of deprecatedImports) {
    if (code.includes(deprecated.old)) {
      errors.push(`Deprecated import: ${deprecated.old} → use ${deprecated.new}`);
      correctedCode = correctedCode.replace(deprecated.old, deprecated.new);
    }
  }

  // 3. Check for React import
  if (!code.includes("import React") && (code.includes('<') || code.includes('React.FC'))) {
    errors.push("Missing React import for JSX");
    correctedCode = `import React from 'react';\n${correctedCode}`;
  }

  // 4. Validate spring function usage
  if (code.includes('spring(') && !code.includes('frame:')) {
    warnings.push("spring() function requires 'frame' parameter");
  }

  // 5. Check for staticFile without proper path
  const staticFileRegex = /staticFile\(['"]([^'"]*)['"]\)/g;
  let staticFileMatch;
  
  while ((staticFileMatch = staticFileRegex.exec(code)) !== null) {
    const filePath = staticFileMatch[1];
    
    // Check for URI-unsafe characters (Remotion 4.0 auto-encodes these)
    if (/[#%&?]/.test(filePath)) {
      warnings.push(`staticFile path contains URI-unsafe characters: "${filePath}" (will be auto-encoded)`);
    }
    
    // Check for absolute paths (should be relative)
    if (filePath.startsWith('/') && !filePath.startsWith('/public')) {
      warnings.push(`staticFile should use relative paths: "${filePath}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    correctedCode: errors.length > 0 ? correctedCode : undefined,
    errors,
    warnings,
    missingImports
  };
}

/**
 * Add missing imports to the code
 */
function addMissingImports(
  code: string, 
  missingImports: string[], 
  existingImports: Map<string, Set<string>>
): string {
  // Group missing imports by package
  const importsByPackage = new Map<string, string[]>();
  
  for (const importStr of missingImports) {
    const [functionName, , packageName] = importStr.split(' ');
    
    if (!importsByPackage.has(packageName.replace(/'/g, ''))) {
      importsByPackage.set(packageName.replace(/'/g, ''), []);
    }
    
    importsByPackage.get(packageName.replace(/'/g, ''))!.push(functionName);
  }

  let processedCode = code;

  // Add imports for each package
  for (const [packageName, functions] of importsByPackage) {
    const existingPackageImports = existingImports.get(packageName);
    
    if (existingPackageImports) {
      // Extend existing import
      const existingImportRegex = new RegExp(
        `import\\s*\\{\\s*([^}]+)\\s*\\}\\s*from\\s*['"]${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`,
        'g'
      );
      
      processedCode = processedCode.replace(existingImportRegex, (match, imports) => {
        const currentImports = imports.split(',').map((imp: string) => imp.trim());
        const newImports = [...new Set([...currentImports, ...functions])];
        return match.replace(imports, newImports.join(', '));
      });
    } else {
      // Add new import
      const newImport = `import { ${functions.join(', ')} } from '${packageName}';\n`;
      
      // Insert after existing imports or at the top
      const lastImportMatch = [...processedCode.matchAll(/import[^;]+;/g)].pop();
      
      if (lastImportMatch) {
        const insertPos = lastImportMatch.index! + lastImportMatch[0].length + 1;
        processedCode = processedCode.slice(0, insertPos) + newImport + processedCode.slice(insertPos);
      } else {
        processedCode = newImport + processedCode;
      }
    }
  }

  return processedCode;
}

/**
 * Process code to fix import and JSX syntax issues
 */
export function processImportsAndSyntax(code: string): string {
  const validation = validateImports(code);
  
  if (validation.correctedCode) {
    // Also fix JSX syntax issues
    return processJSXSyntax(validation.correctedCode);
  }
  
  return processJSXSyntax(code);
}

/**
 * Validate Composition component usage (Remotion 4.0 requirements)
 */
export function validateCompositionUsage(code: string): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Check for Composition without required props
  const compositionRegex = /<Composition[^>]*>/g;
  let compositionMatch;

  while ((compositionMatch = compositionRegex.exec(code)) !== null) {
    const compositionTag = compositionMatch[0];
    
    // Required props for Composition
    const requiredProps = ['id', 'component', 'durationInFrames', 'fps', 'width', 'height'];
    
    for (const prop of requiredProps) {
      if (!compositionTag.includes(`${prop}=`)) {
        errors.push(`Composition missing required prop: ${prop}`);
      }
    }
    
    // Check for defaultProps if component has props
    if (compositionTag.includes('component=') && !compositionTag.includes('defaultProps=')) {
      suggestions.push("Consider adding defaultProps if your component accepts props (required in Remotion 4.0)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}