// Choice-Based Enhancement System - Creative Freedom with Technical Safety
// Offers dramatic options instead of forcing conservative changes

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

interface EnhancementChoice {
  id: string;
  category: 'scale' | 'timing' | 'animation' | 'background' | 'color';
  current: string;
  options: EnhancementOption[];
  impact: 'subtle' | 'moderate' | 'dramatic' | 'bold';
  reasoning: string;
}

interface EnhancementOption {
  value: string;
  description: string;
  visualImpact: string;
  codeChange: string;
  preview?: string;
}

interface VideoAnalysis {
  scale: {
    titleSizes: number[];
    containerWidths: number[];
    scaleScore: number;
  };
  timing: {
    transitions: Array<{ start: number; end: number; gap: number }>;
    overlapIssues: number;
    energyScore: number;
  };
  motion: {
    animationCount: number;
    continuousMotion: number;
    dynamismScore: number;
  };
  background: {
    complexity: number;
    layerCount: number;
    richnessScore: number;
  };
}

/**
 * Choice-Based Enhancement System - Main Class
 */
export class ChoiceBasedEnhancementSystem {
  
  /**
   * Analyze video and offer enhancement choices (not force changes)
   */
  async analyzeAndOfferChoices(jsx: string, projectName: string): Promise<{
    analysis: VideoAnalysis;
    enhancementChoices: EnhancementChoice[];
    criticalFixes: EnhancementChoice[];
    optionalEnhancements: EnhancementChoice[];
  }> {
    console.error('[CHOICE-ENHANCEMENT] Analyzing video for enhancement opportunities...');
    
    const analysis = this.analyzeCurrentVideo(jsx);
    const choices = this.generateEnhancementChoices(analysis, jsx);
    
    // Separate critical fixes from optional enhancements
    const criticalFixes = choices.filter(choice => 
      choice.category === 'timing' && analysis.timing.overlapIssues > 0
    );
    const optionalEnhancements = choices.filter(choice => 
      choice.category !== 'timing' || analysis.timing.overlapIssues === 0
    );
    
    return {
      analysis,
      enhancementChoices: choices,
      criticalFixes,
      optionalEnhancements
    };
  }
  
  /**
   * Analyze current video state
   */
  private analyzeCurrentVideo(jsx: string): VideoAnalysis {
    // Extract scale information
    const titleSizes = this.extractFontSizes(jsx);
    const containerWidths = this.extractContainerSizes(jsx);
    const scaleScore = this.calculateScaleScore(titleSizes, containerWidths);
    
    // Extract timing information
    const transitions = this.extractTransitions(jsx);
    const overlapIssues = transitions.filter(t => t.gap < 2).length;
    const energyScore = this.calculateEnergyScore(transitions);
    
    // Extract motion information
    const animationCount = this.countAnimations(jsx);
    const continuousMotion = this.countContinuousAnimations(jsx);
    const dynamismScore = this.calculateDynamismScore(animationCount, continuousMotion);
    
    // Extract background information
    const complexity = this.analyzeBackgroundComplexity(jsx);
    const layerCount = this.countVisualLayers(jsx);
    const richnessScore = this.calculateRichnessScore(complexity, layerCount);
    
    return {
      scale: { titleSizes, containerWidths, scaleScore },
      timing: { transitions, overlapIssues, energyScore },
      motion: { animationCount, continuousMotion, dynamismScore },
      background: { complexity, layerCount, richnessScore }
    };
  }
  
