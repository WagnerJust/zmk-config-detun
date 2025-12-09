// Per-key color customization module for keyboard visualizer

console.log("🎨 Per-key color customization module loaded");

import {
  updateKeyColor,
  clearKeyColor,
  saveCustomColors,
  resetColorsToDefault,
  getDefaultKeyColor,
} from "./keymap-data.js";
import { keyObjects } from "./keyboard.js";
import { 
  getIntersectedKeyFromEvent,
  setColorModeChecker 
} from "./interactions.js";

/**
 * Selected keys for multi-selection
 */
const selectedKeys = new Set();
let colorPickerElement = null;
let colorPickerTarget = null;

/**
 * Initialize color customization UI
 */
export function initColorCustomization(rebuildCallback) {
  console.log("🎨 Initializing per-key color customization...");

  // Create floating color picker
  createColorPicker();

  // Setup color customization controls
  setupColorControls(rebuildCallback);

  // Register color mode checker with interactions
  setColorModeChecker(isColorModeActive);

  console.log("🎨 Per-key color customization initialized");
}

/**
 * Create floating color picker element
 */
function createColorPicker() {
  colorPickerElement = document.createElement("div");
  colorPickerElement.id = "key-color-picker";
  colorPickerElement.className = "key-color-picker";
  colorPickerElement.innerHTML = `
    <div class="color-picker-header" style="cursor: move;">
      <span class="color-picker-title">Key Color</span>
      <button type="button" class="color-picker-close">×</button>
    </div>
    <div class="color-picker-body">
      <div class="color-palette">
        <button class="color-option" data-color="#2c2c2c" style="background: #2c2c2c;" title="Black"></button>
        <button class="color-option" data-color="#f5e6d3" style="background: #f5e6d3;" title="Cream"></button>
        <button class="color-option" data-color="#87ceeb" style="background: #87ceeb;" title="Sky Blue"></button>
        <button class="color-option" data-color="#7dd3c0" style="background: #7dd3c0;" title="Mint"></button>
        <button class="color-option" data-color="#f4e57e" style="background: #f4e57e;" title="Yellow"></button>
        <button class="color-option" data-color="#f5a3b5" style="background: #f5a3b5;" title="Pink"></button>
        <button class="color-option" data-color="#b8a7d9" style="background: #b8a7d9;" title="Lavender"></button>
        <button class="color-option" data-color="#7e6db5" style="background: #7e6db5;" title="Purple"></button>
      </div>
      <div class="color-picker-actions">
        <button id="clear-key-color" class="btn btn-small btn-secondary">Reset to Default</button>
      </div>
      <div class="color-picker-info">
        <small>Selected keys: <span id="selected-count">0</span></small>
        <small>Shift+Click to select multiple</small>
      </div>
    </div>
  `;
  
  colorPickerElement.style.display = "none";
  document.body.appendChild(colorPickerElement);

  // Make draggable
  makeDraggable(colorPickerElement);

  // Close button
  const closeBtn = colorPickerElement.querySelector(".color-picker-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideColorPicker();
    });
  } else {
    console.error("❌ Color picker close button not found!");
  }

  // Color option buttons
  const colorOptions = colorPickerElement.querySelectorAll(".color-option");
  colorOptions.forEach(btn => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      applyColorToSelectedKeys(color);
    });
  });

  // Clear color button
  const clearBtn = document.getElementById("clear-key-color");
  clearBtn.addEventListener("click", clearColorFromSelectedKeys);

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && colorPickerElement.style.display !== "none") {
      hideColorPicker();
    }
  });
}

/**
 * Make an element draggable by its header
 * @param {HTMLElement} element - The element to make draggable
 */
function makeDraggable(element) {
  const header = element.querySelector(".color-picker-header");
  if (!header) return;

  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  function dragStart(e) {
    // Don't drag if clicking the close button
    if (e.target.classList.contains("color-picker-close")) {
      return;
    }

    // Get initial position
    const rect = element.getBoundingClientRect();
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;

    isDragging = true;
    element.style.cursor = "move";
  }

  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();

    // Calculate new position
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    // Keep within viewport bounds
    const elementRect = element.getBoundingClientRect();
    const maxX = window.innerWidth - elementRect.width;
    const maxY = window.innerHeight - elementRect.height;

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    // Remove transform and use absolute positioning
    element.style.transform = "none";
    element.style.left = currentX + "px";
    element.style.top = currentY + "px";
  }

  function dragEnd() {
    isDragging = false;
    element.style.cursor = "";
  }
}

/**
 * Setup color customization controls
 */
function setupColorControls(rebuildCallback) {
  const colorSettingsToggle = document.getElementById("color-settings-toggle");
  
  if (!colorSettingsToggle) {
    console.error("❌ Color settings toggle button not found!");
    return;
  }

  // Change the button text to reflect new functionality
  colorSettingsToggle.textContent = "Paint Keys";

  // Toggle color mode
  colorSettingsToggle.addEventListener("click", () => {
    toggleColorMode(rebuildCallback);
  });

  // Add reset all colors option to info panel
  addResetColorButton(rebuildCallback);
}

