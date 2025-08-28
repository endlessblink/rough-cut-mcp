"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoExtensions = exports.ImageExtensions = exports.AudioExtensions = exports.AssetCleanupSchema = exports.VideoCreationSchema = exports.ImageGenerationSchema = exports.SoundEffectSearchSchema = exports.VoiceGenerationSchema = void 0;
exports.validateFilePath = validateFilePath;
exports.validateFileExtension = validateFileExtension;
exports.validateUrl = validateUrl;
exports.validateTextContent = validateTextContent;
exports.validateDuration = validateDuration;
// Input validation schemas using Zod
const zod_1 = require("zod");
// Voice generation validation
exports.VoiceGenerationSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(10000),
    voiceId: zod_1.z.string().optional().default('Adam'),
    modelId: zod_1.z.string().optional().default('eleven_multilingual_v2'),
    outputPath: zod_1.z.string().optional(),
});
// Sound effects search validation
exports.SoundEffectSearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(200),
    duration: zod_1.z.string().optional().default('[1 TO 10]'),
    maxResults: zod_1.z.number().int().min(1).max(20).optional().default(5),
    outputDir: zod_1.z.string().optional(),
});
// Image generation validation
exports.ImageGenerationSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).max(1000),
    model: zod_1.z.string().optional().default('FLUX.1-pro'),
    width: zod_1.z.number().int().min(256).max(2048).optional().default(1024),
    height: zod_1.z.number().int().min(256).max(2048).optional().default(1024),
    outputPath: zod_1.z.string().optional(),
});
// Video creation validation
exports.VideoCreationSchema = zod_1.z.object({
    animationDesc: zod_1.z.string().min(1).max(2000),
    narration: zod_1.z.string().max(5000).optional(),
    sfxDesc: zod_1.z.array(zod_1.z.string().max(200)).optional(),
    imageDesc: zod_1.z.array(zod_1.z.string().max(1000)).optional(),
    duration: zod_1.z.number().positive().max(300).optional().default(30), // Max 5 minutes
    style: zod_1.z.string().max(500).optional(),
    compositionCode: zod_1.z.string().max(50000).optional(), // Complete Remotion React component code
    fps: zod_1.z.number().int().min(24).max(60).optional().default(30),
    dimensions: zod_1.z.object({
        width: zod_1.z.number().int().min(256).max(4096).default(1920),
        height: zod_1.z.number().int().min(256).max(4096).default(1080),
    }).optional(),
});
// Asset cleanup validation
exports.AssetCleanupSchema = zod_1.z.object({
    maxAge: zod_1.z.number().positive().optional(),
    dryRun: zod_1.z.boolean().optional().default(false),
    assetTypes: zod_1.z.array(zod_1.z.enum(['audio', 'image', 'video', 'temp'])).optional(),
});
// File path validation
function validateFilePath(filePath) {
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
function validateFileExtension(filePath, allowedExtensions) {
    const extension = filePath.toLowerCase().split('.').pop();
    return extension ? allowedExtensions.includes(extension) : false;
}
// Audio file validation
exports.AudioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
exports.ImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
exports.VideoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
// URL validation for external resources
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
// Text content validation (for prompts, descriptions)
function validateTextContent(text, maxLength = 1000) {
    const errors = [];
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
function validateDuration(duration) {
    if (duration <= 0) {
        return { isValid: false, error: 'Duration must be positive' };
    }
    if (duration > 600) { // 10 minutes max
        return { isValid: false, error: 'Duration cannot exceed 10 minutes' };
    }
    return { isValid: true };
}
//# sourceMappingURL=validation.js.map