/**
 * Context Weight Management System
 * 
 * Manages context window usage to prevent LLM performance degradation
 * by tracking and optimizing tool/layer context consumption.
 */

import { ExtendedTool } from '../types/tool-categories.js';
import { ContextPressure } from '../types/layer-types.js';
import { getLogger } from '../utils/logger.js';
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
export enum OptimizationStrategy {
  /** Remove least recently used items */
  LRU = 'lru',
  /** Remove least frequently used items */
  LFU = 'lfu',
  /** Remove lowest priority items */
  PRIORITY = 'priority',
  /** Hybrid approach considering multiple factors */
  SMART = 'smart',
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
  largestItems: Array<{ id: string; weight: number }>;
  /** Optimization potential (weight that could be freed) */
  optimizationPotential: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ContextManagerConfig = {
  maxWeight: 10000,
  warningThreshold: 0.75,
  criticalThreshold: 0.9,
  strategy: OptimizationStrategy.SMART,
  autoOptimize: true,
  minRetentionTime: 60000, // 1 minute
};

/**
 * Context Manager for tracking and optimizing context window usage
 */
export class ContextManager extends EventEmitter {
  private items: Map<string, ContextItem>;
  private config: ContextManagerConfig;
  private logger: any;
  private currentWeight: number;
  private optimizationHistory: OptimizationResult[];

  constructor(config?: Partial<ContextManagerConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.items = new Map();
    this.currentWeight = 0;
    this.optimizationHistory = [];
    this.logger = getLogger().service('ContextManager');

    this.logger.info('Context Manager initialized', this.config);
  }

  /**
   * Add or update a context item
   */
  addItem(
    id: string,
    type: 'tool' | 'layer',
    weight: number,
    priority: number = 5,
    required: boolean = false,
    metadata?: any
  ): void {
    const existingItem = this.items.get(id);
    
    if (existingItem) {
      // Update existing item
      this.currentWeight -= existingItem.weight;
      existingItem.weight = weight;
      existingItem.lastUsed = new Date();
      existingItem.usageCount++;
      this.currentWeight += weight;
    } else {
      // Add new item
      const item: ContextItem = {
        id,
        type,
        weight,
        priority,
        lastUsed: new Date(),
        usageCount: 1,
        required,
        metadata,
      };
      this.items.set(id, item);
      this.currentWeight += weight;
    }

    this.logger.debug('Context item added/updated', {
      id,
      weight,
      totalWeight: this.currentWeight,
    });

    // Check if optimization needed
    if (this.config.autoOptimize && this.getPressure() >= ContextPressure.HIGH) {
      this.optimize();
    }

    // Emit pressure change event
    this.emit('pressureChange', {
      pressure: this.getPressure(),
      weight: this.currentWeight,
      maxWeight: this.config.maxWeight,
    });
  }

  /**
   * Remove a context item
   */
  removeItem(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;

    if (item.required) {
      this.logger.warn('Attempted to remove required item', { id });
      return false;
    }

    this.currentWeight -= item.weight;
    this.items.delete(id);

    this.logger.debug('Context item removed', {
      id,
      weight: item.weight,
      newTotalWeight: this.currentWeight,
    });

    return true;
  }

  /**
   * Mark item as used (updates last used time and count)
   */
  markUsed(id: string): void {
    const item = this.items.get(id);
    if (item) {
      item.lastUsed = new Date();
      item.usageCount++;
    }
  }

  /**
   * Get current context pressure level
   */
  getPressure(): ContextPressure {
    const ratio = this.currentWeight / this.config.maxWeight;
    
    if (ratio < 0.5) return ContextPressure.LOW;
    if (ratio < this.config.warningThreshold) return ContextPressure.MEDIUM;
    if (ratio < this.config.criticalThreshold) return ContextPressure.HIGH;
    return ContextPressure.CRITICAL;
  }

  /**
   * Optimize context by removing items based on strategy
   */
  optimize(targetWeight?: number): OptimizationResult {
    const target = targetWeight || this.config.maxWeight * 0.7;
    const weightToFree = Math.max(0, this.currentWeight - target);

    const result: OptimizationResult = {
      removed: [],
      weightFreed: 0,
      newWeight: this.currentWeight,
      strategy: this.config.strategy,
      warnings: [],
    };

    if (weightToFree === 0) {
      result.warnings.push('No optimization needed');
      return result;
    }

    // Get removable items (non-required, past retention time)
    const removableItems = this.getRemovableItems();

    if (removableItems.length === 0) {
      result.warnings.push('No items available for removal');
      return result;
    }

    // Sort items based on strategy
    const sortedItems = this.sortByStrategy(removableItems, this.config.strategy);

    // Remove items until target reached
    for (const item of sortedItems) {
      if (result.weightFreed >= weightToFree) break;

      if (this.removeItem(item.id)) {
        result.removed.push(item.id);
        result.weightFreed += item.weight;
      }
    }

    result.newWeight = this.currentWeight;
    
    // Track optimization
    this.optimizationHistory.push(result);
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory = this.optimizationHistory.slice(-50);
    }

