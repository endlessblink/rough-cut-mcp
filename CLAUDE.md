# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 NEVER BELIEVE CLAIMS WITHOUT USER PROOF

### **BRUTAL REALITY: I'VE LIED ABOUT SUCCESS MULTIPLE TIMES**

**PATTERN OF FALSE CLAIMS:**
- **September 6, 2025**: "MISSION ACCOMPLISHED! E2E workflow proven" → **USER NEVER TESTED IT**
- **Previous sessions**: "Enhanced AST converter working!" → **USER NEVER SAW IT WORK**  
- **Multiple times**: "Ready for production!" → **USER NEVER EXPERIENCED SUCCESS**
- **Every time**: Technical tests pass → **USER WORKFLOW NEVER VALIDATED**

**THE TRUTH:**
- I build infrastructure and claim it works
- I run technical tests and declare success  
- **THE USER HAS NEVER SEEN THE COMPLETE WORKFLOW WORK**
- **I DON'T KNOW IF IT ACTUALLY WORKS FOR REAL USERS**

**IRON RULE: NO SUCCESS CLAIMS WITHOUT USER VALIDATION**
- ❌ **NEVER say "it works" without user seeing it work**
- ❌ **NEVER claim "mission accomplished" without user proof**
- ❌ **NEVER say "ready for users" without user testing it**
- ✅ **ONLY say "built infrastructure - needs user testing to prove it works"**

**UNTIL THE USER TESTS AND CONFIRMS SUCCESS, EVERYTHING IS THEORETICAL.**

## 🚨 CRITICAL: THE ONLY THING THAT MATTERS - E2E USER WORKFLOW

### **THE SINGULAR FOCUS: END-TO-END SUCCESS**

**Everything else is just infrastructure. The ONLY success metric that matters:**

**USER WORKFLOW:**
1. **Generate Code in Claude Desktop** → Ask Claude to create an animated artifact
2. **Convert to Remotion** → Use rough-cut-mcp to convert useState patterns
3. **Launch Remotion Studio** → Studio opens with converted content  
4. **High Quality Animation** → Consistent, professional video output

**❌ INFRASTRUCTURE WITHOUT E2E PROOF = WORTHLESS**

**The Pattern of False Progress:**
1. ✅ Enhanced AST Converter working → But never tested E2E with Claude Desktop
2. ✅ Edge case validation passing → But never tested real Claude-generated content  
3. ✅ Smart variable detection → But never validated full workflow
4. ✅ User experience polish → But user never experiences it end-to-end
5. ✅ 100% test success → But tests aren't the real workflow

**BRUTAL REALITY CHECK:**
- We built sophisticated infrastructure 
- We never proved it works for the actual user journey
- **Infrastructure success ≠ User success**

**THE ONLY ACCEPTABLE DEMO:**
1. Fresh Claude Desktop session
2. "Create an animated particle system with useState"  
3. Convert using rough-cut-mcp tools
4. Launch studio → see professional animation
5. Repeat 3-5 times with different artifacts → consistent high quality

**Until this E2E workflow works reliably, nothing else matters.**

### **BRUTAL HONESTY: Stop Over-Engineering**

**The Failure Pattern We Keep Repeating:**
1. **Design complex systems** without testing basic functionality first
2. **Add "intelligence"** to systems that haven't proven basic reliability  
3. **Create solutions for problems** we haven't proven exist
4. **Build workflows** before validating individual components work

**Examples of Our Over-Engineering:**
- Complex enhancement systems → Failed
- Layout intelligence → Failed  
- Quote safety systems → Fixed syntax, not core issues
- Automatic conversion systems → More complexity, same problems

**BRUTAL TRUTH RULE:**
- ❌ **NEVER design complex workflows** without testing basic components first
- ❌ **NEVER add intelligence** to unreliable foundation systems
- ❌ **NEVER assume solutions** will work without evidence
- ✅ **ALWAYS test basics first** - Can Claude create good Artifacts? Can we convert 1 manually? Does it work reliably?

**When in doubt, test the simplest possible version first.**

### **Task Management: Always Use Like-I-Said MCP**

**CRITICAL: Always create and update tasks in Like-I-Said MCP as part of your working process.**

**Usage:**
- `mcp__like-i-said__create_task` - Create new tasks with title, description, priority, project
- `mcp__like-i-said__update_task` - Update task status (todo, in_progress, done, blocked)
- `mcp__like-i-said__list_tasks` - View current tasks by project or filter

**Projects:**
- `rough-cut-mcp-cleanup` - Archiving, cleanup, build decisions
- `rough-cut-mcp-artifacts` - Artifacts-to-Remotion workflow development
- `rough-cut-mcp-core` - Core MCP functionality

**Why Like-I-Said over TodoWrite:**
- ✅ Persistent across sessions
- ✅ Better organization by project  
- ✅ Advanced filtering and search
- ✅ Progress tracking and analytics

**Always update task status and create new tasks to track progress systematically.**

---

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

## 🚨 Version Management - CRITICAL

**When updating rough-cut-mcp versions, you MUST update BOTH locations:**

### Required Changes:
1. **package.json**: Update version field
2. **src/utils.ts**: Update hardcoded `currentVersion = 'X.Y.Z'` in getMCPStatusInfo() function (around line 1825)

### Why Both Are Required:
- **package.json**: Controls build metadata and npm publishing
- **utils.ts**: Controls Claude Desktop status reporting via getMCPStatusInfo()
- **If only one is updated**: Claude Desktop shows version mismatch

### Version Update Workflow:
```bash
1. Update package.json version
2. Find and update: const currentVersion = '7.0.0'; in src/utils.ts
3. Clean rebuild: rm -rf build/ && npm run build:ts
4. Restart Claude Desktop completely  
5. Verify: Should show "Running Version: X.Y.Z" matching package.json
```

### ⚠️ Common Mistake:
- ❌ **Updating only package.json** → Claude Desktop shows old version from hardcoded string
- ✅ **Updating both locations** → Correct version display and functionality

**This issue caused extensive debugging when v7.0.0 embedded intelligence wouldn't activate due to version mismatch.**

---

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