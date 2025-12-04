// Utility functions for the keyboard visualizer

import { keyColors } from "./keymap-data.js";

/**
 * Get the color for a key based on its label
 * @param {string} keyLabel - The label of the key
 * @returns {number} - Hex color code
 */
export function getKeyColor(keyLabel) {
  const letters = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const numbers = "1234567890";
  const modifiers = ["CTRL", "GUI", "ALT", "SHFT", "TAB", "CAPS", "ESC"];
  const navigation = [
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
  ];
  const layerSwitch = /^(L\d+|LT\d+|TO\d+)$/;
  const empty = ["✕", "▽"];
  const bluetooth = /^BT/;

  // Empty or transparent keys
  if (empty.includes(keyLabel)) {
    return keyColors.empty;
  }

  // Layer switch keys
  if (layerSwitch.test(keyLabel)) {
    return keyColors.layerSwitch;
  }

  // Bluetooth keys
  if (bluetooth.test(keyLabel)) {
    return keyColors.special;
  }

  if (letters.includes(keyLabel)) {
    return keyColors.letters;
  } else if (numbers.includes(keyLabel)) {
    return keyColors.numbers;
  } else if (modifiers.includes(keyLabel)) {
    return keyColors.modifiers;
  } else if (navigation.includes(keyLabel)) {
    return keyColors.navigation;
  } else {
    return keyColors.special;
  }
}

/**
 * Check if a key is a modifier key
 * @param {string} keyLabel - The label of the key
 * @returns {boolean}
 */
export function isModifierKey(keyLabel) {
  return ["CTRL", "GUI", "ALT", "SHFT"].includes(keyLabel);
}

/**
 * Check if a key is a layer switch key
 * @param {string} keyLabel - The label of the key
 * @returns {boolean}
 */
export function isLayerKey(keyLabel) {
  return /^(L\d+|LT\d+|TO\d+)$/.test(keyLabel);
}

/**
 * Check if a key is empty or transparent
 * @param {string} keyLabel - The label of the key
 * @returns {boolean}
 */
export function isEmptyKey(keyLabel) {
  return ["✕", "▽"].includes(keyLabel);
}

/**
 * Get key type classification
 * @param {string} keyLabel - The label of the key
 * @returns {string} - Type of key (letters, numbers, modifiers, navigation, layer, empty, special)
 */
export function getKeyType(keyLabel) {
  const letters = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const numbers = "1234567890";
  const modifiers = ["CTRL", "GUI", "ALT", "SHFT", "TAB", "CAPS", "ESC"];
  const navigation = [
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
  ];

  if (isEmptyKey(keyLabel)) return "empty";
  if (isLayerKey(keyLabel)) return "layer";
  if (letters.includes(keyLabel)) return "letters";
  if (numbers.includes(keyLabel)) return "numbers";
  if (modifiers.includes(keyLabel)) return "modifiers";
  if (navigation.includes(keyLabel)) return "navigation";
  return "special";
}

/**
 * Create a text texture for key labels
 * @param {string} text - Text to render
 * @param {number} fontSize - Font size (default: 80)
 * @returns {THREE.CanvasTexture}
 */
export function createTextTexture(text, fontSize = 80) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 256;

  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Adjust font size for longer labels
  const adjustedFontSize = text.length > 2 ? fontSize * 0.625 : fontSize;
  context.font = `bold ${adjustedFontSize}px Arial`;
  context.fillText(text, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Normalize key label for comparison
 * @param {string} keyLabel - The label to normalize
 * @returns {string}
 */
export function normalizeKeyLabel(keyLabel) {
  return keyLabel.toUpperCase().trim();
}

/**
 * Create element with classes and content
 * @param {string} tag - HTML tag name
 * @param {string[]} classes - Array of class names
 * @param {string} content - Inner HTML content
 * @returns {HTMLElement}
 */
export function createElement(tag, classes = [], content = "") {
  const element = document.createElement(tag);
  if (classes.length > 0) {
    element.className = classes.join(" ");
  }
  if (content) {
    element.innerHTML = content;
  }
  return element;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Time (0-1)
 * @returns {number}
 */
export function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

/**
 * Ease out cubic function
 * @param {number} t - Time (0-1)
 * @returns {number}
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
