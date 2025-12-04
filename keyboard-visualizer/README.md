# Detun Keyboard 3D Visualizer

A beautiful 3D web-based visualizer for your Detun 60-key split keyboard layout.

## Features

- **3D Visualization**: See your keyboard layout in an interactive 3D space
- **Split Layout**: Left and right keyboards positioned separately (30 keys each)
- **Color-Coded Keys**: Different colors for letters, numbers, modifiers, special characters, and navigation keys
- **Interactive Controls**: Rotate, pan, and zoom to explore your keyboard from any angle
- **Real-time Labels**: Each key displays its function from your ZMK keymap
- **Smooth Animations**: Gentle floating animation for visual appeal

## How to Use

### Opening the Visualizer

1. Navigate to the `keyboard-visualizer` directory
2. Open `index.html` in your web browser (Chrome, Firefox, Safari, or Edge)
3. The 3D keyboard will load automatically

### Controls

- **🖱️ Left Click + Drag**: Rotate the view around the keyboards
- **🖱️ Right Click + Drag**: Pan the view left/right/up/down
- **🖱️ Scroll Wheel**: Zoom in and out
- **Double Click**: Reset view (browser default)

## Color Legend

- **🟢 Green**: Letter keys (A-Z)
- **🔵 Blue**: Number keys (0-9)
- **🟠 Orange**: Modifier keys (Ctrl, Shift, Alt, GUI, Tab, Caps, Esc)
- **🟣 Purple**: Special characters (;, ', -, =, [, ], \, etc.)
- **🔴 Red**: Navigation keys (Space, Enter, Backspace)

## Layout

The visualizer displays your current QWERTY layout:

### Left Keyboard (30 keys)
```
Row 1: ESC  1  2  3  4  5
Row 2: TAB  Q  W  E  R  T
Row 3: CAPS A  S  D  F  G
Row 4: SHFT Z  X  C  V  B
Row 5: CTRL GUI ALT - = SPC
```

### Right Keyboard (30 keys)
```
Row 1: 6  7  8  9  0  BSPC
Row 2: Y  U  I  O  P  \
Row 3: H  J  K  L  ;  '
Row 4: N  M  ,  .  /  SHFT
Row 5: ENT [ ] ALT GUI CTRL
```

## Customization

To update the visualizer with a different keymap:

1. Open `index.html` in a text editor
2. Find the `keymap` array (around line 134)
3. Modify the key labels to match your layout
4. Save and refresh your browser

Example:
```javascript
const keymap = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BSPC'],
    // ... modify as needed
];
```

## Technical Details

- **Built with**: Three.js (3D rendering library)
- **No build step required**: Pure HTML/CSS/JavaScript
- **Dependencies**: Loaded via CDN (requires internet connection)
- **Browser compatibility**: Modern browsers with WebGL support

## Troubleshooting

### The visualizer doesn't load
- Make sure you have an internet connection (Three.js is loaded from CDN)
- Try a different browser
- Check the browser console for errors (F12)

### Keys appear too small/large
- Use the scroll wheel to zoom in or out
- Adjust the `keyWidth`, `keyHeight`, and `keyDepth` values in the code

### Labels are hard to read
- Zoom in closer to the keyboards
- Modify the `fontSize` variable in the text label creation section

## Future Enhancements

Potential features to add:
- Layer switching visualization
- Custom color themes
- Export keyboard layout image
- VR/AR support
- Key animation on "press"
- Load keymap from ZMK .keymap file directly

## License

This visualizer is part of your ZMK keyboard configuration. Feel free to modify and share!

---

**Enjoy exploring your keyboard layout in 3D!** 🎹✨