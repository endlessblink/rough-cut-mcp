// Audio Enhancement Prism - Professional Audio Standards System
// Research-based audio enhancement following the same pattern as Design Prism

import * as fs from 'fs-extra';
import * as path from 'path';

// Professional Audio Standards (Research-Based)
interface AudioStandards {
  digital: {
    youtube: { target: number; range: [number, number]; peakMax: number };
    spotify: { target: number; range: [number, number]; peakMax: number };
    broadcast: { target: number; range: [number, number]; peakMax: number };
  };
  mixing: {
    dialogue: [number, number];    // -15db to -6db 
    soundEffects: [number, number]; // -20db to -14db
    music: [number, number];       // -18db to -12db
    overall: [number, number];     // -20db to -12db
  };
  technical: {
    sampleRate: number;  // 48kHz professional standard
    bitDepth: number;    // 24-bit professional standard
    format: string[];    // Recommended formats
  };
}

// Research-backed professional audio standards
const AUDIO_STANDARDS: AudioStandards = {
  digital: {
    // YouTube 2024 standards
    youtube: { 
      target: -14,        // -14 LUFS target
      range: [-20, -12],  // Acceptable range
      peakMax: -1         // True peak maximum
    },
    // Spotify normalization standards
    spotify: { 
      target: -14,        // -14 LUFS (same as YouTube)
      range: [-18, -12],  // Tighter range
      peakMax: -2         // Conservative peak limit
    },
    // EBU R128 broadcast standards
    broadcast: { 
      target: -23,        // -23 LUFS broadcast standard
      range: [-23.5, -22.5], // Strict tolerance ±0.5 LU
      peakMax: -1         // -1 dBTP maximum
    }
  },
  mixing: {
    dialogue: [-15, -6],     // YouTube recommended dialogue levels
    soundEffects: [-20, -14], // YouTube SFX levels
    music: [-18, -12],       // Background music levels
    overall: [-20, -12]      // Overall mix levels
  },
  technical: {
    sampleRate: 48000,       // 48kHz professional video standard
    bitDepth: 24,            // 24-bit professional depth
    format: ['FLAC', 'WAV', 'Linear PCM'] // Lossless recommended formats
  }
};

interface AudioIntent {
  detected: 'dialogue' | 'music' | 'sfx' | 'ambient' | 'mixed' | 'unknown';
  confidence: number;
  characteristics: string[];
  platform: 'youtube' | 'spotify' | 'broadcast' | 'general';
}

interface AudioEnhancementResult {
  enhancedCode: string;
  enhancements: string[];
  audioIntent: AudioIntent;
  compliance: {
    youtube: boolean;
    spotify: boolean;  
    broadcast: boolean;
  };
}

/**
 * Audio Enhancement Prism - Flexible audio quality improvement
 * Works like CLAUDE.md for audio - guides without restricting creativity
 */
export function enhanceAudioThroughPrism(jsxContent: string, projectName: string): AudioEnhancementResult {
  console.error('[AUDIO-PRISM] Processing audio elements through professional standards...');
  
  // Step 1: Detect audio intent and platform
  const audioIntent = detectAudioIntent(jsxContent, projectName);
  console.error(`[AUDIO-PRISM] Audio intent: ${audioIntent.detected} for ${audioIntent.platform}`);
  
  // Step 2: Analyze existing audio implementation
  const currentAudio = analyzeCurrentAudioImplementation(jsxContent);
  console.error(`[AUDIO-PRISM] Found ${currentAudio.audioElements} audio elements`);
  
  // Step 3: Generate professional enhancement recommendations
  const enhancements = generateAudioEnhancements(audioIntent, currentAudio);
  
  // Step 4: Check compliance with major platforms
  const compliance = checkPlatformCompliance(audioIntent, currentAudio);
  
  return {
    enhancedCode: jsxContent, // Safe - no direct modification like broken regex
    enhancements,
    audioIntent,
    compliance
  };
}

/**
 * Detect audio intent from JSX content and project context
 */
function detectAudioIntent(jsx: string, projectName: string): AudioIntent {
  const content = jsx.toLowerCase();
  const project = projectName.toLowerCase();
  const characteristics: string[] = [];
  let detected: AudioIntent['detected'] = 'unknown';
  let platform: AudioIntent['platform'] = 'general';
  let confidence = 0;
  
  // Platform detection from project name/content
  if (project.includes('youtube') || content.includes('youtube')) {
    platform = 'youtube';
    confidence += 20;
    characteristics.push('youtube-optimized');
  }
  
  if (project.includes('spotify') || content.includes('music')) {
    platform = platform === 'general' ? 'spotify' : platform;
    confidence += 15;
    characteristics.push('music-focused');
  }
  
  // Audio content type detection
  if (content.includes('dialogue') || content.includes('speech') || content.includes('voice')) {
    detected = 'dialogue';
    confidence += 30;
    characteristics.push('speech-content');
  }
  
  if (content.includes('music') || content.includes('soundtrack') || content.includes('melody')) {
    detected = detected === 'unknown' ? 'music' : 'mixed';
    confidence += 25;
    characteristics.push('musical-content');
  }
  
  if (content.includes('sfx') || content.includes('sound') || content.includes('effect')) {
    detected = detected === 'unknown' ? 'sfx' : detected === 'music' ? 'mixed' : detected;
    confidence += 20;
    characteristics.push('sound-effects');
  }
  
  if (content.includes('ambient') || content.includes('atmosphere') || content.includes('background')) {
    detected = detected === 'unknown' ? 'ambient' : detected;
    confidence += 15;
    characteristics.push('atmospheric-audio');
  }
  
  // Default to mixed if multiple types detected
  if (characteristics.length > 2 && detected !== 'mixed') {
    detected = 'mixed';
    confidence += 10;
    characteristics.push('multi-layered-audio');
  }
  
  return {
    detected,
    confidence: Math.min(confidence, 100),
    characteristics,
    platform
  };
}

