// Platform check script - prevents WSL2 builds and provides platform guidance
// Optimized for Windows, experimental macOS support

import fs from 'fs';
import os from 'os';

// Multiple detection methods for WSL2 reliability - but allow CI environments
const isActualWSL2 = process.platform === 'linux' && 
  !process.env.GITHUB_ACTIONS && 
  !process.env.CI &&
  (
    fs.existsSync('/mnt/c') || 
    os.release().toLowerCase().includes('microsoft') ||
    process.env.WSL_DISTRO_NAME
  );

// Only block actual WSL2, not CI/GitHub Actions environments
if (isActualWSL2 && process.env.NODE_ENV !== 'test') {
  console.error('❌ ERROR: Building from WSL2 detected!');
  console.error('');
  console.error('This MCP server must be built on Windows for Claude Desktop integration.');
  console.error('WSL2 builds create incompatible paths that break Windows execution.');
  console.error('');
  console.error('📝 Instructions:');
  console.error('  1. Open Windows PowerShell or CMD (not WSL2 terminal)');
  console.error('  2. Navigate to: D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut');
  console.error('  3. Run: npm run build');
  console.error('');
  console.error('Note: You can still edit files in WSL2/VS Code, but building must happen on Windows.');
  process.exit(1);
} else if (isActualWSL2 && process.env.NODE_ENV === 'test') {
  console.log('🧪 TEST MODE: WSL2 build allowed for debugging');
} else if (process.env.GITHUB_ACTIONS || process.env.CI) {
  console.log('🤖 CI Environment detected: Platform checks relaxed for automated testing');
}

// Platform-specific guidance
switch (process.platform) {
  case 'win32':
    console.log('✅ Platform check passed: Building on Windows (primary platform)');
    break;
    
  case 'darwin':
    console.log('🍎 macOS detected: Experimental support enabled');
    console.log('');
    console.log('ℹ️  macOS Usage Notes:');
    console.log('  • Windows is the primary platform with full feature support');
    console.log('  • macOS compatibility is experimental for sharing purposes');
    console.log('  • Some features (like Remotion Studio integration) may have limitations');
    console.log('  • Refer to README.md macOS Installation section for setup instructions');
    console.log('');
    break;
    
  case 'linux':
    console.log('🐧 Linux detected: Limited compatibility');
    console.log('');
    console.log('⚠️  Linux Usage Notes:');
    console.log('  • This MCP server is optimized for Windows Claude Desktop');
    console.log('  • macOS has experimental support, but Linux is untested');
    console.log('  • Build may succeed but runtime compatibility is not guaranteed');
    console.log('  • For best results, use Windows or macOS');
    console.log('');
    break;
    
  default:
    console.log(`❓ Unknown platform detected: ${process.platform}`);
    console.log('');
    console.log('⚠️  Platform Support:');
    console.log('  • Primary: Windows (full support)');
    console.log('  • Experimental: macOS (sharing compatibility)');
    console.log('  • Unsupported: Other platforms');
    console.log('');
    console.log('Proceeding with build, but runtime compatibility is not guaranteed...');
    break;
}