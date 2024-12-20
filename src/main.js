import './style.css'
import * as THREE from 'three';
import { initRenderer, initCamera, initLights, createModel, setupControls, initGUI, onWindowResize, animate } from './render';

document.querySelector('#app').innerHTML = `
  <div>
    <canvas id="canvas"></canvas>
  </div>
`

function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');
  const renderer = initRenderer(canvas);
  const camera = initCamera();
  
  const scene = new THREE.Scene();
  initLights(scene);

  const Model = createModel();
  scene.add(Model);

  const orbitControls = setupControls(camera, renderer, Model);
  initGUI(camera, scene);

  window.addEventListener('resize', () => onWindowResize(camera, renderer));
  onWindowResize(camera, renderer);
  document.body.appendChild(renderer.domElement)

  
  animate(renderer, scene, camera);
}


main()