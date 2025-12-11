# Keyboard Visualizer - Technical Specification
# Version: 1.7.0
# Last Updated: December 2025
# Project: ZMK Detun Keyboard 3D Visualizer

## Project Overview

**Name**: Detun Keyboard 3D Visualizer
**Purpose**: Interactive 3D visualization of ZMK keyboard layout with multi-layer simultaneous view, interactive editing, and automatic sync with firmware configuration
**Type**: Web Application (SPA - Single Page Application)
**License**: MIT

**Key Features**:
- Multi-layer simultaneous view (all 3 layers stacked vertically)
- Interactive key editing with visual modification tracking (works in all views)
- Per-layer key editing - edit keys in any layer independently
- Real-time layer switching between single and multi-layer views
- Auto-load from ZMK configuration files
- Export modified keymaps as JSON
- Export complete ZMK configuration as zip archive
- Save keymap changes directly to backend file system for git workflow
- Modifier key combinations display
- Full 3D camera controls (rotate, pan, zoom)
- Type-based color customization with settings panel and persistent storage
- Shift and Caps Lock key toggling with dynamic label updates (letters and symbols)

## Core Requirements

### Functional Requirements
- FR-001: Display 60-key split keyboard in 3D space (30 keys per side, 6 columns × 5 rows)
- FR-002: Auto-load keymap from ZMK configuration files
- FR-003: Show key combinations when clicking modifier keys
- FR-004: Support interactive camera controls (rotate, pan, zoom)
- FR-005: Color-code keys by type (letters, numbers, modifiers, etc.)
- FR-006: Parse and display ZMK keycodes correctly
- FR-007: Graceful fallback to default keymap if ZMK config unavailable
- FR-008: Real-time visual feedback for key interactions
- FR-009: Layer switching UI to display different keyboard layers
- FR-010: Edit mode to modify key labels interactively
- FR-011: Visual indication of modified keys
- FR-012: Export modified keymap as JSON
- FR-013: Track modification history per layer
- FR-014: Multi-layer simultaneous view - display all 3 layers stacked vertically
- FR-015: Dynamic switching between single-layer and multi-layer views
- FR-016: Layer labels showing display name for each keyboard layer
- FR-017: Export complete ZMK configuration as zip archive with all required files
- FR-018: Type-based color customization through settings panel interface
- FR-019: Persistent color preferences stored in JSON file (key-colors.json) via backend API
- FR-020: Reset colors to default functionality with Apply/Reset buttons
- FR-021: Per-layer key editing - edit keys in any layer while in multi-layer view
- FR-022: Save keymap changes to backend server for direct file system updates (enables git push workflow)
- FR-023: Draggable color picker panel - user can reposition picker by dragging the header
- FR-024: Shift and Caps Lock toggle functionality - clicking SHIFT or CAPS keys dynamically updates all key labels to show shifted values (e.g., '1' becomes '!', 'a' becomes 'A')

### Non-Functional Requirements
- NFR-001: Load and render within 3 seconds
- NFR-002: Run at 60 FPS on modern browsers
- NFR-003: Support Chrome, Firefox, Safari, Edge (latest 2 versions)
- NFR-004: No build step required (pure HTML/CSS/JS)
- NFR-005: Responsive to window resize
- NFR-006: Keyboard accessible (ESC to close panels)

## Technology Stack

### Core Technologies
- **Language**: JavaScript (ES6 modules)
- **3D Engine**: Three.js r128
- **Controls**: OrbitControls.js (Three.js addon)
- **Module System**: ES6 native modules
- **Dependencies**: None (all loaded from CDN)

### Runtime Environment
- **Platform**: Web Browser (Client-side only)
- **Server**: Python HTTP server with POST endpoint support (start-server.py)
- **Minimum Browser**: ES6 module support required

### External Dependencies
```json
{
  "three.js": "r128",
  "source": "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "orbitControls": "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
  "jszip": "3.10.1",
  "source": "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
}
```

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   index.html                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              app.js (Main Orchestrator)          │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  keymap-data.js (Config Management)      │   │  │  │
│  │  │  │    ↓                                      │   │  │  │
│  │  │  │  zmk-parser.js (Parse ZMK Files)        │   │  │  │
│  │  │  │    ↓                                      │   │  │  │
│  │  │  │  zmk-exporter.js (Export ZMK Config)    │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  scene.js (Three.js Setup)               │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  keyboard.js (3D Keyboard Builder)       │   │  │  │
│  │  │  │    ↓                                      │   │  │  │
│  │  │  │  utils.js (Helper Functions)             │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  interactions.js (User Events)           │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│                    Python HTTP Server                        │
│  (start-server.py with POST /api/save-keymap endpoint)      │
└─────────────────────────────────────────────────────────────┘
                           ↓ File Read/Write
┌─────────────────────────────────────────────────────────────┐
│                      File System                             │
│  ../config/boards/shields/detun/detun.keymap (ZMK Config)   │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

#### app.js (Main Application)
- **Purpose**: Application lifecycle management and coordination
- **Responsibilities**:
  - Initialize keymap data from ZMK config
  - Set up Three.js scene
  - Create keyboard objects (single or multi-layer mode)
  - Initialize interactions
  - Run animation loop
  - Handle visibility changes
  - Manage view mode switching (single vs multi-layer)
  - Coordinate layer selection and display
- **Exports**: None (entry point)
- **Imports**: keymap-data.js, scene.js, keyboard.js, interactions.js
- **Application State**:
  - `multiLayerMode`: boolean - true shows all layers stacked
  - `layerKeyboards`: Array - all layer keyboard groups
  - `layerLabels`: Array - layer label sprites

