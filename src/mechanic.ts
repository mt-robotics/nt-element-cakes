import gsap from 'gsap';

export interface RevealZone {
  id: string;
  element: HTMLElement;
  threshold: number;
  revealed: boolean;
}

interface Point { x: number; y: number; pressure: number; }

export class CocoaReveal {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture!: HTMLCanvasElement;
  private zones: RevealZone[] = [];
  private dpr = Math.min(window.devicePixelRatio || 1, 2);
  private radius = 72;
  private target: Point = { x: window.innerWidth / 2, y: window.innerHeight / 2, pressure: 0 };
  private brush: Point = { ...this.target };
  private interactive = false;
  private raf = 0;
  private sampleTick = 0;
  private lastInput = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');
    this.ctx = ctx;
  }

  init(): void {
    document.body.classList.add('is-loading');
    this.collectZones();
    this.resize();
    this.bindEvents();
    this.playLoadingDust();
    this.loop();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
  }

  revealAll(): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0,0,0,1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    this.zones.forEach((zone) => this.revealZone(zone));
    document.body.classList.add('is-revealed');
  }

  private collectZones(): void {
    this.zones = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-zone]')).map((element) => ({
      id: element.dataset.revealZone || '',
      element,
      threshold: Number(element.dataset.revealThreshold || '0.40'),
      revealed: element.classList.contains('is-revealed'),
    }));
  }

  private resize = (): void => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.ceil(window.innerWidth * this.dpr);
    const h = Math.ceil(window.innerHeight * this.dpr);
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.radius = Math.max(58, Math.min(82, window.innerWidth * 0.07));
    this.texture = this.createCocoaTexture(w, h);
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.drawImage(this.texture, 0, 0);
    // Preserve already-revealed zones across resize so the wipe is not lost.
    this.zones.forEach((zone) => {
      if (!zone.revealed) return;
      const rect = zone.element.getBoundingClientRect();
      this.eraseRect(rect);
    });
  };

  private playLoadingDust(): void {
    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      duration: 1.45,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawEdgeInwardDust(state.p);
      },
      onComplete: () => {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(this.texture, 0, 0);
        this.interactive = true;
        document.body.classList.remove('is-loading');
        window.setTimeout(() => this.softIntroHoles(), 80);
      },
    });
  }

  private drawEdgeInwardDust(progress: number): void {
    this.ctx.save();
    this.ctx.drawImage(this.texture, 0, 0);
    this.ctx.globalCompositeOperation = 'destination-out';
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const max = Math.hypot(this.canvas.width, this.canvas.height) * 0.58;
    const r = Math.max(0, max * (1 - progress));
    const gradient = this.ctx.createRadialGradient(cx, cy, Math.max(0, r * 0.72), cx, cy, r);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('scroll', () => this.checkZones(), { passive: true });
    window.addEventListener('pointermove', this.handlePointer, { passive: true });
    window.addEventListener('pointerdown', this.handlePointer, { passive: true });
    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (touch) this.setTarget(touch.clientX, touch.clientY, 1);
    }, { passive: true });
    window.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'r' || event.key === 'Enter') this.revealAll();
    });
  }

  private handlePointer = (event: PointerEvent): void => {
    this.setTarget(event.clientX, event.clientY, event.pointerType === 'mouse' ? 0.82 : 1);
  };

  private setTarget(x: number, y: number, pressure: number): void {
    this.target.x = x;
    this.target.y = y;
    this.target.pressure = pressure;
    this.lastInput = performance.now();
    gsap.to('.cursor-orb', { x: x - 17, y: y - 17, duration: 0.18, ease: 'power2.out' });
  }

  private loop = (): void => {
    this.brush.x += (this.target.x - this.brush.x) * 0.32;
    this.brush.y += (this.target.y - this.brush.y) * 0.32;
    this.brush.pressure += (this.target.pressure - this.brush.pressure) * 0.18;

    if (this.interactive && performance.now() - this.lastInput < 160) {
      this.eraseAt(this.brush.x, this.brush.y, this.radius * (0.86 + this.brush.pressure * 0.24));
    }

    if (this.interactive && this.sampleTick++ % 8 === 0) this.checkZones();
    this.raf = requestAnimationFrame(this.loop);
  };

  private eraseAt(x: number, y: number, radius: number): void {
    const dx = x * this.dpr;
    const dy = y * this.dpr;
    const dr = radius * this.dpr;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    const gradient = this.ctx.createRadialGradient(dx, dy, dr * 0.18, dx, dy, dr);
    gradient.addColorStop(0, 'rgba(0,0,0,.95)');
    gradient.addColorStop(0.58, 'rgba(0,0,0,.55)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private eraseRect(rect: DOMRect): void {
    const x = Math.max(0, rect.left * this.dpr);
    const y = Math.max(0, rect.top * this.dpr);
    const w = Math.min(this.canvas.width - x, rect.width * this.dpr);
    const h = Math.min(this.canvas.height - y, rect.height * this.dpr);
    if (w <= 0 || h <= 0) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0,0,0,1)';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.restore();
  }

  private checkZones(): void {
    this.zones.forEach((zone) => {
      if (zone.revealed) return;
      const rect = zone.element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return;
      const clearRatio = this.sampleClearRatio(rect);
      if (clearRatio >= zone.threshold) this.revealZone(zone);
    });
    if (this.zones.every((zone) => zone.revealed)) document.body.classList.add('is-revealed');
  }

  private sampleClearRatio(rect: DOMRect): number {
    const pad = 8;
    const x = Math.max(0, Math.floor((rect.left + pad) * this.dpr));
    const y = Math.max(0, Math.floor((rect.top + pad) * this.dpr));
    const w = Math.max(2, Math.min(this.canvas.width - x, Math.floor((rect.width - pad * 2) * this.dpr)));
    const h = Math.max(2, Math.min(this.canvas.height - y, Math.floor((rect.height - pad * 2) * this.dpr)));
    if (w <= 2 || h <= 2) return 0;

    const cols = 12;
    const rows = 8;
    const image = this.ctx.getImageData(x, y, w, h).data;
    let clear = 0;
    let total = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const px = Math.min(w - 1, Math.floor((col + 0.5) * w / cols));
        const py = Math.min(h - 1, Math.floor((row + 0.5) * h / rows));
        const alpha = image[(py * w + px) * 4 + 3];
        if (alpha < 95) clear += 1;
        total += 1;
      }
    }
    return clear / total;
  }

  private revealZone(zone: RevealZone): void {
    zone.revealed = true;
    zone.element.classList.add('is-revealed');
    gsap.fromTo(zone.element, { y: 16, scale: 0.985 }, { y: 0, scale: 1, duration: 0.7, ease: 'power3.out' });
  }

  private softIntroHoles(): void {
    this.eraseAt(window.innerWidth * 0.5, window.innerHeight * 0.52, 42);
    this.eraseAt(window.innerWidth * 0.18, window.innerHeight * 0.15, 28);
  }

  private createCocoaTexture(width: number, height: number): HTMLCanvasElement {
    const texture = document.createElement('canvas');
    texture.width = width;
    texture.height = height;
    const ctx = texture.getContext('2d');
    if (!ctx) return texture;

    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#2C1810');
    base.addColorStop(0.38, '#3C2415');
    base.addColorStop(0.72, '#4A2B19');
    base.addColorStop(1, '#25120B');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const grain = this.noise(x * 0.018, y * 0.018) * 28 + this.noise(x * 0.055 + 80, y * 0.055) * 16 + (Math.random() - 0.5) * 20;
        data[i] = Math.max(28, Math.min(82, data[i] + grain));
        data[i + 1] = Math.max(14, Math.min(55, data[i + 1] + grain * 0.62));
        data[i + 2] = Math.max(8, Math.min(36, data[i + 2] + grain * 0.35));
        data[i + 3] = 246;
      }
    }
    ctx.putImageData(image, 0, 0);

    ctx.globalAlpha = 0.20;
    for (let i = 0; i < Math.floor((width * height) / 8500); i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = (Math.random() * 2.8 + 0.7) * this.dpr;
      ctx.fillStyle = Math.random() > 0.5 ? '#1B0C07' : '#6F4E37';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return texture;
  }

  private noise(x: number, y: number): number {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const a = s - Math.floor(s);
    const s2 = Math.sin((x + 4.2) * 26.651 + (y - 3.7) * 45.17) * 12921.91;
    return (a + (s2 - Math.floor(s2))) / 2 - 0.5;
  }
}
