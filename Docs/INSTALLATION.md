# Rough Cut MCP - Installation Guide

Complete installation guide for the Rough Cut MCP server with Remotion Studio integration.

## Prerequisites

- **Node.js 18+** (required for MCP server and Remotion)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Quick Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd rough-cut-mcp

# Run automated setup
npm install
npm run setup
```

This will:
- Install all MCP server dependencies
- Build the TypeScript project
- Set up the Remotion Studio project
- Install Remotion dependencies
- Create environment files
- Provide Claude Desktop configuration

### Option 2: Manual Setup

```bash
# 1. Install MCP server dependencies
npm install

# 2. Build the project
npm run build

# 3. Set up environment
cp .env.example .env

# 4. Install Remotion Studio
cd assets/studio-project
npm install
cd ../..

# 5. Configure Claude Desktop
node install-to-claude.js
```

## Testing the Installation

### Test the MCP Server
```bash
npm test
```

### Test Remotion Studio
```bash
npm run test-studio
```

### Test Studio Launch Manually
```bash
# Launch studio directly
npm run studio

# Or launch from project directory
cd assets/studio-project
npm start
```

## Claude Desktop Integration

### Automatic Configuration
```bash
node install-to-claude.js
```

### Manual Configuration

Add this to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/rough-cut-mcp/build/index.js"]
    }
  }
}
```

## Usage

### Basic Video Creation
Once installed and configured with Claude Desktop, you can:

1. **Create text videos**: Ask Claude to create simple text-based videos
2. **Launch Remotion Studio**: Ask Claude to launch the video editor
3. **Generate assets**: Create voice narration, sound effects, and images (requires API keys)

### Example Prompts
- "Create a simple text video saying 'Hello World'"
- "Launch Remotion Studio so I can edit videos"
- "Generate a video with voice narration about space exploration"

### API Keys (Optional)
Add these to your `.env` file for AI features:

```env
# Voice generation (ElevenLabs)
ELEVENLABS_API_KEY=your_elevenlabs_key

# Sound effects (Freesound)
FREESOUND_API_KEY=your_freesound_key

# Image generation (Flux)
FLUX_API_KEY=your_flux_key
```

## Available Commands

```bash
# Development
npm run build          # Build TypeScript
npm run dev            # Watch mode
npm run clean          # Clean build files

# Testing
npm test               # Test MCP server
npm run test-studio    # Test Remotion Studio

# Studio
npm run studio         # Launch Remotion Studio
cd assets/studio-project && npm start  # Direct studio launch

# Setup
npm run setup          # Complete setup
npm run install-to-claude  # Configure Claude Desktop
```

## Troubleshooting

### Studio Won't Launch
1. **Check dependencies**: `cd assets/studio-project && npm install`
2. **Test manually**: `cd assets/studio-project && npx remotion studio`
3. **Check port availability**: Studio defaults to port 3000
4. **First launch is slow**: Chrome Headless Shell downloads (~100MB)

### MCP Server Issues
1. **Build errors**: Run `npm run build` and check for TypeScript errors
2. **Port conflicts**: Change ports in `.env` file
3. **Permission errors**: Ensure Node.js can write to asset directories

### Claude Desktop Connection
1. **Check config**: Verify `claude_desktop_config.json` syntax
2. **Restart Claude Desktop** after configuration changes
3. **Check logs**: Look for MCP server errors in Claude Desktop logs

### Common Errors

**"Studio project not set up"**
```bash
npm run setup
```

**"Remotion is not installed"**
```bash
cd assets/studio-project
npm install
```

**"Process timed out"**
- Normal on first launch (Chrome download + bundling)
- Wait and try again
- Check http://localhost:3000 manually

## Project Structure

```
rough-cut-mcp/
├── src/                    # MCP server source
├── build/                  # Compiled JavaScript
├── assets/
│   ├── studio-project/     # Remotion Studio project
│   ├── videos/            # Generated videos
│   ├── audio/             # Voice and sound files
│   └── images/            # Generated images
├── install.js             # Automated setup script
├── test-studio-complete.js # Studio test script
└── package.json           # Main project config
```

## Getting Help

- **Documentation**: See `README.md` for feature details
- **Issues**: Report bugs and issues on GitHub
- **Testing**: Use `npm run test-studio` to diagnose problems

## Next Steps

After installation:

1. **Test basic functionality**: `npm test`
2. **Launch studio**: `npm run studio`
3. **Try video creation**: Ask Claude to create a simple video
4. **Add API keys**: For voice, sound, and image generation
5. **Explore Remotion**: Learn video programming with Remotion docs