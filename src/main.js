import './style.css'
import { CharacterControls } from './characterControl';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

  document.querySelector('#app').innerHTML = `
    <div>
      <canvas id="canvas"></canvas>
    </div>
  `
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');

  /*
    Init Renderer
  */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x87CEFA);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  document.body.appendChild(renderer.domElement);

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
  Init Camera and Scene
  */
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = -2;


  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa8def0);
  //////////////////////////////////////////////////////////////////////////////////////////////////////


  /*
    Init Lights
  */

  // Ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Directional light - Adjust position closer to the character
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-20, 30, -20);  // Move light closer to the character, at a lower angle
  dirLight.castShadow = true;

  // Shadow settings
  dirLight.shadow.bias = -0.005; // Reduce shadow acne
  dirLight.shadow.camera.top = 100;  // Increase top boundary for longer shadow
  dirLight.shadow.camera.bottom = -100;  // Increase bottom boundary
  dirLight.shadow.camera.left = -100;  // Increase left boundary for wider shadow
  dirLight.shadow.camera.right = 100;  // Increase right boundary
  dirLight.shadow.camera.near = 0.1;  // Ensure shadows near the camera are included
  dirLight.shadow.camera.far = 200;  // Far distance for shadow camera
  dirLight.shadow.mapSize.width = 8192;  // Higher shadow map resolution
  dirLight.shadow.mapSize.height = 8192;

  scene.add(dirLight);

  // Hemisphere light (simulating ambient sky light)
  const hemiLight = new THREE.HemisphereLight(0x87CEFA, 0x87CEFA, 0.3);
  hemiLight.color.setHSL(0.6, 1, 0.6);  // Light blue color for sky
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);  // Ground color, darker
  hemiLight.position.set(0, 50, 0);
  hemiLight.intensity = 0.1;  // Reduce ambient light intensity to emphasize shadows
  scene.add(hemiLight);

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
    Init Terrains
  */
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/assets/textures/gltf/scene.gltf',
    (gltf) => {
      const mesh = gltf.scene;
      mesh.scale.set(20, 20, 20);
      mesh.traverse((child , index) => {
          if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
          console.log(index)
          if (index == 0) {
            return
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
  ////////////////////////////////////////////////////////////////////////////////////////////////////

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
    // Add animals with scale 10 and increased distance
    addAnimalOrTree(scene, '/assets/models/BEE.obj', '/assets/models/BEE.mtl', { x: 0, y: -0.03, z: 0 }, { x: 7, y: 7, z: 7 }, { x: Math.PI / 2, y: -80, z: -20.5 });
    addAnimalOrTree(scene, '/assets/models/BEE.obj', '/assets/models/BEE.mtl', { x: 0.5, y: -0.03, z: 0 }, { x: 7, y: 7, z: 7 }, { x: Math.PI / 2, y: -80, z: -20.5 });
    addAnimalOrTree(scene, '/assets/models/BEE.obj', '/assets/models/BEE.mtl', { x: 0.5, y: -0.03, z: 0.5 }, { x: 7, y: 7, z: 7 }, { x: Math.PI / 2, y: -80, z: -20.5 });

    // Add tree with scale 10
    //addAnimalOrTree(scene, '/assets/models/tree.obj', '/assets/models/tree.mtl', { x: -3, y: 0, z: 2 }, { x: 20, y: 20, z: 20 }, { x: 0, y: 0, z: 0 });
    // No tree model ???

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
  orbitControls.enableDamping = true
  orbitControls.minDistance = 1
  orbitControls.maxDistance = 15
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
  orbitControls.rotateSpeed = 0.5;  // Lower value for slower rotation

  orbitControls.update();

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
  Init Character Animation
  */

  let characterControls
  new GLTFLoader().load('/assets/textures/glb/JingLiu.glb', function (gltf) {
      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
      });
      scene.add(model);

      const gltfAnimations = gltf.animations;
      const mixer = new THREE.AnimationMixer(model);
      const animationsMap = new Map()
      gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
          animationsMap.set(a.name, mixer.clipAction(a))
      })

      characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle')
  });

  // Keyboard Control Keys
  const keysPressed = {  }
  document.addEventListener('keydown', (event) => {
      if (event.shiftKey && characterControls) {
          characterControls.switchRunToggle()
      } else {
          (keysPressed)[event.key.toLowerCase()] = true
      }
  }, false);
  document.addEventListener('keyup', (event) => {
      (keysPressed)[event.key.toLowerCase()] = false
  }, false);
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
  Init Animation
  */
  const clock = new THREE.Clock();
  function animate() {
      let mixerUpdateDelta = clock.getDelta();
      if (characterControls) {
          characterControls.update(mixerUpdateDelta, keysPressed);
      }
      orbitControls.update()
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
  }
  document.body.appendChild(renderer.domElement);
  animate();

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // Hanlde Resize
  function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);

