// Creative Pattern Library - Based on Successful GitHub_4 Analysis
// Extracts proven patterns that actually work, not theoretical "best practices"

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

// Proven patterns extracted from successful github_4 project
interface ProvenPattern {
  name: string;
  description: string;
  whenToUse: string;
  implementation: string;
  example: string;
  scaleImpact: 'low' | 'medium' | 'high' | 'dramatic';
}

interface ContentEnrichment {
  backgroundSystems: BackgroundPattern[];
  scaleEnhancements: ScalePattern[];
  motionPatterns: MotionPattern[];
  layoutImprovements: LayoutPattern[];
}

interface BackgroundPattern {
  type: 'animated-code' | 'particle-system' | 'geometric-shapes' | 'data-visualization';
  complexity: 'simple' | 'moderate' | 'rich';
  implementation: string;
  visualImpact: number; // 1-10 scale
}

interface ScalePattern {
  element: 'title' | 'subtitle' | 'card' | 'container';
  currentSize: string;
  suggestedSize: string;
  reasoning: string;
  impactLevel: number;
}

interface MotionPattern {
  type: 'continuous' | 'entrance' | 'staggered' | 'micro-interaction';
  frameRange: [number, number];
  easing: string;
  purpose: string;
}

interface LayoutPattern {
  pattern: 'full-width' | 'centered-large' | 'grid-system' | 'layered-depth';
  dimensions: { width: string; height?: string };
  spacing: string;
  reasoning: string;
}

// PROVEN PATTERNS FROM GITHUB_4 SUCCESS
const PROVEN_PATTERNS: ProvenPattern[] = [
  {
    name: "Rich Animated Background",
    description: "Never use empty/static backgrounds - always have animated content",
    whenToUse: "When background feels empty or boring",
    implementation: "Animated code scrolling, particle systems, or data visualizations",
    example: "18 lines of code scrolling continuously with typing animations",
    scaleImpact: "high"
  },
  {
    name: "Big Bold Typography",
    description: "Use 64px+ for main titles, not 40-56px",
    whenToUse: "When titles feel small or lack presence", 
    implementation: "fontSize: '64px' minimum for main titles, '84px' for hero text",
    example: "GitHub_4 uses 64-84px titles that command attention",
    scaleImpact: "dramatic"
  },
  {
    name: "Wide Layout Containers",
    description: "Use 650-900px containers, not 300-400px narrow cards",
    whenToUse: "When elements feel cramped or insignificant",
    implementation: "maxWidth: '650px' for cards, '900px' for main containers",
    example: "GitHub_4 contribution graph uses 900px width for impact",
    scaleImpact: "high"
  },
  {
    name: "Continuous Micro-Motion",
    description: "Always have subtle movement - floating, rotating, pulsing",
    whenToUse: "When animation feels static between main sequences",
    implementation: "Math.sin(frame * 0.01-0.03) for gentle floating effects",
    example: "27 continuous animations in GitHub_4 keep it alive",
    scaleImpact: "medium"
  },
  {
    name: "Staggered Sequential Animation",
    description: "Animate many small elements with delays for building excitement",
    whenToUse: "When you have lists, grids, or multiple similar elements",
    implementation: "index * 25 frame delays for 371 contribution squares",
    example: "Each GitHub contribution square animates individually",
    scaleImpact: "high"
  },
  {
    name: "Meaningful Data Integration",
    description: "Use real numbers and data that tell a story",
    whenToUse: "When content feels generic or placeholder-like",
    implementation: "693 contributions, actual project counts, real metrics",
    example: "GitHub_4 shows actual contribution history",
    scaleImpact: "dramatic"
  },
  {
    name: "Visual Depth Layers",
    description: "Multiple visual systems working together",
    whenToUse: "When video feels flat or one-dimensional",
    implementation: "Background + foreground + interactive + data layers",
    example: "9 AbsoluteFill layers creating depth in GitHub_4",
    scaleImpact: "high"
  },
  {
    name: "Professional Motion Curves",
    description: "Use Easing.out(Easing.cubic) for smooth, premium feel",
    whenToUse: "When animations feel robotic or amateur",
    implementation: "easing: Easing.out(Easing.cubic) with extrapolation clamping",
    example: "GitHub_4 uses professional easing throughout",
    scaleImpact: "medium"
  }
];

/**
 * Creative Pattern Library - Suggests improvements based on proven success patterns
 */
export class CreativePatternLibrary {
  
