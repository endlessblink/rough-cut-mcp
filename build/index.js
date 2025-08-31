"use strict";
// RoughCut MCP Server - Simple & Working Edition
// Focuses on core functionality that actually works instead of complex abstractions
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const tools_js_1 = require("./tools.js");
/**
 * Simple MCP Server - No layers, no registries, just working tools
 */
class SimpleMCPServer {
    server;
    constructor() {
        this.server = new index_js_1.Server({
            name: 'rough-cut-mcp',
            version: '4.5.0',
            description: 'Simple & Reliable Video Creation MCP - Actually Works!'
        }, {
            capabilities: { tools: {} }
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // Initialize
        this.server.setRequestHandler(types_js_1.InitializeRequestSchema, async () => {
            return {
                protocolVersion: '2025-06-18',
                capabilities: { tools: {} },
                serverInfo: {
                    name: 'rough-cut-mcp',
                    version: '4.5.0',
                    description: 'Simple & Reliable Video Creation MCP'
                }
            };
        });
        // Initialized notification
        this.server.setRequestHandler(types_js_1.InitializedNotificationSchema, async () => {
            return {};
        });
        // List tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return { tools: (0, tools_js_1.getTools)() };
        });
        // Call tool
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const result = await (0, tools_js_1.handleToolCall)(name, args || {});
                return result;
            }
            catch (error) {
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Error in ${name}: ${error instanceof Error ? error.message : String(error)}`
                        }],
                    isError: true
                };
            }
        });
    }
    start() {
        const transport = new stdio_js_1.StdioServerTransport();
        this.server.connect(transport);
    }
}
// Start the server
function main() {
    try {
        const server = new SimpleMCPServer();
        server.start();
    }
    catch (error) {
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map