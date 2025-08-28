const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

console.log('🎯 Creating bundled version for npm global install...\n');

const projectRoot = path.join(__dirname, '..');

// External modules that shouldn't be bundled (Node.js built-ins)
const external = [
  'fs',
  'path',
  'os',
  'child_process',
  'util',
  'stream',
  'events',
  'crypto',
  'url',
  'http',
  'https',
  'net',
  'tls',
  'readline',
  'zlib',
  'assert',
  'buffer',
  'console',
  'process',
  'worker_threads',
  'perf_hooks',
  'fs/promises',
  'path/posix',
  'path/win32'
];

async function bundle() {
  try {
    // First, compile TypeScript to get fresh build
    console.log('📦 Compiling TypeScript...');
    const { execSync } = require('child_process');
    execSync('npx tsc', { cwd: projectRoot, stdio: 'inherit' });
    
    console.log('\n📦 Bundling with dependencies...');
    
    // Bundle into ESM format since our code uses import/export
    const result = await esbuild.build({
      entryPoints: [path.join(projectRoot, 'build/index.js')],
      outfile: path.join(projectRoot, 'build/index.bundled.mjs'),
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      external,
      minify: false,
      sourcemap: false,
      metafile: true,
      logLevel: 'warning',
      banner: {
        js: `// Rough Cut MCP Server - Bundled Version ${new Date().toISOString()}
// This file includes all dependencies for global npm installation
`
      }
    });

    // Create a CommonJS wrapper that loads the ESM bundle
    const wrapperContent = `#!/usr/bin/env node
// CommonJS wrapper for ESM bundle
// This allows the package to work when installed globally via npm

(async () => {
  try {
    // Dynamic import of the ESM bundle
    await import('./index.bundled.mjs');
  } catch (error) {
    console.error('Failed to start MCP server:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
`;

    // Write the wrapper
    const wrapperPath = path.join(projectRoot, 'build/index.wrapper.js');
    fs.writeFileSync(wrapperPath, wrapperContent);
    
    // Calculate bundle size
    const bundleStats = fs.statSync(path.join(projectRoot, 'build/index.bundled.mjs'));
    const bundleSize = (bundleStats.size / 1024 / 1024).toFixed(2);
    
    console.log('\n✅ Bundle created successfully!');
    console.log(`📊 Bundle size: ${bundleSize} MB`);
    console.log('📝 Files created:');
    console.log('   - build/index.bundled.mjs (ESM bundle with all dependencies)');
    console.log('   - build/index.wrapper.js (CommonJS wrapper for npm global)');
    console.log('\n🚀 Ready for npm publish!');
    
  } catch (error) {
    console.error('❌ Bundle failed:', error);
    process.exit(1);
  }
}

bundle();