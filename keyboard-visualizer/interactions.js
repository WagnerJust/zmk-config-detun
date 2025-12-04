// Interactions module - Handles user interactions with the keyboard

import { isModifierKey } from './utils.js';
import { keyObjects, resetAllKeys, highlightKey, dimKey, selectKey } from './keyboard.js';
import { keyCombinations } from './keymap-data.js';

/**
 * Interaction state
 */
export const interactionState = {
    selectedModifier: null,
    hoveredKey: null,
    raycaster: null,
    mouse: null
};

/**
 * Initialize raycaster for click detection
 */
export function initRaycaster() {
    interactionState.raycaster = new THREE.Raycaster();
    interactionState.mouse = new THREE.Vector2();
}

/**
 * Update mouse position
 * @param {MouseEvent} event - Mouse event
 */
function updateMousePosition(event) {
    interactionState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    interactionState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * Get intersected key from mouse position
 * @param {THREE.Camera} camera - The camera
 * @returns {Object|null} - Intersected key object or null
 */
function getIntersectedKey(camera) {
    interactionState.raycaster.setFromCamera(interactionState.mouse, camera);

    // Get all key meshes
    const keyMeshes = keyObjects.map(obj => obj.mesh);
    const intersects = interactionState.raycaster.intersectObjects(keyMeshes);

    if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        return keyObjects.find(obj => obj.mesh === intersectedMesh);
    }

    return null;
}

/**
 * Handle key click
 * @param {Object} keyObj - The clicked key object
 */
function handleKeyClick(keyObj) {
    const keyLabel = keyObj.label;

    // Check if it's a modifier key
    if (!isModifierKey(keyLabel)) {
        console.log(`Clicked non-modifier key: ${keyLabel}`);
        return;
    }

    // If clicking the same modifier, deselect it
    if (interactionState.selectedModifier === keyLabel) {
        deselectModifier();
        return;
    }

    // Select the new modifier
    selectModifier(keyLabel);
}

/**
 * Select a modifier and show combinations
 * @param {string} modifierLabel - The modifier key label
 */
function selectModifier(modifierLabel) {
    // Reset previous state
    resetAllKeys();

    // Set new selected modifier
    interactionState.selectedModifier = modifierLabel;

    // Find and highlight the selected modifier key
    const modifierKey = keyObjects.find(obj => obj.label === modifierLabel);
    if (modifierKey) {
        selectKey(modifierKey);
    }

    // Get combinations for this modifier
    const combinations = keyCombinations[modifierLabel] || [];

    // Highlight keys that have combinations
    const highlightedKeys = new Set();
    combinations.forEach(combo => {
        // Handle special cases
        if (combo.key === 'Q-Z') {
            // Highlight all letter keys
            keyObjects.forEach(obj => {
                if (/^[A-Z]$/.test(obj.label)) {
                    highlightKey(obj, 0x4CAF50, 0.6);
                    highlightedKeys.add(obj.label);
                }
            });
        } else if (combo.key === '1-9') {
            // Highlight number keys
            keyObjects.forEach(obj => {
                if (/^[1-9]$/.test(obj.label)) {
                    highlightKey(obj, 0x2196F3, 0.6);
                    highlightedKeys.add(obj.label);
                }
            });
        } else if (combo.key.includes('←') || combo.key.includes('→') ||
                   combo.key.includes('↑') || combo.key.includes('↓')) {
            // Skip arrow keys for now (not in base layout)
        } else {
            // Find exact key match
            const key = keyObjects.find(obj => obj.label === combo.key);
            if (key) {
                highlightKey(key, 0xFFFF00, 0.7);
                highlightedKeys.add(key.label);
            }
        }
    });

    // Dim keys that don't have combinations
    keyObjects.forEach(obj => {
        if (!highlightedKeys.has(obj.label) && obj.label !== modifierLabel) {
            dimKey(obj, 0.3);
        }
    });

    // Update combinations panel
    updateCombinationsPanel(modifierLabel, combinations);
}

/**
 * Deselect current modifier
 */
function deselectModifier() {
    interactionState.selectedModifier = null;
    resetAllKeys();
    hideCombinationsPanel();
}

