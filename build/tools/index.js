/**
 * Consolidated MCP Tools - Clean, Efficient Implementation
 * ~20 powerful tools replacing 70+ individual tools
 */
export { registerCoreTools } from './core-tools.js';
export { registerCreationTools } from './creation-tools.js';
export { registerAssetTools } from './asset-tools.js';
export { registerDiscoveryTools } from './discovery-tools.js';
/**
 * Register all consolidated tools
 */
export async function registerAllTools(server) {
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