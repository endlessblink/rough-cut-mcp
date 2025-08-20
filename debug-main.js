#!/usr/bin/env node

// Debug script to check why main() isn't running
console.error('Debug: Checking main module detection');
console.error('process.argv[1]:', process.argv[1]);

// Set process.argv[1] to match what we expect
process.argv[1] = '/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut/build/index.js';

console.error('Modified process.argv[1]:', process.argv[1]);

// Now import the server
import('./build/index.js').then(() => {
  console.error('Server imported');
  
  // Wait a bit to see if it starts
  setTimeout(() => {
    console.error('Test complete');
    process.exit(0);
  }, 2000);
}).catch(err => {
  console.error('Import failed:', err);
});