# 🦾 ROUGHCUT MCP - END-TO-END WINDOWS EXECUTION GUIDE

## 🔴 CRITICAL: THE #1 RULE TO REMEMBER 🔴
```
WSL PATHS (/mnt/d/...) SHOULD NEVER EXIST IN THE FIRST PLACE!
- Build on Windows → Get Windows paths
- Run on Windows → Use Windows paths  
- NEVER build in WSL2 → NEVER get WSL paths!
```

---

## 🚨 STRICT REQUIREMENT: WINDOWS-ONLY EXECUTION (E2E) 🚨

### ⚠️ THE GOLDEN RULE: NO WSL PATHS SHOULD EVER EXIST ⚠️
**If you see `/mnt/d/...` paths ANYWHERE, you're doing it wrong!**

### DO NOT RUN ANY MCP OR REMOTION WORKLOADS IN WSL2

- ✅ **Windows Native Execution Only**: All MCP, Remotion Studio, and associated tools must be run exclusively through Windows executables and Windows paths.
- ✅ **Project Development May Occur in WSL2**: You may **edit, git, and manage** files using WSL2 or VS Code WSL integration, but all build, serve, and tool launch must be done on Windows.
- ✅ **Project and Asset Locations Must Be Windows Paths**: E.g. `D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut`
- ❌ **NO Operations in WSL2 Paths**: Never use `/mnt/d/...` or any Linux-only or pseudo-Linux path for execution. MCP, Remotion CLI, and Node.js scripts must never reference or launch in WSL2 paths.
- ❌ **NO Linux-Only Node.js, npm, or Remotion**: Do not install or run Node.js or dependencies inside a WSL2 Linux environment for anything production related.

**WHY:**  
- **Building in WSL2 creates WSL paths** that Windows cannot execute
- **WSL paths (`/mnt/d/...`) should NEVER exist** in the compiled code
- **All paths must be Windows native (`D:\...`) from the start**
- Mixing execution environments causes "Process exited with code 1" failures

---

## ✳️ DEV/PROD FLOW

| Step                   | Where                  | How                                     | Path Style                |
|------------------------|------------------------|------------------------------------------|---------------------------|
| 1. **Edit code**       | WSL2 (optional)        | Via VS Code WSL, shell, or git           | `/mnt/d/...`              |
| 2. **Build/Run**       | **Windows native**     | Always run build, serve, and CLI tools   | `D:\MY PROJECTS\...`      |
| 3. **CLI Tools**       | **Windows native**     | Spawn, npm, npx from Windows Node.js     | `D:\MY PROJECTS\...`      |
| 4. **Asset paths**     | **Windows naming**     | Only Windows paths in configs and tools  | `D:\MY PROJECTS\...`      |

**Note:**  
All execution, launches, spawns, builds, and MCP JSON output must use Windows-native paths and environments.

---

## 🏗️ PROJECT STRUCTURE (WINDOWS PATHS ONLY)

```
D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut\
├── build\index.js                    # Compiled MCP server (run only in Windows)
├── src\                             # Source code (edit in WSL2 OK)
│   ├── index.ts
│   ├── tools\
│   ├── services\
│   ├── utils\
│   └── types\
├── assets\
│   └── projects\                   # All Remotion projects (Windows path)
│   └── videos\
│   └── cache\
├── package.json
├── tsconfig.json
└── CLAUDE.md   # (this file)
```

---

## 🛑 WINDOWS CONFIGURATION - MCP JSON-RPC STRICTNESS

- MCP runs as a **JSON-RPC over stdio** process from Windows Claude Desktop.
- ⭐ **Do not use any console.log, console.error, etc. in MCP!**
- ⭐ Use only file-based logging.
- **MCP config file must only use Windows paths:**

```json
{
  "mcpServers": {
    "rough-cut-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\build\\index.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "REMOTION_ASSETS_DIR": "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\assets"
      }
    }
  }
}
```

---

## 🚨 CRITICAL: MCP JSON-RPC PROTOCOL REQUIREMENTS 🚨

