// Composition template utilities for generating common animation patterns
// These are helper functions that generate code - NOT hardcoded project references!

import * as t from '@babel/types';
import { getLogger } from './logger.js';

const logger = getLogger().service('CompositionTemplates');

/**
 * Template generators for common Remotion animation patterns
 * These generate code snippets dynamically - never reference specific projects
 */

export interface AnimationTemplate {
  name: string;
  description: string;
  generateCode: (params?: any) => string;
  generateAST?: (params?: any) => t.JSXElement;
}

/**
 * Generate a text element with animation
 */
export function generateTextElement(params: {
  text: string;
  fontSize?: number;
  color?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  position?: { x: string | number; y: string | number };
}): string {
  const { text, fontSize = 32, color = '#FFFFFF', animation = 'fade', position } = params;
  
  let animationCode = '';
  if (animation === 'fade') {
    animationCode = `opacity: interpolate(frame, [0, 30], [0, 1])`;
  } else if (animation === 'slide') {
    animationCode = `transform: \`translateX(\${interpolate(frame, [0, 30], [-100, 0])}px)\``;
  } else if (animation === 'scale') {
    animationCode = `transform: \`scale(\${interpolate(frame, [0, 30], [0, 1])})\``;
  }

  return `
    <div style={{
      fontSize: ${fontSize},
      color: '${color}',
      position: 'absolute',
      left: '${position?.x || '50%'}',
      top: '${position?.y || '50%'}',
      transform: 'translate(-50%, -50%)',
      ${animationCode}
    }}>
      ${text}
    </div>
  `.trim();
}

/**
 * Generate a shape element (circle, square, etc.)
 */
export function generateShapeElement(params: {
  shape: 'circle' | 'square' | 'rectangle';
  size?: { width: number; height: number };
  color?: string;
  animation?: 'rotate' | 'pulse' | 'bounce' | 'none';
}): string {
  const { shape, size = { width: 100, height: 100 }, color = '#FF6B6B', animation = 'none' } = params;
  
  const borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '0' : '10px';
  
  let animationCode = '';
  if (animation === 'rotate') {
    animationCode = `transform: \`rotate(\${frame * 2}deg)\``;
  } else if (animation === 'pulse') {
    animationCode = `transform: \`scale(\${1 + Math.sin(frame * 0.1) * 0.2})\``;
  } else if (animation === 'bounce') {
    animationCode = `transform: \`translateY(\${Math.sin(frame * 0.1) * 20}px)\``;
  }

  return `
    <div style={{
      width: ${size.width},
      height: ${size.height},
      backgroundColor: '${color}',
      borderRadius: '${borderRadius}',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      ${animationCode}
    }} />
  `.trim();
}

/**
 * Generate an image element with effects
 */
export function generateImageElement(params: {
  src: string;
  width?: number;
  height?: number;
  effect?: 'fade' | 'zoom' | 'slide' | 'none';
}): string {
  const { src, width = 'auto', height = 'auto', effect = 'fade' } = params;
  
  let effectCode = '';
  if (effect === 'fade') {
    effectCode = `opacity: interpolate(frame, [0, 30], [0, 1])`;
  } else if (effect === 'zoom') {
    effectCode = `transform: \`scale(\${interpolate(frame, [0, 60], [0.8, 1])})\``;
  } else if (effect === 'slide') {
    effectCode = `transform: \`translateX(\${interpolate(frame, [0, 30], [100, 0])}%)\``;
  }

  return `
    <img 
      src="${src}"
      style={{
        width: ${typeof width === 'number' ? width : `'${width}'`},
        height: ${typeof height === 'number' ? height : `'${height}'`},
        objectFit: 'cover',
        ${effectCode}
      }}
    />
  `.trim();
}

/**
 * Generate a moving element along a path
 */
