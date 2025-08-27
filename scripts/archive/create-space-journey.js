import { RemotionCreativeMCPServer } from './build/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createSpaceJourneyVideo() {
  console.log('🚀 Creating Space Journey Animation...\n');
  
  try {
    // Read the composition code
    const compositionCode = readFileSync(join(__dirname, 'space-journey-code.tsx'), 'utf-8');
    
    // Initialize the MCP server
    const server = new RemotionCreativeMCPServer();
    
    // Create the video request
    const request = {
      animationDesc: "Space journey with planets, stars, and a rocket traveling through space",
      duration: 6,
      compositionCode: compositionCode,
      projectName: 'space-journey-animation'
    };
    
    console.log('📝 Request Details:');
    console.log(`   Description: ${request.animationDesc}`);
    console.log(`   Duration: ${request.duration} seconds`);
    console.log(`   Project Name: ${request.projectName}`);
    console.log(`   Code Length: ${compositionCode.length} characters\n`);
    
    console.log('🎬 Generating video...');
    
    // Call the create-complete-video function
    const result = await server.createCompleteVideo(request);
    
    // Parse the result
    if (result && result.content && result.content[0]) {
      const responseText = result.content[0].text;
      console.log('\n✅ Result:', responseText);
      
      // Extract paths from the response
      const projectPathMatch = responseText.match(/Project created at: (.+)/);
      const videoPathMatch = responseText.match(/Video path: (.+)/);
      
      if (projectPathMatch) {
        console.log(`\n📁 Project Path: ${projectPathMatch[1]}`);
      }
      if (videoPathMatch) {
        console.log(`🎥 Video Path: ${videoPathMatch[1]}`);
      }
    } else {
      console.log('❌ Unexpected result format:', result);
    }
    
  } catch (error) {
    console.error('❌ Error creating video:', error.message);
    console.error(error.stack);
  }
}

// Run the function
createSpaceJourneyVideo();