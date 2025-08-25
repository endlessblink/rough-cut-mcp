export interface ElevenLabsVoiceResponse {
    audio_base64?: string;
    alignment?: {
        character_start_times_seconds: number[];
        character_end_times_seconds: number[];
    };
    normalized_alignment?: {
        char_start_times_seconds: number[];
        char_end_times_seconds: number[];
        chars_durations_seconds: number[];
    };
}
export interface FreesoundSearchResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: FreesoundSound[];
}
export interface FreesoundSound {
    id: number;
    name: string;
    description: string;
    username: string;
    created: string;
    license: string;
    download: string;
    previews: {
        'preview-hq-mp3': string;
        'preview-hq-ogg': string;
        'preview-lq-mp3': string;
        'preview-lq-ogg': string;
    };
    images: {
        waveform_m: string;
        waveform_l: string;
        spectral_m: string;
        spectral_l: string;
    };
    duration: number;
    filesize: number;
    type: string;
    channels: number;
    samplerate: number;
    bitrate: number;
    bitdepth: number;
    pack?: string;
    pack_name?: string;
    tags: string[];
    url: string;
}
export interface FluxImageResponse {
    id: string;
    status: 'pending' | 'ready' | 'error';
    result?: {
        sample: string;
        timings?: {
            inference: number;
        };
        seed: number;
    };
    error?: string;
}
export interface RemotionRenderProgress {
    renderedFrames: number;
    encodedFrames: number;
    encodedDoneIn: number | null;
    renderedDoneIn: number | null;
    renderEstimatedTime: number;
    progress: number;
    stitchStage: 'encoding' | 'muxing' | null;
}
export interface RemotionRenderResult {
    outputPath: string;
    sizeInBytes: number;
    renderMetadata: {
        startedDate: number;
        finishedDate: number;
        totalRenderTime: number;
        renderPlatform: string;
        renderEngine: string;
        width: number;
        height: number;
        fps: number;
        durationInFrames: number;
        composition: string;
    };
}
//# sourceMappingURL=api-responses.d.ts.map