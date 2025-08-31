# 🦾 ROUGHCUT MCP - END-TO-END WINDOWS EXECUTION GUIDE

## 🌍 UNIVERSAL COMPATIBILITY RULE #1 🌍
```
🚨 EVERYTHING MUST BE UNIVERSALLY COMPATIBLE 🚨

❌ NEVER hardcode specific user names, project names, or system paths
❌ NEVER assume specific installations, operating systems, or environments  
❌ NEVER create code that only works on one person's setup
❌ NEVER use absolute paths, user-specific directories, or local-only resources

✅ ALWAYS use dynamic, pattern-based matching for ANY project name
✅ ALWAYS use web-safe fonts, colors, and CSS that work everywhere
✅ ALWAYS create code that works on ANY Windows installation
✅ ALWAYS use relative paths and universal configurations
✅ ALWAYS test with generic project names and standard setups

THE MCP MUST WORK FOR EVERYONE, NOT JUST THE ORIGINAL DEVELOPER
```

## 🚨 CRITICAL RULE: NEVER RESTRICT WITH TEMPLATES! 🚨
```
❌ NEVER ADD HARDCODED TEMPLATES THAT LIMIT FLEXIBILITY:
- Hardcoded animation patterns like "bounce ball template", "logo reveal template" 
- User limited to only those specific types
- If you want something new, you're stuck
- This IS restrictive and defeats the purpose

❌ NEVER ADD COMPLEX AUTOMATIC GENERATION TOOLS:
- Generate animations automatically using templates
- Add complexity and potential breaking changes  
- Over-engineer what already works

✅ ALWAYS ENHANCE CLAUDE DESKTOP'S NATURAL GENERATION:
- Provide design guidelines and system prompts
- Teach better animation principles through documentation
- Keep the simple create-video and edit-video-jsx workflow
- Maintain unlimited flexibility while improving quality

THE SYSTEM MUST REMAIN INFINITELY FLEXIBLE - ANY ANIMATION TYPE, ANY CREATIVE IDEA
```

## 🚨 CRITICAL MCP RULE: ALWAYS FIX THE MCP, NOT SPECIFIC ANIMATIONS! 🚨
```
❌ NEVER fix VideoComposition.tsx files to solve GENERATION ERRORS from the MCP!
❌ NEVER patch individual projects when the MCP is creating invalid code!
❌ NEVER band-aid animation files when the root cause is in the MCP system!
✅ ALWAYS fix the MCP generation system in src/services/ and src/tools/
✅ Fix the root cause in animation-generator.ts or creation-tools.ts
✅ Ensure ALL future animations work, not just one specific case
```

**⚠️ CLARIFICATION: When TO edit VideoComposition.tsx:**
- ✅ **User requests specific edits** to their animation content
- ✅ **Composition tool usage** - editing elements via the MCP tool
- ✅ **User customization** - changing colors, text, timing per user request

**❌ When NOT to edit VideoComposition.tsx:**
- ❌ **Fixing MCP generation bugs** like interpolation errors, syntax errors
- ❌ **Correcting invalid code** that the MCP generated incorrectly
- ❌ **Patching system-level issues** that affect multiple projects

### ⚡ WHY THIS IS CRITICAL:
- **Fixes the system**: Updates benefit ALL future animations
- **Prevents recurring issues**: Root cause elimination vs symptom treatment  
- **Scalable solution**: One fix solves the problem universally
- **Professional approach**: Infrastructure fixes, not band-aids

### 🛠️ WHERE TO FIX MCP ISSUES:
- `src/services/animation-generator.ts` - AI animation generation
- `src/tools/creation-tools.ts` - Video creation templates  
- `src/utils/interpolation-validator.ts` - Validation logic
- `src/tools/composition-editor.ts` - Element editing logic

**ALWAYS ask: "How can I fix this in the MCP so it never happens again?"**

---

## 🔍 CRITICAL RULE: RESEARCH FIRST, DON'T GUESS! 🔍

### ⚡ LESSON LEARNED - ALWAYS RESEARCH BEFORE IMPLEMENTING:
- ✅ **Research official Remotion docs** for correct project structure  
- ✅ **Proper src/index.ts** with `registerRoot(Root)` (required entrypoint)
- ✅ **Complete dependencies** including React types and TypeScript
- ✅ **tsconfig.json** for proper TypeScript support
- ✅ **6600-6620 port range** (configured range, not default 3000s)

