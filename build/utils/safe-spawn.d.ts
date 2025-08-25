import { SpawnOptions } from 'child_process';
export interface SafeSpawnResult {
    success: boolean;
    pid?: number;
    process?: any;
    error?: string;
    code?: number;
}
/**
 * Check if a command exists in the system PATH
 */
export declare function commandExists(command: string): Promise<boolean>;
/**
 * Check if Remotion is available via npx
 */
export declare function isRemotionAvailable(): Promise<boolean>;
/**
 * Safe spawn wrapper that prevents server crashes
 */
export declare function safeSpawn(command: string, args: string[], options?: SpawnOptions & {
    timeout?: number;
}): Promise<SafeSpawnResult>;
/**
 * Safely install npm dependencies for a project
 * Windows-optimized npm installation
 */
export declare function safeNpmInstall(projectPath: string, timeout?: number): Promise<SafeSpawnResult>;
/**
 * Get installation instructions for missing tools
 */
export declare function getInstallInstructions(tool: string): string[];
//# sourceMappingURL=safe-spawn.d.ts.map