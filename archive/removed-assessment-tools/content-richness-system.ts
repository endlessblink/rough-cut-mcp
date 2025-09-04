// Content Richness System - Automatically Upgrade Basic Content to Engaging
// Ensures consistent high-quality, visually interesting output every time

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface ContentAnalysis {
  richness: 'basic' | 'moderate' | 'rich' | 'github4-level';
  score: number;
  issues: ContentIssue[];
  upgradeOpportunities: ContentUpgrade[];
}

interface ContentIssue {
  type: 'generic-showcase' | 'static-background' | 'minimal-data' | 'simple-layout';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectsAppeal: boolean;
}

interface ContentUpgrade {
  from: string;
  to: string;
  impact: 'moderate' | 'high' | 'dramatic';
  description: string;
  implementation: string;
}

// Rich content patterns extracted from GitHub_4 success
const RICH_CONTENT_PATTERNS = {
  dataVisualization: {
    contributionGraphs: `Array.from({ length: 371 }).map((_, i) => ({ activity: data[i], delay: i * 0.25 }))`,
    achievementSystems: `achievements.map((achievement, index) => ({ ...achievement, staggerDelay: index * 60 }))`,
    realTimeStats: `interpolate(frame, [0, 300], [0, 693]) // Counting animation`
  },
  
  backgroundSystems: {
    animatedCode: `scrolling code lines with realistic syntax and timing`,
    particleNetworks: `interconnected particle systems with physics`,
    dataFlows: `animated data streams and connection visualizations`
  },
  
  layoutArchitectures: {
    dataStory: `intro → data visualization → achievements → conclusion`,
    showcase: `hero → featured content → call-to-action`,
    journey: `timeline → milestones → current state → future`
  },
  
  visualComplexity: {
    multiLayer: `background + data + foreground + effects (4+ layers)`,
    staggeredAnimation: `sequential reveals building excitement`,
    continuousMotion: `always something moving, never static`
  }
};

/**
 * Content Richness Detection and Upgrade System
 */
export class ContentRichnessSystem {
  
  /**
   * Analyze content richness and automatically upgrade if basic
   */
  async analyzeAndUpgrade(jsx: string, projectName: string): Promise<{
    analysis: ContentAnalysis;
    upgradedJSX: string;
    upgradesApplied: string[];
    needsManualRework: boolean;
  }> {
    console.error('[CONTENT-RICHNESS] Analyzing content richness level...');
    
    const analysis = this.analyzeContentRichness(jsx);
    console.error(`[CONTENT-RICHNESS] Richness level: ${analysis.richness} (${analysis.score}/100)`);
    
    let upgradedJSX = jsx;
    const upgradesApplied: string[] = [];
    let needsManualRework = false;
    
    // Automatic upgrades for basic content
    if (analysis.richness === 'basic' || analysis.score < 40) {
      console.error('[CONTENT-RICHNESS] Content too basic - applying automatic upgrades...');
      
      // Upgrade 1: Add rich animated background if missing
      if (analysis.issues.some(issue => issue.type === 'static-background')) {
        upgradedJSX = this.addRichAnimatedBackground(upgradedJSX);
        upgradesApplied.push('Added animated code background system (GitHub_4 pattern)');
      }
      
      // Upgrade 2: Convert to data-driven approach if generic
      if (analysis.issues.some(issue => issue.type === 'generic-showcase')) {
        const dataUpgrade = this.convertToDataDriven(upgradedJSX, projectName);
        upgradedJSX = dataUpgrade.jsx;
        upgradesApplied.push(...dataUpgrade.changes);
      }
      
      // Upgrade 3: Add visual complexity layers
      if (analysis.issues.some(issue => issue.type === 'simple-layout')) {
        upgradedJSX = this.addVisualComplexityLayers(upgradedJSX);
        upgradesApplied.push('Added visual complexity layers for depth');
      }
      
      // Check if still too basic after upgrades
      const newAnalysis = this.analyzeContentRichness(upgradedJSX);
      if (newAnalysis.score < 60) {
        needsManualRework = true;
      }
    }
    
    return {
      analysis,
      upgradedJSX,
      upgradesApplied,
      needsManualRework
    };
  }
  
  /**
   * Analyze content richness level
   */
  public analyzeContentRichness(jsx: string): ContentAnalysis {
    const issues: ContentIssue[] = [];
    const upgradeOpportunities: ContentUpgrade[] = [];
    let score = 0;
    
    // Check for data richness
    const dataArrays = (jsx.match(/\[[^\]]{100,}\]/g) || []).length; // Large data arrays
    const realNumbers = (jsx.match(/\b\d{3,}\b/g) || []).length; // Meaningful numbers
    
    if (dataArrays >= 3) score += 25;
    else if (dataArrays >= 1) score += 10;
    else {
      issues.push({
        type: 'minimal-data',
        severity: 'high',
        description: 'No substantial data arrays for visualization',
        affectsAppeal: true
      });
    }
    
