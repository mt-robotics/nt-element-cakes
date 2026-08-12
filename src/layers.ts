import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type Cake = {
  src: string;
  name: string;
};

export const cakes: Cake[] = [
  ['753732979_1350799103807430_7873787001468322305_n.jpg', 'Classic Cocoa Cloud'],
  ['751134583_3211594029033514_8016886532644501009_n.jpg', 'Espresso Lift'],
  ['755380798_1019663917494688_2718437872776743684_n.jpg', 'Mascarpone Bloom'],
  ['754724833_2957078267962681_4754883315427519400_n.jpg', 'Velvet Dust'],
  ['750919848_1381880933881956_7595615374698156883_n.jpg', 'Coffee Silk'],
  ['750717223_1077956308505182_6162705914576579385_n.jpg', 'Celebration Layer'],
  ['753662785_1084920284200451_1877320936906446710_n.jpg', 'Tiramisu Crown'],
  ['751882791_1695033578247680_5279838039107148449_n.jpg', 'Cocoa Ribbon'],
  ['750864121_1766027041353962_5664451379473748334_n.jpg', 'Cream & Coffee'],
  ['752150735_1460443102514118_3095273935556678092_n.jpg', 'Golden Pick-Me-Up'],
  ['752807170_928127383670878_7984085609858838846_n.jpg', 'NT Element Signature']
].map(([file, name]) => ({ src: `/cakes/${file}`, name }));

export function renderCakeCards(grid: HTMLElement): void {
  grid.innerHTML = cakes
    .map(
      (cake, index) => `
        <article class="cake-card" tabindex="0" data-cake-card style="--stagger: ${index % 4}">
          <div class="cake-image-wrap">
            <img src="${cake.src}" alt="${cake.name} tiramisu cake" loading="lazy" />
            <div class="coffee-drips" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="cake-meta">
            <span>0${(index % 9) + 1}</span>
            <h3>${cake.name}</h3>
          </div>
        </article>`
    )
    .join('');
}

export function initLayerScroll(): void {
  gsap.registerPlugin(ScrollTrigger);

  const camera = document.querySelector<HTMLElement>('[data-camera]');
  const layers = gsap.utils.toArray<HTMLElement>('[data-layer]');
  const progressBar = document.querySelector<HTMLElement>('[data-progress]');

  if (!camera || layers.length === 0) return;

  const mm = gsap.matchMedia();

  const setActiveLayer = (progress: number) => {
    const activeSelector =
      progress < 0.27 ? '.hero-layer' :
      progress < 0.58 ? '.about-layer' :
      progress < 0.9 ? '.gallery-layer' :
      '.social-layer';
    layers.forEach((layer) => {
      layer.classList.toggle('is-active', layer.matches(activeSelector));
    });
  };

  mm.add('(prefers-reduced-motion: reduce)', () => {
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0);
      gsap.set(layer, { z: depth, clearProps: 'rotateX,y,scale' });
      layer.classList.add('is-active');
    });
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(camera, { transformPerspective: 1200, transformStyle: 'preserve-3d' });
    layers.forEach((layer) => {
      gsap.set(layer, {
        z: Number(layer.dataset.depth || 0),
        transformOrigin: '50% 18%',
        force3D: true
      });
    });

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.experience',
        start: 'top top',
        end: '+=3600',
        scrub: 1.05,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
          document.documentElement.style.setProperty('--scroll-lift', self.progress.toFixed(3));
          setActiveLayer(self.progress);
        }
      }
    });

    setActiveLayer(0);

    timeline
      .to('.hero-layer', { yPercent: -118, rotateX: -7, z: 105, scale: 0.94, duration: 1.15 }, 0)
      .to('.about-layer', { z: 30, yPercent: -2, scale: 1.03, duration: 0.75 }, 0.18)
      .to('.about-layer', { yPercent: -115, rotateX: -5, z: 84, scale: 0.95, duration: 1.1 }, 1.05)
      .to('.gallery-layer', { z: 42, yPercent: -2, scale: 1.02, duration: 0.9 }, 1.2)
      .to('.gallery-layer', { yPercent: -110, rotateX: -4, z: 72, scale: 0.96, duration: 1.1 }, 2.05)
      .to('.social-layer', { z: 50, yPercent: -1, scale: 1.02, duration: 0.95 }, 2.24);

    gsap.to('.floating-cake', {
      y: -18,
      rotate: 1.6,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  });
}

export function initCardInteractions(): void {
  const cards = gsap.utils.toArray<HTMLElement>('[data-cake-card]');

  cards.forEach((card) => {
    const lift = () => {
      card.classList.add('is-lifted');
      gsap.to(card, { z: 34, y: -18, rotateX: -3, scale: 1.035, duration: 0.55, ease: 'elastic.out(1, 0.55)' });
    };
    const settle = () => {
      card.classList.remove('is-lifted');
      gsap.to(card, { z: 0, y: 0, rotateX: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
    };

    card.addEventListener('pointerenter', lift);
    card.addEventListener('pointerleave', settle);
    card.addEventListener('focus', lift);
    card.addEventListener('blur', settle);
    card.addEventListener('click', () => {
      if (matchMedia('(hover: none)').matches) {
        lift();
        window.setTimeout(settle, 1050);
      }
    });
  });
}
