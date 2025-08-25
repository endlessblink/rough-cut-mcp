/**
 * Discovery Tools for Dynamic Tool Management
 *
 * These tools are always exposed and allow LLMs to discover and activate
 * other tools on demand, implementing the layered architecture pattern.
 */
import { ToolCategory, } from '../types/tool-categories.js';
import { getLogger } from '../utils/logger.js';
/**
 * Create discovery tools that are always available
 */
export function createDiscoveryTools(registry) {
    const logger = getLogger().service('DiscoveryTools');
    return [
        {
            name: 'discover-capabilities',
            description: 'Discover available tool categories and their descriptions. Use this to understand what capabilities are available.',
            inputSchema: {
                type: 'object',
                properties: {
                    includeStats: {
                        type: 'boolean',
                        description: 'Include usage statistics and tool counts',
                        default: false,
                    },
                },
            },
        },
        {
            name: 'activate-toolset',
            description: 'Activate a specific category or set of tools. Use this to load tools for specific tasks.',
            inputSchema: {
                type: 'object',
                properties: {
                    categories: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: Object.values(ToolCategory),
                        },
                        description: 'Tool categories to activate',
                    },
                    tools: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description: 'Specific tool names to activate',
                    },
                    exclusive: {
                        type: 'boolean',
                        description: 'If true, deactivate other tools first (except discovery tools)',
                        default: false,
                    },
                },
            },
        },
        {
            name: 'search-tools',
            description: 'Search for tools by name, description, or functionality. Use this to find specific tools.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query for tool names, descriptions, or tags',
                    },
                    categories: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: Object.values(ToolCategory),
                        },
                        description: 'Filter by specific categories',
                    },
                    hasApiKey: {
                        type: 'boolean',
                        description: 'Filter to only show tools with available API keys',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of results to return',
                        default: 10,
                        minimum: 1,
                        maximum: 50,
                    },
                },
            },
        },
        {
            name: 'get-active-tools',
            description: 'Get a list of currently active/loaded tools. Use this to see what tools are available right now.',
            inputSchema: {
                type: 'object',
                properties: {
                    includeMetadata: {
                        type: 'boolean',
                        description: 'Include detailed metadata for each tool',
                        default: false,
                    },
                },
            },
        },
        {
            name: 'suggest-tools',
            description: 'Get tool suggestions based on a task description. Use this for intelligent tool recommendations.',
            inputSchema: {
                type: 'object',
                properties: {
                    taskDescription: {
                        type: 'string',
                        description: 'Description of the task you want to accomplish',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of suggestions',
                        default: 5,
                        minimum: 1,
                        maximum: 20,
                    },
                },
                required: ['taskDescription'],
            },
        },
        {
            name: 'get-tool-usage-stats',
            description: 'Get usage statistics to understand which tools are most frequently used.',
            inputSchema: {
                type: 'object',
                properties: {
                    topN: {
                        type: 'number',
                        description: 'Number of top tools to show',
                        default: 10,
                        minimum: 1,
                        maximum: 50,
                    },
                },
            },
        },
    ];
}
/**
 * Create handlers for discovery tools
 */
