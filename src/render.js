import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

/**
 * Initializes the renderer.
 * @param {HTMLCanvasElement} canvas - The canvas element to render on.
 * @returns {THREE.WebGLRenderer} The initialized WebGL renderer.
 */
export function initRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  return renderer;
}

/**
 * Initializes the camera.
 * @returns {THREE.PerspectiveCamera} The initialized perspective camera.
 */
export function initCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 9);
  return camera;
}

/**
 * Adds lights to the scene.
 * @param {THREE.Scene} scene - The scene to which lights will be added.
 */
export function initLights(scene) {
  const ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xaaaaaa, 1);
  dirLight.position.set(5, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.radius = 4;
  dirLight.shadow.bias = -0.00005;
  
  scene.add(dirLight);
}

/**
 * Creates the 3D model to be added to the scene.
 * @returns {THREE.Group} The created model group.
 */
export function createModel() {
  const texture = new THREE.TextureLoader().load('/assets/textures/particles/glow.png');

  // Create geometry and material for particles
  const geometry = new THREE.TorusKnotGeometry(2, 0.5, 150, 50, 3, 4);
  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: false,
    color: 0xffffff,
    map: texture,
    depthWrite: false,
    opacity: 0.1,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  // Create the particle mesh
  const mesh = new THREE.Points(geometry, material);
  mesh.userData.rotationSpeed = 0.001;  // Add some default rotation speed
  mesh.userData.scalingSpeed = 0.000;  // Add some scaling speed
  mesh.userData.bouncingSpeed = 0.00;  // Add some bouncing speed
  mesh.userData.currentStep = 0;
  mesh.userData.scalingStep = 0;
  mesh.name = 'PointsMesh';

  return mesh;
}

/**
 * Sets up camera controls, including drag and orbit controls.
 * @param {THREE.PerspectiveCamera} camera - The camera.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {THREE.Group} group - The model group to add drag controls.
 * @returns {OrbitControls} The orbit controls for the camera.
 */
export function setupControls(camera, renderer, group) {
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableZoom = true;
  orbitControls.enablePan = true;

  return orbitControls;
}

/**
 * Initializes the GUI for camera controls.
 * @param {THREE.PerspectiveCamera} camera - The camera to control.
 * @param {THREE.Scene} scene - The scene to render.
 */
export function initGUI(camera, scene) {
  const gui = new GUI();
  const points = scene.getObjectByName('PointsMesh')

  const Basicfolder = gui.addFolder('Basic Animations')
  Basicfolder.add(points.userData, 'rotationSpeed', 0, 0.1, 0.001)
  Basicfolder.add(points.userData, 'scalingSpeed', 0, 0.02, 0.001)
  Basicfolder.add(points.userData, 'bouncingSpeed', 0, 0.03, 0.001)

  const cameraFolder = gui.addFolder('Camera Perspective');
  cameraFolder.add(camera.position, 'x', 0, 50, 1);
  cameraFolder.add(camera.position, 'y', 0, 50, 1);
  cameraFolder.add(camera.position, 'z', 0, 50, 1);
  cameraFolder.add(camera, 'fov', 0, 200, 1);
  cameraFolder.add(camera, 'aspect', 0, 5, 0.001);
  cameraFolder.add(camera, 'near', 0, 2, 0.1);
  cameraFolder.add(camera, 'far', 0, 2000, 100);
}

/**
 * Adjusts the camera and renderer on window resize.
 * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
 * @param {THREE.WebGLRenderer} renderer - The renderer to resize.
 */
export function onWindowResize(camera, renderer) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;

  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/**
 * Starts the animation loop for rendering the scene.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {THREE.Scene} scene - The scene to render.
 * @param {THREE.PerspectiveCamera} camera - The camera for rendering.
 */
export function animate(renderer, scene, camera) {
  function renderLoop() {
    const mesh = scene.getObjectByName('PointsMesh')
    mesh.rotation.x += mesh.userData.rotationSpeed;
    mesh.rotation.y += mesh.userData.rotationSpeed;
    mesh.rotation.z += mesh.userData.rotationSpeed;

    mesh.userData.currentStep += mesh.userData.bouncingSpeed;
    mesh.position.x = Math.cos(mesh.userData.currentStep);
    mesh.position.y = Math.abs(Math.sin(mesh.userData.currentStep)) * 2;

    mesh.userData.scalingStep += mesh.userData.scalingSpeed;
    const scaleX = Math.abs(Math.sin(mesh.userData.scalingStep * 3 + 0.5 * Math.PI));
    const scaleY = Math.abs(Math.cos(mesh.userData.scalingStep * 2));
    const scaleZ = Math.abs(Math.sin(mesh.userData.scalingStep * 4 + 0.5 * Math.PI));
    mesh.scale.set(scaleX, scaleY, scaleZ);

    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
}