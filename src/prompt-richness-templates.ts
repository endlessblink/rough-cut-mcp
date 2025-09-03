// Prompt Richness Templates - Ensure Consistent High-Quality Content Generation
// Based on research into prompt engineering for complex, engaging video content

interface PromptTemplate {
  type: 'data-visualization' | 'showcase' | 'tutorial' | 'brand-story';
  description: string;
  triggerKeywords: string[];
  template: string;
  expectedComplexity: 'rich' | 'moderate' | 'basic';
}

interface PromptEnhancement {
  original: string;
  enhanced: string;
  addedElements: string[];
  expectedImprovement: string;
}

// Research-backed prompt templates that consistently generate rich content
export const RICH_CONTENT_TEMPLATES: PromptTemplate[] = [
  {
    type: 'data-visualization',
    description: 'Generates GitHub_4-style rich data-driven content with contribution graphs, statistics, and animated visualizations',
    triggerKeywords: ['contributions', 'activity', 'stats', 'data', 'metrics', 'graph', 'visualization', 'analytics'],
    template: `Create a comprehensive GitHub profile showcase video featuring:

**Data Visualization Layer:**
- Animated contribution graph with 371 daily activity squares showing realistic coding patterns
- Real contribution statistics (like "693 contributions in the last year") 
- Monthly labels and progressive reveal animation
- Color-coded contribution intensity (0-4 levels) with realistic GitHub green theme

**Achievement Systems:**
- Milestone cards showing coding achievements (repositories created, commits made, languages learned)
- Progressive unlock animations with spring physics
- Achievement categories: Development, Collaboration, Innovation, Impact
- Real project showcases with star counts and technology badges

**Rich Background Elements:**
- Animated code snippets scrolling across the background
- Realistic code syntax highlighting and animation timing
- Multiple visual layers: code background + data viz + achievements + effects

**Technical Specifications:**
- Use staggered animation timing: contribution squares animate individually with 0.25 frame delays
- Implement smooth spring physics: damping 15, stiffness 80-100
- Apply professional typography hierarchy: 84px titles, 24px body, Monaco for code
- Create visual depth with backdrop filters, shadows, and layered transparency

**Performance Requirements:**
- 60fps smooth playback with frame-rate independent animations
- GPU-optimized transforms and willChange properties
- Memoized calculations for complex data arrays`,
    expectedComplexity: 'rich'
  },
  
  {
    type: 'showcase',
    description: 'Generates visually rich showcase with multiple projects, animated backgrounds, and engaging presentations',
    triggerKeywords: ['showcase', 'portfolio', 'projects', 'work', 'demo', 'featured'],
    template: `Create a dynamic portfolio showcase video featuring:

**Multi-Project Architecture:**
- 4-6 featured projects with detailed descriptions and technology stacks
- Realistic project statistics: GitHub stars, forks, deployment status, user metrics
- Technology badges and language indicators with color coding
- Project categories: Web Development, AI/ML, Mobile Apps, DevOps Tools

**Rich Visual Systems:**
- Animated technology constellation background with floating tech icons
- Particle networks connecting related projects
- Code snippet previews for each project with syntax highlighting
- Interactive hover effects and micro-animations

**Narrative Structure:**
- Hero introduction with animated title and professional tagline
- Project grid with staggered reveal animations (60 frame delays)
- Individual project deep-dives with slide-in effects
- Call-to-action conclusion with contact information and social links

**Visual Enhancement Details:**
- Large-scale typography: 72-84px hero titles, 36-48px project names
- Professional color palettes with accent colors for each technology
- Smooth easing curves: Easing.out(Easing.cubic) for premium feel
- Multi-layer composition: background + projects + effects + overlays`,
    expectedComplexity: 'rich'
  },
  
  {
    type: 'brand-story',
    description: 'Generates compelling brand narrative with journey visualization and milestone animations',
    triggerKeywords: ['brand', 'story', 'journey', 'mission', 'vision', 'company', 'startup'],
    template: `Create a compelling brand story video featuring:

**Journey Timeline Visualization:**
- Animated timeline showing company/personal development milestones
- Key achievement markers with specific dates and metrics
- Growth visualization: user base, revenue, impact metrics over time
- Interactive timeline scrubbing with smooth interpolated values

**Mission & Vision Presentation:**
- Bold mission statement with kinetic typography animation
- Vision board with animated concept illustrations
- Value proposition cards with staggered reveal timing
- Impact metrics and social proof elements

**Visual Storytelling Elements:**
- Animated infographic components showing growth and progress
- Morphing shapes and icons representing evolution and change
- Color journey: evolving palette representing brand development phases
- Particle systems representing network effects and connections

**Technical Implementation:**
- Complex data arrays for timeline events and metrics
- Multi-component architecture: Timeline + Metrics + Vision + CTA
- Professional motion design with 15+ spring animations
- Rich background systems with branded particle effects and gradients`,
    expectedComplexity: 'rich'
  }
];

