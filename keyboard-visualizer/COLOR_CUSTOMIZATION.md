# Per-Key Color Customization

## Overview

The keyboard visualizer now supports **per-key color customization** instead of group-based coloring. You can paint individual keys with any color you want, and your color choices will persist across browser sessions.

## How to Use

### 1. Enter Paint Mode

Click the **"Paint Keys"** button in the legend panel (bottom right) to enter color customization mode.

### 2. Select Keys

- **Single Selection**: Click any key to select it
- **Multi-Selection**: Hold `Shift` and click multiple keys to select them all at once

### 3. Choose a Color

When you select one or more keys, a color picker will appear in the center of the screen showing:
- 8 preset color options to choose from
- The number of currently selected keys
- A Reset button to restore default color

Available colors:
- **Black** (#2c2c2c) - Dark charcoal
- **Cream** (#f5e6d3) - Default key color
- **Sky Blue** (#87ceeb) - Light blue
- **Mint** (#7dd3c0) - Aqua green
- **Yellow** (#f4e57e) - Soft yellow
- **Pink** (#f5a3b5) - Pastel pink
- **Lavender** (#b8a7d9) - Light purple
- **Purple** (#7e6db5) - Deep purple

### 4. Apply the Color

Click any of the 8 color swatches to immediately paint the selected keys with that color. The color is automatically saved to your browser's localStorage.

### 5. Reset Colors

- **Reset Selected Keys**: Click **"Reset"** in the color picker to restore selected keys to the default cream color
- **Reset All Keys**: Click **"Reset All"** at the bottom of the legend panel to clear all custom colors

### 6. Exit Paint Mode

Click **"Exit Paint Mode"** (same button as before) to return to normal interaction mode.

## Features

### Persistent Colors

All color customizations are automatically saved to your browser's localStorage. When you reload the page, your custom colors will be restored.

### Multi-Key Selection

Select multiple keys at once by holding Shift while clicking. This makes it easy to paint groups of keys with the same color.

### Visual Feedback

- Selected keys are highlighted with an orange glow
- The color picker shows how many keys are currently selected
- Buttons provide visual feedback when colors are applied

### Layer Support

Colors are stored per-layer, so you can have different color schemes for different layers of your keyboard.

## Technical Details

### Data Storage

Colors are stored in localStorage with the format:
```json
{
  "layer:row:col": 0xHEXCOLOR
}
```

For example:
```json
{
  "default:0:0": 0xff9800,
  "default:0:1": 0x4caf50
}
```

### Default Color

Keys without custom colors use the default cream color: `#f5e6d3` (0xf5e6d3)

### Color Storage Key

Custom colors are stored in localStorage under the key: `keyColors`

## Removed Features

The previous group-based color system (letters, numbers, modifiers, etc.) has been removed in favor of this more flexible per-key system. The old legend items showing color groups are now replaced with instructions for using the paint mode.

## Tips

1. **Plan Your Color Scheme**: Think about which keys you want to highlight before starting
2. **Use Shift+Click**: Multi-select similar keys (like all number keys) to color them at once
3. **Experiment**: You can always reset colors if you don't like the result
4. **Layer-Specific Colors**: Switch to different layers and color them differently for visual distinction

## Troubleshooting

### Colors Not Persisting

If your colors aren't saving between sessions:
1. Check that your browser allows localStorage
2. Make sure you're not in private/incognito mode
3. Verify that the console shows "💾 Saved custom key colors" when you apply colors

### Can't Select Keys

If clicking keys doesn't select them:
1. Make sure you're in Paint Mode (button should say "Exit Paint Mode")
2. Check that the cursor changes to a pointer when hovering over keys
3. Try clicking directly on the key surface, not the text label

### Color Picker Not Showing

If the color picker doesn't appear after selecting keys:
1. Select at least one key first
2. Check browser console for errors
3. Try refreshing the page

## Available Colors

The visualizer provides 8 carefully selected colors:

1. **Black** - Great for special keys or accents
2. **Cream** - Default color for a clean look
3. **Sky Blue** - Cool and calming
4. **Mint** - Fresh and modern
5. **Yellow** - Bright and attention-grabbing
6. **Pink** - Soft and playful
7. **Lavender** - Gentle purple tone
8. **Purple** - Rich and bold

## Future Enhancements

Possible future additions:
- Copy/paste colors between keys
- Import/export color schemes
- Additional color presets
- Color by key function (auto-color all modifiers, etc.)
</text>
