#!/usr/bin/env node
// Automatic version sync script to prevent missing references

const fs = require('fs');
const path = require('path');

const NEW_VERSION = process.argv[2] || '8.1.8';

console.log(`🔄 Updating ALL version references to ${NEW_VERSION}...`);

// Files that need version updates
const versionFiles = [
  {
    file: 'package.json',
    patterns: [{ search: /"version":\s*"[^"]*"/, replace: `"version": "${NEW_VERSION}"` }]
  },
  {
    file: 'src/utils.ts', 
    patterns: [
      { search: /const currentVersion = '[^']*';/, replace: `const currentVersion = '${NEW_VERSION}';` },
      { search: /let npmRegistryVersion = '[^']*';/, replace: `let npmRegistryVersion = '${NEW_VERSION}';` },
      { search: /Using cached registry version: [^']*'/, replace: `Using cached registry version: ${NEW_VERSION}'` }
    ]
  },
  {
    file: 'src/index.ts',
    patterns: [
      { search: /MCP Server Version: [^`]*`/, replace: `MCP Server Version: ${NEW_VERSION}\`` },
      { search: /version: '[^']*'/, replace: `version: '${NEW_VERSION}'` },
      { search: /MCP SERVER VERSION: [^`]*`/, replace: `MCP SERVER VERSION: ${NEW_VERSION}\`` },
      { search: /Server created with version [^`]*`/, replace: `Server created with version ${NEW_VERSION}\`` },
      { search: /Running Version: [^`]*`/, replace: `Running Version: ${NEW_VERSION}\`` },
      { search: /Version [^`\s]* error handling active/, replace: `Version ${NEW_VERSION} error handling active` }
    ]
  },
  {
    file: 'src/tools.ts',
    patterns: [
      { search: /\|\| '[^']*'\) - AST-Based/, replace: `|| '${NEW_VERSION}') - AST-Based` }
    ]
  }
];

// Update each file
versionFiles.forEach(({ file, patterns }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  patterns.forEach(({ search, replace }) => {
    if (content.match(search)) {
      content = content.replace(search, replace);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`ℹ️  No changes needed in ${file}`);
  }
});

console.log(`🎉 Version sync complete! All references now point to ${NEW_VERSION}`);
console.log(`🔧 Run: npm run build:ts && restart Claude Desktop`);