export function generateMovingElement(params: {
  elementType: 'div' | 'img';
  path: 'linear' | 'circular' | 'sine';
  speed?: number;
  content?: string;
}): string {
  const { elementType, path, speed = 1, content = '' } = params;
  
  let positionCode = '';
  if (path === 'linear') {
    positionCode = `
      left: \`\${interpolate(frame * ${speed}, [0, 150], [0, 100])}%\`,
      top: '50%'
    `;
  } else if (path === 'circular') {
    positionCode = `
      left: \`\${50 + Math.cos(frame * 0.05 * ${speed}) * 30}%\`,
      top: \`\${50 + Math.sin(frame * 0.05 * ${speed}) * 30}%\`
    `;
  } else if (path === 'sine') {
    positionCode = `
      left: \`\${interpolate(frame * ${speed}, [0, 150], [0, 100])}%\`,
      top: \`\${50 + Math.sin(frame * 0.1 * ${speed}) * 20}%\`
    `;
  }

  if (elementType === 'img') {
    return `
      <img 
        src="${content}"
        style={{
          position: 'absolute',
          ${positionCode},
          transform: 'translate(-50%, -50%)',
          width: 100,
          height: 100
        }}
      />
    `.trim();
  }

  return `
    <div style={{
      position: 'absolute',
      ${positionCode},
      transform: 'translate(-50%, -50%)',
      width: 100,
      height: 100,
      backgroundColor: '#4ECDC4',
      borderRadius: '10px'
    }}>
      ${content}
    </div>
  `.trim();
}

/**
 * Generate particle system background
 */
export function generateParticleSystem(params: {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}): string {
  const { count = 20, color = 'rgba(255,255,255,0.5)', size = 4, speed = 0.5 } = params;
  
  return `
    {Array.from({ length: ${count} }, (_, i) => {
      const x = (i * 137.5) % 100; // Golden ratio distribution
      const y = (i * 23.6) % 100;
      const animX = (x + frame * ${speed} * (0.5 + (i % 3) * 0.2)) % 100;
      
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: \`\${animX}%\`,
            top: \`\${y}%\`,
            width: ${size},
            height: ${size},
            backgroundColor: '${color}',
            borderRadius: '50%',
            opacity: 0.3 + Math.sin(frame * 0.05 + i) * 0.3
          }}
        />
      );
    })}
  `.trim();
}

/**
 * Generate a sequence of elements with staggered animation
 */
export function generateStaggeredElements(params: {
  count?: number;
  elementCode: string;
  staggerDelay?: number;
  arrangement?: 'horizontal' | 'vertical' | 'grid';
}): string {
  const { count = 5, elementCode, staggerDelay = 5, arrangement = 'horizontal' } = params;
  
  let positioningCode = '';
  if (arrangement === 'horizontal') {
    positioningCode = 'left: `${(i + 1) * (100 / (count + 1))}%`, top: "50%"';
  } else if (arrangement === 'vertical') {
    positioningCode = 'left: "50%", top: `${(i + 1) * (100 / (count + 1))}%`';
  } else if (arrangement === 'grid') {
    positioningCode = 'left: `${((i % 3) + 1) * 25}%`, top: `${(Math.floor(i / 3) + 1) * 25}%`';
  }

  return `
    {Array.from({ length: ${count} }, (_, i) => {
      const delay = i * ${staggerDelay};
      const opacity = interpolate(
        frame,
        [delay, delay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            ${positioningCode},
            transform: 'translate(-50%, -50%)',
            opacity
          }}
        >
          ${elementCode}
        </div>
      );
    })}
  `.trim();
}

/**
 * Generate transition effects between scenes
 */
