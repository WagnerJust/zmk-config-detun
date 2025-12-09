// Keyboard builder module - Creates 3D keyboard representations

import { getKeyColor, createTextTexture } from "./utils.js";

/**
 * Keyboard configuration constants
 */
export const KEYBOARD_CONFIG = {
  keyWidth: 1.6,
  keyHeight: 0.5,
  keyDepth: 1.6,
  spacing: 0.2,
  leftOffset: -10,
  rightOffset: 4,
  tiltAngle: 0.02,
  layerSpacing: 15, // Vertical spacing between layers
  deskHeight: 10, // Height of desk surface
};

/**
 * Storage for all key objects for interaction
 */
export const keyObjects = [];

/**
 * Create a single key with label
 * @param {string} keyLabel - The label for the key
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} tilt - Rotation tilt
 * @param {string} layerName - Layer name this key belongs to (optional)
 * @returns {Object} - Object containing key mesh and sprite
 */
export function createKey(keyLabel, x, y, z, tilt, layerName = null) {
  const { keyWidth, keyHeight, keyDepth } = KEYBOARD_CONFIG;

  // Create key geometry - mechanical keyboard style with better definition
  const geometry = new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth);
  const material = new THREE.MeshStandardMaterial({
    color: getKeyColor(keyLabel),
    roughness: 0.5,
    metalness: 0.05,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });

  const key = new THREE.Mesh(geometry, material);
  key.position.set(x, y, z);
  key.castShadow = true;
  key.receiveShadow = true;
  key.rotation.y = tilt;

  // Store metadata on the key object
  key.userData = {
    label: keyLabel,
    originalColor: getKeyColor(keyLabel),
    originalScale: { x: 1, y: 1, z: 1 },
    isKey: true,
    layerName: layerName,
  };

  // Create text label as decal on top of key (printed look)
  const texture = createTextTexture(keyLabel);
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  // Position sprite just above key surface (printed on keycap appearance)
  sprite.position.set(x, y + keyHeight / 2 + 0.26, z);
  sprite.scale.set(1.2, 1.2, 1);
  sprite.renderOrder = 1;
  sprite.userData = {
    label: keyLabel,
    isSprite: true,
    parentKey: key,
  };

  return { key, sprite };
}

/**
 * Create a full keyboard (left or right side)
 * @param {Array} keymap - 2D array of key labels
 * @param {number} offsetX - X offset for positioning
 * @param {string} side - 'left' or 'right'
 * @param {string} layerName - Layer name this keyboard belongs to (optional)
 * @returns {THREE.Group} - Group containing all keys
 */
export function createKeyboard(keymap, offsetX, side = "left", layerName = null) {
  const group = new THREE.Group();
  const { keyWidth, keyHeight, keyDepth, spacing, tiltAngle } = KEYBOARD_CONFIG;
  const tilt = side === "left" ? tiltAngle : -tiltAngle;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const keyIndex = side === "left" ? col : col + 6;
      const keyLabel = keymap[row][keyIndex];

      // Calculate position
      const x = col * (keyWidth + spacing);
      const y = 0;
      const z = row * (keyDepth + spacing);

      // Create key and sprite
      const { key, sprite } = createKey(keyLabel, x, y, z, tilt, layerName);

      // Store reference for interactions
      keyObjects.push({
        mesh: key,
        sprite: sprite,
        label: keyLabel,
        side: side,
        row: row,
        col: col,
        group: group,
        layerName: layerName,
      });

      group.add(key);
      group.add(sprite);
    }
  }

  group.position.x = offsetX;
  group.userData = {
    side: side,
    isKeyboard: true,
  };

  return group;
}

/**
 * Create both left and right keyboards
 * @param {Array} keymap - 2D array of key labels
 * @returns {Object} - Object containing left and right keyboard groups
 */
export function createKeyboards(keymap) {
  const leftKeyboard = createKeyboard(
    keymap,
    KEYBOARD_CONFIG.leftOffset,
    "left",
  );
  const rightKeyboard = createKeyboard(
    keymap,
    KEYBOARD_CONFIG.rightOffset,
    "right",
  );

  return { leftKeyboard, rightKeyboard };
}

