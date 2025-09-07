// AnimationAST Pipeline - Specialized for cosmic waves, particles, visual effects
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export class AnimationAST {
  public name = 'AnimationAST';
  
  constructor() {
    console.error(`[${this.name}] Initializing animation pipeline for rich visual similarity`);
  }

  async transform(jsx: string): Promise<string> {
    console.error(`[${this.name}] Processing animation-heavy artifact (${jsx.length} chars)`);
    
    try {
      const ast = parser.parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators'],
        strictMode: false
      });

      // Apply animation-specific transformations
      traverse(ast, {
        Program: (path) => this.addRemotionImports(path),
        VariableDeclaration: (path) => this.enhanceAnimationStates(path),
        CallExpression: (path) => this.optimizeAnimationCalls(path),
        JSXElement: (path) => this.wrapInAbsoluteFill(path),
        JSXAttribute: (path) => this.removeInteractivity(path)
      });

      const result = generate(ast, {
        retainLines: false,
        compact: false,
        comments: true
      });

      console.error(`[${this.name}] Enhanced animation capabilities - visual similarity optimized`);
      return result.code;

    } catch (error) {
      console.error(`[${this.name}] Animation pipeline failed:`, error instanceof Error ? error.message : 'unknown');
      throw error;
    }
  }

  private addRemotionImports(path: any) {
    console.error(`[${this.name}] Adding Remotion imports for animation framework`);
    
    // Remove existing React imports and add Remotion
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

  private enhanceAnimationStates(path: any) {
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
            console.error(`[${this.name}] Enhancing animation state: ${varName}`);
            
            // Enhanced animation-specific useState conversion
            if (varName === 'particles') {
              const enhancedParticles = this.createEnhancedParticleSystem();
              path.replaceWith(enhancedParticles);
              path.skip();
            } else if (varName === 'time') {
              const enhancedTime = this.createEnhancedTimeSystem();
              path.replaceWith(enhancedTime);
              path.skip();
            } else if (varName === 'mousePos') {
              const enhancedMouse = this.createEnhancedMouseSystem();
              path.replaceWith(enhancedMouse);
              path.skip();
            } else {
              // Generic enhanced animation state
              const enhanced = this.createGenericAnimationState(varName);
              path.replaceWith(enhanced);
              path.skip();
            }
          }
        }
      }
    }
  }

  private createEnhancedParticleSystem(): any {
    console.error(`[${this.name}] Creating enhanced particle system for maximum visual impact`);
    
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('particles'),
        t.callExpression(
          t.memberExpression(t.identifier('Array'), t.identifier('from')),
          [
            t.objectExpression([
              t.objectProperty(t.identifier('length'), t.numericLiteral(50))
            ]),
            t.arrowFunctionExpression(
              [t.identifier('_'), t.identifier('i')],
              t.objectExpression([
                t.objectProperty(t.identifier('id'), t.identifier('i')),
                t.objectProperty(
                  t.identifier('x'),
                  t.binaryExpression('+',
                    t.binaryExpression('*',
                      t.callExpression(
                        t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                        [t.binaryExpression('*', 
                          t.binaryExpression('+', t.identifier('i'), t.callExpression(t.identifier('useCurrentFrame'), [])),
                          t.numericLiteral(0.02)
                        )]
                      ),
                      t.numericLiteral(200)
                    ),
                    t.numericLiteral(400)
                  )
                ),
                t.objectProperty(
                  t.identifier('y'),
                  t.binaryExpression('+',
                    t.binaryExpression('*',
                      t.callExpression(
                        t.memberExpression(t.identifier('Math'), t.identifier('cos')),
                        [t.binaryExpression('*', 
                          t.binaryExpression('+', t.identifier('i'), t.callExpression(t.identifier('useCurrentFrame'), [])),
                          t.numericLiteral(0.03)
                        )]
                      ),
                      t.numericLiteral(150)
                    ),
                    t.numericLiteral(300)
                  )
                ),
                t.objectProperty(
                  t.identifier('size'),
                  t.binaryExpression('+',
                    t.numericLiteral(3),
                    t.binaryExpression('*',
                      t.callExpression(
                        t.memberExpression(t.identifier('Math'), t.identifier('sin')),
                        [t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.1))]
                      ),
                      t.numericLiteral(2)
                    )
                  )
                ),
                t.objectProperty(
                  t.identifier('hue'),
                  t.binaryExpression('%',
                    t.binaryExpression('+',
                      t.binaryExpression('*', t.identifier('i'), t.numericLiteral(30)),
                      t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(2))
                    ),
                    t.numericLiteral(360)
                  )
                ),
                t.objectProperty(t.identifier('opacity'), t.numericLiteral(0.8))
              ])
            )
          ]
        )
      )
    ]);
  }

  private createEnhancedTimeSystem(): any {
    console.error(`[${this.name}] Creating enhanced time system for smooth animations`);
    
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('time'),
        t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.016))
      )
    ]);
  }

  private createEnhancedMouseSystem(): any {
    console.error(`[${this.name}] Creating enhanced mouse simulation for interactive effects`);
    
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

  private createGenericAnimationState(varName: string): any {
    console.error(`[${this.name}] Creating generic animation state for: ${varName}`);
    
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(varName),
        t.binaryExpression('*', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(0.1))
      )
    ]);
  }

  private optimizeAnimationCalls(path: any) {
    // Remove interactive setState calls that break animations
    if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('set')) {
      const funcName = path.node.callee.name;
      if (funcName.length > 3 && funcName[3] === funcName[3].toUpperCase()) {
        console.error(`[${this.name}] Removing interactive setState: ${funcName}()`);
        if (t.isExpressionStatement(path.parent)) {
          path.parentPath.remove();
        }
      }
    }
  }

  private wrapInAbsoluteFill(path: any) {
    // Convert root divs to AbsoluteFill for proper Remotion layout
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
        console.error(`[${this.name}] Converting root div to AbsoluteFill for animation layout`);
        path.node.openingElement.name = t.jsxIdentifier('AbsoluteFill');
        if (path.node.closingElement) {
          path.node.closingElement.name = t.jsxIdentifier('AbsoluteFill');
        }
      }
    }
  }

  private removeInteractivity(path: any) {
    // Remove interactive attributes that don't work in video context
    if (t.isJSXIdentifier(path.node.name)) {
      const attrName = path.node.name.name;
      if (['onClick', 'onMouseMove', 'onMouseOver', 'onMouseOut'].includes(attrName)) {
        console.error(`[${this.name}] Removing interactive attribute: ${attrName}`);
        path.remove();
      }
    }
  }
}