#!/usr/bin/env node

/**
 * MCP Path Resolution Debug Script
 * Safe debugging without modifying existing code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function detectPlatform() {
  const platform = os.platform();
  const isWSL = process.env.WSL_DISTRO_NAME || (
    platform === 'linux' && fs.existsSync('/proc/version') &&
    fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')
  );
  
  return {
    platform,
    isWindows: platform === 'win32',
    isMacOS: platform === 'darwin',
    isLinux: platform === 'linux',
    isWSL: !!isWSL
  };
}

function debugGetBaseDirectory() {
  console.log('🔍 MCP Path Resolution Debug');
  console.log('='.repeat(50));
  
  const platform = detectPlatform();
  console.log(`Platform: ${platform.platform}${platform.isWSL ? ' (WSL)' : ''}`);
  console.log(`Process CWD: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`Home dir: ${os.homedir()}`);
  console.log('');
  
  // Simulate the exact logic from utils.ts
  const serverDir = path.dirname(__dirname); // From debug script location to project root
  
  const candidates = [
    process.env.REMOTION_PROJECTS_DIR,
    serverDir,
    path.join(os.homedir(), 'remotion-projects'),
    process.cwd()
  ];
  
  console.log('📋 Candidate Paths (in priority order):');
  candidates.forEach((candidate, index) => {
    if (candidate) {
      const assetsPath = path.join(candidate, 'assets', 'projects');
      const exists = fs.existsSync(assetsPath);
      const canRead = exists ? fs.readdirSync(assetsPath).length : 0;
      
      console.log(`${index + 1}. ${candidate}`);
      console.log(`   Assets path: ${assetsPath}`);
      console.log(`   Exists: ${exists ? '✅' : '❌'}`);
      console.log(`   Projects found: ${canRead}`);
      console.log('');
      
      if (exists) {
        console.log(`🎯 WINNER: This would be selected as base directory`);
        console.log(`Projects in this location:`);
        try {
          const projects = fs.readdirSync(assetsPath);
          projects.forEach(project => {
            const projectPath = path.join(assetsPath, project);
            const isDir = fs.statSync(projectPath).isDirectory();
            console.log(`   - ${project} ${isDir ? '(directory)' : '(file)'}`);
          });
        } catch (error) {
          console.log(`   Error reading: ${error.message}`);
        }
        return candidate;
      }
    }
  });
  
  console.log('❌ No existing projects directory found in any candidate path');
  console.log(`🔄 Would fallback to: ${process.cwd()}`);
  return process.cwd();
}

// Test environment variables
console.log('🌍 Environment Variables:');
console.log(`REMOTION_PROJECTS_DIR: ${process.env.REMOTION_PROJECTS_DIR || '[NOT SET]'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || '[NOT SET]'}`);
console.log(`MCP_DEBUG: ${process.env.MCP_DEBUG || '[NOT SET]'}`);
console.log('');

// Run path detection
const selectedPath = debugGetBaseDirectory();

console.log('');
console.log('🧪 Manual Path Tests:');

// Test specific paths manually
const testPaths = [
  'D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\rough-cut-mcp',
  '/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/rough-cut-mcp',
  path.resolve(__dirname, 'assets', 'projects'),
  path.join(os.homedir(), 'remotion-projects')
];

testPaths.forEach(testPath => {
  const assetsPath = path.join(testPath, 'assets', 'projects');
  const exists = fs.existsSync(assetsPath);
  const projectCount = exists ? fs.readdirSync(assetsPath).length : 0;
  
  console.log(`Path: ${testPath}`);
  console.log(`  Assets exists: ${exists ? '✅' : '❌'}`);
  console.log(`  Project count: ${projectCount}`);
  console.log('');
});

console.log('🔧 Recommendations:');
if (!process.env.REMOTION_PROJECTS_DIR) {
  console.log('1. Set REMOTION_PROJECTS_DIR environment variable');
  console.log('2. Or ensure MCP server runs from correct directory');
}
console.log('3. Check Claude Desktop logs for path resolution messages');
console.log('4. Verify Claude Desktop inherits environment variables correctly');