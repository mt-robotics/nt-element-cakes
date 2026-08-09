import './style.css';
import gsap from 'gsap';
import { config } from './config';
import { CocoaReveal } from './mechanic';

function applyConfig(): void {
  document.title = `${config.brandName} — Dust & Reveal`;
  document.querySelectorAll<HTMLElement>('[data-brand-name]').forEach((el) => { el.textContent = config.brandName; });
  document.querySelectorAll<HTMLElement>('[data-tagline]').forEach((el) => { el.textContent = config.tagline; });
  document.querySelectorAll<HTMLElement>('[data-about-text]').forEach((el) => { el.textContent = config.aboutText; });

  const links: Record<string, string> = {
    instagram: config.instagramUrl,
    facebook: config.facebookUrl,
    messenger: config.messengerUrl,
  };
  Object.entries(links).forEach(([name, url]) => {
    const anchor = document.querySelector<HTMLAnchorElement>(`[data-social="${name}"]`);
    if (anchor) anchor.href = url;
  });
}

function init(): void {
  applyConfig();
  gsap.set('.cursor-orb', { x: -100, y: -100 });
  gsap.fromTo('.hero h1', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 1.1 });

  const canvas = document.querySelector<HTMLCanvasElement>('#cocoa-canvas');
  if (!canvas) throw new Error('Missing #cocoa-canvas element.');

  const mechanic = new CocoaReveal(canvas);
  mechanic.init();

  document.querySelector<HTMLButtonElement>('#reveal-all')?.addEventListener('click', () => mechanic.revealAll());

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    window.setTimeout(() => mechanic.revealAll(), 900);
  }
}

init();