#### keymap-data.js (Configuration Management)
- **Purpose**: Load and manage keyboard configuration
- **Responsibilities**:
  - Attempt to load from ZMK config file
  - Fall back to default keymap
  - Manage layer data
  - Provide key combination definitions
  - Track current active layer
  - Manage shift/caps lock state and label transformations
- **Exports**:
  - `initKeymapData()`: async → {success, source, keymap, layers, currentLayer}
  - `getKeymap()`: → Array<Array<string>>
  - `getLayers()`: → Object
  - `getCurrentLayerName()`: → string
  - `switchLayer(name)`: → boolean
  - `updateKeyLabel(row, col, newLabel)`: → boolean (updates current layer only)
  - `isKeyModified(row, col)`: → boolean (checks current layer only)
  - `getModifications()`: → Object
  - `exportKeymap()`: → Object
  - `resetModifications()`: → void
  - `updateKeyColor(layerName, row, col, color)`: → boolean (updates color for position)
  - `getKeyColorAt(layerName, row, col)`: → number (gets color for position)
  - `clearKeyColor(layerName, row, col)`: → boolean (clears custom color for position)
  - `saveCustomColors()`: async → boolean (saves keyColors to JSON file via backend)
  - `resetColorsToDefault()`: async → boolean (deletes JSON file via backend)
  - `getKeyColors()`: → Object (returns current keyColors object)
  - `getDefaultKeyColor()`: → number (returns default cream color)
  - `colorsLoadedPromise`: Promise (resolves when colors loaded from backend)
  - `getDefaultKeyColors()`: → Object (returns defaultKeyColors)
  - `getDisplayLabel(baseLabel)`: → string (returns display label based on shift/caps state)
  - `toggleShift()`: → boolean (toggles shift state, returns new state)
  - `toggleCaps()`: → boolean (toggles caps lock state, returns new state)
  - `getShiftState()`: → Object (returns current shift/caps state)
  - `isShiftKey(label)`: → boolean (checks if key is SHIFT)
  - `isCapsKey(label)`: → boolean (checks if key is CAPS)
  - `defaultKeymap`: Array<Array<string>>
  - `defaultKeyColors`: Object
  - `keyColors`: Object (mutable, customizable)
  - `keyTypes`: Object
  - `keyCombinations`: Object
  - `shiftState`: Object (tracks shift/caps active state)
  - `shiftedKeys`: Object (maps base keys to shifted values)
- **Imports**: zmk-parser.js
- **Color Management**:
  - Default color: `0xf5e6d3` (cream) for all keys
  - Custom colors in `keyColors` object: `{ "row:col": hexColor }`
  - Colors auto-loaded from backend JSON file on module initialization
  - Supports real-time color updates with immediate mesh updates
  - Position-based color storage (row:col format)
  - Colors apply to same position across all layers
  - Per-key customization via paint mode interface

#### zmk-parser.js (ZMK File Parser)
- **Purpose**: Parse ZMK .keymap files and convert to visualizer format
- **Responsibilities**:
  - Fetch ZMK keymap file via HTTP
  - Parse keymap syntax
  - Extract layer definitions
  - Convert ZMK keycodes to display labels
  - Handle layer switches, modifiers, bluetooth commands
- **Exports**:
  - `parseZMKKeymap(path)`: async → Object (layers)
  - `convertLayerToKeymap(layer)`: → Array<Array<string>> | null
  - `loadKeymapFromZMK()`: async → {keymap, layers, defaultLayerName} | null
  - `getAllLayersAsKeymaps(layers)`: → Object
- **Imports**: None
- **ZMK Keycode Support**:
  - Basic keys: Letters, numbers, symbols
  - Modifiers: CTRL, SHIFT, ALT, GUI
  - Special: TAB, SPACE, ENTER, BACKSPACE, ESC
  - Navigation: Arrows, HOME, END, PGUP, PGDN
  - Function keys: F1-F12
  - Layer switches: &mo, &lt, &to
  - Bluetooth: BT_CLR, BT_SEL, BT_NXT, BT_PRV
  - Transparent: &trans → ▽
  - None: &none → ✕

#### zmk-exporter.js (ZMK Configuration Export)
- **Purpose**: Generate and export complete ZMK configuration as zip archive
- **Responsibilities**:
  - Convert visualizer keymap format to ZMK keycode syntax
  - Generate complete .keymap file with proper formatting
  - Create ZMK bindings for all layers
  - Generate ASCII visual comments for keymaps
  - Package all required configuration files
  - Fetch existing config files from server
  - Create build.yaml, west.yml, and GitHub workflow files
  - Generate zip archive with JSZip
  - Trigger download of complete ZMK config
- **Exports**:
  - `exportZMKConfig()`: async → Blob (zip file)
  - `downloadZMKConfig()`: async → boolean
- **Imports**: keymap-data.js
- **Generated Files**:
  - `config/boards/shields/detun/detun.keymap` - Main keymap (modified)
  - `build.yaml` - Build configuration
  - `config/west.yml` - West manifest

#### zmk-saver.js (Backend Configuration Saver)
- **Purpose**: Save keymap changes directly to backend file system
- **Responsibilities**:
  - Convert visualizer keymap format to ZMK keycode syntax
  - Generate complete .keymap file content
  - Create ZMK bindings for all layers with proper formatting
  - Generate ASCII visual comments for keymaps
  - Send POST request to backend server to save keymap file
  - Provide user feedback on save success/failure
  - Enable git workflow (user can commit and push after save)
- **Exports**:
  - `saveKeymapToBackend()`: async → {success: boolean, message: string, path?: string}
  - `saveAndNotify()`: async → boolean (saves and shows user notification)
- **Imports**: keymap-data.js
- **Backend Endpoints**: 
  - POST `/api/save-keymap` - Save keymap file
  - GET `/api/key-colors` - Load color preferences
  - POST `/api/key-colors` - Save color preferences
  - DELETE `/api/key-colors` - Reset colors
