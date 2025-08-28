/**
 * Version Detection Utility
 * Detects parent MCP Remotion versions for consistent project generation
 */
interface RemotionVersions {
    cli: string;
    bundler: string;
    renderer: string;
    remotion: string;
    lambda?: string;
}
/**
 * Get the Remotion versions from parent MCP package.json
 * This ensures projects use the same versions as the parent to prevent conflicts
 */
export declare function getParentRemotionVersions(): Promise<RemotionVersions>;
/**
 * Generate package.json dependencies with conflict prevention
 */
export declare function generateSafeDependencies(): Promise<any>;
/**
 * Check if a project has version conflicts
 */
export declare function checkProjectVersionConflicts(projectPath: string): Promise<{
    hasConflicts: boolean;
    conflictDetails: string[];
}>;
/**
 * Auto-repair version conflicts in a project
 */
export declare function repairProjectVersions(projectPath: string): Promise<void>;
export {};
//# sourceMappingURL=version-detector.d.ts.map