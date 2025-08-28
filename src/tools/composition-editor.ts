/**
 * Advanced Composition Editor - Real-time video element manipulation
 * Enables adding, editing, removing, and repositioning video elements
 */

import { MCPServer } from '../index.js';
import { ToolCategory } from '../types/tool-categories.js';
import { processVideoCode } from '../utils/interpolation-validator.js';
import * as path from 'path';
import fs from 'fs-extra';

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

export class CompositionEditor {
  private server: MCPServer;
  private logger: any;

  constructor(server: MCPServer) {
    this.server = server;
    this.logger = (server as any).baseLogger.service('composition-editor');
  }

  async executeAction(action: CompositionAction): Promise<string> {
    const projectPath = this.getProjectPath(action.project);
    
    switch (action.action) {
      case 'add':
        return await this.addElement(projectPath, action.element!);
        
      case 'edit':
        return await this.editElement(projectPath, action.element!);
        
      case 'remove':
        return await this.removeElement(projectPath, action.element!.id);
        
      case 'list':
        return await this.listElements(projectPath);
        
      case 'timing':
        return await this.adjustTiming(projectPath, action.element!);
        
      default:
        throw new Error(`Unknown composition action: ${action.action}`);
    }
  }

  private getProjectPath(projectName: string): string {
    return path.join(this.server.config.assetsDir, 'projects', projectName);
  }
  
  private async addElement(projectPath: string, element: CompositionElement): Promise<string> {
    const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    if (!await fs.pathExists(compositionFile)) {
      throw new Error(`VideoComposition.tsx not found in project`);
    }
    
    let content = await fs.readFile(compositionFile, 'utf8');
    
    // Generate component code for the new element
    const newComponent = this.generateElementCode(element);
    
    // Add import if needed
    content = this.addImportIfNeeded(content, element.type);
    
    // Find the return statement and add the new element
    content = this.insertElementIntoRender(content, newComponent, element);
    
    // Validate and fix interpolation ranges
    content = processVideoCode(content);
    
    // Write back to file
    await fs.writeFile(compositionFile, content);
    
    this.logger.info('Added element to composition', { 
      projectPath, 
      elementType: element.type, 
      elementId: element.id 
    });
    
    return `✅ Added ${element.type} element "${element.id}" to composition`;
  }
  
  private async editElement(projectPath: string, element: CompositionElement): Promise<string> {
    const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
    let content = await fs.readFile(compositionFile, 'utf8');
    
    // Find and replace existing element
    const updatedComponent = this.generateElementCode(element);
    content = this.replaceElementInRender(content, element.id, updatedComponent);
    
    // Validate and fix interpolation ranges
    content = processVideoCode(content);
    
    await fs.writeFile(compositionFile, content);
    
    this.logger.info('Updated element in composition', { 
      projectPath, 
      elementId: element.id 
    });
    
    return `✅ Updated element "${element.id}" with new properties`;
  }

  private async removeElement(projectPath: string, elementId: string): Promise<string> {
    const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
    let content = await fs.readFile(compositionFile, 'utf8');
    
    // Remove the sequence with matching name
    const sequenceRegex = new RegExp(`<Sequence[^>]*name="${elementId}"[^>]*>.*?</Sequence>`, 'gs');
    
    if (!sequenceRegex.test(content)) {
      throw new Error(`Element with id "${elementId}" not found in composition`);
    }
    
    content = content.replace(sequenceRegex, '');
    
    // Clean up extra whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    await fs.writeFile(compositionFile, content);
    
    this.logger.info('Removed element from composition', { 
      projectPath, 
      elementId 
    });
    
    return `✅ Removed element "${elementId}" from composition`;
  }
  
  private generateElementCode(element: CompositionElement): string {
    const { type, props, timing } = element;
    
    switch (type) {
      case 'text':
        return this.generateTextElement(element);
        
      case 'image':
        return this.generateImageElement(element);
        
      case 'shape':
        return this.generateShapeElement(element);
        
      case 'animation':
        return this.generateAnimationElement(element);
        
      default:
        throw new Error(`Unknown element type: ${type}`);
    }
  }
  
