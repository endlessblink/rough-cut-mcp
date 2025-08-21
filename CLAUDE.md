# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Rough Cut MCP** - a Model Context Protocol server for rapid video creation that serves as a vessel for Claude-generated animation code. The MCP accepts complete Remotion React component code and renders it into videos.

**Key Principle**: The MCP does NOT generate animation code - Claude generates the code, MCP executes it.

The server integrates:
- **Remotion**: Executes Claude-generated animation code
- **ElevenLabs**: AI voice generation for narration (optional)
- **Freesound**: Sound effects search and download (optional)
- **Flux (Black Forest Labs)**: AI image generation (optional)

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

The MCP server follows a **pure code vessel architecture** - it accepts and executes Claude-generated animation code:

### Core Workflow
```
1. User asks Claude: "Generate Remotion code for [any animation]"
2. Claude generates: Complete Remotion React component code
3. User calls MCP: create-complete-video with compositionCode parameter
4. MCP executes: Creates project and renders the animation
```

**Pure Code Injection • No Templates • Unlimited Creativity**

### Core Services Layer (`src/services/`)
- `remotion.ts`: Executes Claude-generated Remotion code
- `file-manager.ts`: Asset lifecycle management
- `elevenlabs.ts`: Voice generation using ElevenLabs API (optional)
- `freesound.ts`: Sound effects search/download from Freesound (optional)
- `flux.ts`: Image generation via Flux API (optional)

### MCP Tools Layer (`src/tools/`)
- `video-creation.ts`: **Primary tool** - accepts `compositionCode` parameter with Claude-generated code
- `voice-tools.ts`: Voice generation tools (optional)
- `sound-tools.ts`: Sound effects tools (optional)
- `image-tools.ts`: Image generation tools (optional)
- `studio-tools.ts`: Remotion Studio launcher for editing

### How to Use
1. Ask Claude to generate Remotion code for any animation
2. Call `create-complete-video` tool with:
   - `animationDesc`: Description of what you want
   - `compositionCode`: The complete React/Remotion code Claude generated
   - Other optional parameters (duration, fps, dimensions, etc.)
3. MCP creates a Remotion project with your code and renders it

The server can render ANY animation Claude can code:
- Scientific simulations (particle physics, DNA replication)
- Abstract art (fractals, color gradients, geometric patterns)
- Character animations (walking, dancing, fighting)
- Nature scenes (growing trees, flowing water, weather)
- Technical visualizations (circuit boards, data flows, networks)
- **Any valid Remotion code** = **Any animation possible**

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