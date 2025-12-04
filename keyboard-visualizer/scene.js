// Scene setup module - Initializes Three.js scene, camera, renderer, and lights

/**
 * Initialize the Three.js scene
 * @returns {THREE.Scene}
 */
export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    return scene;
}

/**
 * Initialize the camera
 * @returns {THREE.PerspectiveCamera}
 */
export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);
    return camera;
}

/**
 * Initialize the renderer
 * @param {HTMLElement} container - Container element for the renderer
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    return renderer;
}

/**
 * Initialize orbit controls
 * @param {THREE.Camera} camera - The camera to control
 * @param {HTMLElement} domElement - The DOM element for controls
 * @returns {THREE.OrbitControls}
 */
export function createControls(camera, domElement) {
    const controls = new THREE.OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    return controls;
}

/**
 * Setup scene lighting
 * @param {THREE.Scene} scene - The scene to add lights to
 */
export function setupLights(scene) {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point light for accent
    const pointLight = new THREE.PointLight(0x667eea, 0.5);
    pointLight.position.set(-10, 10, 10);
    scene.add(pointLight);

    return { ambientLight, directionalLight, pointLight };
}

/**
 * Create ground plane
 * @returns {THREE.Mesh}
 */
export function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f0f1e,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    return ground;
}

/**
 * Handle window resize
 * @param {THREE.Camera} camera - The camera to update
 * @param {THREE.WebGLRenderer} renderer - The renderer to update
 */
export function handleResize(camera, renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Initialize complete scene with all components
 * @param {HTMLElement} container - Container element
 * @returns {Object} - Object containing all scene components
 */
export function initScene(container) {
    const scene = createScene();
    const camera = createCamera();
    const renderer = createRenderer(container);
    const controls = createControls(camera, renderer.domElement);
    const lights = setupLights(scene);
    const ground = createGround();

    scene.add(ground);

    // Setup resize handler
    window.addEventListener('resize', () => handleResize(camera, renderer));

    return {
        scene,
        camera,
        renderer,
        controls,
        lights,
        ground
    };
}