- **Workflow**:
  1. User edits keys in visualizer
  2. User clicks "Save and Load Config" button
  3. Keymap is saved to `config/boards/shields/detun/detun.keymap`
  4. User runs `git add . && git commit && git push` to trigger firmware build
  - `.github/workflows/build.yml` - GitHub Actions workflow
  - `README.md` - Export documentation
  - Additional shield configuration files (fetched from server)
- **Keycode Mapping**:
  - Visualizer labels → ZMK keycodes (&kp, &mo, &lt, &to)
  - Empty keys (✕) → &none
  - Transparent keys (▽) → &trans
  - Modifiers (CTRL, SHFT, etc.) → &kp LCTRL, &kp LSHFT
  - Layer switches (L1, L2) → &mo 1, &mo 2
  - Bluetooth commands → &bt BT_CLR, &bt BT_SEL
  - Punctuation → proper ZMK symbol names

#### scene.js (Three.js Scene Setup)
- **Purpose**: Initialize and configure Three.js environment
- **Responsibilities**:
  - Create scene, camera, renderer
  - Set up lighting (ambient, directional, point)
  - Configure orbit controls
  - Create ground plane
  - Handle window resize
  - Position camera for multi-layer viewing
- **Exports**:
  - `createScene()`: → THREE.Scene
  - `createCamera()`: → THREE.PerspectiveCamera
  - `createRenderer(container)`: → THREE.WebGLRenderer
  - `createControls(camera, domElement)`: → THREE.OrbitControls
  - `setupLights(scene)`: → {ambientLight, windowLight, fillLight, hemiLight}
  - `createGround()`: → THREE.Mesh
  - `handleResize(camera, renderer)`: → void
  - `initScene(container)`: → Object (all components)
- **Imports**: None (uses global THREE object)
- **Three.js Configuration**:
  - Camera: PerspectiveCamera(75°, aspect, 0.1, 1000)
  - Position: (0, 20, 45) - adjusted for multi-layer view
  - Look At: (0, 15, 0) - middle of layer stack
  - Background: 0x1a1a2e
  - Shadows: PCFSoftShadowMap
  - Controls: minDistance: 15, maxDistance: 80
  - Target: (0, 15, 0) - center of vertical stack

#### keyboard.js (3D Keyboard Builder)
- **Purpose**: Create and manipulate 3D keyboard objects
- **Responsibilities**:
  - Create individual key meshes
  - Position keys in grid layout
  - Add text labels to keys
  - Apply colors based on key type
  - Store key metadata
  - Provide manipulation functions (highlight, dim, select)
  - Animate floating effect
  - Create multi-layer stacked keyboard displays
  - Generate layer labels for visual identification
- **Exports**:
  - `KEYBOARD_CONFIG`: Object (dimensions, offsets, layerSpacing)
  - `keyObjects`: Array<Object> (all key references)
  - `createKey(label, x, y, z, tilt)`: → {key, sprite} (layerName parameter removed)
  - `createKeyboard(keymap, offsetX, side)`: → THREE.Group (layerName parameter removed)
  - `createKeyboards(keymap)`: → {leftKeyboard, rightKeyboard}
  - `createAllLayerKeyboards(layers)`: → Array<Object> (all layer groups)
  - `createLayerLabel(layerName, y)`: → THREE.Sprite
  - `animateAllLayersFloating(layerGroups, time)`: → void
  - `findKeyByLabel(label)`: → Object | null
  - `filterKeys(predicate)`: → Array<Object>
  - `resetAllKeys()`: → void
  - `highlightKey(keyObj, color, intensity)`: → void
  - `dimKey(keyObj, opacity)`: → void
  - `selectKey(keyObj)`: → void
  - `animateFloating(left, right, time)`: → void
- **Imports**: utils.js
- **Key Object Structure**:
  ```javascript
  {
    mesh: THREE.Mesh,
    sprite: THREE.Sprite,
    label: string,
    side: 'left' | 'right',
    row: number (0-4),
    col: number (0-5),
    group: THREE.Group,
    // Note: layerName removed - no longer stored in key objects
  }
  ```
- **Keyboard Configuration**:
  ```javascript
  {
    keyWidth: 2,
    keyHeight: 0.5,
    keyDepth: 2,
    spacing: 0.3,
    leftOffset: -12,
    rightOffset: 6,
    tiltAngle: 0.05,
    layerSpacing: 15  // Vertical spacing between layers
  }
  ```

#### interactions.js (User Interaction Handler)
- **Purpose**: Handle mouse events and display key combinations
- **Responsibilities**:
  - Initialize raycaster for click detection
  - Handle click events on keys
  - Handle hover effects
  - Manage modifier key selection
  - Update combinations panel UI
  - Highlight/dim keys based on combinations
  - Manage edit mode (only available in single-layer view)
  - Prevent edit mode activation in multi-layer view
- **Exports**:
  - `interactionState`: Object (state tracking)
  - `setupInteractions(camera, renderer)`: → void
  - `handleClick(event, camera)`: → void
  - `handleMouseMove(event, camera, renderer)`: → void
- **Imports**: utils.js, keyboard.js, keymap-data.js
- **Interaction Flow**:
  1. User clicks → Raycast to find key
  2. If modifier key → Show combinations
  3. Highlight available keys
  4. Dim unavailable keys
  5. Display panel with descriptions
- **Edit Mode Flow** (single-layer view only):
  1. User toggles edit mode
  2. Click key → Open edit panel
  3. Edit panel shows position (no layer name)
  4. User edits label → Updates current layer only
  5. Key marked as modified with visual indicator

#### utils.js (Utility Functions)
- **Purpose**: Reusable helper functions
- **Responsibilities**:
  - Color assignment by key type
  - Key type classification
  - Text texture creation
  - DOM manipulation helpers
  - Math utilities (lerp, easing)
  - Debounce function
