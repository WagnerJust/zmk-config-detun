// ZMK Keymap Parser - Loads actual configuration from ZMK files
// This ensures the visualizer always matches your real keyboard config

/**
 * ZMK keycode to display label mapping
 */
const ZMK_KEYCODE_MAP = {
  // Letters
  Q: "q",
  W: "w",
  E: "e",
  R: "r",
  T: "t",
  Y: "y",
  U: "u",
  I: "i",
  O: "o",
  P: "p",
  A: "a",
  S: "s",
  D: "d",
  F: "f",
  G: "g",
  H: "h",
  J: "j",
  K: "k",
  L: "l",
  Z: "z",
  X: "x",
  C: "c",
  V: "v",
  B: "b",
  N: "n",
  M: "m",

  // Numbers
  N1: "1",
  NUMBER_1: "1",
  N2: "2",
  NUMBER_2: "2",
  N3: "3",
  NUMBER_3: "3",
  N4: "4",
  NUMBER_4: "4",
  N5: "5",
  NUMBER_5: "5",
  N6: "6",
  NUMBER_6: "6",
  N7: "7",
  NUMBER_7: "7",
  N8: "8",
  NUMBER_8: "8",
  N9: "9",
  NUMBER_9: "9",
  N0: "0",
  NUMBER_0: "0",

  // Modifiers
  LCTRL: "CTRL",
  LEFT_CONTROL: "CTRL",
  RCTRL: "RCTL",
  RIGHT_CONTROL: "RCTL",
  LSHFT: "SHFT",
  LEFT_SHIFT: "SHFT",
  LSHIFT: "SHFT",
  RSHFT: "RSHF",
  RIGHT_SHIFT: "RSHF",
  RSHIFT: "RSHF",
  LALT: "ALT",
  LEFT_ALT: "ALT",
  RALT: "RALT",
  RIGHT_ALT: "RALT",
  LGUI: "GUI",
  LEFT_GUI: "GUI",
  LWIN: "WIN",
  LCMD: "CMD",
  RGUI: "RGUI",
  RIGHT_GUI: "RGUI",
  RWIN: "RWIN",
  RCMD: "RCMD",

  // Special keys
  TAB: "TAB",
  SPACE: "SPC",
  RET: "ENT",
  RETURN: "ENT",
  ENTER: "ENT",
  BSPC: "BSPC",
  BACKSPACE: "BSPC",
  ESC: "ESC",
  ESCAPE: "ESC",
  CAPS: "CAPS",
  CAPSLOCK: "CAPS",
  CLCK: "CAPS",
  DEL: "DEL",
  DELETE: "DEL",
  INS: "INS",
  INSERT: "INS",

  // Punctuation
  SEMI: ";",
  SEMICOLON: ";",
  COLON: ":",
  SQT: "'",
  SINGLE_QUOTE: "'",
  APOS: "'",
  APOSTROPHE: "'",
  QUOTE: '"',
  DQT: '"',
  DOUBLE_QUOTES: '"',
  COMMA: ",",
  LESS: "<",
  LESS_THAN: "<",
  LT: "<",
  DOT: ".",
  PERIOD: ".",
  GREATER: ">",
  GREATER_THAN: ">",
  GT: ">",
  FSLH: "/",
  SLASH: "/",
  FORWARD_SLASH: "/",
  QMARK: "?",
  QUESTION: "?",
  BSLH: "\\",
  BACKSLASH: "\\",
  PIPE: "|",

  // Brackets
  LBKT: "[",
  LEFT_BRACKET: "[",
  LBRC: "{",
  LEFT_BRACE: "{",
  RBKT: "]",
  RIGHT_BRACKET: "]",
  RBRC: "}",
  RIGHT_BRACE: "}",
  LPAR: "(",
  LEFT_PARENTHESIS: "(",
  RPAR: ")",
  RIGHT_PARENTHESIS: ")",

  // Symbols
  MINUS: "-",
  UNDER: "_",
  UNDERSCORE: "_",
  EQUAL: "=",
  PLUS: "+",
  GRAVE: "`",
  TILDE: "~",
  EXCL: "!",
  EXCLAMATION: "!",
  AT: "@",
  AT_SIGN: "@",
  HASH: "#",
  POUND: "#",
  DLLR: "$",
  DOLLAR: "$",
  PRCNT: "%",
  PERCENT: "%",
  CARET: "^",
  AMPS: "&",
  AMPERSAND: "&",
  ASTRK: "*",
  ASTERISK: "*",
  STAR: "*",

  // Navigation
  LEFT: "←",
  LEFT_ARROW: "←",
  RIGHT: "→",
  RIGHT_ARROW: "→",
  UP: "↑",
  UP_ARROW: "↑",
  DOWN: "↓",
  DOWN_ARROW: "↓",
  HOME: "HOME",
  END: "END",
  PG_UP: "PGUP",
  PAGE_UP: "PGUP",
  PGUP: "PGUP",
  PG_DN: "PGDN",
  PAGE_DOWN: "PGDN",
  PGDN: "PGDN",

  // Function keys
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",

  // Media keys
  C_VOL_UP: "VOL+",
  C_VOLUME_UP: "VOL+",
  C_VOL_DN: "VOL-",
  C_VOLUME_DOWN: "VOL-",
  C_MUTE: "MUTE",
  C_PP: "⏯",
  C_PLAY_PAUSE: "⏯",
  C_NEXT: "⏭",
  C_PREV: "⏮",
  C_PREVIOUS: "⏮",
  C_BRI_UP: "🔆",
  C_BRIGHTNESS_INC: "🔆",
  C_BRI_DN: "🔅",
  C_BRIGHTNESS_DEC: "🔅",

  // Special
  trans: "▽",
  TRANS: "▽", // Transparent (pass-through)
  none: "✕",
  NONE: "✕", // No operation
};