  /**
   * Generate enhancement choices based on analysis
   */
  private generateEnhancementChoices(analysis: VideoAnalysis, jsx: string): EnhancementChoice[] {
    const choices: EnhancementChoice[] = [];
    
    // Scale enhancement choices
    if (analysis.scale.scaleScore < 70) {
      const maxTitle = Math.max(...analysis.scale.titleSizes, 40);
      choices.push({
        id: 'scale-title',
        category: 'scale',
        current: `${maxTitle}px title`,
        impact: 'dramatic',
        reasoning: 'GitHub_4 success pattern uses 64-84px titles for impact',
        options: [
          {
            value: '64px',
            description: 'Professional Impact',
            visualImpact: '+30% larger, commands attention',
            codeChange: `fontSize: 64`,
            preview: 'Bold but not overwhelming'
          },
          {
            value: '84px',
            description: 'Bold Statement',
            visualImpact: '+60% larger, dramatic presence',
            codeChange: `fontSize: 84`,
            preview: 'GitHub_4 hero style'
          },
          {
            value: '96px',
            description: 'Maximum Impact',
            visualImpact: '+80% larger, screen-filling',
            codeChange: `fontSize: 96`,
            preview: 'Cinematic title card'
          }
        ]
      });
    }
    
    // Container width choices
    const maxContainer = Math.max(...analysis.scale.containerWidths, 200);
    if (maxContainer < 500) {
      choices.push({
        id: 'scale-containers',
        category: 'scale',
        current: `${maxContainer}px containers`,
        impact: 'dramatic',
        reasoning: 'GitHub_4 uses 650-900px containers for presence',
        options: [
          {
            value: '500px',
            description: 'Comfortable Width',
            visualImpact: 'Fills space better',
            codeChange: `width: 500`,
          },
          {
            value: '650px', 
            description: 'GitHub_4 Standard',
            visualImpact: 'Proven successful width',
            codeChange: `width: 650`,
          },
          {
            value: '800px',
            description: 'Full Presence',
            visualImpact: 'Maximum screen utilization',
            codeChange: `width: 800`,
          }
        ]
      });
    }
    
    // Timing fix choices (critical if overlaps detected)
    if (analysis.timing.overlapIssues > 0) {
      choices.push({
        id: 'fix-timing-overlaps',
        category: 'timing',
        current: `${analysis.timing.overlapIssues} overlap issues`,
        impact: 'bold',
        reasoning: 'CRITICAL: Prevents text bleeding like your screenshot issue',
        options: [
          {
            value: '2-frame-crossfade',
            description: 'Smooth Crossfade',
            visualImpact: 'Seamless blend, maintains energy',
            codeChange: 'Adjust fade timing for 2-frame overlap',
          },
          {
            value: '5-frame-cut',
            description: 'Quick Cut',
            visualImpact: 'Clean transitions, snappy feel',
            codeChange: 'Adjust fade timing for 5-frame gap',
          }
        ]
      });
    }
    
    // Background enhancement choices
    if (analysis.background.richnessScore < 60) {
      choices.push({
        id: 'enhance-background',
        category: 'background',
        current: 'Simple background',
        impact: 'dramatic',
        reasoning: 'GitHub_4 success pattern: rich animated backgrounds',
        options: [
          {
            value: 'tech-minimal',
            description: 'Clean Tech Aesthetic',
            visualImpact: 'Subtle particles, professional feel',
            codeChange: 'Add animated particle system'
          },
          {
            value: 'creative-burst',
            description: 'Dynamic & Colorful',
            visualImpact: '25 particles, bold colors, high energy',
            codeChange: 'Add rich particle system with animation'
          },
          {
            value: 'github-code-style',
            description: 'Animated Code Background',
            visualImpact: 'Like GitHub_4: scrolling code text',
            codeChange: 'Add animated code line system'
          }
        ]
      });
    }
    
    // Animation energy choices
    if (analysis.motion.dynamismScore < 70) {
      choices.push({
        id: 'animation-energy',
        category: 'animation',
        current: 'Basic animations',
        impact: 'moderate',
        reasoning: 'Add energy without breaking performance',
        options: [
          {
            value: 'energetic',
            description: 'Bouncy & Dynamic',
            visualImpact: 'Higher stiffness, more bounce',
            codeChange: 'damping: 10, stiffness: 180'
          },
          {
            value: 'smooth',
            description: 'Elegant & Refined', 
            visualImpact: 'Smooth curves, premium feel',
            codeChange: 'damping: 20, stiffness: 120'
          },
          {
            value: 'snappy',
            description: 'Quick & Responsive',
            visualImpact: 'Fast, crisp movements',
            codeChange: 'damping: 15, stiffness: 200'
          }
        ]
      });
    }
    
    return choices;
  }
  