export function generateTransition(params: {
  type: 'fade' | 'wipe' | 'slide' | 'zoom';
  duration?: number;
  startFrame?: number;
}): string {
  const { type, duration = 30, startFrame = 0 } = params;
  
  if (type === 'fade') {
    return `
      opacity: interpolate(
        frame,
        [${startFrame}, ${startFrame + duration}],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    `.trim();
  } else if (type === 'wipe') {
    return `
      clipPath: \`inset(0 \${interpolate(
        frame,
        [${startFrame}, ${startFrame + duration}],
        [100, 0]
      )}% 0 0)\`
    `.trim();
  } else if (type === 'slide') {
    return `
      transform: \`translateX(\${interpolate(
        frame,
        [${startFrame}, ${startFrame + duration}],
        [-100, 0]
      )}%)\`
    `.trim();
  } else if (type === 'zoom') {
    return `
      transform: \`scale(\${interpolate(
        frame,
        [${startFrame}, ${startFrame + duration}],
        [0, 1]
      )})\`
    `.trim();
  }
  
  return '';
}

/**
 * Collection of ready-to-use animation templates
 */
export const animationTemplates: AnimationTemplate[] = [
  {
    name: 'fadeInText',
    description: 'Text that fades in',
    generateCode: (params) => generateTextElement({ ...params, animation: 'fade' }),
  },
  {
    name: 'slidingText',
    description: 'Text that slides in from the side',
    generateCode: (params) => generateTextElement({ ...params, animation: 'slide' }),
  },
  {
    name: 'rotatingShape',
    description: 'Shape that rotates continuously',
    generateCode: (params) => generateShapeElement({ ...params, animation: 'rotate' }),
  },
  {
    name: 'bouncingBall',
    description: 'Circle that bounces up and down',
    generateCode: (params) => generateShapeElement({ 
      shape: 'circle', 
      animation: 'bounce',
      ...params 
    }),
  },
  {
    name: 'linearMotion',
    description: 'Element moving in a straight line',
    generateCode: (params) => generateMovingElement({ 
      path: 'linear',
      ...params 
    }),
  },
  {
    name: 'particleBackground',
    description: 'Animated particle system background',
    generateCode: (params) => generateParticleSystem(params),
  },
];

/**
 * Get a template by name
 */
export function getTemplate(name: string): AnimationTemplate | undefined {
  return animationTemplates.find(t => t.name === name);
}

/**
 * Generate code from a template
 */
export function generateFromTemplate(templateName: string, params?: any): string {
  const template = getTemplate(templateName);
  if (!template) {
    logger.warn(`Template "${templateName}" not found`);
    return '';
  }
  
  try {
    return template.generateCode(params);
  } catch (error) {
    logger.error(`Error generating code from template "${templateName}":`, error);
    return '';
  }
}

/**
 * Analyze composition code to detect scene patterns and structure
 */
export interface SceneAnalysis {
  hasMultipleScenes: boolean;
  sceneCount: number;
  usesSeries: boolean;
  usesConditionalRendering: boolean;
  detectedScenes: SceneInfo[];
  needsTransformation: boolean;
  recommendedStructure: 'single' | 'series' | 'sequence';
}

export interface SceneInfo {
  name: string;
  startFrame?: number;
  endFrame?: number;
  duration?: number;
  condition?: string;
  content: string;
}

/**
 * Analyze provided composition code structure
 */
