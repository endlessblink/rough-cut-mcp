/**
 * Layer Management Types for Advanced Tool Organization
 * 
 * Defines types for layer-based tool management with support for
 * dependencies, exclusivity policies, and context weight tracking.
 */

import { ToolCategory, ExtendedTool } from './tool-categories.js';

/**
 * Layer exclusivity policy
 */
export enum LayerExclusivity {
  /** Layer can coexist with any other layers */
  NONE = 'none',
  /** Layer can only coexist with specified layers */
  SELECTIVE = 'selective',
  /** Layer must be exclusive (unloads all others) */
  EXCLUSIVE = 'exclusive',
  /** Layer is always active (cannot be deactivated) */
  PERMANENT = 'permanent',
}

/**
 * Layer activation state
 */
export enum LayerState {
  INACTIVE = 'inactive',
  ACTIVATING = 'activating',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  ERROR = 'error',
}

/**
 * Tool layer definition
 */
export interface ToolLayer {
  /** Unique layer identifier */
  id: string;
  /** Display name */
  name: string;
  /** Layer description */
  description: string;
  /** Tool categories in this layer */
  categories: ToolCategory[];
  /** Exclusivity policy */
  exclusivity: LayerExclusivity;
  /** Layers this can coexist with (for SELECTIVE exclusivity) */
  compatibleLayers?: string[];
  /** Dependencies - other layers that must be active */
  dependencies: string[];
  /** Total context weight when active */
  contextWeight: number;
  /** Priority for auto-deactivation (lower = keep longer) */
  priority: number;
  /** Whether this layer loads by default */
  loadByDefault: boolean;
  /** Current state */
  state: LayerState;
  /** Tools in this layer */
  tools: Set<string>;
  /** Required API keys */
  requiredApiKeys?: string[];
}

/**
 * Layer activation request
 */
export interface LayerActivationRequest {
  /** Layer IDs to activate */
  layerIds: string[];
  /** Whether to force activation even if dependencies missing */
  force?: boolean;
  /** Whether to respect exclusivity rules */
  respectExclusivity?: boolean;
  /** Activation reason for audit trail */
  reason?: string;
  /** Requesting agent/user */
  requestedBy?: string;
}

/**
 * Layer activation result
 */
export interface LayerActivationResult {
  /** Whether activation succeeded */
  success: boolean;
  /** Layers that were activated */
  activatedLayers: string[];
  /** Layers that were deactivated */
  deactivatedLayers: string[];
  /** Tools that were activated */
  activatedTools: string[];
  /** Tools that were deactivated */
  deactivatedTools: string[];
  /** Error messages if any */
  errors: string[];
  /** Warning messages if any */
  warnings: string[];
  /** Total context weight after activation */
  totalContextWeight: number;
}

/**
 * Layer manager configuration
 */
export interface LayerManagerConfig {
  /** Maximum context weight allowed */
  maxContextWeight: number;
  /** Whether to auto-deactivate layers when context limit reached */
  autoDeactivate: boolean;
  /** Whether to auto-resolve dependencies */
  autoResolveDependencies: boolean;
  /** Whether to enforce exclusivity rules */
  enforceExclusivity: boolean;
  /** Default activation timeout in ms */
  activationTimeout: number;
  /** Whether to track activation history */
  trackHistory: boolean;
}

/**
 * Layer activation history entry
 */
export interface LayerActivationHistory {
  /** Timestamp of activation/deactivation */
  timestamp: Date;
  /** Action type */
  action: 'activated' | 'deactivated';
  /** Layer ID */
  layerId: string;
  /** Reason for action */
  reason: string;
  /** Who requested the action */
  requestedBy: string;
  /** Context weight at the time */
  contextWeight: number;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Layer statistics
 */
export interface LayerStatistics {
  /** Layer ID */
  layerId: string;
  /** Number of times activated */
  activationCount: number;
  /** Total time active in ms */
  totalActiveTime: number;
  /** Average activation duration in ms */
  averageActiveDuration: number;
  /** Last activation timestamp */
  lastActivated?: Date;
  /** Most frequently used tools in this layer */
  topTools: Array<{ name: string; count: number }>;
}

/**
 * Context pressure level
 */
export enum ContextPressure {
  LOW = 'low',      // < 50% of max
  MEDIUM = 'medium', // 50-75% of max
  HIGH = 'high',    // 75-90% of max
  CRITICAL = 'critical', // > 90% of max
}

/**
 * Layer recommendation
 */
export interface LayerRecommendation {
  /** Recommended layer to activate */
  layerId: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Reason for recommendation */
  reason: string;
  /** Tools that would be useful */
  relevantTools: string[];
  /** Context weight if activated */
  contextWeight: number;
}