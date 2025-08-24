#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test the same path resolution the MCP uses
const baseDir = process.env.REMOTION_ASSETS_DIR || join(dirname(__dirname), 'assets');
const projectsDir = join(baseDir, 'projects');

console.log('Testing MCP path resolution...');
console.log('__dirname:', __dirname);
console.log('baseDir:', baseDir);
console.log('projectsDir:', projectsDir);
console.log('Directory exists?', existsSync(projectsDir));

if (existsSync(projectsDir)) {
    const projects = readdirSync(projectsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
            name: dirent.name,
            path: join(projectsDir, dirent.name)
        }));
    
    console.log(`\nFound ${projects.length} projects:`);
    projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name}`);
    });
} else {
    console.error('Projects directory not found!');
}