# project_status — NT Element Cakes (First Spoon)

> Updated: 2026-08-16
> Chosen concept: C (First Spoon). Source of truth: src/ (main.ts, interaction.ts, style.css, index.html, config.ts)

## Current phase
DEPLOYED to production (Vercel): https://ntelementcakes.vercel.app

## Deployment (2026-08-16)
- Platform: Vercel (free `*.vercel.app` subdomain). Project `ntelementcakes`, scope `monireachtang-6029s-projects`.
- `vercel.json`: framework vite, `npm run build`, output `dist`, name `ntelementcakes`.
- Verified live: 200 on page + JS/CSS/logo + all cake images; Playwright against live URL (canvas renders, crack reveals gallery, 11 cards, lightbox opens, 2 social buttons with correct hrefs, no console errors).
- `.vercel/` gitignored (project link state stays local).

## Recent changes (2026-08-16, round 3)
- Single-line gallery title (`white-space: nowrap; max-width: none`).
- Instagram removed (commented out in index.html + config.ts). Socials narrowed to Facebook + Messenger.
- Facebook URL set to real page; Messenger set to `m.me/61592289277016` (owner to confirm).
- Carousel image order shuffled each load (Fisher-Yates `galleryOrder`); carousel + lightbox share the order.
- Right-edge fade on carousel hints at more images; hides at scroll end.
- FIXED regression: wrapping `#card-arc` in `.carousel` ballooned the gallery grid track to content width (~2000px), killing carousel scroll AND pushing the centered social bar off-screen. Fixed with `grid-template-columns: minmax(0,1fr)` + `.carousel { min-width:0; max-width:100% }`.
- Hardened `test:mobile` to assert carousel scrollability + social-button viewport bounds (old `isVisible()` check passed while buttons were off-screen).

## Recent changes (2026-08-16, round 2)

### Mobile tap-to-crack (replaces cursor-chase on touch) — DONE
- `interaction.ts` detects `(pointer: coarse)` and switches to tap-to-crack: cake self-rotates, no spoon chasing, tap anywhere on cake cracks it. Spoon still sinks/fades during the crack reveal.
- Mobile hint swapped: "Tap the cake to crack it open" (desktop keeps "Move to orbit · click the cocoa to crack").

### Removed carousel marquee — DONE
- Auto-advance loop removed entirely. Carousel now scrolls via wheel (desktop) and native touch swipe.

### Smooth + hidden carousel scrollbars — DONE
- `.card-arc`: `overflow-y: hidden`, `scrollbar-width: none`, `::-webkit-scrollbar { display:none }`. Wheel handler maps vertical wheel to horizontal scroll.

### High-contrast social bar — DONE
- `.social-bar` gets a dark backing; buttons use dark espresso background with cream text + coffee hover state, visible over the white cake.

### Copy — DONE
- Tagline: "Handmade tiramisu, made in Australia."

## Verification
- `npx tsc --noEmit` clean; `npm run build` passes.
- `npm run test:smoke` 17/17 (social-popup check occasionally flakes on popup timing — hrefs verified correct; not a site bug).
- Mobile tap-to-crack verified via Playwright touch emulation.

## Open questions for owner
1. Confirm tagline + about copy (placeholders in config.ts / .env.example).
2. Confirm social URLs (placeholders `ntelementcakes` handles).
3. Keep or remove the decorative (non-interactive) beans?

## Task log

### T1 — Brand name too big + wraps to two lines — DONE
- `h1` had `max-width: 10ch` forcing "NT Element Cakes" (16 chars) to wrap.
- Removed max-width, added `white-space: nowrap`, reduced size to `clamp(1.05rem, 1.8vw, 1.7rem)`.
- Verified single-line (smoke test asserts height ≤ 1 line).

### T2 — Simplify gallery copy — DONE
- Removed "Cracked open" eyebrow + "The gallery beneath the cocoa" h2.
- Replaced with single heading "Choose your slice" + short on-brand line.
- Tagline changed "Darwin-made…" → "Made in Australia." (owner to override in .env).

### T3 — Spoon annoying after crack — DONE
- After crack, spoon sinks then fades to scale 0.001 (retires).
- `#scene` cursor returns to normal; interactive elements get a themed cocoa-circle cursor via `body.is-cracked`.
- Reset restores the spoon.

### T4 — Replace coffee-bean social links — DONE
- Removed bean raycast/click/hover logic entirely (interaction.ts, tiramisu.ts).
- Beans remain as decorative 3D objects only (no interaction).
- Added `.social-bar` with 3 labeled buttons (Instagram / Facebook / Messenger) + inline SVG icons, wired from config socials.

### T5 — Card click lightbox + drop "Spin me" — DONE
- "Spin me" label removed. Cards keep subtle drag-tilt.
- Click/tap (with 4px drag threshold) opens full-size lightbox: prev/next, close, Esc/arrow keys, backdrop click, `role=dialog`.

### T6 — Carousel auto-advance — DONE
- Gentle marquee (`scrollLeft += dt * 0.03`), wraps at end, pauses on hover.

### T7 — Mobile redesign — DONE
- Eyebrow hidden on mobile; brand title forced single-line + smaller.
- Reset button tucked top-right, smaller.
- Copy panel = full-width bottom sheet with solid dark backing for contrast.
- Gallery heading wrapped in a dark scrim for contrast over the cake.
- Social bar + cards sized for portrait; no horizontal page overflow (verified).

### T8 — Dead copy cleanup — DONE
- Hint text "order via the floating coffee beans" → "Move to orbit · click the top to crack".
- Removed `#social-label`.
- Reset button label → "↺ Reset".

### T9 — Accessibility + copy flags — DONE
- Cards: `role=button`, `tabIndex=0`, Enter/Space activation, aria-labels.
- Tagline city flagged: "Made in Australia." placeholder — owner sets VITE_TAGLINE in .env.

## Verification
- `npx tsc --noEmit` clean.
- `npm run build` passes.
- `npm run test:smoke` — 17/17 pass (desktop).
- `npm run test:mobile` — passes (390×844 portrait, no overflow, lightbox + social bar work).

## Open questions for owner
1. Confirm tagline + about copy (currently placeholders in config.ts / .env.example).
2. Confirm social URLs (placeholders `ntelementcakes` handles).
3. Do you want the decorative beans kept, or removed entirely? (They're currently non-interactive ambience.)