/**
 * Prompt Richness Enhancement System
 */
export class PromptRichnessSystem {
  
  /**
   * Detect if a prompt will likely generate basic vs rich content
   */
  analyzePromptRichness(originalPrompt: string): {
    predictedComplexity: 'basic' | 'moderate' | 'rich';
    confidence: number;
    issues: string[];
    richnessTriggers: string[];
  } {
    const prompt = originalPrompt.toLowerCase();
    let score = 0;
    const issues: string[] = [];
    const richnessTriggers: string[] = [];
    
    // Check for data/visualization triggers
    const dataKeywords = ['data', 'stats', 'metrics', 'contributions', 'activity', 'graph', 'chart'];
    const dataMatches = dataKeywords.filter(keyword => prompt.includes(keyword));
    if (dataMatches.length > 0) {
      score += 30;
      richnessTriggers.push(`Data visualization: ${dataMatches.join(', ')}`);
    } else {
      issues.push('No data visualization triggers - may generate basic showcase');
    }
    
    // Check for complexity indicators
    const complexityKeywords = ['animated', 'interactive', 'dynamic', 'rich', 'complex', 'detailed'];
    const complexityMatches = complexityKeywords.filter(keyword => prompt.includes(keyword));
    if (complexityMatches.length >= 2) {
      score += 25;
      richnessTriggers.push(`Complexity indicators: ${complexityMatches.join(', ')}`);
    } else {
      issues.push('Limited complexity descriptors - may generate simple content');
    }
    
    // Check for specific visual elements
    const visualKeywords = ['background', 'particles', 'animation', 'layers', 'effects'];
    const visualMatches = visualKeywords.filter(keyword => prompt.includes(keyword));
    if (visualMatches.length >= 2) {
      score += 20;
      richnessTriggers.push(`Visual elements: ${visualMatches.join(', ')}`);
    } else {
      issues.push('Few visual element descriptors - may generate minimal backgrounds');
    }
    
    // Check for narrative structure
    const narrativeKeywords = ['story', 'journey', 'timeline', 'progression', 'achievement'];
    const narrativeMatches = narrativeKeywords.filter(keyword => prompt.includes(keyword));
    if (narrativeMatches.length > 0) {
      score += 15;
      richnessTriggers.push(`Narrative structure: ${narrativeMatches.join(', ')}`);
    }
    
    // Check for technical specifications
    const techKeywords = ['component', 'system', 'architecture', 'multi-layer', 'staggered'];
    const techMatches = techKeywords.filter(keyword => prompt.includes(keyword));
    if (techMatches.length > 0) {
      score += 10;
      richnessTriggers.push(`Technical specs: ${techMatches.join(', ')}`);
    }
    
    let predictedComplexity: 'basic' | 'moderate' | 'rich' = 'basic';
    if (score >= 70) predictedComplexity = 'rich';
    else if (score >= 40) predictedComplexity = 'moderate';
    
    return {
      predictedComplexity,
      confidence: score,
      issues,
      richnessTriggers
    };
  }
  