- **Exports**:
  - `getKeyColor(keyLabel)`: → number (hex color)
  - `isModifierKey(keyLabel)`: → boolean
  - `isLayerKey(keyLabel)`: → boolean
  - `isEmptyKey(keyLabel)`: → boolean
  - `getKeyType(keyLabel)`: → string
  - `createTextTexture(text, fontSize)`: → THREE.CanvasTexture
  - `normalizeKeyLabel(keyLabel)`: → string
  - `createElement(tag, classes, content)`: → HTMLElement
  - `debounce(func, wait)`: → Function
  - `lerp(start, end, t)`: → number
  - `easeOutCubic(t)`: → number
- **Imports**: keymap-data.js
- **Key Classification Logic**:
  - Letters: A-Z (cream)
  - Numbers: 0-9 (cream)
  - Modifiers: CTRL, GUI, ALT, SHFT, TAB, CAPS, ESC (blue)
  - Navigation: BSPC, ENT, SPC, arrows, HOME, END, PGUP, PGDN (blue)
  - Layer switches: L0-9, LT0-9, TO0-9 pattern match (pink)
  - Bluetooth: BT prefix pattern match (light gray)
  - Empty: ✕, ▽, NONE, TRANS, &trans, &none (dark gray)
  - Special: Everything else (light gray)

#### color-customization.js (Per-Key Color Customization Handler)
- **Purpose**: Handle per-key color customization with paint mode UI and JSON file persistence
- **Responsibilities**:
  - Initialize floating color picker UI with draggable interface
  - Handle paint mode for per-key color selection
  - Support multi-select with Shift+Click
  - Apply custom colors to individual keys (across all layers)
  - Save color preferences to JSON file via backend API
  - Load saved color preferences from backend on init
  - Reset colors to defaults
  - Provide visual feedback for selected keys
  - Trigger keyboard rebuild on color change
- **Exports**:
  - `initColorCustomization(rebuildCallback)`: → void
  - `isColorModeActive()`: → boolean
- **Imports**: keymap-data.js, keyboard.js, interactions.js
- **UI Elements**:
  - "Paint Keys" button to toggle paint mode
  - Floating draggable color picker panel with 8 preset colors
  - Color swatches: Black, Cream, Sky Blue, Mint, Yellow, Pink, Lavender, Purple
  - Reset to Default button in color picker
  - Selected key count display
  - Close button (X) to dismiss picker
  - ESC key to close picker and exit paint mode
  - "Reset All" button in legend to clear all custom colors
- **Paint Mode Features**:
  - Click keys to select them for coloring
  - Shift+Click for multi-selection
  - Visual highlight (orange glow) on selected keys
  - Click color swatch to apply to all selected keys
  - Color applies to same position across all layers
- **Storage**:
  - Backend file: `keyboard-visualizer/key-colors.json`
  - Format: JSON object with "row:col" keys and hex color integer values
  - Auto-load via GET `/api/key-colors` on application start
  - Auto-save via POST `/api/key-colors` when colors change
  - Reset via DELETE `/api/key-colors`
  - Persist across app restarts
  - Excluded from version control
- **Interaction Flow**:
  1. User clicks "Paint Keys" button (enters paint mode)
  2. User clicks key(s) to select (Shift+Click for multiple)
  3. Floating color picker appears with preset colors
  4. User clicks color swatch to apply to selected keys
  5. Color saved to JSON file via backend API
  6. Key meshes update immediately with new color
  7. Color applies to same position across all layers
  8. User exits paint mode or continues painting other keys

#### styles.css (Visual Styling)
- **Purpose**: All visual styling and UI elements
- **Responsibilities**:
  - Layout positioning
  - Panel styling
  - Color schemes
  - Animations
  - Scrollbar customization
- **Key Sections**:
  - Base styles (reset, body, container)
  - Info panel (top-left)
  - Legend panel (bottom-left)
  - Combinations panel (right-side)
  - Loading screen
  - Animations (@keyframes slideIn)

## Data Structures

### Keymap Format
```javascript
// 5 rows × 12 columns (6 per side)
Array<Array<string>> [
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'BSPC'],
  ['CTRL', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['SHFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'ESC'],
  ['✕', '✕', 'GUI', 'L1', 'SPC', '✕', '✕', 'ENT', 'L2', 'ALT', '✕', '✕'],
  ['✕', '✕', '✕', '✕', '✕', '✕', '✕', '✕', '✕', '✕', '✕', '✕']
]
```

### Layer Object
```javascript
{
  name: string,              // 'default', 'lower', 'raise'
  displayName: string,       // 'Default Layer', 'Lower Layer'
  keys: Array<string>        // ZMK keycodes: ['&kp TAB', '&kp Q', ...]
}
```

### Key Colors Storage Format
```javascript
// key-colors.json
// Position-based color mapping (row:col format)
// Colors are stored as hex integers (e.g., 0x87ceeb for sky blue)
// Applies to all layers at the same position
{
  "0:0": 0x2c2c2c,    // Row 0, Col 0 - Black
  "0:1": 0xf5e6d3,    // Row 0, Col 1 - Cream (default)
  "1:5": 0x87ceeb,    // Row 1, Col 5 - Sky Blue
  "2:3": 0xf4e57e,    // Row 2, Col 3 - Yellow
  "3:4": 0xf5a3b5     // Row 3, Col 4 - Pink
}
```

**Storage Details**:
- File location: `keyboard-visualizer/key-colors.json`
- Format: JSON object with "row:col" keys and hex color integer values
- Loaded on app initialization via GET `/api/key-colors`
- Saved automatically when colors change via POST `/api/key-colors`
- Can be deleted (reset) via DELETE `/api/key-colors`
- Excluded from git via `.gitignore` (user-specific preferences)

