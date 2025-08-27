// Test the registry directly
import { EnhancedToolRegistry } from './build/services/enhanced-tool-registry.js';
import { ToolRegistry } from './build/services/tool-registry.js';
import { ToolCategory } from './build/types/tool-categories.js';

console.log('Testing tool registry directly...\n');

// Create a simple config
const config = {
  assetsDir: './assets',
  logging: { level: 'debug' }
};

// Test base registry
console.log('1. Testing base ToolRegistry:');
const baseRegistry = new ToolRegistry(config);

// Register a test tool
baseRegistry.registerTool(
  {
    name: 'test-tool',
    description: 'Test tool',
    inputSchema: { type: 'object', properties: {} }
  },
  () => {},
  {
    name: 'test-tool',
    category: ToolCategory.DISCOVERY,
    subCategory: 'test',
    tags: ['test'],
    loadByDefault: true,
    priority: 0,
    estimatedTokens: 10
  }
);

const baseActiveTools = baseRegistry.getActiveTools();
console.log('Base registry active tools:', baseActiveTools.length);
console.log('Base registry state:', {
  allTools: baseRegistry.state?.allTools?.size,
  activeTools: baseRegistry.state?.activeTools?.size,
  alwaysActive: baseRegistry.alwaysActiveTools?.size
});

// Test enhanced registry
console.log('\n2. Testing EnhancedToolRegistry:');
const enhancedRegistry = new EnhancedToolRegistry({
  baseConfig: config,
  enableLayers: true,
  enableDependencies: true,
  enableContextManagement: true,
  enableAudit: true,
  maxContextWeight: 10000
});

// Register a test tool
enhancedRegistry.registerTool(
  {
    name: 'test-tool-enhanced',
    description: 'Test tool enhanced',
    inputSchema: { type: 'object', properties: {} }
  },
  () => {},
  {
    name: 'test-tool-enhanced',
    category: ToolCategory.DISCOVERY,
    subCategory: 'test',
    tags: ['test'],
    loadByDefault: true,
    priority: 0,
    estimatedTokens: 10
  }
);

const enhancedActiveTools = enhancedRegistry.getActiveTools();
console.log('Enhanced registry active tools:', enhancedActiveTools.length);
console.log('Enhanced registry state:', {
  allTools: enhancedRegistry.state?.allTools?.size,
  activeTools: enhancedRegistry.state?.activeTools?.size,
  alwaysActive: enhancedRegistry.alwaysActiveTools?.size
});

console.log('\nTest complete');
process.exit(0);