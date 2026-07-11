# Ollama Emulator Desktop Ultimate - Brand Assets

This directory contains the SVG source files for the Ollama Emulator Desktop Ultimate branding. These can be used to generate various icon formats needed for the application.

## Files Included

1. `logo.svg` - Full logo with brand mark and wordmark (500x140px)
2. `brand-mark.svg` - Just the brand mark/icon (64x64px viewBox)
3. `favicon.svg` - Simplified version for browser favicon (32x32px viewBox)
4. `brand-mark.ico` - Multi-resolution Windows application icon (16/24/32/48/64/128/256px), generated from `brand-mark.svg`
5. `favicon.ico` - Multi-resolution favicon (16/24/32/48/64/128/256px), generated from `favicon.svg`
6. `Rhasan@dev.png` - 220x229px transparent dev credit badge ("Developed by Rhasan@dev")

## Generated Icons

The `.ico` files were generated with `make_icons.py` (Pillow, manual ICO container with
PNG-embedded images) since no SVG rasterizer (cairo/ImageMagick) is available in this
environment. They are wired into the app via `frontend/public/` and referenced in
`frontend/src/app/layout.tsx`. Rebuild the frontend to copy them into `frontend/out/`.

## Usage Instructions

### For Web/Favicon
- The `favicon.svg` can be used directly as a favicon by referencing it in HTML:
  ```html
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  ```
- For broader browser support, convert to .ico format (see below)

### For Desktop Application Icons
- The `brand-mark.svg` contains the core brand mark suitable for application icons
- This should be exported to various sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256) for Windows .ico format
- For macOS .icns format, similar sizes are needed

## Converting SVG to ICO/ICNS

### Using ImageMagick (Command Line)
```bash
# Convert to multi-resolution Windows ICO
convert brand-mark.svg -define icon:auto-resize=16,32,48,64,128,256 favicon.ico

# Or create individual sizes and combine
convert -background none -resize 16x16 brand-mark.svg icon-16.png
convert -background none -resize 32x32 brand-mark.svg icon-32.png
convert -background none -resize 48x48 brand-mark.svg icon-48.png
convert -background none -resize 64x64 brand-mark.svg icon-64.png
convert -background none -resize 128x128 brand-mark.svg icon-128.png
convert -background none -resize 256x256 brand-mark.svg icon-256.png
convert icon-16.png icon-32.png icon-48.png icon-64.png icon-128.png icon-256.png favicon.ico
```

### Using Online Converters
- https://convertico.com/
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

### For macOS .icns
```bash
# Using iconutil (macOS)
mkdir icon.iconset
# Copy resized PNGs to icon.iconset with proper naming
iconutil -c icns icon.iconset
```

## Recommended Sizes for Application Icons

**Windows (.ico):**
- 16x16, 32x32, 48x48, 64x64, 128x128, 256x256 pixels

**macOS (.icns):**
- 16x16, 32x32, 64x64, 128x128, 256x256, 512x512 pixels (@2x variants for retina)

**Linux (.png):**
- Typically 24x24, 32x32, 48x48, 64x64, 128x128, 256x256 pixels

## Color Specifications

The brand assets are **fully transparent** (no background fill) so they blend with
both light and dark UI surfaces. The SVGs also adapt text color to the OS theme via
`prefers-color-scheme` (dark text on light backgrounds, gradient/light on dark).

Brand colors:
- **Cyan Gradient**: #00f0ff → #00bcd4
- **Purple Gradient**: #8b5cf6 → #6366f1
- **Background**: none (transparent)
- **Wordmark**: theme-aware — `#0b1220` in light mode, cyan→purple gradient in dark mode

## Implementation in the Application

The application already includes:
- Automatic provider seeding on first run
- Free model detection and routing
- CLI agent compatibility (Claude Code, OpenCode, Cursor, Continue.dev)
- Local-only operation for privacy and security

To use with Claude Code CLI for free AI assistance:
1. Get a free API key from OpenRouter.ai
2. Set environment variable: `set OLLAMA_EMU_API_KEY=sk-or-v1-your-key-here`
3. Run: `python ollama_emu_desktop.py`
4. Configure Claude Code:
   ```bash
   set ANTHROPIC_BASE_URL=http://localhost:11434
   set ANTHROPIC_API_KEY=sk-local
   ANTHROPIC_MODEL=tencent/hy3:free claude
   ```

All processing happens locally - no data leaves your machine.