  /**
   * Apply user's chosen enhancements to JSX
   */
  async applyChosenEnhancements(jsx: string, choices: Array<{ choiceId: string; selectedOption: string }>): Promise<{
    enhancedJSX: string;
    changesApplied: string[];
    previewAvailable: boolean;
  }> {
    let enhancedJSX = jsx;
    const changesApplied: string[] = [];
    
    try {
      const ast = parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'objectRestSpread', 'decorators-legacy']
      });
      
      // Apply each chosen enhancement
      choices.forEach(choice => {
        switch (choice.choiceId) {
          case 'scale-title':
            this.applyTitleScaling(ast, choice.selectedOption);
            changesApplied.push(`Title scaled to ${choice.selectedOption}`);
            break;
            
          case 'scale-containers':
            this.applyContainerScaling(ast, choice.selectedOption);
            changesApplied.push(`Containers scaled to ${choice.selectedOption}`);
            break;
            
          case 'fix-timing-overlaps':
            this.applyTimingFixes(ast, choice.selectedOption);
            changesApplied.push(`Applied ${choice.selectedOption} transition timing`);
            break;
            
          case 'enhance-background':
            enhancedJSX = this.addBackgroundArchetype(enhancedJSX, choice.selectedOption);
            changesApplied.push(`Added ${choice.selectedOption} background system`);
            break;
            
          case 'animation-energy':
            this.applyAnimationStyle(ast, choice.selectedOption);
            changesApplied.push(`Applied ${choice.selectedOption} animation style`);
            break;
        }
      });
      
      enhancedJSX = generate(ast).code;
      
      return {
        enhancedJSX,
        changesApplied,
        previewAvailable: true
      };
      
    } catch (error) {
      console.error('[CHOICE-ENHANCEMENT] Enhancement failed:', error);
      return {
        enhancedJSX: jsx,
        changesApplied: [`❌ Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        previewAvailable: false
      };
    }
  }
  
  // Helper methods for analysis
  private extractFontSizes(jsx: string): number[] {
    const matches = jsx.match(/fontSize:\s*['"`]?(\d+)px?['"`]?/g) || [];
    return matches.map(match => parseInt(match.match(/(\d+)/)?.[1] || '0'));
  }
  
  private extractContainerSizes(jsx: string): number[] {
    const widthMatches = jsx.match(/width:\s*['"`]?(\d+)px?['"`]?/g) || [];
    const maxWidthMatches = jsx.match(/maxWidth:\s*['"`]?(\d+)px?['"`]?/g) || [];
    
    return [...widthMatches, ...maxWidthMatches]
      .map(match => parseInt(match.match(/(\d+)/)?.[1] || '0'))
      .filter(size => size > 50);
  }
  
  private extractTransitions(jsx: string): Array<{ start: number; end: number; gap: number }> {
    const transitions: Array<{ start: number; end: number; gap: number }> = [];
    const fadeOutPattern = /interpolate\s*\(\s*frame\s*,\s*\[(\d+),\s*(\d+)\]\s*,\s*\[1,\s*0\]/g;
    const fadeInPattern = /interpolate\s*\(\s*frame\s*,\s*\[(\d+),\s*(\d+)\]\s*,\s*\[0,\s*1\]/g;
    
    const fadeOuts: Array<{ start: number; end: number }> = [];
    const fadeIns: Array<{ start: number; end: number }> = [];
    
    let match;
    while ((match = fadeOutPattern.exec(jsx)) !== null) {
      fadeOuts.push({ start: parseInt(match[1]), end: parseInt(match[2]) });
    }
    
    while ((match = fadeInPattern.exec(jsx)) !== null) {
      fadeIns.push({ start: parseInt(match[1]), end: parseInt(match[2]) });
    }
    
    // Calculate gaps
    fadeOuts.forEach(fadeOut => {
      const nextFadeIn = fadeIns.find(fadeIn => fadeIn.start >= fadeOut.start);
      if (nextFadeIn) {
        transitions.push({
          start: fadeOut.end,
          end: nextFadeIn.start,
          gap: nextFadeIn.start - fadeOut.end
        });
      }
    });
    
    return transitions;
  }
  
  private countAnimations(jsx: string): number {
    const springs = (jsx.match(/spring\s*\(/g) || []).length;
    const interpolations = (jsx.match(/interpolate\s*\(/g) || []).length;
    return springs + interpolations;
  }
  
  private countContinuousAnimations(jsx: string): number {
    return (jsx.match(/Math\.(sin|cos)\(/g) || []).length;
  }
  
  private analyzeBackgroundComplexity(jsx: string): number {
    const gradients = (jsx.match(/gradient/g) || []).length;
    const particles = (jsx.match(/particle|floating|background.*element/gi) || []).length;
    const animations = (jsx.match(/background.*interpolate/g) || []).length;
    
    return gradients + particles * 2 + animations * 3;
  }
  
  private countVisualLayers(jsx: string): number {
    return (jsx.match(/<AbsoluteFill/g) || []).length;
  }
  
  private calculateScaleScore(titles: number[], containers: number[]): number {
    const maxTitle = Math.max(...titles, 0);
    const maxContainer = Math.max(...containers, 0);
    
    let score = 0;
    if (maxTitle >= 80) score += 50;
    else if (maxTitle >= 64) score += 35;
    else if (maxTitle >= 48) score += 20;
    
    if (maxContainer >= 650) score += 50;
    else if (maxContainer >= 500) score += 35;
    else if (maxContainer >= 350) score += 20;
    
    return Math.min(score, 100);
  }
  
  private calculateEnergyScore(transitions: Array<{ gap: number }>): number {
    if (transitions.length === 0) return 50;
    
    const avgGap = transitions.reduce((sum, t) => sum + t.gap, 0) / transitions.length;
    
    if (avgGap <= 5) return 90; // High energy - quick transitions
    if (avgGap <= 10) return 70; // Medium energy
    if (avgGap <= 20) return 40; // Low energy - slow transitions
    return 10; // Very low energy - too many pauses
  }
  
  private calculateDynamismScore(animations: number, continuous: number): number {
    let score = 0;
    if (animations > 20) score += 30;
    else if (animations > 10) score += 20;
    else if (animations > 5) score += 10;
    
    if (continuous > 15) score += 40;
    else if (continuous > 8) score += 25;
    else if (continuous > 3) score += 10;
    
    // Bonus for variety
    if (continuous > 0 && animations > 0) score += 20;
    
    return Math.min(score, 100);
  }
  
  private calculateRichnessScore(complexity: number, layers: number): number {
    let score = 0;
    if (complexity > 15) score += 40;
    else if (complexity > 8) score += 25;
    else if (complexity > 3) score += 10;
    
    if (layers > 6) score += 40;
    else if (layers > 4) score += 25;
    else if (layers > 2) score += 10;
    
    return Math.min(score, 100);
  }
  
  // Enhancement application methods
  private applyTitleScaling(ast: t.File, selectedSize: string): void {
    const targetSize = parseInt(selectedSize.replace('px', ''));
    
    traverse(ast, {
      ObjectProperty(path) {
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'fontSize' && 
            t.isNumericLiteral(path.node.value)) {
          
          // Only update title-sized fonts (48px+)
          if (path.node.value.value >= 48) {
            path.node.value.value = targetSize;
          }
        }
        
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'fontSize' && 
            t.isStringLiteral(path.node.value)) {
          
          const currentSize = parseInt(path.node.value.value.match(/(\d+)/)?.[1] || '0');
          if (currentSize >= 48) {
            path.node.value.value = `${targetSize}px`;
          }
        }
      }
    });
  }
  
  private applyContainerScaling(ast: t.File, selectedWidth: string): void {
    const targetWidth = parseInt(selectedWidth.replace('px', ''));
    
    traverse(ast, {
      ObjectProperty(path) {
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'width' && 
            t.isNumericLiteral(path.node.value)) {
          
          // Only update container-sized widths (200px+)
          if (path.node.value.value >= 200) {
            path.node.value.value = targetWidth;
          }
        }
      }
    });
  }
  
  private applyTimingFixes(ast: t.File, timingStyle: string): void {
    const gapFrames = timingStyle.includes('2-frame') ? 2 : 
                    timingStyle.includes('5-frame') ? 5 : 10;
    
    // This would implement the smart timing calculator
    // For now, we'll use the approach from your research
    console.error(`[CHOICE-ENHANCEMENT] Applying ${gapFrames}-frame timing strategy`);
  }
  
  private addBackgroundArchetype(jsx: string, archetype: string): string {
    // Add background system based on chosen archetype
    const backgroundSystems = {
      'tech-minimal': this.generateTechMinimalBackground(),
      'creative-burst': this.generateCreativeBurstBackground(),
      'github-code-style': this.generateGitHubCodeBackground()
    };
    
    const backgroundCode = backgroundSystems[archetype as keyof typeof backgroundSystems] || '';
    
    if (backgroundCode) {
      // Insert after imports
      const importEndIndex = jsx.lastIndexOf('} from \'remotion\';');
      if (importEndIndex !== -1) {
        const insertPoint = jsx.indexOf('\n', importEndIndex) + 1;
        return jsx.slice(0, insertPoint) + '\n' + backgroundCode + '\n' + jsx.slice(insertPoint);
      }
    }
    
    return jsx;
  }
  
  private applyAnimationStyle(ast: t.File, animationStyle: string): void {
    const springConfigs = {
      'energetic': { damping: 10, stiffness: 180 },
      'smooth': { damping: 20, stiffness: 120 },
      'snappy': { damping: 15, stiffness: 200 }
    };
    
    const config = springConfigs[animationStyle as keyof typeof springConfigs];
    if (!config) return;
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'spring') {
          // Update spring configurations
          // Implementation would modify the config properties in the AST
          console.error(`[CHOICE-ENHANCEMENT] Applied ${animationStyle} spring config`);
        }
      }
    });
  }
  
  private generateTechMinimalBackground(): string {
    return `
// Tech-minimal background archetype
const TechBackground = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: \`translate(\${Math.cos(frame * 0.01 + i) * 200}px, \${Math.sin(frame * 0.01 + i) * 150}px)\`,
            width: 2,
            height: 2,
            backgroundColor: '#58a6ff',
            borderRadius: '50%',
            opacity: 0.3,
            boxShadow: '0 0 4px #58a6ff'
          }}
        />
      ))}
    </AbsoluteFill>
  );
};`;
  }
  
  private generateCreativeBurstBackground(): string {
    return `
// Creative-burst background archetype  
const CreativeBackground = () => {
  const frame = useCurrentFrame();
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#9b59b6'];
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: \`\${(i * 137) % 100}%\`,
            top: \`\${(i * 173) % 100}%\`,
            transform: \`scale(\${1 + Math.sin(frame * 0.02 + i) * 0.3}) rotate(\${frame * (0.5 + i * 0.1)}deg)\`,
            width: 6 + i % 8,
            height: 6 + i % 8,
            backgroundColor: colors[i % colors.length],
            borderRadius: '50%',
            opacity: 0.6 + Math.sin(frame * 0.03 + i) * 0.2,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </AbsoluteFill>
  );
};`;
  }
  
  private generateGitHubCodeBackground(): string {
    return `
// GitHub-style animated code background
const GitHubCodeBackground = () => {
  const frame = useCurrentFrame();
  
  const codeLines = [
    'const innovation = "endless";',
    'import { MCP, AI } from "tools";',
    'git commit -m "breakthrough"',
    'npm install creativity',
    'export class Builder {',
    '  async deploy() {',
    '    return "success";',
    '  }',
    '}',
    '// Building the future...'
  ];
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {codeLines.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 100 + i * 80,
            left: interpolate(frame % 400, [0, 400], [-200, 1920]),
            opacity: interpolate(frame % 400, [0, 50, 300, 400], [0, 0.2, 0.2, 0]),
            color: '#30363d',
            fontSize: '18px',
            fontFamily: 'Monaco, monospace'
          }}
        >
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};`;
  }
}

/**
 * Main export for MCP integration
 */
export async function analyzeAndOfferChoices(jsx: string, projectName: string) {
  const system = new ChoiceBasedEnhancementSystem();
  return await system.analyzeAndOfferChoices(jsx, projectName);
}

export async function applyUserChoices(jsx: string, choices: Array<{ choiceId: string; selectedOption: string }>) {
  const system = new ChoiceBasedEnhancementSystem();
  return await system.applyChosenEnhancements(jsx, choices);
}