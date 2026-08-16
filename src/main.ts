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
const galleryTitle = document.querySelector<HTMLElement>('#gallery-title');
const gallery = document.querySelector<HTMLElement>('#gallery');
const introPanel = document.querySelector<HTMLElement>('#intro-panel');
const loading = document.querySelector<HTMLElement>('#loading');
const resetButton = document.querySelector<HTMLButtonElement>('#reset');
const cta = document.querySelector<HTMLButtonElement>('#spoon-cta');
const cardArc = document.querySelector<HTMLElement>('#card-arc');

const lightbox = document.querySelector<HTMLElement>('#lightbox');
const lightboxImg = document.querySelector<HTMLImageElement>('.lightbox-img');
const lightboxClose = document.querySelector<HTMLButtonElement>('.lightbox-close');
const lightboxPrev = document.querySelector<HTMLButtonElement>('.lightbox-prev');
const lightboxNext = document.querySelector<HTMLButtonElement>('.lightbox-next');

if (brandTitle) brandTitle.textContent = config.brandName;
if (tagline) tagline.textContent = config.tagline;
if (about) about.textContent = config.aboutText;

// Social bar — wire hrefs from config.
document.querySelectorAll<HTMLAnchorElement>('[data-social]').forEach((link) => {
  const name = link.dataset.social;
  const social = config.socials.find((s) => s.platform.toLowerCase() === name);
  if (social) link.href = social.url;
});

type DragState = { active: boolean; startX: number; moved: boolean; rotation: number };

let lightboxIndex = -1;

function makeGallery() {
  if (!cardArc) return;
  cardArc.innerHTML = '';
  config.cakeImages.forEach((src, i) => {
    const card = document.createElement('article');
    card.className = 'cake-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View cake ${i + 1} up close`);
    card.style.setProperty('--i', String(i));
    card.style.setProperty('--total', String(config.cakeImages.length));
    card.innerHTML = `<div class="cake-card__inner"><img src="${src}" alt="NT Element Cakes gallery cake ${i + 1}" draggable="false"/></div>`;
    const state: DragState = { active: false, startX: 0, moved: false, rotation: -10 + i * 2 };
    const inner = card.querySelector<HTMLElement>('.cake-card__inner')!;
    const paint = () => {
      inner.style.transform = `rotateY(${state.rotation}deg) rotateX(4deg)`;
    };
    paint();
    card.addEventListener('pointerdown', (event) => {
      state.active = true;
      state.moved = false;
      state.startX = event.clientX;
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener('pointermove', (event) => {
      if (!state.active) return;
      const dx = event.clientX - state.startX;
      if (Math.abs(dx) > 4) state.moved = true;
      state.rotation += dx * 0.35;
      state.startX = event.clientX;
      paint();
    });
    card.addEventListener('pointerup', () => {
      const wasDrag = state.moved;
      state.active = false;
      if (!wasDrag) openLightbox(i);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(i);
      }
    });
    cardArc.appendChild(card);
  });
}

function openLightbox(i: number) {
  if (!lightbox || !lightboxImg) return;
  lightboxIndex = i;
  lightboxImg.src = config.cakeImages[i];
  lightboxImg.alt = `NT Element Cakes cake ${i + 1}`;
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.classList.add('is-open');
  document.body.classList.add('lightbox-open');
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
}

function stepLightbox(dir: number) {
  if (lightboxIndex < 0) return;
  const n = config.cakeImages.length;
  openLightbox((lightboxIndex + dir + n) % n);
}

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
lightboxNext?.addEventListener('click', () => stepLightbox(1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (event) => {
  if (lightboxIndex < 0) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') stepLightbox(-1);
  if (event.key === 'ArrowRight') stepLightbox(1);
});

// Carousel: smooth wheel-driven horizontal scroll (desktop), no auto-advance.
cardArc?.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.preventDefault();
    cardArc.scrollLeft += event.deltaY;
  }
}, { passive: false });

makeGallery();

const rig = createScene(canvas);
const tiramisu = createTiramisu();
rig.scene.add(tiramisu.group, tiramisu.spoon);

const controller = createInteraction(rig, tiramisu, {
  onCrack: () => {
    gallery?.classList.add('is-visible');
    introPanel?.classList.add('is-hidden');
    resetButton?.classList.add('is-visible');
    document.body.classList.add('is-cracked');
    gsap.fromTo('.cake-card', { y: 70, opacity: 0, rotateZ: -3 }, { y: 0, opacity: 1, rotateZ: 0, stagger: 0.055, duration: 0.75, ease: 'power3.out' });
  }
});

cta?.addEventListener('click', () => controller.crack());
resetButton?.addEventListener('click', () => {
  controller.reset();
  gallery?.classList.remove('is-visible');
  introPanel?.classList.remove('is-hidden');
  resetButton.classList.remove('is-visible');
  document.body.classList.remove('is-cracked');
  closeLightbox();
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
  gsap.fromTo('.brand-shell, .copy-panel', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power2.out' });
});

animate();
