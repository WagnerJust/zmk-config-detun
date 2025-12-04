// Main application file - Orchestrates all modules

import { keymap } from './keymap-data.js';
import { initScene } from './scene.js';
import { createKeyboards, animateFloating } from './keyboard.js';
import { setupInteractions } from './interactions.js';

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
    isInitialized: false
};

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Detun Keyboard Visualizer...');

    try {
        // Get container element
        const container = document.getElementById('container');
        if (!container) {
            throw new Error('Container element not found');
        }

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

        // Hide loading screen
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }

        app.isInitialized = true;
        console.log('Keyboard visualizer initialized successfully');

        // Start animation loop
        animate();

    } catch (error) {
        console.error('Failed to initialize keyboard visualizer:', error);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.textContent = 'Error loading visualizer. Please refresh the page.';
            loading.style.color = '#ff4444';
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

    console.log('Keyboard visualizer cleaned up');
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
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload
    window.addEventListener('beforeunload', cleanup);

    // Handle escape key to deselect
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const panel = document.getElementById('combinations-panel');
            if (panel && panel.classList.contains('active')) {
                panel.classList.remove('active');
                // Reset keyboard state (this would need to be exposed from interactions.js)
            }
        }
    });
}

/**
 * Start the application when DOM is ready
 */
function start() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
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
