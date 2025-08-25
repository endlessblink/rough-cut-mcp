import { spawn, SpawnOptions } from 'child_process';
/**
 * Fix for Windows spawn EINVAL issues
 * Wraps child_process.spawn with proper shell configuration
 */
export declare function createRemotionProcess(command: string, args?: string[], options?: SpawnOptions): ReturnType<typeof spawn>;
/**
 * Normalize paths for cross-platform compatibility
 */
export declare function normalizePath(filePath: string): string;
/**
 * Get platform-specific Remotion bundler options
 */
export declare function getBundlerOptions(): {
    webpackOverride: (config: any) => any;
} | {
    webpackOverride?: undefined;
};
/**
 * Patch Remotion's internal spawn calls
 */
export declare function patchRemotionSpawn(): void;
//# sourceMappingURL=platform-fix.d.ts.map