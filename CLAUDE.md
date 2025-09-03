# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 MCP SERVER TROUBLESHOOTING - RESOLVED ISSUES

### **Common "Tools Not Available" Problem - SOLUTION**

If Claude Desktop shows "I don't have access to tools" despite successful MCP server setup, the issue is typically caused by:

Always Create / Update Tasks status and memories if needed with Like I said memory mcp as part of your working process.

NEVER assume it's just a cache issue without proving the code is actually       
correct first.

When installing the mcp for claude desktop - always install on claude desktop for windows

**✅ FIXED ISSUES (September 2, 2025):**

1. **Version Mismatch** - Server version must match package.json version exactly
   - **Problem**: `src/index.ts` had version `5.1.0` while `package.json` had `5.5.1`
   - **Fix**: Updated server version to `5.5.1` in constructor

2. **Tool Naming Convention** - Claude Desktop prefers snake_case over kebab-case
   - **Problem**: Tools named `create-project`, `launch-studio`, etc.
   - **Fix**: Changed all tool names to `create_project`, `launch_studio`, etc.

3. **Response Format** - Double-wrapping JSON responses
   - **Problem**: Tool responses were wrapped in `JSON.stringify()`
   - **Fix**: Return tool results directly without JSON wrapping

**Diagnostic Commands:**
```bash
# Test server startup
node build/index.js

# Check for errors in Claude Desktop logs (Windows)
type "%APPDATA%\Claude\logs\mcp-server-rough-cut-mcp.log"

# Verify server version
node info.js
```

**After Making Changes:**
1. Rebuild with `npm run build` or `node build.js`
2. **Restart Claude Desktop completely** (critical)
3. Look for hammer icon (🔨) in input area
4. Test with: "Use rough-cut-mcp create_project tool"

## Project Overview

This is the `rough-cut-mcp` - a cross-platform MCP (Model Context Protocol) server for Remotion video creation with AI audio generation. The server acts as a bridge between Claude Desktop and Remotion projects, handling file operations and process management while letting Claude generate intelligent JSX.

## Development Commands

### Building
```bash
npm run build                # Cross-platform build (recommended)
npm run build:cross-platform # Same as above
npm run build:windows       # Windows PowerShell build (alternative)
npm run build:ts            # TypeScript only build
```

**Important**: Build is protected against WSL2 corruption. The `prebuild` script blocks builds in WSL environment to prevent Windows path corruption.

### Setup and Installation
```bash
npm run setup               # Cross-platform setup
npm run setup:cross-platform # Same as above  
npm run setup:windows      # Windows PowerShell setup (alternative)
```

### Running
```bash
npm start                   # Start MCP server (production)
npm run start:win          # Windows with bash/nvm 
npm run start:wsl          # WSL with bash/nvm
npm run dev                 # Build and start (development)
npm run dev:ts             # TypeScript build and start
```

### Global CLI Commands (when installed via npm)
```bash
rough-cut-setup            # Automated platform detection and setup
rough-cut-build           # Build with platform validation
rough-cut-server          # Start MCP server
rough-cut-debug           # Debug mode with verbose output
rough-cut-info            # Show version and build information
```

### Testing
```bash
npm run test:env          # Test Node.js environment setup
```

## Architecture

### Core Components

1. **MCP Server** (`src/index.ts`): Main server class handling MCP protocol communication
2. **Tools** (`src/tools.ts`): Implementation of all MCP tools (create-project, launch-studio, etc.)
3. **Utils** (`src/utils.ts`): Cross-platform utilities for file operations, process management, and platform detection

### Key Architectural Patterns

- **Zero JSX Validation**: Accepts Claude's JSX exactly as provided without modification
- **Cross-Platform Path Handling**: Uses `slash` package and relative paths to avoid Windows/WSL issues
- **Process Tracking**: Maintains running studio processes with PID/port tracking
- **Platform Detection**: Smart detection of Windows, macOS, Linux, and WSL environments
- **Build Protection**: Prevents WSL2 builds that could corrupt Windows paths

### Tool Functions

All tools follow a consistent pattern:
1. Input validation and path resolution via `getProjectPath()`
2. File system operations using `fs-extra`  
3. Process spawning with platform-appropriate commands
4. Structured response format: `{ content: [{ type: 'text', text: '...' }] }`
5. Error handling with detailed logging to stderr

### Project Structure Created

Each Remotion project gets:
```
project-name/
├── src/
│   ├── VideoComposition.tsx  # Claude's exact JSX
│   └── Root.tsx             # Minimal wrapper importing VideoComposition  
├── public/audio/            # AI-generated audio files (if audio enabled)
├── package.json            # Remotion dependencies
├── remotion.config.ts      # Duration and basic config
└── .env                    # Audio API configuration
```

