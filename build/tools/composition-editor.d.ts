/**
 * Advanced Composition Editor - Real-time video element manipulation
 * Enables adding, editing, removing, and repositioning video elements
 */
import { MCPServer } from '../index.js';
export interface CompositionElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'animation';
    props: Record<string, any>;
    timing?: {
        from: number;
        duration: number;
    };
}
export interface CompositionAction {
    action: 'add' | 'edit' | 'remove' | 'list' | 'timing' | 'transform';
    element?: CompositionElement;
    project: string;
}
export declare class CompositionEditor {
    private server;
    private logger;
    constructor(server: MCPServer);
    executeAction(action: CompositionAction): Promise<string>;
    private getProjectPath;
    private addElement;
    private editElement;
    private removeElement;
    private generateElementCode;
    private generateTextElement;
    private generateImageElement;
    private generateShapeElement;
    private generateAnimationElement;
    private insertElementIntoRender;
    private replaceElementInRender;
    private addImportIfNeeded;
    private listElements;
    private adjustTiming;
}
/**
 * Register composition tools with the MCP server
 */
export declare function registerCompositionTools(server: MCPServer): void;
//# sourceMappingURL=composition-editor.d.ts.map