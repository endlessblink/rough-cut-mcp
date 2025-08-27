/**
 * Discovery Tools - Minimal set for tool discovery and activation
 * Works with Enhanced Registry's layered architecture
 */

import { MCPServer } from '../index.js';
import { ToolCategory, TOOL_CATEGORIES, TOOL_SUBCATEGORIES } from '../types/tool-categories.js';

export function registerDiscoveryTools(server: MCPServer): void {
  const logger = (server as any).baseLogger.service('discovery-tools');
  
  // Debug: Log that we're registering discovery tools
  logger.info('Starting discovery tools registration');
  console.error('DEBUG: registerDiscoveryTools called');

  /**
   * 1. Discover - Single tool for all discovery needs
   */
  server.toolRegistry.registerTool(
    {
      name: 'discover',
      description: 'Discover available capabilities, categories, and tools',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['all', 'categories', 'active', 'stats', 'recommendations'],
            description: 'What to discover',
            default: 'all'
          },
          context: {
            type: 'string',
            description: 'Context for recommendations'
          }
        }
      }
    },
    async (args: any) => {
      try {
        const type = args.type || 'all';
        
        switch (type) {
          case 'all':
          case 'categories': {
            const categories = Object.entries(TOOL_CATEGORIES).map(([id, info]) => {
              const subCats = (TOOL_SUBCATEGORIES as any)[id.replace('_', '-').toLowerCase()] || {};
              const subCategoryList = Object.entries(subCats)
                .map(([name, tools]) => `  - ${name}: ${(tools as string[]).length} tools`)
                .join('\n');
              
              return `**${info.name}** (${id})
${info.description}
${info.loadByDefault ? '✅ Loaded by default' : '⏸️ On-demand'}
${subCategoryList ? 'Sub-categories:\n' + subCategoryList : ''}`;
            }).join('\n\n');

            return {
              content: [{
                type: 'text',
                text: `🎯 Available Tool Categories:\n\n${categories}\n\nUse 'activate' to load categories or sub-categories.`
              }]
            };
          }

          case 'active': {
            const activeTools = server.toolRegistry.getActiveTools();
            const stats = server.toolRegistry.getUsageStatistics();
            
            if (activeTools.length === 0) {
              return {
                content: [{
                  type: 'text',
                  text: 'No tools currently active. Use "activate" to load tools.'
                }]
              };
            }

            const toolList = activeTools.map((tool: any) => 
              `• ${tool.name} (${tool.metadata.category})`
            ).join('\n');

            return {
              content: [{
                type: 'text',
                text: `✅ Active Tools (${activeTools.length}):\n\n${toolList}\n\nTotal context weight: ${(stats as any).totalActiveWeight || 'N/A'}`
              }]
            };
          }

          case 'stats': {
            // Get enhanced statistics if available
            const stats = (server.toolRegistry as any).getEnhancedStatistics?.() || 
                         server.toolRegistry.getUsageStatistics();
            
            let output = '📊 Tool Registry Statistics:\n\n';
            
            if (stats.base) {
              output += `Base Stats:
• Total tools: ${stats.base.totalTools}
• Active tools: ${stats.base.activeTools}
• Categories loaded: ${stats.base.categoriesLoaded}\n\n`;
            }
            
            if (stats.context) {
              output += `Context Management:
• Current weight: ${stats.context.totalWeight}/${stats.context.maxWeight}
• Pressure: ${stats.context.pressure}
• Active items: ${stats.context.activeItems}\n\n`;
            }
            
            if (stats.layers) {
              output += `Layer Management:
• Active layers: ${stats.layers.activeLayers}
• Total layers: ${stats.layers.totalLayers}\n\n`;
            }

            return {
              content: [{
                type: 'text',
                text: output
              }]
            };
          }

          case 'recommendations': {
            const context = args.context || 'general';
            const recommendations = server.toolRegistry.getSuggestions(context);
            
            if (recommendations.length === 0) {
              return {
                content: [{
                  type: 'text',
                  text: 'No specific recommendations. Use "discover" to see all categories.'
                }]
              };
            }

            const recList = recommendations.map((tool: string, i: number) => 
              `${i + 1}. ${tool} - Recommended for "${context}"`
            ).join('\n');

            return {
              content: [{
                type: 'text',
                text: `💡 Recommended tools for "${context}":\n\n${recList}`
              }]
            };
          }

          default:
            throw new Error(`Unknown discovery type: ${type}`);
        }
      } catch (error) {
        logger.error('Discovery failed', { error });
        throw error;
      }
    },
    {
      name: 'discover',
      category: ToolCategory.DISCOVERY,
      subCategory: 'discovery',
      tags: ['discover', 'capabilities', 'help'],
      loadByDefault: true,
      priority: 0,
      estimatedTokens: 80
    }
  );
  
  console.error('DEBUG: discover tool registered');

  /**
   * 2. Activate - Single tool for activation
   */
  server.toolRegistry.registerTool(
    {
      name: 'activate',
      description: 'Activate tool categories, sub-categories, or specific tools',
      inputSchema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Categories to activate (e.g., ["video-creation", "studio-management"])'
          },
          subCategories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Sub-categories to activate (e.g., ["video-creation/basic", "project-management/editing"])'
          },
          tools: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific tools to activate'
          },
          exclusive: {
            type: 'boolean',
            description: 'Deactivate other tools first',
            default: false
          }
        }
      }
    },
    async (args: any) => {
      try {
        // Handle sub-category activation
        if (args.subCategories && args.subCategories.length > 0) {
          const results = [];
          
          for (const subCat of args.subCategories) {
            const [category, subCategory] = subCat.split('/');
            
            if (!category || !subCategory) {
              results.push(`❌ Invalid format: ${subCat} (use "category/subcategory")`);
              continue;
            }

            try {
              const result = server.toolRegistry.activateSubCategory(
                category,
                subCategory,
                args.exclusive
              );
              
              if (result.success) {
                results.push(`✅ Activated ${subCat}: ${result.activated.length} tools`);
              } else {
                results.push(`❌ Failed ${subCat}: ${result.message}`);
              }
            } catch (error) {
              results.push(`❌ Error activating ${subCat}: ${(error as any).message}`);
            }
          }
          
          return {
            content: [{
              type: 'text',
              text: results.join('\n')
            }]
          };
        }

        // Handle category or tool activation
        const request = {
          categories: args.categories,
          tools: args.tools,
          exclusive: args.exclusive
        };

        // Use enhanced activation if available
        const result = (server.toolRegistry as any).activateToolsEnhanced?.(request) ||
                      server.toolRegistry.activateTools(request);

        let output = '';
        
        if (result.success) {
          output = '✅ Activation successful:\n';
          if (result.activated.length > 0) {
            output += `Activated: ${result.activated.join(', ')}\n`;
          }
          if (result.deactivated?.length > 0) {
            output += `Deactivated: ${result.deactivated.join(', ')}\n`;
          }
          if (result.dependencies?.length > 0) {
            output += `Dependencies loaded: ${result.dependencies.join(', ')}\n`;
          }
          if (result.contextWeight) {
            output += `Context weight: ${result.contextWeight}`;
          }
        } else {
          output = `❌ Activation failed: ${result.message}`;
        }

        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      } catch (error) {
        logger.error('Activation failed', { error });
        throw error;
      }
    },
    {
      name: 'activate',
      category: ToolCategory.DISCOVERY,
      subCategory: 'discovery',
      tags: ['activate', 'load', 'enable'],
      loadByDefault: true,
      priority: 0,
      estimatedTokens: 60
    }
  );
  
  console.error('DEBUG: activate tool registered');

  /**
   * 3. Search - Find tools by query
   */
  server.toolRegistry.registerTool(
    {
      name: 'search',
      description: 'Search for tools by name, tag, or functionality',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          filter: {
            type: 'object',
            properties: {
              categories: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by categories'
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by tags'
              },
              active: {
                type: 'boolean',
                description: 'Only show active tools'
              }
            }
          }
        },
        required: ['query']
      }
    },
    async (args: any) => {
      try {
        const results = server.toolRegistry.searchTools({
          query: args.query,
          categories: args.filter?.categories,
          tags: args.filter?.tags,
          limit: 20
        });

        if (results.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No tools found for "${args.query}"`
            }]
          };
        }

        const activeTools = new Set(
          server.toolRegistry.getActiveTools().map((t: any) => t.name)
        );

        const toolList = results.map((tool: any) => {
          const active = activeTools.has(tool.name);
          const status = active ? '✅' : '⏸️';
          return `${status} **${tool.name}** (${tool.metadata.category})
   ${tool.description}
   Tags: ${tool.metadata.tags.join(', ')}`;
        }).join('\n\n');

        return {
          content: [{
            type: 'text',
            text: `🔍 Found ${results.length} tool(s):\n\n${toolList}`
          }]
        };
      } catch (error) {
        logger.error('Search failed', { error });
        throw error;
      }
    },
    {
      name: 'search',
      category: ToolCategory.DISCOVERY,
      subCategory: 'discovery',
      tags: ['search', 'find', 'lookup'],
      loadByDefault: true,
      priority: 0,
      estimatedTokens: 60
    }
  );
  
  console.error('DEBUG: search tool registered');
  console.error('DEBUG: All 3 discovery tools registered');
  
  // Check what's in the registry after registration
  const activeTools = server.toolRegistry.getActiveTools();
  console.error('DEBUG: Active tools after discovery registration:', activeTools.map(t => t.name));
}