/**
 * Enhanced Tool Registry with Advanced Management Features
 *
 * Integrates LayerManager, DependencyResolver, ContextManager, and AuditLogger
 * for comprehensive tool management with minimal changes to existing code.
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolMetadata, ToolActivationRequest } from '../types/tool-categories.js';
import { ToolRegistry } from './tool-registry.js';
import { OptimizationStrategy } from './context-manager.js';
/**
 * Enhanced configuration options
 */
export interface EnhancedRegistryConfig {
    /** Base configuration */
    baseConfig: any;
    /** Enable layer management */
    enableLayers?: boolean;
    /** Enable dependency resolution */
    enableDependencies?: boolean;
    /** Enable context management */
    enableContextManagement?: boolean;
    /** Enable audit logging */
    enableAudit?: boolean;
    /** Maximum context weight */
    maxContextWeight?: number;
    /** Context optimization strategy */
    contextStrategy?: OptimizationStrategy;
    /** Audit directory */
    auditDir?: string;
}
/**
 * Enhanced Tool Registry with integrated advanced features
 */
export declare class EnhancedToolRegistry extends ToolRegistry {
    private layerManager?;
    private dependencyResolver?;
    private contextManager?;
    private auditLogger?;
    private enhancedConfig;
    private toolToLayer;
    constructor(config: EnhancedRegistryConfig);
    /**
     * Initialize enhanced services
     */
    private initializeServices;
    /**
     * Set up default layers based on tool categories
     */
    private setupDefaultLayers;
    /**
     * Override registerTool to integrate with enhanced services
     */
    registerTool(tool: Tool, handler: Function, metadata: ToolMetadata): void;
    /**
     * Enhanced tool activation with dependency resolution
     */
    activateToolsEnhanced(request: ToolActivationRequest): Promise<{
        success: boolean;
        activated: string[];
        deactivated: string[];
        dependencies: string[];
        message: string;
        contextWeight?: number;
    }>;
    /**
     * Get tool handler with enhanced tracking
     */
    getToolHandler(toolName: string): Function | undefined;
    /**
     * Safe getter with explicit type assertion after check
     * Override parent's safe getter to ensure proper handler retrieval
     */
    getToolHandlerSafe(toolName: string): Function | undefined;
    /**
     * Handle layer change events
     */
    private handleLayerChange;
    /**
     * Handle context pressure changes
     */
    private handleContextPressure;
    /**
     * Handle context optimization
     */
    private handleContextOptimization;
    /**
     * Get enhanced statistics
     */
    getEnhancedStatistics(): {
        base: any;
        layers?: any;
        dependencies?: any;
        context?: any;
        audit?: any;
    };
    /**
     * Get recommendations based on context
     */
    getRecommendations(context: string): {
        tools: string[];
        layers?: any[];
    };
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=enhanced-tool-registry.d.ts.map