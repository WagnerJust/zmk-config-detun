# Detun Keyboard 3D Visualizer

A beautiful, interactive 3D web-based visualizer for your Detun 60-key split keyboard layout.

## ✨ Features

- **3D Visualization**: See your keyboard layout in an interactive 3D space
- **Split Layout**: Left and right keyboards positioned separately (30 keys each)
- **Color-Coded Keys**: Different colors for letters, numbers, modifiers, special characters, and navigation keys
- **Interactive Combinations**: Click on modifier keys (Ctrl, Shift, Alt, GUI) to see available key combinations
- **Real-time Feedback**: Keys highlight and dim based on available combinations
- **Interactive Controls**: Rotate, pan, and zoom to explore your keyboard from any angle
- **Hover Effects**: Modifier keys glow when you hover over them
- **Smooth Animations**: Gentle floating animation for visual appeal
- **Modular Architecture**: Clean, maintainable code split into logical modules

## 📁 Project Structure

```
keyboard-visualizer/
├── index.html           # Main HTML file (entry point)
├── styles.css          # All CSS styles and animations
├── app.js              # Main application orchestrator
├── scene.js            # Three.js scene, camera, and lighting setup
├── keyboard.js         # Keyboard building and manipulation
├── interactions.js     # Click handling and key combinations
├── keymap-data.js      # Keymap configuration and combinations data
├── utils.js            # Utility helper functions
└── README.md           # This file
```

## 🚀 Getting Started

### Opening the Visualizer

**Important**: Don't open `index.html` directly! ES6 modules require a web server.

**Mac/Linux - Use the launcher (easiest):**
```bash
cd keyboard-visualizer
./start.sh
```

**Or use Python:**
```bash
cd keyboard-visualizer
python3 start-server.py
```

**Manual server start:**
```bash
cd keyboard-visualizer

# Python 3
python3 -m http.server 8000

# Then open: http://localhost:8000
```

The launcher scripts will:
- ✅ Find an available port automatically
- 🌐 Open your browser to the visualizer
- 🎹 Start serving the app

**Note**: You need an internet connection for the first load as Three.js is loaded from CDN.

### Controls

- **🖱️ Left Click + Drag**: Rotate the view around the keyboards
- **🖱️ Right Click + Drag**: Pan the view left/right/up/down
- **🖱️ Scroll Wheel**: Zoom in and out
- **🖱️ Click Modifier Key**: Show available key combinations
- **ESC Key**: Close combinations panel
- **×  Button**: Close combinations panel

## 🎮 Interactive Features

### Key Combinations

Click on any modifier key to see what combinations are available:

- **CTRL**: Shows all Ctrl shortcuts (Copy, Paste, Save, etc.)
- **SHFT**: Shows shift combinations (capital letters, symbols)
- **GUI**: Shows system shortcuts (window management, app launcher)
- **ALT**: Shows alt shortcuts (menu navigation, window switching)

When a modifier is selected:
- The selected modifier glows bright white
- Keys with available combinations are highlighted in yellow or their respective colors
- Keys without combinations are dimmed
- A panel appears on the right showing all combinations with descriptions

### Visual Feedback

- **Hover**: Modifier keys glow slightly when you hover over them
- **Selection**: Selected modifier scales up and glows brightly
- **Highlighting**: Available keys emit light to show they're interactive
- **Dimming**: Unavailable keys become semi-transparent

## 🎨 Color Legend

