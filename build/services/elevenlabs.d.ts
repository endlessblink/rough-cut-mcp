import { MCPConfig, VoiceGenerationRequest, VoiceGenerationResult } from '../types/index.js';
export declare class ElevenLabsService {
    private client;
    private config;
    private logger;
    constructor(config: MCPConfig);
    /**
     * Generate voice audio from text
     */
    generateVoice(request: VoiceGenerationRequest): Promise<VoiceGenerationResult>;
    /**
     * Get available voices
     */
    getVoices(): Promise<any[]>;
    /**
     * Get voice by ID with details
     */
    getVoiceById(voiceId: string): Promise<any>;
    /**
     * Test the ElevenLabs connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Generate voice with retry logic
     */
    generateVoiceWithRetry(request: VoiceGenerationRequest, maxRetries?: number): Promise<VoiceGenerationResult>;
}
//# sourceMappingURL=elevenlabs.d.ts.map