import * as fs from 'fs-extra';
import * as path from 'path';

// ====== HYBRID TIMEOUT PROTECTION + RESUMPTION SYSTEM ======

export interface ProcessingCheckpoint {
  operationId: string;
  stage: 'backup' | 'jsx_cleaning' | 'jsx_validation' | 'jsx_export' | 'file_writing' | 'completed';
  progress: number;
  data: {
    originalJSX?: string;
    processedJSX?: string;
    currentChunk?: number;
    totalChunks?: number;
    intermediateResults?: string[];
    backupPath?: string;
    chunkSize?: number;
    lastProcessedIndex?: number;
    processingStartTime?: number;
    stageStartTime?: number;
  };
  timestamp: number;
  projectName: string;
  lastActivity: number;
}

class CheckpointManager {
  private checkpoints = new Map<string, ProcessingCheckpoint>();
  private maxCheckpoints = 50; // Reasonable limit
  private checkpointFile: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Store checkpoints in project directory for persistence
    this.checkpointFile = path.resolve(__dirname, '..', '.mcp-checkpoints.json');
    this.loadCheckpoints();
    
    // Clean up stale checkpoints on startup
    this.cleanStaleOperations(24); // Remove operations older than 24 hours
  }

  private async loadCheckpoints(): Promise<void> {
    try {
      if (await fs.pathExists(this.checkpointFile)) {
        const data = await fs.readFile(this.checkpointFile, 'utf-8');
        const saved = JSON.parse(data);
        
        // Convert object back to Map
        this.checkpoints = new Map(Object.entries(saved));
        console.error(`[CHECKPOINT] Loaded ${this.checkpoints.size} checkpoints from disk`);
      }
    } catch (error) {
      console.error('[CHECKPOINT] Failed to load checkpoints, starting fresh:', error);
      this.checkpoints.clear();
    }
  }

  private async saveCheckpointsToDisk(): Promise<void> {
    try {
      // Convert Map to object for JSON serialization
      const obj = Object.fromEntries(this.checkpoints);
      await fs.writeFile(this.checkpointFile, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.error('[CHECKPOINT] Failed to save checkpoints to disk:', error);
    }
  }

  saveCheckpoint(checkpoint: ProcessingCheckpoint): void {
    // Clean old checkpoints if approaching limit
    if (this.checkpoints.size >= this.maxCheckpoints) {
      const oldestEntries = Array.from(this.checkpoints.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp);
      
      // Remove oldest 10 checkpoints
      for (let i = 0; i < Math.min(10, oldestEntries.length); i++) {
        this.checkpoints.delete(oldestEntries[i][0]);
      }
      
      console.error(`[CHECKPOINT] Cleaned old checkpoints, now have ${this.checkpoints.size}`);
    }
    
    checkpoint.lastActivity = Date.now();
    this.checkpoints.set(checkpoint.operationId, checkpoint);
    
    console.error(`[CHECKPOINT] Saved: ${checkpoint.operationId} at stage ${checkpoint.stage} (${checkpoint.progress}%)`);
    
    // Debounced save to disk (avoid excessive writes)
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveCheckpointsToDisk().catch(err => 
        console.error('[CHECKPOINT] Failed to persist to disk:', err)
      );
    }, 1000); // Save after 1 second of inactivity
  }

  getCheckpoint(operationId: string): ProcessingCheckpoint | undefined {
    return this.checkpoints.get(operationId);
  }

  removeCheckpoint(operationId: string): void {
    this.checkpoints.delete(operationId);
    console.error(`[CHECKPOINT] Removed: ${operationId}`);
    
    // Immediate save for removals
    this.saveCheckpointsToDisk().catch(err => 
      console.error('[CHECKPOINT] Failed to persist removal to disk:', err)
    );
  }

  listActiveOperations(): string[] {
    return Array.from(this.checkpoints.keys());
  }

  getDetailedOperations(): Array<{
    operationId: string;
    stage: string;
    progress: number;
    projectName: string;
    ageSeconds: number;
    isStale: boolean;
  }> {
    const now = Date.now();
    return Array.from(this.checkpoints.entries()).map(([id, checkpoint]) => ({
      operationId: id,
      stage: checkpoint.stage,
      progress: checkpoint.progress,
      projectName: checkpoint.projectName,
      ageSeconds: Math.floor((now - checkpoint.timestamp) / 1000),
      isStale: (now - checkpoint.lastActivity) > (30 * 60 * 1000) // 30 minutes
    }));
  }

  cleanStaleOperations(maxAgeHours: number = 24): number {
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    for (const [id, checkpoint] of this.checkpoints.entries()) {
      if (now - checkpoint.timestamp > maxAge) {
        this.checkpoints.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.error(`[CHECKPOINT] Cleaned ${cleaned} stale operations`);
      this.saveCheckpointsToDisk().catch(err => 
        console.error('[CHECKPOINT] Failed to persist cleanup to disk:', err)
      );
    }

    return cleaned;
  }
}

