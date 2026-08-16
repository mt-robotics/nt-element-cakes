import { gsap } from 'gsap';
import * as THREE from 'three';
import type { SceneRig } from './scene';
import type { TiramisuModel } from './tiramisu';

interface InteractionOptions {
  onCrack: () => void;
}

export interface InteractionController {
  update: (delta: number) => void;
  reset: () => void;
  crack: () => void;
}

const pointer = new THREE.Vector2();
const targetPointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function createInteraction(rig: SceneRig, tiramisu: TiramisuModel, options: InteractionOptions): InteractionController {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.18);
  const hit = new THREE.Vector3();
  const previous = new THREE.Vector3().copy(tiramisu.spoon.position);
  let cracked = false;
  let dragging = false;
  let lastX = 0;

  function setPointer(event: PointerEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetPointer.copy(pointer);
  }

  function crack() {
    if (cracked) return;
    cracked = true;
    const wedges = tiramisu.crack();
    gsap.to(tiramisu.spoon.position, { y: 0.94, duration: 0.22, ease: 'power3.in' });
    gsap.to(tiramisu.spoon.rotation, { x: -1.42, z: 0.08, duration: 0.26, ease: 'back.in(2)' });
    wedges.forEach((wedge, i) => {
      const angle = Number(wedge.userData.angle || 0);
      gsap.to(wedge.position, {
        x: Math.cos(angle) * (0.42 + i * 0.035),
        z: Math.sin(angle) * (0.42 + i * 0.035),
        y: 0.56 - i * 0.035,
        duration: 1.15,
        delay: i * 0.035,
        ease: 'power4.out'
      });
      gsap.to(wedge.rotation, {
        x: (Math.random() - 0.5) * 1.2,
        y: -0.8 + i * 0.32,
        z: angle + 0.72,
        duration: 1.15,
        delay: i * 0.035,
        ease: 'power4.out'
      });
    });
    // After the crack, retire the spoon: sink it, then fade it out so the
    // pointer returns to the normal (theme) cursor over the DOM gallery.
    gsap.to(tiramisu.spoon.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5, delay: 0.45, ease: 'power2.in' });
    gsap.to(rig.camera.position, { z: 5.05, y: 2.15, duration: 1.0, ease: 'power2.inOut' });
    gsap.delayedCall(0.48, options.onCrack);
  }

  window.addEventListener('pointermove', (event) => {
    setPointer(event);
    if (dragging) {
      tiramisu.group.rotation.y += (event.clientX - lastX) * 0.007;
      lastX = event.clientX;
    }
  });

  window.addEventListener('pointerdown', (event) => {
    setPointer(event);
    dragging = true;
    lastX = event.clientX;
  });
  window.addEventListener('pointerup', () => (dragging = false));

  window.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target && target.closest('button, a, .cake-card, .copy-panel, .gallery')) return;

    raycaster.setFromCamera(pointer, rig.camera);
    const topHit = raycaster.intersectObject(tiramisu.cocoaTop, false)[0];
    if (topHit || !cracked) crack();
  });

  const update = (delta: number) => {
    if (!cracked) {
      raycaster.setFromCamera(targetPointer, rig.camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        hit.x = THREE.MathUtils.clamp(hit.x, -3.4, 3.4);
        hit.z = THREE.MathUtils.clamp(hit.z, -2.6, 3.4);
        tiramisu.spoon.position.lerp(hit, 0.55);
        const dx = tiramisu.spoon.position.x - previous.x;
        const dz = tiramisu.spoon.position.z - previous.z;
        tiramisu.spoon.rotation.z = THREE.MathUtils.lerp(tiramisu.spoon.rotation.z, 0.35 - dx * 1.4, 0.4);
        tiramisu.spoon.rotation.x = THREE.MathUtils.lerp(tiramisu.spoon.rotation.x, -0.85 + dz * 1.1, 0.4);
        previous.copy(tiramisu.spoon.position);
      }
      if (!dragging) tiramisu.group.rotation.y += delta * 0.12;
    }
  };

  const reset = () => {
    cracked = false;
    tiramisu.reset();
    gsap.to(tiramisu.spoon.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
    gsap.to(rig.camera.position, { z: 6.2, y: 2.55, duration: 0.8, ease: 'power2.out' });
    gsap.to(tiramisu.spoon.position, { y: 1.18, duration: 0.45, ease: 'back.out(1.8)' });
    gsap.to(tiramisu.spoon.rotation, { x: -0.85, z: 0.35, duration: 0.45, ease: 'power2.out' });
  };

  return { update, reset, crack };
}