  private generateTextElement(element: CompositionElement): string {
    const { id, props, timing } = element;
    const {
      text = 'Sample Text',
      fontSize = 48,
      color = '#ffffff',
      x = '50%',
      y = '50%',
      opacity = 1,
      fontFamily = 'Arial, sans-serif',
      fontWeight = 'normal',
      textAlign = 'center',
      animation = 'none'
    } = props;
    
    const sequenceProps = timing 
      ? `from={${timing.from}} durationInFrames={${timing.duration}}`
      : 'from={0} durationInFrames={90}';

    // Add animation logic if specified
    let animationCode = '';
    let animationStyle = '';
    
    if (animation === 'fadeIn') {
      animationCode = `
  const ${id}Opacity = safeInterpolate(frame, [${timing?.from || 0}, ${(timing?.from || 0) + 30}], [0, ${opacity}], { extrapolateRight: 'clamp' });`;
      animationStyle = `opacity: ${id}Opacity,`;
    } else if (animation === 'slideIn') {
      animationCode = `
  const ${id}X = safeInterpolate(frame, [${timing?.from || 0}, ${(timing?.from || 0) + 30}], [-100, 0], { extrapolateRight: 'clamp' });`;
      animationStyle = `transform: 'translate(calc(-50% + ' + ${id}X + 'px), -50%)',`;
    } else {
      animationStyle = `opacity: ${opacity}, transform: 'translate(-50%, -50%)',`;
    }
    
    return `
      <Sequence ${sequenceProps} name="${id}">
        {(() => {${animationCode}
          return (
            <div style={{
              position: 'absolute',
              left: '${x}',
              top: '${y}',
              ${animationStyle}
              fontSize: '${fontSize}px',
              color: '${color}',
              fontFamily: '${fontFamily}',
              fontWeight: '${fontWeight}',
              textAlign: '${textAlign}',
              whiteSpace: 'pre-wrap',
              maxWidth: '80%',
              wordWrap: 'break-word'
            }}>
              ${text}
            </div>
          );
        })()}
      </Sequence>`;
  }
  
  private generateImageElement(element: CompositionElement): string {
    const { id, props, timing } = element;
    const {
      src,
      width = 400,
      height = 300,
      x = '50%',
      y = '50%',
      opacity = 1,
      objectFit = 'contain',
      borderRadius = 0,
      animation = 'none'
    } = props;
    
    const sequenceProps = timing 
      ? `from={${timing.from}} durationInFrames={${timing.duration}}`
      : 'from={0} durationInFrames={90}';

    // Add animation logic
    let animationCode = '';
    let animationStyle = '';
    
    if (animation === 'zoomIn') {
      animationCode = `
  const ${id}Scale = safeInterpolate(frame, [${timing?.from || 0}, ${(timing?.from || 0) + 30}], [0.5, 1], { extrapolateRight: 'clamp' });`;
      animationStyle = `transform: 'translate(-50%, -50%) scale(' + ${id}Scale + ')',`;
    } else {
      animationStyle = `transform: 'translate(-50%, -50%)',`;
    }
    
    return `
      <Sequence ${sequenceProps} name="${id}">
        {(() => {${animationCode}
          return (
            <img 
              src="${src}"
              style={{
                position: 'absolute',
                left: '${x}',
                top: '${y}',
                ${animationStyle}
                width: '${width}px',
                height: '${height}px',
                opacity: ${opacity},
                objectFit: '${objectFit}',
                borderRadius: '${borderRadius}px'
              }}
            />
          );
        })()}
      </Sequence>`;
  }

  private generateShapeElement(element: CompositionElement): string {
    const { id, props, timing } = element;
    const {
      shape = 'rectangle',
      width = 200,
      height = 200,
      x = '50%',
      y = '50%',
      backgroundColor = '#ff6b6b',
      borderColor = 'transparent',
      borderWidth = 0,
      borderRadius = 0,
      opacity = 1
    } = props;
    
    const sequenceProps = timing 
      ? `from={${timing.from}} durationInFrames={${timing.duration}}`
      : 'from={0} durationInFrames={90}';

    let shapeStyle = '';
    
    if (shape === 'circle') {
      shapeStyle = `
        width: '${width}px',
        height: '${width}px',
        borderRadius: '50%',`;
    } else if (shape === 'rectangle') {
      shapeStyle = `
        width: '${width}px',
        height: '${height}px',
        borderRadius: '${borderRadius}px',`;
    }
    
    return `
      <Sequence ${sequenceProps} name="${id}">
        <div style={{
          position: 'absolute',
          left: '${x}',
          top: '${y}',
          transform: 'translate(-50%, -50%)',${shapeStyle}
          backgroundColor: '${backgroundColor}',
          border: '${borderWidth}px solid ${borderColor}',
          opacity: ${opacity}
        }} />
      </Sequence>`;
  }

