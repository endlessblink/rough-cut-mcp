# Rough Cut MCP

A comprehensive Model Context Protocol (MCP) server that integrates Remotion video creation with AI-powered services for complete video production workflows.

## Features

🎬 **Complete Video Production Pipeline**
- **Remotion**: Programmatic video creation and rendering
- **ElevenLabs**: AI voice generation for narration
- **Freesound**: Sound effects search and download
- **Flux (Black Forest Labs)**: AI image generation

🛠 **Modular Architecture**
- Service-based design for easy testing and maintenance
- Comprehensive error handling and retry mechanisms
- Asset lifecycle management with automatic cleanup
- TypeScript with strict type checking

📊 **Asset Management**
- Automatic directory organization
- Disk usage monitoring
- Old asset cleanup
- File type validation

## Installation

### Prerequisites
- Node.js 18+ 
- API keys for the services you want to use:
  - ElevenLabs (for voice generation)
  - Freesound (for sound effects)
  - Flux/Black Forest Labs (for image generation)

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd remotion-creative-mcp
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start the MCP server:**
   ```bash
   npm start
   ```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Asset Storage
REMOTION_ASSETS_DIR=./assets

# API Keys (optional - tools will be disabled if not provided)
ELEVENLABS_API_KEY=your-elevenlabs-api-key
FREESOUND_API_KEY=your-freesound-api-key
FLUX_API_KEY=your-flux-api-key

# Optional Configuration
REMOTION_CONCURRENCY=1
REMOTION_TIMEOUT=30000
CLEANUP_TEMP_FILES=true
MAX_ASSET_AGE_HOURS=24
LOG_LEVEL=info
```

## Available Tools

### Video Creation Tools

**`create-complete-video`** - Create a full video with AI-generated assets
- Combines voice narration, sound effects, and images
- Automatic asset generation and video composition
- Customizable duration, style, and dimensions

**`create-text-video`** - Create simple text-only videos
- Quick video generation with text overlay
- Customizable styling and duration

**`generate-video-assets`** - Generate individual assets for video projects
- Voice tracks, images, and sound effects
- Parallel generation for efficiency

**`estimate-render-time`** - Get rendering time estimates
- Based on duration, complexity, and asset count

### Voice Generation Tools (ElevenLabs)

**`generate-voice`** - Convert text to speech
**`list-voices`** - Get available voice options
**`get-voice-details`** - Voice information and settings
**`test-voice-generation`** - Test voice with sample text
**`batch-generate-voice`** - Multiple voice clips at once

### Sound Effects Tools (Freesound)

**`search-sound-effects`** - Search and optionally download SFX
**`download-sound-effects`** - Download specific sound effects
**`get-sound-details`** - Detailed sound information
**`search-popular-sounds`** - Get popular sounds by category
**`advanced-sound-search`** - Search with detailed filters

### Image Generation Tools (Flux)

**`generate-image`** - Create images from text prompts
**`generate-image-variations`** - Multiple variations of an image
**`generate-styled-image`** - Images with specific artistic styles
**`batch-generate-images`** - Multiple images from different prompts
**`optimize-image-prompt`** - Improve prompts for better results
**`get-flux-models`** - Available models and capabilities

### Asset Management Tools

**`get-asset-statistics`** - Comprehensive asset statistics
**`cleanup-old-assets`** - Remove old files based on age
**`organize-assets`** - Sort assets into proper directories
**`get-disk-usage`** - Storage usage information

## Usage Examples

### MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "remotion-creative-mcp": {
      "command": "node",
      "args": ["/path/to/remotion-creative-mcp/build/index.js"]
    }
  }
}
```

### Example Tool Calls

**Create a complete video:**
```json
{
  "tool": "create-complete-video",
  "arguments": {
    "animationDesc": "A serene morning landscape with gentle transitions",
    "narration": "Welcome to this peaceful morning scene where nature awakens with the first light of dawn.",
    "sfxDesc": ["gentle breeze", "bird sounds"],
    "imageDesc": ["sunrise over mountains", "misty forest clearing"],
    "duration": 30,
    "style": "cinematic"
  }
}
```

**Generate voice narration:**
```json
{
  "tool": "generate-voice",
  "arguments": {
    "text": "This is a sample narration for your video project.",
    "voiceId": "Adam",
    "modelId": "eleven_multilingual_v2"
  }
}
```

**Search for sound effects:**
```json
{
  "tool": "search-sound-effects",
  "arguments": {
    "query": "ocean waves",
    "duration": "[5 TO 20]",
    "maxResults": 3,
    "downloadResults": true
  }
}
```

**Generate styled images:**
```json
{
  "tool": "generate-styled-image",
  "arguments": {
    "prompt": "A majestic mountain landscape at sunset",
    "style": "cinematic",
    "width": 1920,
    "height": 1080
  }
}
```

## Architecture

### Service Layer
- **ElevenLabsService**: Voice generation with retry logic
- **FreesoundService**: Sound search/download with licensing
- **FluxService**: Image generation with optimization
- **RemotionService**: Video rendering orchestration
- **FileManagerService**: Asset lifecycle management

### Data Flow
```
MCP Tool Request → Service Layer → External APIs → Asset Management → Remotion Render
```

### Asset Organization
```
assets/
├── temp/           # Temporary processing files
├── videos/         # Final rendered videos
├── audio/          # Voice and sound effect files
└── images/         # Generated visual assets
```

## Development

### Commands
```bash
npm run build       # Compile TypeScript
npm run dev         # Watch mode for development
npm run clean       # Remove build artifacts
npm start           # Start the MCP server
```

### Project Structure
```
src/
├── index.ts        # Main server entry point
├── types/          # TypeScript type definitions
├── services/       # Core service implementations
├── tools/          # MCP tool handlers
├── utils/          # Utilities (config, validation, logging)
└── templates/      # Remotion composition templates
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the documentation in `Docs/Remotion Documentation/`
- Review the comprehensive type definitions
- Check logs for detailed error information
- Ensure all required API keys are configured