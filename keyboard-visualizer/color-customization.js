// Color customization module for keyboard visualizer

console.log("🎨 Color customization module loaded");

import {
  getKeyColors,
  getDefaultKeyColors,
  updateKeyColor,
  saveCustomColors,
  resetColorsToDefault,
} from "./keymap-data.js";
import { getKeyColor } from "./utils.js";

/**
 * Initialize color customization UI
 */
export function initColorCustomization(rebuildCallback) {
  console.log("🎨 Initializing color customization...");

  const colorSettingsToggle = document.getElementById("color-settings-toggle");
  const colorSettingsPanel = document.getElementById("color-settings-panel");

  if (!colorSettingsToggle) {
    console.error("❌ Color settings toggle button not found!");
    return;
  }

  if (!colorSettingsPanel) {
    console.error("❌ Color settings panel not found!");
    return;
  }

  const closeBtn = colorSettingsPanel.querySelector(".close-btn");
  const applyBtn = document.getElementById("apply-colors");
  const resetBtn = document.getElementById("reset-colors");

  if (!closeBtn || !applyBtn || !resetBtn) {
    console.error("❌ Color settings panel buttons not found!");
    return;
  }

  // Color inputs
  const colorInputs = {
    letters: document.getElementById("color-letters"),
    numbers: document.getElementById("color-numbers"),
    modifiers: document.getElementById("color-modifiers"),
    navigation: document.getElementById("color-navigation"),
    special: document.getElementById("color-special"),
    layerSwitch: document.getElementById("color-layerSwitch"),
    empty: document.getElementById("color-empty"),
  };

  // Check if all inputs exist
  const missingInputs = Object.entries(colorInputs).filter(([k, v]) => !v);
  if (missingInputs.length > 0) {
    console.error(
      "❌ Missing color inputs:",
      missingInputs.map(([k]) => k),
    );
    return;
  }

  // Load current colors into inputs
  loadCurrentColors(colorInputs);

  // Toggle panel visibility
  colorSettingsToggle.addEventListener("click", () => {
    console.log("🎨 Opening color settings panel");
    colorSettingsPanel.classList.add("active");
    loadCurrentColors(colorInputs);
  });

  // Close panel
  closeBtn.addEventListener("click", () => {
    console.log("🎨 Closing color settings panel");
    colorSettingsPanel.classList.remove("active");
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && colorSettingsPanel.classList.contains("active")) {
      colorSettingsPanel.classList.remove("active");
    }
  });

  // Apply colors
  applyBtn.addEventListener("click", () => {
    applyCustomColors(colorInputs);
    saveCustomColors();
    updateLegendColors();

    if (rebuildCallback) {
      rebuildCallback();
    }

    console.log("🎨 Colors applied successfully");

    // Show feedback
    const originalText = applyBtn.textContent;
    applyBtn.textContent = "Applied!";
    applyBtn.style.background = "rgba(76, 175, 80, 1)";
    setTimeout(() => {
      applyBtn.textContent = originalText;
      applyBtn.style.background = "";
    }, 1500);
  });

  // Reset colors
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all colors to default? This will reload the page.")) {
      resetColorsToDefault();
      location.reload();
    }
  });

  // Real-time preview on color change
  Object.entries(colorInputs).forEach(([type, input]) => {
    input.addEventListener("input", () => {
      const hexColor = input.value;
      updateLegendPreview(type, hexColor);
    });
  });

  // Initialize legend colors
  updateLegendColors();

  console.log("🎨 Color customization initialized");
}

/**
 * Load current colors into input fields
 * @param {Object} colorInputs - Object containing color input elements
 */
function loadCurrentColors(colorInputs) {
  const currentColors = getKeyColors();

  Object.entries(colorInputs).forEach(([type, input]) => {
    if (currentColors[type] !== undefined) {
      const hexColor = `#${currentColors[type].toString(16).padStart(6, "0")}`;
      input.value = hexColor;
    }
  });
}

/**
 * Apply custom colors from input fields
 * @param {Object} colorInputs - Object containing color input elements
 */
function applyCustomColors(colorInputs) {
  Object.entries(colorInputs).forEach(([type, input]) => {
    const hexColor = input.value;
    const colorValue = parseInt(hexColor.substring(1), 16);
    updateKeyColor(type, colorValue);
  });
}

/**
 * Update legend colors to match current settings
 */
function updateLegendColors() {
  const currentColors = getKeyColors();
  const legendItems = {
    letters: document.getElementById("legend-letters"),
    numbers: document.getElementById("legend-numbers"),
    modifiers: document.getElementById("legend-modifiers"),
    special: document.getElementById("legend-special"),
    navigation: document.getElementById("legend-navigation"),
    layerSwitch: document.getElementById("legend-layerSwitch"),
  };

  Object.entries(legendItems).forEach(([type, element]) => {
    if (element && currentColors[type] !== undefined) {
      const hexColor = `#${currentColors[type].toString(16).padStart(6, "0")}`;
      element.style.background = hexColor;
    }
  });
}

/**
 * Update legend preview while dragging color picker
 * @param {string} type - Key type
 * @param {string} hexColor - Hex color string
 */
function updateLegendPreview(type, hexColor) {
  const legendElement = document.getElementById(`legend-${type}`);
  if (legendElement) {
    legendElement.style.background = hexColor;
  }
}

/**
 * Convert hex color string to number
 * @param {string} hexColor - Hex color string (e.g., "#ff9800")
 * @returns {number} - Color as number
 */
export function hexToNumber(hexColor) {
  return parseInt(hexColor.substring(1), 16);
}

/**
 * Convert color number to hex string
 * @param {number} colorNumber - Color as number
 * @returns {string} - Hex color string
 */
export function numberToHex(colorNumber) {
  return `#${colorNumber.toString(16).padStart(6, "0")}`;
}
