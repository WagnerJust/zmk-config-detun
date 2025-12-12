// ZMK Configuration Exporter
// This module generates ZMK configuration files from the visualizer's keymap data
// and packages them into a downloadable zip archive

import { getLayers, getCurrentLayerName } from "./keymap-data.js";

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

  // Single letters (convert lowercase to uppercase for ZMK)
  if (key.match(/^[a-zA-Z]$/)) {
    return `&kp ${key.toUpperCase()}`;
  }

  // Function keys
  if (key.match(/^F\d+$/)) {
    return `&kp ${key}`;
  }

  // Punctuation and symbols
  const punctuationMap = {
    ";": "SEMI",
    "'": "SQT",
    ",": "COMMA",
    ".": "DOT",
    "/": "FSLH",
    "\\": "BSLH",
    "-": "MINUS",
    "=": "EQUAL",
    "[": "LBKT",
    "]": "RBKT",
    "`": "GRAVE",
    "!": "EXCL",
    "@": "AT",
    "#": "HASH",
    $: "DLLR",
    "%": "PRCNT",
    "^": "CARET",
    "&": "AMPS",
    "*": "ASTRK",
    "(": "LPAR",
    ")": "RPAR",
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
  // But only first 3 rows are full, 4th row is thumb keys with padding
  for (let row = 0; row < 4; row++) {
    if (!keymap[row]) continue;

    const keys = keymap[row].map((key) => toZMKKeycode(key));

    // Row formatting based on layout
    if (row === 3) {
      // Thumb row - filter out none keys
      const leftThumb = keys.slice(2, 5); // GUI, L1, SPC
      const rightThumb = keys.slice(7, 10); // ENT, L2, ALT

      lines.push(
        "                  " + leftThumb.join(" ") + "   " + rightThumb.join(" ")
      );
    } else {
      // Regular rows - all 12 keys
      const leftSide = keys.slice(0, 6);
      const rightSide = keys.slice(6, 12);

      lines.push(
        "   " + leftSide.join(" ") + "   " + rightSide.join(" ")
      );
    }
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
};
`;

  const layerSections = layerNames.map((layerName, index) => {
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
                        display-name = "${displayName}";
${visualComment}
                        bindings = <
${bindings}
                        >;
                };`;
  });

  return header + layerSections.join("") + footer;
}

/**
 * Generates visual ASCII comment for a keymap
 * @param {Array<Array<string>>} keymap - 2D keymap array
 * @returns {string} - Formatted comment
 */
function generateVisualComment(keymap) {
  const formatKey = (key) => {
    if (!key || key === "✕") return "    ";
    if (key === "▽") return "    ";
    return key.padEnd(4).substring(0, 4);
  };

  const lines = [
    "// -----------------------------------------------------------------------------------------",
  ];

  for (let row = 0; row < 3; row++) {
    if (!keymap[row]) continue;

    const keys = keymap[row].map(formatKey);
    const leftSide = keys.slice(0, 6);
    const rightSide = keys.slice(6, 12);

    const line =
      "// | " +
      leftSide.join(" | ") +
      " |   | " +
      rightSide.join(" | ") +
      " |";
    lines.push(line);
  }

  // Thumb row
  if (keymap[3]) {
    const keys = keymap[3].map(formatKey);
    const leftThumb = [keys[2], keys[3], keys[4]]; // GUI, L1, SPC
    const rightThumb = [keys[7], keys[8], keys[9]]; // ENT, L2, ALT

    lines.push(
      "//                    | " +
        leftThumb.join(" | ") +
        " |   | " +
        rightThumb.join(" | ") +
        " |"
    );
  }

  return lines.join("\n");
}

/**
 * Generates build.yaml content
 * @returns {string}
 */
function generateBuildYaml() {
  return `# This file generates the GitHub Actions matrix.
# For simple board + shield combinations, add them to the top level board and
# shield arrays, for more control, add individual board + shield combinations
# to the \`include\` property. You can also use the \`cmake-args\` property to
# pass flags to the build command, \`snippet\` to add a Zephyr snippet, and
# \`artifact-name\` to assign a name to distinguish build outputs from each other:
#
# board: [ "nice_nano_v2" ]
# shield: [ "corne_left", "corne_right" ]
# include:
#   - board: bdn9_rev2
#   - board: nice_nano_v2
#     shield: reviung41
#   - board: nice_nano_v2
#     shield: corne_left
#     snippet: studio-rpc-usb-uart
#     cmake-args: -DCONFIG_ZMK_STUDIO=y
#     artifact-name: corne_left_with_studio
#
---
include:
  - board: nice_nano_v2
    shield: detun_left
  - board: nice_nano_v2
    shield: detun_right
`;
}

