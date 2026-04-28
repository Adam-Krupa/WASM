import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


 const canvas = document.querySelector("#car-canvas");
 const container = document.querySelector(".canvas-container");

 const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
 renderer.outputColorSpace = THREE.SRGBColorSpace;
const width = container.clientWidth;
const height = container.clientHeight;
renderer.setSize(width, height);
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2); 
scene.add(ambientLight); 
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 7;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const groundGeometry = new THREE.CircleGeometry(5, 32);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.ShadowMaterial({
  opacity: 0.3
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true; // 🔥 KLUCZOWE
groundMesh.castShadow = false;

scene.add(groundMesh);

const keyLight = new THREE.SpotLight(0xffffff, 150, 50, 0.35, 0.5);
keyLight.position.set(5, 10, 5);

keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.radius = 4; // 🔥 miękki cień
keyLight.shadow.bias = -0.0005;

scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 5, -10);
scene.add(rimLight);

const loader = new GLTFLoader();
loader.load('fiat500.glb', (gltf) => {
  console.log('loading model');
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 1, 0);
  scene.add(mesh);
}
);

window.addEventListener('resize', () => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
function updateSize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
updateSize();

window.addEventListener('resize', updateSize);
animate();
