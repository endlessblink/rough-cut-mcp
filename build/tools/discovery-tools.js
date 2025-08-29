"use strict";
/**
 * Discovery Tools - Minimal set for tool discovery and activation
 * Works with Enhanced Registry's layered architecture
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDiscoveryTools = registerDiscoveryTools;
const tool_categories_js_1 = require("../types/tool-categories.js");
function registerDiscoveryTools(server) {
    const logger = server.baseLogger.service('discovery-tools');
    // Debug: Log that we're registering discovery tools
    logger.info('Starting discovery tools registration');
    /**
     * 1. Discover - Single tool for all discovery needs
     */
    server.toolRegistry.registerTool({
        name: 'discover',
        description: 'Discover available capabilities, categories, and tools',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['all', 'categories', 'active', 'stats', 'recommendations', 'tree'],
                    description: 'What to discover - use "tree" to see complete navigable hierarchy',
                    default: 'all'
                },
                context: {
                    type: 'string',
                    description: 'Context for recommendations'
                }
            }
        }
    }, async (args) => {
        try {
            const type = args.type || 'all';
            switch (type) {
                case 'all':
                case 'categories': {
                    const categories = Object.entries(tool_categories_js_1.TOOL_CATEGORIES).map(([id, info]) => {
                        const subCats = tool_categories_js_1.TOOL_SUBCATEGORIES[id.replace('_', '-').toLowerCase()] || {};
                        const subCategoryList = Object.entries(subCats)
                            .map(([name, tools]) => `  - ${name}: ${tools.length} tools`)
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
                    const toolList = activeTools.map((tool) => `• ${tool.name} (${tool.metadata.category})`).join('\n');
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Active Tools (${activeTools.length}):\n\n${toolList}\n\nTotal context weight: ${stats.totalActiveWeight || 'N/A'}`
                            }]
                    };
                }
                case 'stats': {
                    // Get enhanced statistics if available
                    const stats = server.toolRegistry.getEnhancedStatistics?.() ||
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
                    const recList = recommendations.map((tool, i) => `${i + 1}. ${tool} - Recommended for "${context}"`).join('\n');
                    return {
                        content: [{
                                type: 'text',
                                text: `💡 Recommended tools for "${context}":\n\n${recList}`
                            }]
                    };
                }
                case 'tree': {
                    // Build complete hierarchical tree structure for AI navigation
                    const allToolsCount = server.toolRegistry.getTotalToolsCount();
                    const activeToolsCount = server.toolRegistry.getActiveTools().length;
                    // Build category tree with detailed navigation info
                    const categories = Object.entries(tool_categories_js_1.TOOL_CATEGORIES).map(([categoryId, categoryInfo]) => {
                        const categoryKey = categoryId.replace('_', '-').toLowerCase();
                        const subCats = tool_categories_js_1.TOOL_SUBCATEGORIES[categoryKey] || {};
                        const toolsInCategory = server.toolRegistry.getToolsByCategory(categoryId);
                        const isActive = server.toolRegistry.getActiveTools().some((tool) => tool.metadata.category === categoryId && tool.metadata.category !== tool_categories_js_1.ToolCategory.DISCOVERY);
                        // Build subcategory structure
                        const subCategories = Object.entries(subCats).map(([subId, tools]) => ({
                            id: subId,
                            name: subId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            tools: tools,
                            toolCount: tools.length,
                            activationPath: `${categoryKey}/${subId}`
                        }));
                        return {
                            id: categoryKey,
                            name: categoryInfo.name,
                            description: categoryInfo.description,
                            status: categoryId === tool_categories_js_1.ToolCategory.DISCOVERY ? 'exposed' : (isActive ? 'exposed' : 'available'),
                            toolCount: toolsInCategory.length,
                            subCategories,
                            estimatedTokens: categoryInfo.estimatedTokens || 500,
                            requiredApiKeys: categoryInfo.requiredApiKeys || [],
                            canActivate: categoryId !== tool_categories_js_1.ToolCategory.DISCOVERY,
                            activationHint: isActive ? 'Already active' : `Use activate({ categories: ['${categoryKey}'] }) to expose tools`
                        };
                    });
                    // Create tree structure response
                    const treeStructure = {
                        totalTools: allToolsCount,
                        exposedTools: activeToolsCount,
                        categories,
                        navigationHints: [
                            "🔍 Use activate({ categories: ['category-name'] }) to expose category tools",
                            "🎯 Use activate({ subCategories: ['category/subcategory'] }) for specific tool groups",
                            "🔍 Use search({ query: 'keyword' }) to find specific functionality",
                            "📊 Use discover({ type: 'active' }) to see currently exposed tools"
                        ],
                        performance: {
                            exposureRate: Math.round((activeToolsCount / allToolsCount) * 100),
                            contextOptimization: `${Math.round((1 - activeToolsCount / allToolsCount) * 100)}% context saved`
                        }
                    };
                    // Format tree display
                    let treeDisplay = `🌳 Complete Tool Tree (${allToolsCount} tools total, ${activeToolsCount} exposed)\n\n`;
                    categories.forEach(cat => {
                        const statusIcon = cat.status === 'exposed' ? '✅' : (cat.requiredApiKeys.length > 0 ? '🔑' : '📁');
                        const apiKeyInfo = cat.requiredApiKeys.length > 0 ? ` (requires: ${cat.requiredApiKeys.join(', ')})` : '';
                        treeDisplay += `${statusIcon} **${cat.name}** (${cat.toolCount} tools)${apiKeyInfo}\n`;
                        treeDisplay += `   ${cat.description}\n`;
                        if (cat.canActivate) {
                            treeDisplay += `   💡 ${cat.activationHint}\n`;
                        }
                        // Show subcategories
                        cat.subCategories.forEach(subCat => {
                            treeDisplay += `   ├── 📝 ${subCat.name} (${subCat.toolCount} tools)\n`;
                            treeDisplay += `   │   └── Tools: ${subCat.tools.join(', ')}\n`;
                        });
                        treeDisplay += '\n';
                    });
                    treeDisplay += '\n🧭 **Navigation Guide:**\n';
                    treeStructure.navigationHints.forEach(hint => {
                        treeDisplay += `   ${hint}\n`;
                    });
                    treeDisplay += `\n📈 **Performance:** ${treeStructure.performance.exposureRate}% tools exposed, ${treeStructure.performance.contextOptimization} overhead saved`;
                    return {
                        content: [{
                                type: 'text',
                                text: treeDisplay
                            }],
                        // Include structured data for potential programmatic use
                        metadata: { treeStructure }
                    };
                }
                default:
                    throw new Error(`Unknown discovery type: ${type}`);
            }
        }
        catch (error) {
            logger.error('Discovery failed', { error });
            throw error;
        }
    }, {
        name: 'discover',
        category: tool_categories_js_1.ToolCategory.DISCOVERY,
        subCategory: 'discovery',
        tags: ['discover', 'capabilities', 'help'],
        loadByDefault: true,
        priority: 0,
        estimatedTokens: 80
    });
    /**
     * 2. Activate - Single tool for activation
     */
    server.toolRegistry.registerTool({
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
    }, async (args) => {
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
                        const result = server.toolRegistry.activateSubCategory(category, subCategory, args.exclusive);
                        if (result.success) {
                            results.push(`✅ Activated ${subCat}: ${result.activated.length} tools`);
                        }
                        else {
                            results.push(`❌ Failed ${subCat}: ${result.message}`);
                        }
                    }
                    catch (error) {
                        results.push(`❌ Error activating ${subCat}: ${error.message}`);
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
            const result = server.toolRegistry.activateToolsEnhanced?.(request) ||
                server.toolRegistry.activateTools(request);
            let output = '';
            if (result.success) {
                output = '✅ Activation successful:\n';
                if (result.activated.length > 0) {
                    output += `\n🔧 **Newly Available Tools** (${result.activated.length}):\n`;
                    // Get detailed tool information
                    result.activated.forEach((toolName) => {
                        const tool = server.toolRegistry.getToolByName(toolName);
                        if (tool) {
                            output += `  • **${toolName}** - ${tool.description || 'No description available'}\n`;
                        }
                        else {
                            output += `  • **${toolName}**\n`;
                        }
                    });
                    output += `\n💡 **Next Steps:**\n`;
                    output += `  • These tools are now available in your MCP interface\n`;
                    output += `  • You can call them directly: ${result.activated.slice(0, 3).join(', ')}${result.activated.length > 3 ? '...' : ''}\n`;
                    output += `  • Use discover({ type: 'active' }) to see all active tools\n`;
                }
                if (result.deactivated?.length > 0) {
                    output += `\n🔄 Deactivated: ${result.deactivated.join(', ')}\n`;
                }
                if (result.dependencies?.length > 0) {
                    output += `\n📦 Dependencies loaded: ${result.dependencies.join(', ')}\n`;
                }
                if (result.contextWeight) {
                    output += `\n📊 Context weight: ${result.contextWeight}`;
                }
                // Add performance metrics
                const activeToolsCount = server.toolRegistry.getActiveTools().length;
                const totalToolsCount = server.toolRegistry.getTotalToolsCount();
                const exposureRate = Math.round((activeToolsCount / totalToolsCount) * 100);
                output += `\n\n📈 **Performance:** ${activeToolsCount}/${totalToolsCount} tools exposed (${exposureRate}%), `;
                output += `${Math.round((1 - activeToolsCount / totalToolsCount) * 100)}% overhead saved`;
            }
            else {
                output = `❌ Activation failed: ${result.message}\n\n`;
                // Add helpful suggestions on failure
                output += `💡 **Suggestions:**\n`;
                output += `  • Use discover({ type: 'tree' }) to see available categories\n`;
                output += `  • Check category names: ${Object.keys(tool_categories_js_1.TOOL_CATEGORIES).map(k => k.toLowerCase().replace('_', '-')).join(', ')}\n`;
                output += `  • Use search({ query: 'keyword' }) to find specific tools\n`;
            }
            return {
                content: [{
                        type: 'text',
                        text: output
                    }]
            };
        }
        catch (error) {
            logger.error('Activation failed', { error });
            throw error;
        }
    }, {
        name: 'activate',
        category: tool_categories_js_1.ToolCategory.DISCOVERY,
        subCategory: 'discovery',
        tags: ['activate', 'load', 'enable'],
        loadByDefault: true,
        priority: 0,
        estimatedTokens: 60
    });
    /**
     * 3. Search - Find tools by query
     */
    server.toolRegistry.registerTool({
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
    }, async (args) => {
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
            const activeTools = new Set(server.toolRegistry.getActiveTools().map((t) => t.name));
            // Group results by activation status
            const activeResults = results.filter((tool) => activeTools.has(tool.name));
            const inactiveResults = results.filter((tool) => !activeTools.has(tool.name));
            let output = `🔍 Found ${results.length} tools matching "${args.query}":\n\n`;
            // Show active tools first
            if (activeResults.length > 0) {
                output += `✅ **Ready to Use** (${activeResults.length} tools):\n`;
                activeResults.forEach((tool) => {
                    output += `  • **${tool.name}** - ${tool.description}\n`;
                    output += `    Category: ${tool.metadata.category} | Tags: ${tool.metadata.tags.join(', ')}\n`;
                });
                output += '\n';
            }
            // Show inactive tools with activation hints  
            if (inactiveResults.length > 0) {
                output += `⏸️ **Available (Not Yet Active)** (${inactiveResults.length} tools):\n`;
                // Group inactive tools by category for better activation suggestions
                const toolsByCategory = new Map();
                inactiveResults.forEach((tool) => {
                    const categoryKey = tool.metadata.category.toLowerCase().replace('_', '-');
                    if (!toolsByCategory.has(categoryKey)) {
                        toolsByCategory.set(categoryKey, []);
                    }
                    toolsByCategory.get(categoryKey).push(tool);
                });
                toolsByCategory.forEach((tools, categoryKey) => {
                    output += `\n  📁 **${categoryKey}** category:\n`;
                    tools.forEach((tool) => {
                        output += `    • **${tool.name}** - ${tool.description}\n`;
                        output += `      Tags: ${tool.metadata.tags.join(', ')}\n`;
                    });
                    output += `    💡 Activate with: activate({ categories: ['${categoryKey}'] })\n`;
                });
                output += '\n🎯 **Quick Activation:**\n';
                if (toolsByCategory.size === 1) {
                    const [categoryKey] = toolsByCategory.keys();
                    output += `  • All results are in '${categoryKey}' - use: activate({ categories: ['${categoryKey}'] })\n`;
                }
                else {
                    const categoryList = Array.from(toolsByCategory.keys());
                    output += `  • Multiple categories found: ${categoryList.join(', ')}\n`;
                    output += `  • Activate specific category: activate({ categories: ['category-name'] })\n`;
                    output += `  • Or activate all: activate({ categories: ${JSON.stringify(categoryList)} })\n`;
                }
            }
            // Add contextual recommendations based on query
            const queryLower = args.query.toLowerCase();
            const suggestions = [];
            if (queryLower.includes('video') || queryLower.includes('create') || queryLower.includes('animation')) {
                suggestions.push("For video creation: activate({ categories: ['video-creation'] })");
            }
            if (queryLower.includes('voice') || queryLower.includes('audio') || queryLower.includes('speech')) {
                suggestions.push("For voice tools: activate({ categories: ['voice-generation'] }) (requires ElevenLabs API)");
            }
            if (queryLower.includes('project') || queryLower.includes('manage') || queryLower.includes('studio')) {
                suggestions.push("For project tools: activate({ categories: ['core-operations'] })");
            }
            if (suggestions.length > 0) {
                output += `\n💡 **Based on your search:**\n`;
                suggestions.forEach(suggestion => output += `  • ${suggestion}\n`);
            }
            return {
                content: [{
                        type: 'text',
                        text: output
                    }]
            };
        }
        catch (error) {
            logger.error('Search failed', { error });
            throw error;
        }
    }, {
        name: 'search',
        category: tool_categories_js_1.ToolCategory.DISCOVERY,
        subCategory: 'discovery',
        tags: ['search', 'find', 'lookup'],
        loadByDefault: true,
        priority: 0,
        estimatedTokens: 60
    });
    // All discovery tools registered successfully
}
//# sourceMappingURL=discovery-tools.js.map