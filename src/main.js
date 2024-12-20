import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

document.querySelector('#app').innerHTML = `
  <div>
    <canvas id="canvas"></canvas>
  </div>
`

function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');

  /*
    Init Renderer
  */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement)

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  
  /*
    Init Camera
  */
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 9);  

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  const scene = new THREE.Scene();

  /*
    Init Lights
  */
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init Terrain
  */
  
  const s = 100; // Size of the floor (width and depth)
  const geo = new THREE.BoxGeometry(s, 0.25, s, 10, 10, 10); // Create the floor geometry

  // Load the grass texture
  const textureLoader = new THREE.TextureLoader();
  const grassTexture = textureLoader.load('/assets/textures/image/green-grass.jpg'); // Replace with the actual path

  // Correct the aspect ratio of the texture to fit the floor
  grassTexture.wrapS = THREE.RepeatWrapping; // Wrap horizontally
  grassTexture.wrapT = THREE.RepeatWrapping; // Wrap vertically
  grassTexture.repeat.set(s / 10, s / 10); // Scale the texture to fit the floor dimensions

  // Create material with the grass texture
  const mat = new THREE.MeshStandardMaterial({
    map: grassTexture, // Apply the texture map
  });

  // Create the mesh and apply the material
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, -2, -1); // Set the position of the floor
  mesh.receiveShadow = true; // Make sure the floor receives shadows
  mesh.name = 'floating-floor'; // Name the mesh for reference
  
  // Add the floor mesh to the scene
  scene.add(mesh);

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init Control
  */
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableZoom = true;
  orbitControls.enablePan = true;
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  window.addEventListener('resize', () => onWindowResize(camera, renderer));
  onWindowResize(camera, renderer);

  
  animate(renderer, scene, camera);
}

/**
 * Adjusts the camera and renderer on window resize.
 * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
 * @param {THREE.WebGLRenderer} renderer - The renderer to resize.
 */
function onWindowResize(camera, renderer) {
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
function animate(renderer, scene, camera) {
  function renderLoop() {
    const mesh = scene.getObjectByName('PointsMesh')
   
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
}

main()

