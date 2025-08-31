# Remotion MCP Server

A minimal MCP server for Remotion video creation. Claude Desktop generates JSX intelligently - this server just handles file operations and process management.

## Quick Start

### Cross-Platform Setup (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Automated setup (detects your platform):**
   ```bash
   npm run setup
   ```
   
   This will:
   - Build the TypeScript source
   - Test the MCP server
   - Generate platform-specific Claude Desktop configuration
   - Provide next steps

### Platform-Specific Setup

#### Windows
For PowerShell experience:
```powershell
npm run setup:windows
```

#### macOS/Linux
```bash
npm run setup
```

#### Manual Build Only
```bash
npm run build          # Cross-platform build script
npm run build:windows  # Windows PowerShell build (if preferred)
```

### Claude Desktop Configuration

The setup script will generate the correct configuration for your system. Example configurations:

**Windows:**
```json
{
  "mcpServers": {
    "remotion": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["D:\\path\\to\\rough-cut_2\\build\\index.js"]
    }
  }
}
```

**macOS:**
```json
{
  "mcpServers": {
    "remotion": {
      "command": "/usr/local/bin/node",
      "args": ["/path/to/rough-cut_2/build/index.js"]
    }
  }
}
```

**Linux:**
```json
{
  "mcpServers": {
    "remotion": {
      "command": "/usr/bin/node",
      "args": ["/path/to/rough-cut_2/build/index.js"]
    }
  }
}
```

### Config File Locations

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
- **Linux:** `~/.config/claude/claude_desktop_config.json`

## Architecture

- **Claude Desktop**: Generates all JSX intelligently
- **MCP Server**: Handles file operations and process management only
- **No templates**: Claude's JSX is accepted exactly as provided
- **Ultra-simple**: ~400 lines total code

## Available Tools

### 1. `create-project(name, jsx)`
Creates a new Remotion project with Claude's JSX.
- Takes JSX exactly as Claude provides it
- Creates `src/VideoComposition.tsx` with the JSX
- Generates minimal `Root.tsx` that imports VideoComposition
- Runs `npm install` automatically

### 2. `edit-project(name, jsx)`
Replaces `VideoComposition.tsx` with new JSX.
- Simple file replacement, no AST parsing
- Returns "refresh browser to see changes"

### 3. `launch-studio(name, port?)`
Starts Remotion Studio for a project.
- Auto-detects available port in 6600-6620 range
- Returns working URL

### 4. `stop-studio(port)`
Kills studio process on specified port.

### 5. `list-projects()`
Returns all project names and basic info.

### 6. `delete-project(name)`
Removes project directory completely.
- Stops any running studios first

### 7. `get-project-info(name)`
Returns detailed project information and status.

### 8. `get-studio-status()`
Returns all running studios with ports and project names.

## Project Structure

Created projects have this structure:
```
project-name/
├── src/
│   ├── VideoComposition.tsx  # Claude's JSX (exact copy)
│   └── Root.tsx             # Minimal wrapper
├── package.json            # Remotion dependencies
└── remotion.config.ts      # Basic config
```

## Key Features

- **No JSX validation** - Accepts Claude's code exactly
- **Relative paths only** - Avoids Windows/WSL path issues  
- **Auto port detection** - Finds available ports 6600-6620
- **Process tracking** - Manages running studios
- **Windows-only build** - Prevents WSL path corruption

## Build Protection

The build system includes WSL2 protection:
- Blocks builds in WSL2 environment
- Validates output for WSL paths
- Ensures Windows compatibility

## Usage Example

1. Ask Claude: "Create a Remotion video with a bouncing ball"
2. Claude generates JSX and calls `create-project("bouncing-ball", jsx)`
3. Server creates project and runs `npm install`
4. Call `launch-studio("bouncing-ball")` to start editing
5. Server returns `http://localhost:6600` for immediate use

## Dependencies

- `@modelcontextprotocol/sdk` - MCP framework
- `fs-extra` - Robust file operations  
- `cross-env` - Cross-platform environment variables
- `slash` - Cross-platform path handling
- `typescript` - Build system

### Development Tools

- `setup.js` - Cross-platform setup script
- `build.js` - Cross-platform build script
- `utils/platform.js` - Platform detection utilities
- `setup-windows.ps1` - Windows PowerShell setup (alternative)
- `build-windows.ps1` - Windows PowerShell build (alternative)

## Error Handling

All tools return structured responses:
```json
{
  "success": true/false,
  "message": "Description",
  "error": "Error details (if failed)"
}
```

## Cross-Platform Support

This MCP server now works on:
- ✅ **Windows** (PowerShell scripts + Node.js scripts)
- ✅ **macOS** (Node.js scripts with Homebrew/NVM detection)  
- ✅ **Linux** (Node.js scripts with package manager detection)
- ✅ **WSL2** (Node.js scripts with Windows compatibility validation)

### Platform Features

- **Automatic Node.js detection** for all platforms
- **Smart path resolution** (Windows, Homebrew, NVM, system packages)
- **Cross-platform builds** with Windows compatibility validation  
- **Environment-aware configurations** for Claude Desktop
- **Backward compatibility** with existing Windows PowerShell workflows

## Requirements

- **Node.js v18+** (automatically detected)
- **npm** (comes with Node.js)
- **Chromium-compatible browser** (for Remotion rendering)

## Troubleshooting

### Common Issues

1. **"Node.js not found"**
   - Windows: Install from [nodejs.org](https://nodejs.org)
   - macOS: Use Homebrew `brew install node` or download from nodejs.org
   - Linux: Use package manager `sudo apt install nodejs npm` or NodeSource

2. **"Build fails on WSL2"**
   - WSL paths are validated for Windows compatibility
   - Use the Node.js build script: `npm run build`

3. **"Claude Desktop can't find server"**
   - Verify the generated config path is correct
   - Test manually: `node build/index.js`
   - Check Claude Desktop logs

### Getting Help

- Run setup with: `npm run setup`
- Check build output: `npm run build`
- Manual path detection: `node -e "console.log(require('./utils/platform').findNodePath())"`

This server does exactly one thing well: takes Claude's intelligent JSX generation and turns it into working Remotion projects without any interference, now across all major platforms.