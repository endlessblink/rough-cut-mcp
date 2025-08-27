(async () => {
  // Minimal test to see if the server even starts
  console.error('Starting minimal test...');

  try {
    console.error('About to import...');
    await import('./build/index.js');
    console.error('Import successful - waiting...');
    
    // Keep process alive
    setInterval(() => {
      console.error('Heartbeat...');
    }, 1000);
  } catch (error) {
    console.error('Import failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();