export function analyzeCompositionStructure(code: string): SceneAnalysis {
  logger.debug('Analyzing composition structure');
  
  const analysis: SceneAnalysis = {
    hasMultipleScenes: false,
    sceneCount: 0,
    usesSeries: false,
    usesConditionalRendering: false,
    detectedScenes: [],
    needsTransformation: false,
    recommendedStructure: 'single'
  };

  // Check for Series usage
  analysis.usesSeries = /import.*Series.*from.*remotion|<Series[>\s]|Series\.Sequence/.test(code);
  
  // Check for conditional rendering patterns
  const conditionalPatterns = [
    /\{frame\s*<\s*(\d+)\s*&&\s*<(\w+)/g,  // {frame < 120 && <Scene1
    /\{frame\s*>=\s*(\d+)\s*&&\s*<(\w+)/g, // {frame >= 120 && <Scene2
    /frame\s*-\s*(\d+)/g,                    // frame - 120 (scene offset)
    /const\s+(\w+Frame)\s*=\s*frame\s*-\s*(\d+)/g // const scene2Frame = frame - 120
  ];

  conditionalPatterns.forEach(pattern => {
    const matches = Array.from(code.matchAll(pattern));
    if (matches.length > 0) {
      analysis.usesConditionalRendering = true;
      analysis.sceneCount += matches.length;
    }
  });

  // Detect scene components
  const sceneMatches = Array.from(code.matchAll(/const\s+Scene(\d+)[:\s=]/g));
  const sceneComponents = Array.from(code.matchAll(/<Scene(\d+)\s*\/>/g));
  
  if (sceneMatches.length > 0 || sceneComponents.length > 0) {
    analysis.hasMultipleScenes = true;
    analysis.sceneCount = Math.max(sceneMatches.length, sceneComponents.length, analysis.sceneCount);
  }

  // Extract specific scene information
  const frameConditions = Array.from(code.matchAll(/\{frame\s*([<>=]+)\s*(\d+)\s*&&\s*<(\w+)/g));
  frameConditions.forEach(([fullMatch, operator, frameNum, componentName]) => {
    analysis.detectedScenes.push({
      name: componentName,
      startFrame: operator.includes('<') ? 0 : parseInt(frameNum),
      condition: fullMatch,
      content: componentName
    });
  });

  // Determine if transformation is needed
  analysis.needsTransformation = analysis.usesConditionalRendering && !analysis.usesSeries;
  
  // Recommend structure
  if (analysis.sceneCount > 1) {
    analysis.recommendedStructure = analysis.usesSeries ? 'series' : 'series';
  } else if (analysis.sceneCount === 1) {
    analysis.recommendedStructure = 'sequence';
  }

  logger.debug('Composition analysis complete', {
    sceneCount: analysis.sceneCount,
    usesSeries: analysis.usesSeries,
    usesConditionalRendering: analysis.usesConditionalRendering,
    needsTransformation: analysis.needsTransformation
  });

  return analysis;
}

/**
 * Transform conditional rendering to Series-based structure
 */
export function transformToSeriesStructure(code: string, analysis: SceneAnalysis): string {
  if (!analysis.needsTransformation) {
    logger.debug('No transformation needed');
    return code;
  }

  logger.info('Transforming composition to use Series structure');

  // Extract scene components from the code
  const sceneComponents = extractSceneComponents(code);
  
  // Generate new Series-based structure
  const seriesStructure = generateSeriesFromScenes(sceneComponents);
  
  // Replace the conditional rendering with Series structure
  let transformedCode = code;
  
  // Remove conditional rendering patterns
  transformedCode = transformedCode.replace(
    /\{frame\s*[<>=]+\s*\d+\s*&&\s*<\w+[^}]*\}/g,
    ''
  );

  // Add Series import if not present
  if (!transformedCode.includes('Series')) {
    transformedCode = transformedCode.replace(
      /import\s*{([^}]*)}\s*from\s*['"]remotion['"];/,
      (match, imports) => {
        const cleanImports = imports.trim();
        return `import { ${cleanImports}, Series } from 'remotion';`;
      }
    );
  }

  // Replace the main return statement with Series structure
  const returnStatementRegex = /return\s*\(\s*<AbsoluteFill[^>]*>[\s\S]*?<\/AbsoluteFill>\s*\)/;
  if (returnStatementRegex.test(transformedCode)) {
    transformedCode = transformedCode.replace(
      returnStatementRegex,
      `return (
    ${seriesStructure}
  )`
    );
  }

  // Clean up frame offset calculations in scene components
  transformedCode = cleanUpFrameOffsets(transformedCode);

  logger.info('Transformation complete');
  return transformedCode;
}

/**
 * Extract scene components from composition code
 */
function extractSceneComponents(code: string): SceneInfo[] {
  const scenes: SceneInfo[] = [];
  
  // Find conditional rendering patterns with frame ranges
  const patterns = [
    /\{frame\s*<\s*(\d+)\s*&&\s*<(\w+)[^}]*\}/g,
    /\{frame\s*>=\s*(\d+)\s*&&\s*frame\s*<\s*(\d+)\s*&&\s*<(\w+)[^}]*\}/g,
    /\{frame\s*>=\s*(\d+)\s*&&\s*<(\w+)[^}]*\}/g
  ];

  patterns.forEach(pattern => {
    const matches = Array.from(code.matchAll(pattern));
    matches.forEach(match => {
      if (match.length === 3) {
        // Pattern: frame < X && Component
        scenes.push({
          name: match[2],
          startFrame: 0,
          endFrame: parseInt(match[1]),
          duration: parseInt(match[1]),
          condition: match[0],
          content: match[2]
        });
      } else if (match.length === 4) {
        // Pattern: frame >= X && Component
        scenes.push({
          name: match[2],
          startFrame: parseInt(match[1]),
          duration: 90, // Default duration, will be calculated properly
          condition: match[0],
          content: match[2]
        });
      }
    });
  });

  // If we found scenes with frame conditions, calculate durations
  if (scenes.length > 1) {
    for (let i = 0; i < scenes.length - 1; i++) {
      if (scenes[i].endFrame && scenes[i + 1].startFrame) {
        scenes[i].duration = scenes[i + 1].startFrame! - scenes[i].startFrame!;
      }
    }
  }

  return scenes;
}