/**
 * Generates west.yml content
 * @returns {string}
 */
function generateWestYaml() {
  return `manifest:
  defaults:
    revision: v0.3
  remotes:
    - name: zmkfirmware
      url-base: https://github.com/zmkfirmware
  projects:
    - name: zmk
      remote: zmkfirmware
      import: app/west.yml
  self:
    path: config
`;
}

/**
 * Generates GitHub Actions workflow file
 * @returns {string}
 */
function generateGithubWorkflow() {
  return `name: Build ZMK firmware
on: [push, pull_request, workflow_dispatch]

jobs:
  build:
    uses: zmkfirmware/zmk/.github/workflows/build-user-config.yml@v0.3
`;
}

/**
 * Fetches existing config file from the server
 * @param {string} path - Path to the file relative to project root
 * @returns {Promise<string|null>} - File content or null if not found
 */
async function fetchConfigFile(path) {
  try {
    const response = await fetch(`../${path}`);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.warn(`Could not fetch ${path}:`, error.message);
  }
  return null;
}

/**
 * Creates a zip archive with the complete ZMK configuration
 * @returns {Promise<Blob>} - Zip file as a blob
 */
export async function exportZMKConfig() {
  console.log("Starting ZMK config export...");

  if (typeof JSZip === "undefined") {
    throw new Error("JSZip library not loaded");
  }

  const zip = new JSZip();
  const layers = getLayers();

  // Generate main keymap file
  const keymapContent = generateKeymapFile(layers);
  zip.file("config/boards/shields/detun/detun.keymap", keymapContent);

  // Add build.yaml
  zip.file("build.yaml", generateBuildYaml());

  // Add west.yml
  zip.file("config/west.yml", generateWestYaml());

  // Add GitHub workflow
  zip.file(".github/workflows/build.yml", generateGithubWorkflow());

  // Try to fetch and include existing config files
  const configFiles = [
    "config/boards/shields/detun/detun.dtsi",
    "config/boards/shields/detun/detun.conf",
    "config/boards/shields/detun/detun_left.conf",
    "config/boards/shields/detun/detun_right.conf",
    "config/boards/shields/detun/detun_left.overlay",
    "config/boards/shields/detun/detun_right.overlay",
    "config/boards/shields/detun/Kconfig.shield",
    "config/boards/shields/detun/Kconfig.defconfig",
  ];

  for (const filePath of configFiles) {
    const content = await fetchConfigFile(filePath);
    if (content) {
      zip.file(filePath, content);
      console.log(`Added existing file: ${filePath}`);
    } else {
      console.warn(`Could not include: ${filePath}`);
    }
  }

  // Add a README for the export
  const readmeContent = `# ZMK Configuration Export

This configuration was exported from the Detun Keyboard Visualizer.

## Files Included

- \`config/boards/shields/detun/detun.keymap\` - Main keymap configuration (MODIFIED)
- \`build.yaml\` - Build configuration
- \`config/west.yml\` - West manifest
- \`.github/workflows/build.yml\` - GitHub Actions workflow
- Additional shield configuration files

## How to Use

1. Extract this archive to your ZMK config repository
2. Commit and push the changes to GitHub
3. GitHub Actions will automatically build the firmware
4. Download the firmware from the Actions tab

## Layer Information

This configuration includes ${Object.keys(layers).length} layer(s):
${Object.keys(layers)
  .map((name) => `- ${layers[name].displayName || name}`)
  .join("\n")}

## Building Locally

If you want to build locally instead of using GitHub Actions:

\`\`\`bash
west build -d build/left -b nice_nano_v2 -- -DSHIELD=detun_left
west build -d build/right -b nice_nano_v2 -- -DSHIELD=detun_right
\`\`\`

Generated: ${new Date().toISOString()}
`;

  zip.file("README.md", readmeContent);

  // Generate the zip file
  console.log("Generating zip archive...");
  const blob = await zip.generateAsync({ type: "blob" });
  console.log("ZMK config export complete");

  return blob;
}

/**
 * Triggers download of the ZMK config zip file
 */
export async function downloadZMKConfig() {
  try {
    const blob = await exportZMKConfig();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `zmk-config-detun-${timestamp}.zip`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);

    console.log(`Downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.error("Failed to export ZMK config:", error);
    alert(`Failed to export ZMK configuration: ${error.message}`);
    return false;
  }
}
