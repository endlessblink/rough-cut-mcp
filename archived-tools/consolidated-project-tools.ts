/**
 * Consolidated Project Management Tools
 * Reduces 23 tools to 4 powerful multi-action tools
 */

import { MCPServer } from '../index.js';
import { ProjectManagerService } from '../services/project-manager.js';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ToolCategory } from '../types/tool-categories.js';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

/**
 * Register consolidated project management tools
 */
export function registerConsolidatedProjectTools(server: MCPServer): void {
  const projectManager = new ProjectManagerService(server.config);
  const logger = server.logger.child({ service: 'consolidated-project-tools' });

  /**
   * Unified project management tool (replaces 7 separate tools)
   */
  server.toolRegistry.registerTool(
    {
      name: 'manage-project',
      description: 'Comprehensive project management - create, rename, delete, duplicate, list, or get info',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['create', 'rename', 'delete', 'duplicate', 'list', 'info', 'repair'],
            description: 'Action to perform'
          },
          projectName: {
            type: 'string',
            description: 'Name of the project (required for most actions)'
          },
          newName: {
            type: 'string',
            description: 'New name (for rename/duplicate actions)'
          },
          template: {
            type: 'string',
            description: 'Template to use for creation'
          },
          options: {
            type: 'object',
            description: 'Additional options for the action'
          }
        },
        required: ['action']
      }
    },
    async (args: any) => {
      const { action, projectName, newName, template, options = {} } = args;

      try {
        switch (action) {
          case 'create': {
            if (!projectName) throw new Error('Project name required for create action');
            const projectPath = path.join(server.config.assetsDir, 'projects', projectName);
            
            if (await fs.pathExists(projectPath)) {
              throw new Error(`Project "${projectName}" already exists`);
            }

            await fs.ensureDir(projectPath);
            await projectManager.createProject(projectName, template || 'basic', options);
            
            return {
              content: [{
                type: 'text',
                text: `✅ Project "${projectName}" created successfully at: ${projectPath}`
              }]
            };
          }

          case 'rename': {
            if (!projectName || !newName) {
              throw new Error('Both projectName and newName required for rename');
            }
            
            const oldPath = path.join(server.config.assetsDir, 'projects', projectName);
            const newPath = path.join(server.config.assetsDir, 'projects', newName);
            
            if (!await fs.pathExists(oldPath)) {
              throw new Error(`Project "${projectName}" not found`);
            }
            if (await fs.pathExists(newPath)) {
              throw new Error(`Project "${newName}" already exists`);
            }

            await fs.rename(oldPath, newPath);
            
            return {
              content: [{
                type: 'text',
                text: `✅ Project renamed from "${projectName}" to "${newName}"`
              }]
            };
          }

          case 'delete': {
            if (!projectName) throw new Error('Project name required for delete');
            
            const projectPath = path.join(server.config.assetsDir, 'projects', projectName);
            
            if (!await fs.pathExists(projectPath)) {
              throw new Error(`Project "${projectName}" not found`);
            }

            await fs.remove(projectPath);
            
            return {
              content: [{
                type: 'text',
                text: `✅ Project "${projectName}" deleted successfully`
              }]
            };
          }

          case 'duplicate': {
            if (!projectName || !newName) {
              throw new Error('Both projectName and newName required for duplicate');
            }
            
            const sourcePath = path.join(server.config.assetsDir, 'projects', projectName);
            const destPath = path.join(server.config.assetsDir, 'projects', newName);
            
            if (!await fs.pathExists(sourcePath)) {
              throw new Error(`Project "${projectName}" not found`);
            }
            if (await fs.pathExists(destPath)) {
              throw new Error(`Project "${newName}" already exists`);
            }

            await fs.copy(sourcePath, destPath);
            
            return {
              content: [{
                type: 'text',
                text: `✅ Project "${projectName}" duplicated as "${newName}"`
              }]
            };
          }

          case 'list': {
            const projects = await projectManager.listProjects();
            
            if (projects.length === 0) {
              return {
                content: [{
                  type: 'text',
                  text: 'No video projects found. Create one with action:"create"'
                }]
              };
            }

            const projectList = projects.map((p, i) => 
              `${i + 1}. **${p.name}** (${p.type || 'unknown'})\n` +
              `   Status: ${p.status}\n` +
              `   Path: ${p.path}`
            ).join('\n\n');

            return {
              content: [{
                type: 'text',
                text: `📁 Found ${projects.length} video project(s):\n\n${projectList}`
              }]
            };
          }

          case 'info': {
            if (!projectName) throw new Error('Project name required for info');
            
            const projectPath = path.join(server.config.assetsDir, 'projects', projectName);
            
            if (!await fs.pathExists(projectPath)) {
              throw new Error(`Project "${projectName}" not found`);
            }

            const info = await projectManager.getProjectInfo(projectName);
            
            return {
              content: [{
                type: 'text',
                text: `📊 Project: ${projectName}\n` +
                      `Status: ${info.status}\n` +
                      `Type: ${info.type}\n` +
                      `Path: ${info.path}\n` +
                      `Has package.json: ${info.hasPackageJson}\n` +
                      `Has VideoComposition: ${info.hasVideoComposition}\n` +
                      `Dependencies installed: ${info.dependenciesInstalled}`
              }]
            };
          }

          case 'repair': {
            if (!projectName) throw new Error('Project name required for repair');
            
            const result = await projectManager.repairProject(projectName);
            
            return {
              content: [{
                type: 'text',
                text: `✅ Project "${projectName}" repaired:\n${result.message}`
              }]
            };
          }

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error('Project management failed', { action, error });
        throw error;
      }
    },
    {
      category: ToolCategory.CORE_OPERATIONS,
      subCategory: 'project-management',
      tags: ['project', 'create', 'manage', 'crud'],
      loadByDefault: true,
      priority: 1,
      estimatedTokens: 150
    }
  );

  /**
   * Unified composition modification tool (replaces 9 element tools)
   */
  server.toolRegistry.registerTool(
    {
      name: 'modify-composition',
      description: 'Modify video composition elements - add, edit, remove, or list elements',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project'
          },
          action: {
            type: 'string',
            enum: ['add', 'edit', 'remove', 'list', 'replace'],
            description: 'Action to perform on elements'
          },
          elementId: {
            type: 'string',
            description: 'ID of the element to modify'
          },
          elementType: {
            type: 'string',
            enum: ['text', 'image', 'video', 'audio', 'shape', 'animation'],
            description: 'Type of element (for add action)'
          },
          properties: {
            type: 'object',
            description: 'Element properties to set or update'
          },
          code: {
            type: 'string',
            description: 'React component code (for replace action)'
          }
        },
        required: ['projectName', 'action']
      }
    },
    async (args: any) => {
      const { projectName, action, elementId, elementType, properties, code } = args;

      try {
        const compositionPath = path.join(
          server.config.assetsDir,
          'projects',
          projectName,
          'src',
          'VideoComposition.tsx'
        );

        if (!await fs.pathExists(compositionPath)) {
          throw new Error(`VideoComposition.tsx not found for project "${projectName}"`);
        }

        let content = await fs.readFile(compositionPath, 'utf-8');

        switch (action) {
          case 'add': {
            if (!elementType) throw new Error('Element type required for add action');
            
            // Parse and modify AST to add element
            const ast = parse(content, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript']
            });

            const newElement = createElementNode(elementType, properties || {});
            let added = false;

            traverse(ast, {
              JSXElement(path: any) {
                if (path.node.openingElement.name.name === 'Sequence') {
                  path.node.children.push(newElement);
                  added = true;
                  path.stop();
                }
              }
            });

            if (!added) throw new Error('Could not find Sequence to add element');

            const result = generate(ast, { retainLines: true });
            await fs.writeFile(compositionPath, result.code);

            return {
              content: [{
                type: 'text',
                text: `✅ Added ${elementType} element to ${projectName}`
              }]
            };
          }

          case 'edit': {
            if (!elementId) throw new Error('Element ID required for edit action');
            
            // Parse and modify AST to edit element
            const ast = parse(content, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript']
            });

            let edited = false;
            traverse(ast, {
              JSXElement(path: any) {
                const idAttr = path.node.openingElement.attributes?.find(
                  (attr: any) => attr.name?.name === 'id' && attr.value?.value === elementId
                );
                
                if (idAttr) {
                  // Update properties
                  if (properties) {
                    updateElementProperties(path.node, properties);
                  }
                  edited = true;
                  path.stop();
                }
              }
            });

            if (!edited) throw new Error(`Element with ID "${elementId}" not found`);

            const result = generate(ast, { retainLines: true });
            await fs.writeFile(compositionPath, result.code);

            return {
              content: [{
                type: 'text',
                text: `✅ Updated element "${elementId}" in ${projectName}`
              }]
            };
          }

          case 'remove': {
            if (!elementId) throw new Error('Element ID required for remove action');
            
            // Parse and modify AST to remove element
            const ast = parse(content, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript']
            });

            let removed = false;
            traverse(ast, {
              JSXElement(path: any) {
                const idAttr = path.node.openingElement.attributes?.find(
                  (attr: any) => attr.name?.name === 'id' && attr.value?.value === elementId
                );
                
                if (idAttr) {
                  path.remove();
                  removed = true;
                  path.stop();
                }
              }
            });

            if (!removed) throw new Error(`Element with ID "${elementId}" not found`);

            const result = generate(ast, { retainLines: true });
            await fs.writeFile(compositionPath, result.code);

            return {
              content: [{
                type: 'text',
                text: `✅ Removed element "${elementId}" from ${projectName}`
              }]
            };
          }

          case 'list': {
            // Parse and list all elements
            const ast = parse(content, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript']
            });

            const elements: any[] = [];
            traverse(ast, {
              JSXElement(path: any) {
                const name = path.node.openingElement.name.name;
                if (['AbsoluteFill', 'Series', 'Sequence', 'Audio', 'Video', 'Img'].includes(name)) {
                  const id = path.node.openingElement.attributes?.find(
                    (attr: any) => attr.name?.name === 'id'
                  )?.value?.value;
                  
                  elements.push({
                    type: name,
                    id: id || 'unnamed',
                    line: path.node.loc?.start.line
                  });
                }
              }
            });

            const elementList = elements.map((el, i) => 
              `${i + 1}. ${el.type} (${el.id}) - Line ${el.line}`
            ).join('\n');

            return {
              content: [{
                type: 'text',
                text: `📋 Elements in ${projectName}:\n\n${elementList}`
              }]
            };
          }

          case 'replace': {
            if (!code) throw new Error('Code required for replace action');
            
            await fs.writeFile(compositionPath, code);
            
            return {
              content: [{
                type: 'text',
                text: `✅ Replaced entire VideoComposition for ${projectName}`
              }]
            };
          }

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error('Composition modification failed', { action, error });
        throw error;
      }
    },
    {
      category: ToolCategory.VIDEO_CREATION,
      subCategory: 'editing',
      tags: ['edit', 'modify', 'composition', 'elements'],
      loadByDefault: false,
      priority: 2,
      estimatedTokens: 200
    }
  );

  /**
   * Unified timing control tool (replaces 3 timing tools)
   */
  server.toolRegistry.registerTool(
    {
      name: 'update-timing',
      description: 'Update element timing - duration, delay, from, or durationInFrames',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project'
          },
          elementId: {
            type: 'string',
            description: 'ID of the element'
          },
          timing: {
            type: 'object',
            properties: {
              from: { type: 'number', description: 'Start frame' },
              duration: { type: 'number', description: 'Duration in seconds' },
              durationInFrames: { type: 'number', description: 'Duration in frames' },
              delay: { type: 'number', description: 'Delay in seconds' }
            },
            description: 'Timing properties to update'
          }
        },
        required: ['projectName', 'elementId', 'timing']
      }
    },
    async (args: any) => {
      const { projectName, elementId, timing } = args;

      try {
        const compositionPath = path.join(
          server.config.assetsDir,
          'projects',
          projectName,
          'src',
          'VideoComposition.tsx'
        );

        if (!await fs.pathExists(compositionPath)) {
          throw new Error(`VideoComposition.tsx not found for project "${projectName}"`);
        }

        const content = await fs.readFile(compositionPath, 'utf-8');
        const ast = parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });

        let updated = false;
        traverse(ast, {
          JSXElement(path: any) {
            const idAttr = path.node.openingElement.attributes?.find(
              (attr: any) => attr.name?.name === 'id' && attr.value?.value === elementId
            );
            
            if (idAttr) {
              // Update timing attributes
              Object.entries(timing).forEach(([key, value]) => {
                updateOrAddAttribute(path.node, key, value);
              });
              updated = true;
              path.stop();
            }
          }
        });

        if (!updated) throw new Error(`Element "${elementId}" not found`);

        const result = generate(ast, { retainLines: true });
        await fs.writeFile(compositionPath, result.code);

        const timingDesc = Object.entries(timing)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');

        return {
          content: [{
            type: 'text',
            text: `✅ Updated timing for "${elementId}": ${timingDesc}`
          }]
        };
      } catch (error) {
        logger.error('Timing update failed', { error });
        throw error;
      }
    },
    {
      category: ToolCategory.VIDEO_CREATION,
      subCategory: 'timeline',
      tags: ['timing', 'duration', 'delay', 'timeline'],
      loadByDefault: false,
      priority: 3,
      estimatedTokens: 120
    }
  );

  /**
   * Unified transform control tool (replaces 2 transform tools)
   */
  server.toolRegistry.registerTool(
    {
      name: 'update-transform',
      description: 'Update element transform - position, size, scale, rotation',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project'
          },
          elementId: {
            type: 'string',
            description: 'ID of the element'
          },
          transform: {
            type: 'object',
            properties: {
              x: { type: 'number', description: 'X position' },
              y: { type: 'number', description: 'Y position' },
              width: { type: 'number', description: 'Width' },
              height: { type: 'number', description: 'Height' },
              scale: { type: 'number', description: 'Scale factor' },
              rotation: { type: 'number', description: 'Rotation in degrees' },
              opacity: { type: 'number', description: 'Opacity (0-1)' }
            },
            description: 'Transform properties to update'
          }
        },
        required: ['projectName', 'elementId', 'transform']
      }
    },
    async (args: any) => {
      const { projectName, elementId, transform } = args;

      try {
        const compositionPath = path.join(
          server.config.assetsDir,
          'projects',
          projectName,
          'src',
          'VideoComposition.tsx'
        );

        if (!await fs.pathExists(compositionPath)) {
          throw new Error(`VideoComposition.tsx not found for project "${projectName}"`);
        }

        const content = await fs.readFile(compositionPath, 'utf-8');
        const ast = parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });

        let updated = false;
        traverse(ast, {
          JSXElement(path: any) {
            const idAttr = path.node.openingElement.attributes?.find(
              (attr: any) => attr.name?.name === 'id' && attr.value?.value === elementId
            );
            
            if (idAttr) {
              // Update style attribute with transform properties
              updateStyleAttribute(path.node, transform);
              updated = true;
              path.stop();
            }
          }
        });

        if (!updated) throw new Error(`Element "${elementId}" not found`);

        const result = generate(ast, { retainLines: true });
        await fs.writeFile(compositionPath, result.code);

        const transformDesc = Object.entries(transform)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');

        return {
          content: [{
            type: 'text',
            text: `✅ Updated transform for "${elementId}": ${transformDesc}`
          }]
        };
      } catch (error) {
        logger.error('Transform update failed', { error });
        throw error;
      }
    },
    {
      category: ToolCategory.VIDEO_CREATION,
      subCategory: 'timeline',
      tags: ['transform', 'position', 'size', 'scale', 'rotation'],
      loadByDefault: false,
      priority: 3,
      estimatedTokens: 120
    }
  );
}

