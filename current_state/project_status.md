# project_status — NT Element Cakes (First Spoon)

> Updated: 2026-08-16
> Chosen concept: C (First Spoon). Source of truth: src/ (main.ts, interaction.ts, style.css, index.html, config.ts)

## Current phase
Post-crack UX polish + mobile redesign, from owner feedback on 2026-08-16.

## Open tasks (priority order)

### T1 — Brand name too big + wraps to two lines
- `h1 { max-width: 10ch }` forces "NT Element Cakes" (16 chars) to wrap.
- Make smaller and force single line.

### T2 — Simplify left-column / gallery copy (cluttered)
- "Cracked open" eyebrow + "The gallery beneath the cocoa" h2 + about paragraph = 3 stacked texts, cluttered.
- Replace with a single clean heading + short on-brand line.

### T3 — Spoon is annoying after crack
- After crack, spoon keeps following the mouse in 3D while the DOM gallery is on top; `#scene { cursor:none }` hides the real cursor.
- Fix: fade spoon out / idle after crack, restore normal cursor over the page.

### T4 — Replace coffee-bean social links
- Beans are unidentifiable and hard to click (confirmed UX failure).
- Replace with a clearly-labeled social bar (Instagram / Facebook / Messenger) with recognizable icons.

### T5 — Card click opens lightbox; drop "Spin me"
- "Spin me" label implies an action but clicking does nothing (only drag-tilt).
- Fix: click/tap opens full-size lightbox with prev/next + close + keyboard (Esc/arrows).

### T6 — Carousel auto-advance
- Cards sit static in a horizontal scroll. Add gentle auto-advance (marquee), pause on hover/drag.

### T7 — Mobile redesign (separate layout, not squeezed desktop)
- White text unreadable against cream/white cake (low contrast).
- Top row clutter: logo + "THE FIRST SPOON" + "NT Element Cakes" + "Reset spoon" fighting.
- Add dark scrim/backgrounds for text contrast; declutter top; stack properly; ensure no content clipping from `overflow:hidden`.

### T8 — Dead copy cleanup
- Hint text "order via the floating coffee beans" → update.
- social-label "Hover a coffee bean to order" → remove/replace.
- Reset button label → "Reset".

### T9 — Accessibility + copy flags
- Gallery cards: keyboard activation (Enter/Space) + role.
- Confirm tagline city ("Darwin-made" vs "Made in Australia") — owner to set in .env.

## Recently completed
- [x] Concept C promoted to main (archive/concept-{a,b,c} tags preserved)
- [x] Click-blocking fixes (canvas pointer-events, per-layer gating, spoon responsiveness)
- [x] Favicon added
- [x] Playwright smoke test (tests/smoke.cjs, `npm run test:smoke`)

## Verification
- `npm run build` (tsc + vite) must pass after every task.
- `npm run test:smoke` (with dev server up) must pass.
