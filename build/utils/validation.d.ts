import { z } from 'zod';
export declare const VoiceGenerationSchema: z.ZodObject<{
    text: z.ZodString;
    voiceId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    modelId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    voiceId: string;
    modelId: string;
    outputPath?: string | undefined;
}, {
    text: string;
    voiceId?: string | undefined;
    modelId?: string | undefined;
    outputPath?: string | undefined;
}>;
export declare const SoundEffectSearchSchema: z.ZodObject<{
    query: z.ZodString;
    duration: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    outputDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    duration: string;
    query: string;
    maxResults: number;
    outputDir?: string | undefined;
}, {
    query: string;
    duration?: string | undefined;
    maxResults?: number | undefined;
    outputDir?: string | undefined;
}>;
export declare const ImageGenerationSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model: string;
    prompt: string;
    width: number;
    height: number;
    outputPath?: string | undefined;
}, {
    prompt: string;
    model?: string | undefined;
    outputPath?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
}>;
export declare const VideoCreationSchema: z.ZodObject<{
    animationDesc: z.ZodString;
    narration: z.ZodOptional<z.ZodString>;
    sfxDesc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    imageDesc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    duration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    style: z.ZodOptional<z.ZodString>;
    compositionCode: z.ZodOptional<z.ZodString>;
    fps: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    dimensions: z.ZodOptional<z.ZodObject<{
        width: z.ZodDefault<z.ZodNumber>;
        height: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
    }, {
        width?: number | undefined;
        height?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    fps: number;
    animationDesc: string;
    dimensions?: {
        width: number;
        height: number;
    } | undefined;
    compositionCode?: string | undefined;
    narration?: string | undefined;
    sfxDesc?: string[] | undefined;
    imageDesc?: string[] | undefined;
    style?: string | undefined;
}, {
    animationDesc: string;
    dimensions?: {
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
    duration?: number | undefined;
    fps?: number | undefined;
    compositionCode?: string | undefined;
    narration?: string | undefined;
    sfxDesc?: string[] | undefined;
    imageDesc?: string[] | undefined;
    style?: string | undefined;
}>;
export declare const AssetCleanupSchema: z.ZodObject<{
    maxAge: z.ZodOptional<z.ZodNumber>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    assetTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["audio", "image", "video", "temp"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    maxAge?: number | undefined;
    assetTypes?: ("image" | "audio" | "video" | "temp")[] | undefined;
}, {
    maxAge?: number | undefined;
    dryRun?: boolean | undefined;
    assetTypes?: ("image" | "audio" | "video" | "temp")[] | undefined;
}>;
export declare function validateFilePath(filePath: string): boolean;
export declare function validateFileExtension(filePath: string, allowedExtensions: string[]): boolean;
export declare const AudioExtensions: string[];
export declare const ImageExtensions: string[];
export declare const VideoExtensions: string[];
export declare function validateUrl(url: string): boolean;
export declare function validateTextContent(text: string, maxLength?: number): {
    isValid: boolean;
    errors: string[];
};
export declare function validateDuration(duration: number): {
    isValid: boolean;
    error?: string;
};
//# sourceMappingURL=validation.d.ts.map