    if (realNumbers >= 50) score += 25;
    else if (realNumbers >= 10) score += 10;
    else {
      issues.push({
        type: 'minimal-data', 
        severity: 'medium',
        description: 'Limited real data points for meaningful animation',
        affectsAppeal: true
      });
    }
    
    // Check for background complexity
    const hasAnimatedBackground = jsx.includes('CodeBackground') || jsx.includes('AnimatedBackground');
    const hasComplexParticles = jsx.includes('Array.from({ length:') && jsx.includes('particle');
    
    if (hasAnimatedBackground && hasComplexParticles) score += 25;
    else if (hasAnimatedBackground || hasComplexParticles) score += 10;
    else {
      issues.push({
        type: 'static-background',
        severity: 'high', 
        description: 'Simple gradient background lacks visual interest',
        affectsAppeal: true
      });
    }
    
    // Check for component architecture
    const customComponents = (jsx.match(/const\s+[A-Z]\w+\s*[=:][^{]*=>/g) || []).length;
    
    if (customComponents >= 4) score += 25;
    else if (customComponents >= 2) score += 10;
    else {
      issues.push({
        type: 'simple-layout',
        severity: 'medium',
        description: 'Monolithic structure lacks specialized components',
        affectsAppeal: true
      });
    }
    
    // Determine richness level
    let richness: ContentAnalysis['richness'] = 'basic';
    if (score >= 80) richness = 'github4-level';
    else if (score >= 60) richness = 'rich';
    else if (score >= 40) richness = 'moderate';
    
    // Generate upgrade opportunities
    if (score < 60) {
      upgradeOpportunities.push({
        from: 'Basic showcase structure',
        to: 'Data-driven visualization approach',
        impact: 'dramatic',
        description: 'Transform into GitHub contribution graph or achievement system',
        implementation: 'Add contribution data arrays and specialized visualization components'
      });
    }
    
    if (!hasAnimatedBackground) {
      upgradeOpportunities.push({
        from: 'Static gradient background',
        to: 'Animated code/data background system',
        impact: 'dramatic',
        description: 'Add scrolling code lines or data visualization background',
        implementation: 'CodeBackground component with animated text streams'
      });
    }
    
    return {
      richness,
      score,
      issues: issues.filter(issue => issue.affectsAppeal),
      upgradeOpportunities
    };
  }
  
  /**
   * Add rich animated background system
   */
  private addRichAnimatedBackground(jsx: string): string {
    const animatedBackground = `
// ✅ AUTO-UPGRADE: Rich animated background for visual interest
const AnimatedCodeBackground = () => {
  const frame = useCurrentFrame();
  
  const codeLines = [
    'const innovation = "endless";',
    'import { MCP, AI } from "tools";',
    'git commit -m "breakthrough"',
    'npm install creativity',
    'export class Builder {',
    '  async deploy() {',
    '    return await this.create();',
    '  }',
    '}',
    'function buildAmazing() {',
    '  return "success";',
    '}',
    '// Building the future...',
    'docker build -t innovation .',
    'git push origin main',
    'while(coding) { innovate(); }',
    'kubectl apply -f deployment.yaml'
  ];
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden', zIndex: 0 }}>
      {codeLines.map((line, i) => {
        const delay = i * 30;
        const cycleFrame = frame % 600;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 120 + i * 60,
              left: interpolate(cycleFrame - delay, [0, 500], [-300, 1920], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              }),
              opacity: interpolate(cycleFrame - delay, [0, 60, 400, 460], [0, 0.15, 0.15, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              }),
              color: '#30363d',
              fontSize: '20px',
              fontFamily: 'Monaco, Consolas, monospace',
              whiteSpace: 'nowrap'
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};`;

    // Insert after imports
    const importEndIndex = jsx.lastIndexOf('} from \'remotion\';');
    if (importEndIndex !== -1) {
      const insertPoint = jsx.indexOf('\n', importEndIndex) + 1;
      return jsx.slice(0, insertPoint) + '\n' + animatedBackground + '\n' + jsx.slice(insertPoint);
    }
    
    return jsx;
  }
  
