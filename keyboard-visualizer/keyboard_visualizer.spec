# Keyboard Visualizer - Technical Specification
# Version: 1.0.0
# Last Updated: December 2024
# Project: ZMK Detun Keyboard 3D Visualizer

## Project Overview

**Name**: Detun Keyboard 3D Visualizer
**Purpose**: Interactive 3D visualization of ZMK keyboard layout that automatically syncs with firmware configuration
**Type**: Web Application (SPA - Single Page Application)
**License**: MIT

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
- **Server**: Static HTTP server (Python, Node.js, or PHP)
- **Minimum Browser**: ES6 module support required

### External Dependencies
```json
{
  "three.js": "r128",
  "source": "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "orbitControls": "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
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
│                    Static HTTP Server                        │
│  (Python http.server / Node.js serve / PHP built-in)        │
└─────────────────────────────────────────────────────────────┘
                           ↓ File Read
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
  - Create keyboard objects
  - Initialize interactions
  - Run animation loop
  - Handle visibility changes
- **Exports**: None (entry point)
- **Imports**: keymap-data.js, scene.js, keyboard.js, interactions.js

#### keymap-data.js (Configuration Management)
- **Purpose**: Load and manage keyboard configuration
- **Responsibilities**:
  - Attempt to load from ZMK config file
  - Fall back to default keymap
  - Manage layer data
  - Provide key combination definitions
  - Track current active layer
- **Exports**:
  - `initKeymapData()`: async → {success, source, keymap, layers, currentLayer}
  - `getKeymap()`: → Array<Array<string>>
  - `getLayers()`: → Object
  - `getCurrentLayerName()`: → string
  - `switchLayer(name)`: → boolean
  - `defaultKeymap`: Array<Array<string>>
  - `keyColors`: Object
  - `keyTypes`: Object
  - `keyCombinations`: Object
- **Imports**: zmk-parser.js

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

#### scene.js (Three.js Scene Setup)
- **Purpose**: Initialize and configure Three.js environment
- **Responsibilities**:
  - Create scene, camera, renderer
  - Set up lighting (ambient, directional, point)
  - Configure orbit controls
  - Create ground plane
  - Handle window resize
- **Exports**:
  - `createScene()`: → THREE.Scene
  - `createCamera()`: → THREE.PerspectiveCamera
  - `createRenderer(container)`: → THREE.WebGLRenderer
  - `createControls(camera, domElement)`: → THREE.OrbitControls
  - `setupLights(scene)`: → {ambientLight, directionalLight, pointLight}
  - `createGround()`: → THREE.Mesh
  - `handleResize(camera, renderer)`: → void
  - `initScene(container)`: → Object (all components)
- **Imports**: None (uses global THREE object)
- **Three.js Configuration**:
  - Camera: PerspectiveCamera(75°, aspect, 0.1, 1000)
  - Position: (0, 15, 25)
  - Background: 0x1a1a2e
  - Shadows: PCFSoftShadowMap

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
- **Exports**:
  - `KEYBOARD_CONFIG`: Object (dimensions and offsets)
  - `keyObjects`: Array<Object> (all key references)
  - `createKey(label, x, y, z, tilt)`: → {key, sprite}
  - `createKeyboard(keymap, offsetX, side)`: → THREE.Group
  - `createKeyboards(keymap)`: → {leftKeyboard, rightKeyboard}
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
    group: THREE.Group
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
    tiltAngle: 0.05
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
- **Imports**: None

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

### Key Colors (Hex)
```javascript
{
  letters: 0x4CAF50,        // Green
  numbers: 0x2196F3,        // Blue
  modifiers: 0xFF9800,      // Orange
  navigation: 0xF44336,     // Red
  special: 0x9C27B0,        // Purple
  layerSwitch: 0x00BCD4,    // Cyan
  empty: 0x424242           // Dark Gray
}
```

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

### Configuration Files
```
../config/boards/shields/detun/detun.keymap  - ZMK keyboard config (SOURCE OF TRUTH)
../config/boards/shields/detun/detun.dtsi    - ZMK matrix config
```

### Documentation
```
./README.md                  - User documentation
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
  position: {x: 0, y: 15, z: 25},
  lookAt: {x: 0, y: 0, z: 0}
}
```

### Controls Configuration
```javascript
{
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 10,
  maxDistance: 50,
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
    intensity: 0.6
  },
  directional: {
    color: 0xFFFFFF,
    intensity: 0.8,
    position: {x: 10, y: 20, z: 10},
    castShadow: true,
    shadowMapSize: 2048
  },
  point: {
    color: 0x667EEA,
    intensity: 0.5,
    position: {x: -10, y: 10, z: 10}
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
- Static file hosting
- HTTP server (any)
- No database required
- No server-side processing
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
python3 start-server.py       # Python server
python3 -m http.server 8000   # Manual Python
npx serve                     # Node.js serve
php -S localhost:8000         # PHP built-in

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
- Current version: 1.0.0
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

### Version 1.0.0 (December 2024)
- Initial release
- ZMK config auto-loading
- Interactive key combinations
- 3D visualization with 60-key support
- Modular architecture
- Comprehensive documentation

---

**Document Control**
- Author: Development Team
- Last Reviewed: December 2024
- Next Review: March 2025
- Status: Active
- Classification: Public
