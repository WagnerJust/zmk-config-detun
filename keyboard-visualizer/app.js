// Main application file - Orchestrates all modules

import {
  initKeymapData,
  getKeymap,
  getLayers,
  getCurrentLayerName,
  switchLayer,
  exportKeymap,
} from "./keymap-data.js";
import { downloadZMKConfig } from "./zmk-exporter.js";
import { initScene } from "./scene.js";
import {
  createKeyboards,
  animateFloating,
  rebuildKeyboards,
  createAllLayerKeyboards,
  animateAllLayersFloating,
  keyObjects,
} from "./keyboard.js";
import {
  setupInteractions,
  toggleEditMode,
  isEditModeActive,
} from "./interactions.js";
import { initColorCustomization } from "./color-customization.js";
import { getKeyColor } from "./utils.js";

/**
 * Application state
 */
const app = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  leftKeyboard: null,
  rightKeyboard: null,
  layerKeyboards: [], // Array of all layer keyboard groups
  layerLabels: [], // Array of layer label sprites
  animationId: null,
  isInitialized: false,
  multiLayerMode: true, // Show all layers at once
};

/**
 * Initialize the application
 */
async function init() {
  console.log("Initializing Detun Keyboard Visualizer...");

  try {
    // Get container element
    const container = document.getElementById("container");
    if (!container) {
      throw new Error("Container element not found");
    }

    // Update loading message
    const loading = document.getElementById("loading");
    if (loading) {
      loading.textContent = "Loading keymap from ZMK config...";
    }

    // Load keymap from ZMK config first
    const keymapData = await initKeymapData();

    if (keymapData.success) {
      console.log("✅ Using keymap from ZMK configuration");
      if (loading) {
        loading.textContent = "Keymap loaded! Initializing 3D view...";
      }
    } else {
      console.log("⚠️  Using default fallback keymap");
      if (loading) {
        loading.textContent = "Using default keymap. Initializing 3D view...";
      }
    }

    // Get the loaded keymap
    const keymap = getKeymap();

    // Initialize scene components
    const sceneComponents = initScene(container);
    app.scene = sceneComponents.scene;
    app.camera = sceneComponents.camera;
    app.renderer = sceneComponents.renderer;
    app.controls = sceneComponents.controls;

    // Create keyboards - check if we have multiple layers
    const layers = getLayers();
    const layerCount = Object.keys(layers).length;

    if (layerCount > 1 && app.multiLayerMode) {
      // Multi-layer mode: show all layers stacked
      console.log("🎹 Creating multi-layer view with", layerCount, "layers");
      const layerGroups = createAllLayerKeyboards(layers);
      app.layerKeyboards = layerGroups;

      // Add all layer groups and labels to scene
      layerGroups.forEach((layerData) => {
        app.scene.add(layerData.group);
        app.scene.add(layerData.label);
      });

      // Store references for backward compatibility
      if (layerGroups.length > 0) {
        app.leftKeyboard = layerGroups[0].leftKeyboard;
        app.rightKeyboard = layerGroups[0].rightKeyboard;
      }
    } else {
      // Single layer mode: show only current layer
      console.log("🎹 Creating single-layer view");
      const keyboards = createKeyboards(keymap);
      app.leftKeyboard = keyboards.leftKeyboard;
      app.rightKeyboard = keyboards.rightKeyboard;

      // Add keyboards to scene
      app.scene.add(app.leftKeyboard);
      app.scene.add(app.rightKeyboard);
    }

    // Setup interactions
    setupInteractions(app.camera, app.renderer.domElement);

    // Setup color customization with rebuild callback
    initColorCustomization(() => rebuildAllKeyboards());

    // Update config source indicator
    const configSource = document.getElementById("config-source");
    if (configSource) {
      if (keymapData.success) {
        configSource.textContent = "✅ Synced with ZMK config";
        configSource.style.color = "#4caf50";
      } else {
        configSource.textContent = "⚠️ Using default layout";
        configSource.style.color = "#ff9800";
      }
    }

    // Populate layer selector
    populateLayerSelector();

    // Setup UI controls
    setupUIControls();

    // Hide loading screen
    if (loading) {
      loading.style.display = "none";
    }

    app.isInitialized = true;
    console.log("✅ Keyboard visualizer initialized successfully");
    console.log(
      "🎹 Source:",
      keymapData.source === "zmk" ? "ZMK Config" : "Default Fallback",
    );

    // Start animation loop
    animate();
  } catch (error) {
    console.error("❌ Failed to initialize keyboard visualizer:", error);
    const loading = document.getElementById("loading");
    if (loading) {
      loading.textContent =
        "Error loading visualizer. Please refresh the page.";
      loading.style.color = "#ff4444";
    }
  }
}

/**
 * Animation loop
 */
