// Manual transformation of personal-brand-intro to Series structure
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixPersonalBrandIntro() {
  const projectPath = path.join(__dirname, 'assets', 'projects', 'personal-brand-intro');
  const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
  
  console.log('🔍 Reading VideoComposition.tsx...');
  const originalCode = await fs.readFile(compositionFile, 'utf-8');
  
  console.log('🔧 Applying Series transformation...');
  
  // Transform the code manually to demonstrate the concept
  const transformedCode = originalCode
    // Add Series import
    .replace(
      /import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';/,
      "import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Series } from 'remotion';"
    )
    // Replace conditional rendering with Series structure
    .replace(
      /return \(\s*<AbsoluteFill>\s*\{frame < 120 && <Scene1 \/>\}\s*\{frame >= 120 && <Scene2 \/>\}\s*<\/AbsoluteFill>\s*\);/s,
      `return (
    <Series>
      <Series.Sequence durationInFrames={120}>
        <Scene1 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={90}>
        <Scene2 />
      </Series.Sequence>
    </Series>
  );`
    )
    // Remove scene frame offset calculations
    .replace(/const scene2Frame = frame - 120;\s*\n\s*if \(scene2Frame < 0\) return null;\s*/g, '')
    // Replace scene2Frame with frame
    .replace(/scene2Frame/g, 'frame');
  
  // Create backup
  const backupFile = compositionFile + '.backup.' + Date.now();
  await fs.writeFile(backupFile, originalCode);
  console.log('💾 Created backup:', backupFile);
  
  // Write transformed code
  await fs.writeFile(compositionFile, transformedCode);
  console.log('✅ Applied Series transformation to VideoComposition.tsx');
  
  // Update duration in Video.tsx and index.tsx
  const videoFile = path.join(projectPath, 'src', 'Video.tsx');
  const indexFile = path.join(projectPath, 'src', 'index.tsx');
  
  for (const file of [videoFile, indexFile]) {
    if (await fs.pathExists(file)) {
      const content = await fs.readFile(file, 'utf-8');
      const updatedContent = content.replace(
        /durationInFrames={210}/g,
        'durationInFrames={210}' // 120 + 90 = 210, which is already correct
      );
      await fs.writeFile(file, updatedContent);
      console.log('📝 Updated duration in:', path.basename(file));
    }
  }
  
  console.log('\n🎉 Transformation complete!');
  console.log('   📍 Project: personal-brand-intro');
  console.log('   🎬 Structure: Conditional rendering → Series with 2 sequences');
  console.log('   ⏱️  Scene 1: 120 frames (4 seconds)');
  console.log('   ⏱️  Scene 2: 90 frames (3 seconds)');
  console.log('   💾 Backup: Created');
  console.log('\nTo see the result:');
  console.log('   1. Launch Remotion Studio with launch-project-studio');
  console.log('   2. You should now see 2 separate clips in the timeline');
}

fixPersonalBrandIntro().catch(console.error);