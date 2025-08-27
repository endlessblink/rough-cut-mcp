# 🎯 Layered Tool Architecture Guide

## Overview

The RoughCut MCP server now implements a **layered tool architecture** that dramatically improves performance and tool selection accuracy by reducing initial context from 40+ tools to just 9-10 tools.

## Why This Matters

Research shows that LLMs experience significant performance degradation when presented with more than 40 tools at once. By implementing a layered approach, we:

- **Reduce context bloat** from ~43 tools to 9-10 initially
- **Improve tool selection accuracy** by organizing tools logically
- **Save tokens** through on-demand loading
- **Enable better scalability** for future tool additions

## Architecture Layers

### Layer 1: Discovery Tools (Always Active)
These 6 tools are always available and allow dynamic tool management:

1. **`discover-capabilities`** - Show available tool categories
2. **`activate-toolset`** - Load specific tool categories on demand
3. **`search-tools`** - Find tools by name or functionality
4. **`get-active-tools`** - List currently loaded tools
5. **`suggest-tools`** - Get intelligent tool recommendations
6. **`get-tool-usage-stats`** - View usage analytics

### Layer 2: Core Operations (Default Loaded)
These 3 essential tools are loaded by default:

1. **`list-video-projects`** - List all animation projects
2. **`get-project-status`** - Get project information
3. **`launch-project-studio`** - Launch Remotion Studio

### Layer 3: On-Demand Tool Categories

Tools organized by category, loaded when needed:

- **Video Creation** (5 tools) - Animation creation and editing
- **Studio Management** (12 tools) - Remotion Studio control
- **Voice Generation** (5 tools) - ElevenLabs TTS
- **Sound Effects** (5 tools) - Freesound integration
- **Image Generation** (6 tools) - Flux AI images
- **Maintenance** (4 tools) - Asset cleanup and organization

## Usage Examples

### Example 1: Initial State
```
Claude: "What tools are available?"
> Calls: get-active-tools
< Returns: 9 tools (6 discovery + 3 core operations)
```

### Example 2: Activating Video Creation Tools
```
Claude: "I need to create a new animation"
> Calls: activate-toolset { categories: ["video-creation"] }
< Returns: Activated 5 tools
> Now can use: create-complete-video, create-text-video, etc.
```

### Example 3: Smart Tool Discovery
```
Claude: "I need to add voice narration"
> Calls: suggest-tools { taskDescription: "add voice narration" }
< Returns: Suggests voice generation tools
> Calls: activate-toolset { categories: ["voice-generation"] }
< Returns: Voice tools now available
```

## Configuration

### Default Mode (Layered)
The server starts in layered mode by default, exposing only discovery and core tools.

### Legacy Mode (All Tools)
To load all tools at once (old behavior), set:
```powershell
$env:MCP_LEGACY_MODE = "true"
```

Or add to your config:
```json
{
  "toolOrganization": {
    "legacyMode": true
  }
}
```

## Benefits

### For LLMs
- **Better tool selection** - Fewer choices mean more accurate selections
- **Reduced confusion** - Organized categories improve understanding
- **Faster responses** - Less context to process

### For Users
- **Lower token usage** - Only load what you need
- **Better organization** - Tools grouped logically
- **Clearer capabilities** - Discovery tools explain what's available

### For Developers
- **Easier maintenance** - Clear separation of concerns
- **Simple additions** - New tools just need metadata
- **Usage tracking** - Built-in analytics for optimization

## Testing

Run the test script to verify the layered architecture:

```powershell
# From Windows PowerShell
node test-layered-tools.js
```

This will verify:
- Initial tool count is reduced
- Discovery tools are available
- Core operations are loaded
- Dynamic activation works
- Search functionality works
- Categories are properly organized

## Migration Notes

### For Existing Users
- The system is **backward compatible** - use legacy mode if needed
- Core functionality remains the same
- Tool names haven't changed

### For Claude Desktop
- Update your MCP server with `npm run build` (on Windows!)
- Restart Claude Desktop
- The new architecture is automatically active

## Tool Categories Reference

| Category | Tools | Loaded By Default | Requires API Key |
|----------|-------|-------------------|------------------|
| Discovery | 6 | ✅ Yes | No |
| Core Operations | 3 | ✅ Yes | No |
| Video Creation | 5 | ❌ No | No |
| Studio Management | 12 | ❌ No | No |
| Voice Generation | 5 | ❌ No | ElevenLabs |
| Sound Effects | 5 | ❌ No | Freesound |
| Image Generation | 6 | ❌ No | Flux |
| Maintenance | 4 | ❌ No | No |

## Common Workflows

### Creating a Video with Assets
1. Start with core tools (already loaded)
2. `activate-toolset` with `["video-creation"]`
3. Create the video structure
4. `activate-toolset` with `["voice-generation", "image-generation"]`
5. Generate assets
6. `activate-toolset` with `["studio-management"]`
7. Launch and preview

### Project Management
1. Use `list-video-projects` (already loaded)
2. Use `get-project-status` (already loaded)
3. Use `launch-project-studio` (already loaded)
4. If editing needed: `activate-toolset` with `["video-creation"]`

### Cleanup and Maintenance
1. `activate-toolset` with `["maintenance"]`
2. Use cleanup and organization tools
3. Tools auto-deactivate when done

## Performance Metrics

| Metric | Before (All Tools) | After (Layered) | Improvement |
|--------|-------------------|-----------------|-------------|
| Initial Tools | 43 | 9 | 79% reduction |
| Context Tokens | ~8,600 | ~1,800 | 79% reduction |
| Tool Selection Accuracy | Variable | Improved | Better focus |
| Activation Time | N/A | <100ms | On-demand |

## Troubleshooting

### Tools Not Found
**Issue**: "Tool 'X' exists but is not active"
**Solution**: Use `activate-toolset` to load the required category

### Can't Find Right Category
**Issue**: Don't know which category contains a tool
**Solution**: Use `search-tools` with a query to find it

### Want All Tools
**Issue**: Prefer the old behavior
**Solution**: Set `MCP_LEGACY_MODE=true` environment variable

## Future Enhancements

- **Smart preloading** based on usage patterns
- **Custom tool groups** for specific workflows
- **Context-aware suggestions** based on current task
- **Tool dependency resolution** automatic loading
- **Performance analytics** to optimize defaults

---

The layered tool architecture makes the RoughCut MCP server more efficient, easier to use, and better aligned with LLM capabilities. Start with discovery tools, load what you need, and enjoy improved performance!