// Global checkpoint manager instance
export const checkpointManager = new CheckpointManager();

export class ResumableJSXProcessor {
  private readonly chunkSize = 500; // Process 500 chars at a time
  private readonly stageTimeout = 8000; // 8 seconds per stage
  private readonly chunkYieldInterval = 3; // Yield every 3 chunks

  /**
   * Process JSX with timeout protection AND resumption capability
   * If timeout occurs, saves checkpoint and throws resumable error
   * If checkpoint exists, continues from where it left off
   */
  async processJSXWithResumption(
    jsx: string,
    projectName: string,
    operationId: string,
    existingCheckpoint?: ProcessingCheckpoint
  ): Promise<string> {
    
    let checkpoint: ProcessingCheckpoint;
    
    if (existingCheckpoint) {
      console.error(`[RESUME] Continuing operation ${operationId} from stage ${existingCheckpoint.stage} (${existingCheckpoint.progress}%)`);
      checkpoint = existingCheckpoint;
      checkpoint.lastActivity = Date.now();
      checkpoint.data.stageStartTime = Date.now(); // Reset stage timer
    } else {
      console.error(`[NEW-OP] Starting new operation ${operationId} for project ${projectName}`);
      checkpoint = {
        operationId,
        stage: 'jsx_cleaning',
        progress: 0,
        data: {
          originalJSX: jsx,
          chunkSize: this.chunkSize,
          lastProcessedIndex: 0,
          processingStartTime: Date.now(),
          stageStartTime: Date.now()
        },
        timestamp: Date.now(),
        lastActivity: Date.now(),
        projectName
      };
      checkpointManager.saveCheckpoint(checkpoint);
    }

    try {
      // Stage 1: JSX Cleaning (resumable, chunked processing)
      if (checkpoint.stage === 'jsx_cleaning') {
        console.error(`[PROCESSING] ${existingCheckpoint ? 'Resuming' : 'Starting'} JSX cleaning...`);
        
        checkpoint.data.processedJSX = await this.resumableJSXCleaning(
          checkpoint.data.originalJSX || jsx, 
          checkpoint
        );
        
        checkpoint.stage = 'jsx_validation';
        checkpoint.progress = 60;
        checkpointManager.saveCheckpoint(checkpoint);
      }

      // Stage 2: JSX Validation (usually fast, but timeout-protected)
      if (checkpoint.stage === 'jsx_validation') {
        console.error(`[PROCESSING] JSX validation...`);
        
        const validationResult = await this.timeoutProtectedOperation(
          () => this.validateJSXStructure(checkpoint.data.processedJSX!),
          'jsx_validation',
          checkpoint
        );
        
        if (!validationResult) {
          throw new Error('JSX validation failed - structure is incomplete or malformed');
        }
        
        checkpoint.stage = 'jsx_export';
        checkpoint.progress = 80;
        checkpointManager.saveCheckpoint(checkpoint);
      }

      // Stage 3: Export Processing (usually fast, but timeout-protected)
      if (checkpoint.stage === 'jsx_export') {
        console.error(`[PROCESSING] Ensuring proper exports...`);
        
        const finalJSX = await this.timeoutProtectedOperation(
          () => Promise.resolve(this.ensureProperExport(checkpoint.data.processedJSX!)),
          'jsx_export',
          checkpoint
        );
        
        checkpoint.data.processedJSX = finalJSX;
        checkpoint.stage = 'completed';
        checkpoint.progress = 100;
        checkpointManager.saveCheckpoint(checkpoint);
      }

      // Operation completed successfully
      const totalTime = Date.now() - (checkpoint.data.processingStartTime || checkpoint.timestamp);
      console.error(`[SUCCESS] Operation ${operationId} completed in ${totalTime}ms`);
      
      checkpointManager.removeCheckpoint(operationId);
      return checkpoint.data.processedJSX!;

    } catch (error) {
      const isTimeoutError = error instanceof Error && error.message.includes('RESUMABLE_TIMEOUT');
      
      if (isTimeoutError) {
        console.error(`[TIMEOUT] Operation ${operationId} timed out at stage ${checkpoint.stage}, checkpoint saved`);
        // Update final checkpoint state
        checkpoint.lastActivity = Date.now();
        checkpointManager.saveCheckpoint(checkpoint);
      } else {
        console.error(`[ERROR] Operation ${operationId} failed at stage ${checkpoint.stage}:`, error);
      }
      
      throw error;
    }
  }