**NEVER ADD CONSOLE OUTPUT TO MCP SERVER CODE!**
- ❌ **NO console.log()** - Breaks JSON-RPC communication
- ❌ **NO console.error()** - Causes "Unexpected token" JSON parse errors  
- ❌ **NO console.warn()** - Corrupts MCP protocol messages
- ❌ **NO console.debug()** - Interferes with Claude Desktop communication
- ❌ **NO console.time()/timeEnd()** - Outputs to stdout breaking protocol
- ✅ **USE logger.info/debug/error** - Writes to files only, not stdout/stderr
- ✅ **ALWAYS REBUILD** after removing console statements: `npm run build`

**WHY THIS MATTERS:**
- MCP uses JSON-RPC over stdio (stdin/stdout)
- ANY console output corrupts the JSON stream
- Results in errors like: "Unexpected token 'D', '[DEBUG] Rec'... is not valid JSON"
- This is a RECURRING issue that breaks Claude Desktop integration

---

## ⚡ KEY EXECUTION RULES - BUILD AND RUN ON WINDOWS ONLY!

### 🚨 CRITICAL BUILD STEPS (WINDOWS ONLY):
1. **Open Windows PowerShell or CMD** (NOT WSL2 terminal!)
2. **Navigate to project in Windows:**
   ```powershell
   cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
   ```
3. **Install dependencies with Windows npm:**
   ```powershell
   npm install
   ```
4. **Build with Windows Node.js:**
   ```powershell
   npm run build
   ```

### WHY THIS IS CRITICAL:
- **Building in WSL2 bakes WSL paths into the code** (`/mnt/d/...`)
- **Windows can't execute WSL paths** → "Process exited with code 1"
- **All paths must be Windows native from the start** (`D:\...`)

### NEVER DO THIS:
```bash
# ❌ WRONG - WSL2 terminal
cd /mnt/d/MY\ PROJECTS/...
npm run build  # This creates WSL paths!
```

### ALWAYS DO THIS:
```powershell
# ✅ CORRECT - Windows PowerShell/CMD
cd "D:\MY PROJECTS\..."
npm run build  # This creates Windows paths!
```

- **Launch MCP ONLY via Windows:**  
  Either through Claude Desktop auto-discovery or manually with:
  ```
  "C:\Program Files\nodejs\node.exe" "D:\...\RoughCut\build\index.js"
  ```

- **Remotion Studio Launches:**  
  Must be from Windows, with `cwd` and config paths as Windows native.  
  No `/mnt/...` or Linux home dir references allowed.

---

## 🧑‍💻 DEVELOPMENT FLOW (FOR DEVELOPERS)

### ⚠️ REMEMBER: WSL PATHS SHOULD NEVER EXIST IN THE FIRST PLACE! ⚠️

1. **You MAY edit source files in WSL2 or with any IDE.**
2. **NEVER build using `npm run build` in WSL2** - This bakes WSL paths into the code!
3. **NEVER run using `node` or `npx` in WSL2** - This uses WSL paths!
4. **When ready to test:**
    - **MUST** switch to Windows PowerShell/CMD
    - **MUST** navigate using Windows path: `cd "D:\MY PROJECTS\..."`
    - **MUST** build with Windows npm: `npm run build`
    - **MUST** run all commands from Windows terminal
5. **All paths everywhere must be Windows paths** - Never `/mnt/d/...`!

---

## ✅ EXAMPLES OF ACCEPTABLE vs. UNACCEPTABLE USAGE

