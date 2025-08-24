// User data directory management for cross-platform installation
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { getLogger } from './logger.js';

const logger = getLogger().service('UserData');

/**
 * Get the appropriate user data directory for rough-cut-mcp
 * Uses standard OS conventions:
 * - Windows: %APPDATA%/rough-cut-mcp
 * - macOS: ~/Library/Application Support/rough-cut-mcp  
 * - Linux: ~/.local/share/rough-cut-mcp
 */
export function getUserDataDirectory(): string {
  const platform = os.platform();
  const homeDir = os.homedir();
  
  let userDataDir: string;
  
  switch (platform) {
    case 'win32':
      userDataDir = path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'rough-cut-mcp');
      break;
    case 'darwin':
      userDataDir = path.join(homeDir, 'Library', 'Application Support', 'rough-cut-mcp');
      break;
    default: // linux and others
      userDataDir = path.join(process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share'), 'rough-cut-mcp');
      break;
  }
  
  logger.info(`User data directory: ${userDataDir}`);
  return userDataDir;
}

/**
 * Initialize user data directory structure
 */
export async function initializeUserDataDirectory(): Promise<{
  userDataDir: string;
  projectsDir: string;
  assetsDir: string;
  cacheDir: string;
  templatesDir: string;
}> {
  const userDataDir = getUserDataDirectory();
  
  const directories = {
    userDataDir,
    projectsDir: path.join(userDataDir, 'projects'),
    assetsDir: path.join(userDataDir, 'assets'),
    cacheDir: path.join(userDataDir, 'cache'),
    templatesDir: path.join(userDataDir, 'templates'),
  };
  
  // Ensure all directories exist
  for (const [name, dir] of Object.entries(directories)) {
    try {
      await fs.ensureDir(dir);
      logger.info(`Created directory: ${name} -> ${dir}`);
    } catch (error: any) {
      logger.error(`Failed to create directory ${name}: ${error.message}`);
      throw error;
    }
  }
  
  // Create .gitignore in user data directory
  const gitignorePath = path.join(userDataDir, '.gitignore');
  const gitignoreContent = `# Rough Cut MCP user data - ignore cache and temporary files
cache/
*.tmp
*.log
node_modules/
.DS_Store
Thumbs.db
`;
  
  try {
    await fs.writeFile(gitignorePath, gitignoreContent);
  } catch (error: any) {
    logger.warn(`Could not create .gitignore: ${error.message}`);
  }
  
  return directories;
}

/**
 * Copy essential templates to user data directory
 */
export async function copyEssentialTemplates(sourceTemplatesDir: string, userTemplatesDir: string): Promise<void> {
  try {
    const templatesExist = await fs.pathExists(sourceTemplatesDir);
    if (!templatesExist) {
      logger.warn(`Source templates directory not found: ${sourceTemplatesDir}`);
      return;
    }
    
    // Copy template files
    await fs.copy(sourceTemplatesDir, userTemplatesDir, {
      overwrite: false, // Don't overwrite user modifications
      filter: (src) => {
        // Skip node_modules and other unnecessary files
        return !src.includes('node_modules') && !src.includes('.git');
      }
    });
    
    logger.info(`Copied templates from ${sourceTemplatesDir} to ${userTemplatesDir}`);
    
  } catch (error: any) {
    logger.error(`Error copying templates: ${error.message}`);
    throw error;
  }
}

/**
 * Get the installation directory of the MCP server
 */
export function getInstallationDirectory(): string {
  // This should be the directory where the MCP package is installed
  // In development, it's the project root
  // In production, it would be node_modules/rough-cut-mcp or global npm location
  
  // For now, try to detect based on current file location
  const currentDir = process.cwd();
  const packageJsonPath = path.join(currentDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = fs.readJsonSync(packageJsonPath);
      if (packageJson.name === 'rough-cut-mcp') {
        return currentDir;
      }
    } catch (error) {
      // Ignore error, fallback to default
    }
  }
  
  // Fallback: assume we're in the right directory
  return currentDir;
}

/**
 * Migrate existing projects from development location to user data directory
 */
export async function migrateExistingProjects(
  oldProjectsDir: string, 
  newProjectsDir: string
): Promise<{ migrated: number; skipped: number; errors: string[] }> {
  const result = { migrated: 0, skipped: 0, errors: [] as string[] };
  
  try {
    const oldDirExists = await fs.pathExists(oldProjectsDir);
    if (!oldDirExists) {
      logger.info(`Old projects directory does not exist: ${oldProjectsDir}`);
      return result;
    }
    
    const items = await fs.readdir(oldProjectsDir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const oldProjectPath = path.join(oldProjectsDir, item.name);
        const newProjectPath = path.join(newProjectsDir, item.name);
        
        try {
          const newProjectExists = await fs.pathExists(newProjectPath);
          if (newProjectExists) {
            logger.info(`Skipping existing project: ${item.name}`);
            result.skipped++;
            continue;
          }
          
          // Check if it looks like a valid Remotion project
          const srcDir = path.join(oldProjectPath, 'src');
          const videoComposition = path.join(srcDir, 'VideoComposition.tsx');
          const hasValidStructure = await fs.pathExists(srcDir) || await fs.pathExists(videoComposition);
          
          if (hasValidStructure) {
            await fs.copy(oldProjectPath, newProjectPath);
            logger.info(`Migrated project: ${item.name}`);
            result.migrated++;
          } else {
            logger.info(`Skipping non-project directory: ${item.name}`);
            result.skipped++;
          }
          
        } catch (error: any) {
          const errorMsg = `Failed to migrate ${item.name}: ${error.message}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }
    }
    
  } catch (error: any) {
    const errorMsg = `Error during migration: ${error.message}`;
    logger.error(errorMsg);
    result.errors.push(errorMsg);
  }
  
  return result;
}