/**
 * Layer Manager for Advanced Tool Organization
 *
 * Manages tool layers with exclusivity policies, dependencies,
 * and context weight tracking for optimal LLM performance.
 */
import { LayerExclusivity, LayerState, ContextPressure, } from '../types/layer-types.js';
import { getLogger } from '../utils/logger.js';
import { EventEmitter } from 'events';
/**
 * Default layer manager configuration
 */
const DEFAULT_CONFIG = {
    maxContextWeight: 10000,
    autoDeactivate: true,
    autoResolveDependencies: true,
    enforceExclusivity: true,
    activationTimeout: 5000,
    trackHistory: true,
};
/**
 * Layer Manager for sophisticated tool layer orchestration
 */
export class LayerManager extends EventEmitter {
    layers;
    activeLayers;
    config;
    logger;
    activationHistory;
    layerStats;
    currentContextWeight;
    activationQueue;
    deactivationQueue;
    constructor(config) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.layers = new Map();
        this.activeLayers = new Set();
        this.activationHistory = [];
        this.layerStats = new Map();
        this.currentContextWeight = 0;
        this.activationQueue = new Set();
        this.deactivationQueue = new Set();
        this.logger = getLogger().service('LayerManager');
        this.logger.info('Layer Manager initialized', this.config);
    }
    /**
     * Define a new layer
     */
    defineLayer(layer) {
        if (this.layers.has(layer.id)) {
            this.logger.warn('Layer already exists, updating', { layerId: layer.id });
        }
        this.layers.set(layer.id, layer);
        // Initialize statistics
        if (!this.layerStats.has(layer.id)) {
            this.layerStats.set(layer.id, {
                layerId: layer.id,
                activationCount: 0,
                totalActiveTime: 0,
                averageActiveDuration: 0,
                topTools: [],
            });
        }
        this.logger.info('Layer defined', {
            layerId: layer.id,
            name: layer.name,
            exclusivity: layer.exclusivity,
            dependencies: layer.dependencies,
            contextWeight: layer.contextWeight,
        });
    }
    /**
     * Activate layers with dependency resolution and exclusivity handling
     */
    async activateLayers(request) {
        const result = {
            success: false,
            activatedLayers: [],
            deactivatedLayers: [],
            activatedTools: [],
            deactivatedTools: [],
            errors: [],
            warnings: [],
            totalContextWeight: this.currentContextWeight,
        };
        try {
            // Validate requested layers exist
            for (const layerId of request.layerIds) {
                if (!this.layers.has(layerId)) {
                    result.errors.push(`Layer '${layerId}' not found`);
                    return result;
                }
            }
            // Build activation plan with dependencies
            const activationPlan = this.buildActivationPlan(request.layerIds, request.force || false);
            if (activationPlan.errors.length > 0) {
                result.errors.push(...activationPlan.errors);
                if (!request.force) {
                    return result;
                }
                result.warnings.push('Forcing activation despite errors');
            }
            // Check exclusivity and build deactivation list
            const deactivationPlan = this.buildDeactivationPlan(activationPlan.layers, request.respectExclusivity !== false);
            // Check context weight
            const projectedWeight = this.calculateProjectedWeight(activationPlan.layers, deactivationPlan);
            if (projectedWeight > this.config.maxContextWeight) {
                if (this.config.autoDeactivate) {
                    const additionalDeactivations = this.selectLayersForDeactivation(projectedWeight - this.config.maxContextWeight, new Set([...activationPlan.layers, ...Array.from(this.activeLayers)]));
                    deactivationPlan.push(...additionalDeactivations);
                    result.warnings.push(`Auto-deactivating ${additionalDeactivations.length} layers to stay within context limit`);
                }
                else {
                    result.errors.push(`Activation would exceed context limit (${projectedWeight}/${this.config.maxContextWeight})`);
                    return result;
                }
            }
            // Execute deactivation
            for (const layerId of deactivationPlan) {
                await this.deactivateLayerInternal(layerId, result);
            }
            // Execute activation
            for (const layerId of activationPlan.layers) {
                await this.activateLayerInternal(layerId, request, result);
            }
            // Update context weight
            this.currentContextWeight = this.calculateCurrentContextWeight();
            result.totalContextWeight = this.currentContextWeight;
            result.success = true;
            // Emit events
            this.emit('layersChanged', {
                activated: result.activatedLayers,
                deactivated: result.deactivatedLayers,
                contextWeight: this.currentContextWeight,
            });
            // Track history
            if (this.config.trackHistory) {
                this.trackActivation(request, result);
            }
        }
        catch (error) {
            result.errors.push(`Activation failed: ${error instanceof Error ? error.message : String(error)}`);
            this.logger.error('Layer activation failed', { error, request });
        }
        return result;
    }
    /**
     * Deactivate layers
     */
    async deactivateLayers(layerIds) {
        const result = {
            success: false,
            activatedLayers: [],
            deactivatedLayers: [],
            activatedTools: [],
            deactivatedTools: [],
            errors: [],
            warnings: [],
            totalContextWeight: this.currentContextWeight,
        };
        try {
            // Check for dependent layers
            const dependents = this.findDependentLayers(layerIds);
            if (dependents.length > 0) {
                result.warnings.push(`Deactivating dependent layers: ${dependents.join(', ')}`);
                layerIds.push(...dependents);
            }
            // Execute deactivation
            for (const layerId of layerIds) {
                await this.deactivateLayerInternal(layerId, result);
            }
            // Update context weight
            this.currentContextWeight = this.calculateCurrentContextWeight();
            result.totalContextWeight = this.currentContextWeight;
            result.success = true;
            // Emit events
            this.emit('layersChanged', {
                activated: [],
                deactivated: result.deactivatedLayers,
                contextWeight: this.currentContextWeight,
            });
        }
        catch (error) {
            result.errors.push(`Deactivation failed: ${error instanceof Error ? error.message : String(error)}`);
            this.logger.error('Layer deactivation failed', { error, layerIds });
        }
        return result;
    }
    /**
     * Get layer recommendations based on context
     */
    getRecommendations(context, limit = 3) {
        const recommendations = [];
        const contextLower = context.toLowerCase();
        // Analyze context for keywords and patterns
        const layerScores = new Map();
        for (const [layerId, layer] of this.layers) {
            if (this.activeLayers.has(layerId))
                continue;
            let score = 0;
            let relevantTools = [];
            // Check layer name and description
            if (layer.name.toLowerCase().includes(contextLower)) {
                score += 0.5;
            }
            if (layer.description.toLowerCase().includes(contextLower)) {
                score += 0.3;
            }
            // Check tools in layer
            for (const toolName of layer.tools) {
                if (toolName.toLowerCase().includes(contextLower)) {
                    score += 0.2;
                    relevantTools.push(toolName);
                }
            }
            // Boost score based on usage statistics
            const stats = this.layerStats.get(layerId);
            if (stats && stats.activationCount > 0) {
                score += Math.min(0.2, stats.activationCount / 100);
            }
            if (score > 0) {
                layerScores.set(layerId, score);
                recommendations.push({
                    layerId,
                    confidence: Math.min(1, score),
                    reason: this.generateRecommendationReason(layer, contextLower, relevantTools),
                    relevantTools,
                    contextWeight: layer.contextWeight,
                });
            }
        }
        // Sort by confidence and return top N
        recommendations.sort((a, b) => b.confidence - a.confidence);
        return recommendations.slice(0, limit);
    }
    /**
     * Get context pressure level
     */
    getContextPressure() {
        const ratio = this.currentContextWeight / this.config.maxContextWeight;
        if (ratio < 0.5)
            return ContextPressure.LOW;
        if (ratio < 0.75)
            return ContextPressure.MEDIUM;
        if (ratio < 0.9)
            return ContextPressure.HIGH;
        return ContextPressure.CRITICAL;
    }
    /**
     * Get layer statistics
     */
    getStatistics() {
        return new Map(this.layerStats);
    }
    /**
     * Get activation history
     */
    getHistory(limit) {
        if (limit) {
            return this.activationHistory.slice(-limit);
        }
        return [...this.activationHistory];
    }
    /**
     * Get active layers
     */
    getActiveLayers() {
        return Array.from(this.activeLayers)
            .map(id => this.layers.get(id))
            .filter((layer) => layer !== undefined);
    }
    /**
     * Check if a layer is active
     */
    isLayerActive(layerId) {
        return this.activeLayers.has(layerId);
    }
    /**
     * Get current context weight
     */
    getCurrentContextWeight() {
        return this.currentContextWeight;
    }
    /**
     * Build activation plan with dependency resolution
     */
    buildActivationPlan(layerIds, force) {
        const plan = new Set();
        const errors = [];
        const visited = new Set();
        const resolveDependencies = (layerId) => {
            if (visited.has(layerId))
                return;
            visited.add(layerId);
            const layer = this.layers.get(layerId);
            if (!layer) {
                errors.push(`Layer '${layerId}' not found`);
                return;
            }
            // Add dependencies first (depth-first)
            if (this.config.autoResolveDependencies) {
                for (const depId of layer.dependencies) {
                    if (!this.activeLayers.has(depId)) {
                        resolveDependencies(depId);
                    }
                }
            }
            plan.add(layerId);
        };
        for (const layerId of layerIds) {
            resolveDependencies(layerId);
        }
        return { layers: Array.from(plan), errors };
    }
    /**
     * Build deactivation plan based on exclusivity rules
     */
    buildDeactivationPlan(activatingLayers, respectExclusivity) {
        const toDeactivate = new Set();
        if (!respectExclusivity) {
            return [];
        }
        for (const layerId of activatingLayers) {
            const layer = this.layers.get(layerId);
            if (!layer)
                continue;
            if (layer.exclusivity === LayerExclusivity.EXCLUSIVE) {
                // Deactivate all other layers except permanent ones
                for (const activeId of this.activeLayers) {
                    const activeLayer = this.layers.get(activeId);
                    if (activeLayer &&
                        activeLayer.exclusivity !== LayerExclusivity.PERMANENT &&
                        !activatingLayers.includes(activeId)) {
                        toDeactivate.add(activeId);
                    }
                }
            }
            else if (layer.exclusivity === LayerExclusivity.SELECTIVE) {
                // Deactivate incompatible layers
                for (const activeId of this.activeLayers) {
                    if (!layer.compatibleLayers?.includes(activeId) &&
                        !activatingLayers.includes(activeId)) {
                        const activeLayer = this.layers.get(activeId);
                        if (activeLayer && activeLayer.exclusivity !== LayerExclusivity.PERMANENT) {
                            toDeactivate.add(activeId);
                        }
                    }
                }
            }
        }
        return Array.from(toDeactivate);
    }
    /**
     * Calculate projected context weight
     */
    calculateProjectedWeight(toActivate, toDeactivate) {
        let weight = this.currentContextWeight;
        for (const layerId of toDeactivate) {
            const layer = this.layers.get(layerId);
            if (layer) {
                weight -= layer.contextWeight;
            }
        }
        for (const layerId of toActivate) {
            if (!this.activeLayers.has(layerId)) {
                const layer = this.layers.get(layerId);
                if (layer) {
                    weight += layer.contextWeight;
                }
            }
        }
        return weight;
    }
    /**
     * Select layers for auto-deactivation
     */
    selectLayersForDeactivation(weightToFree, exclude) {
        const candidates = [];
        for (const layerId of this.activeLayers) {
            if (exclude.has(layerId))
                continue;
            const layer = this.layers.get(layerId);
            if (!layer || layer.exclusivity === LayerExclusivity.PERMANENT)
                continue;
            const stats = this.layerStats.get(layerId);
            const lastUsed = stats?.lastActivated?.getTime() || 0;
            const usageCount = stats?.activationCount || 0;
            // Score based on priority, last used, and usage count
            const score = layer.priority * 1000 +
                (Date.now() - lastUsed) / 1000 +
                (1000 / (usageCount + 1));
            candidates.push({ id: layerId, layer, score });
        }
        // Sort by score (higher = more likely to deactivate)
        candidates.sort((a, b) => b.score - a.score);
        const toDeactivate = [];
        let freedWeight = 0;
        for (const candidate of candidates) {
            toDeactivate.push(candidate.id);
            freedWeight += candidate.layer.contextWeight;
            if (freedWeight >= weightToFree)
                break;
        }
        return toDeactivate;
    }
    /**
     * Activate a layer internally
     */
    async activateLayerInternal(layerId, request, result) {
        const layer = this.layers.get(layerId);
        if (!layer) {
            result.errors.push(`Layer '${layerId}' not found`);
            return;
        }
        if (this.activeLayers.has(layerId)) {
            return; // Already active
        }
        // Update state
        layer.state = LayerState.ACTIVATING;
        this.activationQueue.add(layerId);
        try {
            // Simulate activation (in real implementation, this might involve async resource loading)
            await new Promise(resolve => setTimeout(resolve, 100));
            // Mark as active
            this.activeLayers.add(layerId);
            layer.state = LayerState.ACTIVE;
            result.activatedLayers.push(layerId);
            result.activatedTools.push(...Array.from(layer.tools));
            // Update statistics
            const stats = this.layerStats.get(layerId);
            stats.activationCount++;
            stats.lastActivated = new Date();
            this.logger.info('Layer activated', { layerId, tools: layer.tools.size });
        }
        catch (error) {
            layer.state = LayerState.ERROR;
            result.errors.push(`Failed to activate layer '${layerId}': ${error}`);
        }
        finally {
            this.activationQueue.delete(layerId);
        }
    }
    /**
     * Deactivate a layer internally
     */
    async deactivateLayerInternal(layerId, result) {
        const layer = this.layers.get(layerId);
        if (!layer || !this.activeLayers.has(layerId)) {
            return; // Not active or doesn't exist
        }
        if (layer.exclusivity === LayerExclusivity.PERMANENT) {
            result.warnings.push(`Cannot deactivate permanent layer '${layerId}'`);
            return;
        }
        // Update state
        layer.state = LayerState.DEACTIVATING;
        this.deactivationQueue.add(layerId);
        try {
            // Simulate deactivation
            await new Promise(resolve => setTimeout(resolve, 50));
            // Mark as inactive
            this.activeLayers.delete(layerId);
            layer.state = LayerState.INACTIVE;
            result.deactivatedLayers.push(layerId);
            result.deactivatedTools.push(...Array.from(layer.tools));
            this.logger.info('Layer deactivated', { layerId });
        }
        finally {
            this.deactivationQueue.delete(layerId);
        }
    }
    /**
     * Find layers that depend on the given layers
     */
    findDependentLayers(layerIds) {
        const dependents = [];
        for (const [id, layer] of this.layers) {
            if (!this.activeLayers.has(id))
                continue;
            for (const layerId of layerIds) {
                if (layer.dependencies.includes(layerId)) {
                    dependents.push(id);
                    break;
                }
            }
        }
        return dependents;
    }
    /**
     * Calculate current total context weight
     */
    calculateCurrentContextWeight() {
        let weight = 0;
        for (const layerId of this.activeLayers) {
            const layer = this.layers.get(layerId);
            if (layer) {
                weight += layer.contextWeight;
            }
        }
        return weight;
    }
    /**
     * Generate recommendation reason
     */
    generateRecommendationReason(layer, context, relevantTools) {
        const parts = [];
        if (layer.name.toLowerCase().includes(context)) {
            parts.push(`Layer name matches '${context}'`);
        }
        if (relevantTools.length > 0) {
            parts.push(`Contains relevant tools: ${relevantTools.slice(0, 3).join(', ')}`);
        }
        const stats = this.layerStats.get(layer.id);
        if (stats && stats.activationCount > 5) {
            parts.push(`Frequently used (${stats.activationCount} times)`);
        }
        return parts.join('. ') || `May be useful for '${context}' tasks`;
    }
    /**
     * Track activation in history
     */
    trackActivation(request, result) {
        const entry = {
            timestamp: new Date(),
            action: 'activated',
            layerId: request.layerIds.join(', '),
            reason: request.reason || 'Manual activation',
            requestedBy: request.requestedBy || 'unknown',
            contextWeight: this.currentContextWeight,
            success: result.success,
            error: result.errors.join('; ') || undefined,
        };
        this.activationHistory.push(entry);
        // Limit history size
        if (this.activationHistory.length > 1000) {
            this.activationHistory = this.activationHistory.slice(-500);
        }
    }
}
//# sourceMappingURL=layer-manager.js.map