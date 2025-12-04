# Developer Guide

## Architecture Overview

This keyboard visualizer uses a modular architecture with ES6 modules to keep code organized and maintainable.

## Module Dependency Graph

```
index.html
    ↓
app.js (main orchestrator)
    ↓
    ├── keymap-data.js (data)
    ├── scene.js (Three.js setup)
    ├── keyboard.js (3D keyboard creation)
    │   └── utils.js (helpers)
    └── interactions.js (user interactions)
        ├── keyboard.js (key manipulation)
        ├── keymap-data.js (combinations data)
        └── utils.js (helpers)
```

## Module Details

### app.js - Application Orchestrator

**Purpose**: Main entry point, initializes and coordinates all modules

**Key Functions**:
- `init()`: Initializes scene, keyboards, and interactions
- `animate()`: Main animation loop
- `cleanup()`: Disposal of resources
- `handleVisibilityChange()`: Pause/resume on tab switching

**State Management**:
```javascript
const app = {
    scene: null,           // Three.js scene
    camera: null,          // Camera object
    renderer: null,        // WebGL renderer
    controls: null,        // Orbit controls
    leftKeyboard: null,    // Left keyboard group
    rightKeyboard: null,   // Right keyboard group
    animationId: null,     // RequestAnimationFrame ID
    isInitialized: false   // Init status flag
};
```

**Usage**:
- Automatically starts on page load
- Exposed as `window.keyboardApp` for debugging

---

### scene.js - Three.js Scene Setup

**Purpose**: Creates and configures all Three.js scene components

**Exports**:

```javascript
// Create individual components
createScene()           // → THREE.Scene
createCamera()          // → THREE.PerspectiveCamera
createRenderer(container) // → THREE.WebGLRenderer
createControls(camera, domElement) // → THREE.OrbitControls
setupLights(scene)      // → { ambientLight, directionalLight, pointLight }
createGround()          // → THREE.Mesh

// Initialize complete scene
initScene(container)    // → { scene, camera, renderer, controls, lights, ground }
```

**Configuration**:
- Camera: 75° FOV, positioned at (0, 15, 25)
- Lighting: Ambient + Directional (with shadows) + Point light
- Ground: 50×50 plane with shadow receiving

**Customization Points**:
- Adjust camera position in `createCamera()`
- Modify lighting intensity/color in `setupLights()`
- Change background color in `createScene()`

---

### keyboard.js - 3D Keyboard Builder

**Purpose**: Creates 3D representations of keys and keyboards

**Configuration**:
```javascript
export const KEYBOARD_CONFIG = {
    keyWidth: 2,
    keyHeight: 0.5,
    keyDepth: 2,
    spacing: 0.3,
    leftOffset: -12,
    rightOffset: 6,
    tiltAngle: 0.05
};
```

**Key Data Structure**:
```javascript
export const keyObjects = [
    {
        mesh: THREE.Mesh,      // The 3D key mesh
        sprite: THREE.Sprite,  // Text label sprite
        label: string,         // Key label (e.g., 'A', 'CTRL')
        side: string,          // 'left' or 'right'
        row: number,           // Row index (0-4)
        col: number,           // Column index (0-5)
        group: THREE.Group     // Parent keyboard group
    },
    // ... 60 total keys
];
```

**Key Functions**:

```javascript
// Create single key
createKey(keyLabel, x, y, z, tilt)
// Returns: { key: THREE.Mesh, sprite: THREE.Sprite }

// Create one side of keyboard
createKeyboard(keymap, offsetX, side)
// Returns: THREE.Group

// Create both keyboards
createKeyboards(keymap)
// Returns: { leftKeyboard: THREE.Group, rightKeyboard: THREE.Group }

// Key manipulation
highlightKey(keyObj, color, intensity)  // Make key glow
dimKey(keyObj, opacity)                 // Make key transparent
selectKey(keyObj)                       // Select and emphasize
resetAllKeys()                          // Reset all to default

// Utilities
findKeyByLabel(label)                   // Find key by label
filterKeys(predicate)                   // Filter keys by condition
animateFloating(left, right, time)      // Animate floating effect
```