**Available Colors**:
- `0x2c2c2c` - Black
- `0xf5e6d3` - Cream (default)
- `0x87ceeb` - Sky Blue
- `0x7dd3c0` - Mint
- `0xf4e57e` - Yellow
- `0xf5a3b5` - Pink
- `0xb8a7d9` - Lavender
- `0x7e6db5` - Purple

### Key Combinations Format
```javascript
{
  'CTRL': [
    { key: 'C', description: 'Copy selected text' },
    { key: 'V', description: 'Paste clipboard content' }
  ],
  'SHFT': [...],
  'GUI': [...],
  'ALT': [...]
}
```

### Layer Group Object (Multi-Layer View)
```javascript
{
  group: THREE.Group,        // Container for left + right keyboards
  label: THREE.Sprite,       // Layer name label sprite
  leftKeyboard: THREE.Group, // Left side keyboard
  rightKeyboard: THREE.Group,// Right side keyboard
  layerName: string,         // 'default', 'lower', 'raise'
  displayName: string        // 'Default Layer', 'Lower Layer'
}
```

### Key Object (Internal)
```javascript
{
  mesh: THREE.Mesh,          // 3D mesh object
  sprite: THREE.Sprite,      // Text label sprite
  label: string,             // Display label ('A', 'CTRL', etc.)
  side: 'left' | 'right',   // Keyboard side
  row: number,               // Row index 0-4
  col: number,               // Column index 0-5
  group: THREE.Group         // Parent keyboard group
}
```

### Mesh UserData
```javascript
{
  label: string,             // Key label
  originalColor: number,     // Hex color
  originalScale: {x, y, z},  // Original scale
  isKey: boolean             // Identifier flag
}
```

## Color Scheme

### Default Key Colors (Hex)
```javascript
{
  letters: 0xf5e6d3,        // Cream colored (like nice PBT keycaps)
  numbers: 0xf5e6d3,        // Cream colored
  modifiers: 0x64b5f6,      // Blue for actions/modifiers
  navigation: 0x64b5f6,     // Blue for navigation
  special: 0xe0e0e0,        // Light gray for special chars
  layerSwitch: 0xf48fb1,    // Pink for layer switching
  empty: 0x6e6e6e           // Dark gray for empty keys
}
```

**Note**: These are the default colors. Users can customize each type through the settings panel. Custom colors are stored in localStorage and persist across sessions.

### Scene Colors
```javascript
{
  background: 0x1A1A2E,     // Dark blue-gray
  ground: 0x0F0F1E,         // Darker blue-gray
  ambientLight: 0xFFFFFF,   // White
  directionalLight: 0xFFFFFF, // White
  pointLight: 0x667EEA      // Purple-blue accent
}
```

## File Paths

### Source Files (Relative to keyboard-visualizer/)
```
./index.html                 - Main HTML entry point
./styles.css                 - All CSS styling
./app.js                     - Main application
./scene.js                   - Three.js setup
./keyboard.js                - Keyboard builder
./interactions.js            - User interactions
./keymap-data.js             - Config management
./zmk-parser.js              - ZMK parser
./utils.js                   - Utilities
./start.sh                   - Bash launcher script
./start-server.py            - Python launcher script
```

## View Modes

### Multi-Layer View (Default)
- Displays all 3 layers stacked vertically
- Each layer positioned 15 units apart on Y axis
- Layer labels shown in front of each keyboard
- Floating animation synchronized with phase offset
- Camera positioned at (0, 20, 45) to view entire stack
- Edit mode disabled - must switch to single-layer view to edit keys
- Default selection: "All Layers (Stacked)"

**Layer Positions:**
- Default Layer: Y = 0
- Lower Layer: Y = 15
- Raise Layer: Y = 30

### Single-Layer View
- Displays only selected layer
- Camera positioned at (0, 15, 25) for closer view
- Edit mode and interactions enabled
- Click modifier keys to see combinations
- Click any key in edit mode to modify label

### Switching Between Views
- Use layer dropdown selector in info panel
- "All Layers (Stacked)" → Multi-layer view
- Selecting specific layer → Single-layer view
- Keyboards rebuild dynamically when switching
- Edit mode automatically disabled when switching to multi-layer

## User Interactions

### Multi-Layer View
- **View Only**: No click interactions on keys
- **Camera Controls**: Rotate, pan, zoom to explore
- **Layer Switching**: Select dropdown to change view mode
- **Visual**: See all layer relationships at once

### Single-Layer View
- **View Mode**: Click modifiers to see combinations
- **Edit Mode**: Toggle on to click any key and edit its label (only available in single-layer view)
- **Layer Switching**: Switch between individual layers
- **Export**: Save modifications as JSON

### Shift and Caps Lock
- **SHIFT Key**: Click to toggle shift state
  - When active: Letters become uppercase (a→A), numbers become symbols (1→!, 2→@, etc.)
  - Visual indicator: SHIFT key highlighted in green (0x4caf50)
  - All key labels update in real-time to show shifted values
  - Click again to deactivate
- **CAPS Key**: Click to toggle caps lock state
  - When active: All letters become uppercase (a→A)
  - Visual indicator: CAPS key highlighted in orange (0xff9800)
  - Numbers and symbols remain unchanged
  - All letter key labels update in real-time
  - Click again to deactivate
