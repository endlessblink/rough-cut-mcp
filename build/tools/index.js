"use strict";
/**
 * Consolidated MCP Tools - Clean, Efficient Implementation
 * ~20 powerful tools replacing 70+ individual tools
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDiscoveryTools = exports.registerAssetTools = exports.registerCreationTools = exports.registerCoreTools = void 0;
exports.registerAllTools = registerAllTools;
var core_tools_js_1 = require("./core-tools.js");
Object.defineProperty(exports, "registerCoreTools", { enumerable: true, get: function () { return core_tools_js_1.registerCoreTools; } });
var creation_tools_js_1 = require("./creation-tools.js");
Object.defineProperty(exports, "registerCreationTools", { enumerable: true, get: function () { return creation_tools_js_1.registerCreationTools; } });
var asset_tools_js_1 = require("./asset-tools.js");
Object.defineProperty(exports, "registerAssetTools", { enumerable: true, get: function () { return asset_tools_js_1.registerAssetTools; } });
var discovery_tools_js_1 = require("./discovery-tools.js");
Object.defineProperty(exports, "registerDiscoveryTools", { enumerable: true, get: function () { return discovery_tools_js_1.registerDiscoveryTools; } });
/**
 * Register all consolidated tools
 */
async function registerAllTools(server) {
    const { registerCoreTools } = await import('./core-tools.js');
    const { registerCreationTools } = await import('./creation-tools.js');
    const { registerAssetTools } = await import('./asset-tools.js');
    const { registerDiscoveryTools } = await import('./discovery-tools.js');
    // Register tools in priority order
    registerDiscoveryTools(server); // Always active (3 tools)
    registerCoreTools(server); // Core operations (4 tools)
    registerCreationTools(server); // Video creation (4 tools)
    registerAssetTools(server); // Asset management (5 tools)
    server.logger.info('Consolidated tools registered', {
        totalTools: 16,
        categories: ['discovery', 'core', 'creation', 'assets']
    });
}
//# sourceMappingURL=index.js.map