function animate() {
  if (!app.isInitialized) return;

  app.animationId = requestAnimationFrame(animate);

  // Update controls
  app.controls.update();

  // Animate floating keyboards
  const time = Date.now() * 0.001;

  if (app.multiLayerMode && app.layerKeyboards.length > 0) {
    // Animate all layer keyboards
    animateAllLayersFloating(app.layerKeyboards, time);
  } else if (app.leftKeyboard && app.rightKeyboard) {
    // Animate single layer
    animateFloating(app.leftKeyboard, app.rightKeyboard, time);
  }

  // Render scene
  app.renderer.render(app.scene, app.camera);
}

/**
 * Cleanup function
 */
function cleanup() {
  if (app.animationId) {
    cancelAnimationFrame(app.animationId);
  }

  if (app.renderer) {
    app.renderer.dispose();
  }

  console.log("Keyboard visualizer cleaned up");
}

/**
 * Handle page visibility change
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Pause animation when page is hidden
    if (app.animationId) {
      cancelAnimationFrame(app.animationId);
      app.animationId = null;
    }
  } else {
    // Resume animation when page is visible
    if (app.isInitialized && !app.animationId) {
      animate();
    }
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Handle page visibility for performance
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Handle page unload
  window.addEventListener("beforeunload", cleanup);

  // Handle escape key to deselect
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const panel = document.getElementById("combinations-panel");
      if (panel && panel.classList.contains("active")) {
        panel.classList.remove("active");
        // Reset keyboard state (this would need to be exposed from interactions.js)
      }
    }
  });
}

/**
 * Populate layer selector dropdown
 */
function populateLayerSelector() {
  const layerSelect = document.getElementById("layer-select");
  const layers = getLayers();
  const currentLayer = getCurrentLayerName();

  // Clear existing options
  layerSelect.innerHTML = "";

  // Add "All Layers" option if multiple layers exist
  if (Object.keys(layers).length > 1) {
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Layers (Stacked)";
    if (app.multiLayerMode) {
      allOption.selected = true;
    }
    layerSelect.appendChild(allOption);
  }

  // Add layer options
  Object.keys(layers).forEach((layerName) => {
    const option = document.createElement("option");
    option.value = layerName;
    option.textContent =
      layers[layerName].displayName || layerName.toUpperCase();
    if (layerName === currentLayer && !app.multiLayerMode) {
      option.selected = true;
    }
    layerSelect.appendChild(option);
  });

  console.log(
    "📋 Layer selector populated with",
    Object.keys(layers).length,
    "layers",
  );
}

/**
 * Handle layer switching
 */
function handleLayerSwitch(layerName) {
  if (layerName === "all") {
    // Switch to multi-layer mode
    if (!app.multiLayerMode) {
      app.multiLayerMode = true;

      // Remove old single keyboards
      if (app.leftKeyboard) app.scene.remove(app.leftKeyboard);
      if (app.rightKeyboard) app.scene.remove(app.rightKeyboard);

      // Create and add all layer keyboards
      const layers = getLayers();
      const layerGroups = createAllLayerKeyboards(layers);
      app.layerKeyboards = layerGroups;

      layerGroups.forEach((layerData) => {
        app.scene.add(layerData.group);
        app.scene.add(layerData.label);
      });

      // Update UI to reflect multi-layer mode
      const interactiveHelp = document.getElementById("interactive-help");
      if (interactiveHelp) {
        interactiveHelp.textContent = "🎹 View all 3 layers at once!";
      }

      // Disable edit mode if active
      const editBtn = document.getElementById("edit-mode-toggle");
      if (editBtn && editBtn.classList.contains("active")) {
        toggleEditMode(); // Turn off edit mode
        editBtn.textContent = "Edit Mode: OFF";
        editBtn.classList.remove("active");
        document.getElementById("export-keymap").style.display = "none";
      }

      console.log("✅ Switched to multi-layer view");
    }
  } else {
    // Switch to single layer mode
    if (switchLayer(layerName)) {
      if (app.multiLayerMode) {
        app.multiLayerMode = false;

        // Remove all layer keyboards
        app.layerKeyboards.forEach((layerData) => {
          app.scene.remove(layerData.group);
          app.scene.remove(layerData.label);
        });
        app.layerKeyboards = [];
      }

      const newKeymap = getKeymap();

      // Rebuild keyboards with new layer
      const newKeyboards = rebuildKeyboards(
        app.scene,
        app.leftKeyboard,
        app.rightKeyboard,
        newKeymap,
      );

      // Update app references
      app.leftKeyboard = newKeyboards.leftKeyboard;
      app.rightKeyboard = newKeyboards.rightKeyboard;

      // Update UI help text for single layer mode
      const interactiveHelp = document.getElementById("interactive-help");
      if (interactiveHelp) {
        interactiveHelp.textContent =
          "🖱️ Click modifier keys to see combinations!";
      }

      console.log("✅ Layer switched to", layerName);
    }
  }
}