/**
 * Parse ZMK keycode to display label
 */
function parseKeycodeLabel(keycode) {
  // Handle empty or invalid keycodes
  if (!keycode || keycode.trim() === "") {
    return "✕";
  }

  // Remove whitespace
  keycode = keycode.trim();

  // Handle transparent and none first (exact matches)
  if (keycode === "&trans" || keycode === "trans") return "▽";
  if (keycode === "&none" || keycode === "none") return "✕";

  // Handle &kp (key press) behavior - most common
  const kpMatch = keycode.match(/^&kp\s+(.+)$/);
  if (kpMatch) {
    const code = kpMatch[1].trim();
    return ZMK_KEYCODE_MAP[code] || code;
  }

  // Handle &mo (momentary layer) behavior
  const moMatch = keycode.match(/^&mo\s+(\d+)$/);
  if (moMatch) {
    return `L${moMatch[1]}`;
  }

  // Handle &lt (layer tap) behavior
  const ltMatch = keycode.match(/^&lt\s+(\d+)\s+(.+)$/);
  if (ltMatch) {
    return `LT${ltMatch[1]}`;
  }

  // Handle &to (layer to) behavior
  const toMatch = keycode.match(/^&to\s+(\d+)$/);
  if (toMatch) {
    return `TO${toMatch[1]}`;
  }

  // Handle &tog (layer toggle) behavior
  const togMatch = keycode.match(/^&tog\s+(\d+)$/);
  if (togMatch) {
    return `TG${togMatch[1]}`;
  }

  // Handle &sl (sticky layer) behavior
  const slMatch = keycode.match(/^&sl\s+(\d+)$/);
  if (slMatch) {
    return `SL${slMatch[1]}`;
  }

  // Handle Bluetooth commands (&bt)
  if (keycode.startsWith("&bt")) {
    if (keycode.includes("BT_CLR")) return "BTCLR";
    const btSelMatch = keycode.match(/BT_SEL\s+(\d+)/);
    if (btSelMatch) {
      return `BT${btSelMatch[1]}`;
    }
    if (keycode.includes("BT_NXT")) return "BTNXT";
    if (keycode.includes("BT_PRV")) return "BTPRV";
    return "BT";
  }

  // Handle output selection (&out)
  if (keycode.startsWith("&out")) {
    if (keycode.includes("OUT_USB")) return "USB";
    if (keycode.includes("OUT_BLE")) return "BLE";
    if (keycode.includes("OUT_TOG")) return "OUT";
    return "OUT";
  }

  // Handle reset commands
  if (keycode.includes("&bootloader")) return "BOOT";
  if (keycode.includes("&sys_reset")) return "RST";
  if (keycode.includes("&reset")) return "RST";

  // Look up in map (for codes without prefix)
  if (ZMK_KEYCODE_MAP[keycode]) {
    return ZMK_KEYCODE_MAP[keycode];
  }

  // Fallback: return shortened version
  const cleaned = keycode.replace(/^&\w+\s+/, "").trim();
  return cleaned.length > 5 ? cleaned.substring(0, 5) : cleaned || "?";
}

/**
 * Parse ZMK keymap file content
 */
