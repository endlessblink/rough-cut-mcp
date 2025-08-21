#!/usr/bin/env node

// Quick test to verify server is running the right version
import { createVideoCreationTools } from './build/tools/video-creation.js';

console.log("🔍 Testing Server Version...\n");

// Create tools with dummy config
const tools = createVideoCreationTools({
  assetsDir: '/tmp',
  apiKeys: {},
  apiEndpoints: { elevenlabs: '', flux: '' },
  remotion: { concurrency: 1, timeout: 60000 },
  fileManagement: { cleanupTempFiles: true, maxAssetAgeHours: 24 },
  logging: { level: 'info' }
});

const videoTool = tools.find(t => t.name === 'create-complete-video');

console.log("✅ Tool Description Check:");
console.log("Has 'ATTENTION CLAUDE':", videoTool.description.includes('ATTENTION CLAUDE'));
console.log("Has 'MANDATORY STEPS':", videoTool.description.includes('MANDATORY STEPS'));

console.log("\n✅ Schema Check:");
console.log("Required fields:", videoTool.inputSchema.required);
console.log("Has compositionCode:", !!videoTool.inputSchema.properties.compositionCode);

console.log("\n✅ compositionCode Property:");
console.log("Description:", videoTool.inputSchema.properties.compositionCode?.description?.substring(0, 50) + "...");

if (videoTool.description.includes('ATTENTION CLAUDE') && 
    videoTool.inputSchema.required.includes('compositionCode')) {
  console.log("\n🎉 SUCCESS: Server has the NEW version with fixes!");
} else {
  console.log("\n❌ PROBLEM: Server is still running OLD version!");
  console.log("   You need to restart the MCP server in Claude Desktop.");
}