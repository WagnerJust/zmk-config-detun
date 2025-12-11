// Interactions module - Handles user interactions with the keyboard

import { isModifierKey } from "./utils.js";
import {
  keyObjects,
  resetAllKeys,
  highlightKey,
  dimKey,
  selectKey,
  updateKeyLabel as updateKeyMesh,
  findKeyByPosition,
  markKeyAsModified,
  updateAllKeyLabels,
} from "./keyboard.js";
import {
  keyCombinations,
  updateKeyLabel,
  updateKeyLabelInLayer,
  isKeyModified,
  isKeyModifiedInLayer,
  getKeymap,
  toggleShift,
  toggleCaps,
  isShiftKey,
  isCapsKey,
  getShiftState,
} from "./keymap-data.js";

// Import color mode state
let isColorModeActive = () => false;

/**
 * Set color mode checker function
 */
export function setColorModeChecker(checkerFn) {
  isColorModeActive = checkerFn;
}

/**
 * Interaction state
 */
export const interactionState = {
  selectedModifier: null,
  hoveredKey: null,
  raycaster: null,
  mouse: null,
  editMode: false,
  editingKey: null,
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
  const keyMeshes = keyObjects.map((obj) => obj.mesh);
  const intersects = interactionState.raycaster.intersectObjects(keyMeshes);

  if (intersects.length > 0) {
    const intersectedMesh = intersects[0].object;
    return keyObjects.find((obj) => obj.mesh === intersectedMesh);
  }

  return null;
}

/**
 * Handle key click
 * @param {Object} keyObj - The clicked key object
 */
function handleKeyClick(keyObj) {
  const keyLabel = keyObj.label;
  const baseLabel = keyObj.mesh.userData.baseLabel || keyLabel;

  // If in edit mode, open edit panel
  if (interactionState.editMode) {
    openEditPanel(keyObj);
    return;
  }

  // Check if it's SHIFT key
  if (isShiftKey(baseLabel)) {
    const shiftActive = toggleShift();
    updateAllKeyLabels();
    
    if (shiftActive) {
      highlightKey(keyObj, 0x4caf50, 0.5);
    } else {
      resetAllKeys();
    }
    return;
  }

  // Check if it's CAPS key
  if (isCapsKey(baseLabel)) {
    const capsActive = toggleCaps();
    updateAllKeyLabels();
    
    if (capsActive) {
      highlightKey(keyObj, 0xff9800, 0.5);
    } else {
      resetAllKeys();
    }
    return;
  }

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
  
  // Preserve shift/caps highlighting
  const shiftState = getShiftState();
  keyObjects.forEach((obj) => {
    const baseLabel = obj.mesh.userData.baseLabel || obj.label;
    if (shiftState.shiftActive && isShiftKey(baseLabel)) {
      highlightKey(obj, 0x4caf50, 0.5);
    } else if (shiftState.capsActive && isCapsKey(baseLabel)) {
      highlightKey(obj, 0xff9800, 0.5);
    }
  });

  // Set new selected modifier
  interactionState.selectedModifier = modifierLabel;

  // Find and keep the selected modifier key at normal color
  const modifierKey = keyObjects.find((obj) => obj.label === modifierLabel);

  // Get current layer's keymap
  const currentKeymap = getKeymap();
  
  // Build set of keys that exist in current layer
  const keysInLayer = new Set();
  keyObjects.forEach((obj) => {
    if (obj.label && obj.label !== "✕" && obj.label !== "▽") {
      keysInLayer.add(obj.label);
    }
  });

  // Get combinations for this modifier
  const combinations = keyCombinations[modifierLabel] || [];

  // Track keys that have combinations AND exist in current layer
  const comboKeys = new Set();
  comboKeys.add(modifierLabel);
  
  combinations.forEach((combo) => {
    if (combo.key === "Q-Z") {
      keyObjects.forEach((obj) => {
        const baseLabel = obj.mesh.userData.baseLabel || obj.label;
        const testLabel = baseLabel.toUpperCase();
        if (/^[A-Z]$/.test(testLabel) && (keysInLayer.has(testLabel) || keysInLayer.has(baseLabel))) {
          comboKeys.add(obj.label);
        }
      });
    } else if (combo.key === "1-9") {
      keyObjects.forEach((obj) => {
        if (/^[1-9]$/.test(obj.label) && keysInLayer.has(obj.label)) {
          comboKeys.add(obj.label);
        }
      });
    } else if (
      combo.key.includes("←") ||
      combo.key.includes("→") ||
      combo.key.includes("↑") ||
      combo.key.includes("↓")
    ) {
    } else {
      const key = keyObjects.find((obj) => {
        const baseLabel = obj.mesh.userData.baseLabel || obj.label;
        return combo.key === baseLabel.toUpperCase() || combo.key === baseLabel;
      });
      if (key && (keysInLayer.has(combo.key) || keysInLayer.has(key.label))) {
        comboKeys.add(key.label);
      }
    }
  });

  keyObjects.forEach((obj) => {
    if (!comboKeys.has(obj.label)) {
      const baseLabel = obj.mesh.userData.baseLabel || obj.label;
      if (!(shiftState.shiftActive && isShiftKey(baseLabel)) && 
          !(shiftState.capsActive && isCapsKey(baseLabel))) {
        dimKey(obj, 0.3);
      }
    }
  });

  updateCombinationsPanel(modifierLabel, combinations);
}