    this.logger.info('Context optimized', result);
    this.emit('optimized', result);

    return result;
  }

  /**
   * Get items that can be removed
   */
  private getRemovableItems(): ContextItem[] {
    const now = Date.now();
    const removable: ContextItem[] = [];

    for (const item of this.items.values()) {
      if (!item.required && 
          (now - item.lastUsed.getTime()) > this.config.minRetentionTime) {
        removable.push(item);
      }
    }

    return removable;
  }

  /**
   * Sort items based on optimization strategy
   */
  private sortByStrategy(
    items: ContextItem[],
    strategy: OptimizationStrategy
  ): ContextItem[] {
    const sorted = [...items];

    switch (strategy) {
      case OptimizationStrategy.LRU:
        sorted.sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime());
        break;

      case OptimizationStrategy.LFU:
        sorted.sort((a, b) => a.usageCount - b.usageCount);
        break;

      case OptimizationStrategy.PRIORITY:
        sorted.sort((a, b) => b.priority - a.priority);
        break;

      case OptimizationStrategy.SMART:
        // Hybrid approach: combine multiple factors
        sorted.sort((a, b) => {
          const now = Date.now();
          const aAge = (now - a.lastUsed.getTime()) / 1000; // seconds
          const bAge = (now - b.lastUsed.getTime()) / 1000;
          
          // Calculate scores (higher = more likely to remove)
          const aScore = 
            (aAge / 3600) * 0.3 +                    // Age factor (hours)
            (1 / (a.usageCount + 1)) * 0.3 +        // Usage factor
            ((10 - a.priority) / 10) * 0.2 +        // Priority factor
            (a.weight / this.config.maxWeight) * 0.2; // Weight factor
          
          const bScore = 
            (bAge / 3600) * 0.3 +
            (1 / (b.usageCount + 1)) * 0.3 +
            ((10 - b.priority) / 10) * 0.2 +
            (b.weight / this.config.maxWeight) * 0.2;
          
          return bScore - aScore;
        });
        break;
    }

    return sorted;
  }

  /**
   * Check if adding items would exceed limit
   */
  canAdd(weight: number): boolean {
    return (this.currentWeight + weight) <= this.config.maxWeight;
  }

  /**
   * Get required weight reduction to add new items
   */
  getRequiredReduction(additionalWeight: number): number {
    const projectedWeight = this.currentWeight + additionalWeight;
    return Math.max(0, projectedWeight - this.config.maxWeight);
  }

  /**
   * Get context statistics
   */
  getStatistics(): ContextStatistics {
    const items = Array.from(this.items.values());
    const nonRequiredWeight = items
      .filter(i => !i.required)
      .reduce((sum, i) => sum + i.weight, 0);

    return {
      totalWeight: this.currentWeight,
      maxWeight: this.config.maxWeight,
      pressure: this.getPressure(),
      activeItems: this.items.size,
      averageWeight: this.items.size > 0 ? this.currentWeight / this.items.size : 0,
      largestItems: items
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map(i => ({ id: i.id, weight: i.weight })),
      optimizationPotential: nonRequiredWeight,
    };
  }

  /**
   * Get item details
   */
  getItem(id: string): ContextItem | undefined {
    return this.items.get(id);
  }

  /**
   * Get all items
   */
  getAllItems(): ContextItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Clear all non-required items
   */
  clear(): void {
    const toRemove: string[] = [];
    for (const [id, item] of this.items) {
      if (!item.required) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.removeItem(id);
    }

    this.logger.info('Context cleared', {
      removed: toRemove.length,
      remaining: this.items.size,
    });
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * Set optimization strategy
   */
  setStrategy(strategy: OptimizationStrategy): void {
    this.config.strategy = strategy;
    this.logger.info('Optimization strategy changed', { strategy });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ContextManagerConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configuration updated', this.config);
    
    // Check if immediate optimization needed
    if (this.config.autoOptimize && this.getPressure() >= ContextPressure.HIGH) {
      this.optimize();
    }
  }
}