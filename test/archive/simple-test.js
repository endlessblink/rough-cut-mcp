// Simple test to see if the built server loads
import('./build/index.js')
  .then(() => {
    console.log('✅ Server module loaded successfully');
  })
  .catch((error) => {
    console.log('❌ Server module failed to load:', error.message);
    console.log('Stack:', error.stack);
  });