/**
 * Generate Series structure from detected scenes
 */
function generateSeriesFromScenes(scenes: SceneInfo[]): string {
  if (scenes.length === 0) {
    return '<AbsoluteFill>No scenes detected</AbsoluteFill>';
  }

  const sequences = scenes.map(scene => 
    `      <Series.Sequence durationInFrames={${scene.duration || 90}}>
        <${scene.name} />
      </Series.Sequence>`
  ).join('\n');

  return `<Series>
${sequences}
    </Series>`;
}

/**
 * Clean up frame offset calculations in scene components
 */
function cleanUpFrameOffsets(code: string): string {
  // Remove frame offset calculations like "const scene2Frame = frame - 120"
  let cleaned = code.replace(/const\s+\w+Frame\s*=\s*frame\s*-\s*\d+;?\s*/g, '');
  
  // Replace scene frame variables with direct frame usage
  cleaned = cleaned.replace(/scene\d+Frame/g, 'frame');
  
  // Remove conditional checks inside scenes like "if (scene2Frame < 0) return null;"
  cleaned = cleaned.replace(/if\s*\([^)]*frame[^)]*<\s*0\s*\)\s*return\s*null;?\s*/g, '');
  
  return cleaned;
}

/**
 * Generate a complete Series-based composition template
 */
export function generateSeriesComposition(params: {
  scenes: Array<{
    name: string;
    duration: number;
    content: string;
  }>;
  totalDuration: number;
  fps: number;
}): string {
  const { scenes, fps } = params;
  
  const sceneComponents = scenes.map(scene => `
const ${scene.name}: React.FC = () => {
  const frame = useCurrentFrame();
  
  ${scene.content || `// ${scene.name} content here`}
  
  return (
    <AbsoluteFill>
      {/* ${scene.name} animations and content */}
    </AbsoluteFill>
  );
};`).join('\n');

  const seriesSequences = scenes.map(scene => 
    `      <Series.Sequence durationInFrames={${scene.duration}}>
        <${scene.name} />
      </Series.Sequence>`
  ).join('\n');

  return `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Series } from 'remotion';

export const VideoComposition: React.FC = () => {
  return (
    <Series>
${seriesSequences}
    </Series>
  );
};

${sceneComponents}`;
}