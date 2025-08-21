#!/usr/bin/env node

// Verify rough-cut-mcp is installed in the CORRECT Claude Desktop config file
import fs from 'fs-extra';
import path from 'path';

console.log("🔍 Verifying rough-cut-mcp Installation in Correct Config File...\n");

// Check all possible Claude Desktop config locations
const configPaths = [
    '/home/endlessblink/.config/claude/claude_desktop_config.json',
    '/home/endlessblink/AppData/Roaming/Claude/claude_desktop_config.json',
    '/home/endlessblink/AppData/Roaming/Claude Desktop/claude_desktop_config.json'
];

console.log("📍 Checking all Claude Desktop config locations:\n");

for (const configPath of configPaths) {
    console.log(`Checking: ${configPath}`);
    
    if (fs.existsSync(configPath)) {
        try {
            const config = fs.readJsonSync(configPath);
            const hasRoughCut = config.mcpServers && config.mcpServers['rough-cut-mcp'];
            const serverCount = config.mcpServers ? Object.keys(config.mcpServers).length : 0;
            
            console.log(`  ✅ File exists`);
            console.log(`  📊 Total MCP servers: ${serverCount}`);
            console.log(`  🎬 Has rough-cut-mcp: ${hasRoughCut ? '✅ YES' : '❌ NO'}`);
            
            if (hasRoughCut) {
                const roughCutConfig = config.mcpServers['rough-cut-mcp'];
                console.log(`  🔧 Command: ${roughCutConfig.command}`);
                console.log(`  📁 Path: ${roughCutConfig.args ? roughCutConfig.args[0] : 'N/A'}`);
                console.log(`  🌍 Environment: ${roughCutConfig.env ? JSON.stringify(roughCutConfig.env) : 'None'}`);
            }
            
            if (serverCount > 0) {
                console.log(`  📋 Other servers: ${Object.keys(config.mcpServers).filter(s => s !== 'rough-cut-mcp').join(', ')}`);
            }
            
        } catch (error) {
            console.log(`  ❌ Error reading config: ${error.message}`);
        }
    } else {
        console.log(`  ⚠️  File does not exist`);
    }
    
    console.log();
}

// Determine which config Claude Desktop is likely using
console.log("🎯 Analysis:");
console.log("Since this is WSL2 and Claude Desktop is a Windows app,");
console.log("it should read from: /home/endlessblink/AppData/Roaming/Claude/claude_desktop_config.json");
console.log();

// Check if the correct path exists for the build file
const buildPath = "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut/build/index.js";
const windowsBuildPath = "D:/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut/build/index.js";

console.log("📁 Build File Verification:");
console.log(`WSL2 path: ${buildPath}`);
console.log(`Exists: ${fs.existsSync(buildPath) ? '✅' : '❌'}`);
console.log(`Windows path: ${windowsBuildPath}`);
console.log("(Windows path accessibility will be verified when Claude Desktop starts)");
console.log();

console.log("🎯 Next Steps:");
console.log("1. Close Claude Desktop completely");
console.log("2. Wait 10 seconds");
console.log("3. Restart Claude Desktop");
console.log("4. Check if rough-cut-mcp appears in available tools");
console.log("5. Test: 'Create a 5-second animation of a red car moving left to right'");