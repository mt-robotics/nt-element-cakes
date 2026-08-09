import * as THREE from 'three';

export interface SceneRig {
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  dust: THREE.Points;
  resize: () => void;
}

function makeDust(count: number): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color('#FFF9EF'), new THREE.Color('#9D8770'), new THREE.Color('#6F4E37')];

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 6 - 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.022,
      transparent: true,
      opacity: 0.42,
      vertexColors: true,
      depthWrite: false
    })
  );
}

export function createScene(canvas: HTMLCanvasElement): SceneRig {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#2C1810', 0.055);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.55, 6.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.35 : 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const ambient = new THREE.HemisphereLight('#fff2d5', '#2C1810', 1.2);
  scene.add(ambient);

  const key = new THREE.DirectionalLight('#ffd9a3', 4.6);
  key.position.set(4, 6, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  scene.add(key);

  const fill = new THREE.DirectionalLight('#8cc7ff', 1.1);
  fill.position.set(-5, 3, 2);
  scene.add(fill);

  const rim = new THREE.PointLight('#fff9ef', 2.2, 12);
  rim.position.set(0, 3.5, -4);
  scene.add(rim);

  const dust = makeDust(window.innerWidth < 700 ? 90 : 180);
  scene.add(dust);

  const clock = new THREE.Clock();
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.35 : 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resize);

  return { canvas, scene, camera, renderer, clock, dust, resize };
}
