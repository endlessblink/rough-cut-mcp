# 🚀 Quick Setup for Claude Desktop

## One-Line Installation (Recommended)

Run this single command in your terminal where you want to install the server:

```bash
npx https://github.com/yourusername/remotion-creative-mcp install-to-claude
```

Or if you've cloned the project:

```bash
cd RoughCut
npm run install-to-claude
```

This will:
✅ Install dependencies  
✅ Build the project  
✅ Configure Claude Desktop automatically  
✅ Set up Remotion Studio integration  

## Manual Installation

1. **Clone and build:**
   ```bash
   git clone <repository>
   cd RoughCut
   npm install
   npm run build
   ```

2. **Add to Claude Desktop config:**
   
   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Linux:** `~/.config/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "remotion-creative": {
         "command": "node",
         "args": ["/path/to/RoughCut/build/index.js"],
         "env": {
           "REMOTION_ASSETS_DIR": "/path/to/RoughCut/assets"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## 🎬 What You Can Do Now

### Without API Keys (Remotion Only)
- ✅ **Create text videos**: "Create a 5-second video saying Welcome"
- ✅ **Launch Remotion Studio**: "Launch Remotion Studio dashboard"
- ✅ **Create projects**: "Create a new Remotion project called my-video"
- ✅ **Open videos**: "Open my last video in the browser"
- ✅ **Manage assets**: "Get asset statistics"
- ✅ **Estimate rendering**: "How long to render a 60-second video?"

### With API Keys (Full Features)
Add to your Claude config env section:
```json
"ELEVENLABS_API_KEY": "your-key",
"FREESOUND_API_KEY": "your-key", 
"FLUX_API_KEY": "your-key"
```

Then you can also:
- 🎤 **AI Voice**: "Generate voice narration saying [text]"
- 🔊 **Sound Effects**: "Search for ocean wave sound effects"
- 🖼️ **AI Images**: "Generate an image of a sunset over mountains"
- 🎥 **Complete Videos**: "Create a complete video about nature with narration"

## 🛠️ Available Tools (14 Total)

### Core Video Tools
1. `create-text-video` - Simple text animations
2. `create-complete-video` - Full videos with AI assets
3. `generate-video-assets` - Generate individual assets
4. `estimate-render-time` - Calculate rendering time

### Remotion Studio Tools (NEW!)
5. `launch-remotion-studio` - Open visual editor
6. `stop-remotion-studio` - Close the editor
7. `open-video-in-studio` - Edit existing videos
8. `create-remotion-project` - New projects from templates
9. `get-studio-status` - Check if Studio is running
10. `open-in-browser` - View videos in browser

### Asset Management
11. `get-asset-statistics` - Storage analytics
12. `cleanup-old-assets` - Free up space
13. `organize-assets` - Sort files
14. `get-disk-usage` - Check storage

## 💬 Example Commands in Claude

**Basic:**
- "Create a 10-second welcome video with blue background"
- "Launch Remotion Studio"
- "Open my last video in the browser"

**With Studio:**
- "Create a new Remotion project and open it in Studio"
- "Launch Studio and open my video for editing"
- "Check if Remotion Studio is running"

**Advanced (with API keys):**
- "Create a 30-second video about space with AI narration and images"
- "Generate a cinematic voice saying 'Welcome to the future'"
- "Find and download thunder sound effects"

## 🎯 Quick Test

After installation, try this in Claude Desktop:
> "Create a 5-second video that says 'Hello from Claude!' with a purple background"

Claude will:
1. Create the video programmatically
2. Save it to the assets folder
3. Tell you the file path
4. Optionally launch Remotion Studio for editing

## 📚 Resources

- **Remotion Docs**: https://www.remotion.dev/docs
- **Get API Keys**:
  - ElevenLabs: https://elevenlabs.io/
  - Freesound: https://freesound.org/apiv2/apply/
  - Flux: https://blackforestlabs.ai/

## 🆘 Troubleshooting

**"Tool not found" error:**
- Restart Claude Desktop after installation

**"Cannot find module" error:**
- Run `npm install` in the project directory
- Run `npm run build` to compile TypeScript

**Studio won't launch:**
- Make sure Node.js 18+ is installed
- Check if port 3000 is available
- Try `npm install -g @remotion/cli`

**Videos don't render:**
- Text videos work without additional setup
- Full rendering requires ffmpeg installed
- Check Remotion docs for render requirements

---

Enjoy creating videos with Claude! 🎬✨