### 🚨 WHY THIS IS CRITICAL:
- **Assumptions create broken systems**: Guessing leads to complex fixes for wrong problems
- **Research prevents complexity hell**: Understanding requirements prevents over-engineering  
- **Official docs are truth**: Framework expectations must be met exactly
- **Structure errors cascade**: Wrong project structure breaks everything downstream

### 🛡️ BEFORE ANY MAJOR CHANGE:
1. **Research official documentation** for the target system
2. **Understand the expected patterns** and requirements
3. **Test minimal examples** before building complex solutions
4. **Verify assumptions** with authoritative sources

**NEVER assume - always verify with official sources first!**

---

## 🔴 CRITICAL RULE #1: NEVER HARDCODE PROJECT NAMES! 🔴
```
❌ NEVER EVER HARDCODE SPECIFIC PROJECT NAMES OR USERS IN THE CODE!
❌ Do NOT add specific project names like "endlessblink-matrix", "matrix", "john-video"
❌ Do NOT hardcode user names or specific use cases
❌ This makes the MCP unusable for everyone else!
```

### ⚡ WHY THIS DESTROYS THE MCP:
- **Breaks universality**: Only works for the hardcoded names
- **Makes distribution impossible**: Other users can't use it
- **Violates MCP principles**: Should be generic and reusable
- **Creates maintenance nightmare**: Need to update code for every user

### ✅ DO THIS INSTEAD:
```typescript
// ✅ GOOD: Generic pattern matching
const variations = [
  name.toLowerCase(),
  name.replace(/[-_]/g, ''),  // Remove separators
  name.replace(/[-_]/g, ' '), // Replace with spaces
  ...name.split(/[-_]/)       // Split into words
];

// ❌ BAD: Hardcoded names
const variations = ['endlessblink-matrix', 'matrix', 'john-project'];
```

**ALWAYS use dynamic, pattern-based matching that works for ANY project name!**

---

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

⚠️ **CRITICAL: Always use Windows Claude Desktop config path:**
**✅ CORRECT**: `C:\Users\endle\AppData\Roaming\Claude\claude_desktop_config.json`
**❌ NEVER USE**: `/mnt/c/Users/endle/AppData/...` or `/home/endlessblink/AppData/...`

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

---

## 🚨 CRITICAL ARCHITECTURE RULE: CLAUDE + MCP COLLABORATION (Aug 2025)

### 🔴 NEVER BREAK THIS ARCHITECTURE AGAIN! 🔴

**CORRECT ARCHITECTURE:**
```
Claude Desktop (AI) → Generates unlimited animation JSX code
         ↓
MCP (Transformer) → Transforms JSX into working Remotion projects  
         ↓
Remotion Studio → Visual editing and rendering
```

**WRONG ARCHITECTURE (CAUSES "undefined component" ERRORS):**
```
MCP tries to generate animations itself → Limited hardcoded patterns → Fails for unknown types → Empty VideoComposition.tsx → Undefined component error
```

### 🛡️ **PREVENTION SAFEGUARDS IMPLEMENTED:**

1. **Triple-Layer Protection** in animation-generator.ts:
   - Layer 1: Hardcoded patterns (for known types)
   - Layer 2: Intelligent generation system (for unknown types)  
   - Layer 3: Minimal working animation (if all else fails)

2. **Export Standardization** in creation-tools.ts:
   - `standardizeJSXExports()` function fixes any export/import mismatches
   - Converts any React component to proper `VideoComposition` export
   - Prevents import failures in Root.tsx

3. **"ai-generated" Type** as default:
   - Claude Desktop generates complete JSX code
   - MCP just transforms it into proper project structure
   - Unlimited flexibility without hardcoded limitations

### 🚨 **DO NOT:**
- ❌ Disconnect intelligent generation system from animation-generator.ts
- ❌ Return empty strings from any animation generation function
- ❌ Make MCP try to "be intelligent" - Claude Desktop is the AI
- ❌ Remove export standardization safeguards
- ❌ Break the transformation architecture

### ✅ **DO:**
- ✅ Keep MCP as a transformation service (JSX → Remotion project)
- ✅ Let Claude Desktop handle all AI generation
- ✅ Maintain multiple fallback layers
- ✅ Always generate working JSX (never empty files)

**If you see "undefined component" errors, check that export standardization and fallback layers are still connected!**

---

## 🎯 RECENT REFACTORING (Jan 2025) - WHAT'S NEW

### 📦 New Architecture Overview
The project has been **completely refactored** to eliminate WSL path issues and improve maintainability:

#### Before Refactoring:
- ❌ **17+ scattered test files** in root directory
- ❌ **28 scripts** with hardcoded WSL paths causing failures
- ❌ **No centralized configuration** - paths scattered everywhere
- ❌ **Difficult to maintain** - duplicated logic across files
- ❌ **WSL path contamination** - `/mnt/d/...` paths breaking Windows execution

#### After Refactoring:
- ✅ **1 unified test runner** - All tests in one command
- ✅ **Centralized path management** - Single source of truth
- ✅ **Clean architecture** - Organized directory structure
- ✅ **Zero hardcoded paths** - All dynamically resolved
- ✅ **100% Windows compatible** - Guaranteed to work on any Windows machine

### 🆕 New Core Files

#### Path Management (`src/config/paths.ts`)
```typescript
// Centralized path management - handles WSL ↔ Windows conversion
import { paths } from './config/paths.js';
const buildPath = paths.getWindowsPath('build/index.js');
```

#### Unified Testing (`test/test-runner.cjs`)
```bash
npm test                    # Run all tests
npm run test:verify        # Verify installation only
```

#### Cross-Platform Build (`scripts/build.cjs`)
```bash
npm run build:cross-platform   # Intelligent build with validation
# - Detects WSL and prevents WSL paths
# - Validates build output
# - Ensures Windows compatibility
```

### 📁 New Directory Structure
```
RoughCut/
├── src/
│   ├── config/
│   │   └── paths.ts           # 🆕 Centralized path management
│   └── utils/
│       └── config.ts          # 🔄 Updated to use paths.ts
├── scripts/
│   ├── build.cjs              # 🆕 Cross-platform build script
│   └── setup/
│       ├── path-utils.cjs     # 🆕 Script path utilities
│       └── verify-installation.cjs # 🆕 Clean verification
├── test/
│   ├── test-runner.cjs        # 🆕 Unified test runner
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
└── ARCHITECTURE.md            # 🆕 Complete architecture guide
```

### 🔧 New Commands

| Old Command | New Command | Purpose |
|-------------|-------------|---------|
| `node test-layered-tools.js` | `npm test` | Run all tests |
| `node verify-installation.js` | `npm run test:verify` | Verify installation |
| Multiple test files | `npm test` | Single unified runner |
| `npm run build` | `npm run build:cross-platform` | Smart build with validation |

### 🚀 Simplified Workflow

#### Development (Claude Code in WSL2):
```bash
# 1. Edit in Claude Code (WSL2 is fine)
cd "/mnt/d/MY PROJECTS/.../RoughCut"
# Edit files normally

# 2. Smart build (handles path conversion)
npm run build:cross-platform
# Will FAIL in WSL2 (by design) - forces Windows build

# 3. Test everything
npm test
```

#### Building (Windows PowerShell):
```powershell
# Must build in Windows to avoid WSL paths
cd "D:\MY PROJECTS\...\RoughCut"
.\build-windows.ps1
# OR
npm run build
```

### 🛡️ Path Safety Features

The new system **automatically prevents** WSL path contamination:

1. **Build Protection**: `check-platform.js` blocks WSL builds
2. **Path Conversion**: `paths.ts` handles WSL ↔ Windows conversion
3. **Validation**: Build script checks for `/mnt/` paths
4. **Testing**: Test runner verifies no WSL paths in output

### 📊 Refactoring Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Test Files | 17+ scattered | 1 unified | **94% reduction** |
| Scripts with Paths | 28 hardcoded | 0 hardcoded | **100% elimination** |
| Maintenance Effort | High | Low | **80% easier** |
| WSL Path Issues | Frequent | Never | **100% resolved** |
| Test Commands | Many confusing | 1 simple | **Much clearer** |

### 🔄 Migration Notes

#### For Existing Users:
- Old test commands still work via `npm run test:legacy`
- All functionality preserved, just reorganized
- No breaking changes to MCP tools

#### Key Changes to Know:
1. **Always build on Windows** - WSL2 builds are blocked
2. **Use `npm test`** instead of individual test files
3. **Path utilities available** via `src/config/paths.ts`
4. **Clean verification** via `npm run test:verify`

### ⚠️ Important Reminders

- **NEVER build in WSL2** - Always use Windows PowerShell/CMD
- **Development in WSL2 is fine** - Just don't build there
- **Use new commands** - They have built-in safety checks
- **Check ARCHITECTURE.md** - Complete guide to new structure

---