  private generateAnimationElement(element: CompositionElement): string {
    const { id, props, timing } = element;
    const {
      animationType = 'bounce',
      size = 50,
      color = '#4ecdc4',
      x = '50%',
      y = '50%'
    } = props;
    
    const sequenceProps = timing 
      ? `from={${timing.from}} durationInFrames={${timing.duration}}`
      : 'from={0} durationInFrames={90}';

    let animationCode = '';
    
    if (animationType === 'bounce') {
      animationCode = `
  const ${id}Y = safeInterpolate(
    frame % 60,
    [0, 15, 30, 45, 60],
    [0, -20, 0, -10, 0],
    { extrapolateRight: 'clamp' }
  );`;
    } else if (animationType === 'rotate') {
      animationCode = `
  const ${id}Rotation = safeInterpolate(frame, [${timing?.from || 0}, ${(timing?.from || 0) + 60}], [0, 360]);`;
    }
    
    return `
      <Sequence ${sequenceProps} name="${id}">
        {(() => {${animationCode}
          return (
            <div style={{
              position: 'absolute',
              left: '${x}',
              top: '${y}',
              transform: 'translate(-50%, -50%)' + 
                ${animationType === 'bounce' ? `' translateY(' + ${id}Y + 'px)'` : 
                  animationType === 'rotate' ? `' rotate(' + ${id}Rotation + 'deg)'` : "''"} ,
              width: '${size}px',
              height: '${size}px',
              backgroundColor: '${color}',
              borderRadius: '50%'
            }} />
          );
        })()}
      </Sequence>`;
  }
  
  private insertElementIntoRender(content: string, newElement: string, element: CompositionElement): string {
    // Find the main return statement
    const returnMatch = content.match(/return\s*\(/);
    if (!returnMatch) {
      throw new Error('Could not find return statement in component');
    }
    
    // Find the last closing div/fragment before the final closing parenthesis/bracket
    const lines = content.split('\n');
    let insertIndex = -1;
    let parenDepth = 0;
    let inReturn = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('return (') || line.includes('return(')) {
        inReturn = true;
        continue;
      }
      
      if (inReturn) {
        // Count parentheses to find the right closing spot
        for (const char of line) {
          if (char === '(' || char === '<') parenDepth++;
          if (char === ')' || char === '>') parenDepth--;
        }
        
        // Look for closing tags that indicate end of content area
        if ((line.includes('</AbsoluteFill>') || line.includes('</div>')) && parenDepth <= 2) {
          insertIndex = i;
          break;
        }
      }
    }
    
    if (insertIndex === -1) {
      // Fallback: insert before the last substantial closing tag
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('</AbsoluteFill>') || lines[i].includes('</div>')) {
          insertIndex = i;
          break;
        }
      }
    }
    
    if (insertIndex === -1) {
      throw new Error('Could not find suitable insertion point in component');
    }
    
    // Insert the new element
    lines.splice(insertIndex, 0, newElement);
    
    return lines.join('\n');
  }
  
  private replaceElementInRender(content: string, elementId: string, newElement: string): string {
    // Find the Sequence with the matching name
    const sequenceRegex = new RegExp(`<Sequence[^>]*name="${elementId}"[^>]*>.*?</Sequence>`, 'gs');
    
    if (!sequenceRegex.test(content)) {
      throw new Error(`Could not find element with id "${elementId}"`);
    }
    
    return content.replace(sequenceRegex, newElement.trim());
  }
  
  private addImportIfNeeded(content: string, elementType: string): string {
    // Check if Sequence is imported (needed for all elements)
    if (!content.includes('Sequence')) {
      // Add Sequence to imports
      content = content.replace(
        /import\s*{([^}]*)}\s*from\s*['"]remotion['"];/,
        (match, imports) => {
          const importList = imports.split(',').map((s: string) => s.trim());
          if (!importList.includes('Sequence')) {
            importList.push('Sequence');
          }
          return `import { ${importList.join(', ')} } from 'remotion';`;
        }
      );
    }
    
    return content;
  }
  
  private async listElements(projectPath: string): Promise<string> {
    const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    if (!await fs.pathExists(compositionFile)) {
      return 'No VideoComposition.tsx found in project';
    }
    
    const content = await fs.readFile(compositionFile, 'utf8');
    
    // Extract all Sequence elements
    const sequenceRegex = /<Sequence[^>]*name="([^"]*)"[^>]*>/g;
    const elements = [];
    let match;
    
    while ((match = sequenceRegex.exec(content)) !== null) {
      elements.push(match[1]);
    }
    
    return elements.length > 0 
      ? `Found elements: ${elements.join(', ')}`
      : 'No elements found in composition';
  }

  private async adjustTiming(projectPath: string, element: CompositionElement): Promise<string> {
    const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
    let content = await fs.readFile(compositionFile, 'utf8');
    
    if (!element.timing) {
      throw new Error('Timing information required for timing adjustment');
    }
    
    // Find the sequence and update its timing
    const sequenceRegex = new RegExp(
      `(<Sequence[^>]*name="${element.id}"[^>]*)from={[0-9]+}([^>]*durationInFrames={[0-9]+}[^>]*>)`,
      'g'
    );
    
    content = content.replace(sequenceRegex, 
      `$1from={${element.timing.from}}$2`
    );
    
    // Also update duration if provided
    const durationRegex = new RegExp(
      `(<Sequence[^>]*name="${element.id}"[^>]*from={[0-9]+}[^>]*)durationInFrames={[0-9]+}([^>]*>)`,
      'g'
    );
    
    content = content.replace(durationRegex,
      `$1durationInFrames={${element.timing.duration}}$2`
    );
    
    await fs.writeFile(compositionFile, content);
    
    this.logger.info('Adjusted element timing', { 
      projectPath, 
      elementId: element.id,
      timing: element.timing
    });
    
    return `✅ Updated timing for element "${element.id}" - starts at frame ${element.timing.from}, duration ${element.timing.duration} frames`;
  }
}

