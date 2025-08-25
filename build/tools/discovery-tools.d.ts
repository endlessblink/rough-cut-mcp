/**
 * Discovery Tools for Dynamic Tool Management
 *
 * These tools are always exposed and allow LLMs to discover and activate
 * other tools on demand, implementing the layered architecture pattern.
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from '../services/tool-registry.js';
import { ToolMetadata } from '../types/tool-categories.js';
/**
 * Create discovery tools that are always available
 */
export declare function createDiscoveryTools(registry: ToolRegistry): Tool[];
/**
 * Create handlers for discovery tools
 */
export declare function createDiscoveryHandlers(registry: ToolRegistry): Record<string, Function>;
/**
 * Get metadata for discovery tools
 */
export declare function getDiscoveryToolsMetadata(): ToolMetadata[];
//# sourceMappingURL=discovery-tools.d.ts.map