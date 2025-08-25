# Changelog

## [1.1.0] - 2025-08-21

### Fixed
- **Critical**: Fixed Claude Desktop not generating Remotion animation code
  - Added `compositionCode` field to `VideoCreationRequest` type
  - Updated `RemotionService` to pass compositionCode to template generator
  - Made `compositionCode` a required parameter in tool schema
  - Added explicit code generation instructions in tool description
  - Added concrete Remotion code examples (bouncing ball, rotating square)
  - Enhanced error messages when code is missing
  - Added comprehensive debug logging throughout the pipeline

### Changed
- Tool description now explicitly instructs Claude to generate complete Remotion React components
- Validation now checks for missing compositionCode and returns helpful error messages
- Fallback template now shows clear error with instructions instead of generic text

### Added
- Test script: `scripts/test-composition-generation.js`
- Documentation: `docs/COMPOSITION-CODE-FIX.md`
- Debug logging for troubleshooting code generation pipeline

### Technical Details
- Files modified: 
  - `src/types/index.ts` - Added compositionCode to interface
  - `src/services/remotion.ts` - Pass compositionCode to generator
  - `src/tools/video-creation.ts` - Updated tool description and validation
  - `src/templates/simple-compositions.ts` - Enhanced error handling
  - `src/utils/validation.ts` - Added compositionCode to schema
  - `src/index.ts` - Added platform logging for debugging

## [1.0.0] - Initial Release
- Template-based animation system
- Support for voice, sound effects, and image generation
- Remotion Studio integration