/**
 * Analyze current audio implementation in JSX
 */
function analyzeCurrentAudioImplementation(jsx: string) {
  const audioElements = (jsx.match(/<Audio/g) || []).length;
  const volumeSettings = (jsx.match(/volume\s*=\s*{?[\d.]+}?/g) || []).length;
  const audioFiles = (jsx.match(/staticFile\([^)]*\.(?:wav|mp3|flac|aac)[^)]*\)/g) || []).length;
  
  // Extract volume levels if present
  const volumes: number[] = [];
  const volumeMatches = jsx.match(/volume\s*=\s*{?([\d.]+)}?/g);
  if (volumeMatches) {
    volumeMatches.forEach(match => {
      const volMatch = match.match(/([\d.]+)/);
      if (volMatch) {
        const vol = parseFloat(volMatch[1]);
        volumes.push(vol);
      }
    });
  }
  
  return {
    audioElements,
    volumeSettings,
    audioFiles,
    volumes,
    hasAudio: audioElements > 0,
    avgVolume: volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0
  };
}

/**
 * Generate professional audio enhancement recommendations
 */
function generateAudioEnhancements(intent: AudioIntent, current: any): string[] {
  const enhancements: string[] = [];
  const standards = AUDIO_STANDARDS;
  const platformStandards = standards.digital[intent.platform as keyof typeof standards.digital] || standards.digital.youtube;
  
  // Enhancement 1: Volume Level Optimization
  if (current.hasAudio) {
    if (current.avgVolume > 1.0) {
      enhancements.push(`🔊 Reduce volume levels: Current avg ${current.avgVolume.toFixed(2)} → Recommended 0.6-0.8 for ${intent.platform}`);
    } else if (current.avgVolume < 0.4) {
      enhancements.push(`🔊 Increase volume levels: Current avg ${current.avgVolume.toFixed(2)} → Recommended 0.6-0.8 for ${intent.platform}`);
    } else {
      enhancements.push(`✅ Volume levels appropriate for ${intent.platform} (${current.avgVolume.toFixed(2)})`);
    }
    
    // Enhancement 2: Platform-Specific Recommendations
    switch (intent.platform) {
      case 'youtube':
        enhancements.push(`🎯 YouTube 2024: Target -14 LUFS, peak max -1 dBTP for optimal quality`);
        break;
      case 'spotify':
        enhancements.push(`🎯 Spotify: Target -14 LUFS, preserve dynamics for best playback`);
        break;
      case 'broadcast':
        enhancements.push(`🎯 Broadcast: Target -23 LUFS, strict ±0.5 LU tolerance required`);
        break;
      default:
        enhancements.push(`🎯 Digital: Target -14 LUFS for most streaming platforms`);
    }
    
    // Enhancement 3: Content-Type Specific Guidelines
    switch (intent.detected) {
      case 'dialogue':
        enhancements.push(`🎤 Dialogue: Mix at -12 dB max, ensure clarity and intelligibility`);
        break;
      case 'music':
        enhancements.push(`🎵 Music: Balance dynamics, avoid over-compression, target -14 LUFS`);
        break;
      case 'sfx':
        enhancements.push(`🔊 SFX: Mix at -14 to -20 dB, ensure they support not overpower content`);
        break;
      case 'mixed':
        enhancements.push(`🎚️ Mixed Content: Layer dialogue (-12dB), music (-16dB), SFX (-18dB) properly`);
        break;
      case 'ambient':
        enhancements.push(`🌊 Ambient: Keep subtle (-20 to -24dB), maintain atmosphere without distraction`);
        break;
    }
    
    // Enhancement 4: Technical Quality Recommendations  
    enhancements.push(`🔧 Technical: Use 48kHz/24-bit, export FLAC/WAV, avoid MP3 for source audio`);
    enhancements.push(`📊 Metering: Monitor with LUFS meter (Youlean free plugin recommended)`);
    
    // Enhancement 5: Dynamic Range Preservation
    if (intent.platform === 'youtube' || intent.platform === 'spotify') {
      enhancements.push(`📈 Dynamic Range: Preserve dynamics - platforms normalize automatically (no loudness war needed)`);
    }
    
  } else {
    // No audio detected
    enhancements.push(`🔇 No audio detected: Consider adding professional audio to enhance engagement`);
    enhancements.push(`💡 Audio Options: Background music, sound effects, or dialogue narration`);
    enhancements.push(`🎯 For ${intent.platform}: Target -14 LUFS when adding audio elements`);
  }
  
  return enhancements;
}

