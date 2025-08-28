#!/usr/bin/env node

import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

console.log('🎯 Bundling Rough Cut MCP into single file...\n');

// Read package.json to get dependencies
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

// External dependencies that should NOT be bundled (Node.js built-ins)
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
  'perf_hooks'
];

async function bundle() {
  try {
    // Bundle everything into a single CommonJS file
    const result = await build({
      entryPoints: [join(projectRoot, 'build/index.js')],
      outfile: join(projectRoot, 'build/index.bundled.js'),
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs', // Use CommonJS format for better compatibility
      external,
      minify: false, // Keep readable for debugging
      sourcemap: false,
      metafile: true,
      logLevel: 'info',
      banner: {
        js: '// Rough Cut MCP Server - Bundled Version\n// This file includes all dependencies for global npm installation\n'
      }
    });

    // Write metafile for debugging
    writeFileSync(
      join(projectRoot, 'build/bundle-meta.json'),
      JSON.stringify(result.metafile, null, 2)
    );

    // Calculate bundle size
    const inputs = Object.keys(result.metafile.inputs);
    const outputs = Object.values(result.metafile.outputs);
    const bundleSize = outputs[0]?.bytes || 0;

    console.log('✅ Bundle created successfully!\n');
    console.log('📊 Bundle Statistics:');
    console.log(`  - Input files: ${inputs.length}`);
    console.log(`  - Bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Output: build/index.bundled.js`);
    console.log('\n📦 All dependencies included in single file');
    console.log('🚀 Ready for global npm installation!\n');

  } catch (error) {
    console.error('❌ Bundle failed:', error);
    process.exit(1);
  }
}

bundle();