/**
 * Create layer label sprite
 * @param {string} layerName - Name of the layer
 * @param {number} y - Y position
 * @returns {THREE.Sprite} - Label sprite
 */
export function createLayerLabel(layerName, y) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  // Clean white background with subtle transparency
  context.fillStyle = "rgba(255, 255, 255, 0.95)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle border
  context.strokeStyle = "#d0d0d0";
  context.lineWidth = 2;
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Text - dark gray for contrast
  context.fillStyle = "#2a2a2a";
  context.font = "600 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(layerName, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(0, y, -8);
  sprite.scale.set(10, 2.5, 1);

  return sprite;
}

/**
 * Create keyboards for all layers stacked vertically
 * @param {Object} layers - Object containing all layers with keymap property
 * @returns {Object} - Object containing all keyboard groups and labels
 */
export function createAllLayerKeyboards(layers) {
  const layerGroups = [];
  let yOffset = 0;

  // Get layer names in order (default, lower, raise)
  const layerOrder = ["default", "lower", "raise"];
  const availableLayers = layerOrder.filter((name) => layers[name]);

  availableLayers.forEach((layerName, index) => {
    const layer = layers[layerName];
    const keymap = layer.keymap;

    if (!keymap) {
      console.warn(`Layer ${layerName} has no keymap`);
      return;
    }

    // Create keyboards for this layer
    const leftKeyboard = createKeyboard(
      keymap,
      KEYBOARD_CONFIG.leftOffset,
      "left",
      layerName,
    );
    const rightKeyboard = createKeyboard(
      keymap,
      KEYBOARD_CONFIG.rightOffset,
      "right",
      layerName,
    );

    // Create a group to hold both keyboards
    const layerGroup = new THREE.Group();
    layerGroup.add(leftKeyboard);
    layerGroup.add(rightKeyboard);

    // Position the layer group on desk
    layerGroup.position.y = KEYBOARD_CONFIG.deskHeight + yOffset + 0.2;
    layerGroup.userData = {
      layerName: layerName,
      displayName: layer.displayName || layerName,
      isLayerGroup: true,
    };

    // Create label for this layer
    const label = createLayerLabel(
      layer.displayName || layerName.toUpperCase(),
      KEYBOARD_CONFIG.deskHeight + yOffset + 3,
    );

    layerGroups.push({
      group: layerGroup,
      label: label,
      leftKeyboard: leftKeyboard,
      rightKeyboard: rightKeyboard,
      layerName: layerName,
      displayName: layer.displayName || layerName,
    });

    // Move up for next layer
    yOffset += KEYBOARD_CONFIG.layerSpacing;
  });

  console.log(`Created ${layerGroups.length} layer keyboards`);
  return layerGroups;
}

/**
 * Find key object by label
 * @param {string} label - Key label to search for
 * @returns {Object|null} - Key object or null if not found
 */
export function findKeyByLabel(label) {
  return keyObjects.find((obj) => obj.label === label) || null;
}

/**
 * Get all keys matching a pattern
 * @param {Function} predicate - Function to test each key
 * @returns {Array} - Array of matching key objects
 */
export function filterKeys(predicate) {
  return keyObjects.filter(predicate);
}

/**
 * Reset all keys to default state
 */
export function resetAllKeys() {
  keyObjects.forEach((obj) => {
    const material = obj.mesh.material;
    material.color.setHex(obj.mesh.userData.originalColor);
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;
    material.opacity = 1;
    material.transparent = false;

    // Reset scale
    obj.mesh.scale.set(1, 1, 1);
  });
}

/**
 * Highlight a specific key
 * @param {Object} keyObj - Key object to highlight
 * @param {number} color - Hex color for highlight
 * @param {number} intensity - Emissive intensity (0-1)
 */
export function highlightKey(keyObj, color = 0xffffff, intensity = 0.5) {
  const material = keyObj.mesh.material;
  material.emissive.setHex(color);
  material.emissiveIntensity = intensity;
}

/**
 * Dim a specific key
 * @param {Object} keyObj - Key object to dim
 * @param {number} opacity - Opacity level (0-1)
 */