| Acceptable (✔)                    | Not Acceptable (✗)                |
|------------------------------------|-----------------------------------|
| `"D:\MY PROJECTS\foo\bar.js"`      | `"/mnt/d/MY PROJECTS/foo/bar.js"` |
| `C:\Program Files\nodejs\node.exe` | `node` (if Linux node in WSL2)    |
| Run in Windows terminal/cmd/pwsh   | Run in WSL2 shell                 |
| Windows-based npm, Remotion, etc.  | Linux npm/node/Remotion           |
| Build in Windows, edit in WSL2     | Build in WSL2                     |
| Asset/project paths use `\`        | Asset project paths use `/`       |

---

## 🗂️ WHY THIS MATTERS

- **Reliability:** Prevents exec/spawn failures, inaccessible paths, and cross-platform bugs.
- **Performance:** Windows Node.js is optimized for NTFS and Windows processes on Windows drives.
- **Claude Desktop Integration:** Desktop MCP can ONLY access Windows paths, not Linux, and expects MCP tools to do the same.

---

## 🎯 LAYERED TOOL ARCHITECTURE (Implemented Jan 26, 2025)

### Overview
The MCP server now implements a **layered tool architecture** that dramatically improves performance by reducing initial tool exposure from 43 tools to just 9 tools. This addresses LLM performance degradation that occurs when too many tools are presented at once.

### Why This Was Implemented
- **Research shows** LLMs get confused with 40+ tools
- **Reduces context bloat** by 79% (from ~8,600 to ~1,800 tokens)
- **Improves tool selection accuracy** through better organization
- **Enables scalability** for future tool additions

### Tool Organization Structure

#### Layer 1: Discovery Tools (Always Active - 6 tools)
- `discover-capabilities` - Show available tool categories
- `activate-toolset` - Load specific tool categories
- `search-tools` - Find tools by name/functionality
- `get-active-tools` - List currently loaded tools
- `suggest-tools` - Get intelligent recommendations
- `get-tool-usage-stats` - View usage analytics

#### Layer 2: Core Operations (Default Loaded - 3 tools)
- `list-video-projects` - List all animation projects
- `get-project-status` - Get project information
- `launch-project-studio` - Launch Remotion Studio

#### Layer 3: On-Demand Categories (30+ tools total)
- **Video Creation** (9 tools) - Animation creation/editing
- **Studio Management** (11 tools) - Remotion Studio control
- **Voice Generation** (5 tools) - ElevenLabs TTS (requires API key)
- **Sound Effects** (5 tools) - Freesound integration (requires API key)
- **Image Generation** (6 tools) - Flux AI images (requires API key)
- **Maintenance** (4 tools) - Asset cleanup/organization

### How to Use

#### Discovering Available Tools
```
1. Use `discover-capabilities` to see all categories
2. Use `get-active-tools` to see currently loaded tools
3. Use `search-tools` with a query to find specific tools
```

#### Activating Tool Categories
```
Use `activate-toolset` with:
- categories: ["video-creation", "studio-management"]
- exclusive: true/false (whether to deactivate others first)
```

#### Example Workflow
```
1. Start → 9 tools available (6 discovery + 3 core)
2. Need to create video → activate-toolset { categories: ["video-creation"] }
3. Need voice → activate-toolset { categories: ["voice-generation"] }
4. Tools are now available for use
```

### Configuration Options

#### Default Mode (Layered - Recommended)
- Starts with only 9 tools
- Load additional tools on demand
- Better performance and accuracy

#### Legacy Mode (All Tools)
Set environment variable to load all 43 tools at once:
```powershell
$env:MCP_LEGACY_MODE = "true"
```

### Performance Improvements
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Tools | 43 | 9 | 79% reduction |
| Context Tokens | ~8,600 | ~1,800 | 79% reduction |
| Tool Organization | None | 9 categories | Better structure |
| Dynamic Loading | No | Yes | On-demand |

### Key Implementation Files
- `src/services/tool-registry.ts` - Dynamic tool management system
- `src/tools/discovery-tools.ts` - Discovery layer implementation
- `src/types/tool-categories.ts` - Tool category definitions
- `src/index.ts` - Updated to use tool registry
- `LAYERED-TOOLS-GUIDE.md` - Detailed documentation
- `test-layered-tools.js` - Test script for verification

### Testing the Architecture
```powershell
# Build on Windows
.\build-windows.ps1

