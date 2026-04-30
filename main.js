import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'; // NOWE: Import DRACO
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ==========================================
// 1. Inicjalizacja podstawowa
// ==========================================
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
renderer.toneMappingExposure = 1.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
camera.position.set(4, 5, 11);

// Kontrolki
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

// Podłoże
const groundGeometry = new THREE.CircleGeometry(5, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true; 
groundMesh.castShadow = false;
scene.add(groundMesh);

// Oświetlenie podstawowe
const ambientLight = new THREE.AmbientLight(0xEEEEEEEE, 0.1); 
scene.add(ambientLight); 

const keyLight = new THREE.SpotLight(0xffffff, 150, 50, 0.35, 0.5);
keyLight.position.set(5, 10, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.radius = 4; 
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xddeeff, 0.4);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xEEEEEE, 0.6);
rimLight.position.set(0, 5, -10);
scene.add(rimLight);


// ==========================================
// 2. KONFIGURACJA LOADERÓW (W TYM DRACO)
// ==========================================
const rgbeLoader = new RGBELoader();

// Konfiguracja DRACOLoadera - wskazujemy ścieżkę do dekoderów WebAssembly (wersja musi się zgadzać z Twoim importmap, czyli 0.163.0)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@v0.163.0/examples/jsm/libs/draco/gltf/');

// Konfiguracja GLTFLoadera
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader); // Podpinamy silnik DRACO do naszego głównego loadera


// ==========================================
// 3. RÓWNOLEGŁE ŁADOWANIE (ASYNC/AWAIT)
// ==========================================
async function initScene() {
  try {
    console.log('Rozpoczęcie pobierania zasobów (z użyciem DRACO)...');
    
    // Obie operacje startują jednocześnie
    const [texture, gltf] = await Promise.all([
      rgbeLoader.loadAsync('studio1.hdr'),
      gltfLoader.loadAsync('fiat500.glb')
    ]);

    console.log('Zasoby pobrane i zdekodowane. Budowanie sceny...');

    // A. Środowisko
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.environmentRotation = new THREE.Euler(0, Math.PI / 2, 0);

    // B. Model
    const mesh = gltf.scene;

    mesh.traverse((child) => {
      if (!child.isMesh) return;

      const name = child.name.toLowerCase();

      // 🪟 SZYBY
      if (
        name.includes("nissan_gtr_r35_nismo-007001") || 
        name.includes("body_4") || 
        name.includes("body_9") ||
        name.includes("body_14") || 
        name.includes("body_19")
      ) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x88aaff,
          metalness: 0,
          roughness: 0,
          transmission: 1, 
          transparent: true,
          opacity: 1,
          envMapIntensity: 1
        });
      }
      // 🛞 KOŁA
      else if (name.includes("nissan")) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.2,
          roughness: 0.8
        });
      }
      // HAMULCE
      else if(name.includes("brake")) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x666666,
          metalness: 0.2,
          roughness: 0.8
        });
      }
      // 🚗 KAROSERIA
      else if (name.includes("body")) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x242629,
          metalness: 1,
          roughness: 0.25,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          envMapIntensity: 2
        });
      }
      // 🔩 RESZTA
      else {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.5,
          roughness: 0.5,
          envMapIntensity: 1
        });
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    mesh.position.set(0, 0, 0);
    scene.add(mesh);
    
    console.log('Model wyrenderowany pomyślnie!');

  } catch (error) {
    console.error('Wystąpił błąd podczas ładowania zasobów 3D:', error);
  }
}

initScene();


// ==========================================
// 4. Pętla renderowania i responsywność
// ==========================================
function updateSize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', updateSize);
updateSize();
animate();