// Simple test to see server errors
process.env.NODE_ENV = 'test';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

(async () => {
  console.error('Starting server test...');
  try {
    await import('./build/index.js');
    console.error('Server imported successfully');
    
    setTimeout(() => {
      console.error('Exiting after 2 seconds...');
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
})();