export function dimKey(keyObj, opacity = 0.3) {
  const material = keyObj.mesh.material;
  material.transparent = true;
  material.opacity = opacity;
}

/**
 * Select a key (make it glow and scale up)
 * @param {Object} keyObj - Key object to select
 */
export function selectKey(keyObj) {
  const material = keyObj.mesh.material;
  material.emissive.setHex(0xffffff);
  material.emissiveIntensity = 0.8;

  // Scale up slightly
  keyObj.mesh.scale.set(1.1, 1.1, 1.1);
}

/**
 * Animate subtle floating effect for keyboards on desk
 * @param {THREE.Group} leftKeyboard - Left keyboard group
 * @param {THREE.Group} rightKeyboard - Right keyboard group
 * @param {number} time - Current time in seconds
 */
export function animateFloating(leftKeyboard, rightKeyboard, time) {
  // Very subtle breathing effect
  const baseY = KEYBOARD_CONFIG.deskHeight + 0.2;
  leftKeyboard.position.y = baseY + Math.sin(time * 0.3) * 0.05;
  rightKeyboard.position.y = baseY + Math.sin(time * 0.3 + Math.PI) * 0.05;
}

/**
 * Animate subtle floating effect for all layer keyboards on desk
 * @param {Array} layerGroups - Array of layer group objects
 * @param {number} time - Current time in seconds
 */
export function animateAllLayersFloating(layerGroups, time) {
  layerGroups.forEach((layerData, index) => {
    const baseY = KEYBOARD_CONFIG.deskHeight + 0.2 + (index * KEYBOARD_CONFIG.layerSpacing);
    const offset = Math.sin(time * 0.3 + (index * Math.PI) / 3) * 0.05;
    layerData.group.position.y = baseY + offset;
    layerData.label.position.y = baseY + 3 + offset;
  });
}

/**
 * Update a key's label and color
 * @param {Object} keyObj - Key object to update
 * @param {string} newLabel - New label for the key
 */
export function updateKeyLabel(keyObj, newLabel) {
  // Update label
  keyObj.label = newLabel;
  keyObj.mesh.userData.label = newLabel;

  // Update color
  const newColor = getKeyColor(newLabel);
  keyObj.mesh.material.color.setHex(newColor);
  keyObj.mesh.userData.originalColor = newColor;

  // Update sprite texture
  const texture = createTextTexture(newLabel);
  keyObj.sprite.material.map = texture;
  keyObj.sprite.material.needsUpdate = true;

  console.log(`🔄 Updated key to: ${newLabel}`);
}

/**
 * Rebuild keyboards with new keymap
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Group} leftKeyboard - Left keyboard group
 * @param {THREE.Group} rightKeyboard - Right keyboard group
 * @param {Array} newKeymap - New keymap to display
 * @returns {Object} - New keyboard groups
 */
export function rebuildKeyboards(
  scene,
  leftKeyboard,
  rightKeyboard,
  newKeymap,
) {
  // Remove old keyboards from scene
  scene.remove(leftKeyboard);
  scene.remove(rightKeyboard);

  // Dispose of old geometries and materials
  leftKeyboard.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
    }
  });
  rightKeyboard.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
    }
  });

  // Clear key objects array
  keyObjects.length = 0;

  // Create new keyboards
  const newKeyboards = createKeyboards(newKeymap);

  // Add to scene
  scene.add(newKeyboards.leftKeyboard);
  scene.add(newKeyboards.rightKeyboard);

  console.log("🔄 Rebuilt keyboards with new keymap");
  return newKeyboards;
}

/**
 * Highlight modified key
 * @param {Object} keyObj - Key object to mark as modified
 */
export function markKeyAsModified(keyObj) {
  keyObj.mesh.userData.isModified = true;
  // Add a subtle glow to show it's modified
  const material = keyObj.mesh.material;
  material.emissive.setHex(0xff9800);
  material.emissiveIntensity = 0.3;
}

/**
 * Find key object by position
 * @param {number} row - Row index (0-4)
 * @param {number} col - Column index (0-11)
 * @returns {Object|null} - Key object or null if not found
 */
export function findKeyByPosition(row, col) {
  return keyObjects.find((obj) => obj.row === row && obj.col === col) || null;
}