- **State Independence**: SHIFT and CAPS states work independently
- **Label Transformation**: 
  - Letter keys: Display lowercase by default, uppercase when SHIFT or CAPS active
  - Symbol keys: Show shifted symbols when SHIFT active (e.g., / becomes ?)
  - Number keys: Show symbols when SHIFT active (1→!, 2→@, 3→#, etc.)
- **Persistent Highlighting**: SHIFT/CAPS keys remain highlighted when other modifiers selected

### Color Customization
- **Settings Panel**: Click "Customize Colors" button to open color settings panel
- **Type-Based Coloring**: Customize colors for 7 key types (letters, numbers, modifiers, navigation, special, layerSwitch, empty)
- **Real-Time Preview**: Legend updates as colors are changed
- **Apply Changes**: Click "Apply Colors" to save and apply custom colors
- **Reset**: Click "Reset Colors" to restore default color scheme
- **Persistence**: Custom colors saved to localStorage and restored on reload
- **Close Panel**: Click X button or press ESC key to close settings panel

### Configuration Files
```
../config/boards/shields/detun/detun.keymap  - ZMK keyboard config (SOURCE OF TRUTH)
../config/boards/shields/detun/detun.dtsi    - ZMK matrix config
```

### Documentation
```
./README.md                  - User documentation

## Implementation Notes

### Multi-Layer Rendering
1. Parse all layers from ZMK config on load
2. Convert each layer to keymap format
3. Store keymap with each layer object
4. Create keyboard groups for each layer with vertical offset
5. Generate layer labels as sprites positioned in front
6. Add all groups and labels to scene
7. Animate with phase-offset floating effect

### Layer Spacing Calculation
```javascript
yPosition = layerIndex * KEYBOARD_CONFIG.layerSpacing;
// layerIndex: 0 (default), 1 (lower), 2 (raise)
// layerSpacing: 15 units
// Results: 0, 15, 30
```

### Performance Considerations
- Multi-layer view renders 6 keyboards (3 layers × 2 sides)
- Total key count: ~42 keys × 3 layers = 126 keys
- Each key has mesh + sprite = 252 objects
- 60 FPS maintained on modern hardware
- Raycasting disabled in multi-layer view for performance

### Camera Framing
- Multi-layer: FOV 75°, distance 45 units
- Frames all 3 layers in vertical stack
- Center target at Y=15 (middle layer)
- Allows zoom from 15 to 80 units
- Single-layer: FOV 75°, distance 25 units
- Focused on single keyboard pair
- Allows zoom from 10 to 50 units

### Shift and Caps Lock Implementation
1. **State Management** (keymap-data.js):
   - `shiftState` object tracks `shiftActive` and `capsActive` booleans
   - `shiftedKeys` object maps base keys to shifted values (1→!, 2→@, /→?, etc.)
   - Toggle functions update state and log to console

2. **Label Transformation** (keymap-data.js):
   - `getDisplayLabel(baseLabel)` function applies transformations
   - Priority: Shift symbols > Capitalization > Base label
   - Letters: Uppercase when shift OR caps active, lowercase otherwise
   - Numbers: Show symbols when shift active (1→!, 2→@, 3→#, etc.)
   - Special chars: Show shifted version when shift active (/→?, ,→<, etc.)

3. **Visual Updates** (keyboard.js):
   - `updateAllKeyLabels()` iterates through all key objects
   - Stores original base label in `mesh.userData.baseLabel`
   - Applies `getDisplayLabel()` transformation
   - Regenerates text texture for each modified key
   - Updates sprite material with new texture

4. **Interaction Handling** (interactions.js):
   - Detects SHIFT/CAPS key clicks using base label
   - Toggles state via keymap-data functions
   - Calls `updateAllKeyLabels()` to refresh display
   - Applies visual highlighting (green for SHIFT, orange for CAPS)
   - Preserves highlighting when other modifiers selected
   - Resets highlighting when deactivated

5. **Default State**:
   - Both shift and caps start as inactive (false)
   - Letters display as lowercase by default (a-z, not A-Z)
   - ZMK parser outputs lowercase letters
   - Default keymap uses lowercase letters

./DEVELOPER.md               - Developer guide
./QUICKSTART.md              - Quick start guide
./START_HERE.md              - Simple launch instructions
./CONFIG_SYNC.md             - Configuration sync documentation
./keyboard_visualizer.spec   - This file (technical spec)
```

## API Interfaces

### Public Functions

#### Initialization
```javascript
// app.js
async init() → void
  // Initializes entire application
  // Loads config, sets up scene, creates keyboards
```

#### Configuration Loading
```javascript
// keymap-data.js
async initKeymapData() → Promise<{
  success: boolean,
  source: 'zmk' | 'default',
  keymap: Array<Array<string>>,
  layers: Object,
  currentLayer: string,
  error?: string
}>

getKeymap() → Array<Array<string>>
getLayers() → Object
getCurrentLayerName() → string
switchLayer(layerName: string) → boolean
```

#### ZMK Parsing
```javascript
// zmk-parser.js
async parseZMKKeymap(path: string) → Promise<Object | null>
  // Returns: { layerName: { name, displayName, keys } }

convertLayerToKeymap(layer: Object) → Array<Array<string>> | null
  // Converts ZMK layer to 5×12 grid format

async loadKeymapFromZMK() → Promise<Object | null>
  // Returns: { keymap, layers, defaultLayerName }
```

#### Keyboard Creation
```javascript
// keyboard.js
createKey(
  keyLabel: string,
  x: number, y: number, z: number,
  tilt: number
) → { key: THREE.Mesh, sprite: THREE.Sprite }

createKeyboard(
  keymap: Array<Array<string>>,
  offsetX: number,
  side: 'left' | 'right'
) → THREE.Group

createKeyboards(keymap: Array<Array<string>>) → {
  leftKeyboard: THREE.Group,
  rightKeyboard: THREE.Group
}
```

#### Key Manipulation
```javascript
// keyboard.js
findKeyByLabel(label: string) → Object | null
filterKeys(predicate: Function) → Array<Object>
resetAllKeys() → void
highlightKey(keyObj: Object, color?: number, intensity?: number) → void
dimKey(keyObj: Object, opacity?: number) → void
selectKey(keyObj: Object) → void
```

#### Interactions
```javascript
// interactions.js
setupInteractions(
  camera: THREE.Camera,
  renderer: HTMLElement
) → void

handleClick(event: MouseEvent, camera: THREE.Camera) → void
handleMouseMove(
  event: MouseEvent,
  camera: THREE.Camera,
  renderer: HTMLElement
) → void
```

## Configuration

### Keyboard Physical Layout
```javascript
{
  totalKeys: 60,              // 30 per side
  rows: 5,
  cols: 12,                   // 6 per side
  leftCols: 6,
  rightCols: 6,

  // Key dimensions (Three.js units)
  keyWidth: 2,
  keyHeight: 0.5,
  keyDepth: 2,
  spacing: 0.3,

  // Keyboard positioning
  leftOffset: -12,            // X position of left keyboard
  rightOffset: 6,             // X position of right keyboard
  tiltAngle: 0.05,           // Ergonomic tilt (radians)

  // Animations
  floatingAmplitude: 0.1,    // Vertical movement
  floatingSpeed: 0.5         // Cycles per second
}
```

### Camera Configuration
```javascript
{
  type: 'PerspectiveCamera',
  fov: 75,                    // Field of view
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  position: {x: 0, y: 20, z: 45},
  lookAt: {x: 0, y: 15, z: 0}
}
```

### Controls Configuration
```javascript
{
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 15,
  maxDistance: 80,
  enablePan: true,
  enableRotate: true,
  enableZoom: true
}
```

### Lighting Configuration
```javascript
{
  ambient: {
    color: 0xFFFFFF,
    intensity: 0.5
  },
  windowLight: {
    color: 0xFFFFFF,
    intensity: 0.7,
    position: {x: 0, y: 30, z: -40},
    castShadow: true,
    shadowMapSize: 2048,
    shadowCamera: {
      left: -50,
      right: 50,
      top: 50,
      bottom: -20
    },
    shadowBias: -0.0001
  },
  fillLight: {
    color: 0xFFFFFF,
    intensity: 0.4,
    position: {x: -20, y: 20, z: 10}
  },
  hemisphere: {
    skyColor: 0xFFFFFF,
    groundColor: 0xE8E8E8,
    intensity: 0.3
  }
}
```

## Performance Targets

### Load Time
- Initial HTML parse: < 100ms
- JavaScript module loading: < 500ms
- ZMK config parsing: < 200ms
- 3D scene initialization: < 1000ms
- First render: < 1500ms
- **Total time to interactive: < 3000ms**

### Runtime Performance
- Frame rate: 60 FPS (stable)
- Animation frame time: < 16.67ms
- Click response time: < 100ms
- Hover effect latency: < 50ms
- Memory usage: < 150MB

### Optimization Strategies
- Geometry instancing (not yet implemented)
- Texture caching for key labels
- Request animation frame throttling
- Pause animation when tab hidden
- Efficient raycasting (key meshes only)

## Browser Compatibility

### Minimum Requirements
- ES6 module support
- WebGL 1.0
- Canvas 2D API
- Fetch API
- Arrow functions
- Promises/async-await
- Template literals

### Tested Browsers
```
Chrome/Edge:   >= 91 (2021)
Firefox:       >= 89 (2021)
Safari:        >= 14.1 (2021)
Mobile Safari: >= 14.5 (2021)
```

### Known Limitations
- File:// protocol not supported (CORS restriction)
- Requires HTTP server for ES6 modules
- No IE11 support
- Mobile performance may vary

## Security Considerations

### Client-Side Only
- No server-side processing
- No data collection or analytics
- No external API calls (except CDN)
- No cookies or local storage

### Content Security Policy (CSP) Compatible
```
script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline';
```

### XSS Prevention
- No innerHTML with user input
- Text content sanitized via Three.js canvas rendering
- No eval() or Function() constructors

## Testing Strategy

### Manual Testing Checklist
- [ ] Keymap loads from ZMK config successfully
- [ ] Fallback works when ZMK config unavailable
- [ ] All 60 keys render correctly
- [ ] Click on CTRL shows combinations
- [ ] Click on SHFT shows combinations
- [ ] Click on ALT shows combinations
- [ ] Click on GUI shows combinations
- [ ] Hover effects work on modifiers
- [ ] ESC key closes panel
- [ ] Window resize maintains aspect ratio
- [ ] Keyboards float smoothly
- [ ] Camera controls respond correctly
- [ ] Config source indicator shows correct status
- [ ] Console shows no errors

### Browser Testing Matrix
| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | ✅ Primary |
| Firefox | Latest  | ✅ Primary |
| Safari  | Latest  | ✅ Primary |
| Edge    | Latest  | ✅ Primary |
| Mobile Safari | Latest | ⚠️ Limited |

## Deployment

### Hosting Requirements
- Python HTTP server (start-server.py)
- Write access to config directory for saving keymap changes
- Write access to keyboard-visualizer directory for saving key colors
- No database required
- Backend API endpoints:
  - POST /api/save-keymap - Save keymap changes to detun.keymap
  - GET /api/key-colors - Load key color preferences from key-colors.json
  - POST /api/key-colors - Save key color preferences to key-colors.json
  - DELETE /api/key-colors - Delete key-colors.json (reset to defaults)
- CORS must allow module loading

### Deployment Steps
1. Copy all files to web server
2. Ensure ZMK config is accessible at `../config/boards/shields/detun/detun.keymap`
3. Configure HTTP server to serve from `keyboard-visualizer/` directory
4. Access via `http://domain/index.html`

### Local Development
```bash
# Navigate to directory
cd keyboard-visualizer

# Start server (choose one)
./start.sh                    # Auto-detect and run
python3 start-server.py       # Python server (REQUIRED for save functionality)

# Access at http://localhost:8000
```

## Future Enhancements

### Planned Features
- [ ] Layer switching UI (view different layers)
- [ ] Export keyboard layout as image (PNG/SVG)
- [ ] Custom color themes
- [ ] Dark/light mode toggle
- [ ] Keyboard layout comparison
- [ ] Animated key press visualization
- [ ] Sound effects
- [ ] Touch device optimization
- [ ] VR/AR mode
- [ ] Load keymap from file upload
- [ ] Validate ZMK syntax
- [ ] Hot-reload when .keymap changes
- [ ] Key history/heatmap
- [ ] Multi-language support

### Performance Improvements
- [ ] Geometry instancing for keys
- [ ] LOD (Level of Detail) system
- [ ] Frustum culling optimization
- [ ] Web Worker for parsing
- [ ] Service Worker for offline support
- [ ] Texture atlas for labels
- [ ] GPU instancing

### Code Quality
- [ ] Unit tests (Jest)
- [ ] Integration tests (Playwright)
- [ ] TypeScript conversion
- [ ] JSDoc completion
- [ ] Linting (ESLint)
- [ ] Code formatting (Prettier)
- [ ] CI/CD pipeline

## Maintenance

### Version Management
- Follows Semantic Versioning (SemVer)
- Current version: 1.4.0
- Version tracking in this spec file

### Update Checklist
- [ ] Update version number
- [ ] Update Last Updated date
- [ ] Test all features
- [ ] Update documentation
- [ ] Update CHANGELOG (if created)
- [ ] Tag release in git

### Dependencies Update
- Three.js: Check quarterly for updates
- OrbitControls: Check with Three.js updates
- Browser compatibility: Review annually

## Support

### Documentation Hierarchy
1. START_HERE.md - Absolute beginner
2. QUICKSTART.md - Quick start guide
3. README.md - Full user guide
4. CONFIG_SYNC.md - Configuration details
5. DEVELOPER.md - Developer guide
6. keyboard_visualizer.spec - This file (technical spec)

### Common Issues

**Issue**: CORS error when loading
**Solution**: Use HTTP server, not file:// protocol

**Issue**: Blank screen on load
**Solution**: Check browser console, verify ZMK config path

**Issue**: Keys show wrong labels
**Solution**: Add mapping in zmk-parser.js ZMK_KEYCODE_MAP

**Issue**: Poor performance
**Solution**: Close other tabs, check GPU acceleration

## Changelog

### Version 1.4.0 (December 2025)
- **MAJOR**: Changed color system from per-key customization to type-based customization
- Removed per-key paint mode with multi-selection functionality
- Removed centered color picker overlay with 8 preset color swatches
- Added settings panel interface for color customization
- Changed color storage from position-based (layer:row:col) to type-based (letters, numbers, modifiers, etc.)
- Updated default color scheme to cream keycaps with blue modifiers/navigation and pink layer switches
- Modified `keymap-data.js` exports:
  - `defaultKeyColor` (single value) → `defaultKeyColors` (object with types)
  - Added `getKeyColors()` and `getDefaultKeyColors()` functions
  - Color management now type-based instead of position-based
- Modified `utils.js` `getKeyColor()` function:
  - Now takes only label parameter (removed layerName, row, col parameters)
  - Implements key classification logic based on label content
  - Returns color based on key type (letters, numbers, modifiers, navigation, special, layerSwitch, empty)
- Rewrote `color-customization.js`:
  - Removed multi-key selection and paint mode logic
  - Changed from popup color picker to settings panel approach
  - Added Apply/Reset buttons in settings panel
  - Real-time legend color preview maintained
  - Settings panel opens with "Customize Colors" button
- Updated lighting configuration:
  - Fill light intensity increased from 0.25 to 0.4
  - Hemisphere light intensity increased from 0.2 to 0.3
  - Overall brighter lighting for better color visibility
- Removed documentation files:
  - COLOR_CUSTOMIZATION.md (per-key color documentation)
  - COLOR_PALETTE.md (palette documentation)
- Updated UI styling:
  - Removed color picker overlay styles
  - Added color settings panel styles with color input fields
  - Legend items now display current colors dynamically
  - ESC key support to close settings panel

### Version 1.3.0 (December 2025)
- **REVERSION**: Reverted from bright workspace aesthetic back to original dark theme
- Removed minimalist bright workspace environment features
- Removed clean white desk with realistic accessories (laptop, plant, coffee mug, etc.)
- Removed large bright window with natural daylight simulation
- Reverted to dark blue-gray background (0x1A1A2E) from bright theme
- Reverted key colors to vibrant scheme (green letters, blue numbers, orange modifiers, red navigation, purple special, cyan layer switch)
- Removed desk, walls, window, desk mat, and decorative items from scene
- Simplified lighting from multi-source natural lighting to 3-light setup (ambient, directional, point)
- Reverted UI theme from light panels to dark panels with colored accents
- Changed camera FOV back to 75° (from 40°)
- Adjusted camera position to (0, 20, 45) for better multi-layer viewing
- Increased controls max distance to 80 (from 60) for full layer stack visibility
- Simplified modifier highlighting (removed layer-aware highlighting)
- Reverted text texture to white text with bold Arial font
- Simplified empty key detection

### Version 1.2.0 (December 2025)
- Added bright workspace aesthetic with modern office setup
- Clean white desk with realistic accessories
- Natural daylight simulation from large window
- Muted, professional keycap colors (cream/light gray palette)
- Multi-source lighting for realistic ambiance
- Light UI theme with white panels

### Version 1.0.0 (December 2025)
- Initial release
- ZMK config auto-loading
- Interactive key combinations
- 3D visualization with 60-key support
- Modular architecture
- Comprehensive documentation

---

**Document Control**
- Author: Development Team
- Last Reviewed: December 2025
- Status: Active
- Classification: Public