  /**
   * Convert basic showcase to data-driven approach
   */
  private convertToDataDriven(jsx: string, projectName: string): { jsx: string; changes: string[] } {
    const changes: string[] = [];
    
    // Check if it's a GitHub-related project
    if (projectName.toLowerCase().includes('github') || jsx.includes('github')) {
      // Add contribution data system
      const contributionData = this.generateContributionData();
      const contributionComponent = this.generateContributionGraphComponent();
      
      let upgradedJSX = jsx;
      
      // Add contribution data array
      const dataInsertPoint = jsx.indexOf('const GitHubShowcase') || jsx.indexOf('const ') || jsx.indexOf('export');
      if (dataInsertPoint !== -1) {
        upgradedJSX = jsx.slice(0, dataInsertPoint) + contributionData + '\n\n' + jsx.slice(dataInsertPoint);
        changes.push('Added realistic GitHub contribution data (371 data points)');
      }
      
      // Add contribution graph component
      const componentInsertPoint = jsx.lastIndexOf('} from \'remotion\';');
      if (componentInsertPoint !== -1) {
        const insertPoint = jsx.indexOf('\n', componentInsertPoint) + 1;
        upgradedJSX = jsx.slice(0, insertPoint) + '\n' + contributionComponent + '\n' + jsx.slice(insertPoint);
        changes.push('Added contribution graph visualization component');
      }
      
      return { jsx: upgradedJSX, changes };
    }
    
    return { jsx, changes: [] };
  }
  
  /**
   * Add visual complexity layers
   */
  private addVisualComplexityLayers(jsx: string): string {
    // Add interconnected particle system
    const complexParticles = `
  // ✅ AUTO-UPGRADE: Complex particle network for visual depth
  const networkParticles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 250 + Math.sin(frame * 0.008 + i) * 50;
    const x = Math.cos(angle + frame * 0.003) * radius;
    const y = Math.sin(angle + frame * 0.003) * radius;
    
    return { 
      x, y, 
      pulse: Math.sin(frame * 0.025 + i) * 0.4 + 0.6,
      connection: Math.sin(frame * 0.01 + i * 0.5) * 0.3 + 0.7
    };
  });
  
  const connectionLines = networkParticles.map((particle, i) => {
    const nextParticle = networkParticles[(i + 1) % networkParticles.length];
    const distance = Math.sqrt(Math.pow(particle.x - nextParticle.x, 2) + Math.pow(particle.y - nextParticle.y, 2));
    
    return {
      x1: particle.x, y1: particle.y,
      x2: nextParticle.x, y2: nextParticle.y,
      opacity: distance < 300 ? particle.connection * 0.2 : 0
    };
  });`;

    // Insert particle upgrade
    const particleInsertPoint = jsx.indexOf('const particles = ');
    if (particleInsertPoint !== -1) {
      const endOfParticlesLine = jsx.indexOf('});', particleInsertPoint) + 3;
      return jsx.slice(0, endOfParticlesLine) + '\n' + complexParticles + '\n' + jsx.slice(endOfParticlesLine);
    }
    
    return jsx;
  }
  
  /**
   * Generate realistic contribution data like GitHub_4
   */
  private generateContributionData(): string {
    // Generate 371 realistic contribution values (like GitHub_4)
    const contributions = Array.from({ length: 371 }, () => Math.floor(Math.random() * 5));
    const contributionString = contributions.join(', ');
    
    return `
// ✅ AUTO-UPGRADE: Realistic GitHub contribution data for visualization
const contributionData = [
  ${contributionString}
];`;
  }
  
  /**
   * Generate contribution graph component (simplified GitHub_4 pattern)
   */
  private generateContributionGraphComponent(): string {
    return `
// ✅ AUTO-UPGRADE: GitHub contribution graph visualization component
const ContributionGraph = () => {
  const frame = useCurrentFrame();
  
  return (
    <div style={{
      display: 'flex',
      gap: '3px',
      background: 'rgba(255,255,255,0.05)',
      padding: '20px',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      {Array.from({ length: 53 }).map((_, weekIndex) => (
        <div key={weekIndex} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const dataIndex = weekIndex * 7 + dayIndex;
            const intensity = contributionData[dataIndex] || 0;
            const delay = 60 + dataIndex * 0.2;
            
            const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            });
            
            const scale = interpolate(frame - delay, [0, 10, 15], [0, 1.2, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            });
            
            const getColor = (level) => {
              switch(level) {
                case 0: return '#161b22';
                case 1: return '#0e4429';
                case 2: return '#006d32';
                case 3: return '#26a641';
                case 4: return '#39d353';
                default: return '#161b22';
              }
            };
            
            return (
              <div
                key={dayIndex}
                style={{
                  width: '11px',
                  height: '11px',
                  backgroundColor: getColor(intensity),
                  borderRadius: '2px',
                  opacity,
                  transform: \`scale(\${scale})\`,
                  border: intensity > 0 ? \`1px solid \${getColor(Math.min(intensity + 1, 4))}60\` : 'none'
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};`;
  }
}

/**
 * Main export for MCP integration
 */
export async function autoUpgradeContentRichness(jsx: string, projectName: string) {
  const system = new ContentRichnessSystem();
  return await system.analyzeAndUpgrade(jsx, projectName);
}

/**
 * Detect if content needs upgrading (for create_project integration)
 */
export function detectContentNeedsUpgrade(jsx: string): boolean {
  const system = new ContentRichnessSystem();
  const analysis = system.analyzeContentRichness(jsx);
  return analysis.score < 50 || analysis.richness === 'basic';
}