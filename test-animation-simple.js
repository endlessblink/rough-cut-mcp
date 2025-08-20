// Simple test for animation generation
import { AnimationGeneratorService } from './build/services/animation-generator.js';

console.log('🚀 Testing Animation Generation');
console.log('================================');

async function testAnimation() {
  try {
    console.log('1. Creating animation generator service...');
    const generator = new AnimationGeneratorService();

    console.log('2. Testing walk cycle generation...');
    const request = {
      animationDesc: 'walking man animation',
      duration: 5,
      fps: 30,
      dimensions: { width: 1920, height: 1080 },
      style: 'procedural'
    };

    const result = await generator.generateAnimation(request);
    
    console.log('3. Results:');
    console.log('Success:', result.success);
    console.log('Animation Type:', result.animationType.type);
    console.log('Confidence:', result.animationType.confidence);
    console.log('Keywords:', result.animationType.keywords);
    console.log('Fallback to template:', result.fallbackToTemplate);
    
    if (result.success) {
      console.log('✅ Animation generation successful!');
      console.log('Generated composition code length:', result.compositionCode.length);
      
      // Show a snippet of the generated code
      const codeSnippet = result.compositionCode.substring(0, 200);
      console.log('Code snippet:', codeSnippet + '...');
    } else {
      console.log('❌ Animation generation failed, will fallback to templates');
    }

    console.log('\n4. Testing other animation types...');
    
    const testCases = [
      'bouncing ball animation',
      'rotating star',
      'fading text effect',
      'sliding element'
    ];

    for (const desc of testCases) {
      const testReq = { ...request, animationDesc: desc };
      const testResult = await generator.generateAnimation(testReq);
      console.log(`${desc}: ${testResult.animationType.type} (${testResult.confidence})`);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testAnimation();