/**
 * Enhanced Tool Registry with Advanced Management Features
 *
 * Integrates LayerManager, DependencyResolver, ContextManager, and AuditLogger
 * for comprehensive tool management with minimal changes to existing code.
 */
import { ToolCategory, TOOL_CATEGORIES, } from '../types/tool-categories.js';
import { LayerExclusivity, LayerState, } from '../types/layer-types.js';
import { ToolRegistry } from './tool-registry.js';
import { LayerManager } from './layer-manager.js';
import { DependencyResolver } from './dependency-resolver.js';
import { ContextManager, OptimizationStrategy } from './context-manager.js';
import { AuditLogger, AuditEventType, AuditSeverity } from './audit-logger.js';
import * as path from 'path';
/**
 * Enhanced Tool Registry with integrated advanced features
 */
export class EnhancedToolRegistry extends ToolRegistry {
    layerManager;
    dependencyResolver;
    contextManager;
    auditLogger;
    enhancedConfig;
    // Remove duplicate logger - use inherited one
    toolToLayer;
    constructor(config) {
        // Initialize base registry
        super(config.baseConfig);
        this.enhancedConfig = config;
        this.toolToLayer = new Map();
        // Initialize enhanced services if enabled
        this.initializeServices();
        // Set up default layers if layer management is enabled
        if (this.layerManager) {
            this.setupDefaultLayers();
        }
        this.logger.info('Enhanced Tool Registry initialized', {
            layers: config.enableLayers,
            dependencies: config.enableDependencies,
            context: config.enableContextManagement,
            audit: config.enableAudit,
        });
    }
    /**
     * Initialize enhanced services
     */
    initializeServices() {
        // Initialize Layer Manager
        if (this.enhancedConfig.enableLayers) {
            this.layerManager = new LayerManager({
                maxContextWeight: this.enhancedConfig.maxContextWeight || 10000,
                autoDeactivate: true,
                autoResolveDependencies: this.enhancedConfig.enableDependencies !== false,
                enforceExclusivity: true,
                activationTimeout: 5000,
                trackHistory: true,
            });
            // Listen to layer events
            this.layerManager.on('layersChanged', (event) => {
                this.handleLayerChange(event);
            });
        }
        // Initialize Dependency Resolver
        if (this.enhancedConfig.enableDependencies) {
            this.dependencyResolver = new DependencyResolver();
        }
        // Initialize Context Manager
        if (this.enhancedConfig.enableContextManagement) {
            this.contextManager = new ContextManager({
                maxWeight: this.enhancedConfig.maxContextWeight || 10000,
                warningThreshold: 0.75,
                criticalThreshold: 0.9,
                strategy: this.enhancedConfig.contextStrategy || OptimizationStrategy.SMART,
                autoOptimize: true,
                minRetentionTime: 60000,
            });
            // Listen to context events
            this.contextManager.on('pressureChange', (event) => {
                this.handleContextPressure(event);
            });
            this.contextManager.on('optimized', (event) => {
                this.handleContextOptimization(event);
            });
        }
        // Initialize Audit Logger
        if (this.enhancedConfig.enableAudit) {
            const auditDir = this.enhancedConfig.auditDir ||
                path.join(this.enhancedConfig.baseConfig.assetsDir, 'audit');
            this.auditLogger = new AuditLogger(auditDir, 10000, 60000);
        }
    }
    /**
     * Set up default layers based on tool categories
     */
    setupDefaultLayers() {
        if (!this.layerManager)
            return;
        // Create layers for each category
        for (const [categoryId, categoryInfo] of Object.entries(TOOL_CATEGORIES)) {
            const layer = {
                id: categoryId,
                name: categoryInfo.name,
                description: categoryInfo.description,
                categories: [categoryId],
                exclusivity: categoryId === ToolCategory.DISCOVERY
                    ? LayerExclusivity.PERMANENT
                    : LayerExclusivity.NONE,
                dependencies: [],
                contextWeight: categoryInfo.estimatedTokens || 1000,
                priority: categoryInfo.loadByDefault ? 1 : 5,
                loadByDefault: categoryInfo.loadByDefault,
                state: LayerState.INACTIVE,
                tools: new Set(),
                requiredApiKeys: categoryInfo.requiredApiKeys,
            };
            this.layerManager.defineLayer(layer);
        }
        // Activate default layers
        this.layerManager.activateLayers({
            layerIds: [ToolCategory.DISCOVERY, ToolCategory.CORE_OPERATIONS],
            reason: 'Initial setup',
            requestedBy: 'system',
        });
    }
    /**
     * Override registerTool to integrate with enhanced services
     */
    registerTool(tool, handler, metadata) {
        // Call parent implementation
        super.registerTool(tool, handler, metadata);
        // Register with dependency resolver
        if (this.dependencyResolver && metadata.dependencies) {
            this.dependencyResolver.registerNode(tool.name, metadata.dependencies, { category: metadata.category, priority: metadata.priority });
        }
        // Add to layer
        if (this.layerManager) {
            const layerId = metadata.category;
            const layer = this.layerManager['layers'].get(layerId);
            if (layer) {
                layer.tools.add(tool.name);
                this.toolToLayer.set(tool.name, layerId);
            }
        }
        // Add to context manager
        if (this.contextManager) {
            this.contextManager.addItem(tool.name, 'tool', metadata.estimatedTokens || 100, metadata.priority || 5, metadata.loadByDefault);
        }
        // Log registration
        if (this.auditLogger) {
            this.auditLogger.logEvent({
                type: AuditEventType.CONFIGURATION_CHANGED,
                severity: AuditSeverity.DEBUG,
                entity: tool.name,
                action: 'Tool registered',
                triggeredBy: 'system',
                context: {
                    category: metadata.category,
                    priority: metadata.priority,
                    dependencies: metadata.dependencies,
                },
            });
        }
    }
    /**
     * Enhanced tool activation with dependency resolution
     */
    async activateToolsEnhanced(request) {
        const startTime = Date.now();
        const result = {
            success: false,
            activated: [],
            deactivated: [],
            dependencies: [],
            message: '',
            contextWeight: 0,
        };
        try {
            // Resolve dependencies if enabled
            let toolsToActivate = request.tools || [];
            if (this.dependencyResolver && toolsToActivate.length > 0) {
                const resolution = this.dependencyResolver.resolve(toolsToActivate);
                if (!resolution.success) {
                    result.message = `Dependency resolution failed: ${resolution.errors.join(', ')}`;
                    this.logger.error(result.message);
                    return result;
                }
                // Add resolved dependencies
                result.dependencies = resolution.order.filter(t => !toolsToActivate.includes(t));
                toolsToActivate = resolution.order;
            }
            // Check context weight if enabled
            if (this.contextManager) {
                const additionalWeight = toolsToActivate.reduce((sum, toolName) => {
                    const tool = this.state.allTools.get(toolName);
                    return sum + (tool?.metadata.estimatedTokens || 100);
                }, 0);
                if (!this.contextManager.canAdd(additionalWeight)) {
                    // Try to optimize
                    const optimization = this.contextManager.optimize();
                    result.deactivated.push(...optimization.removed);
                    if (!this.contextManager.canAdd(additionalWeight)) {
                        result.message = 'Cannot activate tools: context weight limit exceeded';
                        return result;
                    }
                }
            }
            // Activate tools using parent implementation
            const baseResult = super.activateTools({
                ...request,
                tools: toolsToActivate,
            });
            result.activated = baseResult.activated;
            result.deactivated.push(...baseResult.deactivated);
            result.success = baseResult.success;
            result.message = baseResult.message;
            // Update context manager
            if (this.contextManager) {
                for (const toolName of result.activated) {
                    const tool = this.state.allTools.get(toolName);
                    if (tool) {
                        this.contextManager.markUsed(toolName);
                    }
                }
                // Get current weight from context manager's statistics
                const stats = this.contextManager.getStatistics();
                result.contextWeight = stats.totalWeight;
            }
            // Log activation
            if (this.auditLogger) {
                for (const toolName of result.activated) {
                    this.auditLogger.logToolActivation(toolName, 'user', {
                        dependencies: result.dependencies,
                        contextWeight: result.contextWeight,
                    });
                }
            }
            const duration = Date.now() - startTime;
            this.logger.info('Enhanced tool activation completed', {
                ...result,
                duration,
            });
        }
        catch (error) {
            result.message = `Activation failed: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error('Enhanced activation failed', { error });
            if (this.auditLogger) {
                this.auditLogger.logEvent({
                    type: AuditEventType.TOOL_FAILED,
                    severity: AuditSeverity.ERROR,
                    entity: 'system',
                    action: 'Tool activation failed',
                    triggeredBy: 'user',
                    context: { request },
                    error: result.message,
                });
            }
        }
        return result;
    }
    /**
     * Get tool handler with enhanced tracking
     */
    getToolHandler(toolName) {
        const handler = super.getToolHandler(toolName);
        if (handler && this.contextManager) {
            this.contextManager.markUsed(toolName);
        }
        return handler;
    }
    /**
     * Handle layer change events
     */
    handleLayerChange(event) {
        this.logger.info('Layer change detected', event);
        // Update active tools based on layer changes
        for (const layerId of event.activated) {
            const layer = this.layerManager?.['layers'].get(layerId);
            if (layer) {
                for (const toolName of layer.tools) {
                    this.state.activeTools.add(toolName);
                }
            }
        }
        for (const layerId of event.deactivated) {
            const layer = this.layerManager?.['layers'].get(layerId);
            if (layer) {
                for (const toolName of layer.tools) {
                    this.state.activeTools.delete(toolName);
                }
            }
        }
    }
    /**
     * Handle context pressure changes
     */
    handleContextPressure(event) {
        this.logger.debug('Context pressure changed', event);
        if (event.pressure === 'critical' && this.auditLogger) {
            this.auditLogger.logEvent({
                type: AuditEventType.CONTEXT_OPTIMIZED,
                severity: AuditSeverity.WARNING,
                entity: 'context',
                action: 'Critical context pressure detected',
                triggeredBy: 'system',
                context: event,
            });
        }
    }
    /**
     * Handle context optimization
     */
    handleContextOptimization(event) {
        this.logger.info('Context optimized', event);
        // Deactivate tools that were removed
        for (const toolName of event.removed) {
            this.state.activeTools.delete(toolName);
            if (this.auditLogger) {
                this.auditLogger.logToolDeactivation(toolName, 'system', 'Context optimization');
            }
        }
    }
    /**
     * Get enhanced statistics
     */
    getEnhancedStatistics() {
        return {
            base: super.getUsageStatistics(),
            layers: this.layerManager?.getStatistics(),
            dependencies: this.dependencyResolver?.getStatistics(),
            context: this.contextManager?.getStatistics(),
            audit: this.auditLogger?.getStatistics(),
        };
    }
    /**
     * Get recommendations based on context
     */
    getRecommendations(context) {
        const tools = super.getSuggestions(context);
        const layers = this.layerManager?.getRecommendations(context, 3);
        return { tools, layers };
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        if (this.auditLogger) {
            await this.auditLogger.endSession();
        }
        this.logger.info('Enhanced Tool Registry cleaned up');
    }
}
//# sourceMappingURL=enhanced-tool-registry.js.map