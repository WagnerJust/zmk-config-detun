// Scene setup module - Initializes Three.js scene, camera, renderer, and lights

/**
 * Initialize the Three.js scene
 * @returns {THREE.Scene}
 */
export function createScene() {
  const scene = new THREE.Scene();
  // Soft neutral background with warmth
  scene.background = new THREE.Color(0xe8e8e0);
  // Very subtle fog for depth
  scene.fog = new THREE.Fog(0xe8e8e0, 80, 150);
  return scene;
}

/**
 * Initialize the camera
 * @returns {THREE.PerspectiveCamera}
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  // Position camera to view from user's perspective (sitting at desk)
  camera.position.set(0, 18, 30);
  camera.lookAt(0, 10, 0);
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
  controls.minDistance = 15;
  controls.maxDistance = 60;
  controls.maxPolarAngle = Math.PI / 2.2; // Prevent going under desk
  controls.minPolarAngle = Math.PI / 6; // Don't go too high above
  controls.target.set(0, 10, 0);
  return controls;
}

/**
 * Setup scene lighting
 * @param {THREE.Scene} scene - The scene to add lights to
 */
export function setupLights(scene) {
  // Softer ambient light for better contrast
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Main window light - bright and soft
  const windowLight = new THREE.DirectionalLight(0xfff9f0, 1.2);
  windowLight.position.set(0, 30, -40);
  windowLight.castShadow = true;
  windowLight.shadow.camera.left = -50;
  windowLight.shadow.camera.right = 50;
  windowLight.shadow.camera.top = 50;
  windowLight.shadow.camera.bottom = -20;
  windowLight.shadow.mapSize.width = 2048;
  windowLight.shadow.mapSize.height = 2048;
  windowLight.shadow.bias = -0.0001;
  scene.add(windowLight);

  // Soft fill light from sides
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-20, 20, 10);
  scene.add(fillLight);

  // Hemisphere light for natural ambient
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe8e8e8, 0.3);
  scene.add(hemiLight);

  return { ambientLight, windowLight, fillLight, hemiLight };
}

/**
 * Create ground plane
 * @returns {THREE.Mesh}
 */
export function createGround() {
  // Light wood floor with visible grain
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4c4b0,
    roughness: 0.85,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  return ground;
}

/**
 * Create wooden desk surface
 * @returns {THREE.Group}
 */
export function createDesk() {
  const deskGroup = new THREE.Group();

  // Clean white desk surface with slight texture
  const deskTopGeometry = new THREE.BoxGeometry(60, 1.5, 35);
  const deskTopMaterial = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.3,
    metalness: 0.02,
  });
  const deskTop = new THREE.Mesh(deskTopGeometry, deskTopMaterial);
  deskTop.position.y = 9;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  // White/light legs with substance
  const legGeometry = new THREE.BoxGeometry(1.0, 8.5, 1.0);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.4,
    metalness: 0.05,
  });

  const legPositions = [
    [-25, 4.25, -14],
    [25, 4.25, -14],
    [-25, 4.25, 14],
    [25, 4.25, 14],
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    leg.receiveShadow = true;
    deskGroup.add(leg);
  });

  return deskGroup;
}

/**
 * Create back wall
 * @returns {THREE.Mesh}
 */
export function createWall() {
  const wallGeometry = new THREE.PlaneGeometry(100, 50);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f0,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(0, 25, -30);
  wall.receiveShadow = true;
  return wall;
}

/**
 * Create side walls
 * @returns {THREE.Group}
 */
export function createSideWalls() {
  const wallsGroup = new THREE.Group();
  
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f0,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Left wall (barely visible)
  const leftWallGeometry = new THREE.PlaneGeometry(80, 50);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.set(-50, 25, 10);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  wallsGroup.add(leftWall);

  // Right wall (barely visible)
  const rightWallGeometry = new THREE.PlaneGeometry(80, 50);
  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
  rightWall.position.set(50, 25, 10);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  wallsGroup.add(rightWall);

  return wallsGroup;
}

/**
 * Create window on wall
 * @returns {THREE.Group}
 */
export function createWindow() {
  const windowGroup = new THREE.Group();

  // Large window with bright white frame
  const frameGeometry = new THREE.BoxGeometry(45, 25, 0.4);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, 23, -29.6);
  windowGroup.add(frame);

  // Soft, diffused window glass (like the reference - bright daylight)
  const glassGeometry = new THREE.PlaneGeometry(43, 23);
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0e8,
    transparent: true,
    opacity: 0.5,
    roughness: 0.2,
    metalness: 0.0,
    emissive: 0xffffe0,
    emissiveIntensity: 0.2,
  });
  const glass = new THREE.Mesh(glassGeometry, glassMaterial);
  glass.position.set(0, 23, -29.5);
  windowGroup.add(glass);

  // Window divider (subtle cross pattern)
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    roughness: 0.3,
    metalness: 0.1,
  });
  
  // Vertical divider
  const vDividerGeometry = new THREE.BoxGeometry(0.3, 23, 0.2);
  const vDivider = new THREE.Mesh(vDividerGeometry, dividerMaterial);
  vDivider.position.set(0, 23, -29.4);
  windowGroup.add(vDivider);
  
  // Horizontal divider
  const hDividerGeometry = new THREE.BoxGeometry(43, 0.3, 0.2);
  const hDivider = new THREE.Mesh(hDividerGeometry, dividerMaterial);
  hDivider.position.set(0, 23, -29.4);
  windowGroup.add(hDivider);

  return windowGroup;
}

/**
 * Create desk mat/mouse pad
 * @returns {THREE.Mesh}
 */
export function createDeskMat() {
  // Dark charcoal desk mat with fabric texture
  const matGeometry = new THREE.BoxGeometry(45, 0.15, 28);
  const matMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.95,
    metalness: 0.0,
  });
  const mat = new THREE.Mesh(matGeometry, matMaterial);
  mat.position.set(0, 9.85, 0);
  mat.castShadow = true;
  mat.receiveShadow = true;
  return mat;
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
  
  // Add environment
  const ground = createGround();
  const desk = createDesk();
  const deskMat = createDeskMat();
  const backWall = createWall();
  const sideWalls = createSideWalls();
  const windowObj = createWindow();

  scene.add(ground);
  scene.add(desk);
  scene.add(deskMat);
  scene.add(backWall);
  scene.add(sideWalls);
  scene.add(windowObj);

  // Setup resize handler
  window.addEventListener("resize", () => handleResize(camera, renderer));

  return {
    scene,
    camera,
    renderer,
    controls,
    lights,
    ground,
    desk,
    deskMat,
    backWall,
    sideWalls,
    windowObj,
  };
}
