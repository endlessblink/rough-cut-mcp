// Video project management and editing tools for MCP
import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MCPConfig, ToolHandlers } from '../types/index.js';
import { getLogger } from '../utils/logger.js';
import path from 'path';
import fs from 'fs-extra';

export function createProjectManagementTools(config: MCPConfig): Tool[] {
  const logger = getLogger().service('ProjectTools');

  return [
    {
      name: 'list-video-projects',
      description: 'List all available video animation projects in the assets directory',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get-project-status',
      description: 'Get detailed status and information about video projects',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to check (optional - if not provided, checks all projects)',
          },
        },
      },
    },
    {
      name: 'analyze-video-structure',
      description: 'Analyze the structure of an existing video project to understand its components',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to analyze',
          },
        },
        required: ['projectName'],
      },
    },
    {
      name: 'launch-project-studio',
      description: 'Launch Remotion Studio for a specific project with cache clearing',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to launch',
          },
          port: {
            type: 'number',
            description: 'Port to use for studio (optional, will auto-select if not provided)',
            minimum: 7400,
            maximum: 7600,
          },
          clearCache: {
            type: 'boolean',
            description: 'Whether to clear cache before launching',
            default: true,
          },
        },
        required: ['projectName'],
      },
    },
    {
      name: 'edit-video-element',
      description: 'Edit specific elements in a video project (text, colors, positions, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to edit',
          },
          elementId: {
            type: 'string',
            description: 'Identifier for the element to edit (e.g., "title", "subtitle", "background")',
          },
          changes: {
            type: 'object',
            description: 'Object containing the changes to make (style properties, text content, etc.)',
          },
        },
        required: ['projectName', 'elementId', 'changes'],
      },
    },

    {
      name: 'install-project-dependencies',
      description: 'Install npm dependencies for a video project',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to install dependencies for',
          },
          force: {
            type: 'boolean',
            description: 'Force reinstall even if node_modules exists',
            default: false,
          },
        },
        required: ['projectName'],
      },
    },

    {
      name: 'repair-project',
      description: 'Repair a broken video project by adding missing configuration files and installing dependencies',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to repair',
          },
        },
        required: ['projectName'],
      },
    },

    {
      name: 'add-video-element',
      description: 'Add a new element to an existing video composition (text, shapes, animations)',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to add element to',
          },
          elementType: {
            type: 'string',
            description: 'Type of element to add',
            enum: ['text', 'div', 'image', 'video', 'shape', 'animation'],
          },
          parentSelector: {
            type: 'object',
            description: 'Selector for parent element to add to',
            properties: {
              elementName: { type: 'string' },
              className: { type: 'string' },
              id: { type: 'string' },
            },
          },
          elementProps: {
            type: 'object',
            description: 'Properties for the new element (style, className, id, etc.)',
          },
          content: {
            type: 'string',
            description: 'Text content or children for the element',
          },
          position: {
            type: 'string',
            description: 'Where to insert the element',
            enum: ['start', 'end'],
            default: 'end',
          },
        },
        required: ['projectName', 'elementType'],
      },
    },

    {
      name: 'remove-video-element',
      description: 'Remove an element from a video composition',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to remove element from',
          },
          selector: {
            type: 'object',
            description: 'Selector for element to remove',
            properties: {
              elementName: { type: 'string' },
              className: { type: 'string' },
              id: { type: 'string' },
              index: { type: 'number' },
            },
          },
        },
        required: ['projectName', 'selector'],
      },
    },

    {
      name: 'delete-video-project',
      description: 'Delete an entire video project and clean up resources',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to delete',
          },
          stopStudioFirst: {
            type: 'boolean',
            description: 'Stop any running studio instance first',
            default: true,
          },
        },
        required: ['projectName'],
      },
    },

    {
      name: 'rename-video-project',
      description: 'Safely rename a video project and update all references',
      inputSchema: {
        type: 'object',
        properties: {
          oldName: {
            type: 'string',
            description: 'Current name of the project',
          },
          newName: {
            type: 'string',
            description: 'New name for the project',
            pattern: '^[a-zA-Z0-9-_]+$',
          },
          stopStudioFirst: {
            type: 'boolean',
            description: 'Stop any running studio instance first',
            default: true,
          },
        },
        required: ['oldName', 'newName'],
      },
    },

    {
      name: 'generate-smart-project-name',
      description: 'Analyze project content and generate a descriptive name',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to analyze',
          },
          includeDate: {
            type: 'boolean',
            description: 'Include date suffix in generated name',
            default: false,
          },
        },
        required: ['projectName'],
      },
    },

    {
      name: 'auto-rename-projects',
      description: 'Batch rename all timestamp-based projects with smart names',
      inputSchema: {
        type: 'object',
        properties: {
          dryRun: {
            type: 'boolean',
            description: 'Preview changes without actually renaming',
            default: true,
          },
          pattern: {
            type: 'string',
            description: 'Pattern to match projects (default: video_*)',
            default: 'video_*',
          },
        },
      },
    },

    {
      name: 'organize-projects-by-type',
      description: 'Organize projects into categorized subdirectories',
      inputSchema: {
        type: 'object',
        properties: {
          dryRun: {
            type: 'boolean',
            description: 'Preview organization without moving files',
            default: true,
          },
          categories: {
            type: 'array',
            description: 'Categories to organize into',
            items: {
              type: 'string',
              enum: ['animations', 'presentations', 'demos', 'effects', 'archive'],
            },
            default: ['animations', 'presentations', 'demos', 'effects', 'archive'],
          },
        },
      },
    },

    {
      name: 'find-similar-projects',
      description: 'Find duplicate or similar projects based on content analysis',
      inputSchema: {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            description: 'Similarity threshold (0-1)',
            minimum: 0,
            maximum: 1,
            default: 0.8,
          },
        },
      },
    },

    {
      name: 'add-project-metadata',
      description: 'Add or update metadata for a project',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project',
          },
          metadata: {
            type: 'object',
            description: 'Metadata to add/update',
            properties: {
              description: { type: 'string' },
              tags: { 
                type: 'array',
                items: { type: 'string' },
              },
              author: { type: 'string' },
              category: { type: 'string' },
            },
          },
          autoGenerate: {
            type: 'boolean',
            description: 'Auto-generate metadata from content',
            default: false,
          },
        },
        required: ['projectName'],
      },
    },

    {
      name: 'replace-video-composition',
      description: 'Replace the entire video composition code',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to update',
          },
          newCompositionCode: {
            type: 'string',
            description: 'New complete Remotion React component code',
          },
          restartStudio: {
            type: 'boolean',
            description: 'Restart studio if it is running',
            default: true,
          },
        },
        required: ['projectName', 'newCompositionCode'],
      },
    },

    {
      name: 'duplicate-video-project',
      description: 'Clone an existing video project with a new name',
      inputSchema: {
        type: 'object',
        properties: {
          sourceProjectName: {
            type: 'string',
            description: 'Name of the project to duplicate',
          },
          newProjectName: {
            type: 'string',
            description: 'Name for the new duplicated project',
          },
        },
        required: ['sourceProjectName', 'newProjectName'],
      },
    },

    {
      name: 'adjust-element-timing',
      description: 'Adjust the timing/duration of an element in the composition',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project',
          },
          elementSelector: {
            type: 'object',
            description: 'Selector for the element to adjust',
            properties: {
              elementName: { type: 'string' },
              className: { type: 'string' },
              id: { type: 'string' },
            },
          },
          timingChanges: {
            type: 'object',
            description: 'Timing adjustments',
            properties: {
              startFrame: { type: 'number' },
              endFrame: { type: 'number' },
              duration: { type: 'number' },
              delay: { type: 'number' },
            },
          },
        },
        required: ['projectName', 'elementSelector', 'timingChanges'],
      },
    },

    // Timeline editing tools
    {
      name: 'set-element-duration',
      description: 'Change the duration of a video element or composition',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to edit',
          },
          elementId: {
            type: 'string',
            description: 'Element identifier (use "composition" for main composition duration)',
          },
          durationInFrames: {
            type: 'number',
            description: 'New duration in frames',
            minimum: 1,
            maximum: 18000, // 10 minutes at 30fps
          },
        },
        required: ['projectName', 'elementId', 'durationInFrames'],
      },
    },

    {
      name: 'set-element-timing',
      description: 'Set when an element starts and ends in the timeline',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to edit',
          },
          elementId: {
            type: 'string',
            description: 'Element identifier',
          },
          from: {
            type: 'number',
            description: 'Start frame (when element appears)',
            minimum: 0,
          },
          durationInFrames: {
            type: 'number',
            description: 'Duration in frames',
            minimum: 1,
          },
        },
        required: ['projectName', 'elementId', 'from'],
      },
    },

    {
      name: 'set-element-position',
      description: 'Change the position (x, y coordinates) of a video element',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to edit',
          },
          elementId: {
            type: 'string',
            description: 'Element identifier',
          },
          x: {
            type: 'number',
            description: 'X coordinate in pixels',
          },
          y: {
            type: 'number',
            description: 'Y coordinate in pixels',
          },
        },
        required: ['projectName', 'elementId'],
      },
    },

    {
      name: 'set-element-size',
      description: 'Change the width and height of a video element',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project to edit',
          },
          elementId: {
            type: 'string',
            description: 'Element identifier',
          },
          width: {
            type: 'number',
            description: 'Width in pixels',
            minimum: 1,
          },
          height: {
            type: 'number',
            description: 'Height in pixels',
            minimum: 1,
          },
        },
        required: ['projectName', 'elementId'],
      },
    },
  ];
}

