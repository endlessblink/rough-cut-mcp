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
        JSXElement: (path) => this.preserveContentStructure(path),
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
      console.error(`[${this.name}] Extracting scene count from showcase content`);
      
      // Look for scenes array patterns
      const sceneArrayPatterns = [
        /scenes\s*=\s*\[\s*([\s\S]*?)\s*\]/,
        /const\s+scenes\s*=\s*\[\s*([\s\S]*?)\s*\]/
      ];
      
      for (const pattern of sceneArrayPatterns) {
        const match = this.originalJsx.match(pattern);
        if (match) {
          const sceneContent = match[1];
          const sceneObjects = sceneContent.match(/{[^{}]*id\s*:/g) || [];
          const sceneCount = sceneObjects.length;
          
          console.error(`[${this.name}] Detected ${sceneCount} scenes in showcase`);
          if (sceneCount > 0) {
            return Math.max(sceneCount, 3);
          }
        }
      }
      
      // Fallback: count scene definitions
      const sceneIdMatches = this.originalJsx.match(/id:\s*['"][^'"]+['"]/g) || [];
      const fallbackCount = Math.max(sceneIdMatches.length, 5);
      
      console.error(`[${this.name}] Fallback scene count: ${fallbackCount}`);
      return fallbackCount;
      
    } catch (error) {
      console.error(`[${this.name}] Scene count extraction failed, defaulting to 5`);
      return 5;
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

  private preserveContentStructure(path: any) {
    // Convert root divs to AbsoluteFill for proper Remotion showcase layout
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