/**
 * Deselect current modifier
 */
function deselectModifier() {
  interactionState.selectedModifier = null;
  resetAllKeys();
  
  const shiftState = getShiftState();
  keyObjects.forEach((obj) => {
    const baseLabel = obj.mesh.userData.baseLabel || obj.label;
    if (shiftState.shiftActive && isShiftKey(baseLabel)) {
      highlightKey(obj, 0x4caf50, 0.5);
    } else if (shiftState.capsActive && isCapsKey(baseLabel)) {
      highlightKey(obj, 0xff9800, 0.5);
    }
  });
  
  hideCombinationsPanel();
}

/**
 * Update the combinations panel UI
 * @param {string} modifierLabel - The modifier label
 * @param {Array} combinations - Array of combination objects
 */
function updateCombinationsPanel(modifierLabel, combinations) {
  const panel = document.getElementById("combinations-panel");
  const header = panel.querySelector("h2");
  const list = document.getElementById("combinations-list");

  // Update header
  header.textContent = `${modifierLabel} Combinations`;

  // Clear previous combinations
  list.innerHTML = "";

  // Add combinations
  if (combinations.length === 0) {
    list.innerHTML =
      '<p style="color: rgba(255,255,255,0.6); font-style: italic;">No combinations defined</p>';
  } else {
    combinations.forEach((combo) => {
      const item = document.createElement("div");
      item.className = "combination-item";

      const keys = document.createElement("div");
      keys.className = "combination-keys";
      keys.textContent = `${modifierLabel} + ${combo.key}`;

      const description = document.createElement("div");
      description.className = "combination-description";
      description.textContent = combo.description;

      item.appendChild(keys);
      item.appendChild(description);
      list.appendChild(item);
    });
  }

  // Show panel
  panel.classList.add("active");
}

/**
 * Hide the combinations panel
 */
function hideCombinationsPanel() {
  const panel = document.getElementById("combinations-panel");
  panel.classList.remove("active");
}

/**
 * Handle mouse click event
 * @param {MouseEvent} event - Mouse event
 * @param {THREE.Camera} camera - The camera
 */
export function handleClick(event, camera) {
  // Don't handle clicks in color mode - let color-customization handle it
  if (isColorModeActive()) {
    return;
  }
  
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

  if (keyObj) {
    // In color mode or edit mode, all keys are clickable
    const isClickable =
      isColorModeActive() || interactionState.editMode || isModifierKey(keyObj.label);

    // Update cursor style
    if (isClickable) {
      renderer.style.cursor = "pointer";

      // Slight highlight on hover if not selected
      if (interactionState.hoveredKey !== keyObj) {
        // Reset previous hover
        if (
          interactionState.hoveredKey &&
          interactionState.hoveredKey.label !==
            interactionState.selectedModifier
        ) {
          // Only reset if not part of current selection or modified
          const material = interactionState.hoveredKey.mesh.material;
          if (material.emissiveIntensity < 0.3 || interactionState.editMode) {
            const layerName = interactionState.hoveredKey.layerName || "default";
            if (!isKeyModifiedInLayer(layerName, interactionState.hoveredKey.row, interactionState.hoveredKey.col)) {
              material.emissive.setHex(0x000000);
              material.emissiveIntensity = 0;
            } else {
              material.emissive.setHex(0xff9800);
              material.emissiveIntensity = 0.3;
            }
          }
        }

        // Apply new hover if not already highlighted
        if (keyObj.label !== interactionState.selectedModifier) {
          const material = keyObj.mesh.material;
          if (material.emissiveIntensity < 0.5 || interactionState.editMode) {
            material.emissive.setHex(
              interactionState.editMode ? 0x4caf50 : 0xffffff,
            );
            material.emissiveIntensity = 0.2;
          }
        }

        interactionState.hoveredKey = keyObj;
      }
    } else {
      renderer.style.cursor = "default";
    }
  } else {
    renderer.style.cursor = "default";

    // Reset hover
    if (
      interactionState.hoveredKey &&
      interactionState.hoveredKey.label !== interactionState.selectedModifier
    ) {
      const material = interactionState.hoveredKey.mesh.material;
      if (material.emissiveIntensity < 0.3 || interactionState.editMode) {
        const layerName = interactionState.hoveredKey.layerName || "default";
        if (!isKeyModifiedInLayer(layerName, interactionState.hoveredKey.row, interactionState.hoveredKey.col)) {
          material.emissive.setHex(0x000000);
          material.emissiveIntensity = 0;
        } else {
          material.emissive.setHex(0xff9800);
          material.emissiveIntensity = 0.3;
        }
      }
    }
    interactionState.hoveredKey = null;
  }
}

