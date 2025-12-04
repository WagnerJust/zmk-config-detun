// Main application file - Orchestrates all modules

import {
  initKeymapData,
  getKeymap,
  getLayers,
  getCurrentLayerName,
  switchLayer,
  exportKeymap,
} from "./keymap-data.js";
import { initScene } from "./scene.js";
import {
  createKeyboards,
  animateFloating,
  rebuildKeyboards,
} from "./keyboard.js";
import {
  setupInteractions,
  toggleEditMode,
  isEditModeActive,
} from "./interactions.js";

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
  animationId: null,
  isInitialized: false,
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

    // Create keyboards
    const keyboards = createKeyboards(keymap);
    app.leftKeyboard = keyboards.leftKeyboard;
    app.rightKeyboard = keyboards.rightKeyboard;

    // Add keyboards to scene
    app.scene.add(app.leftKeyboard);
    app.scene.add(app.rightKeyboard);

    // Setup interactions
    setupInteractions(app.camera, app.renderer.domElement);

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
  animateFloating(app.leftKeyboard, app.rightKeyboard, time);

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

  // Add layer options
  Object.keys(layers).forEach((layerName) => {
    const option = document.createElement("option");
    option.value = layerName;
    option.textContent =
      layers[layerName].displayName || layerName.toUpperCase();
    if (layerName === currentLayer) {
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
  if (switchLayer(layerName)) {
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

    console.log("✅ Layer switched and keyboards rebuilt");
  }
}

/**
 * Handle edit mode toggle
 */
function handleEditModeToggle() {
  const isActive = toggleEditMode();
  const toggleBtn = document.getElementById("edit-mode-toggle");
  const exportBtn = document.getElementById("export-keymap");
  const interactiveHelp = document.getElementById("interactive-help");

  if (isActive) {
    toggleBtn.textContent = "Edit Mode: ON";
    toggleBtn.classList.add("active");
    exportBtn.style.display = "inline-block";
    interactiveHelp.textContent = "✏️ Click any key to edit its label!";
  } else {
    toggleBtn.textContent = "Edit Mode: OFF";
    toggleBtn.classList.remove("active");
    exportBtn.style.display = "none";
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

  // Export button
  const exportBtn = document.getElementById("export-keymap");
  if (exportBtn) {
    exportBtn.addEventListener("click", handleExportKeymap);
  }

  console.log("🎛️  UI controls initialized");
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