**Key Metadata** (stored in `mesh.userData`):
```javascript
{
    label: 'A',
    originalColor: 0x4CAF50,
    originalScale: { x: 1, y: 1, z: 1 },
    isKey: true
}
```

---

### interactions.js - User Interaction Handler

**Purpose**: Manages mouse events and key combination displays

**State**:
```javascript
export const interactionState = {
    selectedModifier: null,  // Currently selected modifier key
    hoveredKey: null,        // Currently hovered key
    raycaster: null,         // THREE.Raycaster for click detection
    mouse: null              // THREE.Vector2 for mouse position
};
```

**Key Functions**:

```javascript
// Setup
initRaycaster()                              // Initialize raycasting
setupInteractions(camera, renderer)          // Setup all event listeners

// Event handlers
handleClick(event, camera)                   // Process clicks
handleMouseMove(event, camera, renderer)     // Process hover

// Internal
selectModifier(modifierLabel)                // Show combinations for modifier
deselectModifier()                           // Clear selection
updateCombinationsPanel(modifier, combos)    // Update UI panel
```

**Event Flow**:

1. User clicks on canvas
2. `handleClick()` → Update mouse position
3. Raycast to find intersected key
4. If modifier key → `selectModifier()`
5. Highlight relevant keys
6. Display combinations panel
7. User clicks elsewhere → `deselectModifier()`

**Combination Display Logic**:
- Selected modifier: white glow, scale up 10%
- Available keys: yellow/colored highlight, emissive intensity 0.7
- Unavailable keys: dimmed to 30% opacity
- Special cases: 'Q-Z' highlights all letters, '1-9' highlights numbers

---

### keymap-data.js - Configuration Data

**Purpose**: Stores all keyboard layout and combination data

**Exports**:

```javascript
// Keyboard layout (5 rows × 12 keys)
export const keymap = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BSPC'],
    // ... 5 rows total
];

// Color definitions
export const keyColors = {
    letters: 0x4CAF50,
    numbers: 0x2196F3,
    modifiers: 0xFF9800,
    navigation: 0xF44336,
    special: 0x9C27B0
};

// Key type groups
export const keyTypes = {
    letters: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    numbers: '1234567890',
    modifiers: ['CTRL', 'GUI', 'ALT', 'SHFT', 'TAB', 'CAPS', 'ESC'],
    navigation: ['BSPC', 'ENT', 'SPC']
};

// Key combinations
export const keyCombinations = {
    'CTRL': [
        { key: 'C', description: 'Copy selected text' },
        // ...
    ],
    'SHFT': [...],
    'GUI': [...],
    'ALT': [...]
};
```

**Adding New Combinations**:

```javascript
export const keyCombinations = {
    'CTRL': [
        { key: 'KEY_LABEL', description: 'What it does' },
    ]
};
```

Special key patterns:
- `'Q-Z'`: Matches all letter keys
- `'1-9'`: Matches all number keys
- Use actual key label for exact match

---

### utils.js - Helper Functions

**Purpose**: Reusable utility functions

**Key Functions**:

```javascript
// Color and classification
getKeyColor(keyLabel)           // → hex color number
isModifierKey(keyLabel)         // → boolean
getKeyType(keyLabel)            // → 'letters'|'numbers'|'modifiers'|'navigation'|'special'

// Text rendering
createTextTexture(text, fontSize) // → THREE.CanvasTexture

// String utilities
normalizeKeyLabel(keyLabel)     // → normalized string

// DOM utilities
createElement(tag, classes, content) // → HTMLElement

// Math utilities
lerp(start, end, t)             // Linear interpolation
easeOutCubic(t)                 // Easing function

// Performance
debounce(func, wait)            // Debounce function calls
```

---

### styles.css - Visual Styling

**Purpose**: All CSS styles for UI and animations

**Key Sections**:

1. **Base Styles**: Reset, body, container
2. **Info Panel**: Top-left keyboard info
3. **Legend**: Bottom-left color guide
4. **Combinations Panel**: Right-side panel for combinations
5. **Animations**: Slide-in animation, transitions
6. **Scrollbar**: Custom scrollbar styling

**CSS Classes**:

```css
#container              /* Main container */
#info                   /* Info panel (top-left) */
.legend                 /* Color legend (bottom-left) */
.legend-item            /* Individual legend entry */
.legend-color           /* Color swatch */
#combinations-panel     /* Combinations panel (right) */
#combinations-panel.active /* Shown state */
.combination-item       /* Individual combination */
.combination-keys       /* Key combination text */
.combination-description /* Description text */
.close-btn              /* Close button */
.loading                /* Loading screen */
```

---

## Adding New Features

### Example: Add Layer Switching

1. **Create `layers.js`**:
```javascript
// layers.js
import { keyObjects, resetAllKeys } from './keyboard.js';

export const layers = {
    base: [...],
    lower: [...],
    raise: [...]
};

export let currentLayer = 'base';

export function switchLayer(layerName) {
    currentLayer = layerName;
    updateKeyLabels(layers[layerName]);
}

function updateKeyLabels(layerData) {
    keyObjects.forEach((obj, index) => {
        // Update sprite texture with new label
    });
}
```

2. **Import in `app.js`**:
```javascript
import { switchLayer } from './layers.js';
```

3. **Add UI controls in HTML**:
```html
<div id="layer-selector">
    <button data-layer="base">Base</button>
    <button data-layer="lower">Lower</button>
    <button data-layer="raise">Raise</button>
</div>
```

4. **Add styles in `styles.css`**:
```css
#layer-selector {
    position: absolute;
    bottom: 20px;
    right: 20px;
    /* ... */
}
```

5. **Wire up events**:
```javascript
// In app.js or new module
document.querySelectorAll('[data-layer]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchLayer(e.target.dataset.layer);
    });
});
```

---

## Debugging Tips

### Access App State
```javascript
// In browser console
window.keyboardApp.scene
window.keyboardApp.camera
window.keyboardApp.leftKeyboard
```

### Check Key Objects
```javascript
// In keyboard.js
import { keyObjects } from './keyboard.js';
console.log(keyObjects);
```

### Raycasting Debug
```javascript
// In interactions.js
function handleClick(event, camera) {
    updateMousePosition(event);
    const keyObj = getIntersectedKey(camera);
    console.log('Clicked:', keyObj ? keyObj.label : 'nothing');
}
```

### Monitor Animation Frame Rate
```javascript
// In app.js
let lastTime = Date.now();
function animate() {
    const now = Date.now();
    const fps = 1000 / (now - lastTime);
    console.log('FPS:', fps.toFixed(1));
    lastTime = now;
    // ... rest of animate
}
```

---

## Performance Optimization

### Current Optimizations
1. ✅ Single geometry instances per key (not recreated)
2. ✅ Texture caching for text labels
3. ✅ Pause animation when tab is hidden
4. ✅ Efficient raycasting (only key meshes)
5. ✅ CSS animations instead of JS where possible

### Future Optimizations
- [ ] Instance rendering for keys (all keys share geometry)
- [ ] LOD (Level of Detail) for distant view
- [ ] Frustum culling optimization
- [ ] Web Worker for heavy computations
- [ ] Lazy load combinations data

---

## Common Patterns

### Adding New Key Manipulation
```javascript
// In keyboard.js
export function pulseKey(keyObj, duration = 1000) {
    const material = keyObj.mesh.material;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            material.emissiveIntensity = Math.sin(progress * Math.PI);
            requestAnimationFrame(animate);
        } else {
            material.emissiveIntensity = 0;
        }
    }
    
    animate();
}
```

### Adding New Event Handler
```javascript
// In interactions.js or new module
export function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        const keyObj = findKeyByLabel(key);
        
        if (keyObj) {
            pulseKey(keyObj);
        }
    });
}
```

---

## Best Practices

1. **Keep modules focused**: Each module should have a single responsibility
2. **Export what's needed**: Only export functions/data that other modules need
3. **Use constants**: Define magic numbers as named constants
4. **Document functions**: Use JSDoc comments for public functions
5. **Handle errors**: Add try-catch blocks for critical operations
6. **Clean up resources**: Dispose of Three.js objects when done
7. **Test incrementally**: Test each module independently
8. **Use semantic names**: Function and variable names should be descriptive

---

## Testing Locally

### Simple HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

---

## Useful Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [ZMK Firmware Docs](https://zmk.dev/)

---

**Happy coding!** 🚀