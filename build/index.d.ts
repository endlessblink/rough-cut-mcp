#!/usr/bin/env node
import { ToolRegistry } from './services/tool-registry.js';
/**
 * Main server class for Remotion Creative MCP Server
 */
declare class RemotionCreativeMCPServer {
    private server;
    private config;
    private logger;
    private fileManager;
    private toolRegistry;
    private toolHandlers;
    private tools;
    constructor();
    /**
     * Initialize the server and register all tools
     */
    initialize(): Promise<void>;
    /**
     * Validate configuration and environment
     */
    private validateConfiguration;
    /**
     * Register all MCP tools
     */
    private registerTools;
    /**
     * Get asset management handlers
     */
    private getAssetHandlers;
    /**
     * Register asset management tools
     */
    private registerAssetManagementTools;
    /**
     * Get asset management tool definitions
     */
    private getAssetManagementTools;
    /**
     * Set up MCP request handlers
     */
    private setupRequestHandlers;
    /**
     * Connect transport immediately for MCP communication
     */
    connectTransport(): void;
    /**
     * Get registered tools (for testing)
     */
    getTools(): import("zod").objectOutputType<{
        name: import("zod").ZodString;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        inputSchema: import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, import("zod").ZodTypeAny, "passthrough">>;
    }, import("zod").ZodTypeAny, "passthrough">[];
    /**
     * Get tool handlers (for testing)
     */
    getToolHandlers(): {};
    /**
     * Get tool registry (for advanced testing)
     */
    getToolRegistry(): ToolRegistry;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
export { RemotionCreativeMCPServer };
//# sourceMappingURL=index.d.ts.map