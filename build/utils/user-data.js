"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDataDirectory = getUserDataDirectory;
exports.initializeUserDataDirectory = initializeUserDataDirectory;
exports.copyEssentialTemplates = copyEssentialTemplates;
exports.getInstallationDirectory = getInstallationDirectory;
exports.migrateExistingProjects = migrateExistingProjects;
// User data directory management for cross-platform installation
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_js_1 = require("./logger.js");
const logger = (0, logger_js_1.getLogger)().service('UserData');
/**
 * Get the appropriate user data directory for rough-cut-mcp
 * Uses standard OS conventions:
 * - Windows: %APPDATA%/rough-cut-mcp
 * - macOS: ~/Library/Application Support/rough-cut-mcp
 * - Linux: ~/.local/share/rough-cut-mcp
 */
function getUserDataDirectory() {
    const platform = os_1.default.platform();
    const homeDir = os_1.default.homedir();
    let userDataDir;
    switch (platform) {
        case 'win32':
            userDataDir = path_1.default.join(process.env.APPDATA || path_1.default.join(homeDir, 'AppData', 'Roaming'), 'rough-cut-mcp');
            break;
        case 'darwin':
            userDataDir = path_1.default.join(homeDir, 'Library', 'Application Support', 'rough-cut-mcp');
            break;
        default: // linux and others
            userDataDir = path_1.default.join(process.env.XDG_DATA_HOME || path_1.default.join(homeDir, '.local', 'share'), 'rough-cut-mcp');
            break;
    }
    logger.info(`User data directory: ${userDataDir}`);
    return userDataDir;
}
/**
 * Initialize user data directory structure
 */
async function initializeUserDataDirectory() {
    const userDataDir = getUserDataDirectory();
    const directories = {
        userDataDir,
        projectsDir: path_1.default.join(userDataDir, 'projects'),
        assetsDir: path_1.default.join(userDataDir, 'assets'),
        cacheDir: path_1.default.join(userDataDir, 'cache'),
        templatesDir: path_1.default.join(userDataDir, 'templates'),
    };
    // Ensure all directories exist
    for (const [name, dir] of Object.entries(directories)) {
        try {
            await fs_extra_1.default.ensureDir(dir);
            logger.info(`Created directory: ${name} -> ${dir}`);
        }
        catch (error) {
            logger.error(`Failed to create directory ${name}: ${error.message}`);
            throw error;
        }
    }
    // Create .gitignore in user data directory
    const gitignorePath = path_1.default.join(userDataDir, '.gitignore');
    const gitignoreContent = `# Rough Cut MCP user data - ignore cache and temporary files
cache/
*.tmp
*.log
node_modules/
.DS_Store
Thumbs.db
`;
    try {
        await fs_extra_1.default.writeFile(gitignorePath, gitignoreContent);
    }
    catch (error) {
        logger.warn(`Could not create .gitignore: ${error.message}`);
    }
    return directories;
}
/**
 * Copy essential templates to user data directory
 */
async function copyEssentialTemplates(sourceTemplatesDir, userTemplatesDir) {
    try {
        const templatesExist = await fs_extra_1.default.pathExists(sourceTemplatesDir);
        if (!templatesExist) {
            logger.warn(`Source templates directory not found: ${sourceTemplatesDir}`);
            return;
        }
        // Copy template files
        await fs_extra_1.default.copy(sourceTemplatesDir, userTemplatesDir, {
            overwrite: false, // Don't overwrite user modifications
            filter: (src) => {
                // Skip node_modules and other unnecessary files
                return !src.includes('node_modules') && !src.includes('.git');
            }
        });
        logger.info(`Copied templates from ${sourceTemplatesDir} to ${userTemplatesDir}`);
    }
    catch (error) {
        logger.error(`Error copying templates: ${error.message}`);
        throw error;
    }
}
/**
 * Get the installation directory of the MCP server
 */
function getInstallationDirectory() {
    // This should be the directory where the MCP package is installed
    // Use environment variable if available to avoid process.cwd() issues
    const envAssetDir = process.env.REMOTION_ASSETS_DIR;
    if (envAssetDir) {
        // Go up one level from assets directory to get project root
        return path_1.default.dirname(envAssetDir);
    }
    // Fallback: try to detect based on __dirname equivalent
    const currentDir = path_1.default.resolve(__dirname, '../..');
    const packageJsonPath = path_1.default.join(currentDir, 'package.json');
    if (fs_extra_1.default.existsSync(packageJsonPath)) {
        try {
            const packageJson = fs_extra_1.default.readJsonSync(packageJsonPath);
            if (packageJson.name === 'rough-cut-mcp') {
                return currentDir;
            }
        }
        catch (error) {
            // Ignore error, fallback to default
        }
    }
    // Fallback: assume we're in the right directory
    return currentDir;
}
/**
 * Migrate existing projects from development location to user data directory
 */
async function migrateExistingProjects(oldProjectsDir, newProjectsDir) {
    const result = { migrated: 0, skipped: 0, errors: [] };
    try {
        const oldDirExists = await fs_extra_1.default.pathExists(oldProjectsDir);
        if (!oldDirExists) {
            logger.info(`Old projects directory does not exist: ${oldProjectsDir}`);
            return result;
        }
        const items = await fs_extra_1.default.readdir(oldProjectsDir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                const oldProjectPath = path_1.default.join(oldProjectsDir, item.name);
                const newProjectPath = path_1.default.join(newProjectsDir, item.name);
                try {
                    const newProjectExists = await fs_extra_1.default.pathExists(newProjectPath);
                    if (newProjectExists) {
                        logger.info(`Skipping existing project: ${item.name}`);
                        result.skipped++;
                        continue;
                    }
                    // Check if it looks like a valid Remotion project
                    const srcDir = path_1.default.join(oldProjectPath, 'src');
                    const videoComposition = path_1.default.join(srcDir, 'VideoComposition.tsx');
                    const hasValidStructure = await fs_extra_1.default.pathExists(srcDir) || await fs_extra_1.default.pathExists(videoComposition);
                    if (hasValidStructure) {
                        await fs_extra_1.default.copy(oldProjectPath, newProjectPath);
                        logger.info(`Migrated project: ${item.name}`);
                        result.migrated++;
                    }
                    else {
                        logger.info(`Skipping non-project directory: ${item.name}`);
                        result.skipped++;
                    }
                }
                catch (error) {
                    const errorMsg = `Failed to migrate ${item.name}: ${error.message}`;
                    logger.error(errorMsg);
                    result.errors.push(errorMsg);
                }
            }
        }
    }
    catch (error) {
        const errorMsg = `Error during migration: ${error.message}`;
        logger.error(errorMsg);
        result.errors.push(errorMsg);
    }
    return result;
}
//# sourceMappingURL=user-data.js.map