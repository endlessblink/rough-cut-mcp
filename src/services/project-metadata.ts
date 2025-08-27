/**
 * Project Metadata Manager for persistent project configuration
 * Stores project-specific settings like port assignments
 */

import fs from 'fs-extra';
import * as path from 'path';
import { getLogger } from '../utils/logger.js';

export interface ProjectMetadata {
  lastPort: number;
  createdPort: number;
  lastLaunched: string;
  projectName: string;
  projectPath: string;
  studioVersion?: string;
}

export class ProjectMetadataManager {
  private logger = getLogger().service('ProjectMetadata');
  private metadataCache = new Map<string, ProjectMetadata>();
  private readonly METADATA_FILENAME = '.studio-metadata.json';

  /**
   * Get the metadata file path for a project
   */
  private getMetadataPath(projectPath: string): string {
    return path.join(projectPath, this.METADATA_FILENAME);
  }

  /**
   * Load metadata from disk
   */
  async loadMetadata(projectPath: string): Promise<ProjectMetadata | null> {
    try {
      const metadataPath = this.getMetadataPath(projectPath);
      
      // Check if metadata file exists
      const exists = await fs.pathExists(metadataPath);
      if (!exists) {
        this.logger.debug('No metadata file found', { projectPath });
        return null;
      }

      // Read and parse metadata
      const data = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(data) as ProjectMetadata;
      
      // Cache for quick access
      this.metadataCache.set(projectPath, metadata);
      
      this.logger.debug('Loaded project metadata', { 
        projectPath, 
        port: metadata.lastPort 
      });
      
      return metadata;
    } catch (error) {
      this.logger.warn('Failed to load project metadata', { 
        projectPath,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Save metadata to disk
   */
  async saveMetadata(projectPath: string, metadata: ProjectMetadata): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath(projectPath);
      
      // Ensure directory exists
      await fs.ensureDir(path.dirname(metadataPath));
      
      // Update cache
      this.metadataCache.set(projectPath, metadata);
      
      // Write to disk with pretty formatting
      await fs.writeFile(
        metadataPath, 
        JSON.stringify(metadata, null, 2),
        'utf-8'
      );
      
      this.logger.debug('Saved project metadata', { 
        projectPath, 
        port: metadata.lastPort 
      });
    } catch (error) {
      this.logger.error('Failed to save project metadata', { 
        projectPath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get or create metadata for a project
   */
  async getOrCreateMetadata(
    projectPath: string, 
    projectName: string,
    defaultPort: number
  ): Promise<ProjectMetadata> {
    // Try to load existing metadata
    let metadata = await this.loadMetadata(projectPath);
    
    if (!metadata) {
      // Create new metadata
      metadata = {
        lastPort: defaultPort,
        createdPort: defaultPort,
        lastLaunched: new Date().toISOString(),
        projectName: projectName,
        projectPath: projectPath
      };
      
      await this.saveMetadata(projectPath, metadata);
      this.logger.info('Created new project metadata', { 
        projectName, 
        port: defaultPort 
      });
    }
    
    return metadata;
  }

  /**
   * Update the last launched time and port
   */
  async updateLastLaunched(
    projectPath: string, 
    port: number
  ): Promise<void> {
    const metadata = await this.loadMetadata(projectPath);
    
    if (metadata) {
      metadata.lastPort = port;
      metadata.lastLaunched = new Date().toISOString();
      await this.saveMetadata(projectPath, metadata);
    } else {
      this.logger.warn('Cannot update metadata - not found', { projectPath });
    }
  }

  /**
   * Get the remembered port for a project
   */
  async getProjectPort(projectPath: string): Promise<number | null> {
    const metadata = await this.loadMetadata(projectPath);
    return metadata ? metadata.lastPort : null;
  }

  /**
   * Clear cached metadata
   */
  clearCache(): void {
    this.metadataCache.clear();
  }

  /**
   * Get all cached metadata (for debugging)
   */
  getCachedMetadata(): Map<string, ProjectMetadata> {
    return new Map(this.metadataCache);
  }
}

// Export singleton instance
export const projectMetadataManager = new ProjectMetadataManager();