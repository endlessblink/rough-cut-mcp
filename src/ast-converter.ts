// AST-based Artifact to Remotion conversion for high-quality consistency
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import * as fs from 'fs';
import * as path from 'path';

// Get absolute path to OUR project directory (not Claude Desktop's working directory)
function getOurProjectRoot(): string {
  // __filename points to our build/ast-converter.js file
  const buildDir = path.dirname(__filename);
  return path.dirname(buildDir); // Go up one level to project root
}

// Dedicated log file for AST debugging in OUR project  
const AST_LOG_FILE = path.join(getOurProjectRoot(), 'logs', 'ast-debug.log');

function logAST(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}: ${message}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AST_LOG_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(AST_LOG_FILE, logEntry);
  console.error(`[AST-LOG] ${message}`);
}

// Phase 1: Safe object structure detection (ZERO RISK - Just detection, no usage)
function analyzeObjectStructureSafely(useEffectNode: any): any {
  if (!useEffectNode) return null;
  
  try {
    logAST('[SAFE-DETECT] Starting safe object structure analysis');
    const objectStructures: any[] = [];
    
    function walkNodeSafely(node: any, depth = 0): void {
      if (!node || typeof node !== 'object' || depth > 8) return;
      
      // Enhanced debugging for detection issues
      if (node.type === 'CallExpression' && depth < 5) {
        const calleeName = node.callee?.name || node.callee?.property?.name || 'unknown';
        logAST(`[SAFE-DETECT-DEBUG] Found CallExpression at depth ${depth}: ${node.callee?.type || 'unknown'}.${calleeName}`);
        
        // Specific debug for push calls
        if (calleeName === 'push') {
          logAST(`[SAFE-DETECT-DEBUG] FOUND PUSH CALL! Args: ${node.arguments?.length || 0}, First arg type: ${node.arguments?.[0]?.type || 'none'}`);
        }
      }
      
      // Look for ANY_VARIABLE.push({ ... }) patterns (including local arrays like newParticles.push)
      if (node.type === 'CallExpression' &&
          node.callee?.type === 'MemberExpression' &&
          node.callee?.property?.name === 'push' &&
          node.arguments?.length > 0 &&
          node.arguments[0]?.type === 'ObjectExpression') {
        
        const objectProps = node.arguments[0].properties.map((prop: any) => ({
          name: prop.key?.name || 'unknown',
          type: prop.value?.type || 'unknown',
          semanticType: analyzePropertySemantics(prop.key?.name || 'unknown'),
          originalValue: prop.value
        }));
        
        objectStructures.push({
          properties: objectProps,
          totalProperties: objectProps.length,
          arrayContext: extractArrayContext(node)
        });
        
        logAST(`[SAFE-DETECT] Found object: ${objectProps.length} props: ${objectProps.map((p: any) => p.name).join(', ')}`);
      }
      
      // Safely walk child nodes
      for (const key in node) {
        if (key === 'parent' || key === 'loc' || key === 'range') continue;
        
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach((item: any) => walkNodeSafely(item, depth + 1));
        } else if (child && typeof child === 'object' && child.type) {
          walkNodeSafely(child, depth + 1);
        }
      }
    }
    
    walkNodeSafely(useEffectNode);
    logAST(`[SAFE-DETECT] Analysis complete: ${objectStructures.length} structures found`);
    return objectStructures[0] || null;
    
  } catch (error) {
    logAST(`[SAFE-DETECT] Detection failed safely: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null; // Safe fallback
  }
}

function analyzePropertySemantics(propertyName: string): string {
  if (!propertyName) return 'GENERIC';
  
  const name = propertyName.toLowerCase();
  
  // Position properties
  if (['x', 'left', 'translatex', 'offsetx', 'centerx'].includes(name)) return 'POSITION_X';
  if (['y', 'top', 'translatey', 'offsety', 'centery'].includes(name)) return 'POSITION_Y';
  
  // Size properties  
  if (['width', 'height', 'size', 'radius', 'scale', 'diameter'].includes(name)) return 'SIZE';
  
  // Color properties
  if (['color', 'backgroundcolor', 'fill', 'stroke', 'hue', 'tint'].includes(name)) return 'COLOR';
  
  // Velocity properties
  if (['vx', 'vy', 'velocity', 'speed', 'dx', 'dy'].includes(name)) return 'VELOCITY';
  
  // Timing properties
  if (['delay', 'duration', 'phase', 'offset', 'animationdelay'].includes(name)) return 'TIMING';
  
  // Rotation properties
  if (['rotation', 'angle', 'rotate', 'spin', 'orientation'].includes(name)) return 'ROTATION';
  
  // Opacity properties
  if (['opacity', 'alpha', 'transparency', 'visibility'].includes(name)) return 'OPACITY';
  
  return 'GENERIC';
}

function convertExistingPatternToSemantic(existingPattern: any, varName: string): any {
  if (!existingPattern || !t.isObjectExpression(existingPattern)) {
    logAST(`[CONVERT-SEMANTIC] Invalid pattern for ${varName}`);
    return null;
  }
  
  try {
    logAST(`[CONVERT-SEMANTIC] Converting existing pattern for ${varName} with ${existingPattern.properties.length} properties`);
    
    const semanticProperties = existingPattern.properties.map((prop: any) => {
      const propName = prop.key?.name || 'unknown';
      const semanticType = analyzePropertySemantics(propName);
      
      logAST(`[CONVERT-SEMANTIC] Property: ${propName} → ${semanticType}`);
      
      return {
        name: propName,
        semanticType: semanticType,
        originalValue: prop.value,
        type: prop.value?.type || 'unknown'
      };
    });
    
    const result = {
      properties: semanticProperties,
      totalProperties: semanticProperties.length,
      varName: varName
    };
    
    logAST(`[CONVERT-SEMANTIC] Converted ${semanticProperties.length} properties for ${varName}`);
    return result;
    
  } catch (error) {
    logAST(`[CONVERT-SEMANTIC] Conversion failed for ${varName}: ${error instanceof Error ? error.message : 'unknown'}`);
    return null;
  }
}

function extractArrayContext(pushNode: any): string {
  try {
    if (pushNode.callee?.object?.name) {
      return pushNode.callee.object.name;
    }
    return 'unknownArray';
  } catch {
    return 'unknownArray';
  }
}

// Phase 2: Semantic property analysis with mandatory fallbacks (MINIMAL RISK)
function createUniversalSemanticFrameValue(propertyName: string, originalValue: any): any {
  const frame = t.callExpression(t.identifier('useCurrentFrame'), []);
  const indexVar = t.identifier('i');
  
  try {
    const semanticType = analyzePropertySemantics(propertyName);
    logAST(`[SEMANTIC] Converting ${propertyName} as ${semanticType}`);
    
    switch (semanticType) {
      case 'POSITION_X':
        return t.binaryExpression('+',
          t.binaryExpression('*',
            t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('sin')), [
              t.binaryExpression('+',
                t.binaryExpression('*', frame, t.numericLiteral(0.02)),
                t.binaryExpression('*', indexVar, t.numericLiteral(0.3))
              )
            ]),
            t.numericLiteral(200)
          ),
          t.numericLiteral(400)
        );
        
      case 'POSITION_Y':
        return t.binaryExpression('+',
          t.binaryExpression('*',
            t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('cos')), [
              t.binaryExpression('+',
                t.binaryExpression('*', frame, t.numericLiteral(0.025)),
                t.binaryExpression('*', indexVar, t.numericLiteral(0.4))
              )
            ]),
            t.numericLiteral(150)
          ),
          t.numericLiteral(300)
        );
        
      case 'VELOCITY':
        const isY = propertyName.toLowerCase().includes('y');
        return t.binaryExpression('*',
          t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('sin')), [
            t.binaryExpression('+', frame, indexVar)
          ]),
          t.numericLiteral(isY ? 1.5 : 2)
        );
        
      case 'SIZE':
        return t.binaryExpression('+',
          t.numericLiteral(3),
          t.binaryExpression('*',
            t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('sin')), [
              t.binaryExpression('+', frame, indexVar)
            ]),
            t.numericLiteral(2)
          )
        );
        
      case 'COLOR':
        return t.templateLiteral([
          t.templateElement({ cooked: 'hsl(', raw: 'hsl(' }),
          t.templateElement({ cooked: ', 70%, 60%)', raw: ', 70%, 60%)' })
        ], [
          t.binaryExpression('%',
            t.binaryExpression('+',
              t.binaryExpression('*', indexVar, t.numericLiteral(137.5)),
              t.binaryExpression('*', frame, t.numericLiteral(2))
            ),
            t.numericLiteral(360)
          )
        ]);
        
      case 'TIMING':
        const baseDelay = propertyName.toLowerCase().includes('duration') ? 2 : 1;
        return t.binaryExpression('+',
          t.numericLiteral(baseDelay),
          t.binaryExpression('*',
            t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('sin')), [
              t.binaryExpression('*', indexVar, t.numericLiteral(0.5))
            ]),
            t.numericLiteral(0.5)
          )
        );
        
      case 'ROTATION':
        return t.binaryExpression('*', frame, t.numericLiteral(0.1));
        
      case 'OPACITY':
        return t.binaryExpression('+',
          t.numericLiteral(0.6),
          t.binaryExpression('*',
            t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('sin')), [
              t.binaryExpression('*', frame, t.numericLiteral(0.08))
            ]),
            t.numericLiteral(0.4)
          )
        );
        
      default:
        // Preserve original if we can't determine semantics
        return originalValue || t.identifier('i');
    }
    
  } catch (error) {
    logAST(`[SEMANTIC-FALLBACK] Failed for ${propertyName}, using safe default`);
    return originalValue || t.identifier('i');
  }
}

function createUniversalStructurePreservingFrame(varName: string, discoveredStructure: any): any {
  if (!discoveredStructure || !discoveredStructure.properties) {
    logAST(`[UNIVERSAL-FALLBACK] No structure for ${varName}, using existing logic`);
    return null; // Signal to use existing conversion
  }
  
  try {
    logAST(`[UNIVERSAL] Creating structure-preserving frame for ${varName} with ${discoveredStructure.properties.length} properties`);
    
    const frameBasedProperties = discoveredStructure.properties.map((prop: any) => {
      return t.objectProperty(
        t.identifier(prop.name),
        createUniversalSemanticFrameValue(prop.name, prop.originalValue)
      );
    });

    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(varName),
        t.callExpression(
          t.memberExpression(t.identifier('Array'), t.identifier('from')),
          [
            t.objectExpression([
              t.objectProperty(t.identifier('length'), t.numericLiteral(50)) // Maintain complexity
            ]),
            t.arrowFunctionExpression(
              [t.identifier('_'), t.identifier('i')],
              t.objectExpression(frameBasedProperties)
            )
          ]
        )
      )
    ]);
    
  } catch (error) {
    logAST(`[UNIVERSAL-FALLBACK] Structure creation failed for ${varName}: ${error instanceof Error ? error.message : 'unknown'}`);
    return null; // Signal to use existing conversion
  }
}

// Scene count extraction for navigation frame-based progression
function extractSceneCount(jsx: string): number {
  try {
    logAST(`[SCENE-COUNT] Analyzing JSX for scene count detection`);
    
    // Look for scenes array patterns
    const sceneArrayPatterns = [
      /scenes\s*=\s*\[\s*([\s\S]*?)\s*\]/,           // scenes = [...]
      /const\s+scenes\s*=\s*\[\s*([\s\S]*?)\s*\]/,   // const scenes = [...]
      /\[\s*{\s*id:\s*['"][^'"]+['"][\s\S]*?\s*\]/   // [{ id: '...', ... }]
    ];
    
    for (const pattern of sceneArrayPatterns) {
      const match = jsx.match(pattern);
      if (match) {
        const sceneContent = match[1] || match[0];
        
        // Count scene objects by counting opening braces after commas or start
        const sceneObjects = sceneContent.match(/{[^{}]*id\s*:/g) || [];
        const sceneCount = sceneObjects.length;
        
        logAST(`[SCENE-COUNT] Found ${sceneCount} scenes using array pattern`);
        if (sceneCount > 0) {
          return Math.max(sceneCount, 3); // Minimum 3 for progression
        }
      }
    }
    
    // Fallback: count individual scene definitions
    const sceneIdMatches = jsx.match(/id:\s*['"][^'"]+['"]/g) || [];
    const fallbackCount = sceneIdMatches.length;
    
    logAST(`[SCENE-COUNT] Fallback count: ${fallbackCount} scene IDs found`);
    return Math.max(fallbackCount, 5); // Default to 5 scenes if detection fails
    
  } catch (error) {
    logAST(`[SCENE-COUNT] Scene count extraction failed: ${error instanceof Error ? error.message : 'unknown'}, defaulting to 5`);
    return 5; // Safe default
  }
}

// Emergency fix: Artifact classification to prevent content destruction
function classifyArtifact(jsx: string, useStateVars: Set<string>): { isContentHeavy: boolean; isAnimationHeavy: boolean; shouldPreserveContent: boolean } {
  try {
    logAST(`[CLASSIFY] Starting artifact classification for ${jsx.length} chars`);
    
    // Content indicators (suggests preserve original structure)
    const contentIndicators = [
      jsx.length > 8000,                                    // Large content artifacts
      jsx.includes('slides') || jsx.includes('showcase'),   // Content structure keywords
      jsx.includes('scenes') || jsx.includes('sections') || jsx.includes('pages'),    // Layout structure
      jsx.includes('title') && jsx.includes('description'), // Text content patterns
      jsx.includes('portfolio') || jsx.includes('dashboard'), // Content types
      (jsx.match(/slides\[|slides\s*=|scenes\[|scenes\s*=/g) || []).length > 0,  // Content array usage
      Array.from(useStateVars).includes('currentSlide') || Array.from(useStateVars).includes('currentPage') || Array.from(useStateVars).includes('currentScene') // Navigation state
    ];
    
    // Animation indicators (suggests apply enhanced mode)
    const animationIndicators = [
      jsx.includes('Math.sin') || jsx.includes('Math.cos'),     // Mathematical animations
      jsx.includes('setInterval') && jsx.includes('particle'),  // Animation loops with particles
      jsx.includes('requestAnimationFrame'),                    // Animation frame requests
      (jsx.match(/particle|wave|bounce|spring|orbit/gi) || []).length >= 2, // Animation keywords
      Array.from(useStateVars).filter(v => v.toLowerCase().includes('particle')).length >= 1, // Particle state
      jsx.includes('useEffect') && jsx.includes('Math.'),      // Math in effects
      (jsx.match(/useState.*Math\./g) || []).length >= 2       // Math in useState
    ];
    
    const contentScore = contentIndicators.filter(Boolean).length;
    const animationScore = animationIndicators.filter(Boolean).length;
    
    logAST(`[CLASSIFY] Content score: ${contentScore}/7, Animation score: ${animationScore}/7`);
    
    const isContentHeavy = (contentScore >= 2 && jsx.length > 10000) || contentScore >= 3;
    const isAnimationHeavy = animationScore >= 4;
    const shouldPreserveContent = isContentHeavy || (contentScore >= animationScore && jsx.length > 5000);
    
    logAST(`[CLASSIFY] Result: Content-heavy: ${isContentHeavy}, Animation-heavy: ${isAnimationHeavy}, Preserve: ${shouldPreserveContent}`);
    
    return { isContentHeavy, isAnimationHeavy, shouldPreserveContent };
    
  } catch (error) {
    logAST(`[CLASSIFY] Classification failed: ${error instanceof Error ? error.message : 'unknown'}, defaulting to preserve content`);
    return { isContentHeavy: true, isAnimationHeavy: false, shouldPreserveContent: true };
  }
}

// Multi-pipeline AST architecture - route to specialized transformers
import { ASTRouter } from './pipelines/ASTRouter.js';

export async function convertArtifactToRemotionAST(artifactJsx: string): Promise<string> {
  try {
    // Clear previous log and start fresh
    if (fs.existsSync(AST_LOG_FILE)) {
      fs.writeFileSync(AST_LOG_FILE, '=== NEW MULTI-PIPELINE CONVERSION SESSION ===\n');
    }
    
    logAST('Starting multi-pipeline conversion...');
    logAST(`Input length: ${artifactJsx.length} chars`);
    logAST(`First 100 chars: ${artifactJsx.substring(0, 100)}`);
    
    // Route to appropriate specialized pipeline
    const router = new ASTRouter();
    const result = await router.convertArtifact(artifactJsx, 'artifact');
    
    logAST('✅ Multi-pipeline conversion completed successfully');
    logAST(`Output length: ${result.length} chars`);
    
    return result;
    
  } catch (error) {
    logAST(`❌ Multi-pipeline conversion failed: ${error instanceof Error ? error.message : 'unknown'}`);
    throw new Error(`Multi-pipeline AST conversion failed: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

export default { convertArtifactToRemotionAST };