export async function parseZMKKeymap(keymapPath) {
  try {
    const response = await fetch(keymapPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();

    return parseKeymapContent(content);
  } catch (error) {
    console.error("Error loading ZMK keymap:", error);
    return null;
  }
}

/**
 * Parse keymap content from ZMK .keymap file
 */
function parseKeymapContent(content) {
  const layers = {};
  let currentLayer = null;
  let currentBindings = [];
  let inBindings = false;
  let bindingsBuffer = "";

  // Split into lines and process
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (
      !line ||
      line.startsWith("//") ||
      line.startsWith("/*") ||
      line.startsWith("*")
    ) {
      continue;
    }

    // Detect layer start (look for _layer {)
    if (line.includes("_layer") && line.includes("{")) {
      // Extract layer name (e.g., "default_layer" -> "default")
      const match = line.match(/(\w+)_layer/);
      if (match) {
        currentLayer = match[1];
        layers[currentLayer] = {
          name: currentLayer,
          displayName: "",
          keys: [],
        };
        console.log(`Found layer: ${currentLayer}`);
      }
    }

    // Extract display name
    if (currentLayer && line.includes("display-name")) {
      const match = line.match(/display-name\s*=\s*"([^"]+)"/);
      if (match) {
        layers[currentLayer].displayName = match[1];
        console.log(`  Display name: ${match[1]}`);
      }
    }

    // Detect bindings start
    if (line.includes("bindings") && line.includes("<")) {
      inBindings = true;
      bindingsBuffer = "";

      // Check if bindings start and end on same line
      if (line.includes(">;")) {
        // Single line bindings (rare but possible)
        const match = line.match(/bindings\s*=\s*<([^>]+)>/);
        if (match) {
          bindingsBuffer = match[1];
          inBindings = false;
          parseBindingsBuffer(bindingsBuffer, currentLayer, layers);
          bindingsBuffer = "";
        }
      }
      continue;
    }

    // Detect bindings end
    if (inBindings && line.includes(">;")) {
      inBindings = false;
      // Add the last line (without the >;)
      const lastPart = line.split(">;")[0].trim();
      if (lastPart) {
        bindingsBuffer += " " + lastPart;
      }
      parseBindingsBuffer(bindingsBuffer, currentLayer, layers);
      bindingsBuffer = "";
      continue;
    }

    // Collect binding lines
    if (inBindings) {
      // Remove inline comments
      const cleanLine = line.split("//")[0].trim();
      if (cleanLine) {
        bindingsBuffer += " " + cleanLine;
      }
    }
  }

  return layers;
}

/**
 * Parse the accumulated bindings buffer
 */
function parseBindingsBuffer(buffer, currentLayer, layers) {
  if (!currentLayer || !buffer) return;

  // Split by whitespace and filter out empty strings
  const tokens = buffer
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  // Combine behaviors with their arguments
  // ZMK format: &behavior arg1 arg2 ...
  const bindings = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.startsWith("&")) {
      // This is a behavior
      const behavior = token;

      // Check what kind of behavior it is to know how many args to consume
      if (
        behavior === "&kp" ||
        behavior === "&mo" ||
        behavior === "&to" ||
        behavior === "&tog" ||
        behavior === "&sl"
      ) {
        // Single argument behaviors
        if (i + 1 < tokens.length && !tokens[i + 1].startsWith("&")) {
          bindings.push(`${behavior} ${tokens[i + 1]}`);
          i += 2;
        } else {
          bindings.push(behavior);
          i += 1;
        }
      } else if (behavior === "&lt") {
        // Two argument behavior (layer-tap: layer + keycode)
        if (
          i + 2 < tokens.length &&
          !tokens[i + 1].startsWith("&") &&
          !tokens[i + 2].startsWith("&")
        ) {
          bindings.push(`${behavior} ${tokens[i + 1]} ${tokens[i + 2]}`);
          i += 3;
        } else if (i + 1 < tokens.length && !tokens[i + 1].startsWith("&")) {
          bindings.push(`${behavior} ${tokens[i + 1]}`);
          i += 2;
        } else {
          bindings.push(behavior);
          i += 1;
        }
      } else if (behavior === "&bt") {
        // Bluetooth behavior with command
        if (i + 1 < tokens.length && !tokens[i + 1].startsWith("&")) {
          // Check if there's a second argument (for BT_SEL with number)
          if (
            i + 2 < tokens.length &&
            !tokens[i + 2].startsWith("&") &&
            tokens[i + 1].includes("BT_SEL")
          ) {
            bindings.push(`${behavior} ${tokens[i + 1]} ${tokens[i + 2]}`);
            i += 3;
          } else {
            bindings.push(`${behavior} ${tokens[i + 1]}`);
            i += 2;
          }
        } else {
          bindings.push(behavior);
          i += 1;
        }
      } else {
        // Unknown behavior, just take it as-is
        bindings.push(behavior);
        i += 1;
      }
    } else {
      // Shouldn't happen, but skip non-behavior tokens
      i += 1;
    }
  }

  if (bindings.length > 0) {
    layers[currentLayer].keys = bindings;
    console.log(
      `  Found ${bindings.length} bindings:`,
      bindings.slice(0, 6).join(", ") + "...",
    );
  }
}

