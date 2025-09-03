// Multi-Component Prompt Architecture System - Ensure Consistent GitHub_4-Level Content
// Based on research: 68% accuracy improvements, 40-78% quality gains with structured prompts

interface PromptArchitecture {
  role: string;           // Expert persona specification
  context: string;        // Rich background and domain knowledge  
  objective: string;      // Multi-layered goals and requirements
  constraints: string;    // Technical specs and architecture demands
  output: string;         // Structured format expectations
}

interface ContentComplexityTriggers {
  dataVisualization: string[];
  multiComponentSystem: string[];
  richAnimationSystems: string[];
  professionalArchitecture: string[];
  visualEngagement: string[];
}

interface PromptEnhancementResult {
  enhanced: string;
  complexity: 'basic' | 'moderate' | 'rich' | 'github4-level';
  addedElements: string[];
  expectedCharacterCount: number;
  confidenceScore: number;
}

// Research-validated complexity triggers that consistently generate rich content
const COMPLEXITY_TRIGGERS: ContentComplexityTriggers = {
  dataVisualization: [
    'contribution graph with 371 daily activity squares',
    'realistic GitHub contribution data patterns',
    'animated statistics with counting effects',
    'activity heatmaps with color-coded intensity',
    'project metrics and achievement tracking',
    'timeline visualizations with milestone markers'
  ],
  
  multiComponentSystem: [
    'specialized React components (ContributionGraph, CodeBackground, Achievements)',
    'component architecture with shared state and props',
    'modular design with independent animation systems',
    'reusable visualization components',
    'complex data flow between components',
    'component composition patterns'
  ],
  
  richAnimationSystems: [
    'staggered animation timing with individual element delays',
    '60+ interpolate calls with smooth spring physics',
    'continuous micro-motion using Math.sin/cos functions',
    'particle networks with interconnected movement',
    'smooth easing curves (Easing.out(Easing.cubic))',
    'frame-rate independent animations using fps calculations'
  ],
  
  professionalArchitecture: [
    'multi-layer background systems (4+ visual layers)',
    'professional typography hierarchy (84px titles, modular scale)',
    'sophisticated color systems with animated gradients',
    'backdrop filters, shadows, and depth effects',
    '650px+ container widths for commanding presence',
    'GPU-optimized rendering with transform3d and willChange'
  ],
  
  visualEngagement: [
    'animated code background with scrolling syntax',
    'particle systems with 20+ elements and realistic physics',
    'dramatic lighting effects and animated glows',
    'smooth crossfade transitions with minimal gaps',
    'always-moving elements ensuring visual interest',
    'layered visual complexity creating depth perception'
  ]
};

/**
 * Multi-Component Prompt Architecture System
 * Ensures consistent GitHub_4-level rich content generation
 */
export class PromptArchitectureSystem {
  
  /**
   * Analyze and enhance prompt for consistent rich content generation
   */
  enhancePromptForRichness(originalPrompt: string, projectType?: string): PromptEnhancementResult {
    console.error('[PROMPT-ARCHITECTURE] Analyzing prompt for richness triggers...');
    
    const analysis = this.analyzePromptComplexity(originalPrompt);
    
    if (analysis.predictedComplexity === 'basic') {
      console.error('[PROMPT-ARCHITECTURE] Basic prompt detected - applying research-based enhancements...');
      return this.upgradeToRichPrompt(originalPrompt, projectType);
    } else {
      console.error(`[PROMPT-ARCHITECTURE] Prompt already ${analysis.predictedComplexity} - minimal enhancement needed`);
      return {
        enhanced: originalPrompt,
        complexity: analysis.predictedComplexity,
        addedElements: [],
        expectedCharacterCount: this.estimateCharacterCount(analysis.predictedComplexity),
        confidenceScore: analysis.confidence
      };
    }
  }
  
