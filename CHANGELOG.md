# Changelog

All notable changes to the RoughCut MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-25

### Added
- Initial release of RoughCut MCP Server
- Complete MCP protocol implementation for Claude Desktop integration
- Layered tool architecture for improved performance (9 initial tools, 43+ total)
- Cross-platform support (Windows primary, macOS experimental)
- Video creation tools with Remotion integration
- AI voice generation via ElevenLabs API
- Sound effects via Freesound API
- Image generation via Flux AI API
- Studio management tools for Remotion Studio control
- Asset management and cleanup utilities
- Comprehensive test suite with 100% pass rate
- Automatic Claude Desktop configuration installer
- Windows-first development workflow
- Complete documentation and guides

### Features
- **Discovery Tools**: Tool discovery and category management system
- **Video Creation**: 9 tools for creating and editing Remotion videos
- **Studio Management**: 11 tools for controlling Remotion Studio
- **Voice Generation**: 5 tools for ElevenLabs text-to-speech
- **Sound Effects**: 5 tools for Freesound integration
- **Image Generation**: 6 tools for Flux AI image creation
- **Maintenance**: 4 tools for asset cleanup and organization

### Technical
- TypeScript implementation with ES2022 target
- JSON-RPC over stdio protocol
- Dynamic tool loading to reduce context overhead
- Windows path enforcement to prevent WSL conflicts
- Comprehensive error handling and logging
- Performance optimizations for large projects

### Documentation
- Complete installation guide
- Layered tools architecture guide
- Windows E2E execution guide
- API documentation for all tools
- Troubleshooting guide

### Testing
- Installation validation
- Dependency checking
- Complete workflow testing
- Fresh install simulation
- Windows path validation
- MCP configuration validation

### Known Issues
- Remotion CLI may not be in global PATH (works via npx)
- Optional dependencies (FFmpeg, Chrome) needed for full functionality
- API keys required for AI services (ElevenLabs, Freesound, Flux)

[1.0.0]: https://github.com/yourusername/rough-cut-mcp/releases/tag/v1.0.0