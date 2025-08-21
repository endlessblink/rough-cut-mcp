#!/usr/bin/env node

// Direct test of the build file
console.error('Starting direct test...');
console.error('process.argv[1]:', process.argv[1]);

// Import and run the server directly
import('./build/index.js').then(() => {
  console.error('Server imported successfully');
}).catch(err => {
  console.error('Failed to import server:', err);
});