  /**
   * Analyze prompt to predict content complexity
   */
  public analyzePromptComplexity(prompt: string): {
    predictedComplexity: 'basic' | 'moderate' | 'rich' | 'github4-level';
    confidence: number;
    missingElements: string[];
  } {
    const promptLower = prompt.toLowerCase();
    let score = 0;
    const missingElements: string[] = [];
    
    // Check for data visualization triggers (30 points max)
    const dataMatches = COMPLEXITY_TRIGGERS.dataVisualization.filter(trigger => 
      promptLower.includes(trigger.toLowerCase())
    ).length;
    
    if (dataMatches >= 2) score += 30;
    else if (dataMatches >= 1) score += 15;
    else {
      missingElements.push('Data visualization specifications');
      score += 0;
    }
    
    // Check for component architecture (25 points max)
    const componentMatches = COMPLEXITY_TRIGGERS.multiComponentSystem.filter(trigger =>
      promptLower.includes(trigger.toLowerCase())
    ).length;
    
    if (componentMatches >= 2) score += 25;
    else if (componentMatches >= 1) score += 12;
    else {
      missingElements.push('Multi-component architecture requirements');
    }
    
    // Check for animation complexity (20 points max)
    const animationMatches = COMPLEXITY_TRIGGERS.richAnimationSystems.filter(trigger =>
      promptLower.includes(trigger.toLowerCase())
    ).length;
    
    if (animationMatches >= 2) score += 20;
    else if (animationMatches >= 1) score += 10;
    else {
      missingElements.push('Rich animation system specifications');
    }
    
    // Check for professional architecture (15 points max)
    const architectureMatches = COMPLEXITY_TRIGGERS.professionalArchitecture.filter(trigger =>
      promptLower.includes(trigger.toLowerCase())
    ).length;
    
    if (architectureMatches >= 2) score += 15;
    else if (architectureMatches >= 1) score += 8;
    else {
      missingElements.push('Professional architecture details');
    }
    
    // Check for visual engagement (10 points max)
    const engagementMatches = COMPLEXITY_TRIGGERS.visualEngagement.filter(trigger =>
      promptLower.includes(trigger.toLowerCase())
    ).length;
    
    if (engagementMatches >= 2) score += 10;
    else if (engagementMatches >= 1) score += 5;
    else {
      missingElements.push('Visual engagement elements');
    }
    
    // Determine predicted complexity
    let predictedComplexity: 'basic' | 'moderate' | 'rich' | 'github4-level' = 'basic';
    if (score >= 85) predictedComplexity = 'github4-level';
    else if (score >= 65) predictedComplexity = 'rich';
    else if (score >= 35) predictedComplexity = 'moderate';
    
    return {
      predictedComplexity,
      confidence: score,
      missingElements
    };
  }
  
  /**
   * Upgrade basic prompt to rich, GitHub_4-level specifications
   */
  private upgradeToRichPrompt(originalPrompt: string, projectType?: string): PromptEnhancementResult {
    const architecture = this.buildRichPromptArchitecture(originalPrompt, projectType);
    const addedElements: string[] = [];
    
    let enhanced = `${architecture.role}\n\n${architecture.context}\n\n${architecture.objective}\n\n${architecture.constraints}\n\n${architecture.output}`;
    
    // Add specific complexity elements based on research
    if (!originalPrompt.toLowerCase().includes('data') && !originalPrompt.toLowerCase().includes('visualization')) {
      enhanced += `\n\n**CRITICAL DATA INTEGRATION:**\nInclude realistic GitHub contribution data (371 daily activity values), project statistics with actual numbers (star counts, fork counts, deployment metrics), and achievement milestones with meaningful progression tracking.`;
      addedElements.push('Rich data integration layer');
    }
    
    if (!originalPrompt.toLowerCase().includes('component') && !originalPrompt.toLowerCase().includes('background')) {
      enhanced += `\n\n**MULTI-COMPONENT ARCHITECTURE:**\nImplement specialized React components: AnimatedCodeBackground (scrolling code lines), ContributionGraph (371-square visualization), AchievementSystem (milestone cards), and ParticleNetwork (interconnected animation system).`;
      addedElements.push('Multi-component architecture');
    }
    
    if (!originalPrompt.toLowerCase().includes('animation') && !originalPrompt.toLowerCase().includes('spring')) {
      enhanced += `\n\n**ADVANCED ANIMATION SYSTEMS:**\nCreate 60+ interpolate animations with staggered timing (0.25 frame delays), energetic spring physics (damping: 10, stiffness: 180), continuous micro-motion (Math.sin/cos), and smooth professional easing curves.`;
      addedElements.push('Rich animation systems');
    }
    
    if (!originalPrompt.toLowerCase().includes('scale') && !originalPrompt.toLowerCase().includes('typography')) {
      enhanced += `\n\n**PROFESSIONAL VISUAL HIERARCHY:**\nUse commanding typography scale (84px hero titles, 36-48px section headers), wide container layouts (650-900px), professional font stacks, and dramatic visual effects with shadows and glows.`;
      addedElements.push('Professional visual hierarchy');
    }
    
    return {
      enhanced,
      complexity: 'github4-level',
      addedElements,
      expectedCharacterCount: 50000,
      confidenceScore: 90
    };
  }
  