export function createProjectManagementHandlers(config: MCPConfig): ToolHandlers {
  const logger = getLogger().service('ProjectHandlers');

  const handlers: ToolHandlers = {
    'list-video-projects': async () => {
      logger.info('Listing video projects');
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        logger.info(`Scanning projects directory: ${projectsDir}`);
        
        // Check if projects directory exists
        const projectsDirExists = await fs.pathExists(projectsDir);
        if (!projectsDirExists) {
          logger.warn(`Projects directory does not exist: ${projectsDir}`);
          return {
            success: true,
            projects: [],
            message: `Projects directory not found: ${projectsDir}`,
            totalProjects: 0,
          };
        }

        // Read directory contents
        const items = await fs.readdir(projectsDir, { withFileTypes: true });
        const projects = [];

        for (const item of items) {
          if (item.isDirectory()) {
            const projectPath = path.join(projectsDir, item.name);
            const srcPath = path.join(projectPath, 'src');
            const videoCompositionPath = path.join(srcPath, 'VideoComposition.tsx');
            const compositionPath = path.join(srcPath, 'Composition.tsx');
            const packageJsonPath = path.join(projectPath, 'package.json');
            
            // Check if it's a valid video project - accept either naming convention
            const hasVideoComposition = await fs.pathExists(videoCompositionPath) || 
                                      await fs.pathExists(compositionPath);
            const hasPackageJson = await fs.pathExists(packageJsonPath);
            const hasSrcDir = await fs.pathExists(srcPath);
            
            if (hasVideoComposition || hasSrcDir) {
              const projectInfo: any = {
                name: item.name,
                path: projectPath,
                hasVideoComposition,
                hasPackageJson,
                hasSrcDir,
                isValid: hasVideoComposition && hasSrcDir,
              };

              // Try to get additional info from package.json
              if (hasPackageJson) {
                try {
                  const packageContent = await fs.readJson(packageJsonPath);
                  projectInfo.description = packageContent.description;
                  projectInfo.version = packageContent.version;
                } catch (error: any) {
                  logger.warn(`Could not read package.json for project ${item.name}: ${error.message}`);
                }
              }

              projects.push(projectInfo);
            }
          }
        }

        logger.info(`Found ${projects.length} video projects`);
        
        return {
          success: true,
          projects: projects.sort((a, b) => a.name.localeCompare(b.name)),
          totalProjects: projects.length,
          projectsDirectory: projectsDir,
        };

      } catch (error: any) {
        logger.error('Error listing video projects:', error);
        return {
          success: false,
          error: error.message,
          projects: [],
          totalProjects: 0,
        };
      }
    },

    'get-project-status': async (args: any) => {
      logger.info('Getting project status', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        
        if (args.projectName) {
          // Get status for specific project
          const projectPath = path.join(projectsDir, args.projectName);
          const projectExists = await fs.pathExists(projectPath);
          
          if (!projectExists) {
            return {
              success: false,
              error: `Project "${args.projectName}" not found`,
              projectName: args.projectName,
            };
          }

          const status = await getProjectDetails(projectPath, args.projectName);
          return {
            success: true,
            project: status,
          };
        } else {
          // Get status for all projects
          const listResult = await createProjectManagementHandlers(config)['list-video-projects']();
          if (!listResult.success) {
            return listResult;
          }

          const projectStatuses = [];
          for (const project of listResult.projects) {
            const status = await getProjectDetails(project.path, project.name);
            projectStatuses.push(status);
          }

          return {
            success: true,
            projects: projectStatuses,
            totalProjects: projectStatuses.length,
          };
        }

      } catch (error: any) {
        logger.error('Error getting project status:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'analyze-video-structure': async (args: any) => {
      logger.info('Analyzing video structure', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const videoCompositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
        
        const projectExists = await fs.pathExists(projectPath);
        if (!projectExists) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        const compositionExists = await fs.pathExists(videoCompositionPath);
        if (!compositionExists) {
          return {
            success: false,
            error: `VideoComposition.tsx not found in project "${args.projectName}"`,
          };
        }

        // Read and analyze the composition file
        const compositionContent = await fs.readFile(videoCompositionPath, 'utf8');
        
        // Basic analysis - look for common patterns
        const analysis = {
          projectName: args.projectName,
          hasAnimations: /useCurrentFrame|interpolate|spring/.test(compositionContent),
          hasText: /text|Text/.test(compositionContent),
          hasImages: /img|Image/.test(compositionContent),
          hasAudio: /Audio|audio/.test(compositionContent),
          usesSequence: /Sequence/.test(compositionContent),
          usesAbsoluteFill: /AbsoluteFill/.test(compositionContent),
          lineCount: compositionContent.split('\n').length,
          approximateComplexity: compositionContent.length > 2000 ? 'high' : compositionContent.length > 500 ? 'medium' : 'low',
        };

        return {
          success: true,
          projectName: args.projectName,
          analysis,
          compositionPath: videoCompositionPath,
        };

      } catch (error: any) {
        logger.error('Error analyzing video structure:', error);
        return {
          success: false,
          error: error.message,
          projectName: args.projectName,
        };
      }
    },

    'launch-project-studio': async (args: any) => {
      logger.info('Launching project studio', { projectName: args.projectName, port: args.port });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        
        const projectExists = await fs.pathExists(projectPath);
        if (!projectExists) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        // Import and use project metadata manager
        const { projectMetadataManager } = await import('../services/project-metadata.js');
        
        // Get or create metadata with port persistence
        const metadata = await projectMetadataManager.getOrCreateMetadata(
          projectPath,
          args.projectName,
          args.port || 7400  // Default port if not specified
        );
        
        // Use the remembered port if no port specified in args
        const targetPort = args.port || metadata.lastPort;
        logger.info('Port persistence active for project', { 
          projectName: args.projectName, 
          targetPort,
          rememberedPort: metadata.lastPort,
          createdPort: metadata.createdPort,
          usingRememberedPort: !args.port,
          metadataFile: path.join(projectPath, '.studio-metadata.json')
        });

        // Check and install dependencies if missing
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        if (!await fs.pathExists(nodeModulesPath)) {
          logger.info('Installing missing dependencies for project', { projectName: args.projectName });
          const { safeNpmInstall } = await import('../utils/safe-spawn.js');
          const installResult = await safeNpmInstall(projectPath);
          
          if (!installResult.success) {
            return {
              success: false,
              error: `Failed to install dependencies: ${installResult.error}`,
              projectName: args.projectName,
              suggestions: [
                'Check internet connection',
                'Verify npm is installed and working',
                'Try the install-project-dependencies tool',
                'Check for any npm registry issues'
              ]
            };
          }
          logger.info('Dependencies installed successfully');
        }
        
        // Also fix remotion.config.ts if it has cache disabled
        const configPath = path.join(projectPath, 'remotion.config.ts');
        if (await fs.pathExists(configPath)) {
          let configContent = await fs.readFile(configPath, 'utf8');
          if (configContent.includes('setCachingEnabled(false)')) {
            configContent = configContent.replace('setCachingEnabled(false)', 'setCachingEnabled(true)');
            configContent = configContent.replace('cache: false,', '');
            await fs.writeFile(configPath, configContent);
            logger.info('Fixed caching configuration in remotion.config.ts');
          }
        }

        // Use the studio tools to launch
        const { createStudioHandlers } = await import('./studio-tools.js');
        const studioHandlers = createStudioHandlers(config);
        
        const launchArgs = {
          projectPath,
          port: targetPort,  // Use the target port (remembered or specified)
          clearCache: args.clearCache,
        };

        const result = await studioHandlers['launch-studio-with-project'](launchArgs);
        
        // Update metadata with successful launch
        if (result.success) {
          await projectMetadataManager.updateLastLaunched(projectPath, targetPort);
          logger.info('Updated project metadata with launch port', { 
            projectName: args.projectName, 
            port: targetPort 
          });
        }
        
        return {
          success: result.success,
          projectName: args.projectName,
          port: result.port,
          url: result.url,
          message: result.message,
          error: result.error,
          portInfo: {
            used: targetPort,
            remembered: metadata.lastPort,
            created: metadata.createdPort,
          }
        };

      } catch (error: any) {
        logger.error('Error launching project studio:', error);
        return {
          success: false,
          error: error.message,
          projectName: args.projectName,
        };
      }
    },

    'edit-video-element': async (args: any) => {
      logger.info('Editing video element', { 
        projectName: args.projectName, 
        elementId: args.elementId,
        changes: Object.keys(args.changes || {}),
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const videoCompositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
        
        const projectExists = await fs.pathExists(projectPath);
        if (!projectExists) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        const compositionExists = await fs.pathExists(videoCompositionPath);
        if (!compositionExists) {
          return {
            success: false,
            error: `VideoComposition.tsx not found in project "${args.projectName}"`,
          };
        }

        // Read existing composition code
        const originalCode = await fs.readFile(videoCompositionPath, 'utf8');
        
        // Import AST manipulation utility
        const { editVideoElement } = await import('../utils/ast-manipulation.js');
        
        // Perform AST-based editing
        const editResult = editVideoElement(originalCode, {
          elementId: args.elementId,
          changes: args.changes,
        });

        if (!editResult.success) {
          return {
            success: false,
            error: editResult.error,
            projectName: args.projectName,
            elementId: args.elementId,
          };
        }

        // Validate the modified code
        const { validateModifiedCode } = await import('../utils/ast-manipulation.js');
        const validation = validateModifiedCode(editResult.modifiedCode!);
        
        if (!validation.valid) {
          return {
            success: false,
            error: `Generated code has syntax errors: ${validation.error}`,
            projectName: args.projectName,
            elementId: args.elementId,
          };
        }

        // Create backup of original file
        const backupPath = `${videoCompositionPath}.backup.${Date.now()}`;
        await fs.copy(videoCompositionPath, backupPath);
        logger.info(`Created backup: ${backupPath}`);

        // Write modified code back to file
        await fs.writeFile(videoCompositionPath, editResult.modifiedCode!);
        
        return {
          success: true,
          projectName: args.projectName,
          elementId: args.elementId,
          changes: editResult.changes,
          warnings: editResult.warnings,
          compositionPath: videoCompositionPath,
          backupPath,
          message: `Successfully edited ${editResult.changes?.length || 0} properties of element "${args.elementId}"`,
        };

      } catch (error: any) {
        logger.error('Error editing video element:', error);
        return {
          success: false,
          error: error.message,
          projectName: args.projectName,
          elementId: args.elementId,
        };
      }
    },

    'add-video-element': async (args: any) => {
      logger.info('Adding video element', { 
        projectName: args.projectName, 
        elementType: args.elementType 
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'Composition.tsx');
        
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        // Read existing composition
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        
        // Parse the code
        const { parseVideoComposition, addJSXElement, createJSXElementFromTemplate, generateCode } = await import('../utils/ast-manipulation.js');
        const parseResult = parseVideoComposition(originalCode);
        
        if (!parseResult.success || !parseResult.ast) {
          return {
            success: false,
            error: 'Failed to parse composition code',
          };
        }

        // Import babel types for JSX text creation
        const t = await import('@babel/types');
        
        // Create the new element
        const newElement = createJSXElementFromTemplate(
          args.elementType,
          args.elementProps || {},
          args.content ? [t.jsxText(args.content)] : undefined
        );

        // Add the element
        const addResult = addJSXElement(
          parseResult.ast,
          args.parentSelector || { elementName: 'AbsoluteFill' },
          newElement,
          args.position || 'end'
        );

        if (!addResult.success) {
          return {
            success: false,
            error: addResult.error,
          };
        }

        // Write the modified code back
        if (!addResult.modifiedCode) {
          throw new Error('Modified code is undefined after adding element');
        }
        await fs.writeFile(compositionPath, addResult.modifiedCode);
        
        return {
          success: true,
          message: `Added ${args.elementType} element to composition`,
          projectName: args.projectName,
          changes: addResult.changes,
        };

      } catch (error: any) {
        logger.error('Error adding video element:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'remove-video-element': async (args: any) => {
      logger.info('Removing video element', { 
        projectName: args.projectName, 
        selector: args.selector 
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'Composition.tsx');
        
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        // Read existing composition
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        
        // Parse and remove element
        const { parseVideoComposition, removeJSXElement } = await import('../utils/ast-manipulation.js');
        const parseResult = parseVideoComposition(originalCode);
        
        if (!parseResult.success || !parseResult.ast) {
          return {
            success: false,
            error: 'Failed to parse composition code',
          };
        }

        const removeResult = removeJSXElement(parseResult.ast, args.selector);

        if (!removeResult.success) {
          return {
            success: false,
            error: removeResult.error,
          };
        }

        // Write the modified code back
        if (!removeResult.modifiedCode) {
          throw new Error('Modified code is undefined after removing element');
        }
        await fs.writeFile(compositionPath, removeResult.modifiedCode);
        
        return {
          success: true,
          message: 'Element removed from composition',
          projectName: args.projectName,
          changes: removeResult.changes,
        };

      } catch (error: any) {
        logger.error('Error removing video element:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'delete-video-project': async (args: any) => {
      logger.info('Deleting video project', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        // Stop studio if requested
        if (args.stopStudioFirst) {
          try {
            // Import studio tools handlers
            const { createStudioHandlers } = await import('./studio-tools.js');
            const studioHandlers = createStudioHandlers(config);
            
            // Stop any running studio
            const stopResult = await studioHandlers['stop-remotion-studio']({});
            logger.info('Studio stopped before deletion', { stopResult });
          } catch (error) {
            logger.warn('Failed to stop studio, continuing with deletion', { error });
          }
        }

        // Delete the project directory
        await fs.remove(projectPath);
        logger.info('Project directory deleted', { projectPath });
        
        // Clean up any cache files
        const cachePath = path.join(config.assetsDir, 'cache', args.projectName);
        if (await fs.pathExists(cachePath)) {
          await fs.remove(cachePath);
          logger.info('Cache directory deleted', { cachePath });
        }
        
        return {
          success: true,
          message: `Project "${args.projectName}" has been deleted`,
          deletedPath: projectPath,
          portAvailable: true,
        };

      } catch (error: any) {
        logger.error('Error deleting video project:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'replace-video-composition': async (args: any) => {
      logger.info('Replacing video composition', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'Composition.tsx');
        
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        // Backup existing composition
        const backupPath = compositionPath + '.backup';
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        await fs.writeFile(backupPath, originalCode);
        
        // Write new composition code
        await fs.writeFile(compositionPath, args.newCompositionCode);
        
        // Restart studio if requested and running
        if (args.restartStudio) {
          try {
            const { createStudioHandlers } = await import('./studio-tools.js');
            const studioHandlers = createStudioHandlers(config);
            
            // Check if studio is running
            const statusResult = await studioHandlers['get-studio-status']({});
            if (statusResult.isRunning) {
              // Stop and restart
              await studioHandlers['stop-remotion-studio']({});
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for port to be released
              await studioHandlers['launch-studio-with-project']({ projectName: args.projectName });
            }
          } catch (error) {
            logger.warn('Failed to restart studio', { error });
          }
        }
        
        return {
          success: true,
          message: `Composition replaced for project "${args.projectName}"`,
          projectName: args.projectName,
          backupCreated: backupPath,
        };

      } catch (error: any) {
        logger.error('Error replacing video composition:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'duplicate-video-project': async (args: any) => {
      logger.info('Duplicating video project', { 
        source: args.sourceProjectName, 
        target: args.newProjectName 
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const sourcePath = path.join(projectsDir, args.sourceProjectName);
        const targetPath = path.join(projectsDir, args.newProjectName);
        
        // Check if source exists
        if (!await fs.pathExists(sourcePath)) {
          return {
            success: false,
            error: `Source project "${args.sourceProjectName}" not found`,
          };
        }

        // Check if target already exists
        if (await fs.pathExists(targetPath)) {
          return {
            success: false,
            error: `Target project "${args.newProjectName}" already exists`,
          };
        }

        // Copy the entire project
        await fs.copy(sourcePath, targetPath);
        
        // Update package.json with new name
        const packageJsonPath = path.join(targetPath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          packageJson.name = args.newProjectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
        
        // Remove node_modules to force fresh install
        const nodeModulesPath = path.join(targetPath, 'node_modules');
        if (await fs.pathExists(nodeModulesPath)) {
          await fs.remove(nodeModulesPath);
        }
        
        return {
          success: true,
          message: `Project duplicated from "${args.sourceProjectName}" to "${args.newProjectName}"`,
          sourcePath,
          targetPath,
          newProjectName: args.newProjectName,
        };

      } catch (error: any) {
        logger.error('Error duplicating video project:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'adjust-element-timing': async (args: any) => {
      logger.info('Adjusting element timing', { 
        projectName: args.projectName,
        selector: args.elementSelector,
        changes: args.timingChanges
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'Composition.tsx');
        
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }

        // Read existing composition
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        
        // Parse the code
        const { parseVideoComposition, findJSXElements, generateCode } = await import('../utils/ast-manipulation.js');
        const parseResult = parseVideoComposition(originalCode);
        
        if (!parseResult.success || !parseResult.ast) {
          return {
            success: false,
            error: 'Failed to parse composition code',
          };
        }

        // Find elements to adjust
        const elements = findJSXElements(parseResult.ast, args.elementSelector);
        
        if (elements.length === 0) {
          return {
            success: false,
            error: 'No matching elements found',
          };
        }

        // Adjust timing by modifying interpolation ranges
        // This is a simplified implementation - in practice would need more sophisticated AST manipulation
        let modifiedCode = originalCode;
        const changes: string[] = [];

        // Look for interpolate calls and adjust frame ranges
        if (args.timingChanges.startFrame !== undefined || args.timingChanges.endFrame !== undefined) {
          const interpolatePattern = /interpolate\s*\(\s*frame\s*,\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/g;
          modifiedCode = modifiedCode.replace(interpolatePattern, (match, start, end) => {
            const newStart = args.timingChanges.startFrame !== undefined ? args.timingChanges.startFrame : start;
            const newEnd = args.timingChanges.endFrame !== undefined ? args.timingChanges.endFrame : end;
            changes.push(`Adjusted timing from [${start}, ${end}] to [${newStart}, ${newEnd}]`);
            return `interpolate(frame, [${newStart}, ${newEnd}]`;
          });
        }

        // Write the modified code back
        await fs.writeFile(compositionPath, modifiedCode);
        
        return {
          success: true,
          message: 'Element timing adjusted',
          projectName: args.projectName,
          changes,
        };

      } catch (error: any) {
        logger.error('Error adjusting element timing:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'install-project-dependencies': async (args: any) => {
      logger.info('Installing dependencies for project', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
            projectName: args.projectName,
          };
        }
        
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        if (await fs.pathExists(nodeModulesPath) && !args.force) {
          return {
            success: true,
            message: 'Dependencies already installed',
            projectName: args.projectName,
            projectPath,
          };
        }
        
        // Remove node_modules if force is true
        if (args.force && await fs.pathExists(nodeModulesPath)) {
          logger.info('Removing existing node_modules for force reinstall');
          await fs.remove(nodeModulesPath);
        }
        
        logger.info('Running npm install', { projectPath });
        const { safeNpmInstall } = await import('../utils/safe-spawn.js');
        const installResult = await safeNpmInstall(projectPath);
        
        if (!installResult.success) {
          return {
            success: false,
            error: installResult.error,
            projectName: args.projectName,
            projectPath,
          };
        }
        
        // Also fix remotion.config.ts if it has cache disabled
        const configPath = path.join(projectPath, 'remotion.config.ts');
        if (await fs.pathExists(configPath)) {
          let configContent = await fs.readFile(configPath, 'utf8');
          if (configContent.includes('setCachingEnabled(false)')) {
            configContent = configContent.replace('setCachingEnabled(false)', 'setCachingEnabled(true)');
            configContent = configContent.replace('cache: false,', '');
            await fs.writeFile(configPath, configContent);
            logger.info('Fixed caching configuration in remotion.config.ts');
          }
        }
        
        return {
          success: true,
          message: 'Dependencies installed successfully',
          projectName: args.projectName,
          projectPath,
        };
        
      } catch (error: any) {
        logger.error('Error installing dependencies:', error);
        return {
          success: false,
          error: error.message,
          projectName: args.projectName,
        };
      }
    },

    'repair-project': async (args: any) => {
      logger.info('Repairing project', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
            projectName: args.projectName,
          };
        }

        const repairedFiles = [];
        
        // Import template generators
        const { 
          generateCompletePackageJson,
          generateRemotionConfig,
          generateTsConfig 
        } = await import('../templates/simple-compositions.js');

        // Add missing remotion.config.ts
        const configPath = path.join(projectPath, 'remotion.config.ts');
        if (!await fs.pathExists(configPath)) {
          logger.info('Adding missing remotion.config.ts');
          await fs.writeFile(configPath, generateRemotionConfig());
          repairedFiles.push('remotion.config.ts');
        }

        // Add missing tsconfig.json
        const tsconfigPath = path.join(projectPath, 'tsconfig.json');
        if (!await fs.pathExists(tsconfigPath)) {
          logger.info('Adding missing tsconfig.json');
          await fs.writeFile(tsconfigPath, generateTsConfig());
          repairedFiles.push('tsconfig.json');
        }

        // Update package.json with complete dependencies and scripts
        const packageJsonPath = path.join(projectPath, 'package.json');
        logger.info('Updating package.json with complete dependencies');
        await fs.writeFile(packageJsonPath, generateCompletePackageJson());
        repairedFiles.push('package.json (updated)');

        // Install dependencies
        logger.info('Installing project dependencies...');
        const { safeNpmInstall } = await import('../utils/safe-spawn.js');
        const installResult = await safeNpmInstall(projectPath, 120000);
        
        if (!installResult.success) {
          logger.warn('Failed to install dependencies, but project files have been repaired', { 
            error: installResult.error 
          });
        }

        // Verify repair
        const nodeModulesPath = path.join(projectPath, 'node_modules');
        const hasNodeModules = await fs.pathExists(nodeModulesPath);

        return {
          success: true,
          message: `Project "${args.projectName}" has been repaired`,
          repairedFiles,
          dependenciesInstalled: hasNodeModules,
          projectPath,
          projectName: args.projectName,
          instructions: [
            'Project configuration files have been added/updated',
            hasNodeModules ? 'Dependencies installed successfully' : 'Dependencies need to be installed manually',
            'You can now launch the studio for this project'
          ]
        };

      } catch (error: any) {
        logger.error('Error repairing project:', error);
        return {
          success: false,
          error: error.message,
          projectName: args.projectName,
        };
      }
    },

    // Timeline editing tool handlers
    'set-element-duration': async (args: any) => {
      logger.info('Setting element duration', { 
        projectName: args.projectName, 
        elementId: args.elementId,
        durationInFrames: args.durationInFrames
      });
      
      try {
        if (args.elementId === 'composition') {
          // Update main composition duration in index/video file
          const projectsDir = path.join(config.assetsDir, 'projects');
          const projectPath = path.join(projectsDir, args.projectName);
          
          // Try to find the composition registration file
          const indexPath = path.join(projectPath, 'src', 'index.tsx');
          const videoPath = path.join(projectPath, 'src', 'Video.tsx');
          
          let targetFile = '';
          if (await fs.pathExists(indexPath)) {
            targetFile = indexPath;
          } else if (await fs.pathExists(videoPath)) {
            targetFile = videoPath;
          } else {
            return {
              success: false,
              error: 'Could not find composition registration file',
            };
          }
          
          const content = await fs.readFile(targetFile, 'utf8');
          const updatedContent = content.replace(
            /durationInFrames=\{(\d+)\}/g,
            `durationInFrames={${args.durationInFrames}}`
          );
          
          await fs.writeFile(targetFile, updatedContent);
          
          return {
            success: true,
            message: `Set composition duration to ${args.durationInFrames} frames`,
            projectName: args.projectName,
            filePath: targetFile,
          };
        } else {
          // Use existing edit-video-element functionality for specific elements
          const projectsDir = path.join(config.assetsDir, 'projects');
          const projectPath = path.join(projectsDir, args.projectName);
          const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
          
          if (!await fs.pathExists(compositionPath)) {
            return {
              success: false,
              error: `VideoComposition.tsx not found in project "${args.projectName}"`,
            };
          }

          const { editVideoElement } = await import('../utils/ast-manipulation.js');
          const originalCode = await fs.readFile(compositionPath, 'utf8');
          
          const editResult = editVideoElement(originalCode, {
            elementId: args.elementId,
            changes: {
              props: { durationInFrames: args.durationInFrames }
            }
          });

          if (!editResult.success) {
            return {
              success: false,
              error: editResult.error,
            };
          }

          if (!editResult.modifiedCode) {
            throw new Error('Modified code is undefined after editing element duration');
          }
          
          await fs.writeFile(compositionPath, editResult.modifiedCode);
          
          return {
            success: true,
            message: `Set element "${args.elementId}" duration to ${args.durationInFrames} frames`,
            projectName: args.projectName,
            changes: editResult.changes,
          };
        }
      } catch (error: any) {
        logger.error('Error setting element duration:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'set-element-timing': async (args: any) => {
      logger.info('Setting element timing', { 
        projectName: args.projectName, 
        elementId: args.elementId,
        from: args.from,
        durationInFrames: args.durationInFrames
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
        
        if (!await fs.pathExists(compositionPath)) {
          return {
            success: false,
            error: `VideoComposition.tsx not found in project "${args.projectName}"`,
          };
        }

        const { editVideoElement } = await import('../utils/ast-manipulation.js');
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        
        const changes: any = {
          timing: { start: args.from }
        };
        
        if (args.durationInFrames) {
          changes.timing.end = args.from + args.durationInFrames;
        }
        
        const editResult = editVideoElement(originalCode, {
          elementId: args.elementId,
          changes
        });

        if (!editResult.success) {
          return {
            success: false,
            error: editResult.error,
          };
        }

        if (!editResult.modifiedCode) {
          throw new Error('Modified code is undefined after editing element timing');
        }
        
        await fs.writeFile(compositionPath, editResult.modifiedCode);
        
        return {
          success: true,
          message: `Set element "${args.elementId}" timing: start=${args.from}, duration=${args.durationInFrames || 'unchanged'}`,
          projectName: args.projectName,
          changes: editResult.changes,
        };
      } catch (error: any) {
        logger.error('Error setting element timing:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'set-element-position': async (args: any) => {
      logger.info('Setting element position', { 
        projectName: args.projectName, 
        elementId: args.elementId,
        x: args.x,
        y: args.y
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
        
        if (!await fs.pathExists(compositionPath)) {
          return {
            success: false,
            error: `VideoComposition.tsx not found in project "${args.projectName}"`,
          };
        }

        const { editVideoElement } = await import('../utils/ast-manipulation.js');
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        
        const changes: any = {};
        
        if (args.x !== undefined && args.y !== undefined) {
          changes.position = { x: args.x, y: args.y };
        } else if (args.x !== undefined || args.y !== undefined) {
          changes.style = {};
          if (args.x !== undefined) changes.style.left = `${args.x}px`;
          if (args.y !== undefined) changes.style.top = `${args.y}px`;
        }
        
        const editResult = editVideoElement(originalCode, {
          elementId: args.elementId,
          changes
        });

        if (!editResult.success) {
          return {
            success: false,
            error: editResult.error,
          };
        }

        if (!editResult.modifiedCode) {
          throw new Error('Modified code is undefined after editing element position');
        }
        
        await fs.writeFile(compositionPath, editResult.modifiedCode);
        
        return {
          success: true,
          message: `Set element "${args.elementId}" position: x=${args.x}, y=${args.y}`,
          projectName: args.projectName,
          changes: editResult.changes,
        };
      } catch (error: any) {
        logger.error('Error setting element position:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'set-element-size': async (args: any) => {
      logger.info('Setting element size', { 
        projectName: args.projectName, 
        elementId: args.elementId,
        width: args.width,
        height: args.height
      });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
        
        if (!await fs.pathExists(compositionPath)) {
          return {
            success: false,
            error: `VideoComposition.tsx not found in project "${args.projectName}"`,
          };
        }

        const { editVideoElement } = await import('../utils/ast-manipulation.js');
        const originalCode = await fs.readFile(compositionPath, 'utf8');
        
        const changes: any = { style: {} };
        
        if (args.width !== undefined) changes.style.width = args.width;
        if (args.height !== undefined) changes.style.height = args.height;
        
        const editResult = editVideoElement(originalCode, {
          elementId: args.elementId,
          changes
        });

        if (!editResult.success) {
          return {
            success: false,
            error: editResult.error,
          };
        }

        if (!editResult.modifiedCode) {
          throw new Error('Modified code is undefined after editing element size');
        }
        
        await fs.writeFile(compositionPath, editResult.modifiedCode);
        
        return {
          success: true,
          message: `Set element "${args.elementId}" size: width=${args.width}, height=${args.height}`,
          projectName: args.projectName,
          changes: editResult.changes,
        };
      } catch (error: any) {
        logger.error('Error setting element size:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'rename-video-project': async (args: any) => {
      logger.info('Renaming video project', { oldName: args.oldName, newName: args.newName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const oldPath = path.join(projectsDir, args.oldName);
        const newPath = path.join(projectsDir, args.newName);
        
        // Check if old project exists
        if (!await fs.pathExists(oldPath)) {
          return {
            success: false,
            error: `Project "${args.oldName}" not found`,
          };
        }
        
        // Check if new name already exists
        if (await fs.pathExists(newPath)) {
          return {
            success: false,
            error: `Project with name "${args.newName}" already exists`,
          };
        }
        
        // Validate new name format
        if (!/^[a-zA-Z0-9-_]+$/.test(args.newName)) {
          return {
            success: false,
            error: 'Invalid project name. Use only letters, numbers, hyphens, and underscores.',
          };
        }

        // Stop studio if requested
        if (args.stopStudioFirst) {
          try {
            const { createStudioHandlers } = await import('./studio-tools.js');
            const studioHandlers = createStudioHandlers(config);
            const studioStatus = await studioHandlers['get-studio-status']();
            if (studioStatus.running) {
              await studioHandlers['stop-remotion-studio']();
              logger.info('Stopped running studio before renaming');
            }
          } catch (error) {
            logger.warn('Could not check/stop studio:', error);
          }
        }
        
        // Rename the directory
        await fs.rename(oldPath, newPath);
        
        // Update package.json name field
        const packageJsonPath = path.join(newPath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          packageJson.name = args.newName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
        
        return {
          success: true,
          message: `Project renamed from "${args.oldName}" to "${args.newName}"`,
          oldPath,
          newPath,
        };

      } catch (error: any) {
        logger.error('Error renaming project:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'generate-smart-project-name': async (args: any) => {
      logger.info('Generating smart project name', { projectName: args.projectName });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }
        
        // Read the composition file to analyze content
        const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
        const indexPath = path.join(projectPath, 'src', 'index.tsx');
        const videoPath = path.join(projectPath, 'src', 'Video.tsx');
        
        let compositionCode = '';
        if (await fs.pathExists(compositionPath)) {
          compositionCode = await fs.readFile(compositionPath, 'utf8');
        } else if (await fs.pathExists(videoPath)) {
          compositionCode = await fs.readFile(videoPath, 'utf8');
        } else if (await fs.pathExists(indexPath)) {
          compositionCode = await fs.readFile(indexPath, 'utf8');
        }
        
        // Analyze content to generate name
        const keywords: string[] = [];
        
        // Look for common animation elements
        if (/car|vehicle|drive|road/i.test(compositionCode)) keywords.push('car');
        if (/ball|bounce|physics/i.test(compositionCode)) keywords.push('ball');
        if (/text|title|subtitle|typography/i.test(compositionCode)) keywords.push('text');
        if (/particle|particles|stars?|dots?/i.test(compositionCode)) keywords.push('particles');
        if (/github|profile|avatar|user/i.test(compositionCode)) keywords.push('profile');
        if (/logo|brand/i.test(compositionCode)) keywords.push('logo');
        if (/3d|three|cube|sphere/i.test(compositionCode)) keywords.push('3d');
        if (/chart|graph|data|visualization/i.test(compositionCode)) keywords.push('data-viz');
        
        // Look for animation types
        if (/fade|opacity/i.test(compositionCode)) keywords.push('fade');
        if (/slide|translate/i.test(compositionCode)) keywords.push('slide');
        if (/scale|zoom/i.test(compositionCode)) keywords.push('zoom');
        if (/rotate|rotation|spin/i.test(compositionCode)) keywords.push('rotate');
        if (/bounce|spring|elastic/i.test(compositionCode)) keywords.push('bounce');
        
        // Look for style/theme
        if (/gradient|linear-gradient|radial-gradient/i.test(compositionCode)) keywords.push('gradient');
        if (/neon|glow/i.test(compositionCode)) keywords.push('neon');
        if (/dark|black|night/i.test(compositionCode)) keywords.push('dark');
        if (/minimal|simple|clean/i.test(compositionCode)) keywords.push('minimal');
        
        // Build the name
        let smartName = '';
        if (keywords.length > 0) {
          // Take the most relevant keywords (max 3)
          const mainKeywords = keywords.slice(0, 3);
          smartName = mainKeywords.join('-');
          
          // Add animation suffix if appropriate
          if (!smartName.includes('animation') && !smartName.includes('demo')) {
            smartName += '-animation';
          }
        } else {
          // Fallback to generic descriptive name
          smartName = 'custom-animation';
        }
        
        // Add date suffix if requested
        if (args.includeDate) {
          const date = new Date().toISOString().split('T')[0];
          smartName += `-${date}`;
        }
        
        // Ensure uniqueness
        let finalName = smartName;
        let counter = 1;
        while (await fs.pathExists(path.join(projectsDir, finalName))) {
          finalName = `${smartName}-${counter}`;
          counter++;
        }
        
        return {
          success: true,
          suggestedName: finalName,
          originalName: args.projectName,
          detectedKeywords: keywords,
          analysis: {
            hasAnimation: keywords.length > 0,
            primaryElement: keywords[0] || 'unknown',
            complexity: compositionCode.length > 5000 ? 'complex' : compositionCode.length > 2000 ? 'medium' : 'simple',
          },
        };

      } catch (error: any) {
        logger.error('Error generating smart name:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'auto-rename-projects': async (args: any) => {
      logger.info('Auto-renaming projects', { dryRun: args.dryRun, pattern: args.pattern });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projects = await fs.readdir(projectsDir);
        
        // Filter projects matching pattern
        const pattern = args.pattern || 'video_*';
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        const matchingProjects = projects.filter(name => regex.test(name));
        
        const renameOperations: Array<{ oldName: string; newName: string; reason: string }> = [];
        
        for (const projectName of matchingProjects) {
          // Generate smart name for each project
          // Call the generate-smart-project-name handler directly
          const smartNameHandler = handlers['generate-smart-project-name'];
          const smartNameResult = await smartNameHandler({
            projectName,
            includeDate: false,
          });
          
          if (smartNameResult.success && smartNameResult.suggestedName) {
            renameOperations.push({
              oldName: projectName,
              newName: smartNameResult.suggestedName,
              reason: smartNameResult.detectedKeywords?.join(', ') || 'auto-generated',
            });
          }
        }
        
        // Execute renames if not dry run
        const results: any[] = [];
        if (!args.dryRun) {
          for (const op of renameOperations) {
            const renameHandler = handlers['rename-video-project'];
            const renameResult = await renameHandler({
              oldName: op.oldName,
              newName: op.newName,
              stopStudioFirst: true,
            });
            results.push({
              ...op,
              success: renameResult.success,
              error: renameResult.error,
            });
          }
        }
        
        return {
          success: true,
          dryRun: args.dryRun,
          totalProjects: matchingProjects.length,
          renameOperations,
          results: args.dryRun ? 'Dry run - no changes made' : results,
          message: args.dryRun 
            ? `Would rename ${renameOperations.length} projects` 
            : `Renamed ${results.filter(r => r.success).length} of ${renameOperations.length} projects`,
        };

      } catch (error: any) {
        logger.error('Error auto-renaming projects:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'organize-projects-by-type': async (args: any) => {
      logger.info('Organizing projects by type', { dryRun: args.dryRun });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projects = await fs.readdir(projectsDir);
        const categories = args.categories || ['animations', 'presentations', 'demos', 'effects', 'archive'];
        
        // Create category directories if not dry run
        if (!args.dryRun) {
          for (const category of categories) {
            await fs.ensureDir(path.join(projectsDir, category));
          }
        }
        
        const organizationPlan: Record<string, string[]> = {};
        categories.forEach((cat: string) => organizationPlan[cat] = []);
        organizationPlan['uncategorized'] = [];
        
        for (const projectName of projects) {
          // Skip if already in a category folder
          if (categories.includes(projectName)) continue;
          
          const projectPath = path.join(projectsDir, projectName);
          const stats = await fs.stat(projectPath);
          if (!stats.isDirectory()) continue;
          
          // Analyze project to determine category
          let category = 'uncategorized';
          
          // Try to read composition to categorize
          try {
            const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
            const indexPath = path.join(projectPath, 'src', 'index.tsx');
            
            let code = '';
            if (await fs.pathExists(compositionPath)) {
              code = await fs.readFile(compositionPath, 'utf8');
            } else if (await fs.pathExists(indexPath)) {
              code = await fs.readFile(indexPath, 'utf8');
            }
            
            // Categorization logic
            if (/presentation|slide|powerpoint/i.test(code)) {
              category = 'presentations';
            } else if (/demo|example|tutorial|test/i.test(projectName)) {
              category = 'demos';
            } else if (/particle|effect|transition|shader/i.test(code)) {
              category = 'effects';
            } else if (/animation|animate|motion/i.test(code)) {
              category = 'animations';
            }
            
            // Archive old projects (video_* with timestamps)
            if (/^video_\d+$/.test(projectName)) {
              const timestamp = parseInt(projectName.replace('video_', ''));
              const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
              if (ageInDays > 30) {
                category = 'archive';
              }
            }
          } catch (error) {
            logger.warn(`Could not analyze project ${projectName}:`, error);
          }
          
          organizationPlan[category].push(projectName);
        }
        
        // Execute moves if not dry run
        const moveResults: any[] = [];
        if (!args.dryRun) {
          for (const [category, projectNames] of Object.entries(organizationPlan)) {
            if (category === 'uncategorized') continue;
            
            for (const projectName of projectNames) {
              try {
                const oldPath = path.join(projectsDir, projectName);
                const newPath = path.join(projectsDir, category, projectName);
                await fs.move(oldPath, newPath);
                moveResults.push({ projectName, category, success: true });
              } catch (error: any) {
                moveResults.push({ projectName, category, success: false, error: error.message });
              }
            }
          }
        }
        
        return {
          success: true,
          dryRun: args.dryRun,
          organizationPlan,
          totalProjects: projects.length,
          categorizedCount: Object.values(organizationPlan).flat().length,
          moveResults: args.dryRun ? 'Dry run - no changes made' : moveResults,
          message: args.dryRun
            ? 'Organization plan created (dry run)'
            : `Organized ${moveResults.filter(r => r.success).length} projects`,
        };

      } catch (error: any) {
        logger.error('Error organizing projects:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'find-similar-projects': async (args: any) => {
      logger.info('Finding similar projects', { threshold: args.threshold });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projects = await fs.readdir(projectsDir);
        const threshold = args.threshold || 0.8;
        
        // Build project signatures
        const projectSignatures: Array<{
          name: string;
          signature: string;
          size: number;
          files: string[];
        }> = [];
        
        for (const projectName of projects) {
          const projectPath = path.join(projectsDir, projectName);
          const stats = await fs.stat(projectPath);
          if (!stats.isDirectory()) continue;
          
          try {
            // Read main composition file
            const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
            const indexPath = path.join(projectPath, 'src', 'index.tsx');
            
            let code = '';
            if (await fs.pathExists(compositionPath)) {
              code = await fs.readFile(compositionPath, 'utf8');
            } else if (await fs.pathExists(indexPath)) {
              code = await fs.readFile(indexPath, 'utf8');
            }
            
            // Create simplified signature (remove whitespace, comments)
            const signature = code
              .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
              .replace(/\/\/.*/g, '') // Remove line comments
              .replace(/\s+/g, '') // Remove whitespace
              .toLowerCase();
            
            const srcFiles = await fs.pathExists(path.join(projectPath, 'src')) 
              ? await fs.readdir(path.join(projectPath, 'src'))
              : [];
            
            projectSignatures.push({
              name: projectName,
              signature,
              size: signature.length,
              files: srcFiles,
            });
          } catch (error) {
            logger.warn(`Could not analyze project ${projectName}:`, error);
          }
        }
        
        // Find similar projects
        const similarGroups: Array<{
          projects: string[];
          similarity: number;
          reason: string;
        }> = [];
        
        for (let i = 0; i < projectSignatures.length; i++) {
          for (let j = i + 1; j < projectSignatures.length; j++) {
            const sig1 = projectSignatures[i];
            const sig2 = projectSignatures[j];
            
            // Calculate similarity
            let similarity = 0;
            let reason = '';
            
            // Check if signatures are very similar
            if (sig1.signature && sig2.signature) {
              const lengthDiff = Math.abs(sig1.size - sig2.size);
              const maxLength = Math.max(sig1.size, sig2.size);
              
              if (maxLength > 0) {
                similarity = 1 - (lengthDiff / maxLength);
                
                // Check for exact match
                if (sig1.signature === sig2.signature) {
                  similarity = 1.0;
                  reason = 'Identical code content';
                } else if (similarity > 0.9) {
                  reason = 'Very similar code structure';
                } else if (similarity > 0.8) {
                  reason = 'Similar code structure';
                }
              }
            }
            
            // Check file structure similarity
            const commonFiles = sig1.files.filter(f => sig2.files.includes(f));
            const fileSimilarity = commonFiles.length / Math.max(sig1.files.length, sig2.files.length, 1);
            
            if (fileSimilarity > 0.9 && similarity < 0.5) {
              similarity = fileSimilarity;
              reason = 'Same file structure';
            }
            
            if (similarity >= threshold) {
              // Check if these projects are already in a group
              let added = false;
              for (const group of similarGroups) {
                if (group.projects.includes(sig1.name) || group.projects.includes(sig2.name)) {
                  if (!group.projects.includes(sig1.name)) group.projects.push(sig1.name);
                  if (!group.projects.includes(sig2.name)) group.projects.push(sig2.name);
                  group.similarity = Math.max(group.similarity, similarity);
                  added = true;
                  break;
                }
              }
              
              if (!added) {
                similarGroups.push({
                  projects: [sig1.name, sig2.name],
                  similarity,
                  reason,
                });
              }
            }
          }
        }
        
        return {
          success: true,
          totalProjects: projects.length,
          similarGroups,
          duplicatesFound: similarGroups.filter(g => g.similarity > 0.95).length,
          recommendations: similarGroups.map(group => ({
            projects: group.projects,
            action: group.similarity > 0.95 ? 'Consider deleting duplicates' : 'Review for consolidation',
            similarity: `${Math.round(group.similarity * 100)}%`,
            reason: group.reason,
          })),
        };

      } catch (error: any) {
        logger.error('Error finding similar projects:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    'add-project-metadata': async (args: any) => {
      logger.info('Adding project metadata', { projectName: args.projectName, autoGenerate: args.autoGenerate });
      
      try {
        const projectsDir = path.join(config.assetsDir, 'projects');
        const projectPath = path.join(projectsDir, args.projectName);
        
        if (!await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project "${args.projectName}" not found`,
          };
        }
        
        const metadataPath = path.join(projectPath, 'metadata.json');
        
        // Load existing metadata if it exists
        let metadata: any = {};
        if (await fs.pathExists(metadataPath)) {
          metadata = await fs.readJson(metadataPath);
        }
        
        // Auto-generate metadata if requested
        if (args.autoGenerate) {
          // Analyze project content
          const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
          const indexPath = path.join(projectPath, 'src', 'index.tsx');
          
          let code = '';
          if (await fs.pathExists(compositionPath)) {
            code = await fs.readFile(compositionPath, 'utf8');
          } else if (await fs.pathExists(indexPath)) {
            code = await fs.readFile(indexPath, 'utf8');
          }
          
          // Generate tags from content
          const tags: string[] = [];
          if (/animation/i.test(code)) tags.push('animation');
          if (/3d|three/i.test(code)) tags.push('3d');
          if (/particle/i.test(code)) tags.push('particles');
          if (/text|typography/i.test(code)) tags.push('text');
          if (/gradient/i.test(code)) tags.push('gradient');
          if (/video/i.test(code)) tags.push('video');
          if (/audio|sound/i.test(code)) tags.push('audio');
          
          // Determine category
          let category = 'general';
          if (tags.includes('3d')) category = '3d-animations';
          else if (tags.includes('particles')) category = 'effects';
          else if (tags.includes('text')) category = 'typography';
          
          metadata = {
            ...metadata,
            name: args.projectName,
            description: metadata.description || `Auto-generated project: ${tags.join(', ')}`,
            tags: [...new Set([...(metadata.tags || []), ...tags])],
            category: metadata.category || category,
            createdAt: metadata.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: metadata.version || '1.0.0',
          };
        }
        
        // Merge with provided metadata
        if (args.metadata) {
          metadata = {
            ...metadata,
            ...args.metadata,
            updatedAt: new Date().toISOString(),
          };
        }
        
        // Save metadata
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });
        
        return {
          success: true,
          message: 'Metadata saved successfully',
          projectName: args.projectName,
          metadata,
          metadataPath,
        };

      } catch (error: any) {
        logger.error('Error adding project metadata:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    },
  };
  
  return handlers;
}

// Helper function to get detailed project information
async function getProjectDetails(projectPath: string, projectName: string) {
  const srcPath = path.join(projectPath, 'src');
  const videoCompositionPath = path.join(srcPath, 'VideoComposition.tsx');
  const compositionPath = path.join(srcPath, 'Composition.tsx');
  const packageJsonPath = path.join(projectPath, 'package.json');
  const indexPath = path.join(srcPath, 'index.tsx');
  const configPath = path.join(projectPath, 'remotion.config.ts');
  
  const details = {
    name: projectName,
    path: projectPath,
    hasVideoComposition: await fs.pathExists(videoCompositionPath) || 
                        await fs.pathExists(compositionPath),
    hasPackageJson: await fs.pathExists(packageJsonPath),
    hasSrcDir: await fs.pathExists(srcPath),
    hasIndex: await fs.pathExists(indexPath),
    hasRemotionConfig: await fs.pathExists(configPath),
    isValid: false,
    files: [] as string[],
    size: 0,
  };

  // Calculate validity
  details.isValid = details.hasVideoComposition && details.hasSrcDir;

  // Get file list
  try {
    if (details.hasSrcDir) {
      const srcFiles = await fs.readdir(srcPath);
      details.files = srcFiles;
    }
  } catch (error) {
    // Ignore error, files list will be empty
  }

  // Get project size (approximate)
  try {
    const stats = await fs.stat(projectPath);
    details.size = stats.size;
  } catch (error) {
    // Ignore error, size will be 0
  }

  return details;
}