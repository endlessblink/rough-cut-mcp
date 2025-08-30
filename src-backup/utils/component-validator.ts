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
 * Required imports for basic Remotion functionality
 */
const REQUIRED_REMOTION_IMPORTS = {
  'React': 'react',
  'AbsoluteFill': 'remotion',
  'useCurrentFrame': 'remotion',
  'useVideoConfig': 'remotion'
};

/**
 * Optional but commonly needed imports
 */
const COMMON_REMOTION_IMPORTS = {
  'Sequence': 'remotion',
  'interpolate': 'remotion',
  'interpolateColors': 'remotion',
  'Easing': 'remotion',
  'Audio': 'remotion',
  'Img': 'remotion',
  'Video': 'remotion'
};

/**
 * Validates the complete structure of a Remotion component
 */
export function validateComponentStructure(code: string): ComponentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let correctedCode = code;

  // 1. Check for React import
  if (!code.includes("import React")) {
    errors.push("Missing React import");
    correctedCode = `import React from 'react';\n${correctedCode}`;
  }

  // 2. Check for basic Remotion imports
  const missingImports: string[] = [];
  
  // Check for useCurrentFrame usage without import
  if (code.includes('useCurrentFrame') && !code.includes('useCurrentFrame')) {
    missingImports.push('useCurrentFrame');
  }
  
  // Check for useVideoConfig usage without import
  if (code.includes('useVideoConfig') && !code.includes('useVideoConfig')) {
    missingImports.push('useVideoConfig');
  }

  // Check for AbsoluteFill usage without import
  if (code.includes('<AbsoluteFill') && !code.includes('AbsoluteFill')) {
    missingImports.push('AbsoluteFill');
  }

  // 3. Check for proper component export
  if (!code.includes('export const VideoComposition')) {
    errors.push("Missing VideoComposition export");
  }

  // 4. Check for registerRoot in index.ts pattern
  const hasRegisterRoot = code.includes('registerRoot');
  const hasVideoComposition = code.includes('VideoComposition');
  
  if (!hasRegisterRoot && hasVideoComposition) {
    warnings.push("Component file should be paired with index.ts containing registerRoot()");
  }

  // 5. Validate Sequence timing
  const sequenceRegex = /<Sequence[^>]*from={([^}]+)}[^>]*durationInFrames={([^}]+)}/g;
  let sequenceMatch;
  
  while ((sequenceMatch = sequenceRegex.exec(code)) !== null) {
    const fromValue = sequenceMatch[1].trim();
    const durationValue = sequenceMatch[2].trim();
    
    // Check for negative values
    if (fromValue.startsWith('-')) {
      errors.push(`Sequence 'from' cannot be negative: ${fromValue}`);
    }
    
    if (durationValue.startsWith('-')) {
      errors.push(`Sequence 'durationInFrames' cannot be negative: ${durationValue}`);
    }
    
    // Check for zero duration
    if (durationValue === '0') {
      warnings.push(`Sequence with zero duration will not be visible: ${durationValue}`);
    }
  }

  // 6. Check for proper hook usage (inside component only)
  const useHookRegex = /const.*=.*use(CurrentFrame|VideoConfig)/g;
  const componentStart = code.indexOf('const VideoComposition') || code.indexOf('export const VideoComposition');
  
  if (componentStart > -1) {
    let hookMatch;
    while ((hookMatch = useHookRegex.exec(code)) !== null) {
      if (hookMatch.index < componentStart) {
        errors.push(`React hooks must be called inside component: ${hookMatch[0]}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    correctedCode: errors.length > 0 ? correctedCode : undefined,
    errors,
    warnings
  };
}

/**
 * Process video code to fix component structure issues
 */
export function processComponentStructure(code: string): string {
  const validation = validateComponentStructure(code);
  
  if (validation.correctedCode) {
    return validation.correctedCode;
  }
  
  return code;
}

/**
 * Generate safe index.ts content for any project
 */
export function generateSafeIndexTs(): string {
  return `import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
`;
}

/**
 * Generate safe Root.tsx content for any project
 */
export function generateSafeRootTsx(options: {
  compositionId?: string;
  fps?: number;
  durationInFrames?: number;
  width?: number;
  height?: number;
} = {}): string {
  const {
    compositionId = 'VideoComposition',
    fps = 30,
    durationInFrames = 240,
    width = 1920,
    height = 1080
  } = options;

  return `import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="${compositionId}"
        component={VideoComposition}
        durationInFrames={${durationInFrames}}
        fps={${fps}}
        width={${width}}
        height={${height}}
      />
    </>
  );
};
`;
}

/**
 * Validate that all required files exist for a Remotion project
 */
export function validateProjectStructure(projectPath: string): {
  valid: boolean;
  missingFiles: string[];
  requiredFiles: string[];
} {
  const requiredFiles = [
    'src/index.ts',
    'src/Root.tsx', 
    'src/VideoComposition.tsx',
    'package.json',
    'remotion.config.ts'
  ];
  
  const missingFiles: string[] = [];
  
  // This would be implemented with fs.pathExists checks
  // For now, return the structure for validation logic
  
  return {
    valid: missingFiles.length === 0,
    missingFiles,
    requiredFiles
  };
}