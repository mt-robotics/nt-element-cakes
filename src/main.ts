import './style.css';
import { config } from './config';
import { initCardInteractions, initLayerScroll, renderCakeCards } from './layers';

function applyConfig(): void {
  document.querySelectorAll<HTMLElement>('[data-config="brandName"]').forEach((el) => {
    el.textContent = config.brandName;
  });
  document.querySelectorAll<HTMLElement>('[data-config="tagline"]').forEach((el) => {
    el.textContent = config.tagline;
  });
  document.querySelectorAll<HTMLElement>('[data-config="aboutText"]').forEach((el) => {
    el.textContent = config.aboutText;
  });

  const socials: Record<string, string> = {
    instagram: config.instagramUrl,
    facebook: config.facebookUrl,
    messenger: config.messengerUrl
  };

  Object.entries(socials).forEach(([name, url]) => {
    const link = document.querySelector<HTMLAnchorElement>(`[data-social="${name}"]`);
    if (link) link.href = url;
  });
}

function initNav(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      event.preventDefault();

      const positions: Record<string, number> = {
        '#hero': 0,
        '#about': 0.27,
        '#cakes': 0.58,
        '#social': 0.9
      };
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: maxScroll * (positions[id] ?? 0), behavior: 'smooth' });
    });
  });
}

function boot(): void {
  applyConfig();
  const grid = document.querySelector<HTMLElement>('[data-cake-grid]');
  if (grid) renderCakeCards(grid);
  initCardInteractions();
  initLayerScroll();
  initNav();
}

boot();
