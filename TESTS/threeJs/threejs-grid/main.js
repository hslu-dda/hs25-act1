import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

// Helper function
function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Get container
const container = document.getElementById("scene-container");

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);

// === ISOMETRIC CAMERA ===
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 30;

const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);

camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = false;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 4;
controls.minDistance = 20;
controls.maxDistance = 60;

// Keyboard handler
const handleKeyPress = (e) => {
  // Add your key handling logic here
};
window.addEventListener("keydown", handleKeyPress);

// === LIGHTING ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 20, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

// === CREATE CUBES ===
const cubes = [];
const geometry = new THREE.BoxGeometry(2, 2, 2);
const gridSize = 10;

for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const colorValue = (x + z) / (gridSize * 2);
    const color = new THREE.Color();
    color.setHSL(map(colorValue, 0, 1, 0.5, 0.7), 0.7, map(colorValue, 0, 1, 0.4, 0.5));

    const material = new THREE.MeshLambertMaterial({
      color: color,
      flatShading: true,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = (x - gridSize / 2) * 2.1;
    cube.position.z = (z - gridSize / 2) * 2.1;
    cube.position.y = 0;
    cube.castShadow = true;

    // === ADD THICK EDGES ===
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const positions = edgesGeometry.attributes.position.array;

    const lineSegmentsGeometry = new LineSegmentsGeometry();
    lineSegmentsGeometry.setPositions(Array.from(positions));

    const lineMaterial = new LineMaterial({
      color: 0x222222,
      linewidth: 2,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });

    const line = new LineSegments2(lineSegmentsGeometry, lineMaterial);
    cube.add(line);

    cube.userData = {
      gridX: x,
      gridZ: z,
      lineGeometry: lineSegmentsGeometry,
      lineMaterial: lineMaterial,
    };

    scene.add(cube);
    cubes.push(cube);
  }
}

// === ANIMATION LOOP ===
let time = 0;
let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);

  time += 0.03;

  cubes.forEach((cube) => {
    const { gridX, gridZ } = cube.userData;
    const distance = Math.sqrt(gridX * gridX + gridZ * gridZ);
    const wave = Math.sin(distance * 0.6 - time);
    const scale = map(wave, -1, 1, 0.2, 2.0);
    cube.scale.set(1, scale, 1);
    cube.position.y = scale;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// === RESIZE HANDLER ===
function handleResize() {
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  cubes.forEach((cube) => {
    if (cube.userData.lineMaterial) {
      cube.userData.lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }
  });
}

window.addEventListener("resize", handleResize);

// === CLEANUP ===
window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationId);
  controls.dispose();
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyPress);

  if (container && renderer.domElement) {
    container.removeChild(renderer.domElement);
  }

  geometry.dispose();

  cubes.forEach((cube) => {
    cube.material.dispose();
    if (cube.userData.lineGeometry) {
      cube.userData.lineGeometry.dispose();
    }
    if (cube.userData.lineMaterial) {
      cube.userData.lineMaterial.dispose();
    }
  });

  renderer.dispose();
});
