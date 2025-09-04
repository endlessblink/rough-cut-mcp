const { handleToolCall } = require('./build/tools');

// Simulate MCP edit_project call with layout intelligence
async function applyLayoutFixes() {
  console.log('🎯 Applying layout intelligence fixes to endlessblink-showcase...');
  
  try {
    const result = await handleToolCall('edit_project', {
      name: 'endlessblink-showcase',
      instruction: 'Apply layout intelligence fixes to resolve the 84px font with 60 character text causing massive overlap. Use AST design prism to automatically detect and fix font sizing and layout issues, especially the main title ENDLESSBLINK that needs responsive sizing. Focus on making the title text responsive and preventing overlap with other elements.',
      jsx: '', // Will use existing JSX and enhance it
      use_resumption: false // Disable to avoid complications
    });
    
    console.log('✅ Layout fixes applied successfully!');
    console.log('\n📊 Results:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error applying layout fixes:', error.message);
    console.error(error.stack);
  }
}

applyLayoutFixes();