/**
 * Tool Registry Service for Dynamic Tool Management
 *
 * Implements a layered architecture for MCP tools to reduce context bloat
 * and improve performance by dynamically loading tools on demand.
 */
import { ToolCategory, TOOL_CATEGORIES, DEFAULT_TOOL_CONFIGURATION, } from '../types/tool-categories.js';
import { getLogger } from '../utils/logger.js';
import * as fs from 'fs-extra';
import * as path from 'path';
/**
 * Tool Registry for managing and organizing MCP tools
 */
export class ToolRegistry {
    state;
    logger;
    config;
    toolHandlers;
    usageStatsFile;
    activeSubCategories = new Set();
    alwaysActiveTools = new Set(); // Discovery tools
    constructor(config) {
        this.config = config;
        this.logger = getLogger().service('ToolRegistry');
        // Initialize state
        this.state = {
            allTools: new Map(),
            activeTools: new Set(),
            toolsByCategory: new Map(),
            usageStats: new Map(),
            lastActivation: new Map(),
        };
        this.toolHandlers = new Map();
        // Set usage stats file path
        this.usageStatsFile = path.join(config.assetsDir, '.tool-usage-stats.json');
        // Load usage statistics
        this.loadUsageStats();
        this.logger.info('Tool Registry initialized', {
            assetsDir: config.assetsDir
        });
    }
    /**
     * Register a tool with metadata
     */
    registerTool(tool, handler, metadata) {
        const extendedTool = {
            ...tool,
            metadata,
        };
        // Store tool and handler
        this.state.allTools.set(tool.name, extendedTool);
        this.toolHandlers.set(tool.name, handler);
        // Organize by category
        if (!this.state.toolsByCategory.has(metadata.category)) {
            this.state.toolsByCategory.set(metadata.category, []);
        }
        this.state.toolsByCategory.get(metadata.category).push(extendedTool);
        // Discovery tools are always active
        if (metadata.category === ToolCategory.DISCOVERY) {
            this.state.activeTools.add(tool.name);
            this.alwaysActiveTools.add(tool.name);
            this.logger.info('Discovery tool registered and activated', { name: tool.name });
        }
        // Otherwise, only activate if it should be loaded by default
        else if (metadata.loadByDefault) {
            this.state.activeTools.add(tool.name);
            this.logger.info('Tool activated by default', { name: tool.name, category: metadata.category });
        }
        this.logger.debug('Tool registered', {
            name: tool.name,
            category: metadata.category,
            active: this.state.activeTools.has(tool.name),
            isDiscovery: metadata.category === ToolCategory.DISCOVERY,
            loadByDefault: metadata.loadByDefault
        });
    }
    /**
     * Register multiple tools at once
     */
    registerTools(tools, handlers, metadataList) {
        tools.forEach((tool, index) => {
            const handler = handlers[tool.name];
            const metadata = metadataList[index];
            if (handler && metadata) {
                this.registerTool(tool, handler, metadata);
            }
        });
    }
    /**
     * Get currently active tools for MCP list_tools response
     */
    getActiveTools() {
        const activeTools = [];
        // Always include discovery tools
        for (const toolName of this.alwaysActiveTools) {
            const tool = this.state.allTools.get(toolName);
            if (tool) {
                activeTools.push(tool);
            }
        }
        // Add tools from active sub-categories
        for (const toolName of this.state.activeTools) {
            if (!this.alwaysActiveTools.has(toolName)) {
                const tool = this.state.allTools.get(toolName);
                if (tool) {
                    activeTools.push(tool);
                }
            }
        }
        // Sort by priority
        activeTools.sort((a, b) => {
            const aPriority = a.metadata?.priority || 999;
            const bPriority = b.metadata?.priority || 999;
            return aPriority - bPriority;
        });
        return activeTools;
    }
    /**
     * Get handler for a specific tool
     * Note: Following MCP protocol standards, activation state only affects listing (list_tools),
     * not execution (call_tool). Any registered tool can be called regardless of activation.
     */
    getToolHandler(toolName) {
        // Track usage
        this.trackToolUsage(toolName);
        // Return handler if it exists, regardless of activation state
        // This is the correct MCP protocol behavior - tools can be called even if not active
        return this.toolHandlers.get(toolName);
    }
    /**
     * Safe getter with explicit type assertion after check
     * Prevents TypeScript Map undefined issues
     */
    getToolHandlerSafe(toolName) {
        if (!this.toolHandlers.has(toolName)) {
            return undefined;
        }
        // Use non-null assertion after explicit check
        return this.toolHandlers.get(toolName);
    }
    /**
     * Check if a tool handler exists
     */
    hasToolHandler(toolName) {
        return this.toolHandlers.has(toolName);
    }
    /**
     * Activate tools based on request
     */
    activateTools(request) {
        const activated = [];
        const deactivated = [];
        try {
            // If exclusive mode, deactivate all non-discovery tools first
            if (request.exclusive) {
                for (const toolName of this.state.activeTools) {
                    const tool = this.state.allTools.get(toolName);
                    if (tool && tool.metadata.category !== ToolCategory.DISCOVERY) {
                        this.state.activeTools.delete(toolName);
                        deactivated.push(toolName);
                    }
                }
            }
            // Activate requested categories
            if (request.categories) {
                for (const category of request.categories) {
                    const tools = this.state.toolsByCategory.get(category) || [];
                    for (const tool of tools) {
                        if (!this.state.activeTools.has(tool.name)) {
                            // Check API key requirements
                            if (tool.metadata.requiresApiKey) {
                                const hasApiKey = this.checkApiKey(tool.metadata.requiresApiKey);
                                if (!hasApiKey) {
                                    this.logger.warn('Skipping tool due to missing API key', {
                                        tool: tool.name,
                                        requiredKey: tool.metadata.requiresApiKey,
                                    });
                                    continue;
                                }
                            }
                            this.state.activeTools.add(tool.name);
                            this.state.lastActivation.set(tool.name, new Date());
                            activated.push(tool.name);
                        }
                    }
                }
            }
            // Activate specific tools
            if (request.tools) {
                for (const toolName of request.tools) {
                    const tool = this.state.allTools.get(toolName);
                    if (tool && !this.state.activeTools.has(toolName)) {
                        // Check API key requirements
                        if (tool.metadata.requiresApiKey) {
                            const hasApiKey = this.checkApiKey(tool.metadata.requiresApiKey);
                            if (!hasApiKey) {
                                this.logger.warn('Skipping tool due to missing API key', {
                                    tool: toolName,
                                    requiredKey: tool.metadata.requiresApiKey,
                                });
                                continue;
                            }
                        }
                        this.state.activeTools.add(toolName);
                        this.state.lastActivation.set(toolName, new Date());
                        activated.push(toolName);
                    }
                }
            }
            const message = `Activated ${activated.length} tools, deactivated ${deactivated.length} tools`;
            this.logger.info(message, { activated, deactivated });
            return {
                success: true,
                activated,
                deactivated,
                message,
            };
        }
        catch (error) {
            const message = `Failed to activate tools: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, { error });
            return {
                success: false,
                activated,
                deactivated,
                message,
            };
        }
    }
    /**
     * Deactivate tools
     */
    deactivateTools(toolNames) {
        const deactivated = [];
        for (const toolName of toolNames) {
            const tool = this.state.allTools.get(toolName);
            // Don't deactivate discovery tools
            if (tool && tool.metadata.category !== ToolCategory.DISCOVERY) {
                if (this.state.activeTools.delete(toolName)) {
                    deactivated.push(toolName);
                }
            }
        }
        const message = `Deactivated ${deactivated.length} tools`;
        this.logger.info(message, { deactivated });
        return {
            success: true,
            deactivated,
            message,
        };
    }
    /**
     * Search for tools based on criteria
     */
    searchTools(criteria) {
        let results = Array.from(this.state.allTools.values());
        // Filter by query
        if (criteria.query) {
            const query = criteria.query.toLowerCase();
            results = results.filter(tool => tool.name.toLowerCase().includes(query) ||
                (tool.description?.toLowerCase().includes(query) ?? false) ||
                tool.metadata.tags.some(tag => tag.toLowerCase().includes(query)));
        }
        // Filter by categories
        if (criteria.categories && criteria.categories.length > 0) {
            results = results.filter(tool => criteria.categories.includes(tool.metadata.category));
        }
        // Filter by tags
        if (criteria.tags && criteria.tags.length > 0) {
            results = results.filter(tool => criteria.tags.some(tag => tool.metadata.tags.includes(tag)));
        }
        // Filter by API key availability
        if (criteria.hasApiKey !== undefined) {
            results = results.filter(tool => {
                if (!tool.metadata.requiresApiKey) {
                    return !criteria.hasApiKey; // Tools without API requirement
                }
                const hasKey = this.checkApiKey(tool.metadata.requiresApiKey);
                return hasKey === criteria.hasApiKey;
            });
        }
        // Sort by priority and usage frequency
        results.sort((a, b) => {
            // First by priority
            const priorityDiff = (a.metadata.priority || 999) - (b.metadata.priority || 999);
            if (priorityDiff !== 0)
                return priorityDiff;
            // Then by usage frequency
            const aUsage = this.state.usageStats.get(a.name) || 0;
            const bUsage = this.state.usageStats.get(b.name) || 0;
            return bUsage - aUsage;
        });
        // Apply limit
        if (criteria.limit && criteria.limit > 0) {
            results = results.slice(0, criteria.limit);
        }
        return results;
    }
    /**
     * Get tool categories with statistics
     */
    getCategories() {
        const categories = [];
        for (const [id, info] of Object.entries(TOOL_CATEGORIES)) {
            const categoryInfo = { ...info };
            const tools = this.state.toolsByCategory.get(id) || [];
            categoryInfo.toolCount = tools.length;
            categoryInfo.estimatedTokens = tools.reduce((sum, tool) => sum + (tool.metadata.estimatedTokens || 0), 0);
            categories.push(categoryInfo);
        }
        return categories;
    }
    /**
     * Get usage statistics
     */
    getUsageStatistics() {
        // Most used tools
        const mostUsed = Array.from(this.state.usageStats.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Recently activated tools
        const recentlyActivated = Array.from(this.state.lastActivation.entries())
            .map(([name, timestamp]) => ({ name, timestamp }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        // Category usage
        const categoryUsage = {};
        for (const [toolName, count] of this.state.usageStats) {
            const tool = this.state.allTools.get(toolName);
            if (tool) {
                const category = tool.metadata.category;
                categoryUsage[category] = (categoryUsage[category] || 0) + count;
            }
        }
        return {
            mostUsed,
            recentlyActivated,
            categoryUsage,
        };
    }
    /**
     * Track tool usage for smart defaults
     */
    trackToolUsage(toolName) {
        const currentCount = this.state.usageStats.get(toolName) || 0;
        this.state.usageStats.set(toolName, currentCount + 1);
        // Update tool metadata
        const tool = this.state.allTools.get(toolName);
        if (tool) {
            tool.metadata.usageFrequency = currentCount + 1;
        }
        // Persist usage stats periodically
        this.saveUsageStats();
    }
    /**
     * Load usage statistics from file
     */
    async loadUsageStats() {
        try {
            if (await fs.pathExists(this.usageStatsFile)) {
                const stats = await fs.readJson(this.usageStatsFile);
                this.state.usageStats = new Map(Object.entries(stats));
                this.logger.info('Loaded usage statistics', {
                    toolCount: this.state.usageStats.size
                });
            }
        }
        catch (error) {
            this.logger.warn('Failed to load usage statistics', { error });
        }
    }
    /**
     * Save usage statistics to file
     */
    async saveUsageStats() {
        try {
            const stats = Object.fromEntries(this.state.usageStats);
            await fs.writeJson(this.usageStatsFile, stats, { spaces: 2 });
        }
        catch (error) {
            this.logger.warn('Failed to save usage statistics', { error });
        }
    }
    /**
     * Check if an API key is available
     */
    checkApiKey(keyName) {
        return !!(this.config.apiKeys?.[keyName] ||
            process.env[`${keyName.toUpperCase()}_API_KEY`]);
    }
    /**
     * Get smart tool suggestions based on context
     */
    getSuggestions(context) {
        const suggestions = [];
        const contextLower = context.toLowerCase();
        // Keyword-based suggestions
        const keywordMap = {
            'video': ['create-complete-video', 'create-text-video', 'list-video-projects'],
            'animation': ['create-complete-video', 'analyze-video-structure'],
            'studio': ['launch-remotion-studio', 'launch-project-studio', 'get-studio-status'],
            'voice': ['generate-voice', 'list-voices'],
            'image': ['generate-image', 'generate-styled-image'],
            'sound': ['search-sound-effects', 'download-sound-effects'],
            'clean': ['cleanup-old-assets', 'organize-assets'],
            'project': ['list-video-projects', 'get-project-status'],
        };
        for (const [keyword, tools] of Object.entries(keywordMap)) {
            if (contextLower.includes(keyword)) {
                suggestions.push(...tools);
            }
        }
        // Remove duplicates and filter to available tools
        const uniqueSuggestions = [...new Set(suggestions)];
        return uniqueSuggestions.filter(name => this.state.allTools.has(name));
    }
    /**
     * Initialize default tools based on configuration
     */
    initializeDefaults() {
        const request = {
            categories: DEFAULT_TOOL_CONFIGURATION.defaultCategories,
            exclusive: false,
        };
        const result = this.activateTools(request);
        this.logger.info('Default tools initialized', result);
    }
    /**
     * Get current mode (always layered now)
     */
    getMode() {
        return 'layered';
    }
    /**
     * Activate a sub-category of tools
     */
    activateSubCategory(category, subCategory, exclusive = false) {
        const activated = [];
        const deactivated = [];
        if (exclusive) {
            // Deactivate all non-discovery tools first
            for (const toolName of this.state.activeTools) {
                if (!this.alwaysActiveTools.has(toolName)) {
                    this.state.activeTools.delete(toolName);
                    deactivated.push(toolName);
                }
            }
            this.activeSubCategories.clear();
        }
        // Activate the requested sub-category
        const categoryPath = `${category}/${subCategory}`;
        this.activeSubCategories.add(categoryPath);
        // Find and activate tools in this sub-category
        for (const [toolName, tool] of this.state.allTools) {
            const metadata = tool.metadata;
            if (metadata.category === category && metadata.subCategory === subCategory) {
                if (!this.state.activeTools.has(toolName)) {
                    this.state.activeTools.add(toolName);
                    activated.push(toolName);
                }
            }
        }
        const message = `Activated ${activated.length} tools in ${categoryPath}, deactivated ${deactivated.length} tools`;
        this.logger.info(message, { activated, deactivated });
        return {
            success: true,
            activated,
            deactivated,
            message
        };
    }
}
//# sourceMappingURL=tool-registry.js.map