  /**
   * Build research-validated prompt architecture
   */
  private buildRichPromptArchitecture(originalPrompt: string, projectType?: string): PromptArchitecture {
    // Determine project focus
    const isGitHubFocused = originalPrompt.toLowerCase().includes('github') || 
                           originalPrompt.toLowerCase().includes('contribution') ||
                           projectType === 'github';
    
    if (isGitHubFocused) {
      return {
        role: "ROLE: Advanced React/TypeScript developer specializing in data visualization, GitHub API integration, and professional video content creation with expertise in Remotion framework and 60fps animation optimization.",
        
        context: "CONTEXT: Creating a comprehensive GitHub portfolio showcase video that demonstrates development expertise through rich data visualization. The video should tell a compelling story of coding activity, achievements, and project impact using real GitHub contribution patterns, activity heatmaps, and project statistics.",
        
        objective: "OBJECTIVE: Generate a multi-layered video experience featuring: (1) Animated GitHub contribution graph with 371 daily activity squares, (2) Achievement milestone system with project showcases, (3) Rich animated background with scrolling code snippets, (4) Professional typography and visual hierarchy, (5) Smooth 60fps performance with frame-rate independent animations.",
        
        constraints: "CONSTRAINTS: Must include ContributionGraph component with realistic data arrays, CodeBackground component with animated syntax, AchievementSystem with milestone cards, professional spring physics (damping: 10-15, stiffness: 180), staggered animation timing across 300+ elements, GPU-optimized rendering, and 650px+ container widths for commanding screen presence.",
        
        output: "OUTPUT: 50,000+ character React/TypeScript codebase with component architecture, realistic data integration (contribution arrays, project metrics, achievement data), complex animation systems (60+ interpolations, 20+ continuous animations), and professional visual design matching GitHub's aesthetic standards."
      };
    } else {
      // Generic rich content architecture
      return {
        role: "ROLE: Expert motion graphics designer and React developer specializing in creating visually stunning, data-rich video content with professional animation systems and engaging user experiences.",
        
        context: "CONTEXT: Creating a premium portfolio showcase that demonstrates technical expertise through sophisticated visual design, rich content architecture, and professional animation systems that engage viewers and communicate value effectively.",
        
        objective: "OBJECTIVE: Generate a multi-component video system featuring: (1) Rich animated background with particle networks or dynamic elements, (2) Multiple content showcases with detailed information and statistics, (3) Professional animation timing with smooth transitions, (4) Visual hierarchy with dramatic typography and engaging layouts.",
        
        constraints: "CONSTRAINTS: Must include multiple specialized React components, rich background animation systems, professional typography scale (72-84px titles), wide container layouts (650px+), advanced animation systems with spring physics, and continuous visual motion for engagement.",
        
        output: "OUTPUT: 30,000+ character React/TypeScript codebase with sophisticated component architecture, engaging animation systems, professional visual design, and rich content that tells a compelling story through motion and data."
      };
    }
  }
  
  /**
   * Estimate expected character count based on complexity
   */
  private estimateCharacterCount(complexity: string): number {
    switch (complexity) {
      case 'github4-level': return 50000;
      case 'rich': return 35000;
      case 'moderate': return 20000;
      default: return 10000;
    }
  }
}

/**
 * Main MCP integration function - Auto-enhance prompts before content generation
 */
export async function enhancePromptForConsistentRichness(
  originalPrompt: string, 
  projectName: string
): Promise<{
  shouldUseEnhanced: boolean;
  enhancedPrompt: string;
  improvements: string[];
  predictedComplexity: string;
}> {
  const system = new PromptArchitectureSystem();
  
  // Detect project type from name and prompt
  let projectType = 'auto';
  if (originalPrompt.toLowerCase().includes('github') || projectName.toLowerCase().includes('github')) {
    projectType = 'github';
  }
  
  const enhancement = system.enhancePromptForRichness(originalPrompt, projectType);
  
  const shouldUseEnhanced = enhancement.addedElements.length > 0;
  
  return {
    shouldUseEnhanced,
    enhancedPrompt: enhancement.enhanced,
    improvements: enhancement.addedElements,
    predictedComplexity: enhancement.complexity
  };
}

/**
 * Quick richness check for MCP tools integration
 */
export function detectBasicPrompt(prompt: string): boolean {
  const system = new PromptArchitectureSystem();
  const analysis = system.analyzePromptComplexity(prompt);
  return analysis.predictedComplexity === 'basic' && analysis.confidence < 40;
}