/**
 * Check compliance with major platform standards
 */
function checkPlatformCompliance(intent: AudioIntent, current: any): { youtube: boolean; spotify: boolean; broadcast: boolean } {
  // Simplified compliance check based on volume levels
  // In production, would analyze actual LUFS levels
  
  const avgVol = current.avgVolume;
  const idealRange = [0.6, 0.8]; // Approximates -14 LUFS in Remotion volume units
  
  const inIdealRange = avgVol >= idealRange[0] && avgVol <= idealRange[1];
  const notTooLoud = avgVol <= 1.0;
  const notTooQuiet = avgVol >= 0.3;
  
  return {
    youtube: inIdealRange && notTooLoud,     // YouTube: -14 LUFS, dynamic range friendly
    spotify: inIdealRange && notTooLoud,     // Spotify: Similar to YouTube
    broadcast: notTooQuiet && avgVol <= 0.7  // Broadcast: More conservative
  };
}

/**
 * Generate audio enhancement code snippets (safe template approach)
 */
export function generateAudioEnhancementCode(intent: AudioIntent): string {
  const standards = AUDIO_STANDARDS.digital[intent.platform as keyof typeof AUDIO_STANDARDS.digital] || AUDIO_STANDARDS.digital.youtube;
  
  const codeTemplate = `
// Professional Audio Enhancement for ${intent.detected} content
// Platform: ${intent.platform} (Target: ${standards.target} LUFS)

{/* Audio Element with Professional Mixing */}
<Audio 
  src={staticFile('audio/your-audio-file.wav')}
  volume={${getRecommendedVolume(intent)}} 
  // Platform: ${intent.platform} optimized levels
/>

{/* Pro Tip: Use LUFS metering during production */}
{/* Target: ${standards.target} LUFS for ${intent.platform} */}
{/* Peak Max: ${standards.peakMax} dBTP to avoid clipping */}
`;
  
  return codeTemplate.trim();
}

/**
 * Get recommended volume for Remotion based on intent and platform
 */
function getRecommendedVolume(intent: AudioIntent): number {
  // Convert platform LUFS targets to approximate Remotion volume values
  // Note: These are approximations - real LUFS metering needed for precision
  
  const volumeMap = {
    dialogue: intent.platform === 'broadcast' ? 0.6 : 0.7,   // Dialogue prominence
    music: intent.platform === 'broadcast' ? 0.5 : 0.6,      // Background music
    sfx: intent.platform === 'broadcast' ? 0.4 : 0.5,        // Sound effects
    ambient: intent.platform === 'broadcast' ? 0.3 : 0.4,    // Ambient sounds
    mixed: intent.platform === 'broadcast' ? 0.6 : 0.7,      // Balanced mix
    unknown: intent.platform === 'broadcast' ? 0.5 : 0.6     // Conservative default
  };
  
  return volumeMap[intent.detected] || 0.6;
}

/**
 * Audio Enhancement Report (like Design Prism analysis)
 */
export function generateAudioReport(jsx: string, projectName: string): string {
  const result = enhanceAudioThroughPrism(jsx, projectName);
  
  let report = `🎵 **Audio Enhancement Analysis: ${projectName}**\n\n`;
  report += `**Audio Intent**: ${result.audioIntent.detected} (${result.audioIntent.confidence}% confidence)\n`;
  report += `**Platform Target**: ${result.audioIntent.platform}\n`;
  report += `**Characteristics**: ${result.audioIntent.characteristics.join(', ')}\n\n`;
  
  // Platform compliance status
  report += `**Platform Compliance**:\n`;
  report += `• YouTube: ${result.compliance.youtube ? '✅ Compliant' : '❌ Needs adjustment'}\n`;
  report += `• Spotify: ${result.compliance.spotify ? '✅ Compliant' : '❌ Needs adjustment'}\n`;
  report += `• Broadcast: ${result.compliance.broadcast ? '✅ Compliant' : '❌ Needs adjustment'}\n\n`;
  
  // Enhancement recommendations
  if (result.enhancements.length > 0) {
    report += `🔧 **Professional Audio Enhancements**:\n`;
    result.enhancements.forEach(enhancement => {
      report += `${enhancement}\n`;
    });
    report += '\n';
  }
  
  // Professional audio code example
  report += `💡 **Professional Audio Implementation**:\n`;
  report += '```jsx\n';
  report += generateAudioEnhancementCode(result.audioIntent);
  report += '\n```\n\n';
  
  report += `📝 **Audio Prism Philosophy**: Professional standards without restricting creative vision\n`;
  report += `🎯 **Research Sources**: YouTube 2024 standards, EBU R128, Spotify normalization, broadcast specs`;
  
  return report;
}