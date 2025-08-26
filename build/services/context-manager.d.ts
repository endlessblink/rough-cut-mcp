/**
 * Context Weight Management System
 *
 * Manages context window usage to prevent LLM performance degradation
 * by tracking and optimizing tool/layer context consumption.
 */
import { ContextPressure } from '../types/layer-types.js';
import { EventEmitter } from 'events';
/**
 * Context item representing a tool or layer
 */
interface ContextItem {
    id: string;
    type: 'tool' | 'layer';
    weight: number;
    priority: number;
    lastUsed: Date;
    usageCount: number;
    required: boolean;
    metadata?: any;
}
/**
 * Context optimization strategy
 */
export declare enum OptimizationStrategy {
    /** Remove least recently used items */
    LRU = "lru",
    /** Remove least frequently used items */
    LFU = "lfu",
    /** Remove lowest priority items */
    PRIORITY = "priority",
    /** Hybrid approach considering multiple factors */
    SMART = "smart"
}
/**
 * Context manager configuration
 */
export interface ContextManagerConfig {
    /** Maximum context weight (in tokens) */
    maxWeight: number;
    /** Warning threshold (percentage of max) */
    warningThreshold: number;
    /** Critical threshold (percentage of max) */
    criticalThreshold: number;
    /** Optimization strategy */
    strategy: OptimizationStrategy;
    /** Whether to auto-optimize when threshold reached */
    autoOptimize: boolean;
    /** Minimum time (ms) before item can be removed */
    minRetentionTime: number;
}
/**
 * Context optimization result
 */
export interface OptimizationResult {
    /** Items removed */
    removed: string[];
    /** Weight freed */
    weightFreed: number;
    /** New total weight */
    newWeight: number;
    /** Optimization strategy used */
    strategy: OptimizationStrategy;
    /** Warnings */
    warnings: string[];
}
/**
 * Context statistics
 */
export interface ContextStatistics {
    /** Current total weight */
    totalWeight: number;
    /** Maximum weight allowed */
    maxWeight: number;
    /** Current pressure level */
    pressure: ContextPressure;
    /** Number of active items */
    activeItems: number;
    /** Average item weight */
    averageWeight: number;
    /** Largest items */
    largestItems: Array<{
        id: string;
        weight: number;
    }>;
    /** Optimization potential (weight that could be freed) */
    optimizationPotential: number;
}
/**
 * Context Manager for tracking and optimizing context window usage
 */
export declare class ContextManager extends EventEmitter {
    private items;
    private config;
    private logger;
    private currentWeight;
    private optimizationHistory;
    constructor(config?: Partial<ContextManagerConfig>);
    /**
     * Add or update a context item
     */
    addItem(id: string, type: 'tool' | 'layer', weight: number, priority?: number, required?: boolean, metadata?: any): void;
    /**
     * Remove a context item
     */
    removeItem(id: string): boolean;
    /**
     * Mark item as used (updates last used time and count)
     */
    markUsed(id: string): void;
    /**
     * Get current context pressure level
     */
    getPressure(): ContextPressure;
    /**
     * Optimize context by removing items based on strategy
     */
    optimize(targetWeight?: number): OptimizationResult;
    /**
     * Get items that can be removed
     */
    private getRemovableItems;
    /**
     * Sort items based on optimization strategy
     */
    private sortByStrategy;
    /**
     * Check if adding items would exceed limit
     */
    canAdd(weight: number): boolean;
    /**
     * Get required weight reduction to add new items
     */
    getRequiredReduction(additionalWeight: number): number;
    /**
     * Get context statistics
     */
    getStatistics(): ContextStatistics;
    /**
     * Get item details
     */
    getItem(id: string): ContextItem | undefined;
    /**
     * Get all items
     */
    getAllItems(): ContextItem[];
    /**
     * Clear all non-required items
     */
    clear(): void;
    /**
     * Get optimization history
     */
    getOptimizationHistory(): OptimizationResult[];
    /**
     * Set optimization strategy
     */
    setStrategy(strategy: OptimizationStrategy): void;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<ContextManagerConfig>): void;
}
export {};
//# sourceMappingURL=context-manager.d.ts.map