  /**
   * Enhance a basic prompt to consistently generate rich content
   */
  enhancePromptForRichness(originalPrompt: string, projectType: 'github' | 'portfolio' | 'brand' | 'auto'): PromptEnhancement {
    // Detect project type if auto
    let detectedType = projectType;
    if (projectType === 'auto') {
      const prompt = originalPrompt.toLowerCase();
      if (prompt.includes('github') || prompt.includes('contribution')) {
        detectedType = 'github';
      } else if (prompt.includes('portfolio') || prompt.includes('showcase')) {
        detectedType = 'portfolio';  
      } else {
        detectedType = 'brand';
      }
    }
    
    // Get appropriate template
    const template = this.getTemplateForType(detectedType as 'github' | 'portfolio' | 'brand');
    
    // Merge original prompt with rich template
    const enhanced = this.mergePromptWithTemplate(originalPrompt, template);
    
    return {
      original: originalPrompt,
      enhanced: enhanced.prompt,
      addedElements: enhanced.additions,
      expectedImprovement: enhanced.improvement
    };
  }
  
  /**
   * Get template for specific project type
   */
  private getTemplateForType(type: 'github' | 'portfolio' | 'brand'): PromptTemplate {
    switch (type) {
      case 'github':
        return RICH_CONTENT_TEMPLATES.find(t => t.type === 'data-visualization') || RICH_CONTENT_TEMPLATES[0];
      case 'portfolio':
        return RICH_CONTENT_TEMPLATES.find(t => t.type === 'showcase') || RICH_CONTENT_TEMPLATES[1];
      case 'brand':
        return RICH_CONTENT_TEMPLATES.find(t => t.type === 'brand-story') || RICH_CONTENT_TEMPLATES[2];
      default:
        return RICH_CONTENT_TEMPLATES[0];
    }
  }
  
  /**
   * Merge original prompt with rich template
   */
  private mergePromptWithTemplate(original: string, template: PromptTemplate): {
    prompt: string;
    additions: string[];
    improvement: string;
  } {
    const additions: string[] = [];
    
    let enhanced = original;
    
    // Add data visualization layer if missing
    if (!original.toLowerCase().includes('data') && !original.toLowerCase().includes('visualization')) {
      enhanced += `\n\nInclude rich data visualization elements like contribution graphs, activity heatmaps, or project statistics with realistic numbers and animated reveals.`;
      additions.push('Data visualization layer');
    }
    
    // Add background system specification
    if (!original.toLowerCase().includes('background') && !original.toLowerCase().includes('animated')) {
      enhanced += `\n\nImplement animated background system with scrolling code lines, particle networks, or dynamic visual elements that provide continuous motion and visual interest.`;
      additions.push('Rich animated background system');
    }
    
    // Add component architecture guidance
    if (!original.toLowerCase().includes('component') && !original.toLowerCase().includes('system')) {
      enhanced += `\n\nUse multi-component architecture with specialized React components for different visual systems (background, data, content, effects) working together harmoniously.`;
      additions.push('Multi-component architecture');
    }
    
    // Add animation complexity requirements
    if (!original.toLowerCase().includes('animation') && !original.toLowerCase().includes('spring')) {
      enhanced += `\n\nImplement rich animation systems with staggered timing, spring physics, and continuous micro-motion. Use 60+ interpolate calls and 20+ continuous animations for dynamic feel.`;
      additions.push('Complex animation systems');
    }
    
    // Add scale and impact requirements
    if (!original.toLowerCase().includes('scale') && !original.toLowerCase().includes('impact')) {
      enhanced += `\n\nEnsure dramatic scale and visual impact: 72-84px titles, 650px+ containers, bold typography hierarchy, and professional visual design that commands attention.`;
      additions.push('Scale and visual impact');
    }
    
    const improvement = `Enhanced prompt should generate GitHub_4-level rich content with ${additions.length} additional complexity layers: ${additions.join(', ')}`;
    
    return {
      prompt: enhanced,
      additions,
      improvement
    };
  }
}

/**
 * Main exports for MCP integration
 */
export async function enhancePromptForConsistentQuality(prompt: string, projectType: 'github' | 'portfolio' | 'brand' | 'auto' = 'auto') {
  const system = new PromptRichnessSystem();
  return system.enhancePromptForRichness(prompt, projectType);
}

export function analyzePromptComplexity(prompt: string) {
  const system = new PromptRichnessSystem();
  return system.analyzePromptRichness(prompt);
}