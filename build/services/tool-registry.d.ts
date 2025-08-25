/**
 * Tool Registry Service for Dynamic Tool Management
 *
 * Implements a layered architecture for MCP tools to reduce context bloat
 * and improve performance by dynamically loading tools on demand.
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolMetadata, ExtendedTool, ToolActivationRequest, ToolSearchCriteria, ToolCategoryInfo } from '../types/tool-categories.js';
/**
 * Tool Registry for managing and organizing MCP tools
 */
export declare class ToolRegistry {
    private state;
    private logger;
    private config;
    private toolHandlers;
    private usageStatsFile;
    private legacyMode;
    constructor(config: any, legacyMode?: boolean);
    /**
     * Register a tool with metadata
     */
    registerTool(tool: Tool, handler: Function, metadata: ToolMetadata): void;
    /**
     * Register multiple tools at once
     */
    registerTools(tools: Tool[], handlers: Record<string, Function>, metadataList: ToolMetadata[]): void;
    /**
     * Get currently active tools for MCP list_tools response
     */
    getActiveTools(): Tool[];
    /**
     * Get handler for a specific tool
     * Note: Following MCP protocol standards, activation state only affects listing (list_tools),
     * not execution (call_tool). Any registered tool can be called regardless of activation.
     */
    getToolHandler(toolName: string): Function | undefined;
    /**
     * Activate tools based on request
     */
    activateTools(request: ToolActivationRequest): {
        success: boolean;
        activated: string[];
        deactivated: string[];
        message: string;
    };
    /**
     * Deactivate tools
     */
    deactivateTools(toolNames: string[]): {
        success: boolean;
        deactivated: string[];
        message: string;
    };
    /**
     * Search for tools based on criteria
     */
    searchTools(criteria: ToolSearchCriteria): ExtendedTool[];
    /**
     * Get tool categories with statistics
     */
    getCategories(): ToolCategoryInfo[];
    /**
     * Get usage statistics
     */
    getUsageStatistics(): {
        mostUsed: Array<{
            name: string;
            count: number;
        }>;
        recentlyActivated: Array<{
            name: string;
            timestamp: Date;
        }>;
        categoryUsage: Record<string, number>;
    };
    /**
     * Track tool usage for smart defaults
     */
    private trackToolUsage;
    /**
     * Load usage statistics from file
     */
    private loadUsageStats;
    /**
     * Save usage statistics to file
     */
    private saveUsageStats;
    /**
     * Check if an API key is available
     */
    private checkApiKey;
    /**
     * Get smart tool suggestions based on context
     */
    getSuggestions(context: string): string[];
    /**
     * Initialize default tools based on configuration
     */
    initializeDefaults(): void;
    /**
     * Get current mode (legacy or layered)
     */
    getMode(): string;
    /**
     * Toggle between legacy and layered mode
     */
    setMode(legacyMode: boolean): void;
}
//# sourceMappingURL=tool-registry.d.ts.map