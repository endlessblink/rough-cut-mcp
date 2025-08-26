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
export enum ToolCategory {
  DISCOVERY = 'discovery',
  CORE_OPERATIONS = 'core-operations',
  VIDEO_CREATION = 'video-creation',
  ASSET_GENERATION = 'asset-generation',
  STUDIO_MANAGEMENT = 'studio-management',
  MAINTENANCE = 'maintenance',
  VOICE_GENERATION = 'voice-generation',
  SOUND_EFFECTS = 'sound-effects',
  IMAGE_GENERATION = 'image-generation',
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
  exclusive?: boolean; // Whether to unload other sub-categories
  autoLoad?: string[]; // Dependencies to load with this category
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
export const TOOL_CATEGORIES: Record<ToolCategory, ToolCategoryInfo> = {
  [ToolCategory.DISCOVERY]: {
    id: ToolCategory.DISCOVERY,
    name: 'Discovery & Management',
    description: 'Tools for discovering and managing other tools',
    loadByDefault: true,
    estimatedTokens: 500,
  },
  [ToolCategory.CORE_OPERATIONS]: {
    id: ToolCategory.CORE_OPERATIONS,
    name: 'Core Operations',
    description: 'Essential project management and navigation tools',
    loadByDefault: true,
    estimatedTokens: 800,
  },
  [ToolCategory.VIDEO_CREATION]: {
    id: ToolCategory.VIDEO_CREATION,
    name: 'Video Creation',
    description: 'Tools for creating and editing video animations',
    loadByDefault: false,
    estimatedTokens: 1200,
  },
  [ToolCategory.ASSET_GENERATION]: {
    id: ToolCategory.ASSET_GENERATION,
    name: 'Asset Generation',
    description: 'Tools for generating voices, images, and sounds',
    loadByDefault: false,
    requiredApiKeys: ['elevenlabs', 'flux', 'freesound'],
    estimatedTokens: 2000,
  },
  [ToolCategory.STUDIO_MANAGEMENT]: {
    id: ToolCategory.STUDIO_MANAGEMENT,
    name: 'Studio Management',
    description: 'Tools for managing Remotion Studio instances',
    loadByDefault: false,
    estimatedTokens: 1500,
  },
  [ToolCategory.MAINTENANCE]: {
    id: ToolCategory.MAINTENANCE,
    name: 'Maintenance & Cleanup',
    description: 'Tools for asset cleanup and organization',
    loadByDefault: false,
    estimatedTokens: 600,
  },
  [ToolCategory.VOICE_GENERATION]: {
    id: ToolCategory.VOICE_GENERATION,
    name: 'Voice Generation',
    description: 'ElevenLabs voice synthesis tools',
    loadByDefault: false,
    requiredApiKeys: ['elevenlabs'],
    estimatedTokens: 800,
  },
  [ToolCategory.SOUND_EFFECTS]: {
    id: ToolCategory.SOUND_EFFECTS,
    name: 'Sound Effects',
    description: 'Freesound audio search and download tools',
    loadByDefault: false,
    requiredApiKeys: ['freesound'],
    estimatedTokens: 700,
  },
  [ToolCategory.IMAGE_GENERATION]: {
    id: ToolCategory.IMAGE_GENERATION,
    name: 'Image Generation',
    description: 'Flux AI image generation tools',
    loadByDefault: false,
    requiredApiKeys: ['flux'],
    estimatedTokens: 900,
  },
};

/**
 * Tool sub-category definitions for hierarchical organization
 * Updated for consolidated tools (~20 tools total)
 */
export const TOOL_SUBCATEGORIES = {
  'discovery': {
    'discovery': ['discover', 'activate', 'search']
  },
  'core-operations': {
    'project': ['project'],
    'studio': ['studio'],
    'editing': ['composition'],
    'dependencies': ['dependencies']
  },
  'video-creation': {
    'basic': ['create-video'],
    'advanced': ['analyze-video', 'render'],
    'generation': ['generate-assets']
  },
  'maintenance': {
    'assets': ['assets'],
    'cache': ['cache']
  },
  'voice-generation': {
    'management': ['voices']
  },
  'sound-effects': {
    'search': ['sounds']
  },
  'image-generation': {
    'management': ['image-models']
  }
};

/**
 * Default tool loading configuration
 */
export const DEFAULT_TOOL_CONFIGURATION = {
  /** Maximum tools to load initially */
  maxInitialTools: 10,
  /** Categories to load by default */
  defaultCategories: [
    ToolCategory.DISCOVERY, // Only discovery tools by default
  ],
  /** Default sub-categories to load */
  defaultSubCategories: [], // No sub-categories load by default
  /** Enable usage tracking for smart defaults */
  trackUsage: true,
  /** Auto-suggest tools based on context */
  autoSuggest: true,
};