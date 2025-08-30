"use strict";
/**
 * Tool Categories and Metadata for Structured MCP Tool Organization
 *
 * This implements a layered architecture to reduce context bloat and improve
 * tool selection performance by organizing tools into logical categories
 * that can be dynamically loaded on demand.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TOOL_CONFIGURATION = exports.TOOL_SUBCATEGORIES = exports.TOOL_CATEGORIES = exports.ToolCategory = void 0;
/**
 * Tool category identifiers
 */
var ToolCategory;
(function (ToolCategory) {
    ToolCategory["DISCOVERY"] = "discovery";
    ToolCategory["CORE_OPERATIONS"] = "core-operations";
    ToolCategory["VIDEO_CREATION"] = "video-creation";
    ToolCategory["ASSET_GENERATION"] = "asset-generation";
    ToolCategory["STUDIO_MANAGEMENT"] = "studio-management";
    ToolCategory["MAINTENANCE"] = "maintenance";
    ToolCategory["VOICE_GENERATION"] = "voice-generation";
    ToolCategory["SOUND_EFFECTS"] = "sound-effects";
    ToolCategory["IMAGE_GENERATION"] = "image-generation";
})(ToolCategory || (exports.ToolCategory = ToolCategory = {}));
/**
 * Category definitions with metadata
 */
exports.TOOL_CATEGORIES = {
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
        name: 'Video Creation & Animation',
        description: 'Tools for creating any type of video animation - airplanes, submarines, running characters, motion graphics, etc.',
        loadByDefault: true,
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
exports.TOOL_SUBCATEGORIES = {
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
exports.DEFAULT_TOOL_CONFIGURATION = {
    /** Maximum tools to load initially */
    maxInitialTools: 10,
    /** Categories to load by default */
    defaultCategories: [
        ToolCategory.DISCOVERY, // Discovery tools for navigation (3 tools)
        ToolCategory.CORE_OPERATIONS, // Essential project and studio tools (2 tools) 
        ToolCategory.VIDEO_CREATION, // Video creation and composition tools (4 tools)
    ],
    /** Default sub-categories to load */
    defaultSubCategories: [], // No sub-categories load by default
    /** Enable usage tracking for smart defaults */
    trackUsage: true,
    /** Auto-suggest tools based on context */
    autoSuggest: true,
};
//# sourceMappingURL=tool-categories.js.map