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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5); 
scene.add(ambientLight); 
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 10;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const groundGeometry = new THREE.CircleGeometry(5,32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshPhongMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.1
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;

scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xff00ff, 300, 100, 0.45, 0.5 );
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

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

  mesh.position.set(0, 0, 0);
  scene.add(mesh);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

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