/**
 * Toggle color customization mode
 */
let isColorMode = false;

function toggleColorMode(rebuildCallback) {
  isColorMode = !isColorMode;
  const toggleBtn = document.getElementById("color-settings-toggle");

  if (isColorMode) {
    toggleBtn.textContent = "Exit Paint Mode";
    toggleBtn.style.background = "#ff9800";
    showColorModeInstructions();
    enableKeyColorSelection();
  } else {
    toggleBtn.textContent = "Paint Keys";
    toggleBtn.style.background = "";
    hideColorModeInstructions();
    disableKeyColorSelection();
    hideColorPicker();
    clearSelection();
  }
}

/**
 * Show color mode instructions
 */
function showColorModeInstructions() {
  const interactiveHelp = document.getElementById("interactive-help");
  if (interactiveHelp) {
    interactiveHelp.innerHTML = "🎨 Click keys to paint them!<br><small>Shift+Click for multiple</small>";
    interactiveHelp.style.color = "#ff9800";
  }
}

/**
 * Hide color mode instructions
 */
function hideColorModeInstructions() {
  const interactiveHelp = document.getElementById("interactive-help");
  if (interactiveHelp) {
    interactiveHelp.textContent = "🖱️ Click modifier keys to see combinations!";
    interactiveHelp.style.color = "";
  }
}

/**
 * Enable key color selection on click
 */
function enableKeyColorSelection() {
  // Add click listeners to all key objects
  document.addEventListener("click", handleKeyColorClick);
}

/**
 * Disable key color selection
 */
function disableKeyColorSelection() {
  document.removeEventListener("click", handleKeyColorClick);
}

/**
 * Handle key click for color selection
 */
function handleKeyColorClick(event) {
  if (!isColorMode) return;

  // Use raycasting from interactions module
  if (!window.keyboardApp || !window.keyboardApp.camera) return;
  
  const clickedKey = getIntersectedKeyFromEvent(event, window.keyboardApp.camera);
  
  if (clickedKey) {
    if (event.shiftKey) {
      // Multi-select mode
      toggleKeySelection(clickedKey);
    } else {
      // Single select mode
      clearSelection();
      selectKey(clickedKey);
    }
    
    showColorPickerForSelection();
  }
}

/**
 * Toggle key selection
 */
function toggleKeySelection(keyObj) {
  const keyId = `${keyObj.layerName}:${keyObj.row}:${keyObj.col}`;
  
  if (selectedKeys.has(keyId)) {
    selectedKeys.delete(keyId);
    unhighlightKey(keyObj);
  } else {
    selectedKeys.add(keyId);
    highlightKey(keyObj);
  }
  
  updateSelectionCount();
}

/**
 * Select a single key
 */
function selectKey(keyObj) {
  const keyId = `${keyObj.layerName}:${keyObj.row}:${keyObj.col}`;
  selectedKeys.add(keyId);
  highlightKey(keyObj);
  updateSelectionCount();
}

/**
 * Clear all selections
 */
function clearSelection() {
  // Unhighlight all selected keys
  keyObjects.forEach(keyObj => {
    unhighlightKey(keyObj);
  });
  
  selectedKeys.clear();
  updateSelectionCount();
}

/**
 * Highlight a selected key
 */
function highlightKey(keyObj) {
  if (keyObj && keyObj.mesh) {
    keyObj.mesh.material.emissive.setHex(0xff9800);
    keyObj.mesh.material.emissiveIntensity = 0.3;
  }
}

/**
 * Unhighlight a key
 */
function unhighlightKey(keyObj) {
  if (keyObj && keyObj.mesh) {
    keyObj.mesh.material.emissive.setHex(0x000000);
    keyObj.mesh.material.emissiveIntensity = 0;
  }
}

/**
 * Update selection count display
 */
function updateSelectionCount() {
  const countElement = document.getElementById("selected-count");
  if (countElement) {
    countElement.textContent = selectedKeys.size;
  }
}

/**
 * Show color picker for current selection
 */
