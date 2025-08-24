# MCP Video Editing Demonstration

## ✅ Path Resolution Fixed!

The MCP server can now find all 31 existing projects. The issue was using relative paths (`'./assets'`) instead of absolute paths (`join(__dirname, 'assets')`).

## 🎬 How Claude Desktop Should Edit Videos

### Step 1: List Available Projects
Claude Desktop should call the `list-video-projects` tool to see all available projects:

```
Tool: list-video-projects
Result: 31 projects found including:
- cinematic-fresh-1755884520 (currently running on port 7501)
- endlessblink-cinematic-showcase
- GitHub Profile Animation
- etc...
```

### Step 2: Select and Analyze a Project
Claude Desktop should select a project and analyze its structure:

```
Tool: analyze-video-structure
Input: { "projectName": "cinematic-fresh-1755884520" }
Result: Animation structure with text elements, animations, timings
```

### Step 3: Make Edits Using MCP Tools
Claude Desktop can now edit the video using these tools:

#### Example: Center All Elements
```
Tool: edit-video-element
Input: {
  "projectName": "cinematic-fresh-1755884520",
  "elementId": "title",
  "changes": {
    "style": {
      "left": "50%",
      "transform": "translateX(-50%)"
    }
  }
}
```

#### Example: Change Text Color
```
Tool: edit-video-element
Input: {
  "projectName": "cinematic-fresh-1755884520",
  "elementId": "title",
  "changes": {
    "style": {
      "color": "#00FF00"
    }
  }
}
```

#### Example: Adjust Timing
```
Tool: adjust-video-timing
Input: {
  "projectName": "cinematic-fresh-1755884520",
  "elementId": "title",
  "newTiming": {
    "from": 30,
    "durationInFrames": 90
  }
}
```

### Step 4: Kill Current Studio and Relaunch
After making edits, Claude Desktop should:

1. Kill the current studio port:
```
Tool: kill-remotion-studio
Input: { "port": 7501 }
```

2. Launch with a new port to avoid cache:
```
Tool: launch-remotion-studio
Input: { 
  "projectName": "cinematic-fresh-1755884520",
  "port": 7502  // New port to avoid cache
}
```

### Step 5: Render Final Video
Once satisfied with edits:
```
Tool: render-remotion-video
Input: {
  "projectName": "cinematic-fresh-1755884520",
  "compositionId": "VideoComposition",
  "outputPath": "out/edited-video.mp4"
}
```

## 🚀 Complete Example Workflow

Here's what Claude Desktop should do when asked to "center all elements in the cinematic video":

1. **List projects** → Find "cinematic-fresh-1755884520"
2. **Analyze structure** → Identify all text elements
3. **Edit each element** → Apply centering styles
4. **Kill current studio** → Stop port 7501
5. **Launch new studio** → Start on port 7502
6. **Verify changes** → User sees centered elements
7. **Render if requested** → Create final MP4

## ⚠️ Important Notes

- **NEVER edit files directly** - Always use MCP tools
- **Always use new ports** when relaunching to avoid cache (7500-7599 range)
- **Projects must exist** in assets/projects/ directory
- **All edits are AST-based** - Preserves code structure