/**
 * Update the combinations panel UI
 * @param {string} modifierLabel - The modifier label
 * @param {Array} combinations - Array of combination objects
 */
function updateCombinationsPanel(modifierLabel, combinations) {
    const panel = document.getElementById('combinations-panel');
    const header = panel.querySelector('h2');
    const list = document.getElementById('combinations-list');

    // Update header
    header.textContent = `${modifierLabel} Combinations`;

    // Clear previous combinations
    list.innerHTML = '';

    // Add combinations
    if (combinations.length === 0) {
        list.innerHTML = '<p style="color: rgba(255,255,255,0.6); font-style: italic;">No combinations defined</p>';
    } else {
        combinations.forEach(combo => {
            const item = document.createElement('div');
            item.className = 'combination-item';

            const keys = document.createElement('div');
            keys.className = 'combination-keys';
            keys.textContent = `${modifierLabel} + ${combo.key}`;

            const description = document.createElement('div');
            description.className = 'combination-description';
            description.textContent = combo.description;

            item.appendChild(keys);
            item.appendChild(description);
            list.appendChild(item);
        });
    }

    // Show panel
    panel.classList.add('active');
}

/**
 * Hide the combinations panel
 */
function hideCombinationsPanel() {
    const panel = document.getElementById('combinations-panel');
    panel.classList.remove('active');
}

/**
 * Handle mouse click event
 * @param {MouseEvent} event - Mouse event
 * @param {THREE.Camera} camera - The camera
 */
export function handleClick(event, camera) {
    updateMousePosition(event);
    const keyObj = getIntersectedKey(camera);

    if (keyObj) {
        handleKeyClick(keyObj);
    } else {
        // Clicked on empty space - deselect
        if (interactionState.selectedModifier) {
            deselectModifier();
        }
    }
}

/**
 * Handle mouse move event for hover effects
 * @param {MouseEvent} event - Mouse event
 * @param {THREE.Camera} camera - The camera
 * @param {HTMLElement} renderer - The renderer DOM element
 */
export function handleMouseMove(event, camera, renderer) {
    updateMousePosition(event);
    const keyObj = getIntersectedKey(camera);

    // Update cursor style
    if (keyObj && isModifierKey(keyObj.label)) {
        renderer.style.cursor = 'pointer';

        // Slight highlight on hover if not selected
        if (interactionState.hoveredKey !== keyObj) {
            // Reset previous hover
            if (interactionState.hoveredKey &&
                interactionState.hoveredKey.label !== interactionState.selectedModifier) {
                // Only reset if not part of current selection
                const material = interactionState.hoveredKey.mesh.material;
                if (material.emissiveIntensity < 0.3) {
                    material.emissive.setHex(0x000000);
                    material.emissiveIntensity = 0;
                }
            }

            // Apply new hover if not already highlighted
            if (keyObj.label !== interactionState.selectedModifier) {
                const material = keyObj.mesh.material;
                if (material.emissiveIntensity < 0.3) {
                    material.emissive.setHex(0xffffff);
                    material.emissiveIntensity = 0.2;
                }
            }

            interactionState.hoveredKey = keyObj;
        }
    } else {
        renderer.style.cursor = 'default';

        // Reset hover
        if (interactionState.hoveredKey &&
            interactionState.hoveredKey.label !== interactionState.selectedModifier) {
            const material = interactionState.hoveredKey.mesh.material;
            if (material.emissiveIntensity < 0.3) {
                material.emissive.setHex(0x000000);
                material.emissiveIntensity = 0;
            }
        }
        interactionState.hoveredKey = null;
    }
}

/**
 * Setup all interaction event listeners
 * @param {THREE.Camera} camera - The camera
 * @param {HTMLElement} renderer - The renderer DOM element
 */
export function setupInteractions(camera, renderer) {
    initRaycaster();

    // Click handler
    renderer.addEventListener('click', (event) => {
        handleClick(event, camera);
    });

    // Mouse move handler
    renderer.addEventListener('mousemove', (event) => {
        handleMouseMove(event, camera, renderer);
    });

    // Close button handler
    const closeBtn = document.querySelector('#combinations-panel .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deselectModifier();
        });
    }

    console.log('Interactions initialized - click on modifier keys (Ctrl, Shift, Alt, GUI) to see combinations!');
}
