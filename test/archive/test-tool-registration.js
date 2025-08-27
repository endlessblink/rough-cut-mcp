// Test tool registration to see what's happening
(async () => {
  console.log('🔍 Testing tool registration...\n');
  
  try {
    console.log('Importing server...');
    await import('./build/index.js');
    console.log('Server imported successfully');
    
    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Test complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();