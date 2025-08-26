/**
 * Configuration for Enhanced Tool Management Features
 *
 * Controls which advanced features are enabled and their settings.
 * These features are opt-in to maintain backward compatibility.
 */
import { OptimizationStrategy } from '../services/context-manager.js';
/**
 * Feature flags for enhanced tool management
 */
export interface EnhancedFeatureFlags {
    /** Enable layer-based tool organization */
    useLayers: boolean;
    /** Enable automatic dependency resolution */
    useDependencies: boolean;
    /** Enable context weight management */
    useContextManagement: boolean;
    /** Enable comprehensive audit logging */
    useAuditLogging: boolean;
    /** Enable smart tool recommendations */
    useRecommendations: boolean;
    /** Enable pattern detection in audit logs */
    usePatternDetection: boolean;
}
/**
 * Configuration for enhanced features
 */
export interface EnhancedFeatureConfig {
    /** Feature flags */
    flags: EnhancedFeatureFlags;
    /** Layer management settings */
    layers: {
        /** Maximum layers that can be active simultaneously */
        maxActiveLayers: number;
        /** Whether to auto-activate dependent layers */
        autoActivateDependencies: boolean;
        /** Whether to enforce exclusivity rules */
        enforceExclusivity: boolean;
    };
    /** Context management settings */
    context: {
        /** Maximum context weight in tokens */
        maxWeight: number;
        /** Warning threshold (percentage) */
        warningThreshold: number;
        /** Critical threshold (percentage) */
        criticalThreshold: number;
        /** Optimization strategy */
        strategy: OptimizationStrategy;
        /** Auto-optimize when threshold reached */
        autoOptimize: boolean;
    };
    /** Dependency resolution settings */
    dependencies: {
        /** Whether to auto-resolve transitive dependencies */
        resolveTransitive: boolean;
        /** Maximum dependency depth */
        maxDepth: number;
        /** Whether to allow circular dependencies with warning */
        allowCircular: boolean;
    };
    /** Audit settings */
    audit: {
        /** Enable audit logging */
        enabled: boolean;
        /** Maximum entries to keep in memory */
        maxEntries: number;
        /** Persist interval in milliseconds */
        persistInterval: number;
        /** Enable pattern detection */
        detectPatterns: boolean;
    };
}
/**
 * Default configuration for development
 */
export declare const DEVELOPMENT_CONFIG: EnhancedFeatureConfig;
/**
 * Default configuration for production
 */
export declare const PRODUCTION_CONFIG: EnhancedFeatureConfig;
/**
 * Minimal configuration (legacy mode)
 */
export declare const MINIMAL_CONFIG: EnhancedFeatureConfig;
/**
 * Get configuration based on environment
 */
export declare function getEnhancedConfig(): EnhancedFeatureConfig;
/**
 * Check if enhanced features are enabled
 */
export declare function isEnhancedMode(): boolean;
/**
 * Get specific feature flag
 */
export declare function isFeatureEnabled(feature: keyof EnhancedFeatureFlags): boolean;
//# sourceMappingURL=enhanced-features.d.ts.map