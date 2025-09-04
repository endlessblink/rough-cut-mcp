#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Test the create_project tool
const testCreateProject = async () => {
    console.log('Testing create_project tool...');
    
    // Start the MCP server
    const serverPath = path.join(__dirname, 'build', 'index.js');
    const server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: __dirname
    });

    // MCP protocol messages
    const initMessage = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
                name: "test-client",
                version: "1.0.0"
            }
        }
    };

    const createProjectMessage = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
            name: "create_project",
            arguments: {
                name: "e2e-test-artistic-expressive",
                style: "artistic-expressive", 
                template: "creative-portfolio"
            }
        }
    };

    let responseData = '';
    
    server.stdout.on('data', (data) => {
        responseData += data.toString();
        console.log('Server response:', data.toString());
    });

    server.stderr.on('data', (data) => {
        console.log('Server stderr:', data.toString());
    });

    server.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });

    // Send initialization
    server.stdin.write(JSON.stringify(initMessage) + '\n');
    
    // Wait a bit then send create project command
    setTimeout(() => {
        server.stdin.write(JSON.stringify(createProjectMessage) + '\n');
    }, 1000);

    // Clean up after 5 seconds
    setTimeout(() => {
        server.kill();
        process.exit(0);
    }, 5000);
};

testCreateProject().catch(console.error);