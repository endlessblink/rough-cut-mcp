// AST manipulation utilities for editing video elements
import { parse, ParserOptions } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import { getLogger } from './logger.js';

// Handle default exports properly
const traverse = (_traverse as any).default || _traverse;
const generate = (_generate as any).default || _generate;

const logger = getLogger().service('ASTManipulation');

export interface EditOperation {
  elementId: string;
  changes: {
    text?: string;
    style?: Record<string, any>;
    props?: Record<string, any>;
    position?: { x?: number; y?: number };
    timing?: { start?: number; end?: number };
  };
}

export interface ParseResult {
  success: boolean;
  ast?: t.File;
  code?: string;
  error?: string;
}

export interface EditResult {
  success: boolean;
  modifiedCode?: string;
  changes?: string[];
  warnings?: string[];
  error?: string;
}

/**
 * Parse TypeScript/JSX code into an AST
 */
export function parseVideoComposition(code: string): ParseResult {
  try {
    const parserOptions: ParserOptions = {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
      ],
    };

    const ast = parse(code, parserOptions);
    
    return {
      success: true,
      ast,
      code,
    };

  } catch (error: any) {
    logger.error('Failed to parse video composition:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate code from AST
 */
export function generateCode(ast: t.File): string {
  const result = generate(ast, {
    retainLines: true,
    compact: false,
  });
  
  return result.code;
}

/**
 * Find JSX elements by various criteria
 */
export function findJSXElements(
  ast: t.File,
  criteria: {
    elementName?: string;
    className?: string;
    id?: string;
    textContent?: string;
    hasProps?: string[];
  }
): t.JSXElement[] {
  const elements: t.JSXElement[] = [];

  traverse(ast, {
    JSXElement(path: any) {
      const element = path.node;
      const openingElement = element.openingElement;
      
      // Check element name
      if (criteria.elementName) {
        const elementName = t.isJSXIdentifier(openingElement.name) 
          ? openingElement.name.name 
          : null;
        if (elementName !== criteria.elementName) return;
      }

      // Check for className
      if (criteria.className) {
        const classNameAttr = openingElement.attributes.find((attr: any) => 
          t.isJSXAttribute(attr) && 
          t.isJSXIdentifier(attr.name) && 
          attr.name.name === 'className'
        );
        if (!classNameAttr) return;
        
        const classValue = t.isJSXAttribute(classNameAttr) && 
          t.isStringLiteral(classNameAttr.value) 
          ? classNameAttr.value.value 
          : null;
        if (!classValue?.includes(criteria.className)) return;
      }

      // Check for id
      if (criteria.id) {
        const idAttr = openingElement.attributes.find((attr: any) => 
          t.isJSXAttribute(attr) && 
          t.isJSXIdentifier(attr.name) && 
          attr.name.name === 'id'
        );
        if (!idAttr) return;
        
        const idValue = t.isJSXAttribute(idAttr) && 
          t.isStringLiteral(idAttr.value) 
          ? idAttr.value.value 
          : null;
        if (idValue !== criteria.id) return;
      }

      // Check text content
      if (criteria.textContent) {
        const hasText = element.children.some((child: any) => 
          t.isJSXText(child) && child.value.includes(criteria.textContent!)
        );
        if (!hasText) return;
      }

      // Check for required props
      if (criteria.hasProps) {
        const hasAllProps = criteria.hasProps.every(propName =>
          openingElement.attributes.some((attr: any) =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === propName
          )
        );
        if (!hasAllProps) return;
      }

      elements.push(element);
    }
  });

  return elements;
}

/**
 * Update JSX element properties
 */
export function updateJSXElementProps(
  element: t.JSXElement,
  propUpdates: Record<string, any>
): string[] {
  const changes: string[] = [];
  const openingElement = element.openingElement;

  for (const [propName, propValue] of Object.entries(propUpdates)) {
    // Find existing attribute
    const existingAttrIndex = openingElement.attributes.findIndex(attr => 
      t.isJSXAttribute(attr) && 
      t.isJSXIdentifier(attr.name) && 
      attr.name.name === propName
    );

    let newValue: t.JSXExpressionContainer | t.StringLiteral;
    
    // Create appropriate value node based on type
    if (typeof propValue === 'string') {
      newValue = t.stringLiteral(propValue);
    } else if (typeof propValue === 'number') {
      newValue = t.jsxExpressionContainer(t.numericLiteral(propValue));
    } else if (typeof propValue === 'boolean') {
      newValue = t.jsxExpressionContainer(t.booleanLiteral(propValue));
    } else if (typeof propValue === 'object' && propValue !== null) {
      // For objects, create object expression
      const properties = Object.entries(propValue).map(([key, val]) => {
        let valueNode: t.Expression;
        if (typeof val === 'string') valueNode = t.stringLiteral(val);
        else if (typeof val === 'number') valueNode = t.numericLiteral(val);
        else if (typeof val === 'boolean') valueNode = t.booleanLiteral(val);
        else valueNode = t.stringLiteral(String(val));
        
        return t.objectProperty(t.identifier(key), valueNode);
      });
      newValue = t.jsxExpressionContainer(t.objectExpression(properties));
    } else {
      newValue = t.stringLiteral(String(propValue));
    }

    const newAttribute = t.jsxAttribute(t.jsxIdentifier(propName), newValue);

    if (existingAttrIndex >= 0) {
      // Update existing attribute
      openingElement.attributes[existingAttrIndex] = newAttribute;
      changes.push(`Updated ${propName} property`);
    } else {
      // Add new attribute
      openingElement.attributes.push(newAttribute);
      changes.push(`Added ${propName} property`);
    }
  }

  return changes;
}

/**
 * Update text content of JSX element
 */
export function updateJSXTextContent(element: t.JSXElement, newText: string): string[] {
  const changes: string[] = [];
  
  // Remove existing text children
  element.children = element.children.filter(child => !t.isJSXText(child));
  
  // Add new text
  if (newText) {
    element.children.unshift(t.jsxText(newText));
    changes.push(`Updated text content to: "${newText}"`);
  }

  return changes;
}

/**
 * Update style properties of JSX element
 */
export function updateJSXElementStyle(
  element: t.JSXElement, 
  styleUpdates: Record<string, any>
): string[] {
  const changes: string[] = [];
  const openingElement = element.openingElement;

  // Find existing style attribute
  const styleAttrIndex = openingElement.attributes.findIndex(attr => 
    t.isJSXAttribute(attr) && 
    t.isJSXIdentifier(attr.name) && 
    attr.name.name === 'style'
  );

  let styleProperties: t.ObjectProperty[] = [];

  // If style attribute exists, parse existing properties
  if (styleAttrIndex >= 0) {
    const styleAttr = openingElement.attributes[styleAttrIndex];
    if (t.isJSXAttribute(styleAttr) && 
        t.isJSXExpressionContainer(styleAttr.value) &&
        t.isObjectExpression(styleAttr.value.expression)) {
      styleProperties = [...styleAttr.value.expression.properties.filter(
        prop => t.isObjectProperty(prop)
      ) as t.ObjectProperty[]];
    }
  }

  // Update or add style properties
  for (const [styleProp, styleValue] of Object.entries(styleUpdates)) {
    const existingPropIndex = styleProperties.findIndex(prop => 
      t.isIdentifier(prop.key) && prop.key.name === styleProp
    );

    let valueNode: t.Expression;
    if (typeof styleValue === 'string') valueNode = t.stringLiteral(styleValue);
    else if (typeof styleValue === 'number') valueNode = t.numericLiteral(styleValue);
    else valueNode = t.stringLiteral(String(styleValue));

    const newProperty = t.objectProperty(t.identifier(styleProp), valueNode);

    if (existingPropIndex >= 0) {
      styleProperties[existingPropIndex] = newProperty;
      changes.push(`Updated style.${styleProp} = ${styleValue}`);
    } else {
      styleProperties.push(newProperty);
      changes.push(`Added style.${styleProp} = ${styleValue}`);
    }
  }

  // Create new style attribute
  const styleExpression = t.objectExpression(styleProperties);
  const newStyleAttr = t.jsxAttribute(
    t.jsxIdentifier('style'),
    t.jsxExpressionContainer(styleExpression)
  );

  if (styleAttrIndex >= 0) {
    openingElement.attributes[styleAttrIndex] = newStyleAttr;
  } else {
    openingElement.attributes.push(newStyleAttr);
  }

  return changes;
}

/**
 * Main function to edit video elements
 */
export function editVideoElement(code: string, operation: EditOperation): EditResult {
  try {
    const parseResult = parseVideoComposition(code);
    if (!parseResult.success || !parseResult.ast) {
      return {
        success: false,
        error: parseResult.error || 'Failed to parse code',
      };
    }

    const changes: string[] = [];
    const warnings: string[] = [];

    // Find target elements - try multiple strategies
    let elements = findJSXElements(parseResult.ast, { id: operation.elementId });
    
    if (elements.length === 0) {
      elements = findJSXElements(parseResult.ast, { className: operation.elementId });
    }

    if (elements.length === 0) {
      elements = findJSXElements(parseResult.ast, { elementName: operation.elementId });
    }

    if (elements.length === 0) {
      elements = findJSXElements(parseResult.ast, { textContent: operation.elementId });
    }

    if (elements.length === 0) {
      return {
        success: false,
        error: `No elements found matching identifier: ${operation.elementId}`,
      };
    }

    if (elements.length > 1) {
      warnings.push(`Found ${elements.length} elements matching "${operation.elementId}". Updating all.`);
    }

    // Apply changes to each found element
    for (const element of elements) {
      // Update text content
      if (operation.changes.text !== undefined) {
        const textChanges = updateJSXTextContent(element, operation.changes.text);
        changes.push(...textChanges);
      }

      // Update style properties
      if (operation.changes.style) {
        const styleChanges = updateJSXElementStyle(element, operation.changes.style);
        changes.push(...styleChanges);
      }

      // Update other props
      if (operation.changes.props) {
        const propChanges = updateJSXElementProps(element, operation.changes.props);
        changes.push(...propChanges);
      }

      // Handle position updates (convert to style)
      if (operation.changes.position) {
        const positionStyle: Record<string, any> = {};
        if (operation.changes.position.x !== undefined) {
          positionStyle.left = `${operation.changes.position.x}px`;
        }
        if (operation.changes.position.y !== undefined) {
          positionStyle.top = `${operation.changes.position.y}px`;
        }
        if (Object.keys(positionStyle).length > 0) {
          positionStyle.position = 'absolute';
          const positionChanges = updateJSXElementStyle(element, positionStyle);
          changes.push(...positionChanges);
        }
      }

      // Handle timing updates (for Sequence components)
      if (operation.changes.timing) {
        const timingProps: Record<string, any> = {};
        if (operation.changes.timing.start !== undefined) {
          timingProps.from = operation.changes.timing.start;
        }
        if (operation.changes.timing.end !== undefined && operation.changes.timing.start !== undefined) {
          timingProps.durationInFrames = operation.changes.timing.end - operation.changes.timing.start;
        }
        if (Object.keys(timingProps).length > 0) {
          const timingChanges = updateJSXElementProps(element, timingProps);
          changes.push(...timingChanges);
        }
      }
    }

    // Generate modified code
    const modifiedCode = generateCode(parseResult.ast);

    return {
      success: true,
      modifiedCode,
      changes,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

  } catch (error: any) {
    logger.error('Error editing video element:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Add a new JSX element to the composition
 */
export function addJSXElement(
  ast: t.File,
  parentSelector: {
    elementName?: string;
    className?: string;
    id?: string;
  },
  newElement: t.JSXElement,
  position: 'start' | 'end' | number = 'end'
): EditResult {
  const changes: string[] = [];
  let elementAdded = false;

  try {
    traverse(ast, {
      JSXElement(path: any) {
        const element = path.node;
        const openingElement = element.openingElement;
        
        // Check if this is the parent element we're looking for
        let isMatch = true;
        
        if (parentSelector.elementName) {
          const elementName = t.isJSXIdentifier(openingElement.name) 
            ? openingElement.name.name 
            : null;
          if (elementName !== parentSelector.elementName) isMatch = false;
        }

        if (parentSelector.className && isMatch) {
          const classNameAttr = openingElement.attributes.find((attr: any) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'className'
          );
          const classValue = t.isJSXAttribute(classNameAttr) && 
            t.isStringLiteral(classNameAttr.value) 
            ? classNameAttr.value.value 
            : null;
          if (!classValue?.includes(parentSelector.className)) isMatch = false;
        }

        if (parentSelector.id && isMatch) {
          const idAttr = openingElement.attributes.find((attr: any) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'id'
          );
          const idValue = t.isJSXAttribute(idAttr) && 
            t.isStringLiteral(idAttr.value) 
            ? idAttr.value.value 
            : null;
          if (idValue !== parentSelector.id) isMatch = false;
        }

        if (isMatch && !elementAdded) {
          // Add the new element at the specified position
          if (position === 'start') {
            element.children.unshift(newElement);
            changes.push('Added element at the start');
          } else if (position === 'end') {
            element.children.push(newElement);
            changes.push('Added element at the end');
          } else if (typeof position === 'number') {
            element.children.splice(position, 0, newElement);
            changes.push(`Added element at position ${position}`);
          }
          elementAdded = true;
          path.stop(); // Stop traversing once we've added the element
        }
      },
    });

    if (!elementAdded) {
      return {
        success: false,
        error: 'Parent element not found with the specified selector',
      };
    }

    const modifiedCode = generateCode(ast);
    return {
      success: true,
      modifiedCode,
      changes,
    };

  } catch (error: any) {
    logger.error('Failed to add JSX element:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Remove a JSX element from the composition
 */
export function removeJSXElement(
  ast: t.File,
  selector: {
    elementName?: string;
    className?: string;
    id?: string;
    index?: number;
  }
): EditResult {
  const changes: string[] = [];
  let elementRemoved = false;
  let matchCount = 0;

  try {
    traverse(ast, {
      JSXElement(path: any) {
        const element = path.node;
        const openingElement = element.openingElement;
        
        // Check if this is the element we want to remove
        let isMatch = true;
        
        if (selector.elementName) {
          const elementName = t.isJSXIdentifier(openingElement.name) 
            ? openingElement.name.name 
            : null;
          if (elementName !== selector.elementName) isMatch = false;
        }

        if (selector.className && isMatch) {
          const classNameAttr = openingElement.attributes.find((attr: any) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'className'
          );
          const classValue = t.isJSXAttribute(classNameAttr) && 
            t.isStringLiteral(classNameAttr.value) 
            ? classNameAttr.value.value 
            : null;
          if (!classValue?.includes(selector.className)) isMatch = false;
        }

        if (selector.id && isMatch) {
          const idAttr = openingElement.attributes.find((attr: any) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'id'
          );
          const idValue = t.isJSXAttribute(idAttr) && 
            t.isStringLiteral(idAttr.value) 
            ? idAttr.value.value 
            : null;
          if (idValue !== selector.id) isMatch = false;
        }

        if (isMatch) {
          // If index is specified, only remove the nth match
          if (selector.index !== undefined) {
            if (matchCount === selector.index) {
              path.remove();
              changes.push(`Removed element at index ${selector.index}`);
              elementRemoved = true;
              path.stop();
            }
            matchCount++;
          } else {
            // Remove the first match if no index specified
            path.remove();
            changes.push('Removed element');
            elementRemoved = true;
            path.stop();
          }
        }
      },
    });

    if (!elementRemoved) {
      return {
        success: false,
        error: 'Element not found with the specified selector',
      };
    }

    const modifiedCode = generateCode(ast);
    return {
      success: true,
      modifiedCode,
      changes,
    };

  } catch (error: any) {
    logger.error('Failed to remove JSX element:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Replace an entire JSX element with a new one
 */
export function replaceJSXElement(
  ast: t.File,
  selector: {
    elementName?: string;
    className?: string;
    id?: string;
  },
  newElement: t.JSXElement
): EditResult {
  const changes: string[] = [];
  let elementReplaced = false;

  try {
    traverse(ast, {
      JSXElement(path: any) {
        const element = path.node;
        const openingElement = element.openingElement;
        
        // Check if this is the element we want to replace
        let isMatch = true;
        
        if (selector.elementName) {
          const elementName = t.isJSXIdentifier(openingElement.name) 
            ? openingElement.name.name 
            : null;
          if (elementName !== selector.elementName) isMatch = false;
        }

        if (selector.className && isMatch) {
          const classNameAttr = openingElement.attributes.find((attr: any) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'className'
          );
          const classValue = t.isJSXAttribute(classNameAttr) && 
            t.isStringLiteral(classNameAttr.value) 
            ? classNameAttr.value.value 
            : null;
          if (!classValue?.includes(selector.className)) isMatch = false;
        }

        if (selector.id && isMatch) {
          const idAttr = openingElement.attributes.find((attr: any) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'id'
          );
          const idValue = t.isJSXAttribute(idAttr) && 
            t.isStringLiteral(idAttr.value) 
            ? idAttr.value.value 
            : null;
          if (idValue !== selector.id) isMatch = false;
        }

        if (isMatch && !elementReplaced) {
          path.replaceWith(newElement);
          changes.push('Replaced element');
          elementReplaced = true;
          path.stop();
        }
      },
    });

    if (!elementReplaced) {
      return {
        success: false,
        error: 'Element not found with the specified selector',
      };
    }

    const modifiedCode = generateCode(ast);
    return {
      success: true,
      modifiedCode,
      changes,
    };

  } catch (error: any) {
    logger.error('Failed to replace JSX element:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a JSX element from a template
 */
export function createJSXElementFromTemplate(
  elementType: string,
  props: Record<string, any>,
  children?: (t.JSXElement | t.JSXText | t.JSXExpressionContainer)[]
): t.JSXElement {
  // Create opening element with props
  const attributes = Object.entries(props).map(([key, value]) => {
    let attrValue;
    if (typeof value === 'string') {
      attrValue = t.stringLiteral(value);
    } else if (typeof value === 'number') {
      attrValue = t.jsxExpressionContainer(t.numericLiteral(value));
    } else if (typeof value === 'boolean') {
      attrValue = value ? null : undefined; // true props don't need a value
    } else {
      // For objects and other complex types, create an expression
      attrValue = t.jsxExpressionContainer(
        t.objectExpression(
          Object.entries(value as any).map(([k, v]) =>
            t.objectProperty(
              t.identifier(k),
              typeof v === 'string' ? t.stringLiteral(v) : 
              typeof v === 'number' ? t.numericLiteral(v) :
              t.identifier('undefined')
            )
          )
        )
      );
    }

    if (attrValue !== undefined) {
      return t.jsxAttribute(t.jsxIdentifier(key), attrValue);
    }
    return t.jsxAttribute(t.jsxIdentifier(key), null);
  });

  const openingElement = t.jsxOpeningElement(
    t.jsxIdentifier(elementType),
    attributes,
    false
  );

  const closingElement = t.jsxClosingElement(
    t.jsxIdentifier(elementType)
  );

  return t.jsxElement(
    openingElement,
    closingElement,
    children || [],
    false
  );
}

/**
 * Validate that the modified code is syntactically correct
 */
export function validateModifiedCode(code: string): { valid: boolean; error?: string } {
  try {
    parseVideoComposition(code);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}