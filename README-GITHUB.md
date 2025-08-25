# 🎬 RoughCut MCP Server

[![CI](https://github.com/endlessblink/rough-cut-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/endlessblink/rough-cut-mcp/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rough-cut-mcp.svg)](https://www.npmjs.com/package/rough-cut-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust cross-platform MCP (Model Context Protocol) server for rapid video creation, integrating Remotion with AI-powered voice generation, sound effects, and image generation.

## ✨ Features

- 🎯 **Layered Tool Architecture** - Starts with 9 tools, loads 43+ on demand for better performance
- 🎬 **Video Creation** - Create animations with Remotion React framework
- 🎙️ **AI Voice Generation** - Text-to-speech via ElevenLabs API
- 🔊 **Sound Effects** - Integration with Freesound API
- 🖼️ **Image Generation** - AI images via Flux API
- 🎮 **Studio Management** - Full control over Remotion Studio
- 💻 **Cross-Platform** - Windows primary support, macOS experimental

## 🚀 Quick Start

### Installation from NPM

```bash
npm install -g rough-cut-mcp
```

### Installation from Source

```bash
# Clone the repository
git clone https://github.com/endlessblink/rough-cut-mcp.git
cd rough-cut-mcp

# Install dependencies
npm install

# Build the project (Windows)
npm run build

# Configure Claude Desktop
npm run install-to-claude
```

## 📋 Requirements

- Node.js 18+ 
- Windows 10/11 (primary) or macOS (experimental)
- Claude Desktop application
- Optional: API keys for AI services (ElevenLabs, Freesound, Flux)

## 🛠️ Configuration

### Claude Desktop Setup

The MCP server automatically configures Claude Desktop when installed. Manual configuration:

```json
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "node",
      "args": ["path/to/rough-cut-mcp/build/index.js"],
      "env": {
        "REMOTION_ASSETS_DIR": "path/to/assets",
        "ELEVENLABS_API_KEY": "your-key",
        "FREESOUND_API_KEY": "your-key",
        "FLUX_API_KEY": "your-key"
      }
    }
  }
}
```

## 🎮 Usage

Once configured, the MCP tools are available in Claude Desktop:

### Discovery Tools (Always Available)
- `discover-capabilities` - Show available tool categories
- `activate-toolset` - Load specific tool categories
- `search-tools` - Find tools by functionality
- `get-active-tools` - List currently loaded tools

### Example Workflow

```
1. Start Claude Desktop
2. Use: discover-capabilities
3. Activate video tools: activate-toolset { categories: ["video-creation"] }
4. Create a video: create-text-video { text: "Hello World", duration: 5 }
5. Launch studio: launch-project-studio { projectPath: "..." }
```

## 📚 Tool Categories

- **Video Creation** (9 tools) - Animation creation and editing
- **Studio Management** (11 tools) - Remotion Studio control
- **Voice Generation** (5 tools) - ElevenLabs TTS
- **Sound Effects** (5 tools) - Freesound integration
- **Image Generation** (6 tools) - Flux AI images
- **Maintenance** (4 tools) - Asset cleanup and organization

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:validate-install
npm run test:check-deps
npm run test:workflow
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Remotion](https://www.remotion.dev/) - React framework for videos
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Claude Desktop](https://claude.ai/) - AI assistant platform

## 📞 Support

- [Report Issues](https://github.com/endlessblink/rough-cut-mcp/issues)
- [Documentation](https://github.com/endlessblink/rough-cut-mcp/wiki)

## 🚦 Status

- ✅ Windows Support - Full functionality
- ⚠️ macOS Support - Experimental
- ❌ Linux Support - Not tested

---

**Made with ❤️ for the Claude Desktop community**