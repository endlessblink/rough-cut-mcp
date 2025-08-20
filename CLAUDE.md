# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Rough Cut MCP** - a Model Context Protocol server for rapid video creation that integrates Remotion with AI-powered services for comprehensive video production workflows. The server combines:

- **Remotion**: Programmatic video creation and rendering
- **ElevenLabs**: AI voice generation for narration
- **Freesound**: Sound effects search and download
- **Flux (Black Forest Labs)**: AI image generation

## Development Commands

```bash
# Build the TypeScript project
npm run build

# Start the MCP server (builds first via prestart hook)
npm start

# Development mode with TypeScript watching
npm run dev

# Clean build artifacts
npm run clean
```

## Environment Setup

Copy `.env.example` to `.env` and configure the required API keys:
- `ELEVENLABS_API_KEY`: For AI voice generation
- `FREESOUND_API_KEY`: For sound effects access  
- `FLUX_API_KEY`: For AI image generation
- `REMOTION_ASSETS_DIR`: Asset storage location (default: `./assets`)

## Architecture Overview

The MCP server follows a **modular service architecture** with clear separation of concerns:

### Core Services Layer (`src/services/`)
- `elevenlabs.ts`: Voice generation using ElevenLabs API
- `freesound.ts`: Sound effects search/download from Freesound
- `flux.ts`: Image generation via Flux API
- `remotion.ts`: Video rendering orchestration
- `file-manager.ts`: Asset lifecycle management

### MCP Tools Layer (`src/tools/`)
- `video-creation.ts`: Main orchestrator combining all services
- `voice-tools.ts`: Voice generation tools
- `sound-tools.ts`: Sound effects tools  
- `image-tools.ts`: Image generation tools

### Data Flow Architecture
```
MCP Tool Request → Service Layer → External APIs → Asset Management → Remotion Render
```

The server orchestrates complex workflows where:
1. **Asset Generation Phase**: Voice, sound effects, and images are generated in parallel
2. **Composition Phase**: Assets are integrated into Remotion video compositions
3. **Render Phase**: Final video is rendered using Remotion's rendering engine
4. **Cleanup Phase**: Temporary assets are managed according to retention policies

## Asset Management

The server manages assets across multiple directories:
- `assets/temp/`: Temporary files during processing
- `assets/videos/`: Final rendered video outputs
- `assets/audio/`: Voice narration and sound effects
- `assets/images/`: Generated visual assets

Assets are automatically cleaned up based on `MAX_ASSET_AGE_HOURS` configuration.

## Remotion Integration

This project leverages Remotion's programmatic video creation capabilities. The extensive documentation in `Docs/Remotion Documentation/` contains critical reference material for:
- Animation patterns and timing
- Audio synchronization techniques
- Video composition structures
- Rendering configurations

Key Remotion concepts used:
- **Compositions**: Video structure definitions
- **useCurrentFrame()**: Frame-based animations
- **interpolate()**: Value mapping for smooth transitions
- **spring()**: Physics-based animations

## Technology Stack

- **Runtime**: Node.js 18+ with ES modules
- **Language**: TypeScript with strict mode
- **MCP SDK**: `@modelcontextprotocol/sdk` for tool registration
- **Validation**: Zod for input/output schema validation
- **File Operations**: fs-extra for asset management
- **HTTP Client**: Axios for external API calls

## Development Notes

The server uses **StdioServerTransport** for MCP communication and implements robust error handling with retry mechanisms for external API calls. All services are designed to be stateless and can be tested independently.

When developing new tools, follow the established pattern:
1. Create service function in `src/services/`
2. Add tool registration in appropriate `src/tools/` file
3. Define Zod schemas for input validation
4. Implement proper asset cleanup in tool handlers