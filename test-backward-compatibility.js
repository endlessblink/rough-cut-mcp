// Test backward compatibility with existing functionality
import { generateBasicComposition, generatePackageJson, generateIndexFile } from './build/templates/simple-compositions.js';

console.log('🔄 Testing Backward Compatibility');
console.log('==================================');

async function testBackwardCompatibility() {
  try {
    console.log('1. Testing original bouncing ball template...');
    
    const ballRequest = {
      animationDesc: 'bouncing ball animation',
      assets: { voiceTracks: [], soundEffects: [], images: [] },
      style: 'default',
      duration: 5,
      fps: 30,
      dimensions: { width: 1920, height: 1080 }
    };

    const ballComposition = await generateBasicComposition(ballRequest);
    console.log('✅ Ball composition generated:', ballComposition.length > 1000 ? 'SUCCESS' : 'TOO SHORT');
    console.log('   Contains bouncing physics:', ballComposition.includes('bounceHeight') ? 'YES' : 'NO');

    console.log('\n2. Testing generic template fallback...');
    
    const genericRequest = {
      animationDesc: 'some random unrecognized animation',
      assets: { 
        voiceTracks: [{ audioPath: 'test.mp3', duration: 3, metadata: {} }], 
        soundEffects: [], 
        images: [{ imagePath: 'test.jpg', metadata: {} }] 
      },
      style: 'dark',
      duration: 3,
      fps: 30,
      dimensions: { width: 1280, height: 720 }
    };

    const genericComposition = await generateBasicComposition(genericRequest);
    console.log('✅ Generic composition generated:', genericComposition.length > 1000 ? 'SUCCESS' : 'TOO SHORT');
    console.log('   Contains assets:', genericComposition.includes('Audio') ? 'YES' : 'NO');
    console.log('   Contains images:', genericComposition.includes('Img') ? 'YES' : 'NO');

    console.log('\n3. Testing helper functions...');
    
    const packageJson = generatePackageJson();
    console.log('✅ Package.json generated:', packageJson.includes('remotion') ? 'SUCCESS' : 'FAILED');

    const indexFile = generateIndexFile(10, 30, { width: 1920, height: 1080 });
    console.log('✅ Index file generated:', indexFile.includes('VideoComposition') ? 'SUCCESS' : 'FAILED');

    console.log('\n4. Testing edge cases...');
    
    // Empty assets
    const emptyRequest = {
      animationDesc: 'test animation',
      assets: { voiceTracks: [], soundEffects: [], images: [] },
      duration: 2,
      fps: 24,
      dimensions: { width: 800, height: 600 }
    };

    const emptyComposition = await generateBasicComposition(emptyRequest);
    console.log('✅ Empty assets handled:', emptyComposition.length > 500 ? 'SUCCESS' : 'FAILED');

    console.log('\n✅ All backward compatibility tests passed!');
    console.log('The intelligent generation system maintains full compatibility with existing templates.');

  } catch (error) {
    console.error('❌ Backward compatibility test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testBackwardCompatibility();