/**
 * Register composition tools with the MCP server
 */
export function registerCompositionTools(server: MCPServer): void {
  const editor = new CompositionEditor(server);
  const logger = (server as any).baseLogger.service('composition-tools');

  // Main composition manipulation tool
  server.toolRegistry.registerTool(
    {
      name: 'composition',
      description: 'Add, edit, remove, and manage video composition elements in real-time',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['add', 'edit', 'remove', 'list', 'timing'],
            description: 'Action to perform on composition'
          },
          project: {
            type: 'string',
            description: 'Project name to modify'
          },
          element: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique element ID' },
              type: { 
                type: 'string', 
                enum: ['text', 'image', 'shape', 'animation'],
                description: 'Type of element to add/edit'
              },
              props: {
                type: 'object',
                description: 'Element properties (varies by type)',
                properties: {
                  // Text props
                  text: { type: 'string', description: 'Text content' },
                  fontSize: { type: 'number', default: 48 },
                  color: { type: 'string', default: '#ffffff' },
                  fontFamily: { type: 'string', default: 'Arial, sans-serif' },
                  
                  // Image props
                  src: { type: 'string', description: 'Image URL or path' },
                  width: { type: 'number', default: 400 },
                  height: { type: 'number', default: 300 },
                  
                  // Shape props
                  shape: { type: 'string', enum: ['rectangle', 'circle'], default: 'rectangle' },
                  backgroundColor: { type: 'string', default: '#ff6b6b' },
                  borderColor: { type: 'string', default: 'transparent' },
                  borderWidth: { type: 'number', default: 0 },
                  borderRadius: { type: 'number', default: 0 },
                  
                  // Animation props
                  animationType: { type: 'string', enum: ['bounce', 'rotate', 'fadeIn', 'slideIn', 'zoomIn'] },
                  
                  // Universal props
                  x: { type: 'string', default: '50%', description: 'X position' },
                  y: { type: 'string', default: '50%', description: 'Y position' },
                  opacity: { type: 'number', default: 1, minimum: 0, maximum: 1 }
                }
              },
              timing: {
                type: 'object',
                properties: {
                  from: { type: 'number', description: 'Start frame' },
                  duration: { type: 'number', description: 'Duration in frames' }
                }
              }
            },
            required: ['id']
          }
        },
        required: ['action', 'project']
      }
    },
    async (args: any) => {
      try {
        const result = await editor.executeAction(args as CompositionAction);
        
        return {
          content: [{
            type: 'text',
            text: result
          }]
        };
      } catch (error) {
        logger.error('Composition operation failed', { error });
        throw error;
      }
    },
    {
      name: 'composition',
      category: ToolCategory.VIDEO_CREATION,
      subCategory: 'editing',
      tags: ['composition', 'element', 'edit', 'add', 'remove'],
      loadByDefault: false,
      priority: 1,
      estimatedTokens: 200
    }
  );
}