// ZMK Configuration Saver
// This module saves keymap updates to the backend server

import { getLayers } from "./keymap-data.js";

/**
 * Converts visualizer keymap format to ZMK keycode
 * @param {string} key - Key label from visualizer
 * @returns {string} - ZMK keycode
 */
function toZMKKeycode(key) {
  // Empty/transparent keys
  if (key === "✕") return "&none";
  if (key === "▽") return "&trans";

  // Layer switches (already in format like "L1", "L2")
  if (key.match(/^L\d+$/)) {
    const layerNum = key.substring(1);
    return `&mo ${layerNum}`;
  }
  if (key.match(/^LT\d+$/)) {
    const layerNum = key.substring(2);
    return `&lt ${layerNum}`;
  }
  if (key.match(/^TO\d+$/)) {
    const layerNum = key.substring(2);
    return `&to ${layerNum}`;
  }

  // Modifiers
  const modifierMap = {
    CTRL: "LCTRL",
    SHFT: "LSHFT",
    ALT: "LALT",
    GUI: "LGUI",
    RCTRL: "RCTRL",
    RSHFT: "RSHFT",
    RALT: "RALT",
    RGUI: "RGUI",
  };
  if (modifierMap[key]) {
    return `&kp ${modifierMap[key]}`;
  }

  // Special keys
  const specialMap = {
    SPC: "SPACE",
    SPACE: "SPACE",
    ENT: "RET",
    BSPC: "BSPC",
    TAB: "TAB",
    ESC: "ESC",
    CAPS: "CAPS",
    DEL: "DEL",
    INS: "INS",
    HOME: "HOME",
    END: "END",
    PGUP: "PG_UP",
    PGDN: "PG_DN",
    LARW: "LEFT",
    RARW: "RIGHT",
    UARW: "UP",
    DARW: "DOWN",
    "←": "LEFT",
    "→": "RIGHT",
    "↑": "UP",
    "↓": "DOWN",
  };
  if (specialMap[key]) {
    return `&kp ${specialMap[key]}`;
  }

  // Numbers
  if (key.match(/^[0-9]$/)) {
    return `&kp N${key}`;
  }

  // Single letters
  if (key.match(/^[A-Z]$/)) {
    return `&kp ${key}`;
  }

  // Function keys
  if (key.match(/^F\d+$/)) {
    return `&kp ${key}`;
  }

  // Punctuation and symbols
  const punctuationMap = {
    ";": "SEMI",
    SEMI: "SEMI",
    "'": "SQT",
    APOS: "SQT",
    ",": "COMMA",
    COMMA: "COMMA",
    ".": "DOT",
    DOT: "DOT",
    "/": "FSLH",
    FSLH: "FSLH",
    "\\": "BSLH",
    BSLH: "BSLH",
    "-": "MINUS",
    MINUS: "MINUS",
    "=": "EQUAL",
    EQUAL: "EQUAL",
    "[": "LBKT",
    LBKT: "LBKT",
    "]": "RBKT",
    RBKT: "RBKT",
    "`": "GRAVE",
    GRAVE: "GRAVE",
    "!": "EXCL",
    "@": "AT",
    "#": "HASH",
    $: "DLLR",
    "%": "PRCNT",
    "^": "CARET",
    "&": "AMPS",
    "*": "ASTRK",
    "(": "LPAR",
    LPAR: "LPAR",
    ")": "RPAR",
    RPAR: "RPAR",
    _: "UNDER",
    "+": "PLUS",
    "{": "LBRC",
    "}": "RBRC",
    "|": "PIPE",
    ":": "COLON",
    '"': "DQT",
    "<": "LT",
    ">": "GT",
    "?": "QMARK",
    "~": "TILDE",
  };
  if (punctuationMap[key]) {
    return `&kp ${punctuationMap[key]}`;
  }

  // Bluetooth commands
  if (key === "BT_CLR" || key === "BTCLR") return "&bt BT_CLR";
  if (key.match(/^BT\d+$/)) {
    const btNum = key.substring(2);
    return `&bt BT_SEL ${btNum}`;
  }
  if (key === "BT_NXT" || key === "BTNXT") return "&bt BT_NXT";
  if (key === "BT_PRV" || key === "BTPRV") return "&bt BT_PRV";

  // Default: assume it's a direct keycode
  return `&kp ${key}`;
}

