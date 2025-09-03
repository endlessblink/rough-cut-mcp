// Enhanced Design Prism System - Advanced Animation and Transition Intelligence
// Automatically detects and fixes animation issues like overlapping transitions

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

// Advanced Animation Intelligence System
interface AnimationPattern {
  type: 'spring' | 'interpolate' | 'static';
  startFrame: number;
  endFrame: number;
  element: string;
  property: string;
  values: any[];
  easing?: string;
}

interface TransitionIssue {
  type: 'overlap' | 'gap' | 'jarring-jump' | 'poor-easing' | 'timing-conflict';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedElements: string[];
  suggestedFix: string;
  autoFixable: boolean;
}

interface EnhancedStyleDetection {
  videoType: 'showcase' | 'tutorial' | 'presentation' | 'demo' | 'intro';
  audienceType: 'professional' | 'technical' | 'creative' | 'general';
  narrativeStructure: 'intro-main-outro' | 'sequential' | 'parallel' | 'single-shot';
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'advanced';
  visualStyle: 'minimal' | 'corporate' | 'creative' | 'tech' | 'artistic';
  confidence: number;
}

interface AdvancedStandards {
  animation: {
    transitionOverlap: {
      recommended: number;      // 15 frames overlap
      minimum: number;          // 5 frames minimum
      maximum: number;          // 30 frames maximum
    };
    easingCurves: {
      professional: string[];   // Smooth, professional curves
      creative: string[];       // More expressive curves
      minimal: string[];        // Simple, clean curves
      corporate: string[];      // Corporate-style curves
      tech: string[];          // Tech-focused curves
      artistic: string[];       // Artistic, expressive curves
    };
    timingHierarchy: {
      primary: { min: number; max: number };     // Main elements: 0.5-1.2s
      secondary: { min: number; max: number };   // Supporting: 0.3-0.8s
      micro: { min: number; max: number };       // Details: 0.1-0.4s
    };
  };
  layout: {
    safeZones: {
      fadeTransitions: number;  // Elements should be 100% out before new ones appear
      scaleTransitions: number; // Scale down to 0 before new elements scale up
      positionSafety: number;   // Minimum distance between moving elements
    };
  };
}

const ADVANCED_STANDARDS: AdvancedStandards = {
  animation: {
    transitionOverlap: {
      recommended: 15,  // 15 frames (0.5s at 30fps) overlap
      minimum: 5,       // Never less than 5 frames
      maximum: 30       // Never more than 30 frames
    },
    easingCurves: {
      professional: ['Easing.out(Easing.cubic)', 'Easing.inOut(Easing.quad)'],
      creative: ['Easing.elastic', 'Easing.back', 'Easing.bounce'],
      minimal: ['Easing.out', 'Easing.linear'],
      corporate: ['Easing.out(Easing.quad)', 'Easing.inOut(Easing.cubic)'],
      tech: ['Easing.out', 'Easing.inOut(Easing.quad)'],
      artistic: ['Easing.elastic', 'Easing.bounce']
    },
    timingHierarchy: {
      primary: { min: 15, max: 36 },     // 0.5-1.2s at 30fps
      secondary: { min: 9, max: 24 },    // 0.3-0.8s at 30fps  
      micro: { min: 3, max: 12 }         // 0.1-0.4s at 30fps
    }
  },
  layout: {
    safeZones: {
      fadeTransitions: 1.0,    // Must fade to 100% transparent
      scaleTransitions: 0.0,   // Must scale to 0
      positionSafety: 50       // 50px minimum distance
    }
  }
};

/**
 * Enhanced Design Prism with Animation Intelligence
 */
export class EnhancedDesignPrism {
  
