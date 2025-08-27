import * as t from '@babel/types';
export interface EditOperation {
    elementId: string;
    changes: {
        text?: string;
        style?: Record<string, any>;
        props?: Record<string, any>;
        position?: {
            x?: number;
            y?: number;
        };
        timing?: {
            start?: number;
            end?: number;
        };
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
export declare function parseVideoComposition(code: string): ParseResult;
/**
 * Generate code from AST
 */
export declare function generateCode(ast: t.File): string;
/**
 * Find JSX elements by various criteria
 */
export declare function findJSXElements(ast: t.File, criteria: {
    elementName?: string;
    className?: string;
    id?: string;
    textContent?: string;
    hasProps?: string[];
}): t.JSXElement[];
/**
 * Update JSX element properties
 */
export declare function updateJSXElementProps(element: t.JSXElement, propUpdates: Record<string, any>): string[];
/**
 * Update text content of JSX element
 */
export declare function updateJSXTextContent(element: t.JSXElement, newText: string): string[];
/**
 * Update style properties of JSX element
 */
export declare function updateJSXElementStyle(element: t.JSXElement, styleUpdates: Record<string, any>): string[];
/**
 * Main function to edit video elements
 */
export declare function editVideoElement(code: string, operation: EditOperation): EditResult;
/**
 * Add a new JSX element to the composition
 */
export declare function addJSXElement(ast: t.File, parentSelector: {
    elementName?: string;
    className?: string;
    id?: string;
}, newElement: t.JSXElement, position?: 'start' | 'end' | number): EditResult;
/**
 * Remove a JSX element from the composition
 */
export declare function removeJSXElement(ast: t.File, selector: {
    elementName?: string;
    className?: string;
    id?: string;
    index?: number;
}): EditResult;
/**
 * Replace an entire JSX element with a new one
 */
export declare function replaceJSXElement(ast: t.File, selector: {
    elementName?: string;
    className?: string;
    id?: string;
}, newElement: t.JSXElement): EditResult;
/**
 * Create a JSX element from a template
 */
export declare function createJSXElementFromTemplate(elementType: string, props: Record<string, any>, children?: (t.JSXElement | t.JSXText | t.JSXExpressionContainer)[]): t.JSXElement;
/**
 * Validate that the modified code is syntactically correct
 */
export declare function validateModifiedCode(code: string): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=ast-manipulation.d.ts.map