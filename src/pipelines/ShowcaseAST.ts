// ShowcaseAST Pipeline - Specialized for GitHub showcases, presentations, content-heavy artifacts
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export class ShowcaseAST {
  public name = 'ShowcaseAST';
  private originalJsx = '';
  
  constructor() {
    console.error(`[${this.name}] Initializing showcase pipeline for content preservation + navigation`);
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
              const sceneCount = this.extractSceneCount();
              console.error(`[${this.name}] Converting ${varName} to cycle through ${sceneCount} scenes`);
              
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
                    t.numericLiteral(sceneCount)
                  )
                )
              ]);
              
              path.replaceWith(frameBasedNavigation);
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
      console.error(`[${this.name}] Robust scene count detection starting`);
      
      // Method 1: Direct scenes array parsing with balanced brace counting
      const scenesArrayPattern = /scenes\s*=\s*\[([\s\S]*?)\]/;
      const arrayMatch = this.originalJsx.match(scenesArrayPattern);
      
      if (arrayMatch) {
        const arrayContent = arrayMatch[1];
        console.error(`[${this.name}] Found scenes array, parsing ${arrayContent.length} chars`);
        
        let objectCount = 0;
        let braceDepth = 0;
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < arrayContent.length; i++) {
          const char = arrayContent[i];
          const prevChar = arrayContent[i - 1];
          
          // Handle string boundaries safely
          if ((char === '"' || char === "'") && prevChar !== '\\') {
            if (!inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar) {
              inString = false;
            }
            continue;
          }
          
          // Count objects only outside strings
          if (!inString) {
            if (char === '{') {
              if (braceDepth === 0) {
                objectCount++; // New scene object starts
                console.error(`[${this.name}] Found scene object ${objectCount}`);
              }
              braceDepth++;
            } else if (char === '}') {
              braceDepth--;
            }
          }
        }
        
        console.error(`[${this.name}] ACCURATE DETECTION: ${objectCount} scene objects found`);
        
        if (objectCount > 0) {
          return objectCount; // Return ACTUAL count, no artificial inflation
        }
      }
      
      // Method 2: Count scene objects by title property (simpler fallback)
      const titlePattern = /{\s*[^}]*title\s*:\s*['"][^'"]+['"][^}]*}/g;
      const titleMatches = this.originalJsx.match(titlePattern) || [];
      const titleCount = titleMatches.length;
      
      console.error(`[${this.name}] Title-based detection: ${titleCount} scenes`);
      
      if (titleCount > 0) {
        return titleCount;
      }
      
      // Method 3: Conservative fallback - don't inflate count
      console.error(`[${this.name}] Warning: Could not detect scene count accurately`);
      return 3; // Safe conservative default instead of artificial 6
      
    } catch (error) {
      console.error(`[${this.name}] Scene extraction failed: ${error instanceof Error ? error.message : 'unknown'}`);
      return 3; // Conservative safe default
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
    // Comprehensive visual rendering fixes for showcase artifacts with null safety
    if (!path || !path.node) {
      console.error(`[${this.name}] Skipping null path in visual rendering`);
      return;
    }
    
    if (t.isJSXElement(path.node)) {
      try {
        this.removeStyleJSXBlocks(path);
        this.convertBackgroundGradients(path);
        this.enhanceIconRendering(path);
        this.preserveContentStructure(path);
      } catch (error) {
        console.error(`[${this.name}] Visual rendering error: ${error instanceof Error ? error.message : 'unknown'}`);
        console.error(`[${this.name}] Error in element: ${path.node.openingElement?.name?.name || 'unknown'}`);
      }
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