function showColorPickerForSelection() {
  if (selectedKeys.size === 0) return;
  
  // Get the first selected key to determine current color
  const firstKeyId = Array.from(selectedKeys)[0];
  const [layerName, row, col] = firstKeyId.split(":");
  
  const keyObj = keyObjects.find(
    ko => ko.layerName === layerName && 
          ko.row === parseInt(row) && 
          ko.col === parseInt(col)
  );
  
  if (keyObj && keyObj.mesh) {
    const currentColor = keyObj.mesh.material.color.getHex();
    const currentHex = `#${currentColor.toString(16).padStart(6, "0")}`;
    
    // Highlight the current color option if it matches
    const colorOptions = colorPickerElement.querySelectorAll(".color-option");
    colorOptions.forEach(btn => {
      if (btn.dataset.color.toLowerCase() === currentHex.toLowerCase()) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }
  
  // Only reset position to center if picker is currently hidden
  const isCurrentlyHidden = colorPickerElement.style.display === "none";
  if (isCurrentlyHidden) {
    colorPickerElement.style.transform = "translate(-50%, -50%)";
    colorPickerElement.style.left = "50%";
    colorPickerElement.style.top = "50%";
  }
  
  colorPickerElement.style.display = "block";
}

/**
 * Hide color picker
 */
function hideColorPicker() {
  if (colorPickerElement) {
    colorPickerElement.style.display = "none";
    clearSelection();
  }
}

/**
 * Apply color to selected keys
 * @param {string} hexColor - Hex color string (e.g., "#87ceeb")
 */
function applyColorToSelectedKeys(hexColor) {
  const colorValue = parseInt(hexColor.substring(1), 16);
  
  // Collect unique positions (row:col) from selected keys
  const positions = new Set();
  selectedKeys.forEach(keyId => {
    const [layerName, row, col] = keyId.split(":");
    positions.add(`${row}:${col}`);
  });
  
  // Apply color to all keys at these positions across ALL layers
  positions.forEach(position => {
    const [row, col] = position.split(":");
    updateKeyColor(null, parseInt(row), parseInt(col), colorValue);
    
    // Update ALL key meshes at this position in ALL layers
    keyObjects.forEach(keyObj => {
      if (keyObj.row === parseInt(row) && keyObj.col === parseInt(col)) {
        if (keyObj.mesh) {
          keyObj.mesh.material.color.setHex(colorValue);
          keyObj.mesh.material.needsUpdate = true;
          keyObj.mesh.userData.originalColor = colorValue;
          
          // Force material refresh
          if (keyObj.mesh.material.emissive) {
            keyObj.mesh.material.emissive.setHex(0x000000);
            keyObj.mesh.material.emissiveIntensity = 0;
          }
        }
      }
    });
  });
  
  // Save colors to file
  saveCustomColors().catch(error => {
    console.error("Failed to save colors:", error);
  });
  
  console.log(`🎨 Applied color ${hexColor} to ${positions.size} positions across all layers`);
}

/**
 * Clear color from selected keys (reset to default)
 */
async function clearColorFromSelectedKeys() {
  const defaultColor = getDefaultKeyColor();
  
  // Collect unique positions (row:col) from selected keys
  const positions = new Set();
  selectedKeys.forEach(keyId => {
    const [layerName, row, col] = keyId.split(":");
    positions.add(`${row}:${col}`);
  });
  
  // Clear color for all keys at these positions across ALL layers
  positions.forEach(position => {
    const [row, col] = position.split(":");
    clearKeyColor(null, parseInt(row), parseInt(col));
    
    // Update ALL key meshes at this position in ALL layers
    keyObjects.forEach(keyObj => {
      if (keyObj.row === parseInt(row) && keyObj.col === parseInt(col)) {
        if (keyObj.mesh) {
          keyObj.mesh.material.color.setHex(defaultColor);
          keyObj.mesh.material.needsUpdate = true;
          keyObj.mesh.userData.originalColor = defaultColor;
          
          // Force material refresh
          if (keyObj.mesh.material.emissive) {
            keyObj.mesh.material.emissive.setHex(0x000000);
            keyObj.mesh.material.emissiveIntensity = 0;
          }
        }
      }
    });
  });
  
  // Save colors to file
  try {
    await saveCustomColors();
    console.log(`🎨 Reset ${positions.size} positions to default color across all layers`);
  } catch (error) {
    console.error("Failed to save colors:", error);
  }
  
  // Clear selection after applying
  clearSelection();
  hideColorPicker();
}

/**
 * Add reset all colors button to UI
 */
function addResetColorButton(rebuildCallback) {
  const legend = document.querySelector(".legend");
  if (!legend) return;
  
  // Check if button already exists
  if (document.getElementById("reset-all-colors")) return;
  
  const resetBtn = document.createElement("button");
  resetBtn.id = "reset-all-colors";
  resetBtn.className = "btn-customize";
  resetBtn.textContent = "Reset All";
  resetBtn.style.marginTop = "10px";
  resetBtn.style.width = "100%";
  
  resetBtn.addEventListener("click", async () => {
    if (confirm("Reset all key colors to default? This cannot be undone.")) {
      try {
        await resetColorsToDefault();
        
        if (rebuildCallback) {
          rebuildCallback();
        }
        
        console.log("🔄 Reset all key colors");
        
        // Show feedback
        resetBtn.textContent = "✓ Reset!";
        resetBtn.style.background = "#4caf50";
        setTimeout(() => {
          resetBtn.textContent = "Reset All";
          resetBtn.style.background = "";
        }, 1500);
      } catch (error) {
        console.error("Failed to reset colors:", error);
        resetBtn.textContent = "✗ Failed";
        resetBtn.style.background = "#f44336";
        setTimeout(() => {
          resetBtn.textContent = "Reset All";
          resetBtn.style.background = "";
        }, 1500);
      }
    }
  });
  
  legend.appendChild(resetBtn);
}

/**
 * Check if color mode is active
 * @returns {boolean}
 */
export function isColorModeActive() {
  return isColorMode;
}