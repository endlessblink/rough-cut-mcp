#!/bin/bash

# Remotion MCP Server Startup Script
# Handles NVM environment and validation

echo "🚀 Starting Remotion MCP Server V5.0..."

# Source NVM environment
if [ -f ~/.nvm/nvm.sh ]; then
    echo "📦 Loading NVM environment..."
    source ~/.nvm/nvm.sh
else
    echo "❌ NVM not found. Please install Node Version Manager."
    exit 1
fi

# Validate Node.js version
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js not found. Please install Node.js v18+."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Validate npm and npx
NPM_VERSION=$(npm --version 2>/dev/null)
NPX_VERSION=$(npx --version 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ npm/npx not available."
    exit 1
fi

echo "✅ npm version: $NPM_VERSION"
echo "✅ npx version: $NPX_VERSION"

# Check project directory
PROJECT_DIR="/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/rough-cut_2"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Check if built server exists
if [ ! -f "build/index.js" ]; then
    echo "🔧 Building server..."
    ./node_modules/.bin/tsc
    if [ $? -ne 0 ]; then
        echo "❌ TypeScript build failed."
        exit 1
    fi
fi

echo "✅ Server built successfully"

# Ensure assets directory exists
mkdir -p assets/projects

echo "🎬 Remotion MCP Server is ready!"
echo "📍 Projects will be created in: $PROJECT_DIR/assets/projects/"
echo "🔧 Run in Claude Desktop with config:"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"remotion\": {"
echo "      \"command\": \"C:\\\\Program Files\\\\nodejs\\\\node.exe\","
echo "      \"args\": [\"$PROJECT_DIR\\\\build\\\\index.js\"]"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "💡 Test commands in Claude Desktop:"
echo "   - Create a Remotion project called 'test' with bouncing ball animation"
echo "   - Launch Remotion Studio for test"
echo "   - List all projects"

# Start the server
echo "🎯 Starting MCP server..."
node build/index.js