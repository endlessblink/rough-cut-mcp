# Claude Code Session Memory & Drop-off
**Generated**: 2025-08-24
**Project**: RoughCut MCP - Remotion Video Generation Server

## 🎯 Current Project Context

### Project Location
- **Working Directory**: `/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut`
- **Platform**: Windows 11 with WSL2 (Ubuntu)
- **Node Version**: v22.18.0 (via NVM)

### Project Status
- **MCP Server**: RoughCut MCP for Remotion video generation
- **Build Status**: ❌ TypeScript compilation failing with 6 errors
- **Claude Desktop Integration**: ✅ Configured and ready
- **Global MCP Servers**: ✅ 4 servers installed globally

### Current Build Errors (MUST FIX)
```typescript
// src/index.ts - Type indexing errors at lines 184, 199, 219, 239, 259
// Handler objects need index signatures for dynamic property access
// src/services/tool-registry.ts:291 - Possibly undefined description
```

## 🧠 Like-I-Said Memory

### User Preferences & Requirements
1. **Windows-Only Execution**: 
   - NEVER build or run in WSL2 (creates `/mnt/d/...` paths)
   - ALWAYS build in Windows PowerShell/CMD
   - WSL2 only for editing files, not execution

2. **PowerShell Script Requirements**:
   - `else` must be on new line after `}`
   - No Unicode/emoji in scripts
   - Use simple ASCII text only

3. **MCP JSON-RPC Strictness**:
   - NO console.log/error/warn in MCP code
   - Use file-based logging only
   - Any console output breaks Claude Desktop

4. **Global MCP Installation Preference**:
   - User wants ALL MCP servers installed globally
   - Persist across Claude Code sessions
   - Managed via NVM Node.js v22.18.0

### Session Achievements
- ✅ Removed ruv-swarm MCP from Claude configuration
- ✅ Installed 4 MCP servers globally:
  - @playwright/mcp@0.0.34
  - @modelcontextprotocol/server-sequential-thinking@2025.7.1
  - @upstash/context7-mcp@1.0.16
  - @endlessblink/like-i-said-mcp@3.0.0
- ✅ Fixed PowerShell script syntax issues
- ✅ Created Windows-only build system
- ✅ Removed WSL2 path conversion utilities

## 📋 Drop-off Prompt for New Session

```markdown
I need to continue working on the RoughCut MCP server for Remotion video generation. 

Current location: /mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut

CRITICAL ISSUES TO FIX:
1. TypeScript build is failing with 6 errors - handler objects need index signatures
2. Must build ONLY in Windows PowerShell, never WSL2

Key context:
- This is an MCP server for Claude Desktop that generates videos with Remotion
- The build must happen in Windows to avoid WSL path issues
- NO console.log allowed in MCP code (breaks JSON-RPC protocol)
- PowerShell scripts need 'else' on new line after '}'

The main TypeScript errors are in src/index.ts where handler objects are being indexed dynamically but lack proper TypeScript index signatures. The handlers (videoHandlers, voiceHandlers, soundHandlers, imageHandlers, assetHandlers) need to be typed properly to allow string indexing.

Please help me fix the TypeScript errors so the MCP server can build successfully.
```

## ✅ Quick Verification Commands

```bash
# Check current directory
pwd  # Should be: /mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/RoughCut

# Check git status
git status --short

# Verify global MCP installations
npm list -g --depth=0 | grep -E "@playwright|@modelcontextprotocol|@upstash|@endlessblink"

# Check Claude Desktop config (Windows)
cat /mnt/c/Users/endle/AppData/Roaming/Claude/claude_desktop_config.json

# Test build (MUST RUN IN WINDOWS POWERSHELL)
# Open PowerShell and run:
# cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
# npm run build
```

## 🚀 Next Steps (Priority Order)

### 1. Fix TypeScript Build Errors (URGENT)
- Add index signatures to handler objects in `src/index.ts`
- Fix undefined check in `src/services/tool-registry.ts:291`
- Ensure all handlers have proper TypeScript typing

### 2. Build in Windows PowerShell
```powershell
cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\RoughCut"
npm run build
```

### 3. Test MCP Server
- Restart Claude Desktop after successful build
- Test with: "List my video projects"
- Verify all tools are available

### 4. Optional Enhancements
- Implement AST-based video editing for `edit-video-element` tool
- Add more video templates
- Improve error handling

## 🛠️ Environment Details

### Installed Global NPM Packages (MCP)
```
@endlessblink/like-i-said-mcp@3.0.0 -> /mnt/d/APPSNospaces/like-i-said-mcp
@modelcontextprotocol/server-sequential-thinking@2025.7.1
@playwright/mcp@0.0.34
@upstash/context7-mcp@1.0.16
```

### Project Dependencies
- Remotion for video generation
- TypeScript for type safety
- Zod for schema validation
- Express for potential web interface
- Various AI services (ElevenLabs, Flux, Freesound)

### File Structure
```
RoughCut/
├── src/               # TypeScript source (ERRORS HERE)
├── build/             # Compiled JavaScript (outdated)
├── assets/projects/   # 31+ Remotion video projects
├── scripts/           # Build and utility scripts
├── CLAUDE.md         # Critical Windows-only instructions
└── package.json      # Dependencies and scripts
```

## ⚠️ Critical Reminders

1. **NEVER build in WSL2** - Always use Windows PowerShell
2. **NO console output in MCP code** - Use logger instead
3. **PowerShell syntax** - `else` on new line, no Unicode
4. **Windows paths only** - `D:\...` not `/mnt/d/...`
5. **Test before claiming success** - Actually verify it works

## 📝 Session Notes

The main challenge in this session was understanding the Windows/WSL2 boundary issue. The project MUST be built in Windows to avoid WSL path contamination in the compiled JavaScript. The TypeScript errors are straightforward type indexing issues that need proper interface definitions with index signatures.

The user has been very clear about wanting things to work properly and has corrected multiple issues throughout the session. They prefer global installations for persistence and have a strong preference for Windows-native execution.

---

**End of Memory Drop-off Document**
*Use the drop-off prompt above to continue in a new Claude Code session*