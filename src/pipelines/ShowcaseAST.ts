// ShowcaseAST Pipeline - Specialized for GitHub showcases, presentations, content-heavy artifacts
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { TailwindConverter } from './TailwindConverter.js';

export class ShowcaseAST {
  public name = 'ShowcaseAST';
  private originalJsx = '';
  private tailwindConverter: TailwindConverter;
  
  constructor() {
    console.error(`[${this.name}] Initializing showcase pipeline with comprehensive visual system`);
    this.tailwindConverter = new TailwindConverter();
  }

  async transform(jsx: string): Promise<string> {
    console.error(`[${this.name}] Processing showcase artifact (${jsx.length} chars)`);
    this.originalJsx = jsx; // Store for scene extraction
    
    try {
      const ast = parser.parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators'],
        strictMode: false
      });

      // Apply showcase-specific transformations
      traverse(ast, {
        Program: (path) => this.addRemotionImports(path),
        VariableDeclaration: (path) => this.handleShowcaseStates(path),
        CallExpression: (path) => this.removeInteractiveCallbacks(path),
        JSXElement: (path) => this.enhanceVisualRendering(path),
        JSXAttribute: (path) => this.removeInteractivity(path)
      });

      const result = generate(ast, {
        retainLines: false,
        compact: false,
        comments: true
      });

      // CRITICAL: Validate generated JSX syntax before returning
      this.validateGeneratedJSX(result.code);