/**
 * Handle edit mode toggle
 */
function handleEditModeToggle() {
  // Don't allow edit mode in multi-layer view
  if (app.multiLayerMode) {
    alert("Please switch to a single layer view to use edit mode");
    return;
  }

  const isActive = toggleEditMode();
  const toggleBtn = document.getElementById("edit-mode-toggle");
  const exportBtn = document.getElementById("export-keymap");
  const interactiveHelp = document.getElementById("interactive-help");

  const exportZmkBtn = document.getElementById("export-zmk-config");

  if (isActive) {
    toggleBtn.textContent = "Edit Mode: ON";
    toggleBtn.classList.add("active");
    exportBtn.style.display = "inline-block";
    exportZmkBtn.style.display = "inline-block";
    interactiveHelp.textContent = "✏️ Click any key to edit its label!";
  } else {
    toggleBtn.textContent = "Edit Mode: OFF";
    toggleBtn.classList.remove("active");
    exportBtn.style.display = "none";
    exportZmkBtn.style.display = "none";
    interactiveHelp.textContent = "🖱️ Click modifier keys to see combinations!";
  }
}

/**
 * Handle keymap export
 */
function handleExportKeymap() {
  const exportData = exportKeymap();
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `detun-keymap-${exportData.currentLayer}-${Date.now()}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();

  console.log("💾 Keymap exported:", exportFileDefaultName);
}

/**
 * Handle ZMK config export
 */
async function handleExportZMKConfig() {
  console.log("📦 Exporting complete ZMK configuration...");
  const exportBtn = document.getElementById("export-zmk-config");
  const originalText = exportBtn.textContent;

  try {
    exportBtn.textContent = "Generating...";
    exportBtn.disabled = true;

    await downloadZMKConfig();

    exportBtn.textContent = "✅ Downloaded!";
    setTimeout(() => {
      exportBtn.textContent = originalText;
      exportBtn.disabled = false;
    }, 2000);
  } catch (error) {
    console.error("Export failed:", error);
    exportBtn.textContent = "❌ Failed";
    setTimeout(() => {
      exportBtn.textContent = originalText;
      exportBtn.disabled = false;
    }, 2000);
  }
}

/**
 * Setup UI control event listeners
 */
function setupUIControls() {
  // Layer selector
  const layerSelect = document.getElementById("layer-select");
  if (layerSelect) {
    layerSelect.addEventListener("change", (event) => {
      handleLayerSwitch(event.target.value);
    });
  }

  // Edit mode toggle
  const editModeToggle = document.getElementById("edit-mode-toggle");
  if (editModeToggle) {
    editModeToggle.addEventListener("click", handleEditModeToggle);
  }

  // Export keymap button
  const exportBtn = document.getElementById("export-keymap");
  if (exportBtn) {
    exportBtn.addEventListener("click", handleExportKeymap);
  }

  // Export ZMK config button
  const exportZmkBtn = document.getElementById("export-zmk-config");
  if (exportZmkBtn) {
    exportZmkBtn.addEventListener("click", handleExportZMKConfig);
  }

  console.log("🎛️  UI controls initialized");
}

/**
 * Rebuild all keyboards with updated colors
 */
function rebuildAllKeyboards() {
  console.log("🔄 Rebuilding keyboards with new colors...");

  if (app.multiLayerMode && app.layerKeyboards.length > 0) {
    // Rebuild multi-layer view
    app.layerKeyboards.forEach((layerData) => {
      app.scene.remove(layerData.group);
      app.scene.remove(layerData.label);
    });

    // Clear key objects
    keyObjects.length = 0;

    // Recreate layer keyboards
    const layers = getLayers();
    const layerGroups = createAllLayerKeyboards(layers);
    app.layerKeyboards = layerGroups;

    layerGroups.forEach((layerData) => {
      app.scene.add(layerData.group);
      app.scene.add(layerData.label);
    });

    console.log("✅ Multi-layer keyboards rebuilt");
  } else if (app.leftKeyboard && app.rightKeyboard) {
    // Rebuild single layer view
    const currentKeymap = getKeymap();
    const newKeyboards = rebuildKeyboards(
      app.scene,
      app.leftKeyboard,
      app.rightKeyboard,
      currentKeymap,
    );

    app.leftKeyboard = newKeyboards.leftKeyboard;
    app.rightKeyboard = newKeyboards.rightKeyboard;

    console.log("✅ Single layer keyboards rebuilt");
  }
}

/**
 * Start the application when DOM is ready
 */
function start() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupEventListeners();
      init();
    });
  } else {
    setupEventListeners();
    init();
  }
}

// Start the application
start();

// Export for debugging
window.keyboardApp = app;
