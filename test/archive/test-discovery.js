// Quick test for discovery tool registration
process.env.NODE_ENV = 'test';

import('./build/index.js').then(() => {
  console.log('Import complete');
  setTimeout(() => {
    console.log('Exiting...');
    process.exit(0);
  }, 1000);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});