      console.error(`[${this.name}] Preserved content structure + enabled scene navigation`);
      return result.code;

    } catch (error) {
      console.error(`[${this.name}] Showcase pipeline failed:`, error instanceof Error ? error.message : 'unknown');
      throw error;
    }
  }

  private addRemotionImports(path: any) {
    console.error(`[${this.name}] Adding Remotion imports for showcase framework`);
    
    // Add Remotion imports
    const remotionImport = t.importDeclaration(
      [
        t.importSpecifier(t.identifier('AbsoluteFill'), t.identifier('AbsoluteFill')),
        t.importSpecifier(t.identifier('useCurrentFrame'), t.identifier('useCurrentFrame')),
        t.importSpecifier(t.identifier('interpolate'), t.identifier('interpolate')),
        t.importSpecifier(t.identifier('Easing'), t.identifier('Easing'))
      ],
      t.stringLiteral('remotion')
    );
    
    const reactImport = t.importDeclaration([], t.stringLiteral('react'));
    
    path.unshiftContainer('body', [remotionImport, reactImport]);
  }

  private handleShowcaseStates(path: any) {
    const node = path.node;
    
    if (node.declarations?.length === 1) {
      const declarator = node.declarations[0];
      
      if (t.isCallExpression(declarator.init) && 
          t.isIdentifier(declarator.init.callee) && 
          declarator.init.callee.name === 'useState') {
        
        if (t.isArrayPattern(declarator.id)) {
          const [stateVar] = declarator.id.elements;
          if (t.isIdentifier(stateVar)) {
            const varName = stateVar.name;
            console.error(`[${this.name}] Processing showcase state: ${varName}`);
            
            // Navigation variables get frame-based progression
            if (['currentScene', 'currentSlide', 'activeSlide', 'sceneIndex'].includes(varName)) {
              console.error(`[${this.name}] EMERGENCY FIX: Converting ${varName} to use dynamic array length`);
              
              // CRITICAL FIX: Use dynamic array length instead of static detection
              const frameBasedNavigation = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier(varName),
                  t.binaryExpression('%',
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('floor')),
                      [t.binaryExpression('/', 
                        t.callExpression(t.identifier('useCurrentFrame'), []),
                        t.numericLiteral(90) // 3 seconds per scene at 30fps
                      )]
                    ),
                    t.memberExpression(
                      t.identifier('scenes'), // Use scenes or slides array
                      t.identifier('length')  // Dynamic length - no mismatch!
                    )
                  )
                )
              ]);
              
              console.error(`[${this.name}] Generated: ${varName} = Math.floor(useCurrentFrame() / 90) % scenes.length`);
              
              // Add runtime safety bounds checking
              const safeSlideAccess = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('slide'),
                  t.logicalExpression('||',
                    t.memberExpression(
                      t.identifier('scenes'),
                      t.binaryExpression(
                        '%',
                        t.identifier(varName),
                        t.memberExpression(t.identifier('scenes'), t.identifier('length'))
                      ),
                      true // computed property access
                    ),
                    t.memberExpression(t.identifier('scenes'), t.numericLiteral(0), true) // fallback to scenes[0]
                  )
                )
              ]);
              
              path.replaceWith(frameBasedNavigation);
              path.insertAfter(safeSlideAccess);
              path.skip();
            } 
            // All other useState preserved as static constants (content preservation)
            else {
              console.error(`[${this.name}] Preserving ${varName} as static content`);
              const initialValue = declarator.init.arguments[0];
              const safeInitialValue = t.isExpression(initialValue) ? initialValue : t.arrayExpression([]);
              
              const preservedConstant = t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(varName), safeInitialValue)
              ]);
              
              path.replaceWith(preservedConstant);
              path.skip();
            }
          }
        }
      }
    }
  }

  private extractSceneCount(): number {
    try {
      console.error(`[${this.name}] AST-based scene detection starting (Perplexity validated)`);
      
      // Method 1: Parse using AST (most reliable - handles nested JSX correctly)
      const scenesPattern = /const\s+(?:scenes|slides)\s*=\s*(\[[\s\S]*?\]);/;
      const match = this.originalJsx.match(scenesPattern);
      
      if (match) {
        try {
          const arrayContent = match[1];
          const tempCode = `const temp = ${arrayContent}`;
          
          const tempAst = parser.parse(tempCode, { sourceType: 'module', plugins: ['jsx'] });
          let sceneCount = 0;
          
          traverse(tempAst, {
            ArrayExpression(path) {
              if (path.parent && path.parent.type === 'VariableDeclarator') {
                sceneCount = path.node.elements.length;
              }
            }
          });
          
          if (sceneCount > 0) {
            return sceneCount;
          }
        } catch (astError) {
          console.error(`[${this.name}] AST parsing failed, falling back to advanced regex`);
        }
      }
      
      // Method 2: Advanced regex with nesting awareness
      const complexScenePattern = /{\s*id\s*:\s*['"][^'"]+['"][^}]*(?:{[^}]*}[^}]*)*}/g;
      const sceneMatches = this.originalJsx.match(complexScenePattern) || [];
      
      const validScenes = sceneMatches.filter(match => 
        (match.includes('id:') || match.includes('title:')) &&
        (match.includes('title') || match.includes('background') || match.includes('gradient'))
      );
      
      console.error(`[${this.name}] Advanced regex detection: ${validScenes.length} valid scenes`);
      if (validScenes.length > 0) {
        return validScenes.length;
      }
      
      // Method 3: Conservative fallback
      console.error(`[${this.name}] Using conservative fallback count`);
      return 3;
      
    } catch (error) {
      console.error(`[${this.name}] All detection methods failed: ${error instanceof Error ? error.message : 'unknown'}`);
      return 3;
    }
  }

  private removeInteractiveCallbacks(path: any) {
    // Remove useEffect and interactive callbacks for video context
    if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useEffect') {
      console.error(`[${this.name}] Removing useEffect for video context`);
      if (t.isExpressionStatement(path.parent)) {
        path.parentPath.remove();
      }
    }
    
    // Remove setState calls
    if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('set')) {
      const funcName = path.node.callee.name;
      if (funcName.length > 3 && funcName[3] === funcName[3].toUpperCase()) {
        console.error(`[${this.name}] Removing setState call: ${funcName}()`);
        if (t.isExpressionStatement(path.parent)) {
          path.parentPath.remove();
        }
      }
    }
  }

  private enhanceVisualRendering(path: any) {
    // Comprehensive visual system transformation for professional video quality
    if (!path || !path.node) {
      console.error(`[${this.name}] Skipping null path in visual rendering`);
      return;
    }
    
    if (t.isJSXElement(path.node)) {
      try {
        // Phase 1: Comprehensive CSS conversion (typography, layout, effects)
        this.convertTailwindToInlineStyles(path);
        
        // Phase 2: Handle dynamic styling (gradients, scene-based)
        this.preserveDynamicStyling(path);
        
        // Phase 3: Professional enhancements 
        this.enhanceIconRendering(path);
        
        // Phase 4: Video compatibility fixes
        this.removeStyleJSXBlocks(path);
        this.preserveContentStructure(path);
        
      } catch (error) {
        console.error(`[${this.name}] Visual rendering error: ${error instanceof Error ? error.message : 'unknown'}`);
        console.error(`[${this.name}] Error in element: ${path.node.openingElement?.name?.name || 'unknown'}`);
      }
    }
  }
  
  private convertTailwindToInlineStyles(path: any) {
    // Comprehensive Tailwind-to-Remotion conversion for professional video quality
    const classNameAttr = path.node.openingElement.attributes?.find((attr: any) =>
      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className'
    );
    
    if (classNameAttr && t.isStringLiteral(classNameAttr.value)) {
      const classes = classNameAttr.value.value;
      console.error(`[${this.name}] Converting Tailwind classes: ${classes}`);
      
      // Use comprehensive converter for all CSS aspects
      const inlineStyles = this.tailwindConverter.convertClassesToInlineStyles(classes);
      
      if (Object.keys(inlineStyles).length > 0) {
        console.error(`[${this.name}] Generated ${Object.keys(inlineStyles).length} inline style properties`);
        
        // Add comprehensive inline styles
        this.addInlineStyleAttribute(path, inlineStyles);
        
        // Keep className for any unconverted classes, remove fully converted ones
        const remainingClasses = this.getRemainingClasses(classes, inlineStyles);
        if (remainingClasses) {
          classNameAttr.value = t.stringLiteral(remainingClasses);
        } else {
          this.removeClassNameAttribute(path);
        }
      }
    }
  }
  
  private addInlineStyleAttribute(path: any, styles: Record<string, string>) {
    // Add comprehensive inline styles with proper JavaScript syntax
    const styleProperties = Object.entries(styles).map(([key, value]) => {
      // CRITICAL FIX: Convert CSS properties to camelCase JavaScript identifiers
      const camelCaseKey = this.toCamelCase(key);
      const safeValue = this.sanitizePropertyValue(value);
      
      // Validate that the camelCase key is a valid JavaScript identifier
      if (!this.isValidIdentifier(camelCaseKey)) {
        console.error(`[${this.name}] Skipping invalid property: ${key} → ${camelCaseKey}`);
        return null;
      }
      
      return t.objectProperty(
        t.identifier(camelCaseKey),  // ✅ Valid JavaScript identifier (no hyphens)
        t.stringLiteral(safeValue)
      );
    }).filter((prop): prop is any => prop !== null); // Type-safe null filtering
    
    if (styleProperties.length === 0) {
      console.error(`[${this.name}] No valid style properties to add`);
      return;
    }
    
    const existingStyleAttr = path.node.openingElement.attributes?.find((attr: any) =>
      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'style'
    );
    
    if (existingStyleAttr && t.isJSXExpressionContainer(existingStyleAttr.value)) {
      // Merge with existing styles
      if (t.isObjectExpression(existingStyleAttr.value.expression)) {
        existingStyleAttr.value.expression.properties.push(...styleProperties);
      }
    } else {
      // Create new comprehensive style attribute
      const styleAttr = t.jsxAttribute(
        t.jsxIdentifier('style'),
        t.jsxExpressionContainer(t.objectExpression(styleProperties))
      );
      
      path.node.openingElement.attributes = path.node.openingElement.attributes || [];
      path.node.openingElement.attributes.push(styleAttr);
    }
    
    console.error(`[${this.name}] Added comprehensive inline styles: ${Object.keys(styles).join(', ')}`);
  }
  
  private toCamelCase(str: string): string {
    // Convert CSS property names to valid JavaScript identifiers
    // background-color → backgroundColor, font-size → fontSize, grid-template-columns → gridTemplateColumns
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  
  private isValidIdentifier(name: string): boolean {
    // Validate JavaScript identifier safety (no hyphens, special chars, reserved words)
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) return false;
    
    // Check for reserved JavaScript keywords
    const reservedWords = ['class', 'for', 'function', 'var', 'let', 'const', 'return', 'if', 'else'];
    return !reservedWords.includes(name);
  }
  
  private sanitizePropertyValue(value: string): string {
    // Comprehensive escaping for CSS values in string literals
    return value
      .replace(/\\/g, '\\\\')    // Escape backslashes first
      .replace(/"/g, '\\"')      // Escape double quotes
      .replace(/'/g, "\\'")      // Escape single quotes
      .replace(/`/g, '\\`')      // Escape template literals
      .replace(/\n/g, '\\n')     // Escape newlines
      .replace(/\r/g, '\\r');    // Escape carriage returns
  }
  
  private validateGeneratedJSX(code: string): void {
    // Validate generated JSX syntax to prevent compilation errors
    try {
      parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        strictMode: false
      });
      console.error(`[${this.name}] ✅ Generated JSX syntax validation passed`);
    } catch (syntaxError) {
      console.error(`[${this.name}] ❌ Generated JSX has syntax errors:`, syntaxError instanceof Error ? syntaxError.message : 'unknown');
      console.error(`[${this.name}] This will cause compilation failure in Remotion Studio`);
      throw new Error(`Generated JSX syntax error: ${syntaxError instanceof Error ? syntaxError.message : 'unknown'}`);
    }
  }
  
  private getRemainingClasses(originalClasses: string, convertedStyles: Record<string, string>): string {
    // Keep classes that weren't fully converted (like dynamic template literals)
    const classArray = originalClasses.split(/\s+/);
    const convertedClassTypes = ['text-', 'font-', 'bg-', 'p-', 'm-', 'gap-', 'grid', 'flex', 'items-', 'justify-', 'rounded', 'shadow', 'opacity-', 'transform'];
    
    const remainingClasses = classArray.filter(cls => {
      // Keep dynamic classes and unconverted special classes
      if (cls.includes('${') || cls.includes('animate-') || cls.includes('transition-')) {
        return true;
      }
      
      // Remove if converted to inline styles
      return !convertedClassTypes.some(type => cls.startsWith(type));
    });
    
    return remainingClasses.join(' ').trim();
  }
  
  private removeClassNameAttribute(path: any) {
    path.node.openingElement.attributes = path.node.openingElement.attributes?.filter((attr: any) =>
      !(t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className')
    ) || [];
  }
  
  private preserveDynamicStyling(path: any) {
    // Preserve template literals and scene-based dynamic styling (renamed from convertBackgroundGradients)
    const classNameAttr = path.node.openingElement.attributes?.find((attr: any) =>
      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className'
    );
    
    if (classNameAttr && t.isJSXExpressionContainer(classNameAttr.value)) {
      console.error(`[${this.name}] Preserving dynamic scene-based className expression`);
      // Keep dynamic template literals intact for scene-specific styling
    }
  }

  private removeStyleJSXBlocks(path: any) {
    // Remove <style jsx> blocks that cause Remotion compatibility issues  
    if (!path?.node?.openingElement?.name) return;
    
    if (t.isJSXIdentifier(path.node.openingElement.name) &&
        path.node.openingElement.name.name === 'style') {
      
      const jsxAttr = path.node.openingElement.attributes?.find((attr: any) =>
        t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'jsx'
      );
      
      if (jsxAttr) {
        console.error(`[${this.name}] Removing style jsx block for Remotion compatibility`);
        path.remove();
        return;
      }
    }
  }

  private convertBackgroundGradients(path: any) {
    // PRESERVE dynamic scene-based gradients, only convert static ones
    if (!path?.node?.openingElement?.name) return;
    
    if (t.isJSXIdentifier(path.node.openingElement.name) &&
        path.node.openingElement.name.name === 'div') {
      
      const classNameAttr = path.node.openingElement.attributes?.find((attr: any) =>
        t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className'
      );
      
      if (classNameAttr) {
        // Check if className is template literal (dynamic scene-based)
        if (t.isJSXExpressionContainer(classNameAttr.value)) {
          console.error(`[${this.name}] Preserving dynamic scene-based className expression`);
          return; // Keep dynamic scene styling intact
        }
        
        if (t.isStringLiteral(classNameAttr.value)) {
          const classes = classNameAttr.value.value;
          
          // DON'T convert if it references scene state
          if (classes.includes('${scenes[currentScene]') || 
              classes.includes('${currentSceneData.color}') ||
              classes.includes('scenes[')) {
            console.error(`[${this.name}] Preserving dynamic scene gradient reference: ${classes}`);
            return; // Keep original template literal for scene-specific colors
          }
          
          // Only convert static gradient classes (no scene references)
          if (classes.includes('bg-gradient-to-br') && !classes.includes('${')) {
            console.error(`[${this.name}] Converting static gradient: ${classes}`);
            
            // Map only common static gradients, preserve scene-specific ones
            const staticGradientMap: { [key: string]: string } = {
              'from-gray-900 to-black': 'linear-gradient(135deg, #111827 0%, #000000 100%)',
              'from-black to-gray-900': 'linear-gradient(135deg, #000000 0%, #111827 100%)'
            };
            
            // Only convert if explicitly static pattern
            for (const [pattern, css] of Object.entries(staticGradientMap)) {
              if (classes.includes(pattern)) {
                this.addExplicitGradientStyle(path, css);
                break;
              }
            }
          }
        }
      }
    }
  }

  private addExplicitGradientStyle(path: any, gradientCSS: string) {
    // Add explicit gradient as style property for Remotion visibility
    const existingStyleAttr = path.node.openingElement.attributes?.find((attr: any) =>
      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'style'
    );
    
    if (existingStyleAttr && t.isJSXExpressionContainer(existingStyleAttr.value)) {
      // Add to existing style object
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
            t.objectProperty(t.identifier('minHeight'), t.stringLiteral('100vh')),
            t.objectProperty(t.identifier('position'), t.stringLiteral('relative'))
          ])
        )
      );
      
      path.node.openingElement.attributes = path.node.openingElement.attributes || [];
      path.node.openingElement.attributes.push(styleAttr);
    }
  }

  private enhanceIconRendering(path: any) {
    // Enhance lucide-react icon rendering for Remotion visibility
    if (!path?.node?.openingElement?.name) return;
    
    if (t.isJSXIdentifier(path.node.openingElement.name)) {
      const iconName = path.node.openingElement.name.name;
      const lucideIcons = ['Github', 'Brain', 'Star', 'Monitor', 'Bot', 'Terminal', 'FileText', 'Search', 'Download', 'Settings', 'Code', 'Cpu', 'GitBranch', 'CheckCircle', 'Zap', 'Play'];
      
      if (lucideIcons.includes(iconName)) {
        console.error(`[${this.name}] Enhancing icon rendering for: ${iconName}`);
        
        // Add explicit props for better Remotion visibility
        const enhancedProps = [
          t.jsxAttribute(t.jsxIdentifier('strokeWidth'), t.stringLiteral('2')),
          t.jsxAttribute(t.jsxIdentifier('color'), t.stringLiteral('currentColor'))
        ];
        
        // Only add size if not already present
        const hasSizeProp = path.node.openingElement.attributes?.some((attr: any) =>
          t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'size'
        );
        
        if (!hasSizeProp) {
          enhancedProps.push(t.jsxAttribute(t.jsxIdentifier('size'), t.stringLiteral('24')));
        }
        
        path.node.openingElement.attributes = path.node.openingElement.attributes || [];
        path.node.openingElement.attributes.push(...enhancedProps);
      }
    }
  }

  private preserveContentStructure(path: any) {
    // Convert root divs to AbsoluteFill for proper Remotion showcase layout
    if (!path?.node?.openingElement?.name) return;
    
    if (t.isJSXIdentifier(path.node.openingElement.name) && 
        path.node.openingElement.name.name === 'div') {
      
      const hasFullScreenClasses = path.node.openingElement.attributes?.some((attr: any) => {
        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
          if (t.isStringLiteral(attr.value)) {
            const classes = attr.value.value;
            return classes.includes('w-full') && classes.includes('h-screen');
          }
        }
        return false;
      });
      
      if (hasFullScreenClasses) {
        console.error(`[${this.name}] Converting root div to AbsoluteFill for showcase layout`);
        path.node.openingElement.name = t.jsxIdentifier('AbsoluteFill');
        if (path.node.closingElement) {
          path.node.closingElement.name = t.jsxIdentifier('AbsoluteFill');
        }
      }
    }
  }

  private removeInteractivity(path: any) {
    // Remove interactive attributes for video context
    if (t.isJSXIdentifier(path.node.name)) {
      const attrName = path.node.name.name;
      if (['onClick', 'onMouseMove', 'onMouseOver', 'onMouseOut'].includes(attrName)) {
        console.error(`[${this.name}] Removing interactive attribute: ${attrName}`);
        path.remove();
      }
    }
  }
}