// Input validation schemas using Zod
import { z } from 'zod';

// Voice generation validation
export const VoiceGenerationSchema = z.object({
  text: z.string().min(1).max(10000),
  voiceId: z.string().optional().default('Adam'),
  modelId: z.string().optional().default('eleven_multilingual_v2'),
  outputPath: z.string().optional(),
});

// Sound effects search validation
export const SoundEffectSearchSchema = z.object({
  query: z.string().min(1).max(200),
  duration: z.string().optional().default('[1 TO 10]'),
  maxResults: z.number().int().min(1).max(20).optional().default(5),
  outputDir: z.string().optional(),
});

// Image generation validation
export const ImageGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.string().optional().default('FLUX.1-pro'),
  width: z.number().int().min(256).max(2048).optional().default(1024),
  height: z.number().int().min(256).max(2048).optional().default(1024),
  outputPath: z.string().optional(),
});

// Video creation validation
export const VideoCreationSchema = z.object({
  animationDesc: z.string().min(1).max(2000),
  narration: z.string().max(5000).optional(),
  sfxDesc: z.array(z.string().max(200)).optional(),
  imageDesc: z.array(z.string().max(1000)).optional(),
  duration: z.number().positive().max(300).optional().default(30), // Max 5 minutes
  style: z.string().max(500).optional(),
  compositionCode: z.string().max(50000).optional(), // Complete Remotion React component code
  fps: z.number().int().min(24).max(60).optional().default(30),
  dimensions: z.object({
    width: z.number().int().min(256).max(4096).default(1920),
    height: z.number().int().min(256).max(4096).default(1080),
  }).optional(),
});

// Asset cleanup validation
export const AssetCleanupSchema = z.object({
  maxAge: z.number().positive().optional(),
  dryRun: z.boolean().optional().default(false),
  assetTypes: z.array(z.enum(['audio', 'image', 'video', 'temp'])).optional(),
});

// File path validation
export function validateFilePath(filePath: string): boolean {
  // Basic validation - no null bytes, reasonable length
  if (filePath.includes('\0') || filePath.length > 500) {
    return false;
  }
  
  // Prevent directory traversal
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (normalizedPath.includes('../') || normalizedPath.includes('./')) {
    return false;
  }
  
  return true;
}

// File extension validation
export function validateFileExtension(filePath: string, allowedExtensions: string[]): boolean {
  const extension = filePath.toLowerCase().split('.').pop();
  return extension ? allowedExtensions.includes(extension) : false;
}

// Audio file validation
export const AudioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
export const ImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const VideoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

// URL validation for external resources
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Text content validation (for prompts, descriptions)
export function validateTextContent(text: string, maxLength: number = 1000): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Text cannot be empty');
  }
  
  if (text.length > maxLength) {
    errors.push(`Text exceeds maximum length of ${maxLength} characters`);
  }
  
  // Check for potentially harmful content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      errors.push('Text contains potentially harmful content');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Duration validation for video/audio
export function validateDuration(duration: number): {
  isValid: boolean;
  error?: string;
} {
  if (duration <= 0) {
    return { isValid: false, error: 'Duration must be positive' };
  }
  
  if (duration > 600) { // 10 minutes max
    return { isValid: false, error: 'Duration cannot exceed 10 minutes' };
  }
  
  return { isValid: true };
}