# Test the layered system
node test-layered-tools.js
```

---

## 🛠️ COMPLETE MCP TOOLS REFERENCE

### ✅ Project Management Tools (WORKING)
- **`list-video-projects`** - Lists all video projects in assets/projects
- **`get-project-status`** - Gets detailed information about projects
- **`analyze-video-structure`** - Analyzes VideoComposition.tsx structure
- **`launch-project-studio`** - Launches Remotion Studio for specific project
- **`edit-video-element`** - Edits video elements (needs AST implementation)
- **`install-project-dependencies`** - Installs npm dependencies for a project
- **`repair-project`** - Repairs broken projects by adding missing files

### ✅ Video Creation Tools
- **`create-complete-video`** - Creates new video with React component code
- **`create-text-video`** - Creates simple text-only video
- **`generate-video-assets`** - Generates voice/images/sounds for videos

### ✅ Studio Management Tools (WORKING)
- **`launch-remotion-studio`** - Launches Remotion Studio dashboard
- **`stop-remotion-studio`** - Stops running Remotion Studio instance
- **`get-studio-status`** - Checks studio status and running instances
- **`launch-studio-with-project`** - Launches studio with specific project

### ✅ Asset Management Tools
- **`get-asset-statistics`** - Gets comprehensive asset statistics
- **`cleanup-old-assets`** - Cleans up old temporary files
- **`organize-assets`** - Organizes asset directories
- **`get-disk-usage`** - Gets disk usage information

---

## 📝 MAINTAINING THE E2E WINDOWS PROMISE

### 🔴 THE CORE PRINCIPLE: NO WSL PATHS SHOULD EVER EXIST! 🔴

- **Build on Windows** = Windows paths in compiled code
- **Run on Windows** = Windows paths at runtime
- **Never build in WSL2** = Never get WSL paths in the first place!

- MCP, Remotion Studio, and all processes must run natively on Windows.
- WSL2 is for developer convenience only, *never* for launching/serving/building/CLI.
- All logs, outputs, scripts, and references must be Windows-native.
- Any breakage in this pattern will result in launch, spawn, or process failure (exit code 1, path not found, or process not discovered).

**If you see `/mnt/d/...` ANYWHERE in logs, output, or errors - STOP! You're building/running from WSL2!**

---

> **Edit code where you want, but BUILD, LAUNCH, and RUN everything in Windows. Nothing leaves Windows. No `/mnt/`, no `/home/`, no bash/npx under WSL2. If it's an MCP server, tool, or Remotion process, it is Windows-only e2e.**

---

## 📝 POWERSHELL SCRIPTING GUIDELINES FOR WINDOWS

When creating PowerShell scripts for this project, follow these rules to ensure compatibility:

### ✅ DO:
1. **Use simple ASCII text** - Avoid Unicode characters in scripts
2. **Put `else` on a new line** after the closing brace:
   ```powershell
   if ($condition) {
       # code
   }
   else {
       # code
   }
   ```
3. **Use basic Write-Host** for output
4. **Test scripts in actual Windows PowerShell** before deploying
5. **Keep variable names simple** without special characters

### ❌ DON'T:
1. **Don't use emoji or Unicode** in comments or strings (causes parsing errors)
2. **Don't put `else` on same line as `}`** - This syntax fails:
   ```powershell
   } else {  # WRONG - causes "Unexpected token" error
   ```
3. **Don't write scripts in WSL2** - Different line endings can cause issues
4. **Don't use complex nested structures** without testing

### Example Working Script Structure:
```powershell
Write-Host "Starting..." -ForegroundColor Cyan

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success" -ForegroundColor Green
}
else {
    Write-Host "Failed" -ForegroundColor Red
    exit 1
}
```

---

## 🎬 MCP WORKFLOW VALIDATION

Claude Desktop MUST support this exact flow:
```
1. Claude Desktop → "List the animations we have" 
   ↓ (calls list-video-projects)
   MCP finds all projects in assets/projects (Windows paths)

2. Claude Desktop → "Launch the GitHub animation"
   ↓ (calls launch-project-studio)
   Studio launches with Windows paths

3. Claude Desktop → "Create a new bouncing ball animation"
   ↓ (calls create-complete-video)
   Creates project with all required files using Windows paths

4. Claude Desktop → "Kill current studio and restart fresh"
   ↓ (calls stop-remotion-studio then launch-project-studio)
   Studio restarts with Windows paths
```

**ANY PATH ISSUES OR CROSS-SUBSYSTEM EXECUTION WILL CAUSE FAILURES**

---

**THE MCP IS OPERATIONAL WITH WINDOWS-ONLY EXECUTION!**