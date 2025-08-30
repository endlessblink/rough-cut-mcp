/**
 * Playwright script to debug Remotion Studio white screen issue
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

async function debugRemotionStudio() {
  console.log('🔍 Starting Remotion Studio debugging...');
  
  // Project path
  const projectPath = path.join(__dirname, 'assets', 'projects', 'airplane-animation');
  console.log('Project path:', projectPath);
  
  // Start Remotion Studio
  console.log('🚀 Starting Remotion Studio...');
  const studioProcess = spawn('npx', ['remotion', 'studio'], {
    cwd: projectPath,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Wait for studio to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });
  
  // Capture errors
  const errors = [];
  page.on('pageerror', (error) => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log('❌ PAGE ERROR:', error.message);
  });
  
  try {
    // Navigate to Remotion Studio
    console.log('📍 Navigating to Remotion Studio...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take screenshot of current state
    console.log('📷 Taking screenshot...');
    await page.screenshot({ 
      path: 'debug-studio-state.png',
      fullPage: true 
    });
    
    // Check if composition is visible
    const compositionVisible = await page.isVisible('[data-testid="composition-selector"]');
    console.log('Composition selector visible:', compositionVisible);
    
    // Check for preview area
    const previewVisible = await page.isVisible('[data-testid="preview-area"]');
    console.log('Preview area visible:', previewVisible);
    
    // Check for any error messages in UI
    const errorElements = await page.locator('text=Error').all();
    console.log('Error messages found:', errorElements.length);
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if VideoComposition is loaded
    const compositionLoaded = await page.evaluate(() => {
      return window.remotion && window.remotion.getCompositions ? 
        window.remotion.getCompositions().length : 0;
    }).catch(() => 0);
    console.log('Compositions loaded:', compositionLoaded);
    
    // Wait a bit more and take final screenshot
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'debug-studio-final.png',
      fullPage: true 
    });
    
    console.log('\n📊 DEBUGGING SUMMARY:');
    console.log('Console logs:', consoleLogs.length);
    console.log('Errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.message}`);
      });
    }
    
    if (consoleLogs.length > 0) {
      console.log('\n📝 RECENT CONSOLE LOGS:');
      consoleLogs.slice(-10).forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Browser debugging failed:', error.message);
  } finally {
    await browser.close();
    
    // Kill studio process
    if (studioProcess && !studioProcess.killed) {
      studioProcess.kill();
    }
    
    console.log('🏁 Debugging complete');
  }
}

// Run the debugging
debugRemotionStudio().catch(console.error);