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
export const DEVELOPMENT_CONFIG: EnhancedFeatureConfig = {
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
    strategy: OptimizationStrategy.SMART,
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
export const PRODUCTION_CONFIG: EnhancedFeatureConfig = {
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
    strategy: OptimizationStrategy.SMART,
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
export const MINIMAL_CONFIG: EnhancedFeatureConfig = {
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
    strategy: OptimizationStrategy.LRU,
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
export function getEnhancedConfig(): EnhancedFeatureConfig {
  const env = process.env.NODE_ENV || 'development';
  const useEnhanced = process.env.MCP_ENHANCED_FEATURES !== 'false';
  
  if (!useEnhanced) {
    return MINIMAL_CONFIG;
  }
  
  switch (env) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'development':
      return DEVELOPMENT_CONFIG;
    default:
      return DEVELOPMENT_CONFIG;
  }
}

/**
 * Check if enhanced features are enabled
 */
export function isEnhancedMode(): boolean {
  return process.env.MCP_ENHANCED_FEATURES !== 'false';
}

/**
 * Get specific feature flag
 */
export function isFeatureEnabled(feature: keyof EnhancedFeatureFlags): boolean {
  const config = getEnhancedConfig();
  return config.flags[feature];
}