  /**
   * Analyze JSX and suggest improvements based on successful patterns
   */
  analyzeAndSuggestPatterns(jsx: string, projectName: string): {
    currentAnalysis: any;
    suggestions: PatternSuggestion[];
    priorityFixes: PatternSuggestion[];
  } {
    console.error('[PATTERN-LIBRARY] Analyzing JSX for improvement opportunities...');
    
    const analysis = this.analyzeCurrentState(jsx);
    const suggestions = this.generateSuggestions(analysis, jsx);
    const priorityFixes = suggestions.filter(s => s.impact === 'high' || s.impact === 'dramatic');
    
    return {
      currentAnalysis: analysis,
      suggestions,
      priorityFixes
    };
  }
  
  /**
   * Analyze current state vs successful patterns
   */
  private analyzeCurrentState(jsx: string): any {
    const fontSizes = this.extractFontSizes(jsx);
    const containerSizes = this.extractContainerSizes(jsx);
    const animationCount = this.countAnimations(jsx);
    const backgroundComplexity = this.analyzeBackgroundComplexity(jsx);
    const contentRichness = this.analyzeContentRichness(jsx);
    
    return {
      scale: {
        maxFontSize: Math.max(...fontSizes, 0),
        avgFontSize: fontSizes.length > 0 ? fontSizes.reduce((a,b) => a+b) / fontSizes.length : 0,
        maxContainerWidth: Math.max(...containerSizes, 0),
        scaleScore: this.calculateScaleScore(fontSizes, containerSizes)
      },
      motion: {
        totalAnimations: animationCount.total,
        continuousAnimations: animationCount.continuous,
        motionScore: this.calculateMotionScore(animationCount)
      },
      content: {
        backgroundElements: backgroundComplexity,
        dataPoints: contentRichness.dataPoints,
        visualLayers: contentRichness.layers,
        richness: this.calculateContentScore(contentRichness)
      }
    };
  }
  
  /**
   * Generate specific suggestions based on successful patterns
   */
  private generateSuggestions(analysis: any, jsx: string): PatternSuggestion[] {
    const suggestions: PatternSuggestion[] = [];
    
    // Scale suggestions based on GitHub_4 success
    if (analysis.scale.maxFontSize < 60) {
      suggestions.push({
        pattern: "Big Bold Typography",
        issue: `Main title only ${analysis.scale.maxFontSize}px - feels small`,
        suggestion: `Increase to 64-84px like GitHub_4 for dramatic impact`,
        implementation: `fontSize: '64px' // GitHub_4 proven size`,
        impact: 'dramatic',
        priority: 1
      });
    }
    
    if (analysis.scale.maxContainerWidth < 600) {
      suggestions.push({
        pattern: "Wide Layout Containers", 
        issue: `Max width only ${analysis.scale.maxContainerWidth}px - feels cramped`,
        suggestion: `Use 650-900px containers like GitHub_4`,
        implementation: `maxWidth: '650px' // GitHub_4 proven width`,
        impact: 'high',
        priority: 2
      });
    }
    
    // Motion suggestions
    if (analysis.motion.continuousAnimations < 10) {
      suggestions.push({
        pattern: "Continuous Micro-Motion",
        issue: `Only ${analysis.motion.continuousAnimations} continuous animations - feels static`,
        suggestion: `Add gentle floating effects like GitHub_4`,
        implementation: `Math.sin(frame * 0.02) * 3 // Proven gentle motion`,
        impact: 'high',
        priority: 3
      });
    }
    
    // Content richness
    if (analysis.content.backgroundElements < 5) {
      suggestions.push({
        pattern: "Rich Animated Background",
        issue: `Background too simple - lacks visual interest`,
        suggestion: `Add animated background system like GitHub_4's code scrolling`,
        implementation: `Animated code lines, particles, or data visualizations`,
        impact: 'dramatic',
        priority: 1
      });
    }
    
    return suggestions.sort((a, b) => a.priority - b.priority);
  }
  