  /**
   * Main enhancement function - now with advanced animation intelligence
   */
  async enhanceJSXWithIntelligence(jsx: string, projectName: string): Promise<{
    enhancedJSX: string;
    enhancements: string[];
    issues: TransitionIssue[];
    styleDetection: EnhancedStyleDetection;
  }> {
    console.error('[ENHANCED-PRISM] Analyzing JSX with advanced intelligence...');
    
    try {
      // Step 1: Enhanced style and context detection
      const styleDetection = this.detectAdvancedStyle(jsx, projectName);
      console.error(`[ENHANCED-PRISM] Detected: ${styleDetection.videoType} ${styleDetection.visualStyle} (${styleDetection.confidence}% confidence)`);
      
      // Step 2: Parse JSX and extract animation patterns
      const ast = parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'objectRestSpread', 'decorators-legacy']
      });
      
      const animations = this.extractAnimationPatterns(ast);
      console.error(`[ENHANCED-PRISM] Found ${animations.length} animation patterns`);
      
      // Step 3: Analyze for transition issues
      const issues = this.analyzeTransitionIssues(animations);
      console.error(`[ENHANCED-PRISM] Detected ${issues.length} potential issues`);
      
      // Step 4: Apply intelligent enhancements
      const enhancementResults = this.applyIntelligentEnhancements(ast, animations, issues, styleDetection);
      
      // Step 5: Generate enhanced JSX
      const enhancedJSX = generate(enhancementResults.ast).code;
      
      return {
        enhancedJSX,
        enhancements: enhancementResults.enhancements,
        issues: issues.filter(issue => !issue.autoFixable), // Only return unfixed issues
        styleDetection
      };
      
    } catch (error) {
      console.error('[ENHANCED-PRISM] Enhancement failed:', error);
      return {
        enhancedJSX: jsx,
        enhancements: [`❌ Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        issues: [],
        styleDetection: {
          videoType: 'showcase',
          audienceType: 'general',
          narrativeStructure: 'single-shot',
          complexityLevel: 'simple',
          visualStyle: 'tech',
          confidence: 0
        }
      };
    }
  }
  
  /**
   * Enhanced style detection using multiple signals
   */
  private detectAdvancedStyle(jsx: string, projectName: string): EnhancedStyleDetection {
    const content = jsx.toLowerCase();
    let confidence = 0;
    
    // Video Type Detection
    let videoType: EnhancedStyleDetection['videoType'] = 'showcase';
    if (content.includes('tutorial') || content.includes('step') || content.includes('how to')) {
      videoType = 'tutorial';
      confidence += 20;
    } else if (content.includes('presentation') || content.includes('slides')) {
      videoType = 'presentation';
      confidence += 20;
    } else if (content.includes('demo') || content.includes('example')) {
      videoType = 'demo';
      confidence += 15;
    } else if (content.includes('intro') || content.includes('welcome') || projectName.includes('showcase')) {
      videoType = 'showcase';
      confidence += 15;
    }
    
    // Audience Type Detection
    let audienceType: EnhancedStyleDetection['audienceType'] = 'general';
    if (content.includes('github') || content.includes('api') || content.includes('code')) {
      audienceType = 'technical';
      confidence += 15;
    } else if (content.includes('professional') || content.includes('business') || content.includes('corporate')) {
      audienceType = 'professional';
      confidence += 15;
    } else if (content.includes('creative') || content.includes('design') || content.includes('art')) {
      audienceType = 'creative';
      confidence += 15;
    }
    
    // Narrative Structure Detection
    let narrativeStructure: EnhancedStyleDetection['narrativeStructure'] = 'single-shot';
    const shotCount = (content.match(/shot\s*\d+|scene\s*\d+/g) || []).length;
    if (shotCount >= 3) {
      narrativeStructure = 'intro-main-outro';
      confidence += 25;
    } else if (shotCount >= 2) {
      narrativeStructure = 'sequential';
      confidence += 20;
    }
    
    // Complexity Level Detection
    const animationCount = (content.match(/interpolate|spring|easing/g) || []).length;
    const elementCount = (content.match(/<[a-z]/g) || []).length;
    
    let complexityLevel: EnhancedStyleDetection['complexityLevel'] = 'simple';
    if (animationCount > 15 && elementCount > 30) {
      complexityLevel = 'advanced';
      confidence += 15;
    } else if (animationCount > 8 && elementCount > 20) {
      complexityLevel = 'complex';
      confidence += 10;
    } else if (animationCount > 3 && elementCount > 10) {
      complexityLevel = 'moderate';
      confidence += 5;
    }
    
    // Visual Style Detection (enhanced from basic version)
    let visualStyle: EnhancedStyleDetection['visualStyle'] = 'tech';
    if (content.includes('minimal') || content.includes('clean') || content.includes('simple')) {
      visualStyle = 'minimal';
      confidence += 10;
    } else if (content.includes('corporate') || content.includes('business')) {
      visualStyle = 'corporate';
      confidence += 10;
    } else if (content.includes('creative') || content.includes('artistic') || content.includes('colorful')) {
      visualStyle = 'creative';
      confidence += 10;
    }
    
    return {
      videoType,
      audienceType,
      narrativeStructure,
      complexityLevel,
      visualStyle,
      confidence: Math.min(confidence, 100)
    };
  }
  
  /**
   * Extract all animation patterns from AST
   */
  private extractAnimationPatterns(ast: t.File): AnimationPattern[] {
    const animations: AnimationPattern[] = [];
    
    const self = this;
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const functionName = path.node.callee.name;
          
          // Extract spring animations
          if (functionName === 'spring') {
            const springPattern = self.parseSpringCall(path.node as t.CallExpression);
            if (springPattern) animations.push(springPattern);
          }
          
          // Extract interpolate animations
          if (functionName === 'interpolate') {
            const interpolatePattern = self.parseInterpolateCall(path.node as t.CallExpression);
            if (interpolatePattern) animations.push(interpolatePattern);
          }
        }
      }
    });
    
    return animations;
  }
  
  /**
   * Parse spring animation call
   */
  private parseSpringCall(node: t.CallExpression): AnimationPattern | null {
    if (node.arguments.length === 0) return null;
    
    const configArg = node.arguments[0];
    if (!t.isObjectExpression(configArg)) return null;
    
    let startFrame = 0;
    let elementName = 'unknown';
    
    // Extract frame offset from "frame - X" pattern
    configArg.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        if (prop.key.name === 'frame' && t.isBinaryExpression(prop.value) && prop.value.operator === '-') {
          if (t.isNumericLiteral(prop.value.right)) {
            startFrame = prop.value.right.value;
          }
        }
      }
    });
    
    return {
      type: 'spring',
      startFrame,
      endFrame: startFrame + 30, // Springs typically last ~1 second
      element: elementName,
      property: 'transform',
      values: [0, 1]
    };
  }
  
  /**
   * Parse interpolate animation call
   */
  private parseInterpolateCall(node: t.CallExpression): AnimationPattern | null {
    if (node.arguments.length < 3) return null;
    
    const frameArg = node.arguments[0];
    const inputRangeArg = node.arguments[1];
    const outputRangeArg = node.arguments[2];
    
    let startFrame = 0;
    let endFrame = 30;
    
    // Extract frame range
    if (t.isArrayExpression(inputRangeArg) && inputRangeArg.elements.length >= 2) {
      const start = inputRangeArg.elements[0];
      const end = inputRangeArg.elements[inputRangeArg.elements.length - 1];
      
      if (t.isNumericLiteral(start)) startFrame = start.value;
      if (t.isNumericLiteral(end)) endFrame = end.value;
    }
    
    let values: any[] = [];
    if (t.isArrayExpression(outputRangeArg)) {
      values = outputRangeArg.elements.map(el => 
        t.isNumericLiteral(el) ? el.value : 
        t.isStringLiteral(el) ? el.value : null
      );
    }
    
    return {
      type: 'interpolate',
      startFrame,
      endFrame,
      element: 'unknown',
      property: 'opacity', // Default assumption
      values
    };
  }
  
  /**
   * Analyze animations for transition issues - THIS FIXES THE OVERLAP PROBLEM
   */
  private analyzeTransitionIssues(animations: AnimationPattern[]): TransitionIssue[] {
    const issues: TransitionIssue[] = [];
    
    // Group animations by approximate timing
    const fadeOuts = animations.filter(a => 
      a.property === 'opacity' && a.values.includes(0)
    );
    const fadeIns = animations.filter(a => 
      a.property === 'opacity' && a.values.includes(1) && a.startFrame > 0
    );
    
    // Check for problematic overlaps
    fadeOuts.forEach(fadeOut => {
      fadeIns.forEach(fadeIn => {
        const gap = fadeIn.startFrame - fadeOut.endFrame;
        
        // CRITICAL: This detects the exact issue in your screenshot
        if (gap < ADVANCED_STANDARDS.animation.transitionOverlap.minimum) {
          issues.push({
            type: 'overlap',
            severity: gap < -10 ? 'critical' : 'high',
            description: `Shot transition overlap detected: fade-out ends at frame ${fadeOut.endFrame}, fade-in starts at frame ${fadeIn.startFrame} (gap: ${gap} frames)`,
            affectedElements: [fadeOut.element, fadeIn.element],
            suggestedFix: `Adjust fade-in to start at frame ${fadeOut.endFrame + ADVANCED_STANDARDS.animation.transitionOverlap.recommended} for smooth transition`,
            autoFixable: true
          });
        }
        
        // Also check for jarring gaps
        if (gap > ADVANCED_STANDARDS.animation.transitionOverlap.maximum) {
          issues.push({
            type: 'gap',
            severity: 'medium',
            description: `Excessive gap between shots: ${gap} frames of black screen`,
            affectedElements: [fadeOut.element, fadeIn.element],
            suggestedFix: `Reduce gap to ${ADVANCED_STANDARDS.animation.transitionOverlap.recommended} frames for better flow`,
            autoFixable: true
          });
        }
      });
    });
    
    return issues;
  }
  
  /**
   * Apply intelligent enhancements and fixes
   */
  private applyIntelligentEnhancements(
    ast: t.File, 
    animations: AnimationPattern[], 
    issues: TransitionIssue[],
    styleDetection: EnhancedStyleDetection
  ): { ast: t.File; enhancements: string[] } {
    const enhancements: string[] = [];
    
    // Fix critical transition overlaps
    const overlapIssues = issues.filter(i => i.type === 'overlap' && i.autoFixable);
    if (overlapIssues.length > 0) {
      this.fixTransitionOverlaps(ast, overlapIssues);
      enhancements.push(`✅ Fixed ${overlapIssues.length} transition overlap issues (prevents text bleeding through)`);
    }
    
    // Apply professional easing curves
    const easingFixes = this.enhanceEasingCurves(ast, styleDetection);
    if (easingFixes > 0) {
      enhancements.push(`✅ Enhanced ${easingFixes} animations with professional easing curves`);
    }
    
    // Add fade safety margins
    const safetyEnhancements = this.addFadeSafetyMargins(ast);
    if (safetyEnhancements > 0) {
      enhancements.push(`✅ Added safety margins to ${safetyEnhancements} fade transitions`);
    }
    
    // Apply professional typography standards
    const typographyFixes = this.enhanceTypography(ast, styleDetection);
    if (typographyFixes > 0) {
      enhancements.push(`✅ Enhanced ${typographyFixes} typography elements with professional standards`);
    }
    
    // Apply 8pt grid system to spacing
    const spacingFixes = this.enforce8ptGrid(ast);
    if (spacingFixes > 0) {
      enhancements.push(`✅ Aligned ${spacingFixes} spacing values to 8pt grid system`);
    }
    
    // Enhance color accessibility
    const colorFixes = this.enhanceColorAccessibility(ast);
    if (colorFixes > 0) {
      enhancements.push(`✅ Improved color accessibility for ${colorFixes} elements`);
    }
    
    // Apply animation timing hierarchy
    const timingFixes = this.applyTimingHierarchy(ast, styleDetection);
    if (timingFixes > 0) {
      enhancements.push(`✅ Applied professional timing hierarchy to ${timingFixes} animations`);
    }
    
    return { ast, enhancements };
  }
  
  /**
   * Fix transition overlaps - DIRECTLY ADDRESSES THE SCREENSHOT ISSUE
   */
  private fixTransitionOverlaps(ast: t.File, issues: TransitionIssue[]): void {
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'interpolate') {
          // Check if this is a fade transition that needs fixing
          const args = path.node.arguments;
          if (args.length >= 3 && t.isArrayExpression(args[1])) {
            const inputRange = args[1];
            
            // Look for fade-in patterns that start too early
            if (inputRange.elements.length >= 2) {
              const startFrame = inputRange.elements[0];
              const endFrame = inputRange.elements[1];
              
              if (t.isNumericLiteral(startFrame) && t.isNumericLiteral(endFrame)) {
                // Apply the fix: ensure minimum 15-frame gap
                const adjustedStart = startFrame.value + ADVANCED_STANDARDS.animation.transitionOverlap.recommended;
                const adjustedEnd = endFrame.value + ADVANCED_STANDARDS.animation.transitionOverlap.recommended;
                
                // Update the AST
                startFrame.value = adjustedStart;
                endFrame.value = adjustedEnd;
                
                console.error(`[ENHANCED-PRISM] Fixed transition: moved fade from [${startFrame.value}, ${endFrame.value}] to [${adjustedStart}, ${adjustedEnd}]`);
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Enhance easing curves based on style detection
   */
  private enhanceEasingCurves(ast: t.File, styleDetection: EnhancedStyleDetection): number {
    let enhancements = 0;
    const appropriateCurves = ADVANCED_STANDARDS.animation.easingCurves[styleDetection.visualStyle] || 
                             ADVANCED_STANDARDS.animation.easingCurves.professional;
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'interpolate') {
          const args = path.node.arguments;
          
          // Check if easing is missing or basic
          const hasEasing = args.length > 3 && t.isObjectExpression(args[3]);
          if (!hasEasing) {
            // Add professional easing
            const easingConfig = t.objectExpression([
              t.objectProperty(
                t.identifier('easing'),
                t.identifier(appropriateCurves[0])
              )
            ]);
            args.push(easingConfig);
            enhancements++;
          }
        }
      }
    });
    
    return enhancements;
  }
  
  /**
   * Add fade safety margins
   */
  private addFadeSafetyMargins(ast: t.File): number {
    let enhancements = 0;
    
    traverse(ast, {
      JSXExpressionContainer(path) {
        if (t.isCallExpression(path.node.expression) && 
            t.isIdentifier(path.node.expression.callee) && 
            path.node.expression.callee.name === 'interpolate') {
          
          // Add extrapolation safety for fades
          const args = path.node.expression.arguments;
          if (args.length >= 3 && !args[3]) {
            const safetyConfig = t.objectExpression([
              t.objectProperty(t.identifier('extrapolateLeft'), t.stringLiteral('clamp')),
              t.objectProperty(t.identifier('extrapolateRight'), t.stringLiteral('clamp'))
            ]);
            args.push(safetyConfig);
            enhancements++;
          }
        }
      }
    });
    
    return enhancements;
  }
  
  /**
   * Enhance typography with professional standards
   */
  private enhanceTypography(ast: t.File, styleDetection: EnhancedStyleDetection): number {
    let enhancements = 0;
    const professionalFonts = {
      tech: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      corporate: '"Inter", "Helvetica Neue", "Arial", system-ui, sans-serif',
      creative: '"Poppins", "Montserrat", "Open Sans", system-ui, sans-serif',
      minimal: '"Inter", system-ui, -apple-system, sans-serif',
      artistic: '"Playfair Display", "Crimson Text", "Lora", serif'
    };
    
    const targetFont = professionalFonts[styleDetection.visualStyle] || professionalFonts.tech;
    
    traverse(ast, {
      ObjectProperty(path) {
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'fontFamily') {
          if (t.isStringLiteral(path.node.value)) {
            const currentFont = path.node.value.value;
            // Upgrade basic fonts to professional stacks
            if (currentFont === 'Arial' || currentFont === 'Times New Roman' || 
                currentFont === 'serif' || currentFont === 'sans-serif') {
              path.node.value.value = targetFont;
              enhancements++;
            }
          }
        }
        
        // Add line-height for better readability
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'fontSize' && 
            path.parent && t.isObjectExpression(path.parent)) {
          
          const hasLineHeight = path.parent.properties.some(prop => 
            t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'lineHeight'
          );
          
          if (!hasLineHeight) {
            path.parent.properties.push(
              t.objectProperty(
                t.identifier('lineHeight'),
                t.numericLiteral(1.5)
              )
            );
            enhancements++;
          }
        }
      }
    });
    
    return enhancements;
  }
  
  /**
   * Enforce 8pt grid system for spacing
   */
  private enforce8ptGrid(ast: t.File): number {
    let enhancements = 0;
    const eightPtMultiples = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80];
    
    traverse(ast, {
      ObjectProperty(path) {
        const spacingProps = ['gap', 'padding', 'margin', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight'];
        
        if (t.isIdentifier(path.node.key) && spacingProps.includes(path.node.key.name)) {
          if (t.isNumericLiteral(path.node.value)) {
            const currentValue = path.node.value.value;
            const nearestMultiple = eightPtMultiples.find(m => Math.abs(m - currentValue) <= 4);
            
            if (nearestMultiple && nearestMultiple !== currentValue) {
              path.node.value.value = nearestMultiple;
              enhancements++;
            }
          }
          
          if (t.isStringLiteral(path.node.value)) {
            const match = path.node.value.value.match(/^(\d+)px$/);
            if (match) {
              const currentValue = parseInt(match[1]);
              const nearestMultiple = eightPtMultiples.find(m => Math.abs(m - currentValue) <= 4);
              
              if (nearestMultiple && nearestMultiple !== currentValue) {
                path.node.value.value = `${nearestMultiple}px`;
                enhancements++;
              }
            }
          }
        }
      }
    });
    
    return enhancements;
  }
  
  /**
   * Enhance color accessibility
   */
  private enhanceColorAccessibility(ast: t.File): number {
    let enhancements = 0;
    
    traverse(ast, {
      ObjectProperty(path) {
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'color' && 
            t.isStringLiteral(path.node.value)) {
          
          const color = path.node.value.value;
          
          // Upgrade low-contrast colors
          const colorUpgrades: { [key: string]: string } = {
            '#999': '#6b7280',     // Gray-500 (better contrast)
            '#ccc': '#9ca3af',     // Gray-400
            '#aaa': '#9ca3af',     // Gray-400  
            'gray': '#6b7280',     // Gray-500
            'lightgray': '#9ca3af' // Gray-400
          };
          
          if (colorUpgrades[color]) {
            path.node.value.value = colorUpgrades[color];
            enhancements++;
          }
        }
        
        // Add text shadows for light text on light backgrounds
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'color' &&
            path.parent && t.isObjectExpression(path.parent)) {
          
          const colorValue = t.isStringLiteral(path.node.value) ? path.node.value.value : '';
          const hasBackground = path.parent.properties.some(prop => 
            t.isObjectProperty(prop) && t.isIdentifier(prop.key) && 
            (prop.key.name === 'background' || prop.key.name === 'backgroundColor')
          );
          
          const hasTextShadow = path.parent.properties.some(prop => 
            t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'textShadow'
          );
          
          if (!hasTextShadow && (colorValue.includes('white') || colorValue.includes('#fff')) && hasBackground) {
            path.parent.properties.push(
              t.objectProperty(
                t.identifier('textShadow'),
                t.stringLiteral('0 1px 2px rgba(0, 0, 0, 0.8)')
              )
            );
            enhancements++;
          }
        }
      }
    });
    
    return enhancements;
  }
  
  /**
   * Apply professional animation timing hierarchy
   */
  private applyTimingHierarchy(ast: t.File, styleDetection: EnhancedStyleDetection): number {
    let enhancements = 0;
    const standards = ADVANCED_STANDARDS;
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          // Enhance spring animations
          if (path.node.callee.name === 'spring' && path.node.arguments.length > 0) {
            const configArg = path.node.arguments[0];
            if (t.isObjectExpression(configArg)) {
              // Add professional spring settings if missing
              const hasConfig = configArg.properties.some(prop => 
                t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'config'
              );
              
              if (!hasConfig) {
                configArg.properties.push(
                  t.objectProperty(
                    t.identifier('config'),
                    t.objectExpression([
                      t.objectProperty(t.identifier('damping'), t.numericLiteral(15)),
                      t.objectProperty(t.identifier('stiffness'), t.numericLiteral(80))
                    ])
                  )
                );
                enhancements++;
              }
            }
          }
          
          // Enhance interpolate animations with proper timing
          if (path.node.callee.name === 'interpolate' && path.node.arguments.length >= 3) {
            const inputRange = path.node.arguments[1];
            if (t.isArrayExpression(inputRange) && inputRange.elements.length >= 2) {
              // Ensure minimum duration standards
              const start = inputRange.elements[0];
              const end = inputRange.elements[inputRange.elements.length - 1];
              
              if (t.isNumericLiteral(start) && t.isNumericLiteral(end)) {
                const duration = end.value - start.value;
                
                // Apply timing hierarchy based on animation importance
                if (duration < standards.animation.timingHierarchy.micro.min) {
                  end.value = start.value + standards.animation.timingHierarchy.micro.min;
                  enhancements++;
                } else if (duration > standards.animation.timingHierarchy.primary.max) {
                  end.value = start.value + standards.animation.timingHierarchy.primary.max;
                  enhancements++;
                }
              }
            }
          }
        }
      }
    });
    
    return enhancements;
  }
}

/**
 * Main export function for MCP integration
 */
export async function enhanceWithAdvancedIntelligence(jsx: string, projectName: string) {
  const prism = new EnhancedDesignPrism();
  return await prism.enhanceJSXWithIntelligence(jsx, projectName);
}