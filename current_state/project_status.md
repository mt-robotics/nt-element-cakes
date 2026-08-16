# project_status — NT Element Cakes (First Spoon)

> Updated: 2026-08-16
> Concept: C "First Spoon" — Three.js 3D tiramisu, crack-the-cocoa interaction.
> Source of truth: src/ (main.ts, interaction.ts, style.css, tiramisu.ts, config.ts), api/list-images.js

## Current phase
LIVE in production. Images served from Cloudinary; image updates need no code and no deploy.

## URLs
- Production: https://ntelementcakes.vercel.app
- Staging:    https://ntelementcakes-staging.vercel.app
- Repo:       https://github.com/mt-robotics/nt-element-cakes (public)

## Deployment
- Platform: Vercel, free Hobby plan. Project `ntelementcakes`, scope `monireachtang-6029s-projects`.
- Auto-deploy via GitHub Actions `.github/workflows/deploy.yml`:
  - push `main`        → production (`vercel deploy --prod`).
  - push `development` → staging (preview deploy + alias to `ntelementcakes-staging.vercel.app`).
- GitHub repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Vercel env (per-environment): `CLOUDINARY_URL` (set on Production + Preview).
- Build: `npm run build` (tsc && vite build) → `dist/`. Remote build on Vercel.

## Images (Cloudinary)
- Serverless function `api/list-images.js` reads `CLOUDINARY_URL`, lists all uploads, excludes `samples/`, returns `[{thumb, full}]`.
- `main.ts` fetches `/api/list-images` at load; falls back to `config.cakeImages` if the API fails.
- Owner workflow: drag-drop in Cloudinary Media Library (add/delete). ~60s edge-cache delay. No code, no deploy.
- Currently 13 cakes live (0 samples). NOTE: count was 19 earlier — 6 may have been lost during the folder-shuffling attempts; owner to confirm if intentional.

## Branches
- `main` = production, `development` = staging. Currently in sync.
- Old concepts archived as tags: `archive/concept-a`, `archive/concept-b`, `archive/concept-c`.

## Social
- Facebook + Messenger only (Instagram commented out in index.html + removed from config.ts).
- Facebook: https://www.facebook.com/profile.php?id=61592289277016
- Messenger: https://m.me/61592289277016 (INFERRED — owner to verify).

## Verification
- `npx tsc --noEmit` clean; `npm run build` passes.
- `npm run test:smoke` (desktop), `npm run test:mobile` (390×844).
- Production + staging `/api/list-images` return 13 images, 0 samples; no console errors.

## Open questions (see bugs.md)
1. Confirm Messenger URL actually opens the page.
2. Tagline/about copy are placeholders — owner to finalize.
3. Decorative (non-interactive) 3D beans: keep or remove?
4. GH Actions "Node 20 deprecated" warning — cosmetic, harmless.