/**
 * Converts a 2D keymap array to ZMK bindings format
 * @param {Array<Array<string>>} keymap - 2D array of key labels (5 rows x 12 cols)
 * @returns {string} - Formatted ZMK bindings string
 */
function keymapToZMKBindings(keymap) {
  const lines = [];

  // The keymap is 5 rows x 12 columns total (6x5 per side)
  for (let row = 0; row < 5; row++) {
    if (!keymap[row]) continue;

    const keys = keymap[row].map((key) => toZMKKeycode(key));

    // Format based on row structure
    if (row === 4) {
      // Bottom row - thumb keys with different spacing
      const leftSide = keys.slice(0, 6);
      const rightSide = keys.slice(6, 12);
      lines.push(
        "   " + leftSide.join("  ") + "             " + rightSide.join("  ")
      );
    } else {
      // Regular rows - all 12 keys
      const leftSide = keys.slice(0, 6);
      const rightSide = keys.slice(6, 12);
      lines.push(
        "   " + leftSide.join("  ") + "               " + rightSide.join("  ")
      );
    }
  }

  return lines.join("\n");
}

/**
 * Generates visual ASCII comment for a keymap
 * @param {Array<Array<string>>} keymap - 2D keymap array
 * @returns {string} - Formatted comment
 */
function generateVisualComment(keymap) {
  const formatKey = (key) => {
    if (!key || key === "✕") return "     ";
    if (key === "▽") return "     ";
    // Pad to 5 chars for visual alignment
    return key.padEnd(5).substring(0, 5);
  };

  const lines = [
    "// ---------------------------------------------------------------------------------",
  ];

  for (let row = 0; row < 5; row++) {
    if (!keymap[row]) continue;

    const keys = keymap[row].map(formatKey);
    const leftSide = keys.slice(0, 6);
    const rightSide = keys.slice(6, 12);

    const line =
      "// | " +
      leftSide.join(" | ") +
      " |     | " +
      rightSide.join(" | ") +
      " |";
    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * Generates a complete ZMK keymap file content
 * @param {Object} layers - All layers from keymap-data
 * @returns {string} - Complete .keymap file content
 */
function generateKeymapFile(layers) {
  const layerNames = Object.keys(layers);

  const header = `/*
 * Copyright (c) 2020 The ZMK Contributors
 *
 * SPDX-License-Identifier: MIT
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>

/ {
        keymap {
                compatible = "zmk,keymap";
`;

  const footer = `        };
};`;

  const layerSections = layerNames.map((layerName) => {
    const layer = layers[layerName];
    const displayName = layer.displayName || layerName.toUpperCase();
    const keymap = layer.keymap;

    if (!keymap) return "";

    // Generate visual comment based on keymap
    const visualComment = generateVisualComment(keymap);

    // Generate bindings
    const bindings = keymapToZMKBindings(keymap);

    return `
                ${layerName}_layer {
${visualComment}
                        bindings = <
${bindings}
                        >;
                };`;
  });

  return header + layerSections.join("") + footer;
}

/**
 * Saves the current keymap to the backend server
 * @returns {Promise<{success: boolean, message: string, path?: string}>}
 */
export async function saveKeymapToBackend() {
  try {
    console.log("Saving keymap to backend...");

    const layers = getLayers();
    const keymapContent = generateKeymapFile(layers);

    const response = await fetch("/api/save-keymap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keymap_content: keymapContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Keymap saved successfully:", result.path);

    return {
      success: true,
      message: result.message,
      path: result.path,
    };
  } catch (error) {
    console.error("Failed to save keymap:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Saves keymap and shows user feedback
 * @returns {Promise<boolean>}
 */
export async function saveAndNotify() {
  const result = await saveKeymapToBackend();

  if (result.success) {
    alert(
      `Keymap saved successfully!\n\nFile: ${result.path}\n\nYou can now run:\n  git add .\n  git commit -m "Update keymap"\n  git push`
    );
    return true;
  } else {
    alert(`Failed to save keymap:\n\n${result.message}`);
    return false;
  }
}