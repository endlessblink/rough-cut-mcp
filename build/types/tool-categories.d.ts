/**
 * Tool Categories and Metadata for Structured MCP Tool Organization
 *
 * This implements a layered architecture to reduce context bloat and improve
 * tool selection performance by organizing tools into logical categories
 * that can be dynamically loaded on demand.
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Tool category identifiers
 */
export declare enum ToolCategory {
    DISCOVERY = "discovery",
    CORE_OPERATIONS = "core-operations",
    VIDEO_CREATION = "video-creation",
    ASSET_GENERATION = "asset-generation",
    STUDIO_MANAGEMENT = "studio-management",
    MAINTENANCE = "maintenance",
    VOICE_GENERATION = "voice-generation",
    SOUND_EFFECTS = "sound-effects",
    IMAGE_GENERATION = "image-generation"
}
/**
 * Tool metadata for enhanced organization
 */
export interface ToolMetadata {
    /** Unique tool name */
    name: string;
    /** Tool category */
    category: ToolCategory;
    /** Tool sub-category for further organization */
    subCategory?: string;
    /** Tags for searchability */
    tags: string[];
    /** Whether this tool should be loaded by default */
    loadByDefault: boolean;
    /** Priority for sorting (lower = higher priority) */
    priority: number;
    /** Dependencies on other tools */
    dependencies?: string[];
    /** Whether API key is required */
    requiresApiKey?: string;
    /** Estimated token usage (for context management) */
    estimatedTokens?: number;
    /** Usage frequency (tracked over time) */
    usageFrequency?: number;
}
/**
 * Sub-category definition for hierarchical tool organization
 */
export interface SubCategoryDefinition {
    name: string;
    tools: string[];
    exclusive?: boolean;
    autoLoad?: string[];
}
/**
 * Category definition with sub-categories
 */
export interface CategoryDefinition {
    name: string;
    subCategories: Map<string, SubCategoryDefinition>;
}
/**
 * Extended tool with metadata
 */
export interface ExtendedTool extends Tool {
    metadata: ToolMetadata;
}
/**
 * Tool category information
 */
export interface ToolCategoryInfo {
    id: ToolCategory;
    name: string;
    description: string;
    icon?: string;
    /** Whether this category is loaded by default */
    loadByDefault: boolean;
    /** Tools in this category */
    toolCount?: number;
    /** Required API keys for this category */
    requiredApiKeys?: string[];
    /** Estimated total tokens for all tools in category */
    estimatedTokens?: number;
}
/**
 * Tool activation request
 */
export interface ToolActivationRequest {
    /** Categories to activate */
    categories?: ToolCategory[];
    /** Specific tools to activate */
    tools?: string[];
    /** Whether to deactivate other tools */
    exclusive?: boolean;
}
/**
 * Tool search criteria
 */
export interface ToolSearchCriteria {
    /** Search query */
    query?: string;
    /** Filter by categories */
    categories?: ToolCategory[];
    /** Filter by tags */
    tags?: string[];
    /** Filter by API key availability */
    hasApiKey?: boolean;
    /** Maximum number of results */
    limit?: number;
}
/**
 * Tool registry state
 */
export interface ToolRegistryState {
    /** All registered tools */
    allTools: Map<string, ExtendedTool>;
    /** Currently active tools */
    activeTools: Set<string>;
    /** Tools organized by category */
    toolsByCategory: Map<ToolCategory, ExtendedTool[]>;
    /** Usage statistics */
    usageStats: Map<string, number>;
    /** Last activation time for each tool */
    lastActivation: Map<string, Date>;
}
/**
 * Category definitions with metadata
 */
export declare const TOOL_CATEGORIES: Record<ToolCategory, ToolCategoryInfo>;
/**
 * Tool sub-category definitions for hierarchical organization
 * Updated for consolidated tools (~20 tools total)
 */
export declare const TOOL_SUBCATEGORIES: {
    discovery: {
        discovery: string[];
    };
    'core-operations': {
        project: string[];
        studio: string[];
        editing: string[];
        dependencies: string[];
    };
    'video-creation': {
        basic: string[];
        advanced: string[];
        generation: string[];
    };
    maintenance: {
        assets: string[];
        cache: string[];
    };
    'voice-generation': {
        management: string[];
    };
    'sound-effects': {
        search: string[];
    };
    'image-generation': {
        management: string[];
    };
};
/**
 * Default tool loading configuration
 */
export declare const DEFAULT_TOOL_CONFIGURATION: {
    /** Maximum tools to load initially */
    maxInitialTools: number;
    /** Categories to load by default */
    defaultCategories: ToolCategory[];
    /** Default sub-categories to load */
    defaultSubCategories: never[];
    /** Enable usage tracking for smart defaults */
    trackUsage: boolean;
    /** Auto-suggest tools based on context */
    autoSuggest: boolean;
};
//# sourceMappingURL=tool-categories.d.ts.map