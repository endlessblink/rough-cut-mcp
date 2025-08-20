# Installing Remotion Creative MCP Server in Claude Desktop

## Quick Install Guide

### 1. Prerequisites
- Node.js 18+ installed on your system
- Claude Desktop app

### 2. Installation Steps

1. **Clone or download this project** to your local machine

2. **Install dependencies:**
   ```bash
   cd /path/to/RoughCut
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Configure Claude Desktop:**
   
   Open your Claude Desktop configuration file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

5. **Add the MCP server configuration:**

   ```json
   {
     "mcpServers": {
       "remotion-creative": {
         "command": "node",
         "args": ["/full/path/to/RoughCut/build/index.js"],
         "env": {
           "REMOTION_ASSETS_DIR": "/full/path/to/RoughCut/assets"
         }
       }
     }
   }
   ```

   **Important**: Replace `/full/path/to/RoughCut` with the actual path to your project.

   Example for Windows:
   ```json
   {
     "mcpServers": {
       "remotion-creative": {
         "command": "node",
         "args": ["D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\build\\index.js"],
         "env": {
           "REMOTION_ASSETS_DIR": "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\assets"
         }
       }
     }
   }
   ```

6. **Restart Claude Desktop** for the changes to take effect

### 3. Optional: Add API Keys

If you want to use AI features, add your API keys to the environment:

```json
{
  "mcpServers": {
    "remotion-creative": {
      "command": "node",
      "args": ["/path/to/RoughCut/build/index.js"],
      "env": {
        "REMOTION_ASSETS_DIR": "/path/to/RoughCut/assets",
        "ELEVENLABS_API_KEY": "your-key-here",
        "FREESOUND_API_KEY": "your-key-here",
        "FLUX_API_KEY": "your-key-here"
      }
    }
  }
}
```

## 🎬 About the Remotion Dashboard

### What This MCP Server Provides:
- **Programmatic video creation** through Claude's chat interface
- **Text-to-video generation** without leaving Claude
- **Asset management** tools
- **Render time estimation**

### What This DOESN'T Provide:
- ❌ **Remotion Studio/Dashboard UI** - This is a separate tool
- ❌ **Visual preview** in Claude - Videos are created as files
- ❌ **Live editing** - This is for programmatic generation

### To Get the Remotion Dashboard/Studio:

The Remotion Dashboard (Remotion Studio) is a **separate tool** that provides a visual interface for creating and editing videos. To use it:

1. **Install Remotion Studio globally:**
   ```bash
   npm install --global @remotion/cli
   ```

2. **Create a Remotion project:**
   ```bash
   npx create-video --template hello-world my-video
   cd my-video
   ```

3. **Start Remotion Studio:**
   ```bash
   npm start
   ```
   This opens the visual dashboard at `http://localhost:3000`

### How They Work Together:

```
Claude Desktop + MCP Server          Remotion Studio
         ↓                                 ↓
  Programmatic Creation            Visual Editing
  Text Commands                    GUI Dashboard
  Batch Processing                 Live Preview
  AI Integration                   Manual Design
         ↓                                 ↓
         └──────── Both create .mp4 files ────────┘
```

## 🚀 Using in Claude Desktop

Once installed, you can use commands like:

**You**: "Create a 5-second welcome video with blue background and white text saying 'Hello World'"

**Claude** will use the MCP server to:
1. Generate the video programmatically
2. Save it to your assets folder
3. Tell you the file path

**You**: "Estimate how long it would take to render a 60-second video"

**Claude** will calculate and return the estimate.

## 💡 Pro Tips

1. **For Remotion-only use** (no API keys needed):
   - Create text videos
   - Use your own images/audio in assets folders
   - Generate data-driven videos

2. **For the visual Remotion experience**:
   - Install Remotion Studio separately
   - Use it alongside this MCP server
   - Studio for design, MCP for automation

3. **Best of both worlds**:
   - Design templates in Remotion Studio
   - Automate generation through Claude Desktop
   - Use MCP for batch processing

## 📚 Resources

- **Remotion Docs**: https://www.remotion.dev/docs
- **Remotion Studio**: https://www.remotion.dev/docs/studio
- **MCP Protocol**: https://modelcontextprotocol.io
- **Claude Desktop**: https://claude.ai/download

## ❓ FAQ

**Q: Can I see video previews in Claude Desktop?**
A: No, videos are saved as files. Open them with your video player.

**Q: Do I need Remotion Studio installed?**
A: No, the MCP server works independently. Studio is optional for visual editing.

**Q: Can I use custom Remotion compositions?**
A: Yes! Add them to `src/templates/` and rebuild the project.

**Q: Where are videos saved?**
A: In the `assets/videos/` directory of your project.