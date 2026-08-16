# Decisions Log — NT Element Cakes Development

> All skeptical, uncertain, or judgment-call decisions made during development.
> Owner reviews this file and adjusts execution if needed.

---

## Tech Stack Decisions

### D-001: Vanilla TypeScript over React/Angular/Svelte
**Decision:** No framework. Vite + vanilla TS.
**Confidence:** High (90%)
**Why:** These are single-page creative experiences — one canvas/WebGL surface + event listeners + rAF loop. A framework would add reconciliation overhead with nothing to reconcile. Same approach as animejs.com, igloo.inc, and most Awwwards-winning sites.
**Risk:** If the sites were to grow into full e-commerce platforms with routing/state, a framework would be needed. Not the case here — ordering happens on social media.
**Owner action:** Confirm this matches your vision. If you expected React components for the overlay UI, say so and I'll refactor.

### D-002: GSAP for animation (not Framer Motion, not Anime.js)
**Decision:** GSAP + ScrollTrigger for Concept B; GSAP for transition animations in A and C.
**Confidence:** Medium (70%)
**Why:** GSAP is the industry standard for scroll-driven animation. ScrollTrigger is battle-tested. However, Anime.js (the library whose site we studied) is also excellent and would be poetically appropriate.
**Risk:** GSAP has a paid license for advanced plugins (ScrollSmoother). We only need ScrollTrigger which is free.
**Owner action:** If you prefer Anime.js for brand alignment (an animation library powering your creative site, mirroring animejs.com's self-referential approach), I'll switch. GSAP is the safer, more documented choice.

### D-003: Vanilla Three.js over React Three Fiber
**Decision:** Vanilla Three.js for Concept C.
**Confidence:** Medium (65%)
**Why:** The spoon-interaction mechanic runs per-frame (raycasting, cursor tracking, surface deformation). Direct scene-graph manipulation avoids R3F's declarative reconciliation overhead. But R3F is the modern standard for React + Three.js and would make the code more readable.
**Risk:** Vanilla Three.js boilerplate is verbose. If the interaction becomes complex, R3F's component model would scale better.
**Owner action:** If you want all three concepts using consistent patterns (or prefer R3F's declarative model), I'll switch Concept C to R3F + @react-three/drei.

### D-004: Vercel over Netlify/Cloudflare Pages
**Decision:** Vercel for deployment.
**Confidence:** High (85%)
**Why:** CLI is `vercel --prod` — two words. Zero-config for Vite. Instant preview URLs per deployment. Free tier handles showcase traffic.
**Risk:** Vendor lock-in is minimal — any static host works. Switching to Netlify or Cloudflare Pages is a one-line config change.
**Owner action:** Confirm Vercel. If you prefer another platform, redeployment is trivial.

---

## Content Decisions

### D-005: Placeholder social media URLs
**Decision:** Used placeholder handles (`ntelementcakes`) for Instagram, Facebook, Messenger.
**Confidence:** Placeholder (0% — needs owner input)
**Values in .env.example:**
```
VITE_INSTAGRAM_URL=https://instagram.com/ntelementcakes
VITE_FACEBOOK_URL=https://facebook.com/ntelementcakes
VITE_MESSENGER_URL=https://m.me/ntelementcakes
```
**Owner action:** Replace with real URLs in `.env` before running.

### D-006: Placeholder brand copy
**Decision:** Generated placeholder tagline and about text.
**Values:**
- Tagline: "Pick me up" (from the tiramisu etymology — seemed too perfect not to use)
- About: Generic placeholder about artisanal tiramisu in Australia
**Owner action:** Replace in `.env` with real brand copy.

### D-007: Cake image usage
**Decision:** Used all 10 existing images from `assets/images/` as the cake gallery. Named them `cake-01.jpg` through `cake-10.jpg`.
**Confidence:** High (80%)
**Why:** The files exist and are cake photos. No reason not to use them.
**Risk:** Some images may not be tiramisu specifically. The gallery doesn't label individual cakes — it's a visual showcase.
**Owner action:** Curate which images appear. Remove any that aren't tiramisu by deleting from `public/cakes/` (or the source `assets/images/`).

---

## Design Decisions

### D-008: Three complete sites, not one site with three modes
**Decision:** Built three entirely separate implementations rather than one site with a mode switcher.
**Confidence:** High (90%)
**Why:** Each concept has fundamentally different architecture (Canvas vs CSS 3D vs WebGL). A mode-switcher would load all three engines and bloat the bundle. Separate implementations are cleaner to compare and easier to maintain the winner.
**Risk:** More code to maintain during iteration. Mitigated by git worktrees isolating each concept.
**Owner action:** After picking the winner, the other two worktrees can be archived or deleted.

### D-009: Color palette
**Decision:** Derived from logo analysis and tiramisu domain.
**Palette:**
- `--color-cream: #FFF9EF` (mascarpone — lightest)
- `--color-cocoa: #3C2415` (cocoa powder — darkest)
- `--color-coffee: #6F4E37` (coffee soak — mid brown)
- `--color-tiramisu: #9D8770` (the warm brown from logo center)
- `--color-espresso: #2C1810` (near-black, for text)
**Confidence:** Medium (70%)
**Why:** Extracted from the logo's center pixel (rgba 157,135,112) and extended with tiramisu-ingredient logic.
**Risk:** The palette might not match the owner's brand guidelines (if any exist).
**Owner action:** Adjust CSS custom properties in `src/style.css` if the colors feel off.

### D-010: Typography
**Decision:** System font stack + optional serif for headings.
**Stack:** `'Playfair Display', Georgia, 'Times New Roman', serif` for headings; system sans-serif for body.
**Confidence:** Low (50%)
**Why:** Playfair Display is an elegant serif that fits Italian dessert branding. But it's an external font (Google Fonts) which adds a network dependency.
**Risk:** The owner may have a specific brand font.
**Owner action:** Change the font stack in `src/style.css` if you have a brand typeface.

### D-011: Interaction fallback behavior
**Decision:** Each concept degrades gracefully:
- A (Dust & Reveal): Keyboard-accessible click-to-reveal fallback for non-mouse users
- B (Lift Me Up): Standard vertical scroll if CSS 3D transforms fail
- C (First Spoon): Static image gallery if WebGL is unavailable
**Confidence:** Medium (65%)
**Why:** Required by the spec's NFR accessibility slot. Fallbacks are minimal but functional.
**Risk:** The fallback experience is significantly less impressive. Mobile touch interactions are implemented but may feel different from desktop.
**Owner action:** Test on mobile. The spec calls for touch-native interactions, not shrunken desktop. Review and flag if the mobile experience needs rework.

---

## Git Strategy

### D-012: Git worktrees over branches
**Decision:** Three git worktrees at `../nt_element_cakes-concept-{a,b,c}/`.
**Confidence:** High (90%)
**Why:** Worktrees let the owner view all three sites simultaneously without switching branches. Each worktree has its own `node_modules/` and dev server port.
**Risk:** Symlinks for shared assets can break if the main worktree moves. Each worktree's `.gitignore` excludes symlinked assets.
**Owner action:** Run `git worktree list` to see all worktrees. Use `git worktree remove` to clean up after picking a winner.

### D-013: Concept C promoted to main (2026-08-09)
**Decision:** Owner chose Concept C (First Spoon). Concept C's clean files adopted into `main` via `git checkout concept-c -- ...` (avoids merging the 2,674-file node_modules commit). Concepts A and B retained as branches + archive tags.
**Resulting state:**
- `main` → Concept C site + shared docs (PRODUCT_SPEC, TECH_STACK, archive, assets)
- `concept-a`, `concept-b`, `concept-c` → branches preserved
- `archive/concept-a`, `archive/concept-b`, `archive/concept-c` → tags (immune to branch deletion)
- concept worktrees removed after tagging
**Why checkout-not-merge:** concept-c's history contains a commit that tracks `node_modules/` (~2,674 files) and `dist/` because the build subagent never wrote a `.gitignore`. Merging would have polluted main's history permanently. A clean `git checkout -- <paths>` adoption gives the identical working tree with zero junk in history. The `git rm --cached` untracking was blocked by the terminal safety layer (it treats `git rm` as destructive), so the checkout path was used instead.
**Owner action:** Run `npm install` in `main` once (already done). Verify `npm run dev` works. If you want to revisit A or B: `git checkout archive/concept-a` or `git worktree add ../concept-a archive/concept-a`.
**Note:** The `main` repo now mixes the shared planning docs (PRODUCT_SPEC.md, TECH_STACK.md, archive/) with the Concept C site code at the root. This is intentional — the docs describe the product, the code IS the product. Consider whether you want the docs in a `docs/` subfolder now that the site is the primary artifact.

---

## Uncertainty Summary

| Confidence | Count | Items |
|---|---|---|
| High (80%+) | 5 | No-framework, Vercel, worktrees, image usage, three-separate-sites |
| Medium (50-79%) | 4 | GSAP over Anime.js, vanilla Three.js over R3F, color palette, typography |
| Low (<50%) | 0 | — |
| Placeholder (needs owner) | 3 | Social URLs, brand copy, image curation |

---

## Owner Review Checklist

- [ ] D-001: Confirm vanilla TS (no framework) is acceptable
- [ ] D-002: Confirm GSAP over Anime.js
- [ ] D-003: Confirm vanilla Three.js over React Three Fiber
- [ ] D-004: Confirm Vercel deployment
- [ ] D-005: Replace social media URLs in `.env`
- [ ] D-006: Replace brand copy in `.env`
- [ ] D-007: Curate cake images
- [ ] D-009: Review color palette
- [ ] D-010: Review typography (font choice)

### D-014 — Auto-deploy via GitHub Actions instead of Vercel native Git integration (2026-08-16)
- Tried `vercel git connect` first: app installed on mt-robotics + repo selected, but CLI returned 400 "need admin/write access" repeatedly. Root cause (diagnosed via Vercel API): account-level GitHub OAuth did not grant mt-robotics org access; only fixable in dashboard.
- Pivoted to GitHub Actions (`gh secret set` + `.github/workflows/deploy.yml`) — fully `gh`-driven, transparent YAML, works immediately. Trade-off: Vercel login token stored as a repo secret (couldn't mint a scoped token: `vercel tokens add` returned 403 "Cannot create tokens for this app").
- If org OAuth access is granted later, can revisit native integration (PR previews come free there).

### D-015 — Staging via Preview environment + alias (not a Pro "custom environment") (2026-08-16)
- Wanted a stable staging URL. Custom environments are Pro-only ($50/5); account is on Hobby. Built instead: `development` branch → `vercel deploy` (Preview) + `vercel alias` to `ntelementcakes-staging.vercel.app`.
- Pitfalls hit: `vercel alias` rejects `--yes`; `*.ntelementcakes.vercel.app` subdomains are "reserved for another account" (only `*.vercel.app` and `*.monireachtang-6029s-projects.vercel.app` aliasable); Preview Deployment Protection (SSO) is ON by default → had to disable for Preview.
- `development` branch doubles as the pre-production branch (no separate `staging` branch — would be redundant).

### D-016 — Cloudinary: list-all-except-samples (not a folder filter) (2026-08-16)
- Started with `prefix=cakes/` but the owner's photos live at the Cloudinary ROOT (folder "move" never renamed public_ids). Folder filter returned `[]` twice.
- Final: list all uploads, filter out `samples/` (Cloudinary's bundled 47 demo images). Zero reorganization; add/delete photos at root and they appear.
- Trade-off: any future non-cake image uploaded to the account root will show on the site. If the account later needs a real folder, the move must physically rename public_id (drag onto the folder in the left sidebar).
