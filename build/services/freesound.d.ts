import { MCPConfig, SoundEffectRequest, SoundEffectResult } from '../types/index.js';
import { FreesoundSearchResponse, FreesoundSound } from '../types/api-responses.js';
export declare class FreesoundService {
    private client;
    private config;
    private logger;
    private readonly baseUrl;
    constructor(config: MCPConfig);
    /**
     * Search for sound effects
     */
    searchSounds(query: string, filters?: {
        duration?: string;
        license?: string;
        type?: string;
        channels?: number;
        page?: number;
        pageSize?: number;
    }): Promise<FreesoundSearchResponse>;
    /**
     * Download a sound file
     */
    downloadSound(sound: FreesoundSound, outputDir?: string): Promise<SoundEffectResult>;
    /**
     * Search and download sound effects based on request
     */
    searchAndDownload(request: SoundEffectRequest): Promise<SoundEffectResult[]>;
    /**
     * Get sound details by ID
     */
    getSoundById(soundId: string): Promise<FreesoundSound>;
    /**
     * Test the Freesound connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get popular sounds in a category
     */
    getPopularSounds(category?: string, pageSize?: number): Promise<FreesoundSound[]>;
    /**
     * Search with advanced filters
     */
    advancedSearch(params: {
        query: string;
        minDuration?: number;
        maxDuration?: number;
        license?: string;
        fileType?: string;
        sampleRate?: number;
        channels?: 'mono' | 'stereo';
        page?: number;
        pageSize?: number;
    }): Promise<FreesoundSearchResponse>;
}
//# sourceMappingURL=freesound.d.ts.map