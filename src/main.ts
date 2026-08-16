import './style.css';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { config } from './config';
import { createInteraction } from './interaction';
import { createScene } from './scene';
import { createTiramisu } from './tiramisu';

const canvas = document.querySelector<HTMLCanvasElement>('#scene');
if (!canvas) throw new Error('Scene canvas missing');

const brandTitle = document.querySelector<HTMLElement>('#brand-title');
const tagline = document.querySelector<HTMLElement>('#tagline');
const about = document.querySelector<HTMLElement>('#about-text');
const gallery = document.querySelector<HTMLElement>('#gallery');
const introPanel = document.querySelector<HTMLElement>('#intro-panel');
const loading = document.querySelector<HTMLElement>('#loading');
const resetButton = document.querySelector<HTMLButtonElement>('#reset');
const cta = document.querySelector<HTMLButtonElement>('#spoon-cta');
const cardArc = document.querySelector<HTMLElement>('#card-arc');
const socialLabel = document.querySelector<HTMLElement>('#social-label');

if (brandTitle) brandTitle.textContent = config.brandName;
if (tagline) tagline.textContent = config.tagline;
if (about) about.textContent = config.aboutText;

type DragState = { active: boolean; startX: number; rotation: number };

function makeGallery() {
  if (!cardArc) return;
  cardArc.innerHTML = '';
  config.cakeImages.forEach((src, i) => {
    const card = document.createElement('article');
    card.className = 'cake-card';
    card.style.setProperty('--i', String(i));
    card.style.setProperty('--total', String(config.cakeImages.length));
    card.innerHTML = `<div class="cake-card__inner"><img src="${src}" alt="NT Element Cakes gallery cake ${i + 1}" draggable="false"/><span>Spin me</span></div>`;
    const state: DragState = { active: false, startX: 0, rotation: -10 + i * 2 };
    const inner = card.querySelector<HTMLElement>('.cake-card__inner')!;
    const paint = () => {
      inner.style.transform = `rotateY(${state.rotation}deg) rotateX(4deg)`;
    };
    paint();
    card.addEventListener('pointerdown', (event) => {
      state.active = true;
      state.startX = event.clientX;
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener('pointermove', (event) => {
      if (!state.active) return;
      state.rotation += (event.clientX - state.startX) * 0.35;
      state.startX = event.clientX;
      paint();
    });
    card.addEventListener('pointerup', () => (state.active = false));
    cardArc.appendChild(card);
  });
}

makeGallery();

const rig = createScene(canvas);
const tiramisu = createTiramisu(config.socials);
rig.scene.add(tiramisu.group, tiramisu.spoon);

const controller = createInteraction(rig, tiramisu, {
  onCrack: () => {
    gallery?.classList.add('is-visible');
    introPanel?.classList.add('is-hidden');
    resetButton?.classList.add('is-visible');
    gsap.fromTo('.cake-card', { y: 70, opacity: 0, rotateZ: -3 }, { y: 0, opacity: 1, rotateZ: 0, stagger: 0.055, duration: 0.75, ease: 'power3.out' });
  },
  onBeanHover: (label) => {
    if (socialLabel) socialLabel.textContent = label || 'Hover a coffee bean to order';
  }
});

cta?.addEventListener('click', () => controller.crack());
resetButton?.addEventListener('click', () => {
  controller.reset();
  gallery?.classList.remove('is-visible');
  introPanel?.classList.remove('is-hidden');
  resetButton.classList.remove('is-visible');
});

const gradientPlane = new THREE.Mesh(
  new THREE.CircleGeometry(7, 96),
  new THREE.MeshBasicMaterial({ color: '#2C1810', transparent: true, opacity: 0.2 })
);
gradientPlane.position.set(0, -0.62, -0.1);
gradientPlane.rotation.x = -Math.PI / 2;
rig.scene.add(gradientPlane);

function animate() {
  const delta = rig.clock.getDelta();
  controller.update(delta);
  rig.dust.rotation.y += delta * 0.018;
  const positions = rig.dust.geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i += 1) {
    const y = positions.getY(i) + Math.sin(performance.now() * 0.0005 + i) * 0.0007;
    positions.setY(i, y > 4.8 ? -1.6 : y);
  }
  positions.needsUpdate = true;
  rig.camera.lookAt(0, 0.25, 0);
  rig.renderer.render(rig.scene, rig.camera);
  requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
  gsap.to(loading, { autoAlpha: 0, duration: 0.6, delay: 0.35, onComplete: () => loading?.remove() });
  gsap.fromTo('.brand-shell, .copy-panel, .social-label', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power2.out' });
});

animate();
