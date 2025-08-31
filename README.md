# Remotion MCP Server

A minimal MCP server for Remotion video creation. Claude Desktop generates JSX intelligently - this server just handles file operations and process management.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build (Windows only):**
   ```bash
   npm run build:windows
   ```
   
3. **Configure Claude Desktop:**
   Add to your Claude Desktop configuration:
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
- `typescript` - Build system

## Error Handling

All tools return structured responses:
```json
{
  "success": true/false,
  "message": "Description",
  "error": "Error details (if failed)"
}
```

## Limitations

- Windows-only (by design)
- Requires Node.js and npm
- Remotion projects need Chromium for rendering
- Studios auto-assign ports 6600-6620

This server does exactly one thing well: takes Claude's intelligent JSX generation and turns it into working Remotion projects without any interference.