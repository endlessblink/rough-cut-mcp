/**
 * File Integrity System for Atomic Updates
 * Prevents file corruption and ensures safe edits
 */
export interface EditOperation {
    oldString: string;
    newString: string;
    replaceAll?: boolean;
}
export interface FileUpdateResult {
    success: boolean;
    error?: string;
    backupPath?: string;
    originalContent?: string;
}
export declare class FileIntegrityManager {
    private backupDir;
    constructor(backupDir?: string);
    /**
     * Validate JSX/TSX file syntax
     */
    validateFileSyntax(content: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Create a backup of a file
     */
    private createBackup;
    /**
     * Apply edit operations to content
     */
    private applyEdits;
    /**
     * Perform atomic file update with automatic rollback on failure
     */
    atomicFileUpdate(filePath: string, operations: EditOperation[]): Promise<FileUpdateResult>;
    /**
     * Safe file write with validation
     */
    safeWriteFile(filePath: string, content: string, validate?: boolean): Promise<FileUpdateResult>;
    /**
     * Restore file from backup
     */
    restoreFromBackup(backupPath: string, targetPath: string): Promise<boolean>;
    /**
     * Clean old backups (older than specified days)
     */
    cleanOldBackups(daysToKeep?: number): Promise<number>;
}
export declare const fileIntegrity: FileIntegrityManager;
//# sourceMappingURL=file-integrity.d.ts.map