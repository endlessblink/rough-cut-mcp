/**
 * Project Metadata Manager for persistent project configuration
 * Stores project-specific settings like port assignments
 */
export interface ProjectMetadata {
    lastPort: number;
    createdPort: number;
    lastLaunched: string;
    projectName: string;
    projectPath: string;
    studioVersion?: string;
}
export declare class ProjectMetadataManager {
    private logger;
    private metadataCache;
    private readonly METADATA_FILENAME;
    /**
     * Get the metadata file path for a project
     */
    private getMetadataPath;
    /**
     * Load metadata from disk
     */
    loadMetadata(projectPath: string): Promise<ProjectMetadata | null>;
    /**
     * Save metadata to disk
     */
    saveMetadata(projectPath: string, metadata: ProjectMetadata): Promise<void>;
    /**
     * Get or create metadata for a project
     */
    getOrCreateMetadata(projectPath: string, projectName: string, defaultPort: number): Promise<ProjectMetadata>;
    /**
     * Update the last launched time and port
     */
    updateLastLaunched(projectPath: string, port: number): Promise<void>;
    /**
     * Get the remembered port for a project
     */
    getProjectPort(projectPath: string): Promise<number | null>;
    /**
     * Clear cached metadata
     */
    clearCache(): void;
    /**
     * Get all cached metadata (for debugging)
     */
    getCachedMetadata(): Map<string, ProjectMetadata>;
}
export declare const projectMetadataManager: ProjectMetadataManager;
//# sourceMappingURL=project-metadata.d.ts.map