/**
 * Toggle edit mode
 */
export function toggleEditMode() {
  interactionState.editMode = !interactionState.editMode;

  if (interactionState.editMode) {
    deselectModifier();
    console.log("✏️  Edit mode enabled - click any key to edit");
  } else {
    console.log("👁️  View mode enabled");
  }

  return interactionState.editMode;
}

/**
 * Check if edit mode is active
 */
export function isEditModeActive() {
  return interactionState.editMode;
}

/**
 * Open the edit panel for a key
 */
function openEditPanel(keyObj) {
  interactionState.editingKey = keyObj;

  const panel = document.getElementById("edit-panel");
  const positionEl = document.getElementById("edit-position");
  const labelInput = document.getElementById("edit-label");

  // Update panel content
  const side = keyObj.col < 6 ? "Left" : "Right";
  const displayCol = keyObj.col < 6 ? keyObj.col : keyObj.col - 6;
  const layerName = keyObj.layerName || "default";
  const layerDisplay = layerName.charAt(0).toUpperCase() + layerName.slice(1);
  positionEl.textContent = `Layer: ${layerDisplay} | ${side} - Row ${keyObj.row + 1}, Col ${displayCol + 1}`;
  labelInput.value = keyObj.label;

  // Show panel
  panel.classList.add("active");
  labelInput.focus();
  labelInput.select();

  // Highlight the key being edited
  selectKey(keyObj);
}

/**
 * Close the edit panel
 */
function closeEditPanel() {
  const panel = document.getElementById("edit-panel");
  panel.classList.remove("active");

  if (interactionState.editingKey) {
    resetAllKeys();
    interactionState.editingKey = null;
  }
}

/**
 * Save the edited key
 */
function saveEditedKey() {
  if (!interactionState.editingKey) return;

  const keyObj = interactionState.editingKey;
  const labelInput = document.getElementById("edit-label");
  const newLabel = labelInput.value.trim().toUpperCase();

  if (!newLabel) {
    alert("Key label cannot be empty");
    return;
  }

  // Determine which layer to update
  const layerName = keyObj.layerName || "default";

  // Update the keymap data for the specific layer
  updateKeyLabelInLayer(layerName, keyObj.row, keyObj.col, newLabel);

  // Update the visual key
  updateKeyMesh(keyObj, newLabel);

  // Mark as modified
  markKeyAsModified(keyObj);

  // Close panel
  closeEditPanel();

  console.log(`✅ Key updated to: ${newLabel} in layer ${layerName}`);
}

/**
 * Setup all interaction event listeners
 * @param {THREE.Camera} camera - The camera
 * @param {HTMLElement} renderer - The renderer DOM element
 */
export function setupInteractions(camera, renderer) {
  initRaycaster();

  // Click handler
  renderer.addEventListener("click", (event) => {
    handleClick(event, camera);
  });

  // Mouse move handler
  renderer.addEventListener("mousemove", (event) => {
    handleMouseMove(event, camera, renderer);
  });

  // Close button handler for combinations panel
  const combosCloseBtn = document.querySelector(
    "#combinations-panel .close-btn",
  );
  if (combosCloseBtn) {
    combosCloseBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      deselectModifier();
    });
  }

  // Edit panel handlers
  const editCloseBtn = document.querySelector("#edit-panel .close-btn");
  if (editCloseBtn) {
    editCloseBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      closeEditPanel();
    });
  }

  const saveBtn = document.getElementById("save-key");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveEditedKey);
  }

  const cancelBtn = document.getElementById("cancel-edit");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeEditPanel);
  }

  // Quick key buttons
  const quickKeyBtns = document.querySelectorAll(".quick-key");
  quickKeyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const labelInput = document.getElementById("edit-label");
      labelInput.value = btn.dataset.value;
      labelInput.focus();
    });
  });

  // Enter key to save in edit panel
  const labelInput = document.getElementById("edit-label");
  if (labelInput) {
    labelInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveEditedKey();
      } else if (event.key === "Escape") {
        closeEditPanel();
      }
    });
  }

  console.log(
    "Interactions initialized - click on modifier keys (Ctrl, Shift, Alt, GUI) to see combinations!",
  );
}

/**
 * Get intersected key for external use (e.g., color customization)
 * @param {MouseEvent} event - Mouse event
 * @param {THREE.Camera} camera - The camera
 * @returns {Object|null} - Key object or null
 */
export function getIntersectedKeyFromEvent(event, camera) {
  updateMousePosition(event);
  return getIntersectedKey(camera);
}
