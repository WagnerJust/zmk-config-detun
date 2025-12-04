# Configuration Sync Documentation

## Overview

The keyboard visualizer now **automatically loads your actual ZMK keyboard configuration** instead of using hardcoded defaults. This ensures the visualizer always matches your real keyboard layout.

## How It Works

### Load Order (Priority)

1. **Primary Source**: `config/boards/shields/detun/detun.keymap` (ZMK config file)
2. **Fallback**: Built-in default keymap (if ZMK config can't be loaded)

### Automatic Parsing

The visualizer automatically:
- ✅ Reads your ZMK `.keymap` file
- ✅ Parses all layers (default, lower, raise, etc.)
- ✅ Converts ZMK keycodes to display labels
- ✅ Handles layer switches, modifiers, and special keys
- ✅ Updates the 3D visualization in real-time

## File Structure

```
zmk-config-detun/
├── config/boards/shields/detun/
│   ├── detun.keymap          ← SOURCE OF TRUTH (ZMK firmware)
│   └── detun.dtsi            ← Matrix configuration
└── keyboard-visualizer/
    ├── zmk-parser.js         ← Parses ZMK config files
    ├── keymap-data.js        ← Loads from ZMK, falls back to defaults
    └── app.js                ← Initializes with ZMK config
```

## ZMK Keycode Mapping

The parser automatically converts ZMK keycodes to display labels:

### Letters & Numbers
- `&kp Q` → `Q`
- `&kp N1` → `1`

### Modifiers
- `&kp LCTRL` → `CTRL`
- `&kp LSHFT` → `SHFT`
- `&kp LGUI` → `GUI`
- `&kp LALT` → `ALT`

### Special Keys
- `&kp SPACE` → `SPC`
- `&kp RET` → `ENT`
- `&kp BSPC` → `BSPC`
- `&kp ESC` → `ESC`

### Layer Switches
- `&mo 1` → `L1` (Momentary layer 1)
- `&lt 2 SPACE` → `LT2` (Layer-tap)
- `&to 3` → `TO3` (Switch to layer 3)

### Bluetooth
- `&bt BT_CLR` → `BT🗑` (Clear)
- `&bt BT_SEL 0` → `BT0` (Select device 0)
- `&bt BT_NXT` → `BT→` (Next device)

### Special Markers
- `&trans` → `▽` (Transparent/pass-through)
- `&none` → `✕` (No operation)

## Color Coding

The visualizer uses colors to indicate key types:

| Color | Type | Keys |
|-------|------|------|
| 🟢 Green | Letters | A-Z |
| 🔵 Blue | Numbers | 0-9 |
| 🟠 Orange | Modifiers | Ctrl, Shift, Alt, GUI |
| 🔴 Red | Navigation | Space, Enter, Backspace, Arrows |
| 🟦 Cyan | Layer Switches | L1, L2, LT0, TO1 |
| 🟣 Purple | Special/Bluetooth | BT, symbols |
| ⬛ Dark Gray | Empty | ✕ (unused keys) |

## Current Configuration

Based on your `detun.keymap`, the visualizer loads:

### Default Layer
```
Row 1: TAB   Q   W   E   R   T     Y   U   I   O   P  BSPC
Row 2: CTRL  A   S   D   F   G     H   J   K   L   ;   '
Row 3: SHFT  Z   X   C   V   B     N   M   ,   .   /  ESC
Row 4:  ✕   ✕  GUI  L1  SPC  ✕     ✕  ENT  L2  ALT  ✕   ✕
```

### Layer 1 (Lower)
```
Numbers, Bluetooth controls, Arrow keys
```

### Layer 2 (Raise)
```
Symbols (!@#$%^&*), Special characters
```

## Verification

To verify the sync is working:

1. **Check Browser Console** (F12):
   ```
   ✅ Loaded keymap from ZMK config
   📋 Active layer: default
   🗂️  Available layers: default, lower, raise
   ```

2. **Successful Load**:
   - Console shows "Using keymap from ZMK configuration"
   - Keys match your actual keyboard layout

3. **Fallback Mode**:
   - Console shows "Using default fallback keymap"
   - Default QWERTY layout is displayed

## Updating Your Layout

### Method 1: Edit ZMK Config (Recommended)

1. Edit `config/boards/shields/detun/detun.keymap`
2. Modify key bindings in the `bindings = < ... >` section
3. Refresh the visualizer in your browser
4. Changes appear automatically!

Example:
```c
// Change TAB to ESC
bindings = <
   &kp ESC   &kp Q &kp W ...  // Changed from &kp TAB
   ...
>;
```

### Method 2: Edit Fallback Defaults

If you want to change the fallback keymap:

1. Edit `keyboard-visualizer/keymap-data.js`
2. Modify the `defaultKeymap` array
3. Refresh browser

## Troubleshooting

### Visualizer shows default layout, not my ZMK config

**Symptoms**: Console shows "Using default fallback keymap"

**Causes & Solutions**:

1. **ZMK file path incorrect**
   - Check that `config/boards/shields/detun/detun.keymap` exists
   - Verify the relative path in `zmk-parser.js` is correct

2. **Browser CORS restrictions**
   - Must use a web server (not `file://` protocol)
   - Run `./start.sh` or `python3 start-server.py`

3. **Parse error in ZMK file**
   - Check browser console for parse errors
   - Ensure `.keymap` file has valid syntax

### Keys show as keycodes instead of labels

**Solution**: Add mapping in `zmk-parser.js`:

```javascript
const ZMK_KEYCODE_MAP = {
    'YOUR_KEY': 'LABEL',
    // Add your custom keycodes here
};
```

### Wrong number of keys displayed

Your ZMK config has either:
- 42 keys (3 rows of 12 + 6 thumbs) ← Current config
- 60 keys (5 rows of 12)

The parser auto-detects and adjusts the layout.

## Advanced: Adding Custom Keycodes

To add support for custom ZMK keycodes:

1. **Edit `zmk-parser.js`**:
```javascript
const ZMK_KEYCODE_MAP = {
    // Add your custom keycodes
    'MY_MACRO': '🔥',
    'CUSTOM_KEY': 'CSTM',
};
```

2. **Edit `utils.js`** for custom colors:
```javascript
export function getKeyColor(keyLabel) {
    if (keyLabel === '🔥') return 0xFF5722; // Orange-red
    // ... rest of function
}
```

## Benefits of Config Sync

✅ **Single Source of Truth**: ZMK config drives both firmware and visualization
✅ **Always Accurate**: Visualizer reflects actual keyboard behavior
✅ **No Duplication**: Don't maintain layouts in two places
✅ **Easy Testing**: Try layouts visually before flashing firmware
✅ **Documentation**: Visualizer serves as interactive documentation

## File Responsibilities

| File | Purpose | Edit When... |
|------|---------|--------------|
| `detun.keymap` | **Keyboard firmware config** | Changing actual keyboard |
| `zmk-parser.js` | Converts ZMK → visualizer | Adding new keycode types |
| `keymap-data.js` | Loads config + fallback | Changing fallback layout |
| `utils.js` | Key colors & classification | Changing colors/types |

## Future Enhancements

Potential improvements:
- [ ] Live reload when `.keymap` file changes
- [ ] Layer switching in visualizer
- [ ] Export keymap as image
- [ ] Highlight keys used on each layer
- [ ] Compare layers side-by-side
- [ ] Validate ZMK syntax

## Summary

**Before**: Hardcoded keymap in `keymap-data.js`
**After**: Automatically loads from `config/boards/shields/detun/detun.keymap`

The visualizer is now synchronized with your ZMK firmware configuration!

---

**Last Updated**: December 2024
**Configuration Format**: ZMK Firmware `.keymap` files
**Parser Version**: 1.0