  private extractFontSizes(jsx: string): number[] {
    const matches = jsx.match(/fontSize:\s*['"`]?(\d+)px?['"`]?/g) || [];
    return matches.map(match => {
      const size = match.match(/(\d+)/);
      return size ? parseInt(size[1]) : 0;
    });
  }
  
  private extractContainerSizes(jsx: string): number[] {
    const widthMatches = jsx.match(/width:\s*['"`]?(\d+)px['"`]?/g) || [];
    const maxWidthMatches = jsx.match(/maxWidth:\s*['"`]?(\d+)px['"`]?/g) || [];
    
    const sizes = [...widthMatches, ...maxWidthMatches].map(match => {
      const size = match.match(/(\d+)/);
      return size ? parseInt(size[1]) : 0;
    });
    
    return sizes.filter(size => size > 100); // Filter out small elements
  }
  
  private countAnimations(jsx: string): { total: number; continuous: number; springs: number; interpolations: number } {
    const springs = (jsx.match(/spring\s*\(/g) || []).length;
    const interpolations = (jsx.match(/interpolate\s*\(/g) || []).length;
    const continuous = (jsx.match(/Math\.(sin|cos)\(/g) || []).length;
    
    return {
      total: springs + interpolations + continuous,
      continuous,
      springs,
      interpolations
    };
  }
  
  private analyzeBackgroundComplexity(jsx: string): number {
    return (jsx.match(/background.*?gradient/g) || []).length +
           (jsx.match(/particle/g) || []).length +
           (jsx.match(/Background.*Component/g) || []).length;
  }
  
  private analyzeContentRichness(jsx: string): { dataPoints: number; layers: number } {
    const dataPoints = (jsx.match(/\d{2,}/g) || []).length; // Numbers with 2+ digits
    const layers = (jsx.match(/<AbsoluteFill/g) || []).length;
    
    return { dataPoints, layers };
  }
  
  private calculateScaleScore(fontSizes: number[], containerSizes: number[]): number {
    const maxFont = Math.max(...fontSizes, 0);
    const maxContainer = Math.max(...containerSizes, 0);
    
    let score = 0;
    if (maxFont >= 64) score += 40;
    else if (maxFont >= 48) score += 25;
    else if (maxFont >= 32) score += 10;
    
    if (maxContainer >= 650) score += 40;
    else if (maxContainer >= 500) score += 25;
    else if (maxContainer >= 350) score += 10;
    
    return Math.min(score, 100);
  }
  
  private calculateMotionScore(animations: any): number {
    let score = 0;
    
    if (animations.continuous > 20) score += 40;
    else if (animations.continuous > 10) score += 25;
    else if (animations.continuous > 5) score += 10;
    
    if (animations.interpolations > 40) score += 40;
    else if (animations.interpolations > 20) score += 25;
    else if (animations.interpolations > 10) score += 10;
    
    return Math.min(score, 100);
  }
  
  private calculateContentScore(content: any): number {
    let score = 0;
    
    if (content.dataPoints > 200) score += 40;
    else if (content.dataPoints > 50) score += 25;
    else if (content.dataPoints > 10) score += 10;
    
    if (content.layers > 7) score += 40;
    else if (content.layers > 4) score += 25;
    else if (content.layers > 2) score += 10;
    
    return Math.min(score, 100);
  }
}

interface PatternSuggestion {
  pattern: string;
  issue: string;
  suggestion: string;
  implementation: string;
  impact: 'low' | 'medium' | 'high' | 'dramatic';
  priority: number;
}

/**
 * Main export for MCP integration
 */
export async function analyzeWithProvenPatterns(jsx: string, projectName: string) {
  const library = new CreativePatternLibrary();
  return library.analyzeAndSuggestPatterns(jsx, projectName);
}

/**
 * Get specific background enhancement based on GitHub_4 success
 */
export function getBackgroundEnhancement(currentJSX: string): {
  shouldEnhance: boolean;
  enhancement: string;
  reasoning: string;
} {
  const hasAnimatedBackground = currentJSX.includes('CodeBackground') || 
                               currentJSX.includes('scrolling') ||
                               currentJSX.length > 20000; // Complex existing system
  
  if (hasAnimatedBackground) {
    return {
      shouldEnhance: false,
      enhancement: '',
      reasoning: 'Background already rich and animated'
    };
  }
  
  // Suggest GitHub_4 style animated background
  const enhancement = `
// Add animated background system (proven from GitHub_4)
const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  
  const elements = [
    'Building amazing projects...',
    'Pushing code to production',
    'Creating innovative solutions',
    'Collaborating with teams',
    'Learning new technologies'
  ];
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {elements.map((text, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 100 + i * 80,
            left: interpolate(frame % 400, [0, 400], [-200, 1920]),
            opacity: interpolate(frame % 400, [0, 50, 300, 400], [0, 0.3, 0.3, 0]),
            color: 'rgba(139, 148, 158, 0.3)',
            fontSize: '18px',
            fontFamily: 'Monaco, monospace'
          }}
        >
          {text}
        </div>
      ))}
    </AbsoluteFill>
  );
};`;
  
  return {
    shouldEnhance: true,
    enhancement,
    reasoning: 'GitHub_4 success pattern: animated backgrounds create visual richness'
  };
}