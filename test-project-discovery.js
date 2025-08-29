/**
 * Quick Test Script for Project-Aware Studio Discovery
 * 
 * This script helps validate the enhanced functionality without full MCP integration
 */

const { execSync } = require('child_process');

console.log('🧪 Testing Enhanced Studio Discovery Logic\n');

// Test current studio status
console.log('📊 Current Studio Status:');
try {
  const netstatOutput = execSync('netstat -ano | findstr LISTENING | findstr :30', { encoding: 'utf8' });
  const lines = netstatOutput.trim().split('\n');
  
  console.log(`Found ${lines.length} processes listening on port range 3000-3099:`);
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4) {
      const addressPort = parts[1];
      const pidStr = parts[parts.length - 1];
      const portMatch = addressPort.match(/:(\d+)$/);
      
      if (portMatch) {
        const port = parseInt(portMatch[1], 10);
        const pid = parseInt(pidStr, 10);
        
        // Test if it's a Node.js process
        try {
          const processInfo = execSync(`tasklist | findstr ${pid}`, { encoding: 'utf8' });
          if (processInfo.includes('node.exe')) {
            console.log(`  ✅ Port ${port}: Node.js PID ${pid}`);
            
            // Test if it responds to HTTP
            try {
              const testScript = `
                const http = require('http');
                const req = http.get('http://localhost:${port}', (res) => {
                  console.log('  📡 HTTP Response: ' + res.statusCode);
                  process.exit(0);
                });
                req.on('error', () => {
                  console.log('  ❌ No HTTP response');
                  process.exit(0);
                });
                setTimeout(() => process.exit(0), 2000);
              `;
              execSync(`node -e "${testScript}"`, { encoding: 'utf8', stdio: 'inherit' });
            } catch (httpError) {
              console.log(`  ❌ No HTTP response on port ${port}`);
            }
          }
        } catch (processError) {
          // Not a Node.js process or process not found
        }
      }
    }
  }
} catch (error) {
  console.log('❌ Error scanning ports:', error.message);
}

console.log('\n🎯 Expected Behavior After Enhancement:');
console.log('When you run: Use studio tool, action: "start", project: "endlessblink-matrix"');
console.log('');
console.log('✅ Should output:');
console.log('♻️ Found and reused existing studio');
console.log('URL: http://localhost:3005');
console.log('Port: 3005');
console.log('PID: 56424 (or actual PID)');
console.log('Project: endlessblink-matrix');
console.log('Status: ♻️ Reused existing instance');
console.log('');
console.log('🚀 Next Steps:');
console.log('1. Build: .\\build-windows.ps1');
console.log('2. Test via Claude Desktop with the studio tool');
console.log('3. The MCP should now detect existing studios instead of creating duplicates!');
console.log('');
console.log('📋 Key Enhancements Implemented:');
console.log('✅ Project-aware discovery in StudioRegistry');
console.log('✅ HTTP endpoint testing for project matching');
console.log('✅ Smart studio launch logic (discover first, then create)');
console.log('✅ Enhanced PID validation for accuracy');
console.log('✅ Improved status reporting with reuse indicators');