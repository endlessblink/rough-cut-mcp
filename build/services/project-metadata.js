"use strict";
/**
 * Project Metadata Manager for persistent project configuration
 * Stores project-specific settings like port assignments
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectMetadataManager = exports.ProjectMetadataManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const logger_js_1 = require("../utils/logger.js");
class ProjectMetadataManager {
    logger = (0, logger_js_1.getLogger)().service('ProjectMetadata');
    metadataCache = new Map();
    METADATA_FILENAME = '.studio-metadata.json';
    /**
     * Get the metadata file path for a project
     */
    getMetadataPath(projectPath) {
        return path.join(projectPath, this.METADATA_FILENAME);
    }
    /**
     * Load metadata from disk
     */
    async loadMetadata(projectPath) {
        try {
            const metadataPath = this.getMetadataPath(projectPath);
            // Check if metadata file exists
            const exists = await fs_extra_1.default.pathExists(metadataPath);
            if (!exists) {
                this.logger.debug('No metadata file found', { projectPath });
                return null;
            }
            // Read and parse metadata
            const data = await fs_extra_1.default.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(data);
            // Cache for quick access
            this.metadataCache.set(projectPath, metadata);
            this.logger.debug('Loaded project metadata', {
                projectPath,
                port: metadata.lastPort
            });
            return metadata;
        }
        catch (error) {
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
    async saveMetadata(projectPath, metadata) {
        try {
            const metadataPath = this.getMetadataPath(projectPath);
            // Ensure directory exists
            await fs_extra_1.default.ensureDir(path.dirname(metadataPath));
            // Update cache
            this.metadataCache.set(projectPath, metadata);
            // Write to disk with pretty formatting
            await fs_extra_1.default.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
            this.logger.debug('Saved project metadata', {
                projectPath,
                port: metadata.lastPort
            });
        }
        catch (error) {
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
    async getOrCreateMetadata(projectPath, projectName, defaultPort) {
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
    async updateLastLaunched(projectPath, port) {
        const metadata = await this.loadMetadata(projectPath);
        if (metadata) {
            metadata.lastPort = port;
            metadata.lastLaunched = new Date().toISOString();
            await this.saveMetadata(projectPath, metadata);
        }
        else {
            this.logger.warn('Cannot update metadata - not found', { projectPath });
        }
    }
    /**
     * Get the remembered port for a project
     */
    async getProjectPort(projectPath) {
        const metadata = await this.loadMetadata(projectPath);
        return metadata ? metadata.lastPort : null;
    }
    /**
     * Clear cached metadata
     */
    clearCache() {
        this.metadataCache.clear();
    }
    /**
     * Get all cached metadata (for debugging)
     */
    getCachedMetadata() {
        return new Map(this.metadataCache);
    }
}
exports.ProjectMetadataManager = ProjectMetadataManager;
// Export singleton instance
exports.projectMetadataManager = new ProjectMetadataManager();
//# sourceMappingURL=project-metadata.js.map