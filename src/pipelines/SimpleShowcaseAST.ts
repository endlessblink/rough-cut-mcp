// SimpleShowcaseAST - Remotion-native approach that actually works
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export class SimpleShowcaseAST {
  public name = 'SimpleShowcaseAST';
  private originalJsx = '';
  
  constructor() {
    console.error(`[${this.name}] Initializing SIMPLE Remotion-native showcase pipeline`);
  }

  async transform(jsx: string): Promise<string> {
    console.error(`[${this.name}] Processing with SIMPLE approach (${jsx.length} chars)`);
    this.originalJsx = jsx;
    
    try {
      const ast = parser.parse(jsx, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators'],
        strictMode: false
      });

      traverse(ast, {
        Program: (path) => this.addRemotionImports(path),
        VariableDeclaration: (path) => this.handleSimpleStates(path),
        CallExpression: (path) => this.removeInteractivity(path),
        JSXElement: (path) => this.applySimpleRemotion(path),
        JSXAttribute: (path) => this.removeInteractiveAttrs(path)
      });

      const result = generate(ast, {
        retainLines: false,
        compact: false,
        comments: true
      });

      console.error(`[${this.name}] SIMPLE conversion completed`);
      return result.code;

    } catch (error) {
      console.error(`[${this.name}] Simple pipeline failed:`, error instanceof Error ? error.message : 'unknown');
      throw error;
    }
  }

  private addRemotionImports(path: any) {
    // Add only essential Remotion imports
    const remotionImport = t.importDeclaration(
      [
        t.importSpecifier(t.identifier('AbsoluteFill'), t.identifier('AbsoluteFill')),
        t.importSpecifier(t.identifier('useCurrentFrame'), t.identifier('useCurrentFrame'))
      ],
      t.stringLiteral('remotion')
    );
    
    const reactImport = t.importDeclaration([], t.stringLiteral('react'));
    
    path.unshiftContainer('body', [remotionImport, reactImport]);
  }

  private handleSimpleStates(path: any) {
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
            console.error(`[${this.name}] SIMPLE: Processing ${varName}`);
            
            // Navigation: Use simple, safe frame progression
            if (['currentScene', 'currentSlide'].includes(varName)) {
              const simpleNavigation = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier(varName),
                  t.binaryExpression('%',
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('floor')),
                      [t.binaryExpression('/', t.callExpression(t.identifier('useCurrentFrame'), []), t.numericLiteral(90))]
                    ),
                    t.numericLiteral(4) // Simple 4-scene limit
                  )
                )
              ]);
              
              path.replaceWith(simpleNavigation);
              path.skip();
            } 
            // Everything else: Simple static values
            else {
              const staticValue = declarator.init.arguments[0] || t.numericLiteral(0);
              const simpleConstant = t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(varName), staticValue)
              ]);
              
              path.replaceWith(simpleConstant);
              path.skip();
            }
          }
        }
      }
    }
  }

  private applySimpleRemotion(path: any) {
    if (t.isJSXElement(path.node)) {
      // Convert root divs to AbsoluteFill (only conversion that works reliably)
      if (t.isJSXIdentifier(path.node.openingElement.name) &&
          path.node.openingElement.name.name === 'div') {
        
        const hasFullScreen = this.hasFullScreenClasses(path);
        if (hasFullScreen) {
          console.error(`[${this.name}] Converting to AbsoluteFill`);
          path.node.openingElement.name = t.jsxIdentifier('AbsoluteFill');
          if (path.node.closingElement) {
            path.node.closingElement.name = t.jsxIdentifier('AbsoluteFill');
          }
          
          // Remove complex className, add simple style
          this.addSimpleStyle(path);
        }
      }
    }
  }

  private hasFullScreenClasses(path: any): boolean {
    return path.node.openingElement.attributes?.some((attr: any) => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
        if (t.isStringLiteral(attr.value)) {
          const classes = attr.value.value;
          return classes.includes('min-h-screen') || (classes.includes('w-full') && classes.includes('h-full'));
        }
      }
      return false;
    });
  }

  private addSimpleStyle(path: any) {
    // Remove complex className
    path.node.openingElement.attributes = path.node.openingElement.attributes?.filter((attr: any) =>
      !(t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className')
    ) || [];
    
    // Add simple, working style
    const simpleStyle = t.jsxAttribute(
      t.jsxIdentifier('style'),
      t.jsxExpressionContainer(
        t.objectExpression([
          t.objectProperty(t.identifier('background'), t.stringLiteral('linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)')),
          t.objectProperty(t.identifier('color'), t.stringLiteral('#ffffff')),
          t.objectProperty(t.identifier('padding'), t.stringLiteral('40px')),
          t.objectProperty(t.identifier('fontSize'), t.stringLiteral('32px')),
          t.objectProperty(t.identifier('fontWeight'), t.stringLiteral('bold')),
          t.objectProperty(t.identifier('textAlign'), t.stringLiteral('center'))
        ])
      )
    );
    
    path.node.openingElement.attributes.push(simpleStyle);
    console.error(`[${this.name}] Added simple working style`);
  }

  private removeInteractivity(path: any) {
    // Remove useEffect
    if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useEffect') {
      if (t.isExpressionStatement(path.parent)) {
        path.parentPath.remove();
      }
    }
    
    // Remove setState calls
    if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('set')) {
      if (t.isExpressionStatement(path.parent)) {
        path.parentPath.remove();
      }
    }
  }

  private removeInteractiveAttrs(path: any) {
    if (t.isJSXIdentifier(path.node.name)) {
      const attrName = path.node.name.name;
      if (['onClick', 'onMouseMove', 'onChange'].includes(attrName)) {
        path.remove();
      }
    }
  }
}