#!/usr/bin/env node

// Fix all tool metadata to include the name property

const fs = require('fs');
const path = require('path');

const toolFiles = [
  'src/tools/core-tools.ts',
  'src/tools/creation-tools.ts',
  'src/tools/asset-tools.ts',
  'src/tools/discovery-tools.ts'
];

toolFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find all registerTool calls and extract the tool name
  const regex = /server\.toolRegistry\.registerTool\(\s*\{\s*name:\s*['"]([^'"]+)['"]/g;
  let match;
  const toolNames = [];
  
  while ((match = regex.exec(content)) !== null) {
    toolNames.push(match[1]);
  }
  
  console.log(`Found ${toolNames.length} tools in ${file}:`, toolNames);
  
  // Now fix each metadata object by adding the name
  let toolIndex = 0;
  content = content.replace(
    /(\s*)\{\s*\n(\s*)category:/g,
    (match, indent1, indent2) => {
      if (toolIndex < toolNames.length) {
        const name = toolNames[toolIndex++];
        return `${indent1}{\n${indent2}name: '${name}',\n${indent2}category:`;
      }
      return match;
    }
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});

console.log('Done!');