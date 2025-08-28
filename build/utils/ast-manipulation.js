"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVideoComposition = parseVideoComposition;
exports.generateCode = generateCode;
exports.findJSXElements = findJSXElements;
exports.updateJSXElementProps = updateJSXElementProps;
exports.updateJSXTextContent = updateJSXTextContent;
exports.updateJSXElementStyle = updateJSXElementStyle;
exports.editVideoElement = editVideoElement;
exports.addJSXElement = addJSXElement;
exports.removeJSXElement = removeJSXElement;
exports.replaceJSXElement = replaceJSXElement;
exports.createJSXElementFromTemplate = createJSXElementFromTemplate;
exports.validateModifiedCode = validateModifiedCode;
// AST manipulation utilities for editing video elements
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const generator_1 = __importDefault(require("@babel/generator"));
const t = __importStar(require("@babel/types"));
const logger_js_1 = require("./logger.js");
// Handle default exports properly
const traverse = traverse_1.default.default || traverse_1.default;
const generate = generator_1.default.default || generator_1.default;
const logger = (0, logger_js_1.getLogger)().service('ASTManipulation');
/**
 * Parse TypeScript/JSX code into an AST
 */
function parseVideoComposition(code) {
    try {
        const parserOptions = {
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
        const ast = (0, parser_1.parse)(code, parserOptions);
        return {
            success: true,
            ast,
            code,
        };
    }
    catch (error) {
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
function generateCode(ast) {
    const result = generate(ast, {
        retainLines: true,
        compact: false,
    });
    return result.code;
}
/**
 * Find JSX elements by various criteria
 */
function findJSXElements(ast, criteria) {
    const elements = [];
    traverse(ast, {
        JSXElement(path) {
            const element = path.node;
            const openingElement = element.openingElement;
            // Check element name
            if (criteria.elementName) {
                const elementName = t.isJSXIdentifier(openingElement.name)
                    ? openingElement.name.name
                    : null;
                if (elementName !== criteria.elementName)
                    return;
            }
            // Check for className
            if (criteria.className) {
                const classNameAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === 'className');
                if (!classNameAttr)
                    return;
                const classValue = t.isJSXAttribute(classNameAttr) &&
                    t.isStringLiteral(classNameAttr.value)
                    ? classNameAttr.value.value
                    : null;
                if (!classValue?.includes(criteria.className))
                    return;
            }
            // Check for id
            if (criteria.id) {
                const idAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === 'id');
                if (!idAttr)
                    return;
                const idValue = t.isJSXAttribute(idAttr) &&
                    t.isStringLiteral(idAttr.value)
                    ? idAttr.value.value
                    : null;
                if (idValue !== criteria.id)
                    return;
            }
            // Check text content
            if (criteria.textContent) {
                const hasText = element.children.some(child => t.isJSXText(child) && child.value.includes(criteria.textContent));
                if (!hasText)
                    return;
            }
            // Check for required props
            if (criteria.hasProps) {
                const hasAllProps = criteria.hasProps.every(propName => openingElement.attributes.some(attr => t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === propName));
                if (!hasAllProps)
                    return;
            }
            elements.push(element);
        }
    });
    return elements;
}
/**
 * Update JSX element properties
 */
function updateJSXElementProps(element, propUpdates) {
    const changes = [];
    const openingElement = element.openingElement;
    for (const [propName, propValue] of Object.entries(propUpdates)) {
        // Find existing attribute
        const existingAttrIndex = openingElement.attributes.findIndex(attr => t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === propName);
        let newValue;
        // Create appropriate value node based on type
        if (typeof propValue === 'string') {
            newValue = t.stringLiteral(propValue);
        }
        else if (typeof propValue === 'number') {
            newValue = t.jsxExpressionContainer(t.numericLiteral(propValue));
        }
        else if (typeof propValue === 'boolean') {
            newValue = t.jsxExpressionContainer(t.booleanLiteral(propValue));
        }
        else if (typeof propValue === 'object' && propValue !== null) {
            // For objects, create object expression
            const properties = Object.entries(propValue).map(([key, val]) => {
                let valueNode;
                if (typeof val === 'string')
                    valueNode = t.stringLiteral(val);
                else if (typeof val === 'number')
                    valueNode = t.numericLiteral(val);
                else if (typeof val === 'boolean')
                    valueNode = t.booleanLiteral(val);
                else
                    valueNode = t.stringLiteral(String(val));
                return t.objectProperty(t.identifier(key), valueNode);
            });
            newValue = t.jsxExpressionContainer(t.objectExpression(properties));
        }
        else {
            newValue = t.stringLiteral(String(propValue));
        }
        const newAttribute = t.jsxAttribute(t.jsxIdentifier(propName), newValue);
        if (existingAttrIndex >= 0) {
            // Update existing attribute
            openingElement.attributes[existingAttrIndex] = newAttribute;
            changes.push(`Updated ${propName} property`);
        }
        else {
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
function updateJSXTextContent(element, newText) {
    const changes = [];
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
function updateJSXElementStyle(element, styleUpdates) {
    const changes = [];
    const openingElement = element.openingElement;
    // Find existing style attribute
    const styleAttrIndex = openingElement.attributes.findIndex(attr => t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        attr.name.name === 'style');
    let styleProperties = [];
    // If style attribute exists, parse existing properties
    if (styleAttrIndex >= 0) {
        const styleAttr = openingElement.attributes[styleAttrIndex];
        if (t.isJSXAttribute(styleAttr) &&
            t.isJSXExpressionContainer(styleAttr.value) &&
            t.isObjectExpression(styleAttr.value.expression)) {
            styleProperties = [...styleAttr.value.expression.properties.filter(prop => t.isObjectProperty(prop))];
        }
    }
    // Update or add style properties
    for (const [styleProp, styleValue] of Object.entries(styleUpdates)) {
        const existingPropIndex = styleProperties.findIndex(prop => t.isIdentifier(prop.key) && prop.key.name === styleProp);
        let valueNode;
        if (typeof styleValue === 'string')
            valueNode = t.stringLiteral(styleValue);
        else if (typeof styleValue === 'number')
            valueNode = t.numericLiteral(styleValue);
        else
            valueNode = t.stringLiteral(String(styleValue));
        const newProperty = t.objectProperty(t.identifier(styleProp), valueNode);
        if (existingPropIndex >= 0) {
            styleProperties[existingPropIndex] = newProperty;
            changes.push(`Updated style.${styleProp} = ${styleValue}`);
        }
        else {
            styleProperties.push(newProperty);
            changes.push(`Added style.${styleProp} = ${styleValue}`);
        }
    }
    // Create new style attribute
    const styleExpression = t.objectExpression(styleProperties);
    const newStyleAttr = t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(styleExpression));
    if (styleAttrIndex >= 0) {
        openingElement.attributes[styleAttrIndex] = newStyleAttr;
    }
    else {
        openingElement.attributes.push(newStyleAttr);
    }
    return changes;
}
/**
 * Main function to edit video elements
 */
function editVideoElement(code, operation) {
    try {
        const parseResult = parseVideoComposition(code);
        if (!parseResult.success || !parseResult.ast) {
            return {
                success: false,
                error: parseResult.error || 'Failed to parse code',
            };
        }
        const changes = [];
        const warnings = [];
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
                const positionStyle = {};
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
                const timingProps = {};
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
    }
    catch (error) {
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
function addJSXElement(ast, parentSelector, newElement, position = 'end') {
    const changes = [];
    let elementAdded = false;
    try {
        traverse(ast, {
            JSXElement(path) {
                const element = path.node;
                const openingElement = element.openingElement;
                // Check if this is the parent element we're looking for
                let isMatch = true;
                if (parentSelector.elementName) {
                    const elementName = t.isJSXIdentifier(openingElement.name)
                        ? openingElement.name.name
                        : null;
                    if (elementName !== parentSelector.elementName)
                        isMatch = false;
                }
                if (parentSelector.className && isMatch) {
                    const classNameAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                        t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'className');
                    const classValue = t.isJSXAttribute(classNameAttr) &&
                        t.isStringLiteral(classNameAttr.value)
                        ? classNameAttr.value.value
                        : null;
                    if (!classValue?.includes(parentSelector.className))
                        isMatch = false;
                }
                if (parentSelector.id && isMatch) {
                    const idAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                        t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'id');
                    const idValue = t.isJSXAttribute(idAttr) &&
                        t.isStringLiteral(idAttr.value)
                        ? idAttr.value.value
                        : null;
                    if (idValue !== parentSelector.id)
                        isMatch = false;
                }
                if (isMatch && !elementAdded) {
                    // Add the new element at the specified position
                    if (position === 'start') {
                        element.children.unshift(newElement);
                        changes.push('Added element at the start');
                    }
                    else if (position === 'end') {
                        element.children.push(newElement);
                        changes.push('Added element at the end');
                    }
                    else if (typeof position === 'number') {
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
    }
    catch (error) {
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
function removeJSXElement(ast, selector) {
    const changes = [];
    let elementRemoved = false;
    let matchCount = 0;
    try {
        traverse(ast, {
            JSXElement(path) {
                const element = path.node;
                const openingElement = element.openingElement;
                // Check if this is the element we want to remove
                let isMatch = true;
                if (selector.elementName) {
                    const elementName = t.isJSXIdentifier(openingElement.name)
                        ? openingElement.name.name
                        : null;
                    if (elementName !== selector.elementName)
                        isMatch = false;
                }
                if (selector.className && isMatch) {
                    const classNameAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                        t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'className');
                    const classValue = t.isJSXAttribute(classNameAttr) &&
                        t.isStringLiteral(classNameAttr.value)
                        ? classNameAttr.value.value
                        : null;
                    if (!classValue?.includes(selector.className))
                        isMatch = false;
                }
                if (selector.id && isMatch) {
                    const idAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                        t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'id');
                    const idValue = t.isJSXAttribute(idAttr) &&
                        t.isStringLiteral(idAttr.value)
                        ? idAttr.value.value
                        : null;
                    if (idValue !== selector.id)
                        isMatch = false;
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
                    }
                    else {
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
    }
    catch (error) {
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
function replaceJSXElement(ast, selector, newElement) {
    const changes = [];
    let elementReplaced = false;
    try {
        traverse(ast, {
            JSXElement(path) {
                const element = path.node;
                const openingElement = element.openingElement;
                // Check if this is the element we want to replace
                let isMatch = true;
                if (selector.elementName) {
                    const elementName = t.isJSXIdentifier(openingElement.name)
                        ? openingElement.name.name
                        : null;
                    if (elementName !== selector.elementName)
                        isMatch = false;
                }
                if (selector.className && isMatch) {
                    const classNameAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                        t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'className');
                    const classValue = t.isJSXAttribute(classNameAttr) &&
                        t.isStringLiteral(classNameAttr.value)
                        ? classNameAttr.value.value
                        : null;
                    if (!classValue?.includes(selector.className))
                        isMatch = false;
                }
                if (selector.id && isMatch) {
                    const idAttr = openingElement.attributes.find(attr => t.isJSXAttribute(attr) &&
                        t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'id');
                    const idValue = t.isJSXAttribute(idAttr) &&
                        t.isStringLiteral(idAttr.value)
                        ? idAttr.value.value
                        : null;
                    if (idValue !== selector.id)
                        isMatch = false;
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
    }
    catch (error) {
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
function createJSXElementFromTemplate(elementType, props, children) {
    // Create opening element with props
    const attributes = Object.entries(props).map(([key, value]) => {
        let attrValue;
        if (typeof value === 'string') {
            attrValue = t.stringLiteral(value);
        }
        else if (typeof value === 'number') {
            attrValue = t.jsxExpressionContainer(t.numericLiteral(value));
        }
        else if (typeof value === 'boolean') {
            attrValue = value ? null : undefined; // true props don't need a value
        }
        else {
            // For objects and other complex types, create an expression
            attrValue = t.jsxExpressionContainer(t.objectExpression(Object.entries(value).map(([k, v]) => t.objectProperty(t.identifier(k), typeof v === 'string' ? t.stringLiteral(v) :
                typeof v === 'number' ? t.numericLiteral(v) :
                    t.identifier('undefined')))));
        }
        if (attrValue !== undefined) {
            return t.jsxAttribute(t.jsxIdentifier(key), attrValue);
        }
        return t.jsxAttribute(t.jsxIdentifier(key), null);
    });
    const openingElement = t.jsxOpeningElement(t.jsxIdentifier(elementType), attributes, false);
    const closingElement = t.jsxClosingElement(t.jsxIdentifier(elementType));
    return t.jsxElement(openingElement, closingElement, children || [], false);
}
/**
 * Validate that the modified code is syntactically correct
 */
function validateModifiedCode(code) {
    try {
        parseVideoComposition(code);
        return { valid: true };
    }
    catch (error) {
        return { valid: false, error: error.message };
    }
}
//# sourceMappingURL=ast-manipulation.js.map