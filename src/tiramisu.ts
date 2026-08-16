import * as THREE from 'three';

export interface TiramisuModel {
  group: THREE.Group;
  plate: THREE.Mesh;
  cocoaTop: THREE.Mesh;
  mascarponeReveal: THREE.Mesh;
  crackWedges: THREE.Group;
  spoon: THREE.Group;
  crack: () => THREE.Mesh[];
  reset: () => void;
}

function noiseTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 68 + Math.random() * 65;
    image.data[i] = v;
    image.data[i + 1] = v * 0.64;
    image.data[i + 2] = v * 0.36;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function cakeCylinder(radius: number, height: number, color: string, y: number): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(radius, radius * 1.01, height, window.innerWidth < 700 ? 72 : 128, 1, false);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeWedge(index: number, total: number, radius: number): THREE.Mesh {
  const shape = new THREE.Shape();
  const start = (index / total) * Math.PI * 2;
  const end = ((index + 1) / total) * Math.PI * 2 - 0.025;
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, start, end, false);
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.105, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.01, bevelSegments: 1 });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0.86, 0);
  const material = new THREE.MeshStandardMaterial({
    color: '#3C2415',
    roughness: 0.93,
    map: noiseTexture(64),
    bumpMap: noiseTexture(64),
    bumpScale: 0.04
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.angle = (start + end) / 2;
  return mesh;
}

export function createSpoon(): THREE.Group {
  const spoon = new THREE.Group();
  const silver = new THREE.MeshStandardMaterial({ color: '#d9dde1', metalness: 0.82, roughness: 0.28, envMapIntensity: 0.8 });

  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 18), silver);
  bowl.scale.set(0.72, 0.14, 1.18);
  bowl.rotation.x = -0.22;
  bowl.castShadow = true;
  spoon.add(bowl);

  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 12), new THREE.MeshStandardMaterial({ color: '#aeb5bc', metalness: 0.9, roughness: 0.18 }));
  inner.scale.set(0.66, 0.045, 1.02);
  inner.position.y = 0.012;
  inner.position.z = 0.01;
  spoon.add(inner);

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.55, 18), silver);
  handle.rotation.x = Math.PI / 2;
  handle.position.z = 0.83;
  handle.castShadow = true;
  spoon.add(handle);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.047, 18, 8), silver);
  tip.scale.set(1, 0.65, 1.8);
  tip.position.z = 1.62;
  spoon.add(tip);

  spoon.rotation.set(-0.85, 0, 0.35);
  spoon.position.set(0.8, 1.7, 1.2);
  return spoon;
}

function makeBean(): THREE.Group {
  // Decorative cocoa beans — no longer clickable social links.
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: '#6F4E37', roughness: 0.55, metalness: 0.02 });
  const bean = new THREE.Mesh(new THREE.SphereGeometry(0.16, 28, 16), material);
  bean.scale.set(0.72, 0.48, 1.08);
  bean.castShadow = true;
  const groove = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.23, 4, 8), new THREE.MeshStandardMaterial({ color: '#2C1810', roughness: 0.8 }));
  groove.rotation.x = Math.PI / 2;
  groove.position.y = 0.045;
  group.add(bean, groove);
  return group;
}

export function createTiramisu(): TiramisuModel {
  const group = new THREE.Group();

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(2.75, 2.9, 0.12, 128),
    new THREE.MeshStandardMaterial({ color: '#f5eadc', roughness: 0.43, metalness: 0.08 })
  );
  plate.position.y = -0.52;
  plate.receiveShadow = true;
  group.add(plate);

  const body = cakeCylinder(1.72, 1.0, '#FFF9EF', 0.05);
  group.add(body);

  [-0.26, 0.12, 0.43].forEach((y) => group.add(cakeCylinder(1.735, 0.085, '#6F4E37', y)));

  const mascarponeReveal = cakeCylinder(1.58, 0.05, '#FFF9EF', 0.83);
  mascarponeReveal.material = new THREE.MeshStandardMaterial({ color: '#fff6df', roughness: 0.52, emissive: '#3b2614', emissiveIntensity: 0.05 });
  group.add(mascarponeReveal);

  const cocoaTop = cakeCylinder(1.76, 0.11, '#3C2415', 0.9);
  const cocoaMat = cocoaTop.material as THREE.MeshStandardMaterial;
  cocoaMat.map = noiseTexture();
  cocoaMat.bumpMap = noiseTexture();
  cocoaMat.bumpScale = 0.035;
  cocoaMat.roughness = 0.95;
  group.add(cocoaTop);

  const crackWedges = new THREE.Group();
  crackWedges.visible = false;
  for (let i = 0; i < 6; i += 1) crackWedges.add(makeWedge(i, 6, 1.77));
  group.add(crackWedges);

  const beans = [0, 1, 2].map((i) => {
    const bean = makeBean();
    const angle = (i / 3) * Math.PI * 2 + 0.55;
    bean.position.set(Math.cos(angle) * 2.6, 0.42 + i * 0.04, Math.sin(angle) * 1.65);
    bean.rotation.set(0.45, angle, -0.2);
    return bean;
  });
  beans.forEach((bean) => group.add(bean));

  const spoon = createSpoon();

  const crack = () => {
    cocoaTop.visible = false;
    crackWedges.visible = true;
    return crackWedges.children as THREE.Mesh[];
  };

  const reset = () => {
    cocoaTop.visible = true;
    crackWedges.visible = false;
    crackWedges.children.forEach((child: THREE.Object3D) => {
      child.position.set(0, 0, 0);
      child.rotation.set(0, 0, 0);
      child.visible = true;
    });
    group.rotation.set(0, 0, 0);
  };

  return { group, plate, cocoaTop, mascarponeReveal, crackWedges, spoon, crack, reset };
}
