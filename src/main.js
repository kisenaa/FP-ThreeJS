import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

document.querySelector('#app').innerHTML = `
  <div>
    <canvas id="canvas"></canvas>
  </div>
`;

function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');

  /*
    Init Renderer
  */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x87CEFA);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  document.body.appendChild(renderer.domElement);

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init Camera
  */
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 2);  

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  const scene = new THREE.Scene();

  /*
    Init Lights
  */
  // Ambient light to give overall lighting to the scene
  const ambientLight = new THREE.AmbientLight(0x87CEFA, 1); // Decreased intensity slightly
  scene.add(ambientLight);

  // Directional light to simulate sunlight (higher intensity to brighten the scene)
  const dirLight = new THREE.DirectionalLight(0x87CEFA, 3); // Adjusted intensity
  dirLight.position.set(0, 20, 0);
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

  // Hemisphere light (simulate ambient sky light)
  const hemiLight = new THREE.HemisphereLight(0x87CEFA, 0x87CEFA, 0.3); // Light blue ambient sky color
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init Terrains
  */
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/assets/textures/gltf/scene.gltf', // Path to your glTF model (can be a .glb or .gltf file)
    (gltf) => {
      const mesh = gltf.scene;
      mesh.traverse((child, index) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        console.log(index);
        if (index == 0) {
          return;
        }
      });
      mesh.position.set(0, 0, 0);

      scene.add(gltf.scene); // Add the model's scene to the Three.js scene
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('An error happened', error);
    }
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init HDRI
  */
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/assets/hdr/qwantani_4k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture; // Optional
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Add Animals or Trees
  */
  function addAnimalOrTree(scene, objPath, mtlPath, position, scale, rotation) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        objPath,
        (obj) => {
          obj.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          obj.position.set(position.x, position.y, position.z);
          obj.scale.set(scale.x, scale.y, scale.z);
          obj.rotation.set(rotation.x, rotation.y, rotation.z);

          scene.add(obj);
        },
        (xhr) => {
          console.log(`Model ${objPath} ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.error(`Gagal memuat model ${objPath}:`, error);
        }
      );
    });
  }

  // Add animals
  addAnimalOrTree(scene, '/assets/models/BEE.obj', '/assets/models/BEE.mtl', { x: 0, y: -0.03, z: 0 }, { x: 0.5, y: 0.5, z: 0.5 }, { x: Math.PI / 2, y: -80, z: -20.5 });
  addAnimalOrTree(scene, '/assets/models/BEE.obj', '/assets/models/BEE.mtl', { x: 0.012, y: -0.03, z: 0 }, { x: 0.5, y: 0.5, z: 0.5 }, { x: Math.PI / 2, y: -80, z: -20.5 });
  addAnimalOrTree(scene, '/assets/models/BEE.obj', '/assets/models/BEE.mtl', { x: 0.019, y: -0.03, z: 0.012 }, { x: 0.5, y: 0.5, z: 0.5 }, { x: Math.PI / 2, y: -80, z: -20.5 });

  // Add tree
  addAnimalOrTree(scene, '/assets/models/tree.obj', '/assets/models/tree.mtl', { x: -3, y: 0, z: 2 }, { x: 2, y: 2, z: 2 }, { x: 0, y: 0, z: 0 });

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init Controls
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
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
}

main();
