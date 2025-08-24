# 🎬 Rough Cut MCP

A comprehensive Model Context Protocol (MCP) server that integrates Remotion video creation with AI-powered services for complete video production workflows.

[![npm version](https://badge.fury.io/js/rough-cut-mcp.svg)](https://badge.fury.io/js/rough-cut-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ✨ Features

### 🎬 Complete Video Production Pipeline
- **Remotion**: Programmatic video creation and rendering
- **ElevenLabs**: AI voice generation for narration
- **Freesound**: Sound effects search and download  
- **Flux AI**: AI image generation for visual assets

### 🛠 Modular Architecture
- **Layered Tool System**: Reduces context bloat, improves performance
- **Port Persistence**: Projects remember their studio ports across sessions
- **Comprehensive Error Handling**: Graceful failure recovery
- **Asset Lifecycle Management**: Automatic cleanup and organization
- **TypeScript**: Full type safety throughout

### 📊 Smart Asset Management  
- Automatic directory organization
- Disk usage monitoring and cleanup
- File type validation
- Project metadata tracking

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g rough-cut-mcp

# Or install locally in your project
npm install rough-cut-mcp
```

### Automatic Claude Desktop Setup

```bash
# Automatically configure Claude Desktop
npx rough-cut-mcp install-to-claude
```

This will:
1. Build the project
2. Find your Claude Desktop configuration
3. Add the MCP server entry
4. Provide setup instructions

### Manual Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\path\\to\\rough-cut-mcp\\build\\index.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "REMOTION_ASSETS_DIR": "D:\\path\\to\\your\\assets"
      }
    }
  }
}
```

## 📋 Prerequisites

- **Node.js 18+** 
- **Windows OS** (primary platform, required for full Claude Desktop integration)
- **macOS** (experimental support - see macOS Installation section below)
- **API Keys** for services you want to use:
  - [ElevenLabs](https://elevenlabs.io/) for voice generation
  - [Freesound](https://freesound.org/apiv2/) for sound effects
  - [Black Forest Labs](https://blackforestlabs.ai/) for Flux image generation

## 🍎 macOS Installation (Experimental)

> **⚠️ Experimental Support**: macOS compatibility is provided for sharing purposes. Windows remains the primary platform with full feature support.

### Prerequisites for macOS
- **Node.js 18+** (install via [Homebrew](https://brew.sh/) recommended)
- **Claude Desktop for Mac** (available from [Anthropic](https://claude.ai/))

### Installation on macOS

```bash
# Install Node.js via Homebrew (recommended)
brew install node

# Install the MCP server
npm install -g rough-cut-mcp

# Build the project
cd /usr/local/lib/node_modules/rough-cut-mcp
npm run build
```

### macOS Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json` (typically located at `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "/usr/local/bin/node",
      "args": [
        "/usr/local/lib/node_modules/rough-cut-mcp/build/index.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "REMOTION_ASSETS_DIR": "/Users/yourusername/Documents/rough-cut-assets"
      }
    }
  }
}
```

### Alternative Node.js Paths on macOS

Depending on your Node.js installation:

```bash
# Homebrew installation
"command": "/usr/local/bin/node"

# Node Version Manager (nvm)
"command": "/Users/yourusername/.nvm/versions/node/v20.x.x/bin/node"

# Official Node.js installer
"command": "/usr/local/bin/node"
```

### macOS Limitations & Known Issues

- **Remotion Studio**: May have launch issues - Windows has better integration
- **File Paths**: Some tools may expect Windows-style paths
- **Performance**: Not optimized for macOS filesystem
- **Testing**: Limited testing compared to Windows platform

### Getting Your Node.js Path on macOS

```bash
# Find your Node.js installation
which node

# Verify Node.js version
node --version
```

### macOS Asset Directory Setup

```bash
# Create asset directory
mkdir -p ~/Documents/rough-cut-assets

# Set permissions
chmod 755 ~/Documents/rough-cut-assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your assets directory:

```env
# Required for voice generation
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Required for sound effects
FREESOUND_API_KEY=your_freesound_key_here

# Required for image generation  
FLUX_API_KEY=your_flux_key_here
```

### Tool Organization

The MCP server uses a **layered tool architecture** for better performance:

- **Discovery Tools** (always active): Tool management and exploration
- **Core Operations** (default): Basic project and studio operations
- **On-Demand Categories**: Video creation, voice generation, image tools, etc.

## 🎯 Usage

### Basic Workflow

1. **Discover Available Tools**:
   ```
   Use "discover-capabilities" to see all tool categories
   ```

2. **Activate Tool Categories**:
   ```
   Use "activate-toolset" to load specific tool sets:
   - video-creation
   - studio-management
   - voice-generation (requires API key)
   - sound-effects (requires API key)
   - image-generation (requires API key)
   ```

3. **Create and Edit Videos**:
   ```
   - "create-complete-video" - Generate full video projects
   - "launch-project-studio" - Open Remotion Studio for editing
   - "edit-video-element" - Programmatically modify video elements
   ```

### Example Commands

```bash
# List all video projects
"list-video-projects"

# Create a new animated video
"create-complete-video" with parameters:
{
  "name": "my-awesome-video",
  "template": "text-animation",
  "duration": 300
}

# Launch Remotion Studio for a specific project
"launch-project-studio" with parameters:
{
  "projectName": "my-awesome-video"
}
```

## 🛠 Available Tools

### Core Operations (Always Active)
- `list-video-projects` - List all animation projects
- `get-project-status` - Get project information and health
- `launch-project-studio` - Launch Remotion Studio with port persistence

### Video Creation Tools
- `create-complete-video` - Create new video with React components
- `create-text-video` - Simple text-based animations
- `edit-video-element` - Modify specific elements in compositions
- `analyze-video-structure` - Understand project composition

### Studio Management Tools
- `launch-remotion-studio` - Start Remotion Studio dashboard
- `stop-remotion-studio` - Stop running studio instances
- `get-studio-status` - Check studio health and status
- `launch-studio-with-project` - Launch studio for specific project

### Voice Generation Tools (ElevenLabs)
- `generate-voice` - Create AI voiceovers
- `list-voices` - Browse available voices
- `clone-voice` - Clone custom voices

### Sound Effects Tools (Freesound)
- `search-sound-effects` - Find sound effects
- `download-sound-effects` - Download audio files
- `get-sound-info` - Audio file details

### Image Generation Tools (Flux)
- `generate-image` - Create AI images
- `generate-styled-image` - Images with specific styles
- `upscale-image` - Enhance image resolution

### Asset Management Tools
- `get-asset-statistics` - Disk usage and file counts
- `cleanup-old-assets` - Remove temporary files
- `organize-assets` - Sort files by type

## 🔍 Advanced Features

### Port Persistence
Projects automatically remember their Remotion Studio port assignments:
- First launch assigns a port (7400-7600 range)
- Subsequent launches reuse the same port
- Metadata stored in `.studio-metadata.json`

### Smart Tool Loading
The layered architecture improves performance:
- Initial load: 9 tools instead of 40+
- Dynamic loading based on needs
- Reduced context and faster responses

### Asset Lifecycle Management
- Automatic cleanup of temporary files
- Disk usage monitoring
- Project organization and categorization

## 📁 Project Structure

```
rough-cut-mcp/
├── build/                 # Compiled TypeScript
├── src/                   # Source code
│   ├── tools/            # MCP tool implementations
│   ├── services/         # Core services
│   ├── utils/           # Utilities
│   └── types/           # TypeScript definitions
├── assets/              # Asset storage
│   ├── projects/        # Video projects
│   ├── voices/          # Generated audio
│   ├── images/          # Generated images
│   └── sounds/          # Sound effects
└── tests/               # Test suites
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific components
npm run test-layered      # Test tool architecture
npm run test-routing      # Test tool routing fixes
npm run test-studio       # Test studio integration
```

## 🚀 Publishing & Distribution

### For NPM Package

```bash
# Build and test before publishing
npm run prepublishOnly

# Publish to NPM
npm publish
```

### For Local Development

```bash
# Build project
npm run build

# Install to Claude Desktop
npm run install-to-claude
```

## 📝 API Reference

### Tool Categories

| Category | Description | Requires API Key |
|----------|-------------|-----------------|
| `discovery` | Tool management and exploration | No |
| `core-operations` | Basic project operations | No |
| `video-creation` | Video and animation tools | No |
| `studio-management` | Remotion Studio control | No |
| `voice-generation` | ElevenLabs TTS | Yes |
| `sound-effects` | Freesound integration | Yes |
| `image-generation` | Flux AI images | Yes |
| `maintenance` | Asset management | No |

### MCP Protocol Compliance

This server fully implements the Model Context Protocol:
- ✅ Tool discovery and listing
- ✅ Dynamic tool activation
- ✅ JSON-RPC over stdio
- ✅ Error handling and recovery
- ✅ Resource management

## 🐛 Troubleshooting

### Common Issues

**Q: Tools not appearing after activation**  
A: Check that the MCP server is running and Claude Desktop configuration is correct.

**Q: Remotion Studio won't launch**  
A: Ensure you're on Windows and have Node.js 18+ installed. Check port availability (7400-7600).

**Q: API-dependent tools missing**  
A: Verify API keys are set in environment variables or config.

**Q: Build fails on non-Windows platforms**  
A: Windows is the primary platform. macOS support is experimental - see macOS Installation section.

### Debug Mode

Set debug logging in your environment:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run prepublishOnly` to validate
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Remotion](https://www.remotion.dev/) for programmatic video creation
- [Model Context Protocol](https://modelcontextprotocol.io/) for the integration standard
- [ElevenLabs](https://elevenlabs.io/) for AI voice generation
- [Freesound](https://freesound.org/) for sound effects database
- [Black Forest Labs](https://blackforestlabs.ai/) for Flux image generation

## 📞 Support

- 🐛 [Report Issues](https://github.com/yourusername/rough-cut-mcp/issues)
- 💬 [Discussions](https://github.com/yourusername/rough-cut-mcp/discussions)
- 📧 Support: your.email@example.com

---

**Made with ❤️ for the Claude Desktop and Remotion communities**