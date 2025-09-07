// ASTRouter - Intelligent routing between specialized AST pipelines  
import { AnimationAST } from './AnimationAST.js';
import { ShowcaseAST } from './ShowcaseAST.js';

interface PipelineInterface {
  name: string;
  transform(jsx: string): Promise<string>;
}

export class ASTRouter {
  constructor() {
    console.error('[ROUTER] Initializing multi-pipeline AST router');
  }

  async convertArtifact(jsx: string, projectName: string): Promise<string> {
    console.error(`[ROUTER] Processing artifact for ${projectName} (${jsx.length} chars)`);
    
    try {
      // Classify and route to appropriate pipeline
      const pipelineType = this.classifyArtifact(jsx);
      console.error(`[ROUTER] Selected ${pipelineType} pipeline for ${projectName}`);
      
      // Simple pipeline selection without complex Map typing
      let pipeline: PipelineInterface;
      if (pipelineType === 'animation') {
        pipeline = new AnimationAST();
      } else if (pipelineType === 'showcase') {
        pipeline = new ShowcaseAST();
      } else {
        pipeline = new ShowcaseAST(); // Default to content preservation
      }
      
      const result = await pipeline.transform(jsx);
      
      console.error(`[ROUTER] ${pipeline.name} completed successfully for ${projectName}`);
      return result;
      
    } catch (error) {
      console.error(`[ROUTER] Pipeline routing failed for ${projectName}:`, error instanceof Error ? error.message : 'unknown');
      throw error;
    }
  }

  private classifyArtifact(jsx: string): string {
    console.error(`[ROUTER] Classifying artifact for pipeline selection`);
    
    // Animation indicators - cosmic waves, particles, mathematical animations
    const animationIndicators = [
      jsx.includes('Math.sin') || jsx.includes('Math.cos'),
      jsx.includes('particle') && jsx.includes('setInterval'),
      jsx.includes('cosmic') || jsx.includes('wave'),
      jsx.includes('setParticles') || jsx.includes('animate'),
      (jsx.match(/Math\./g) || []).length >= 3 // Heavy mathematical usage
    ];
    
    const animationScore = animationIndicators.filter(Boolean).length;
    
    // Showcase indicators - GitHub showcases, presentations, scene-based content
    const showcaseIndicators = [
      jsx.includes('currentScene') || jsx.includes('scenes'),
      jsx.includes('showcase') || jsx.includes('slides'), 
      jsx.includes('GitHub') || jsx.includes('github'),
      jsx.includes('presentation') || jsx.includes('demo'),
      jsx.length > 10000 // Large content artifacts
    ];
    
    const showcaseScore = showcaseIndicators.filter(Boolean).length;
    
    console.error(`[ROUTER] Animation score: ${animationScore}/5, Showcase score: ${showcaseScore}/5`);
    
    // Simple decision logic
    if (animationScore >= 2 && showcaseScore <= 1) {
      console.error(`[ROUTER] Classified as ANIMATION - using AnimationAST`);
      return 'animation';
    } else if (showcaseScore >= 2 || jsx.includes('currentScene')) {
      console.error(`[ROUTER] Classified as SHOWCASE - using ShowcaseAST`);
      return 'showcase';  
    } else {
      console.error(`[ROUTER] Classified as DEFAULT - using ShowcaseAST for content preservation`);
      return 'default';
    }
  }

  // Utility method for external classification queries
  getClassification(jsx: string): { type: string; confidence: number } {
    const type = this.classifyArtifact(jsx);
    
    // Simple confidence based on clear indicators
    if (type === 'animation') {
      const indicators = jsx.includes('Math.sin') && jsx.includes('particle');
      return { type, confidence: indicators ? 0.9 : 0.7 };
    } else if (type === 'showcase') {
      const indicators = jsx.includes('currentScene') && jsx.includes('scenes');
      return { type, confidence: indicators ? 0.9 : 0.7 };
    }
    
    return { type, confidence: 0.5 };
  }
}