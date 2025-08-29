"use strict";
/**
 * Version Detection Utility
 * Detects parent MCP Remotion versions for consistent project generation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentRemotionVersions = getParentRemotionVersions;
exports.generateSafeDependencies = generateSafeDependencies;
exports.checkProjectVersionConflicts = checkProjectVersionConflicts;
exports.repairProjectVersions = repairProjectVersions;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * Get the Remotion versions from parent MCP package.json
 * This ensures projects use the same versions as the parent to prevent conflicts
 */
async function getParentRemotionVersions() {
    try {
        // Read parent package.json
        const parentPackageJsonPath = path.join(__dirname, '..', '..', 'package.json');
        const parentPackageJson = await fs.readJson(parentPackageJsonPath);
        const dependencies = parentPackageJson.dependencies || {};
        // Extract Remotion-related versions (remove ^ or ~ if present)
        const cleanVersion = (version) => {
            return version.replace(/^[\^~]/, '');
        };
        return {
            cli: cleanVersion(dependencies['@remotion/cli'] || '4.0.340'),
            bundler: cleanVersion(dependencies['@remotion/bundler'] || '4.0.340'),
            renderer: cleanVersion(dependencies['@remotion/renderer'] || '4.0.340'),
            remotion: cleanVersion(dependencies['remotion'] || '4.0.340'),
            lambda: dependencies['@remotion/lambda']
                ? cleanVersion(dependencies['@remotion/lambda'])
                : undefined
        };
    }
    catch (error) {
        // Fallback to safe default versions if detection fails
        // Failed to detect parent Remotion versions, using defaults
        return {
            cli: '4.0.340',
            bundler: '4.0.340',
            renderer: '4.0.340',
            remotion: '4.0.340'
        };
    }
}
/**
 * Generate package.json dependencies with conflict prevention
 */
async function generateSafeDependencies() {
    const versions = await getParentRemotionVersions();
    return {
        dependencies: {
            '@remotion/cli': versions.cli,
            '@remotion/bundler': versions.bundler,
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'remotion': versions.remotion
        },
        overrides: {
            '@remotion/bundler': versions.bundler,
            '@remotion/cli': versions.cli,
            '@remotion/renderer': versions.renderer,
            'remotion': versions.remotion
        },
        resolutions: {
            '@remotion/bundler': versions.bundler,
            '@remotion/cli': versions.cli,
            '@remotion/renderer': versions.renderer,
            'remotion': versions.remotion
        }
    };
}
/**
 * Check if a project has version conflicts
 */
async function checkProjectVersionConflicts(projectPath) {
    try {
        const projectPackageJson = await fs.readJson(path.join(projectPath, 'package.json'));
        const parentVersions = await getParentRemotionVersions();
        const conflicts = [];
        // Check each Remotion package
        const packagesToCheck = [
            '@remotion/cli',
            '@remotion/bundler',
            'remotion'
        ];
        for (const pkg of packagesToCheck) {
            const projectVersion = projectPackageJson.dependencies?.[pkg];
            if (!projectVersion)
                continue;
            const cleanProjectVersion = projectVersion.replace(/^[\^~]/, '');
            const expectedVersion = pkg === 'remotion'
                ? parentVersions.remotion
                : parentVersions[pkg.split('/')[1]];
            if (cleanProjectVersion !== expectedVersion) {
                conflicts.push(`${pkg}: project has ${cleanProjectVersion}, parent has ${expectedVersion}`);
            }
        }
        return {
            hasConflicts: conflicts.length > 0,
            conflictDetails: conflicts
        };
    }
    catch (error) {
        return {
            hasConflicts: false,
            conflictDetails: []
        };
    }
}
/**
 * Auto-repair version conflicts in a project
 */
async function repairProjectVersions(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    // Get safe dependencies with proper versions
    const safeDeps = await generateSafeDependencies();
    // Update package.json
    packageJson.dependencies = {
        ...packageJson.dependencies,
        ...safeDeps.dependencies
    };
    packageJson.overrides = safeDeps.overrides;
    packageJson.resolutions = safeDeps.resolutions;
    // Write updated package.json
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    // Create/update .npmrc
    const npmrcContent = `prefer-offline=true
prefer-local=true
legacy-peer-deps=true
`;
    await fs.writeFile(path.join(projectPath, '.npmrc'), npmrcContent, 'utf-8');
}
//# sourceMappingURL=version-detector.js.map