## Cross-Platform Considerations

### Platform Detection (`utils/platform.js`)
- Detects Windows, macOS, Linux, and WSL2 environments
- Finds Node.js installations across different package managers
- Generates platform-specific Claude Desktop configurations

### Path Handling
- Always use relative paths in project operations
- Use `slash()` to normalize paths across platforms  
- `getProjectPath()` resolves to `assets/projects/{name}` relative to server location

### Process Management
- **Windows**: Requires `shell: true` with spawn for proper command resolution (critical for npx/npm commands)
- **Unix**: Direct command execution with proper environment handling
- **Port detection**: Scans 6600-6620 range for available ports

### Path Resolution Logic
**When `REMOTION_PROJECTS_DIR` is set**: Uses it directly as the projects directory  
**When not set**: Falls back to automatic detection:
1. MCP server installation directory + `/assets/projects/`
2. User home directory + `/remotion-projects/`  
3. Current working directory + `/assets/projects/`

**Important**: `REMOTION_PROJECTS_DIR` should point directly to where projects are stored, not the parent directory.

## Environment Variables

### Configuration via .env File (Recommended)
Create a `.env` file in the project directory for local configuration:
```bash
# Custom project directory (optional)
REMOTION_PROJECTS_DIR=D:\MyVideos\Remotion

# Audio features (optional)
AUDIO_ENABLED=true
ELEVENLABS_API_KEY=your_api_key_here
```

**Benefits of .env approach:**
- ✅ Easier to manage than Claude Desktop JSON config
- ✅ Standard Node.js environment variable pattern
- ✅ No need to modify Claude Desktop configuration
- ✅ Automatically loaded by MCP server via `dotenv.config()`

## Audio Features (Optional)

### Configuration
The server supports optional AI audio generation via ElevenLabs API:
- Environment variables: `AUDIO_ENABLED`, `ELEVENLABS_API_KEY`
- Audio files saved to `public/audio/` in projects
- Returns Remotion integration snippets for generated audio

### Audio Tools
- `configure-audio`: Set API keys and enable/disable features
- `generate-audio`: Create sound effects and music with AI
- `debug-audio-config`: Debug environment variable configuration

## Common Development Patterns

### Adding New Tools
1. Define tool schema in `tools.ts` exports
2. Add case handler in `handleToolCall()`  
3. Implement tool function following existing patterns
4. Use `getProjectPath()` for consistent path resolution
5. Return structured response format

### Error Handling
- All tools wrapped in try/catch with detailed logging
- Log errors to stderr for Claude Desktop debugging
- Return structured error responses with `isError: true`

### Process Lifecycle
- Track spawned processes in utils layer
- Clean up on server shutdown (SIGINT/SIGTERM handlers)
- Kill orphaned processes when stopping studios

## Build System Notes

### Windows Build Requirements
- **Critical**: All spawn calls must include `shell: true` for Windows compatibility
- **TypeScript validation**: Uses `npx tsc --version` with shell option
- **npm commands**: Require shell option to resolve properly on Windows

### Cross-Platform Build Protection
- `prebuild` script blocks WSL2 builds to prevent path corruption
- Build validation ensures Windows compatibility
- Cross-platform build script (`build.js`) works on all platforms

### TypeScript Configuration
- Target: ES2020 with Node.js modules
- Output: `build/` directory with source maps
- Entry: `build/index.js` for MCP server execution

## Common Issues and Solutions

### "TypeScript not found" on Windows
**Cause**: Missing `shell: true` in spawn call for TypeScript validation  
**Solution**: Ensure all spawn calls include `{ shell: true }` option
**Test**: Verify `npx tsc --version` works manually before building

## File Organization

- `src/`: TypeScript source files
- `build/`: Compiled JavaScript output  
- `bin/`: CLI wrapper scripts
- `utils/`: Platform detection and setup utilities
- `assets/projects/`: Created Remotion projects (auto-generated)

## Dependencies

### Runtime Dependencies
- `@modelcontextprotocol/sdk`: MCP framework and types
- `fs-extra`: Robust cross-platform file operations
- `cross-env`: Environment variable handling
- `slash`: Path normalization
- `dotenv`: Environment file loading

### Development Dependencies  
- `typescript`: Build system
- `@types/node`, `@types/fs-extra`: Type definitions

The codebase prioritizes simplicity, cross-platform compatibility, and direct integration with Claude's intelligent JSX generation capabilities.