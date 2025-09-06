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

export async function convertArtifactToRemotionAST(artifactJsx: string): Promise<string> {
  try {
    // Clear previous log and start fresh
    if (fs.existsSync(AST_LOG_FILE)) {
      fs.writeFileSync(AST_LOG_FILE, '=== NEW AST CONVERSION SESSION ===\n');
    }
    
    logAST('Starting conversion...');
    logAST(`Input length: ${artifactJsx.length} chars`);
    logAST(`First 100 chars: ${artifactJsx.substring(0, 100)}`);
    
    // Parse JSX into Abstract Syntax Tree safely
    logAST('Attempting to parse JSX...');
    const ast = parser.parse(artifactJsx, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators'],
      strictMode: false,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true
    });
    
    logAST('✅ Parsing successful, AST created');
    logAST(`AST type: ${typeof ast}`);
    logAST(`AST keys: ${Object.keys(ast).join(', ')}`);
    if (ast.type) {
      logAST(`AST node type: ${ast.type}`);
    }

    logAST('Applying semantic transformations...');

    // First pass: Track useState variables and analyze their usage patterns
    const removedStateVars = new Set<string>();
    const arrayStructures = new Map<string, any>();
    
    traverse(ast, {
      VariableDeclaration(path) {
        path.node.declarations.forEach(declarator => {
          if (t.isCallExpression(declarator.init) && 
              t.isIdentifier(declarator.init.callee) && 
              declarator.init.callee.name === 'useState') {
            
            // Track variables that will be removed
            if (t.isArrayPattern(declarator.id)) {
              const [stateVar] = declarator.id.elements;
              if (t.isIdentifier(stateVar)) {
                removedStateVars.add(stateVar.name);
                logAST(`Tracking useState variable for replacement: ${stateVar.name}`);
                
                // Analyze initial value to understand structure
                const initialValue = declarator.init.arguments[0];
                if (initialValue) {
                  arrayStructures.set(stateVar.name, initialValue);
                  logAST(`Stored initial value for ${stateVar.name}: ${initialValue.type}`);
                }
              }
            }
          }
        });
      }
    });

    // Second pass: Look for useEffect patterns that populate arrays
    const arrayPopulationPatterns = new Map<string, any>();
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useEffect') {
          // Look inside useEffect for array population patterns
          const callback = path.node.arguments[0];
          if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
            // Search for object structures in push() calls using visitor pattern within current traverse
            const findPushPatterns = (node: any) => {
              if (t.isCallExpression(node) && 
                  t.isMemberExpression(node.callee) && 
                  t.isIdentifier(node.callee.property) && 
                  node.callee.property.name === 'push') {
                
                const argument = node.arguments[0];
                if (t.isObjectExpression(argument)) {
                  // Found an object being pushed to an array
                  for (const varName of removedStateVars) {
                    arrayPopulationPatterns.set(varName, argument);
                    logAST(`Found object structure for ${varName}: ${argument.properties.length} properties`);
                    break; // Use first found pattern
                  }
                }
              }
              
              // Recursively check child nodes
              for (const key in node) {
                if (node[key] && typeof node[key] === 'object') {
                  if (Array.isArray(node[key])) {
                    node[key].forEach(findPushPatterns);
                  } else if (node[key].type) {
                    findPushPatterns(node[key]);
                  }
                }
              }
            };
            
            findPushPatterns(callback.body);
            
            // Phase 1: SAFE ADDITION - Add enhanced detection without using results yet
            for (const varName of removedStateVars) {
              if (!arrayPopulationPatterns.has(varName)) {
                logAST(`[SAFE-DETECT] Attempting enhanced detection for: ${varName}`);
                const enhancedStructure = analyzeObjectStructureSafely(callback);
                if (enhancedStructure) {
                  logAST(`[SAFE-DETECT] Enhanced found ${enhancedStructure.totalProperties} properties for ${varName}`);
                  logAST(`[SAFE-DETECT] Properties: ${enhancedStructure.properties.map((p: any) => `${p.name}:${p.semanticType}`).join(', ')}`);
                  // NOTE: Not using this result yet - just detecting and logging for safety
                } else {
                  logAST(`[SAFE-DETECT] No enhanced structure found for ${varName}`);
                }
              }
            }
          }
        }
      }
    });

    // Emergency fix: Classify artifact before applying transformations
    const classification = classifyArtifact(artifactJsx, removedStateVars);
    logAST(`[CLASSIFY] Artifact classified as: ${classification.shouldPreserveContent ? 'CONTENT-HEAVY' : 'ANIMATION-HEAVY'}`);

    // Apply semantic transformations to AST nodes
    traverse(ast, {
      // Add Remotion imports at the top
      Program(path) {
        console.error('[AST-CONVERT] Program visitor executing...');
        addRemotionImports(path);
      },

      // Enhanced removal of useState declarations with frame-based alternatives
      VariableDeclaration(path) {
        console.error('[AST-CONVERT] VariableDeclaration visitor executing...');
        let removedCount = 0;
        let replacements: any[] = [];
        
        // Process useState declarations and create frame-based alternatives
        path.node.declarations = path.node.declarations.filter(declarator => {
          if (t.isCallExpression(declarator.init) && 
              t.isIdentifier(declarator.init.callee) && 
              declarator.init.callee.name === 'useState') {
            
            // Create frame-based alternative for common patterns
            if (t.isArrayPattern(declarator.id)) {
              const [stateVar] = declarator.id.elements;
              if (t.isIdentifier(stateVar)) {
                const varName = stateVar.name;
                logAST(`Creating frame-based alternative for: ${varName}`);
                
                // v9.4.1: Intelligent enhanced mode based on artifact classification
                const ENHANCED_PARTICLES_TEST = !classification.shouldPreserveContent; // Only enhance animation-focused artifacts
                
                if (classification.shouldPreserveContent) {
                  // Content-preserving mode: minimal transformation for content-heavy artifacts
                  logAST(`[CONTENT-PRESERVE] Preserving original structure for ${varName} in content-heavy artifact`);
                  
                  if (varName === 'currentSlide' || varName === 'currentPage' || varName === 'activeTab') {
                    // Convert navigation useState to frame-based progression
                    logAST(`[CONTENT-PRESERVE] Converting navigation state: ${varName}`);
                    const frameBasedNavigation = t.variableDeclaration('const', [
                      t.variableDeclarator(
                        t.identifier(varName),
                        t.binaryExpression('%',
                          t.binaryExpression('/', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(60)),
                          t.numericLiteral(5) // Cycle through 5 slides
                        )
                      )
                    ]);
                    replacements.push(frameBasedNavigation);
                  } else {
                    // Preserve other useState as-is by converting to constants  
                    logAST(`[CONTENT-PRESERVE] Preserving ${varName} as static constant`);
                    const initialValue = declarator.init.arguments[0];
                    const safeInitialValue = (t.isExpression(initialValue) ? initialValue : t.arrayExpression([]));
                    const preservedConstant = t.variableDeclaration('const', [
                      t.variableDeclarator(t.identifier(varName), safeInitialValue)
                    ]);
                    replacements.push(preservedConstant);
                  }
                } else if (varName === 'particles' && ENHANCED_PARTICLES_TEST) {
                  // Test enhanced universal logic for particles only
                  logAST(`[PHASE3-TEST] Testing enhanced logic for particles`);
                  
                  try {
                    const initialValue = declarator.init.arguments[0];
                    const populationPattern = arrayPopulationPatterns.get(varName);
                    
                    // Use existing working detection instead of failed safe detection
                    const existingPattern = arrayPopulationPatterns.get(varName);
                    const enhancedStructure = existingPattern ? convertExistingPatternToSemantic(existingPattern, varName) : null;
                    
                    if (enhancedStructure) {
                      logAST(`[PHASE3-SUCCESS] Using enhanced structure for particles with ${enhancedStructure.properties.length} properties`);
                      const universalResult = createUniversalStructurePreservingFrame(varName, enhancedStructure);
                      if (universalResult) {
                        replacements.push(universalResult);
                        logAST(`[PHASE3-SUCCESS] Enhanced conversion applied for particles`);
                      } else {
                        logAST(`[PHASE3-FALLBACK] Enhanced conversion failed, using existing particles logic`);
                        replacements.push(createFrameBasedParticles());
                      }
                    } else {
                      logAST(`[PHASE3-FALLBACK] No enhanced structure found, using existing particles logic`);
                      replacements.push(createFrameBasedParticles());
                    }
                    
                  } catch (error) {
                    logAST(`[PHASE3-ERROR] Enhanced logic failed for particles: ${error instanceof Error ? error.message : 'unknown'}`);
                    logAST(`[PHASE3-FALLBACK] Using safe existing particles logic`);
                    replacements.push(createFrameBasedParticles());
                  }
                  
                } else if (varName === 'particles') {
                  // Default: use existing working logic (ZERO RISK)
                  logAST(`[SAFE-EXISTING] Using existing particles logic (enhanced test disabled)`);
                  replacements.push(createFrameBasedParticles());
                } else if (varName === 'mousePos') {
                  // Apply enhanced logic to mousePos as well when enhanced mode is active
                  if (ENHANCED_PARTICLES_TEST) {
                    logAST(`[PHASE3-TEST] Testing enhanced logic for mousePos`);
                    
                    try {
                      // Create animated mouse simulation instead of static position
                      const enhancedMousePos = createEnhancedMousePos();
                      replacements.push(enhancedMousePos);
                      logAST(`[PHASE3-SUCCESS] Enhanced animated mousePos conversion applied`);
                    } catch (error) {
                      logAST(`[PHASE3-FALLBACK] Enhanced mousePos failed, using existing logic: ${error instanceof Error ? error.message : 'unknown'}`);
                      replacements.push(createFrameBasedMousePos());
                    }
                  } else {
                    // Keep existing mousePos logic unchanged (ZERO RISK)
                    logAST(`[SAFE-EXISTING] Using existing mousePos logic`);
                    replacements.push(createFrameBasedMousePos());
                  }
                } else {
                  // Apply enhanced logic to ALL variables when enhanced mode is active  
                  if (ENHANCED_PARTICLES_TEST) {
                    logAST(`[PHASE3-TEST] Testing enhanced universal logic for ${varName}`);
                    
                    try {
                      const enhancedResult = createEnhancedUniversalVar(varName, declarator.init.arguments[0]);
                      if (enhancedResult) {
                        replacements.push(enhancedResult);
                        logAST(`[PHASE3-SUCCESS] Enhanced universal conversion applied for ${varName}`);
                      } else {
                        // Fallback to existing logic
                        logAST(`[PHASE3-FALLBACK] Enhanced universal failed, using existing logic for ${varName}`);
                        const initialValue = declarator.init.arguments[0];
                        const populationPattern = arrayPopulationPatterns.get(varName);
                        replacements.push(createStructurePreservingFrameVar(varName, initialValue, populationPattern));
                      }
                    } catch (error) {
                      logAST(`[PHASE3-ERROR] Enhanced universal failed for ${varName}: ${error instanceof Error ? error.message : 'unknown'}`);
                      logAST(`[PHASE3-FALLBACK] Using safe existing logic for ${varName}`);
                      const initialValue = declarator.init.arguments[0];
                      const populationPattern = arrayPopulationPatterns.get(varName);
                      replacements.push(createStructurePreservingFrameVar(varName, initialValue, populationPattern));
                    }
                  } else {
                    // Use existing structure-preserving logic for other variables (already working)
                    logAST(`[SAFE-EXISTING] Using existing structure-preserving logic for ${varName}`);
                    const initialValue = declarator.init.arguments[0];
                    const populationPattern = arrayPopulationPatterns.get(varName);
                    replacements.push(createStructurePreservingFrameVar(varName, initialValue, populationPattern));
                  }
                }
              }
            }
            
            logAST(`Removing useState declaration: ${declarator.id && 'name' in declarator.id ? declarator.id.name : 'unknown'}`);
            removedCount++;
            return false; // Remove this declaration
          }
          return true; // Keep non-useState declarations
        });
        
        // Add replacements before removing the useState declaration
        replacements.forEach(replacement => {
          path.insertBefore(replacement);
        });
        
        // If no declarations left, remove entire variable statement
        if (path.node.declarations.length === 0) {
          logAST(`Removing empty variable declaration after useState removal`);
          path.remove();
        } else if (removedCount > 0) {
          logAST(`Removed ${removedCount} useState declarations from variable statement`);
        }
      },

      // Transform useEffect calls at statement level
      ExpressionStatement(path) {
        if (t.isCallExpression(path.node.expression) && 
            t.isIdentifier(path.node.expression.callee) && 
            path.node.expression.callee.name === 'useEffect') {
          transformUseEffect(path);
        }
      },

      // Handle JSX attributes (remove interactive elements, convert className)
      JSXAttribute(path) {
        if (t.isJSXIdentifier(path.node.name)) {
          const attrName = path.node.name.name;
          
          // Remove all interactive elements
          if (attrName === 'onClick' || attrName === 'onMouseOver' || attrName === 'onMouseOut' || 
              attrName === 'onMouseMove' || attrName === 'onMouseDown' || attrName === 'onMouseUp') {
            logAST(`Removing interactive attribute: ${attrName}`);
            path.remove();
            return;
          }
          
          // Transform className to style (basic Tailwind conversion)
          if (attrName === 'className') {
            transformClassNameToStyle(path);
          }
        }
      },

      // Remove function declarations that are interactive handlers
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name.includes('handleMouse')) {
          logAST(`Removing interactive handler function: ${path.node.id.name}`);
          path.remove();
        }
      },

      // Transform root JSX elements to use AbsoluteFill for proper Remotion layout
      JSXElement(path) {
        if (t.isJSXIdentifier(path.node.openingElement.name) && 
            path.node.openingElement.name.name === 'div') {
          
          // Check if this is likely a root container (has full screen classes)
          const hasFullScreenClasses = path.node.openingElement.attributes?.some(attr => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
              if (t.isStringLiteral(attr.value)) {
                const classes = attr.value.value;
                return (classes.includes('w-full') && classes.includes('h-screen')) ||
                       (classes.includes('w-full') && classes.includes('h-full'));
              }
            }
            return false;
          });
          
          if (hasFullScreenClasses) {
            logAST(`[ABSOLUTEFILL] Converting root div to AbsoluteFill for proper background rendering`);
            
            // Change div to AbsoluteFill
            path.node.openingElement.name = t.jsxIdentifier('AbsoluteFill');
            if (path.node.closingElement) {
              path.node.closingElement.name = t.jsxIdentifier('AbsoluteFill');
            }
            
            // Convert className to style for better Remotion compatibility
            path.node.openingElement.attributes?.forEach(attr => {
              if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
                if (t.isStringLiteral(attr.value)) {
                  const classes = attr.value.value;
                  
                  // Convert gradient background classes to proper CSS
                  if (classes.includes('bg-gradient-to-br')) {
                    logAST(`[ABSOLUTEFILL] Converting gradient background to style for proper rendering`);
                    
                    // Determine gradient colors from class pattern
                    let gradientCSS = 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)'; // Default
                    
                    if (classes.includes('from-purple-900') && classes.includes('to-indigo-900')) {
                      gradientCSS = 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)';
                    } else if (classes.includes('from-black')) {
                      gradientCSS = 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #333333 100%)';
                    }
                    
                    // Create or update style attribute
                    const existingStyleAttr = path.node.openingElement.attributes?.find(a => 
                      t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'style'
                    );
                    
                    if (existingStyleAttr && t.isJSXAttribute(existingStyleAttr) && t.isJSXExpressionContainer(existingStyleAttr.value)) {
                      // Add background to existing style object
                      if (t.isObjectExpression(existingStyleAttr.value.expression)) {
                        existingStyleAttr.value.expression.properties.unshift(
                          t.objectProperty(t.identifier('background'), t.stringLiteral(gradientCSS))
                        );
                      }
                    } else {
                      // Create new style attribute
                      const styleAttr = t.jsxAttribute(
                        t.jsxIdentifier('style'),
                        t.jsxExpressionContainer(
                          t.objectExpression([
                            t.objectProperty(t.identifier('background'), t.stringLiteral(gradientCSS)),
                            t.objectProperty(t.identifier('overflow'), t.stringLiteral('hidden'))
                          ])
                        )
                      );
                      
                      path.node.openingElement.attributes = path.node.openingElement.attributes || [];
                      path.node.openingElement.attributes.push(styleAttr);
                    }
                    
                    // Remove className attribute since we converted it to style
                    path.node.openingElement.attributes = path.node.openingElement.attributes?.filter(a => 
                      !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'className')
                    ) || [];
                  }
                }
              }
            });
          }
        }
      },

      // Remove arrow functions assigned to handler variables
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id) && 
            (path.node.id.name.includes('handleMouse') || path.node.id.name.includes('Handler'))) {
          logAST(`Removing interactive handler variable: ${path.node.id.name}`);
          path.remove();
        }
      },

      // Remove calls to setState functions
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('set')) {
          const funcName = path.node.callee.name;
          // Check if it's a setState call (starts with 'set' and has uppercase second letter)
          if (funcName.length > 3 && funcName[3] === funcName[3].toUpperCase()) {
            logAST(`Removing setState call: ${funcName}()`);
            
            // Replace the call expression with a no-op comment
            if (t.isExpressionStatement(path.parent)) {
              path.parentPath.replaceWith(
                t.expressionStatement(
                  t.stringLiteral('// Removed interactive setState call')
                )
              );
            } else {
              path.remove();
            }
          }
        }
      },

      // Ensure main component is properly structured
      ExportDefaultDeclaration(path) {
        ensureRemotionStructure(path);
      }
    });

    // Add useCurrentFrame hook at component level (from research)
    traverse(ast, {
      // Find function components and add frame-based animation
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name.includes('Animation')) {
          addFrameBasedAnimation(path);
        }
      },
      
      // Handle arrow function components
      VariableDeclarator(path) {
        if (t.isArrowFunctionExpression(path.node.init) && 
            path.node.id && 'name' in path.node.id && 
            path.node.id.name.includes('Animation')) {
          addFrameBasedAnimationToArrow(path);
        }
      }
    });

    console.error('[AST-CONVERT] Generating clean JSX from transformed AST...');

    // Generate clean JSX from transformed AST with safe settings
    const result = generate(ast, {
      retainLines: false,     // Prevent line number issues  
      compact: false,         // Readable output
      comments: true,         // Keep comments
      decoratorsBeforeExport: true,
      jsescOption: {          // Handle special characters safely
        quotes: 'double',
        wrap: true
      }
    });

    console.error('[AST-CONVERT] ✅ Conversion completed successfully');
    
    // LOG CODE QUALITY: Before vs After comparison
    logAST('=== CODE QUALITY ANALYSIS ===');
    logAST(`Original input (first 200 chars): ${artifactJsx.substring(0, 200)}...`);
    logAST(`Generated output (first 200 chars): ${result.code.substring(0, 200)}...`);
    logAST(`Input length: ${artifactJsx.length} chars`);
    logAST(`Output length: ${result.code.length} chars`);
    
    // Check for key Remotion elements
    const hasRemotionImports = result.code.includes('from "remotion"') || result.code.includes("from 'remotion'");
    const hasUseCurrentFrame = result.code.includes('useCurrentFrame');
    const hasAbsoluteFill = result.code.includes('AbsoluteFill');
    const stillHasUseState = result.code.includes('useState');
    const stillHasUseEffect = result.code.includes('useEffect');
    
    logAST(`✅ Has Remotion imports: ${hasRemotionImports}`);
    logAST(`✅ Has useCurrentFrame: ${hasUseCurrentFrame}`);
    logAST(`✅ Has AbsoluteFill: ${hasAbsoluteFill}`);
    logAST(`❌ Still has useState: ${stillHasUseState}`);
    logAST(`❌ Still has useEffect: ${stillHasUseEffect}`);
    
    if (stillHasUseState || stillHasUseEffect) {
      logAST('⚠️  WARNING: React hooks not fully converted to Remotion equivalents');
    }
    
    logAST('=== END CODE QUALITY ANALYSIS ===');
    
    return result.code;

  } catch (error) {
    console.error('[AST-CONVERT] ❌ Error during conversion:', error);
    throw new Error(`AST conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Add Remotion imports and clean React imports
function addRemotionImports(path: any) {
  logAST('addRemotionImports function called');
  
  // Check if Remotion imports already exist
  let hasRemotionImports = false;
  logAST('Checking for existing imports...');
  
  path.traverse({
    ImportDeclaration(importPath: any) {
      const source = importPath.node.source.value;
      logAST(`Found import: ${source}`);
      
      if (source === 'remotion') {
        hasRemotionImports = true;
        logAST('Found existing Remotion import');
      }
      
      // CLEAN UP React imports (remove useState, useEffect)
      if (source === 'react') {
        logAST('Cleaning up React import...');
        
        importPath.node.specifiers = importPath.node.specifiers.filter((spec: any) => {
          if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
            const name = spec.imported.name;
            if (name === 'useState' || name === 'useEffect') {
              logAST(`Removing ${name} from React imports`);
              return false;
            }
          }
          return true;
        });
        
        // If only default React import left, keep it minimal
        if (importPath.node.specifiers.length === 1 && 
            t.isImportDefaultSpecifier(importPath.node.specifiers)) {
          logAST('React import cleaned - only default import remains');
        }
        
        // If no specifiers left, remove entire React import
        if (importPath.node.specifiers.length === 0) {
          logAST('Removing React import entirely - no specifiers needed');
          importPath.remove();
        }
      }
    }
  });

  if (!hasRemotionImports) {
    logAST('Adding new Remotion imports...');
    
    // Add comprehensive Remotion imports
    const remotionImport = t.importDeclaration(
      [
        t.importSpecifier(t.identifier('AbsoluteFill'), t.identifier('AbsoluteFill')),
        t.importSpecifier(t.identifier('useCurrentFrame'), t.identifier('useCurrentFrame')),
        t.importSpecifier(t.identifier('interpolate'), t.identifier('interpolate')),
        t.importSpecifier(t.identifier('Easing'), t.identifier('Easing')),
        t.importSpecifier(t.identifier('Sequence'), t.identifier('Sequence'))
      ],
      t.stringLiteral('remotion')
    );
    
    path.unshiftContainer('body', remotionImport);
    logAST('✅ Added Remotion imports successfully');
  } else {
    logAST('Skipping - Remotion imports already exist');
  }
}

// Transform useState declarations to frame-based equivalents
function transformUseState(path: any) {
  if (t.isArrayPattern(path.node.id)) {
    const [stateVar, setterVar] = path.node.id.elements;
    
    if (t.isIdentifier(stateVar)) {
      const stateName = stateVar.name;
      
      // Handle specific useState patterns
      if (stateName === 'currentScene') {
        // Replace useState(0) with frame-based scene calculation
        const frameBasedScene = t.variableDeclarator(
          t.identifier('currentScene'),
          t.callExpression(
            t.memberExpression(t.identifier('Math'), t.identifier('floor')),
            [
              t.binaryExpression(
                '%',
                t.binaryExpression(
                  '/',
                  t.callExpression(t.identifier('useCurrentFrame'), []),
                  t.numericLiteral(180)
                ),
                t.numericLiteral(4)
              )
            ]
          )
        );
        
        // Also add the frame variable
        const frameVar = t.variableDeclarator(
          t.identifier('frame'),
          t.callExpression(t.identifier('useCurrentFrame'), [])
        );
        
        path.insertBefore(frameVar);
        path.replaceWith(frameBasedScene);
        console.error('[AST-CONVERT] Transformed currentScene useState to frame-based');
        
      } else if (stateName === 'animationProgress') {
        // Replace useState(0) with time-based calculation
        const timeBasedProgress = t.variableDeclarator(
          t.identifier('time'),
          t.binaryExpression(
            '*',
            t.callExpression(t.identifier('useCurrentFrame'), []),
            t.numericLiteral(0.033)
          )
        );
        
        path.replaceWith(timeBasedProgress);
        console.error('[AST-CONVERT] Transformed animationProgress useState to time-based');
      }
    }
  }
}

// Transform or remove useEffect calls safely - FIXED VERSION
function transformUseEffect(path: any) {
  // Clean removal without creating fragments (following Perplexity solution)
  path.remove();
  console.error('[AST-CONVERT] Cleanly removed useEffect statement without fragments');
}

// Convert basic className to style prop
function transformClassNameToStyle(path: any) {
  if (t.isStringLiteral(path.node.value)) {
    const classNames = path.node.value.value;
    
    // Basic conversion for common Tailwind classes
    const styleMap: Record<string, Record<string, string>> = {
      'absolute inset-0 overflow-hidden pointer-events-none': {
        position: 'absolute',
        top: '0',
        left: '0', 
        right: '0',
        bottom: '0',
        overflow: 'hidden',
        pointerEvents: 'none'
      },
      'text-center': {
        textAlign: 'center'
      },
      'font-bold': {
        fontWeight: 'bold'
      }
    };

    const styleObj = styleMap[classNames];
    if (styleObj) {
      // Create style prop with object expression
      const properties = Object.entries(styleObj).map(([key, value]) =>
        t.objectProperty(t.identifier(key), t.stringLiteral(value))
      );
      
      const styleAttribute = t.jsxAttribute(
        t.jsxIdentifier('style'),
        t.jsxExpressionContainer(t.objectExpression(properties))
      );
      
      path.replaceWith(styleAttribute);
      console.error('[AST-CONVERT] Converted className to style prop');
    }
  }
}

// Ensure component has proper Remotion structure
function ensureRemotionStructure(path: any) {
  // Ensure the exported component returns AbsoluteFill at root level
  if (t.isFunctionDeclaration(path.node.declaration) || t.isArrowFunctionExpression(path.node.declaration)) {
    const component = path.node.declaration;
    
    // Check if component already uses AbsoluteFill
    let hasAbsoluteFill = false;
    traverse(component, {
      JSXIdentifier(jsxPath: any) {
        if (jsxPath.node.name === 'AbsoluteFill') {
          hasAbsoluteFill = true;
        }
      }
    }, path.scope);

    if (!hasAbsoluteFill) {
      console.error('[AST-CONVERT] Component needs AbsoluteFill wrapper - will wrap return statement');
      // Note: Complex AST manipulation for wrapping would go here
      // For now, log that this transformation is needed
    }
  }
}

// Add frame-based animation to function components
function addFrameBasedAnimation(path: any) {
  logAST('Adding frame-based animation to function component');
  
  // Add const frame = useCurrentFrame() at the beginning of the function
  const frameDeclaration = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('frame'),
      t.callExpression(t.identifier('useCurrentFrame'), [])
    )
  ]);
  
  // Insert at the beginning of the function body
  if (path.node.body && path.node.body.body) {
    path.node.body.body.unshift(frameDeclaration);
    logAST('✅ Added useCurrentFrame hook to component');
  }
}

// Add frame-based animation to arrow function components  
function addFrameBasedAnimationToArrow(path: any) {
  logAST('Adding frame-based animation to arrow function component');
  
  const frameDeclaration = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('frame'),
      t.callExpression(t.identifier('useCurrentFrame'), [])
    )
  ]);
  
  // Handle arrow function body
  if (t.isBlockStatement(path.node.init.body)) {
    path.node.init.body.body.unshift(frameDeclaration);
    logAST('✅ Added useCurrentFrame hook to arrow function component');
  }
}

// Helper functions to create frame-based alternatives for common useState patterns

function createFrameBasedParticles() {
  logAST('Creating frame-based particles array');
  
  // Create: const particles = Array.from({ length: 20 }, (_, i) => ({ ... }))
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('particles'),
      t.callExpression(
        t.memberExpression(t.identifier('Array'), t.identifier('from')),
        [
          t.objectExpression([
            t.objectProperty(t.identifier('length'), t.numericLiteral(20))
          ]),
          t.arrowFunctionExpression(
            [t.identifier('_'), t.identifier('i')],
            t.objectExpression([
              t.objectProperty(t.identifier('id'), t.identifier('i')),
              t.objectProperty(
                t.identifier('x'),
                t.binaryExpression(
                  '+',
                  t.binaryExpression(
                    '*',
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                      [
                        t.binaryExpression(
                          '*',
                          t.binaryExpression('+', t.identifier('i'), t.callExpression(t.identifier('useCurrentFrame'), [])),
                          t.numericLiteral(0.02)
                        )
                      ]
                    ),
                    t.numericLiteral(200)
                  ),
                  t.numericLiteral(400)
                )
              ),
              t.objectProperty(
                t.identifier('y'),
                t.binaryExpression(
                  '+',
                  t.binaryExpression(
                    '*',
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('cos')),
                      [
                        t.binaryExpression(
                          '*',
                          t.binaryExpression('+', t.identifier('i'), t.callExpression(t.identifier('useCurrentFrame'), [])),
                          t.numericLiteral(0.03)
                        )
                      ]
                    ),
                    t.numericLiteral(150)
                  ),
                  t.numericLiteral(300)
                )
              ),
              t.objectProperty(t.identifier('size'), t.numericLiteral(3)),
              t.objectProperty(t.identifier('color'), t.stringLiteral('#ffffff')),
              t.objectProperty(t.identifier('opacity'), t.numericLiteral(0.8)),
              t.objectProperty(
                t.identifier('pulse'),
                t.binaryExpression(
                  '*',
                  t.callExpression(t.identifier('useCurrentFrame'), []),
                  t.numericLiteral(0.1)
                )
              )
            ])
          )
        ]
      )
    )
  ]);
}

function createFrameBasedMousePos() {
  logAST('Creating frame-based mousePos object');
  
  // Create: const mousePos = { x: 400, y: 300 }
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('mousePos'),
      t.objectExpression([
        t.objectProperty(t.identifier('x'), t.numericLiteral(400)),
        t.objectProperty(t.identifier('y'), t.numericLiteral(300))
      ])
    )
  ]);
}

function createEnhancedMousePos() {
  logAST('Creating enhanced animated mousePos for visual similarity');
  
  // Create animated mouse simulation that moves around screen
  // const mousePos = {
  //   x: 0.3 + Math.sin(useCurrentFrame() * 0.05) * 0.4,
  //   y: 0.4 + Math.cos(useCurrentFrame() * 0.03) * 0.3
  // };
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('mousePos'),
      t.objectExpression([
        t.objectProperty(
          t.identifier('x'),
          t.binaryExpression('+',
            t.numericLiteral(0.3),
            t.binaryExpression('*',
              t.callExpression(
                t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                [t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.05))]
              ),
              t.numericLiteral(0.4)
            )
          )
        ),
        t.objectProperty(
          t.identifier('y'),
          t.binaryExpression('+',
            t.numericLiteral(0.4),
            t.binaryExpression('*',
              t.callExpression(
                t.memberExpression(t.identifier('Math'), t.identifier('cos')),
                [t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.03))]
              ),
              t.numericLiteral(0.3)
            )
          )
        )
      ])
    )
  ]);
}

function createEnhancedUniversalVar(varName: string, initialValue: any): any {
  logAST(`Creating enhanced universal variable for: ${varName}`);
  
  if (!initialValue) {
    logAST(`[ENHANCED-UNIVERSAL] No initial value for ${varName}, using fallback`);
    return null;
  }
  
  try {
    if (varName === 'time' && t.isNumericLiteral(initialValue)) {
      logAST(`[ENHANCED-UNIVERSAL] Creating proper time simulation for ${varName}`);
      // Create: const time = useCurrentFrame() * 0.016; (simulates 60fps timing)
      return t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('time'),
          t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.016))
        )
      ]);
    } else if (t.isNumericLiteral(initialValue)) {
      logAST(`[ENHANCED-UNIVERSAL] Creating frame-based numeric for ${varName}`);
      // For any numeric useState, create frame-based animation
      return t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier(varName),
          t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.1))
        )
      ]);
    } else if (t.isObjectExpression(initialValue)) {
      logAST(`[ENHANCED-UNIVERSAL] Creating enhanced object for ${varName} with ${initialValue.properties.length} properties`);
      // For objects, create animated properties based on semantic analysis
      const enhancedProperties = initialValue.properties.map((prop: any) => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          return t.objectProperty(
            t.identifier(prop.key.name),
            createUniversalSemanticFrameValue(prop.key.name, prop.value)
          );
        }
        return prop;
      });
      
      return t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier(varName),
          t.objectExpression(enhancedProperties)
        )
      ]);
    } else {
      logAST(`[ENHANCED-UNIVERSAL] Unknown initial value type for ${varName}: ${initialValue.type}`);
      return null; // Use fallback
    }
    
  } catch (error) {
    logAST(`[ENHANCED-UNIVERSAL] Creation failed for ${varName}: ${error instanceof Error ? error.message : 'unknown'}`);
    return null; // Use fallback
  }
}

function createGenericFrameBasedVar(varName: string) {
  logAST(`Creating generic frame-based variable: ${varName}`);
  
  // Create: const varName = useCurrentFrame() * 0.1
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(varName),
      t.binaryExpression(
        '*',
        t.callExpression(t.identifier('useCurrentFrame'), []),
        t.numericLiteral(0.1)
      )
    )
  ]);
}

function createStructurePreservingFrameVar(varName: string, initialValue: any, populationPattern: any) {
  logAST(`Creating structure-preserving frame variable: ${varName}`);
  logAST(`Population pattern available: ${populationPattern ? 'YES' : 'NO'}`);
  
  if (populationPattern && t.isObjectExpression(populationPattern)) {
    logAST(`Using discovered object structure with ${populationPattern.properties.length} properties`);
    
    // Create Array.from with the discovered object structure
    const frameBasedProperties = populationPattern.properties.map((prop: any) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const propName = prop.key.name;
        logAST(`Converting property: ${propName}`);
        
        // Convert each property to frame-based alternative based on its name and original value
        if (propName === 'x' || propName === 'y') {
          // Position properties get animated movement
          const baseValue = propName === 'x' ? 400 : 300;
          const animationScale = propName === 'x' ? 200 : 150;
          const frequency = propName === 'x' ? 0.02 : 0.03;
          
          return t.objectProperty(
            t.identifier(propName),
            t.binaryExpression(
              '+',
              t.numericLiteral(baseValue),
              t.binaryExpression(
                '*',
                t.callExpression(
                  t.memberExpression(
                    t.identifier('Math'), 
                    t.identifier(propName === 'x' ? 'sin' : 'cos')
                  ),
                  [t.binaryExpression(
                    '*',
                    t.binaryExpression('+', t.identifier('i'), t.callExpression(t.identifier('useCurrentFrame'), [])),
                    t.numericLiteral(frequency)
                  )]
                ),
                t.numericLiteral(animationScale)
              )
            )
          );
        } else if (propName === 'size') {
          // Size gets frame-based variation
          return t.objectProperty(
            t.identifier('size'),
            t.binaryExpression(
              '+',
              t.numericLiteral(20),
              t.binaryExpression(
                '*',
                t.callExpression(
                  t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                  [t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.1))]
                ),
                t.numericLiteral(10)
              )
            )
          );
        } else if (propName === 'hue') {
          // Hue gets color cycling animation
          return t.objectProperty(
            t.identifier('hue'),
            t.binaryExpression(
              '%',
              t.binaryExpression(
                '+',
                t.binaryExpression('*', t.identifier('i'), t.numericLiteral(30)),
                t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(2))
              ),
              t.numericLiteral(360)
            )
          );
        } else if (propName === 'animationDelay' || propName === 'duration') {
          // Animation timing properties get frame-based values
          return t.objectProperty(
            t.identifier(propName),
            t.binaryExpression(
              '+',
              t.numericLiteral(propName === 'duration' ? 2 : 1),
              t.binaryExpression(
                '*',
                t.callExpression(
                  t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                  [t.binaryExpression('*', t.identifier('i'), t.numericLiteral(0.5))]
                ),
                t.numericLiteral(0.5)
              )
            )
          );
        } else if (propName === 'direction') {
          // Direction alternates based on index
          return t.objectProperty(
            t.identifier('direction'),
            t.conditionalExpression(
              t.binaryExpression('>', t.binaryExpression('%', t.identifier('i'), t.numericLiteral(2)), t.numericLiteral(0)),
              t.numericLiteral(1),
              t.unaryExpression('-', t.numericLiteral(1))
            )
          );
        } else {
          // Default: preserve property name but with frame-based value
          return t.objectProperty(
            t.identifier(propName),
            t.identifier('i') // Use index as default
          );
        }
      }
      return prop; // Fallback: preserve original property
    });

    // Create the structure-preserving Array.from
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(varName),
        t.callExpression(
          t.memberExpression(t.identifier('Array'), t.identifier('from')),
          [
            t.objectExpression([
              t.objectProperty(t.identifier('length'), t.numericLiteral(15)) // Use reasonable default
            ]),
            t.arrowFunctionExpression(
              [t.identifier('_'), t.identifier('i')],
              t.objectExpression(frameBasedProperties)
            )
          ]
        )
      )
    ]);
  } else {
    // Fallback to smart variable creation if no population pattern found
    return createSmartFrameBasedVar(varName, initialValue);
  }
}

function createSmartFrameBasedVar(varName: string, initialValue: any) {
  logAST(`Creating smart frame-based variable: ${varName}`);
  logAST(`Initial value type: ${initialValue?.type || 'unknown'}`);
  
  // Detect the type of initial value and create appropriate frame-based alternative
  if (t.isArrayExpression(initialValue)) {
    logAST(`Detected array initialization for ${varName}, creating frame-based array`);
    // For arrays like data = [...], create a static frame-based array
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(varName),
        t.callExpression(
          t.memberExpression(t.identifier('Array'), t.identifier('from')),
          [
            t.objectExpression([
              t.objectProperty(t.identifier('length'), t.numericLiteral(5))
            ]),
            t.arrowFunctionExpression(
              [t.identifier('_'), t.identifier('i')],
              t.objectExpression([
                t.objectProperty(t.identifier('id'), t.identifier('i')),
                t.objectProperty(
                  t.identifier('value'),
                  t.binaryExpression(
                    '+',
                    t.numericLiteral(50),
                    t.binaryExpression(
                      '*',
                      t.callExpression(
                        t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                        [t.binaryExpression(
                          '*',
                          t.binaryExpression('+', t.identifier('i'), t.callExpression(t.identifier('useCurrentFrame'), [])),
                          t.numericLiteral(0.1)
                        )]
                      ),
                      t.numericLiteral(20)
                    )
                  )
                ),
                t.objectProperty(t.identifier('category'), t.templateLiteral([
                  t.templateElement({ raw: '', cooked: '' }, false),
                  t.templateElement({ raw: '', cooked: '' }, true)
                ], [t.callExpression(
                  t.memberExpression(t.identifier('String'), t.identifier('fromCharCode')),
                  [t.binaryExpression('+', t.numericLiteral(65), t.identifier('i'))]
                )])),
                t.objectProperty(t.identifier('color'), t.templateLiteral([
                  t.templateElement({ raw: 'hsl(', cooked: 'hsl(' }, false),
                  t.templateElement({ raw: ', 70%, 60%)', cooked: ', 70%, 60%)' }, true)
                ], [t.binaryExpression(
                  '%',
                  t.binaryExpression('*', t.identifier('i'), t.numericLiteral(60)),
                  t.numericLiteral(360)
                )]))
              ])
            )
          ]
        )
      )
    ]);
  } else if (t.isObjectExpression(initialValue)) {
    logAST(`Detected object initialization for ${varName}, creating static object with frame animation`);
    // For objects, create a static object but with animated properties
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(varName),
        t.objectExpression([
          t.objectProperty(
            t.identifier('x'),
            t.binaryExpression(
              '+',
              t.numericLiteral(400),
              t.binaryExpression(
                '*',
                t.callExpression(
                  t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                  [t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.05))]
                ),
                t.numericLiteral(50)
              )
            )
          ),
          t.objectProperty(
            t.identifier('y'),
            t.binaryExpression(
              '+',
              t.numericLiteral(300),
              t.binaryExpression(
                '*',
                t.callExpression(
                  t.memberExpression(t.identifier('Math'), t.identifier('cos')),
                  [t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.05))]
                ),
                t.numericLiteral(30)
              )
            )
          )
        ])
      )
    ]);
  } else if (t.isNumericLiteral(initialValue) || (t.isUnaryExpression(initialValue) && t.isNumericLiteral(initialValue.argument))) {
    logAST(`Detected numeric initialization for ${varName}, creating frame-based animation`);
    // For numbers, create frame-based animation
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(varName),
        t.binaryExpression(
          '%',
          t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(2)),
          t.numericLiteral(360)
        )
      )
    ]);
  } else if (t.isNullLiteral(initialValue)) {
    logAST(`Detected null initialization for ${varName}, creating null`);
    // For null values, keep as null
    return t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(varName), t.nullLiteral())
    ]);
  } else {
    logAST(`Unknown initialization type for ${varName}, falling back to generic frame animation`);
    // Fallback to generic frame-based replacement
    return createGenericFrameBasedVar(varName);
  }
}

export default { convertArtifactToRemotionAST };