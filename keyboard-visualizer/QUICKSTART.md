# Quick Start Guide

Get the keyboard visualizer running in under 5 minutes!

## 🚀 Launch the Visualizer

### Option 1: Use the Launcher Script (Easiest!)

**Mac/Linux:**
```bash
cd keyboard-visualizer
./start.sh
```

**Or use Python directly:**
```bash
cd keyboard-visualizer
python3 start-server.py
```

The script will:
- ✅ Find an available port automatically
- 🌐 Open your browser to the visualizer
- 🎹 Start serving the app

**Note**: ES6 modules require a web server (not `file://` protocol).

### Option 2: Manual Server Start
```bash
# Navigate to the directory
cd keyboard-visualizer

# Start a simple HTTP server (choose one):

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

Then open: **http://localhost:8000**

---

## 🎮 Basic Controls

| Action | Control |
|--------|---------|
| **Rotate View** | Left Click + Drag |
| **Pan View** | Right Click + Drag |
| **Zoom** | Mouse Scroll |
| **See Combinations** | Click on CTRL, SHIFT, ALT, or GUI keys |
| **Close Panel** | ESC key or × button |

---

## ✨ Try This First

1. **Click on the orange "CTRL" key** (bottom-left or bottom-right)
   - Watch keys highlight in yellow
   - See the combinations panel appear on the right
   - Read about Ctrl+C, Ctrl+V, and other shortcuts

2. **Click on the "SHFT" key** (left or right side, row 4)
   - See all letter keys turn green
   - Learn what symbols each key produces with Shift

3. **Click on "GUI" key** (bottom row, second from left/right)
   - Discover system-level shortcuts
   - Window management and app launcher combos

4. **Close the panel** by pressing ESC or clicking the × button

---

## 📁 File Structure

```
keyboard-visualizer/
├── index.html          ← Open this file!
├── styles.css          ← Visual styles
├── app.js              ← Main application
├── scene.js            ← 3D scene setup
├── keyboard.js         ← Keyboard builder
├── interactions.js     ← Click handling
├── keymap-data.js      ← Your keymap & combinations
├── utils.js            ← Helper functions
├── README.md           ← Full documentation
├── DEVELOPER.md        ← Developer guide
└── QUICKSTART.md       ← This file
```

---

## 🎨 What You'll See

- **Left Keyboard**: 6 columns × 5 rows = 30 keys
- **Right Keyboard**: 6 columns × 5 rows = 30 keys
- **Total**: 60 keys in QWERTY layout

**Color Coding**:
- 🟢 **Green** = Letters (A-Z)
- 🔵 **Blue** = Numbers (0-9)
- 🟠 **Orange** = Modifiers (Ctrl, Shift, Alt, GUI) ← Click these!
- 🟣 **Purple** = Special characters
- 🔴 **Red** = Navigation (Space, Enter, Backspace)

---

## 🔧 Quick Customization

### Change Key Layout
Edit `keymap-data.js`:
```javascript
export const keymap = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BSPC'],
    // Change any key label here
];
```

### Add New Shortcut
Edit `keymap-data.js`:
```javascript
export const keyCombinations = {
    'CTRL': [
        { key: 'Z', description: 'Undo last action' },
        { key: 'YOUR_KEY', description: 'Your custom shortcut' }, // Add this
    ]
};
```

### Adjust Keyboard Spacing
Edit `keyboard.js`:
```javascript
export const KEYBOARD_CONFIG = {
    leftOffset: -12,   // Move left keyboard
    rightOffset: 6,    // Move right keyboard
};
```

---

## ❓ Troubleshooting

### Blank Screen
- **Use the launcher script** (`./start.sh` or `python3 start-server.py`)
- **Don't open `index.html` directly** (CORS/module issues)
- **Check browser console** (F12) for errors
- **Ensure internet connection** (Three.js loads from CDN)

### Clicks Don't Work
- **Click on orange modifier keys** (Ctrl, Shift, Alt, GUI)
- **Other keys don't show combinations** (by design)
- **Check console for JavaScript errors**

### Poor Performance
- **Close other browser tabs** to free up memory
- **Try a different browser** (Chrome/Edge recommended)
- **Check GPU acceleration** is enabled in browser settings

---

## 📚 Learn More

- **README.md** - Full feature documentation
- **DEVELOPER.md** - Architecture and development guide
- **[ZMK Firmware](https://zmk.dev/)** - Keyboard firmware docs
- **[Three.js](https://threejs.org/)** - 3D library docs

---

## 💡 Tips

1. **Zoom in close** to see key labels clearly
2. **Try all 4 modifiers** to see different shortcuts
3. **Hover over modifier keys** to see them glow
4. **Use right-click drag** to reposition the view
5. **Press ESC** to quickly close the combinations panel

---

## 🎯 Next Steps

1. ✅ Launch with `./start.sh` or `python3 start-server.py`
2. ✅ Try clicking modifier keys
3. ✅ Explore different combinations
4. 📝 Customize your keymap in `keymap-data.js`
5. 🎨 Adjust colors in `utils.js`
6. 🚀 Add new features using `DEVELOPER.md` as a guide

---

**Enjoy your keyboard visualizer!** 🎹✨

If you encounter any issues, check the console (F12) for error messages and refer to the troubleshooting sections in README.md.