  /**
   * Wrapper that applies timeout protection to any operation
   * Saves checkpoint if timeout occurs
   */
  private async timeoutProtectedOperation<T>(
    operation: () => Promise<T>,
    stageName: string,
    checkpoint: ProcessingCheckpoint
  ): Promise<T> {
    
    const stageStart = Date.now();
    checkpoint.data.stageStartTime = stageStart;
    
    return new Promise<T>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        const elapsed = Date.now() - stageStart;
        console.error(`[TIMEOUT] Stage ${stageName} timed out after ${elapsed}ms`);
        
        checkpoint.lastActivity = Date.now();
        checkpointManager.saveCheckpoint(checkpoint);
        
        reject(new Error(`RESUMABLE_TIMEOUT: Stage ${stageName} timed out. Resume with operation ID: ${checkpoint.operationId}`));
      }, this.stageTimeout);
      
      operation()
        .then(result => {
          clearTimeout(timeoutHandle);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutHandle);
          reject(error);
        });
    });
  }

  /**
   * Resumable JSX cleaning with chunk-based processing
   * Can resume from any chunk position
   */
  private async resumableJSXCleaning(jsx: string, checkpoint: ProcessingCheckpoint): Promise<string> {
    const chunks = this.splitIntoChunks(jsx, checkpoint.data.chunkSize || this.chunkSize);
    let processedChunks: string[] = checkpoint.data.intermediateResults || [];
    let startChunk = checkpoint.data.currentChunk || 0;
    const stageStart = checkpoint.data.stageStartTime || Date.now();

    console.error(`[CHUNK-PROCESSING] ${startChunk > 0 ? 'Resuming' : 'Starting'} from chunk ${startChunk}/${chunks.length}`);

    // Safety check: ensure consistency when resuming
    if (startChunk > 0 && processedChunks.length !== startChunk) {
      console.error(`[SAFETY] Checkpoint inconsistency detected. Expected ${startChunk} processed chunks, found ${processedChunks.length}. Resetting.`);
      processedChunks = [];
      startChunk = 0;
    }

    for (let i = startChunk; i < chunks.length; i++) {
      // Check for stage timeout
      const elapsed = Date.now() - stageStart;
      if (elapsed > this.stageTimeout - 500) { // Leave 500ms buffer
        console.error(`[TIMEOUT-APPROACHING] Saving checkpoint at chunk ${i}/${chunks.length} after ${elapsed}ms`);
        
        // Save checkpoint with current progress
        checkpoint.data.currentChunk = i;
        checkpoint.data.totalChunks = chunks.length;
        checkpoint.data.intermediateResults = processedChunks;
        checkpoint.progress = Math.floor((i / chunks.length) * 60); // 0-60% for cleaning stage
        checkpoint.lastActivity = Date.now();
        checkpointManager.saveCheckpoint(checkpoint);
        
        throw new Error(`RESUMABLE_TIMEOUT: JSX cleaning timed out at chunk ${i}/${chunks.length}. Resume with operation ID: ${checkpoint.operationId}`);
      }

      // Process chunk safely
      const cleanedChunk = this.cleanJSXChunkSafely(chunks[i]);
      processedChunks.push(cleanedChunk);

      // Yield control periodically and update checkpoint
      if (i % this.chunkYieldInterval === 0 && i > startChunk) {
        await this.yieldControl();
        
        // Update checkpoint progress
        checkpoint.data.currentChunk = i;
        checkpoint.data.totalChunks = chunks.length;
        checkpoint.data.intermediateResults = processedChunks;
        checkpoint.progress = Math.floor((i / chunks.length) * 60);
        checkpoint.lastActivity = Date.now();
        checkpointManager.saveCheckpoint(checkpoint);
      }
    }

    const result = processedChunks.join('');
    console.error(`[CHUNK-PROCESSING] Completed all ${chunks.length} chunks, result length: ${result.length}`);
    
    return result;
  }

  /**
   * Safe JSX chunk cleaning without regex catastrophic backtracking
   */
  private cleanJSXChunkSafely(chunk: string): string {
    if (!chunk || chunk.length === 0) return chunk;
    
    let cleaned = chunk;
    
    try {
      // Step 1: Simple template literal replacement (non-greedy)
      cleaned = cleaned.replace(/`([^`${}]*)`/g, '"$1"');
      
      // Step 2: Remove incomplete expressions
      cleaned = cleaned.replace(/\$\{[^}]*$/g, '');
      
      // Step 3: Remove Composition tags (simple patterns only)
      cleaned = cleaned.replace(/<Composition[^>]*>/g, '');
      cleaned = cleaned.replace(/<\/Composition>/g, '');
      
      // Step 4: Clean component props with safe string parsing (not regex)
      cleaned = this.extractComponentPropsFromChunk(cleaned);
      
    } catch (error) {
      console.error('[WARNING] Error in chunk cleaning, returning original:', error);
      return chunk;
    }
    
    return cleaned;
  }

  /**
   * Extract component props using safe string parsing instead of regex
   */
  private extractComponentPropsFromChunk(chunk: string): string {
    if (!chunk.includes('component={')) return chunk;
    
    const lines = chunk.split('\n');
    const processedLines = lines.map(line => {
      if (line.includes('component={')) {
        return this.processComponentLine(line) || line;
      }
      return line;
    });
    
    return processedLines.join('\n');
  }

  /**
   * Process a line containing component prop with safe parsing
   */
  private processComponentLine(line: string): string | null {
    const componentStart = line.indexOf('component={');
    if (componentStart === -1) return null;
    
    try {
      // Simple brace matching to find the end of the prop
      let braceCount = 0;
      let i = componentStart + 11; // Skip 'component={'
      let propContent = '';
      
      while (i < line.length && (braceCount > 0 || line[i] !== '}')) {
        const char = line[i];
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        
        propContent += char;
        i++;
        
        // Safety limit
        if (i - componentStart > 500) break;
      }
      
      // Look for () => ( pattern and extract content
      const arrowMatch = propContent.match(/\(\s*\)\s*=>\s*\(([^]*?)\)\s*$/);
      if (arrowMatch) {
        return arrowMatch[1].trim();
      }
      
    } catch (error) {
      console.error('[WARNING] Error processing component line:', error);
    }
    
    return null;
  }

  private async yieldControl(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve));
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  private async validateJSXStructure(jsx: string): Promise<boolean> {
    // Lightweight validation without hanging
    try {
      const hasReturn = jsx.includes('return');
      const hasJSXElements = jsx.includes('<') && jsx.includes('>');
      const hasFunction = jsx.includes('function') || jsx.includes('const') || jsx.includes('=>');
      
      // Basic brace balance check (allow small imbalance for incomplete chunks)
      const openBraces = (jsx.match(/\{/g) || []).length;
      const closeBraces = (jsx.match(/\}/g) || []).length;
      const braceBalance = Math.abs(openBraces - closeBraces) <= 2;
      
      const hasExport = jsx.includes('export');
      
      return hasReturn && hasJSXElements && hasFunction && braceBalance;
      
    } catch (error) {
      console.error('[VALIDATION] JSX validation error:', error);
      return false;
    }
  }

  /**
   * Ensure proper export - simplified version without complex processing
   */
  private ensureProperExport(jsx: string): string {
    if (jsx.includes('export default')) {
      return jsx; // Already has export
    }
    
    // Find component name to export
    let componentName = 'VideoComposition';
    
    const functionMatch = jsx.match(/function\s+(\w+)/);
    if (functionMatch) {
      componentName = functionMatch[1];
    } else {
      const constMatch = jsx.match(/const\s+(\w+)\s*[:=]/);
      if (constMatch) {
        componentName = constMatch[1];
      }
    }
    
    return jsx + `\n\nexport default ${componentName};`;
  }
}

// Export singleton instance
export const jsxProcessor = new ResumableJSXProcessor();