export function createDiscoveryHandlers(registry) {
    const logger = getLogger().service('DiscoveryHandlers');
    return {
        'discover-capabilities': async (args) => {
            try {
                const categories = registry.getCategories();
                const response = {
                    mode: registry.getMode(),
                    categories: categories.map(cat => ({
                        id: cat.id,
                        name: cat.name,
                        description: cat.description,
                        loadedByDefault: cat.loadByDefault,
                        toolCount: args.includeStats ? cat.toolCount : undefined,
                        estimatedTokens: args.includeStats ? cat.estimatedTokens : undefined,
                        requiredApiKeys: cat.requiredApiKeys,
                    })),
                };
                if (args.includeStats) {
                    const stats = registry.getUsageStatistics();
                    response.statistics = {
                        totalToolsRegistered: categories.reduce((sum, cat) => sum + (cat.toolCount || 0), 0),
                        currentlyActive: registry.getActiveTools().length,
                        mostUsedCategory: Object.entries(stats.categoryUsage)
                            .sort(([, a], [, b]) => b - a)[0]?.[0],
                    };
                }
                logger.info('Capabilities discovered', {
                    categoriesCount: categories.length,
                    mode: registry.getMode(),
                });
                return {
                    success: true,
                    ...response,
                };
            }
            catch (error) {
                logger.error('Failed to discover capabilities', { error });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        },
        'activate-toolset': async (args) => {
            try {
                const result = registry.activateTools({
                    categories: args.categories,
                    tools: args.tools,
                    exclusive: args.exclusive,
                });
                logger.info('Toolset activation completed', {
                    activated: result.activated.length,
                    deactivated: result.deactivated.length,
                });
                return {
                    success: result.success,
                    message: result.message,
                    activated: result.activated,
                    deactivated: result.deactivated,
                    totalActive: registry.getActiveTools().length,
                };
            }
            catch (error) {
                logger.error('Failed to activate toolset', { error });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        },
        'search-tools': async (args) => {
            try {
                const results = registry.searchTools({
                    query: args.query,
                    categories: args.categories,
                    hasApiKey: args.hasApiKey,
                    limit: args.limit || 10,
                });
                const tools = results.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    category: tool.metadata.category,
                    tags: tool.metadata.tags,
                    requiresApiKey: tool.metadata.requiresApiKey,
                    isActive: registry.getActiveTools().some(t => t.name === tool.name),
                    priority: tool.metadata.priority,
                    usageCount: tool.metadata.usageFrequency || 0,
                }));
                logger.info('Tool search completed', {
                    query: args.query,
                    resultsCount: tools.length,
                });
                return {
                    success: true,
                    tools,
                    totalResults: tools.length,
                };
            }
            catch (error) {
                logger.error('Failed to search tools', { error });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        },
        'get-active-tools': async (args) => {
            try {
                const activeTools = registry.getActiveTools();
                const tools = activeTools.map(tool => {
                    const extendedTool = tool;
                    const base = {
                        name: tool.name,
                        description: tool.description,
                    };
                    if (args.includeMetadata && extendedTool.metadata) {
                        return {
                            ...base,
                            category: extendedTool.metadata.category,
                            tags: extendedTool.metadata.tags,
                            priority: extendedTool.metadata.priority,
                            requiresApiKey: extendedTool.metadata.requiresApiKey,
                        };
                    }
                    return base;
                });
                // Group by category for better organization
                const byCategory = {};
                for (const tool of tools) {
                    const category = tool.category || 'uncategorized';
                    if (!byCategory[category]) {
                        byCategory[category] = [];
                    }
                    byCategory[category].push(tool);
                }
                logger.info('Active tools retrieved', {
                    totalActive: tools.length,
                    categories: Object.keys(byCategory).length,
                });
                return {
                    success: true,
                    totalActive: tools.length,
                    tools: args.includeMetadata ? byCategory : tools,
                    mode: registry.getMode(),
                };
            }
            catch (error) {
                logger.error('Failed to get active tools', { error });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        },
        'suggest-tools': async (args) => {
            try {
                const { taskDescription, limit = 5 } = args;
                // Get suggestions based on task description
                const suggestions = registry.getSuggestions(taskDescription);
                // If not enough suggestions from keywords, search more broadly
                if (suggestions.length < limit) {
                    const searchResults = registry.searchTools({
                        query: taskDescription,
                        limit: limit - suggestions.length,
                    });
                    for (const tool of searchResults) {
                        if (!suggestions.includes(tool.name)) {
                            suggestions.push(tool.name);
                        }
                    }
                }
                // Get tool details for suggestions
                const toolDetails = suggestions.slice(0, limit).map(name => {
                    const tools = registry.searchTools({ query: name, limit: 1 });
                    if (tools.length > 0) {
                        const tool = tools[0];
                        return {
                            name: tool.name,
                            description: tool.description,
                            category: tool.metadata.category,
                            requiresApiKey: tool.metadata.requiresApiKey,
                            isActive: registry.getActiveTools().some(t => t.name === tool.name),
                        };
                    }
                    return null;
                }).filter(Boolean);
                // Determine which categories might be needed
                const neededCategories = new Set();
                for (const tool of toolDetails) {
                    if (tool && !tool.isActive) {
                        neededCategories.add(tool.category);
                    }
                }
                logger.info('Tool suggestions generated', {
                    taskDescription: taskDescription.substring(0, 50),
                    suggestionsCount: toolDetails.length,
                });
                return {
                    success: true,
                    suggestions: toolDetails,
                    activationNeeded: Array.from(neededCategories),
                    message: neededCategories.size > 0
                        ? `To use these tools, activate categories: ${Array.from(neededCategories).join(', ')}`
                        : 'All suggested tools are already active',
                };
            }
            catch (error) {
                logger.error('Failed to suggest tools', { error });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        },
        'get-tool-usage-stats': async (args) => {
            try {
                const stats = registry.getUsageStatistics();
                const topN = args.topN || 10;
                return {
                    success: true,
                    mostUsed: stats.mostUsed.slice(0, topN),
                    recentlyActivated: stats.recentlyActivated.slice(0, 5),
                    categoryUsage: stats.categoryUsage,
                    mode: registry.getMode(),
                };
            }
            catch (error) {
                logger.error('Failed to get usage stats', { error });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        },
    };
}
/**
 * Get metadata for discovery tools
 */
export function getDiscoveryToolsMetadata() {
    return [
        {
            name: 'discover-capabilities',
            category: ToolCategory.DISCOVERY,
            tags: ['discovery', 'capabilities', 'categories', 'organization'],
            loadByDefault: true,
            priority: 1,
            estimatedTokens: 100,
        },
        {
            name: 'activate-toolset',
            category: ToolCategory.DISCOVERY,
            tags: ['activation', 'loading', 'management', 'dynamic'],
            loadByDefault: true,
            priority: 2,
            estimatedTokens: 80,
        },
        {
            name: 'search-tools',
            category: ToolCategory.DISCOVERY,
            tags: ['search', 'discovery', 'finding', 'query'],
            loadByDefault: true,
            priority: 3,
            estimatedTokens: 90,
        },
        {
            name: 'get-active-tools',
            category: ToolCategory.DISCOVERY,
            tags: ['active', 'current', 'loaded', 'available'],
            loadByDefault: true,
            priority: 4,
            estimatedTokens: 70,
        },
        {
            name: 'suggest-tools',
            category: ToolCategory.DISCOVERY,
            tags: ['suggestions', 'recommendations', 'intelligent', 'context'],
            loadByDefault: true,
            priority: 5,
            estimatedTokens: 100,
        },
        {
            name: 'get-tool-usage-stats',
            category: ToolCategory.DISCOVERY,
            tags: ['statistics', 'usage', 'analytics', 'tracking'],
            loadByDefault: true,
            priority: 6,
            estimatedTokens: 80,
        },
    ];
}
//# sourceMappingURL=discovery-tools.js.map