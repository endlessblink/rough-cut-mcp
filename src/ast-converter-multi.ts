// Multi-Pipeline AST Converter - Clean architecture with specialized transformers
import * as fs from 'fs';
import * as path from 'path';
import { ASTRouter } from './pipelines/ASTRouter.js';

// Get absolute path to OUR project directory (not Claude Desktop's working directory)
function getOurProjectRoot(): string {
  const buildDir = path.dirname(__filename);
  return path.dirname(buildDir); // Go up one level to project root
}

// Dedicated log file for AST debugging in OUR project  
const AST_LOG_FILE = path.join(getOurProjectRoot(), 'logs', 'ast-debug.log');

function logAST(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}: ${message}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AST_LOG_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(AST_LOG_FILE, logEntry);
  console.error(`[AST-LOG] ${message}`);
}

export async function convertArtifactToRemotionAST(artifactJsx: string): Promise<string> {
  try {
    // Clear previous log and start fresh
    if (fs.existsSync(AST_LOG_FILE)) {
      fs.writeFileSync(AST_LOG_FILE, '=== NEW MULTI-PIPELINE CONVERSION SESSION ===\n');
    }
    
    logAST('Starting multi-pipeline conversion...');
    logAST(`Input length: ${artifactJsx.length} chars`);
    logAST(`First 100 chars: ${artifactJsx.substring(0, 100)}`);
    
    // Route to appropriate specialized pipeline
    const router = new ASTRouter();
    const result = await router.convertArtifact(artifactJsx, 'artifact');
    
    logAST('✅ Multi-pipeline conversion completed successfully');
    logAST(`Output length: ${result.length} chars`);
    
    // Quality analysis
    logAST('=== MULTI-PIPELINE QUALITY ANALYSIS ===');
    logAST(`Input preservation: ${((result.length / artifactJsx.length) * 100).toFixed(1)}%`);
    logAST(`Has Remotion imports: ${result.includes('from "remotion"')}`);
    logAST(`Has useCurrentFrame: ${result.includes('useCurrentFrame')}`);
    logAST(`Has AbsoluteFill: ${result.includes('AbsoluteFill')}`);
    logAST(`External imports preserved: ${result.includes('lucide-react') || result.includes('react-icons')}`);
    logAST('=== END MULTI-PIPELINE ANALYSIS ===');
    
    return result;
    
  } catch (error) {
    logAST(`❌ Multi-pipeline conversion failed: ${error instanceof Error ? error.message : 'unknown'}`);
    logAST(`Stack trace: ${error instanceof Error ? error.stack : 'no stack'}`);
    throw new Error(`Multi-pipeline AST conversion failed: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

export default { convertArtifactToRemotionAST };