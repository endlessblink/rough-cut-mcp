// Remotion video rendering orchestration service
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAssetPath } from '../utils/config.js';
import { getLogger } from '../utils/logger.js';
import { patchRemotionSpawn, getBundlerOptions, normalizePath } from '../utils/platform-fix.js';
import { validateTextContent, validateDuration } from '../utils/validation.js';
import { setLastCreatedProject } from '../tools/studio-tools.js';
export class RemotionService {
    config;
    logger = getLogger().service('Remotion');
    constructor(config) {
        this.config = config;
        // Apply platform-specific spawn fixes
        patchRemotionSpawn();
        this.logger.info('Remotion service initialized with platform fixes');
    }
    /**
     * Create a complete video with all assets
     */
    async createVideo(request, assets) {
        const startTime = Date.now();
        this.logger.info('Starting video creation', {
            animationDesc: request.animationDesc.substring(0, 100) + '...',
            duration: request.duration,
            assetCounts: {
                voice: assets.voiceTracks.length,
                sfx: assets.soundEffects.length,
                images: assets.images.length,
            }
        });
        try {
            // Validate inputs
            const animationValidation = validateTextContent(request.animationDesc, 2000);
            if (!animationValidation.isValid) {
                throw new Error(`Invalid animation description: ${animationValidation.errors.join(', ')}`);
            }
            const durationValidation = validateDuration(request.duration || 30);
            if (!durationValidation.isValid) {
                throw new Error(`Invalid duration: ${durationValidation.error}`);
            }
            // Prepare video output path
            const videoDir = getAssetPath(this.config, 'videos');
            await fs.ensureDir(videoDir);
            const videoFilename = `video_${uuidv4()}.mp4`;
            const videoPath = path.join(videoDir, videoFilename);
            // Create temporary composition file
            const tempDir = getAssetPath(this.config, 'temp');
            await fs.ensureDir(tempDir);
            const compositionDir = path.join(tempDir, `composition_${uuidv4()}`);
            await fs.ensureDir(compositionDir);
            // Generate composition code using simple compositions
            const { generateBasicComposition, generateIndexFile, generatePackageJson } = await import('../templates/simple-compositions.js');
            const compositionCode = await generateBasicComposition({
                animationDesc: request.animationDesc,
                assets,
                style: request.style,
                compositionCode: request.compositionCode, // Pass Claude's code if provided
                duration: request.duration || 30,
                fps: request.fps || 30,
                dimensions: request.dimensions || { width: 1920, height: 1080 },
            });
            const compositionFile = path.join(compositionDir, 'Composition.tsx');
            await fs.writeFile(compositionFile, compositionCode);
            // Create package.json for the composition
            const packageJsonContent = generatePackageJson();
            await fs.writeFile(path.join(compositionDir, 'package.json'), packageJsonContent);
            // Create index file
            const indexCode = generateIndexFile(request.duration || 30, request.fps || 30, request.dimensions || { width: 1920, height: 1080 });
            await fs.writeFile(path.join(compositionDir, 'Video.tsx'), indexCode);
            // Create root index file
            const rootIndexCode = `import { registerRoot } from 'remotion';
import { RemotionVideo } from './Video';

registerRoot(RemotionVideo);`;
            await fs.writeFile(path.join(compositionDir, 'index.ts'), rootIndexCode);
            // Bundle the composition with platform fixes
            this.logger.debug('Bundling composition with platform fixes');
            let bundleLocation;
            try {
                const platformOptions = getBundlerOptions();
                bundleLocation = await bundle({
                    entryPoint: normalizePath(path.join(compositionDir, 'index.ts')),
                    onProgress: (progress) => {
                        this.logger.debug('Bundle progress', { progress: Math.round(progress * 100) + '%' });
                    },
                    ...platformOptions
                });
            }
            catch (bundleError) {
                this.logger.error('Bundle failed - likely spawn EINVAL error', {
                    error: bundleError instanceof Error ? bundleError.message : String(bundleError),
                    platform: process.platform,
                    compositionDir
                });
                throw new Error(`Failed to bundle composition: ${bundleError instanceof Error ? bundleError.message : String(bundleError)}`);
            }
            // Get composition metadata
            const compositions = await selectComposition({
                serveUrl: bundleLocation,
                id: 'VideoComposition',
                inputProps: {
                    animationDesc: request.animationDesc,
                    assets,
                    style: request.style,
                },
            });
            if (!compositions) {
                throw new Error('Failed to find composition');
            }
            // Calculate video dimensions and frame count
            const fps = request.fps || 30;
            const duration = request.duration || 30;
            const durationInFrames = Math.round(duration * fps);
            const dimensions = request.dimensions || { width: 1920, height: 1080 };
            // Render the video
            this.logger.info('Starting video render', {
                durationInFrames,
                fps,
                dimensions
            });
            const renderStart = Date.now();
            await renderMedia({
                composition: {
                    ...compositions,
                    durationInFrames,
                    fps,
                    width: dimensions.width,
                    height: dimensions.height,
                },
                serveUrl: bundleLocation,
                codec: 'h264',
                outputLocation: videoPath,
                inputProps: {
                    animationDesc: request.animationDesc,
                    assets,
                    style: request.style,
                },
                onProgress: (progress) => {
                    this.logger.debug('Render progress', {
                        frame: progress.renderedFrames,
                        total: durationInFrames,
                        percent: Math.round((progress.renderedFrames / durationInFrames) * 100) + '%'
                    });
                },
                browserExecutable: this.config.remotion.browserExecutable,
                concurrency: this.config.remotion.concurrency,
                timeoutInMilliseconds: this.config.remotion.timeout,
            });
            const renderTime = Date.now() - renderStart;
            // Get file size
            const stats = await fs.stat(videoPath);
            // Cleanup temporary files
            if (this.config.fileManagement.cleanupTempFiles) {
                await fs.remove(compositionDir);
            }
            const result = {
                videoPath,
                duration,
                assets,
                metadata: {
                    animationDesc: request.animationDesc,
                    renderTime,
                    fps,
                    dimensions,
                    timestamp: new Date().toISOString(),
                },
            };
            const totalTime = Date.now() - startTime;
            this.logger.info('Video creation completed', {
                videoPath,
                duration: totalTime,
                renderTime,
                fileSize: stats.size,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Video creation failed', {
                error: error instanceof Error ? error.message : String(error),
                animationDesc: request.animationDesc.substring(0, 100) + '...'
            });
            throw error;
        }
    }
    /**
     * Create a simple text-only video
     */
    async createTextVideo(text, duration = 10, options) {
        this.logger.info('Creating text-only video', { text: text.substring(0, 50) + '...', duration });
        const videoDir = getAssetPath(this.config, 'videos');
        await fs.ensureDir(videoDir);
        const videoPath = path.join(videoDir, `text_video_${uuidv4()}.mp4`);
        // Create temporary composition for text video
        const tempDir = getAssetPath(this.config, 'temp');
        await fs.ensureDir(tempDir);
        const compositionDir = path.join(tempDir, `text_composition_${uuidv4()}`);
        await fs.ensureDir(compositionDir);
        try {
            // Generate simple text composition
            const textComposition = this.generateTextComposition(text, duration, options || {});
            await fs.writeFile(path.join(compositionDir, 'Composition.tsx'), textComposition);
            // Create package.json
            const { generatePackageJson } = await import('../templates/simple-compositions.js');
            const packageJsonContent = generatePackageJson();
            await fs.writeFile(path.join(compositionDir, 'package.json'), packageJsonContent);
            // Create Video.tsx
            const fps = 30;
            const durationInFrames = Math.round(duration * fps);
            const videoCode = `import { Composition } from 'remotion';
import { TextComposition } from './Composition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="TextComposition"
        component={TextComposition}
        durationInFrames={${durationInFrames}}
        fps={${fps}}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};`;
            await fs.writeFile(path.join(compositionDir, 'Video.tsx'), videoCode);
            // Create root index
            const rootIndexCode = `import { registerRoot } from 'remotion';
import { RemotionVideo } from './Video';

registerRoot(RemotionVideo);`;
            await fs.writeFile(path.join(compositionDir, 'index.ts'), rootIndexCode);
            // Bundle the composition
            this.logger.debug('Bundling text composition');
            const bundleLocation = await bundle({
                entryPoint: path.join(compositionDir, 'index.ts'),
                onProgress: (progress) => {
                    this.logger.debug('Bundle progress', { progress: Math.round(progress * 100) + '%' });
                },
            });
            // Get composition metadata
            const compositions = await selectComposition({
                serveUrl: bundleLocation,
                id: 'TextComposition',
                inputProps: {},
            });
            if (!compositions) {
                throw new Error('Failed to find text composition');
            }
            // Render the video
            this.logger.info('Rendering text video', { durationInFrames, fps });
            await renderMedia({
                composition: {
                    ...compositions,
                    durationInFrames,
                    fps,
                    width: 1920,
                    height: 1080,
                },
                serveUrl: bundleLocation,
                codec: 'h264',
                outputLocation: videoPath,
                inputProps: {},
                onProgress: (progress) => {
                    this.logger.debug('Render progress', {
                        frame: progress.renderedFrames,
                        total: durationInFrames,
                        percent: Math.round((progress.renderedFrames / durationInFrames) * 100) + '%'
                    });
                },
                browserExecutable: this.config.remotion.browserExecutable,
                concurrency: this.config.remotion.concurrency,
                timeoutInMilliseconds: this.config.remotion.timeout,
            });
            // Cleanup temporary files
            if (this.config.fileManagement.cleanupTempFiles) {
                await fs.remove(compositionDir);
            }
            this.logger.info('Text video created successfully', { videoPath });
            return videoPath;
        }
        catch (error) {
            this.logger.error('Text video creation failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            // Cleanup on error
            await fs.remove(compositionDir).catch(() => { });
            throw error;
        }
    }
    /**
     * Generate text composition code
     */
    generateTextComposition(text, duration, options) {
        const fontSize = options.fontSize || 48;
        const backgroundColor = options.backgroundColor || '#000000';
        const textColor = options.textColor || '#FFFFFF';
        const fontFamily = options.fontFamily || 'Arial, sans-serif';
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const TextComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Simple fade in/out animation
  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '${backgroundColor}',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: ${fontSize},
          color: '${textColor}',
          fontFamily: '${fontFamily}',
          textAlign: 'center',
          maxWidth: '80%',
          opacity,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        ${JSON.stringify(text)}
      </div>
    </AbsoluteFill>
  );
};`;
    }
    /**
     * Test Remotion functionality
     */
    async testRemotionSetup() {
        try {
            this.logger.info('Testing Remotion setup');
            // Test bundling a simple composition
            const tempDir = getAssetPath(this.config, 'temp');
            const testDir = path.join(tempDir, `test_${uuidv4()}`);
            await fs.ensureDir(testDir);
            // Create minimal test composition
            const testComposition = `import React from 'react';
import { AbsoluteFill } from 'remotion';

export const TestComposition = () => (
  <AbsoluteFill style={{ backgroundColor: 'red' }}>
    <h1>Test</h1>
  </AbsoluteFill>
);`;
            const testIndex = `import { registerRoot } from 'remotion';
import { TestComposition } from './TestComposition';

registerRoot(() => (
  <TestComposition
    id="Test"
    component={TestComposition}
    durationInFrames={30}
    fps={30}
    width={1920}
    height={1080}
  />
));`;
            await fs.writeFile(path.join(testDir, 'TestComposition.tsx'), testComposition);
            await fs.writeFile(path.join(testDir, 'index.ts'), testIndex);
            // Try to bundle
            await bundle({
                entryPoint: path.join(testDir, 'index.ts'),
            });
            // Cleanup
            await fs.remove(testDir);
            this.logger.info('Remotion setup test successful');
            return true;
        }
        catch (error) {
            this.logger.error('Remotion setup test failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
    /**
     * Get estimated render time
     */
    estimateRenderTime(durationInFrames, fps) {
        // Rough estimate: 1 frame per second of processing time
        // This can vary greatly based on complexity and hardware
        const baseTime = durationInFrames * 1000; // 1 second per frame
        const fpsMultiplier = fps / 30; // Normalize to 30fps baseline
        return Math.round(baseTime * fpsMultiplier);
    }
    /**
     * Create a persistent Remotion project for Studio viewing
     */
    async createStudioProject(request, assets) {
        this.logger.info('Creating persistent Studio project');
        const baseAssetDir = getAssetPath(this.config);
        const projectsDir = path.join(baseAssetDir, 'projects');
        await fs.ensureDir(projectsDir);
        const projectName = `video_${Date.now()}`;
        const projectPath = path.join(projectsDir, projectName);
        await fs.ensureDir(projectPath);
        // Create src directory
        const srcPath = path.join(projectPath, 'src');
        await fs.ensureDir(srcPath);
        // Generate composition code
        const { generateBasicComposition, generateIndexFile, generateCompletePackageJson, generateRemotionConfig, generateTsConfig } = await import('../templates/simple-compositions.js');
        const compositionCode = await generateBasicComposition({
            animationDesc: request.animationDesc,
            assets,
            style: request.style,
            compositionCode: request.compositionCode, // Pass Claude's code if provided
            duration: request.duration || 30,
            fps: request.fps || 30,
            dimensions: request.dimensions || { width: 1920, height: 1080 },
        });
        // Write files
        await fs.writeFile(path.join(srcPath, 'Composition.tsx'), compositionCode);
        const videoCode = generateIndexFile(request.duration || 30, request.fps || 30, request.dimensions || { width: 1920, height: 1080 });
        await fs.writeFile(path.join(srcPath, 'Video.tsx'), videoCode);
        // Create root index
        const rootIndexCode = `import { registerRoot } from 'remotion';
import { RemotionVideo } from './Video';

registerRoot(RemotionVideo);`;
        await fs.writeFile(path.join(srcPath, 'index.ts'), rootIndexCode);
        // Create ALL required configuration files
        const packageJsonContent = generateCompletePackageJson();
        await fs.writeFile(path.join(projectPath, 'package.json'), packageJsonContent);
        const remotionConfigContent = generateRemotionConfig();
        await fs.writeFile(path.join(projectPath, 'remotion.config.ts'), remotionConfigContent);
        const tsconfigContent = generateTsConfig();
        await fs.writeFile(path.join(projectPath, 'tsconfig.json'), tsconfigContent);
        // Install dependencies immediately
        this.logger.info('Installing project dependencies...');
        const { safeNpmInstall } = await import('../utils/safe-spawn.js');
        const installResult = await safeNpmInstall(projectPath);
        if (!installResult.success) {
            this.logger.error('Failed to install dependencies', { error: installResult.error });
            // Don't throw - project is still created, just missing dependencies
            // They will be installed on first launch
            this.logger.warn('Project created but dependencies not installed. They will be installed on first launch.');
        }
        else {
            this.logger.info('Dependencies installed successfully');
        }
        // Create public directory and copy assets
        const publicPath = path.join(projectPath, 'public');
        await fs.ensureDir(publicPath);
        // Copy assets to public directory
        for (const image of assets.images) {
            if (await fs.pathExists(image.imagePath)) {
                const fileName = path.basename(image.imagePath);
                const targetPath = path.join(publicPath, fileName);
                await fs.copy(image.imagePath, targetPath);
                // Update the image path in the asset
                image.imagePath = fileName;
            }
        }
        for (const voice of assets.voiceTracks) {
            if (await fs.pathExists(voice.audioPath)) {
                const fileName = path.basename(voice.audioPath);
                const targetPath = path.join(publicPath, fileName);
                await fs.copy(voice.audioPath, targetPath);
                // Update the audio path in the asset
                voice.audioPath = fileName;
            }
        }
        for (const sfx of assets.soundEffects) {
            if (await fs.pathExists(sfx.audioPath)) {
                const fileName = path.basename(sfx.audioPath);
                const targetPath = path.join(publicPath, fileName);
                await fs.copy(sfx.audioPath, targetPath);
                // Update the audio path in the asset
                sfx.audioPath = fileName;
            }
        }
        this.logger.info('Studio project created', { projectPath });
        // Update the tracking so Studio will launch with this project
        setLastCreatedProject(projectPath);
        return projectPath;
    }
    /**
     * Clean up old render files
     */
    async cleanupOldRenders(maxAgeHours = 24) {
        const videoDir = getAssetPath(this.config, 'videos');
        const tempDir = getAssetPath(this.config, 'temp');
        const directories = [videoDir, tempDir];
        let cleanedCount = 0;
        for (const dir of directories) {
            try {
                if (await fs.pathExists(dir)) {
                    const files = await fs.readdir(dir);
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stats = await fs.stat(filePath);
                        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
                        if (ageHours > maxAgeHours) {
                            await fs.remove(filePath);
                            cleanedCount++;
                            this.logger.debug('Cleaned up old file', { filePath, ageHours });
                        }
                    }
                }
            }
            catch (error) {
                this.logger.warn('Error cleaning directory', {
                    dir,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        this.logger.info('Cleanup completed', { cleanedCount });
    }
}
//# sourceMappingURL=remotion.js.map