- **🟢 Green**: Letter keys (A-Z)
- **🔵 Blue**: Number keys (0-9)
- **🟠 Orange**: Modifier keys (Ctrl, Shift, Alt, GUI, Tab, Caps, Esc)
- **🟣 Purple**: Special characters (;, ', -, =, [, ], \, etc.)
- **🔴 Red**: Navigation keys (Space, Enter, Backspace)

## 📐 Layout

The visualizer displays your current QWERTY layout:

### Left Keyboard (30 keys)
```
Row 1: ESC   1   2   3   4   5
Row 2: TAB   Q   W   E   R   T
Row 3: CAPS  A   S   D   F   G
Row 4: SHFT  Z   X   C   V   B
Row 5: CTRL GUI ALT  -   =  SPC
```

### Right Keyboard (30 keys)
```
Row 1:  6   7   8   9   0  BSPC
Row 2:  Y   U   I   O   P   \
Row 3:  H   J   K   L   ;   '
Row 4:  N   M   ,   .   /  SHFT
Row 5: ENT  [   ]  ALT GUI CTRL
```

## 🔧 Customization

### Modifying the Keymap

Edit `keymap-data.js` to change key labels:

```javascript
export const keymap = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BSPC'],
    // ... modify as needed
];
```

### Adding Key Combinations

Add new combinations in `keymap-data.js`:

```javascript
export const keyCombinations = {
    'CTRL': [
        { key: 'C', description: 'Copy selected text' },
        { key: 'V', description: 'Paste clipboard content' },
        // Add more...
    ],
    // Add more modifiers...
};
```

### Adjusting Keyboard Spacing

Modify spacing in `keyboard.js`:

```javascript
export const KEYBOARD_CONFIG = {
    keyWidth: 2,
    keyHeight: 0.5,
    keyDepth: 2,
    spacing: 0.3,
    leftOffset: -12,   // Adjust left keyboard position
    rightOffset: 6,     // Adjust right keyboard position
    tiltAngle: 0.05
};
```

### Customizing Colors

Change key colors in `utils.js`:

```javascript
export function getKeyColor(keyLabel) {
    // Modify color values (hex)
    if (letters.includes(keyLabel)) {
        return 0x4CAF50; // Change green color
    }
    // ... etc
}
```

## 🏗️ Architecture

### Module Overview

1. **app.js**: Main entry point, orchestrates all modules and manages application lifecycle
2. **scene.js**: Sets up Three.js scene, camera, renderer, controls, and lighting
3. **keyboard.js**: Creates 3D keyboard representations and provides manipulation functions
4. **interactions.js**: Handles mouse events, raycasting, and key combination display
5. **keymap-data.js**: Configuration data for keymap layout and combinations
6. **utils.js**: Reusable utility functions for colors, text rendering, etc.
7. **styles.css**: All visual styling including panels, animations, and UI elements

### Key Classes & Functions

#### keyboard.js
- `createKey()`: Creates a single 3D key with label
- `createKeyboard()`: Creates left or right keyboard group
- `highlightKey()`: Makes a key glow
- `dimKey()`: Makes a key semi-transparent
- `selectKey()`: Selects and emphasizes a key

#### interactions.js
- `setupInteractions()`: Initializes all event listeners
- `handleClick()`: Processes mouse clicks on keys
- `handleMouseMove()`: Handles hover effects
- `selectModifier()`: Shows combinations for a modifier
- `deselectModifier()`: Clears selection and resets keys

#### scene.js
- `initScene()`: Sets up complete Three.js environment
- `createCamera()`: Configures perspective camera
- `createRenderer()`: Initializes WebGL renderer
- `setupLights()`: Adds ambient, directional, and point lights

## 🛠️ Technical Details

- **Built with**: Three.js r128 (3D rendering library)
- **Module System**: ES6 modules for clean, maintainable code
- **No build step required**: Pure HTML/CSS/JavaScript
- **Dependencies**: Loaded via CDN (requires internet connection)
- **Browser compatibility**: Modern browsers with WebGL support (Chrome, Firefox, Safari, Edge)

## 🐛 Troubleshooting

### The visualizer doesn't load
- **Use a web server** - run `./start.sh` or `python3 start-server.py`
- **Don't open index.html directly** - this causes CORS errors with ES6 modules
- Ensure you have an internet connection (Three.js is loaded from CDN)
- Try a different browser
- Check the browser console for errors (F12 or Cmd+Option+I)
- Make sure all JavaScript files are in the same directory

### CORS or Module errors
- Run the app through a web server (use the launcher scripts)
- Don't use `file://` protocol - use `http://localhost`
- The error "CORS policy: Cross origin requests" means you need a server

### Click interactions don't work
- Check that you're clicking on orange modifier keys (Ctrl, Shift, Alt, GUI)
- Ensure JavaScript modules are enabled in your browser
- Look for errors in the browser console

### Keys appear too small/large
- Use the scroll wheel to zoom in or out
- Adjust the `KEYBOARD_CONFIG` values in `keyboard.js`

### Labels are hard to read
- Zoom in closer to the keyboards
- Modify the `createTextTexture()` function in `utils.js`
- Adjust the `fontSize` parameter

### Module import errors
- **Solution**: Use the launcher scripts provided
- `./start.sh` (Mac/Linux) or `python3 start-server.py`
- ES6 modules don't work with `file://` protocol in most browsers

## 🚀 Future Enhancements

Potential features to add:

- [ ] Layer switching visualization (show different keyboard layers)
- [ ] Custom color themes (dark mode, light mode, custom palettes)
- [ ] Export keyboard layout as image
- [ ] Load keymap from ZMK .keymap file directly
- [ ] Animation when "pressing" keys
- [ ] Sound effects for key interactions
- [ ] VR/AR support for immersive viewing
- [ ] Keyboard layout comparison tool
- [ ] Real-time keystroke visualization
- [ ] Save/load custom configurations

## 🤝 Contributing

To add new features:

1. Create a new module file if needed (e.g., `layers.js` for layer support)
2. Import it into `app.js`
3. Add necessary CSS to `styles.css`
4. Update this README with your changes

## 📝 License

This visualizer is part of your ZMK keyboard configuration. Feel free to modify and share!

## 🎯 Tips

- **Launch with the script**: `./start.sh` or `python3 start-server.py`
- Click on **Ctrl** to see common shortcuts you can use with your keyboard
- Try clicking **Shift** to see what symbols each key produces
- The **GUI** key shows system-level shortcuts (⊞ Win key on Windows, ⌘ Cmd on Mac)
- **Alt** combinations show menu and window management shortcuts

---

**Enjoy exploring your keyboard layout in 3D!** 🎹✨

Made with ❤️ for the ZMK keyboard community