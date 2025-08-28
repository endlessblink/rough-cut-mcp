"use strict";
/**
 * Configuration for Enhanced Tool Management Features
 *
 * Controls which advanced features are enabled and their settings.
 * These features are opt-in to maintain backward compatibility.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MINIMAL_CONFIG = exports.PRODUCTION_CONFIG = exports.DEVELOPMENT_CONFIG = void 0;
exports.getEnhancedConfig = getEnhancedConfig;
exports.isEnhancedMode = isEnhancedMode;
exports.isFeatureEnabled = isFeatureEnabled;
const context_manager_js_1 = require("../services/context-manager.js");
/**
 * Default configuration for development
 */
exports.DEVELOPMENT_CONFIG = {
    flags: {
        useLayers: true,
        useDependencies: true,
        useContextManagement: true,
        useAuditLogging: true,
        useRecommendations: true,
        usePatternDetection: true,
    },
    layers: {
        maxActiveLayers: 10,
        autoActivateDependencies: true,
        enforceExclusivity: false, // More lenient in dev
    },
    context: {
        maxWeight: 15000, // Higher limit for development
        warningThreshold: 0.8,
        criticalThreshold: 0.95,
        strategy: context_manager_js_1.OptimizationStrategy.SMART,
        autoOptimize: false, // Manual control in dev
    },
    dependencies: {
        resolveTransitive: true,
        maxDepth: 5,
        allowCircular: true, // Allow with warning in dev
    },
    audit: {
        enabled: true,
        maxEntries: 50000, // Keep more history in dev
        persistInterval: 300000, // 5 minutes
        detectPatterns: true,
    },
};
/**
 * Default configuration for production
 */
exports.PRODUCTION_CONFIG = {
    flags: {
        useLayers: true,
        useDependencies: true,
        useContextManagement: true,
        useAuditLogging: true,
        useRecommendations: true,
        usePatternDetection: false, // Disable for performance
    },
    layers: {
        maxActiveLayers: 5,
        autoActivateDependencies: true,
        enforceExclusivity: true, // Strict in production
    },
    context: {
        maxWeight: 10000, // Conservative limit
        warningThreshold: 0.75,
        criticalThreshold: 0.9,
        strategy: context_manager_js_1.OptimizationStrategy.SMART,
        autoOptimize: true, // Auto-manage in production
    },
    dependencies: {
        resolveTransitive: true,
        maxDepth: 3,
        allowCircular: false, // Strict in production
    },
    audit: {
        enabled: true,
        maxEntries: 10000,
        persistInterval: 60000, // 1 minute
        detectPatterns: false,
    },
};
/**
 * Minimal configuration (legacy mode)
 */
exports.MINIMAL_CONFIG = {
    flags: {
        useLayers: false,
        useDependencies: false,
        useContextManagement: false,
        useAuditLogging: false,
        useRecommendations: false,
        usePatternDetection: false,
    },
    layers: {
        maxActiveLayers: 999,
        autoActivateDependencies: false,
        enforceExclusivity: false,
    },
    context: {
        maxWeight: 999999,
        warningThreshold: 1,
        criticalThreshold: 1,
        strategy: context_manager_js_1.OptimizationStrategy.LRU,
        autoOptimize: false,
    },
    dependencies: {
        resolveTransitive: false,
        maxDepth: 1,
        allowCircular: true,
    },
    audit: {
        enabled: false,
        maxEntries: 0,
        persistInterval: 0,
        detectPatterns: false,
    },
};
/**
 * Get configuration based on environment
 */
function getEnhancedConfig() {
    const env = process.env.NODE_ENV || 'development';
    const useEnhanced = process.env.MCP_ENHANCED_FEATURES !== 'false';
    if (!useEnhanced) {
        return exports.MINIMAL_CONFIG;
    }
    switch (env) {
        case 'production':
            return exports.PRODUCTION_CONFIG;
        case 'development':
            return exports.DEVELOPMENT_CONFIG;
        default:
            return exports.DEVELOPMENT_CONFIG;
    }
}
/**
 * Check if enhanced features are enabled
 */
function isEnhancedMode() {
    return process.env.MCP_ENHANCED_FEATURES !== 'false';
}
/**
 * Get specific feature flag
 */
function isFeatureEnabled(feature) {
    const config = getEnhancedConfig();
    return config.flags[feature];
}
//# sourceMappingURL=enhanced-features.js.map