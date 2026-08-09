# TECH_STACK — NT Element Cakes (Tiramisu Showcase)

> Decision date: 2026-08-09
> Decision maker: AI agent (owner delegated)
> Precedes: Development phase

## 0. Core Principle

These are **creative coding projects**, not application frameworks. The interaction mechanic IS the product — canvas drawing, CSS 3D transforms, and WebGL rendering are the core of the site, not decoration on top. A heavy framework that abstracts away the DOM/canvas adds friction, not value. The stack should be as thin as possible between the developer and the rendering context.

## 1. Build Tool & Language

| Decision | Choice | Rationale |
|---|---|---|
| Build tool | **Vite 6** | Fastest HMR, zero-config for vanilla TS, native ESM dev server. Industry standard for new projects in 2026. |
| Language | **TypeScript** | Type safety for creative code (canvas coordinates, shader uniforms, GSAP configs). Catches parameter order bugs before runtime. |
| Package manager | **npm** | Bundled with Node.js. No reason to add pnpm/yarn complexity for single-page sites. |

## 2. Per-Concept Libraries

### Concept A: Dust & Reveal
| Library | Purpose |
|---|---|
| Canvas 2D API (native) | Cocoa particle displacement — draw cocoa texture, erase with cursor mask |
| `gsap` | Smooth cursor trail animation, loading transition |

No framework. One `<canvas>` element, ~400 lines of TS. The cocoa effect is a custom procedural texture + cursor-driven alpha mask.

### Concept B: Lift Me Up
| Library | Purpose |
|---|---|
| CSS 3D Transforms (native) | Layer depth via `perspective`, `translateZ`, `rotateX` |
| `gsap` + `ScrollTrigger` | Scroll-driven layer separation, parallax depth, spring physics on hover |

No framework. CSS handles 90% of the visual effect. GSAP wires scroll position to layer transforms. ~350 lines of TS + CSS.

### Concept C: First Spoon
| Library | Purpose |
|---|---|
| `three` (vanilla) | 3D scene: tiramisu mesh, spoon cursor, coffee bean particles, orbit controls |
| `gsap` | Spoon-sink animation, camera transitions, surface-crack reveal |

Vanilla Three.js over React Three Fiber: direct scene-graph control matters for the spoon-interaction mechanic. R3F's declarative model adds reconciliation overhead on a per-frame interaction loop. ~500 lines of TS.

## 3. Why NOT React / Angular / Svelte

These are **single-page creative experiences** with no routing, no state management, no component trees, no data fetching. The entire "app" is:

```
1. A full-screen rendering surface (canvas or CSS 3D scene)
2. Event listeners (cursor, scroll, touch)
3. An animation loop (requestAnimationFrame)
4. A static overlay (logo, nav, social links)
```

Adding React would mean:
- Wrapping native canvas/WebGL APIs in refs and useEffect
- Reconciling a virtual DOM that has nothing to reconcile
- Fighting the framework to run a rAF loop outside its render cycle

For a web APP with forms, routing, and state — React/Angular would be correct. For a creative EXPERIENCE where every frame is hand-authored — vanilla is the modern choice. This is the same decision made by animejs.com, igloo.inc, and most Awwwards-winning creative sites.

## 4. Configuration

| File | Purpose |
|---|---|
| `.env` | Social URLs, brand name, tagline, contact info. Loaded via `import.meta.env.VITE_*` |
| `.env.example` | Template with placeholder values, committed to repo |

Environment variables:
```
VITE_BRAND_NAME=NT Element Cakes
VITE_TAGLINE=Pick me up
VITE_ABOUT_TEXT=
VITE_INSTAGRAM_URL=https://instagram.com/ntelementcakes
VITE_FACEBOOK_URL=https://facebook.com/ntelementcakes
VITE_MESSENGER_URL=https://m.me/ntelementcakes
VITE_CONTACT_PHONE=
```

## 5. Project Structure (per concept)

```
concept-{a,b,c}/
├── index.html
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts          # Entry point
│   ├── style.css        # Global styles, overlay layout
│   ├── mechanic.ts      # The core interaction (canvas/CSS/Three.js)
│   └── config.ts        # Reads import.meta.env, exports typed config
└── public/
    ├── logo.png         # Symlinked or copied from assets/
    └── cakes/           # Symlinked or copied from assets/images/
```

## 6. Asset Strategy

All three concepts share the same cake images and logo. Rather than duplicating 11MB of images per worktree:
- **Development:** `public/` directory symlinks to `assets/` in the main worktree
- **Build:** Vite copies assets into `dist/` at build time
- Each worktree's `.gitignore` excludes `public/cakes/` and `public/logo.png` (they're symlinks)

## 7. Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Platform | **Vercel** | CLI deploys: `vercel --prod`. Zero-config for Vite. Instant rollbacks. Free tier sufficient for showcase traffic. |
| Per-concept | 3 separate Vercel projects (`nt-cakes-dust`, `nt-cakes-lift`, `nt-cakes-spoon`) | Isolated preview URLs. Owner picks winner, promotes one to production domain. |
| Domain | TBD — Vercel provides `<project>.vercel.app` preview URLs | Custom domain configured post-selection |

Deploy command per concept:
```bash
cd concept-{a,b,c}
vercel --prod
```

## 8. Development Commands

```bash
# All concepts
npm install        # Install deps (gsap, three, typescript, vite)
npm run dev        # Start dev server (localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

## 9. Browser Targets

| Feature | Required for | Support |
|---|---|---|
| Canvas 2D | Concept A | All modern browsers |
| CSS 3D Transforms | Concept B | All modern browsers |
| WebGL 2.0 | Concept C | 97%+ global coverage |
| Touch Events | All (mobile) | Universal |
| CSS Custom Properties | All (theming) | All modern browsers |

No polyfills. No IE11. Graceful degradation: Concept C falls back to a static image gallery if WebGL is unavailable.
