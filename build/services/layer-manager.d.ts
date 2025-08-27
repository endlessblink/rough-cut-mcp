/**
 * Layer Manager for Advanced Tool Organization
 *
 * Manages tool layers with exclusivity policies, dependencies,
 * and context weight tracking for optimal LLM performance.
 */
import { ToolLayer, LayerActivationRequest, LayerActivationResult, LayerManagerConfig, LayerActivationHistory, ContextPressure, LayerRecommendation } from '../types/layer-types.js';
import { EventEmitter } from 'events';
/**
 * Layer Manager for sophisticated tool layer orchestration
 */
export declare class LayerManager extends EventEmitter {
    private layers;
    private activeLayers;
    private config;
    private logger;
    private activationHistory;
    private layerStats;
    private currentContextWeight;
    private activationQueue;
    private deactivationQueue;
    constructor(config?: Partial<LayerManagerConfig>);
    /**
     * Define a new layer
     */
    defineLayer(layer: ToolLayer): void;
    /**
     * Activate layers with dependency resolution and exclusivity handling
     */
    activateLayers(request: LayerActivationRequest): Promise<LayerActivationResult>;
    /**
     * Deactivate layers
     */
    deactivateLayers(layerIds: string[]): Promise<LayerActivationResult>;
    /**
     * Get layer recommendations based on context
     */
    getRecommendations(context: string, limit?: number): LayerRecommendation[];
    /**
     * Get context pressure level
     */
    getContextPressure(): ContextPressure;
    /**
     * Get layer statistics
     */
    getStatistics(): any;
    /**
     * Get activation history
     */
    getHistory(limit?: number): LayerActivationHistory[];
    /**
     * Get active layers
     */
    getActiveLayers(): ToolLayer[];
    /**
     * Check if a layer is active
     */
    isLayerActive(layerId: string): boolean;
    /**
     * Get current context weight
     */
    getCurrentContextWeight(): number;
    /**
     * Build activation plan with dependency resolution
     */
    private buildActivationPlan;
    /**
     * Build deactivation plan based on exclusivity rules
     */
    private buildDeactivationPlan;
    /**
     * Calculate projected context weight
     */
    private calculateProjectedWeight;
    /**
     * Select layers for auto-deactivation
     */
    private selectLayersForDeactivation;
    /**
     * Activate a layer internally
     */
    private activateLayerInternal;
    /**
     * Deactivate a layer internally
     */
    private deactivateLayerInternal;
    /**
     * Find layers that depend on the given layers
     */
    private findDependentLayers;
    /**
     * Calculate current total context weight
     */
    private calculateCurrentContextWeight;
    /**
     * Generate recommendation reason
     */
    private generateRecommendationReason;
    /**
     * Track activation in history
     */
    private trackActivation;
}
//# sourceMappingURL=layer-manager.d.ts.map