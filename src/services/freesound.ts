// Freesound.org sound effects search and download service
import axios, { AxiosInstance } from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MCPConfig, SoundEffectRequest, SoundEffectResult } from '../types/index.js';
import { FreesoundSearchResponse, FreesoundSound } from '../types/api-responses.js';
import { getAssetPath } from '../utils/config.js';
import { getLogger } from '../utils/logger.js';
import { validateTextContent, validateFileExtension, AudioExtensions } from '../utils/validation.js';

export class FreesoundService {
  private client: AxiosInstance;
  private config: MCPConfig;
  private logger = getLogger().service('Freesound');
  private readonly baseUrl = 'https://freesound.org/apiv2';

  constructor(config: MCPConfig) {
    this.config = config;
    
    if (!config.apiKeys.freesound) {
      throw new Error('Freesound API key is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Token ${config.apiKeys.freesound}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.logger.info('Freesound service initialized');
  }

  /**
   * Search for sound effects
   */
  async searchSounds(query: string, filters?: {
    duration?: string;
    license?: string;
    type?: string;
    channels?: number;
    page?: number;
    pageSize?: number;
  }): Promise<FreesoundSearchResponse> {
    try {
      this.logger.info('Searching sounds', { query, filters });

      const params: any = {
        query,
        page: filters?.page || 1,
        page_size: filters?.pageSize || 15,
        fields: 'id,name,description,username,created,license,download,previews,images,duration,filesize,type,channels,samplerate,bitrate,bitdepth,pack,pack_name,tags,url',
      };

      // Add filters
      const filterArray: string[] = [];
      
      if (filters?.duration) {
        filterArray.push(`duration:${filters.duration}`);
      }
      
      if (filters?.license) {
        filterArray.push(`license:"${filters.license}"`);
      }
      
      if (filters?.type) {
        filterArray.push(`type:${filters.type}`);
      }
      
      if (filters?.channels) {
        filterArray.push(`channels:${filters.channels}`);
      }

      if (filterArray.length > 0) {
        params.filter = filterArray.join(' ');
      }

      const response = await this.client.get('/search/text/', { params });
      
      this.logger.info('Sound search completed', { 
        query,
        resultsCount: response.data.count,
        page: params.page 
      });

      return response.data;

    } catch (error) {
      this.logger.error('Sound search failed', { 
        query,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Download a sound file
   */
  async downloadSound(sound: FreesoundSound, outputDir?: string): Promise<SoundEffectResult> {
    const startTime = Date.now();
    this.logger.info('Starting sound download', { 
      soundId: sound.id,
      name: sound.name,
      duration: sound.duration 
    });

    try {
      // Prepare output path
      const audioDir = outputDir || getAssetPath(this.config, 'audio');
      await fs.ensureDir(audioDir);
      
      // Sanitize filename
      const sanitizedName = sound.name
        .replace(/[^\w\s.-]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 100); // Limit length
        
      const extension = path.extname(sound.name) || '.mp3';
      const filename = `${sanitizedName}_${sound.id}${extension}`;
      const audioPath = path.join(audioDir, filename);

      // Get download URL (requires OAuth for high-quality downloads)
      // For now, use preview URL which doesn't require OAuth
      const downloadUrl = sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3'];
      
      if (!downloadUrl) {
        throw new Error('No download URL available for this sound');
      }

      // Download the file
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // 1 minute timeout for downloads
      });

      // Save the file
      await fs.writeFile(audioPath, Buffer.from(response.data));

      const result: SoundEffectResult = {
        audioPath,
        filename,
        duration: sound.duration,
        metadata: {
          id: String(sound.id),
          name: sound.name,
          description: sound.description,
          license: sound.license,
          username: sound.username,
          url: sound.url,
          timestamp: new Date().toISOString(),
        },
      };

      const endTime = Date.now();
      this.logger.info('Sound download completed', {
        soundId: sound.id,
        duration: endTime - startTime,
        audioPath,
        fileSize: response.data.byteLength,
      });

      return result;

    } catch (error) {
      this.logger.error('Sound download failed', { 
        soundId: sound.id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Search and download sound effects based on request
   */
  async searchAndDownload(request: SoundEffectRequest): Promise<SoundEffectResult[]> {
    try {
      // Validate input
      const textValidation = validateTextContent(request.query, 200);
      if (!textValidation.isValid) {
        throw new Error(`Invalid search query: ${textValidation.errors.join(', ')}`);
      }

      // Search for sounds
      const searchResponse = await this.searchSounds(request.query, {
        duration: request.duration,
        pageSize: request.maxResults || 5,
      });

      if (!searchResponse.results || searchResponse.results.length === 0) {
        this.logger.warn('No sounds found for query', { query: request.query });
        return [];
      }

      // Download the sounds
      const downloadPromises = searchResponse.results
        .slice(0, request.maxResults || 5)
        .map(sound => this.downloadSound(sound, request.outputDir));

      const results = await Promise.allSettled(downloadPromises);
      
      const successfulDownloads: SoundEffectResult[] = [];
      const failures: any[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulDownloads.push(result.value);
        } else {
          failures.push({
            soundId: searchResponse.results[index].id,
            error: result.reason,
          });
        }
      });

      if (failures.length > 0) {
        this.logger.warn('Some sound downloads failed', { 
          successCount: successfulDownloads.length,
          failureCount: failures.length,
          failures: failures.map(f => f.error.message || f.error)
        });
      }

      this.logger.info('Sound search and download completed', {
        query: request.query,
        totalFound: searchResponse.count,
        downloaded: successfulDownloads.length,
        failed: failures.length,
      });

      return successfulDownloads;

    } catch (error) {
      this.logger.error('Search and download failed', { 
        query: request.query,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get sound details by ID
   */
  async getSoundById(soundId: string): Promise<FreesoundSound> {
    try {
      this.logger.debug('Fetching sound details', { soundId });
      
      const response = await this.client.get(`/sounds/${soundId}/`, {
        params: {
          fields: 'id,name,description,username,created,license,download,previews,images,duration,filesize,type,channels,samplerate,bitrate,bitdepth,pack,pack_name,tags,url',
        },
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch sound details', { 
        soundId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Test the Freesound connection
   */
  async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Testing Freesound connection');
      
      // Test with a simple search
      await this.searchSounds('test', { pageSize: 1 });
      
      this.logger.info('Freesound connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Freesound connection test failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Get popular sounds in a category
   */
  async getPopularSounds(category?: string, pageSize: number = 10): Promise<FreesoundSound[]> {
    try {
      const query = category || 'ambient music nature';
      
      const response = await this.searchSounds(query, {
        pageSize,
        duration: '[1 TO 30]', // 1 to 30 seconds
      });

      return response.results || [];
    } catch (error) {
      this.logger.error('Failed to fetch popular sounds', { 
        category,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Search with advanced filters
   */
  async advancedSearch(params: {
    query: string;
    minDuration?: number;
    maxDuration?: number;
    license?: string;
    fileType?: string;
    sampleRate?: number;
    channels?: 'mono' | 'stereo';
    page?: number;
    pageSize?: number;
  }): Promise<FreesoundSearchResponse> {
    const filters: any = {};
    
    if (params.minDuration !== undefined || params.maxDuration !== undefined) {
      const min = params.minDuration || 0;
      const max = params.maxDuration || 300;
      filters.duration = `[${min} TO ${max}]`;
    }
    
    if (params.license) {
      filters.license = params.license;
    }
    
    if (params.fileType) {
      filters.type = params.fileType;
    }
    
    if (params.channels) {
      filters.channels = params.channels === 'mono' ? 1 : 2;
    }

    return this.searchSounds(params.query, {
      ...filters,
      page: params.page,
      pageSize: params.pageSize,
    });
  }
}