/**
 * Convert ZMK layer to visualizer keymap format (5 rows x 12 cols)
 */
export function convertLayerToKeymap(layer) {
  if (!layer || !layer.keys) {
    console.warn("Invalid layer data");
    return null;
  }

  const keys = layer.keys;
  const keymap = [];

  console.log(`Converting layer with ${keys.length} keys`);

  // The detun.keymap has 42 keys:
  // - 3 rows of 12 keys each (36 keys)
  // - 1 row of 6 thumb keys (6 keys)
  // Total: 42 keys

  if (keys.length === 42) {
    // 3 rows of 12 + 1 row of 6 thumbs
    keymap.push(keys.slice(0, 12).map(parseKeycodeLabel)); // Row 1
    keymap.push(keys.slice(12, 24).map(parseKeycodeLabel)); // Row 2
    keymap.push(keys.slice(24, 36).map(parseKeycodeLabel)); // Row 3

    // Thumb row - pad with empty keys to make 12
    const thumbs = keys.slice(36, 42).map(parseKeycodeLabel);
    const paddedThumbs = [
      "✕",
      "✕",
      thumbs[0] || "✕",
      thumbs[1] || "✕",
      thumbs[2] || "✕",
      "✕", // Left side
      "✕",
      thumbs[3] || "✕",
      thumbs[4] || "✕",
      thumbs[5] || "✕",
      "✕",
      "✕", // Right side
    ];
    keymap.push(paddedThumbs); // Row 4

    // Add empty row 5
    keymap.push(["✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕", "✕"]);
  } else if (keys.length === 60) {
    // Full 5x12 layout
    keymap.push(keys.slice(0, 12).map(parseKeycodeLabel));
    keymap.push(keys.slice(12, 24).map(parseKeycodeLabel));
    keymap.push(keys.slice(24, 36).map(parseKeycodeLabel));
    keymap.push(keys.slice(36, 48).map(parseKeycodeLabel));
    keymap.push(keys.slice(48, 60).map(parseKeycodeLabel));
  } else {
    console.warn(`Unexpected key count: ${keys.length}. Expected 42 or 60.`);

    // Try to handle it gracefully by chunking into rows of 12
    const numRows = Math.ceil(keys.length / 12);
    for (let row = 0; row < 5; row++) {
      if (row < numRows) {
        const start = row * 12;
        const end = Math.min(start + 12, keys.length);
        const rowKeys = keys.slice(start, end).map(parseKeycodeLabel);
        // Pad with empty keys if needed
        while (rowKeys.length < 12) {
          rowKeys.push("✕");
        }
        keymap.push(rowKeys);
      } else {
        // Add empty rows
        keymap.push([
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
          "✕",
        ]);
      }
    }
  }

  console.log(`Created keymap with ${keymap.length} rows`);
  return keymap;
}

/**
 * Load keymap from ZMK config file
 */
export async function loadKeymapFromZMK() {
  const keymapPath = "/config/boards/shields/detun/detun.keymap";

  console.log("🔍 Loading ZMK keymap from:", keymapPath);

  try {
    const layers = await parseZMKKeymap(keymapPath);

    if (!layers || Object.keys(layers).length === 0) {
      console.warn("⚠️  No layers found in keymap, using defaults");
      return null;
    }

    console.log("✅ Successfully parsed ZMK keymap");
    console.log("📋 Layers found:", Object.keys(layers));

    // Convert all layers to keymap format and store with each layer
    for (const [name, layer] of Object.entries(layers)) {
      const keymap = convertLayerToKeymap(layer);
      if (keymap) {
        layers[name].keymap = keymap;
      }
    }

    // Get default layer
    const defaultLayer =
      layers.default || layers.base || Object.values(layers)[0];
    const keymap = defaultLayer.keymap;

    if (!keymap) {
      console.warn("⚠️  Could not convert layer to keymap format");
      return null;
    }

    console.log("🎹 Keymap loaded successfully");

    return {
      keymap: keymap,
      layers: layers,
      defaultLayerName: defaultLayer.name,
    };
  } catch (error) {
    console.error("❌ Error loading ZMK keymap:", error);
    console.log("📦 Falling back to default keymap");
    return null;
  }
}

/**
 * Get all layers as keymap format
 */
export function getAllLayersAsKeymaps(layers) {
  const result = {};

  for (const [name, layer] of Object.entries(layers)) {
    const keymap = convertLayerToKeymap(layer);
    if (keymap) {
      result[name] = {
        displayName: layer.displayName || name,
        keymap: keymap,
      };
    }
  }

  return result;
}
