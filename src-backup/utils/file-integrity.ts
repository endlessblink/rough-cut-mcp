/**
 * File Integrity System for Atomic Updates
 * Prevents file corruption and ensures safe edits
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { getLogger } from './logger.js';

const logger = getLogger().service('FileIntegrity');

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

export class FileIntegrityManager {
  private backupDir: string;
  
  constructor(backupDir: string = path.join(process.cwd(), '.backups')) {
    this.backupDir = backupDir;
    fs.ensureDirSync(this.backupDir);
  }

  /**
   * Validate JSX/TSX file syntax
   */
  validateFileSyntax(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Check for matching braces
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
      }
      
      // Check for matching parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
      }
      
      // Check for matching brackets
      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push(`Mismatched brackets: ${openBrackets} open, ${closeBrackets} close`);
      }
      
      // Check for matching JSX tags
      const jsxOpenTags = content.match(/<(\w+)[^>]*>/g) || [];
      const jsxCloseTags = content.match(/<\/(\w+)>/g) || [];
      const selfClosingTags = content.match(/<(\w+)[^>]*\/>/g) || [];
      
      const openTagNames = jsxOpenTags
        .filter(tag => !tag.endsWith('/>'))
        .map(tag => tag.match(/<(\w+)/)?.[1])
        .filter(Boolean);
      
      const closeTagNames = jsxCloseTags
        .map(tag => tag.match(/<\/(\w+)/)?.[1])
        .filter(Boolean);
      
      // Basic JSX validation - ensure each open tag has a close tag
      const tagStack: string[] = [];
      for (const openTag of openTagNames) {
        tagStack.push(openTag!);
      }
      
      for (const closeTag of closeTagNames) {
        const lastOpen = tagStack.pop();
        if (lastOpen !== closeTag) {
          errors.push(`JSX tag mismatch: expected </${lastOpen}>, found </${closeTag}>`);
        }
      }
      
      if (tagStack.length > 0) {
        errors.push(`Unclosed JSX tags: ${tagStack.join(', ')}`);
      }
      
      // Check for common syntax errors
      if (content.includes(';;')) {
        errors.push('Double semicolon detected');
      }
      
      if (content.includes(',,')) {
        errors.push('Double comma detected');
      }
      
      // Check for unterminated strings
      const stringMatches = content.match(/(['"`])(?:(?=(\\?))\2.)*?\1/g) || [];
      const allQuotes = content.match(/(['"`])/g) || [];
      if (allQuotes.length % 2 !== 0) {
        errors.push('Possible unterminated string');
      }
      
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a backup of a file
   */
  private async createBackup(filePath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.backup`);
    
    await fs.copy(filePath, backupPath);
    logger.debug('Backup created', { original: filePath, backup: backupPath });
    
    return backupPath;
  }

  /**
   * Apply edit operations to content
   */
  private applyEdits(content: string, operations: EditOperation[]): string {
    let result = content;
    
    for (const op of operations) {
      if (op.replaceAll) {
        result = result.split(op.oldString).join(op.newString);
      } else {
        const index = result.indexOf(op.oldString);
        if (index !== -1) {
          result = result.substring(0, index) + 
                  op.newString + 
                  result.substring(index + op.oldString.length);
        }
      }
    }
    
    return result;
  }

  /**
   * Perform atomic file update with automatic rollback on failure
   */
  async atomicFileUpdate(
    filePath: string, 
    operations: EditOperation[]
  ): Promise<FileUpdateResult> {
    
    logger.info('Starting atomic file update', { filePath, operationCount: operations.length });
    
    try {
      // 1. Check if file exists
      if (!await fs.pathExists(filePath)) {
        return {
          success: false,
          error: `File not found: ${filePath}`
        };
      }
      
      // 2. Read original content
      const originalContent = await fs.readFile(filePath, 'utf-8');
      
      // 3. Create backup
      const backupPath = await this.createBackup(filePath);
      
      try {
        // 4. Apply edits
        const updatedContent = this.applyEdits(originalContent, operations);
        
        // 5. Validate updated content
        const validation = this.validateFileSyntax(updatedContent);
        if (!validation.valid) {
          throw new Error(`Syntax validation failed: ${validation.errors.join(', ')}`);
        }
        
        // 6. Write updated content
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        
        logger.info('File updated successfully', { filePath });
        
        return {
          success: true,
          backupPath,
          originalContent
        };
        
      } catch (error) {
        // 7. Rollback on failure
        logger.error('Update failed, rolling back', { filePath, error });
        await fs.copy(backupPath, filePath, { overwrite: true });
        
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          backupPath
        };
      }
      
    } catch (error) {
      logger.error('Atomic update failed', { filePath, error });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Safe file write with validation
   */
  async safeWriteFile(
    filePath: string,
    content: string,
    validate: boolean = true
  ): Promise<FileUpdateResult> {
    
    logger.info('Safe write file', { filePath, validate });
    
    try {
      // Validate if requested
      if (validate) {
        const validation = this.validateFileSyntax(content);
        if (!validation.valid) {
          return {
            success: false,
            error: `Syntax validation failed: ${validation.errors.join(', ')}`
          };
        }
      }
      
      // Create backup if file exists
      let backupPath: string | undefined;
      let originalContent: string | undefined;
      
      if (await fs.pathExists(filePath)) {
        originalContent = await fs.readFile(filePath, 'utf-8');
        backupPath = await this.createBackup(filePath);
      }
      
      // Write file
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
      
      logger.info('File written successfully', { filePath });
      
      return {
        success: true,
        backupPath,
        originalContent
      };
      
    } catch (error) {
      logger.error('Safe write failed', { filePath, error });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Restore file from backup
   */
  async restoreFromBackup(backupPath: string, targetPath: string): Promise<boolean> {
    try {
      await fs.copy(backupPath, targetPath, { overwrite: true });
      logger.info('File restored from backup', { backupPath, targetPath });
      return true;
    } catch (error) {
      logger.error('Failed to restore from backup', { backupPath, targetPath, error });
      return false;
    }
  }

  /**
   * Clean old backups (older than specified days)
   */
  async cleanOldBackups(daysToKeep: number = 7): Promise<number> {
    try {
      const files = await fs.readdir(this.backupDir);
      const now = Date.now();
      const cutoff = daysToKeep * 24 * 60 * 60 * 1000;
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > cutoff) {
          await fs.remove(filePath);
          deletedCount++;
        }
      }
      
      logger.info('Cleaned old backups', { deletedCount, daysToKeep });
      return deletedCount;
      
    } catch (error) {
      logger.error('Failed to clean backups', { error });
      return 0;
    }
  }
}

// Export singleton instance
export const fileIntegrity = new FileIntegrityManager();