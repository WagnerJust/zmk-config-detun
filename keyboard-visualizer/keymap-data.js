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

// Key color mapping
export const keyColors = {
  letters: 0x4caf50, // Green
  numbers: 0x2196f3, // Blue
  modifiers: 0xff9800, // Orange
  navigation: 0xf44336, // Red
  special: 0x9c27b0, // Purple
  layerSwitch: 0x00bcd4, // Cyan
  empty: 0x424242, // Dark gray
};

// Key type classification
export const keyTypes = {
  letters: "QWERTYUIOPASDFGHJKLZXCVBNM",
  numbers: "1234567890",
  modifiers: ["CTRL", "GUI", "ALT", "SHFT", "TAB", "CAPS", "ESC"],
  navigation: [
    "BSPC",
    "ENT",
    "SPC",
    "←",
    "→",
    "↑",
    "↓",
    "HOME",
    "END",
    "PGUP",
    "PGDN",
  ],
  layerSwitch: [
    "L0",
    "L1",
    "L2",
    "L3",
    "LT0",
    "LT1",
    "LT2",
    "LT3",
    "TO0",
    "TO1",
    "TO2",
    "TO3",
  ],
  empty: ["✕", "▽"],
};

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
 * Update a key label at a specific position
 * @param {number} row - Row index (0-4)
 * @param {number} col - Column index (0-11)
 * @param {string} newLabel - New label for the key
 */
export function updateKeyLabel(row, col, newLabel) {
  if (row >= 0 && row < keymap.length && col >= 0 && col < keymap[row].length) {
    const oldLabel = keymap[row][col];
    keymap[row][col] = newLabel;

    // Track modification
    const key = `${currentLayerName}:${row}:${col}`;
    keymapModifications[key] = {
      layer: currentLayerName,
      row,
      col,
      oldLabel,
      newLabel,
      timestamp: Date.now(),
    };

    hasModifications = true;
    console.log(
      `✏️  Updated key at [${row},${col}]: ${oldLabel} → ${newLabel}`,
    );
    return true;
  }
  console.warn(`⚠️  Invalid position: [${row},${col}]`);
  return false;
}

/**
 * Check if a key has been modified
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean}
 */
export function isKeyModified(row, col) {
  const key = `${currentLayerName}:${row}:${col}`;
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
