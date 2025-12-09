// Keymap data configuration
// This file loads the actual ZMK configuration first, then falls back to defaults

import { loadKeymapFromZMK } from "./zmk-parser.js";

// Default fallback keymap (matches current detun.keymap structure)
// This is used if the ZMK config can't be loaded
export const defaultKeymap = [
  // Row 1 (top)
  ["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "BSPC"],
  // Row 2
  ["CTRL", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
  // Row 3
  ["SHFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "ESC"],
  // Row 4 (thumb keys padded)
  ["✕", "✕", "GUI", "L1", "SPC", "✕", "✕", "ENT", "L2", "ALT", "✕", "✕"],
  // Row 5 (empty for this layout)
  ["✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕"],
];

// Current active keymap (will be loaded from ZMK or use default)
export let keymap = defaultKeymap;

// Layer data (populated when loaded from ZMK)
export let layers = {};
export let currentLayerName = "default";

// Track modifications to the keymap
export let keymapModifications = {};
export let hasModifications = false;

// Default color for all keys
export const defaultKeyColor = 0xf5e6d3; // Cream colored (like nice PBT keycaps)

// Per-key color storage: { "layer:row:col": hexColor }
export const keyColors = {};

// Load custom colors from JSON file via backend
async function loadCustomColors() {
  try {
    const response = await fetch('/api/key-colors');
    if (response.ok) {
      const customColors = await response.json();
      // Clear and update in-place
      Object.keys(keyColors).forEach(key => delete keyColors[key]);
      Object.assign(keyColors, customColors);
      console.log("✅ Loaded custom key colors from file");
      return true;
    } else if (response.status === 404) {
      console.log("📝 No saved colors found, using defaults");
      return false;
    }
  } catch (error) {
    console.warn("⚠️  Failed to load custom colors:", error);
  }
  return false;
}

// Initialize colors on module load (async)
export const colorsLoadedPromise = loadCustomColors();

// Key combinations data
export const keyCombinations = {
  CTRL: [
    { key: "C", description: "Copy selected text" },
    { key: "V", description: "Paste clipboard content" },
    { key: "X", description: "Cut selected text" },
    { key: "Z", description: "Undo last action" },
    { key: "Y", description: "Redo last undone action" },
    { key: "A", description: "Select all" },
    { key: "F", description: "Find in page" },
    { key: "S", description: "Save file" },
    { key: "W", description: "Close tab/window" },
    { key: "T", description: "New tab" },
    { key: "N", description: "New window" },
    { key: "P", description: "Print" },
    { key: "R", description: "Refresh page" },
    { key: "Q", description: "Quit application" },
    { key: "O", description: "Open file" },
    { key: "L", description: "Focus address bar" },
    { key: "[", description: "Decrease font size" },
    { key: "]", description: "Increase font size" },
    { key: "/", description: "Toggle comment" },
  ],
  SHFT: [
    { key: "Q-Z", description: "Capital letters" },
    { key: "1", description: "! (exclamation)" },
    { key: "2", description: "@ (at sign)" },
    { key: "3", description: "# (hash)" },
    { key: "4", description: "$ (dollar)" },
    { key: "5", description: "% (percent)" },
    { key: "6", description: "^ (caret)" },
    { key: "7", description: "& (ampersand)" },
    { key: "8", description: "* (asterisk)" },
    { key: "9", description: "( (left paren)" },
    { key: "0", description: ") (right paren)" },
    { key: "-", description: "_ (underscore)" },
    { key: "=", description: "+ (plus)" },
    { key: "[", description: "{ (left brace)" },
    { key: "]", description: "} (right brace)" },
    { key: "\\", description: "| (pipe)" },
    { key: ";", description: ": (colon)" },
    { key: "'", description: '" (double quote)' },
    { key: ",", description: "< (less than)" },
    { key: ".", description: "> (greater than)" },
    { key: "/", description: "? (question mark)" },
  ],
  GUI: [
    { key: "TAB", description: "Switch applications" },
    { key: "SPC", description: "Spotlight search (macOS) / App launcher" },
    { key: "L", description: "Lock screen" },
    { key: "D", description: "Show desktop" },
    { key: "E", description: "File explorer" },
    { key: "R", description: "Run command" },
    { key: "1-9", description: "Switch to workspace/desktop" },
    { key: "←", description: "Snap window left" },
    { key: "→", description: "Snap window right" },
    { key: "↑", description: "Maximize window" },
    { key: "↓", description: "Minimize window" },
    { key: "Q", description: "Quick settings" },
    { key: "A", description: "Action center" },
    { key: "I", description: "Settings" },
  ],
  ALT: [
    { key: "TAB", description: "Switch between windows" },
    { key: "F4", description: "Close current window" },
    { key: "←", description: "Navigate back" },
    { key: "→", description: "Navigate forward" },
    { key: "ESC", description: "Cancel/Close dialog" },
    { key: "ENT", description: "Open properties" },
    { key: "SPC", description: "Open window menu" },
    { key: "F", description: "Open File menu" },
    { key: "E", description: "Open Edit menu" },
    { key: "V", description: "Open View menu" },
    { key: "H", description: "Open Help menu" },
  ],
};

/**
 * Initialize keymap data from ZMK config
 * This is called on app startup
 */
export async function initKeymapData() {
  console.log("🎹 Initializing keymap data...");
  console.log("📂 Attempting to load from ZMK config files");

  try {
    const zmkData = await loadKeymapFromZMK();

    if (zmkData && zmkData.keymap) {
      // Successfully loaded from ZMK
      keymap = zmkData.keymap;
      layers = zmkData.layers;
      currentLayerName = zmkData.defaultLayerName;

      console.log("✅ Loaded keymap from ZMK config");
      console.log("📋 Active layer:", currentLayerName);
      console.log("🗂️  Available layers:", Object.keys(layers).join(", "));

      return {
        success: true,
        source: "zmk",
        keymap: keymap,
        layers: layers,
        currentLayer: currentLayerName,
      };
    } else {
      throw new Error("Failed to parse ZMK config");
    }
  } catch (error) {
    console.warn("⚠️  Could not load ZMK config:", error.message);
    console.log("📦 Using default fallback keymap");

    // Use default fallback
    keymap = defaultKeymap;
    layers = {
      default: {
        name: "default",
        displayName: "Default Layer",
        keys: [],
      },
    };

    return {
      success: false,
      source: "default",
      keymap: keymap,
      layers: layers,
      currentLayer: "default",
      error: error.message,
    };
  }
}

/**
 * Get current keymap
 */
export function getKeymap() {
  return keymap;
}

/**
 * Get all layers
 */
export function getLayers() {
  return layers;
}

/**
 * Get current layer name
 */
export function getCurrentLayerName() {
  return currentLayerName;
}

/**
 * Switch to a different layer
 */
export function switchLayer(layerName) {
  if (layers[layerName]) {
    currentLayerName = layerName;

    // Update the keymap to show this layer
    if (layers[layerName].keymap) {
      keymap = layers[layerName].keymap;
    }

    console.log("🔄 Switched to layer:", layerName);
    return true;
  }
  console.warn("⚠️  Layer not found:", layerName);
  return false;
}

/**
 * Update a key label at a specific position in the current layer
 * @param {number} row - Row index (0-4)
 * @param {number} col - Column index (0-11)
 * @param {string} newLabel - New label for the key
 */
export function updateKeyLabel(row, col, newLabel) {
  return updateKeyLabelInLayer(currentLayerName, row, col, newLabel);
}

/**
 * Update a key label at a specific position in a specific layer
 * @param {string} layerName - Layer name
 * @param {number} row - Row index (0-4)
 * @param {number} col - Column index (0-11)
 * @param {string} newLabel - New label for the key
 */
export function updateKeyLabelInLayer(layerName, row, col, newLabel) {
  // Check if layer exists
  if (!layers[layerName]) {
    console.warn(`⚠️  Layer not found: ${layerName}`);
    return false;
  }

  const layerKeymap = layers[layerName].keymap;
  
  if (row >= 0 && row < layerKeymap.length && col >= 0 && col < layerKeymap[row].length) {
    const oldLabel = layerKeymap[row][col];
    layerKeymap[row][col] = newLabel;

    // Update the main keymap if this is the current layer
    if (layerName === currentLayerName) {
      keymap[row][col] = newLabel;
    }

    // Track modification
    const key = `${layerName}:${row}:${col}`;
    keymapModifications[key] = {
      layer: layerName,
      row,
      col,
      oldLabel,
      newLabel,
      timestamp: Date.now(),
    };

    hasModifications = true;
    console.log(
      `✏️  Updated key at [${row},${col}] in layer ${layerName}: ${oldLabel} → ${newLabel}`,
    );
    return true;
  }
  console.warn(`⚠️  Invalid position: [${row},${col}]`);
  return false;
}

/**
 * Check if a key has been modified in the current layer
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean}
 */
export function isKeyModified(row, col) {
  return isKeyModifiedInLayer(currentLayerName, row, col);
}

/**
 * Check if a key has been modified in a specific layer
 * @param {string} layerName - Layer name
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean}
 */
export function isKeyModifiedInLayer(layerName, row, col) {
  const key = `${layerName}:${row}:${col}`;
  return keymapModifications.hasOwnProperty(key);
}

/**
 * Get all modifications as an object
 * @returns {Object}
 */
export function getModifications() {
  return {
    modifications: keymapModifications,
    hasChanges: hasModifications,
    currentLayer: currentLayerName,
    timestamp: Date.now(),
  };
}

/**
 * Export current keymap state as JSON
 * @returns {Object}
 */
export function exportKeymap() {
  return {
    keymap: keymap,
    layers: layers,
    currentLayer: currentLayerName,
    modifications: keymapModifications,
    hasModifications: hasModifications,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Reset all modifications
 */
export function resetModifications() {
  keymapModifications = {};
  hasModifications = false;
  console.log("🔄 Reset all modifications");
}

/**
 * Update key color for a specific position
 * @param {string} layerName - Layer name
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} color - Hex color code
 */
export function updateKeyColor(layerName, row, col, color) {
  const key = `${row}:${col}`;
  keyColors[key] = color;
  console.log(
    `🎨 Updated key [${row}:${col}] color to #${color.toString(16).padStart(6, "0")} (applies to all layers)`,
  );
  return true;
}

/**
 * Get key color for a specific position
 * @param {string} layerName - Layer name
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {number} - Hex color code
 */
export function getKeyColorAt(layerName, row, col) {
  const key = `${row}:${col}`;
  return keyColors[key] !== undefined ? keyColors[key] : defaultKeyColor;
}

/**
 * Clear key color for a specific position (revert to default)
 * @param {string} layerName - Layer name
 * @param {number} row - Row index
 * @param {number} col - Column index
 */
export function clearKeyColor(layerName, row, col) {
  const key = `${row}:${col}`;
  delete keyColors[key];
  console.log(`🎨 Cleared color for key [${row}:${col}] (applies to all layers)`);
  return true;
}

/**
 * Save current colors to JSON file via backend
 */
export async function saveCustomColors() {
  try {
    const response = await fetch('/api/key-colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keyColors),
    });
    
    if (response.ok) {
      console.log("💾 Saved custom key colors to file");
      return true;
    } else {
      const error = await response.text();
      console.error("❌ Failed to save colors:", error);
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to save colors:", error);
    return false;
  }
}

/**
 * Reset colors to default (clear all custom colors)
 */
export async function resetColorsToDefault() {
  // Clear all custom colors
  Object.keys(keyColors).forEach(key => delete keyColors[key]);
  try {
    const response = await fetch('/api/key-colors', {
      method: 'DELETE',
    });
    
    if (response.ok) {
      console.log("🔄 Reset colors to default");
      return true;
    } else {
      console.warn("⚠️  Failed to clear saved colors");
      return false;
    }
  } catch (error) {
    console.warn("⚠️  Failed to clear saved colors:", error);
    return false;
  }
}

/**
 * Get all custom key colors
 */
export function getKeyColors() {
  return { ...keyColors };
}

/**
 * Get default key color
 */
export function getDefaultKeyColor() {
  return defaultKeyColor;
}