// Helper functions for AST manipulation
function createElementNode(type: string, properties: any): any {
  const t = require('@babel/types');
  
  const elementName = getElementNameForType(type);
  const attributes = Object.entries(properties).map(([key, value]) => 
    t.jsxAttribute(
      t.jsxIdentifier(key),
      typeof value === 'string' 
        ? t.stringLiteral(value)
        : t.jsxExpressionContainer(t.numericLiteral(value as number))
    )
  );

  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(elementName), attributes, false),
    t.jsxClosingElement(t.jsxIdentifier(elementName)),
    []
  );
}

function getElementNameForType(type: string): string {
  const mapping: Record<string, string> = {
    text: 'Text',
    image: 'Img',
    video: 'Video',
    audio: 'Audio',
    shape: 'Div',
    animation: 'Sequence'
  };
  return mapping[type] || 'Div';
}

function updateElementProperties(node: any, properties: any): void {
  const t = require('@babel/types');
  
  Object.entries(properties).forEach(([key, value]) => {
    updateOrAddAttribute(node, key, value);
  });
}

function updateOrAddAttribute(node: any, name: string, value: any): void {
  const t = require('@babel/types');
  
  const existingAttr = node.openingElement.attributes?.find(
    (attr: any) => attr.name?.name === name
  );

  const newValue = typeof value === 'string'
    ? t.stringLiteral(value)
    : t.jsxExpressionContainer(t.numericLiteral(value));

  if (existingAttr) {
    existingAttr.value = newValue;
  } else {
    node.openingElement.attributes = node.openingElement.attributes || [];
    node.openingElement.attributes.push(
      t.jsxAttribute(t.jsxIdentifier(name), newValue)
    );
  }
}

function updateStyleAttribute(node: any, styles: any): void {
  const t = require('@babel/types');
  
  let styleAttr = node.openingElement.attributes?.find(
    (attr: any) => attr.name?.name === 'style'
  );

  const styleObject = t.objectExpression(
    Object.entries(styles).map(([key, value]) =>
      t.objectProperty(
        t.identifier(key),
        typeof value === 'string' 
          ? t.stringLiteral(value)
          : t.numericLiteral(value as number)
      )
    )
  );

  if (styleAttr) {
    styleAttr.value = t.jsxExpressionContainer(styleObject);
  } else {
    node.openingElement.attributes = node.openingElement.attributes || [];
    node.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('style'),
        t.jsxExpressionContainer(styleObject)
      )
    );
  }
}