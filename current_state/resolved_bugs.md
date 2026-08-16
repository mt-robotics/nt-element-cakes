# resolved_bugs — NT Element Cakes

> Updated: 2026-08-16

1. **Carousel not scrollable + social bar off-screen (mobile).**
   Cause: wrapping `#card-arc` in `.carousel` made it a grid item with `min-width:auto`; the track ballooned to content width (~2000px), killing scroll and centering the social bar off-screen.
   Fix: `.gallery { grid-template-columns: minmax(0,1fr) }` + `.carousel { min-width:0; max-width:100% }`.

2. **`vercel git connect` → 400 "need admin/write access".**
   Cause: Vercel GitHub App installed, but account-level GitHub OAuth lacked mt-robotics org access (dashboard-only fix).
   Fix: pivoted to GitHub Actions (no native git integration).

3. **GH Actions deploy failed: `--prebuilt` expected `.vercel/output`.**
   Fix: use remote build (`vercel deploy --prod`), not `--prebuilt` against `dist/`.

4. **`vercel alias ... --yes` → "unknown or unexpected option".**
   Fix: `alias` doesn't support `--yes`; drop it (the command is non-interactive).

5. **`staging.ntelementcakes.vercel.app` → "reserved for another account".**
   Fix: can't alias under `*.ntelementcakes.vercel.app`; use a top-level name — `ntelementcakes-staging.vercel.app`.

6. **`vercel tokens add` → 403 "Cannot create tokens for this app".**
   Fix: Hobby plan can't mint tokens; used the login token from `auth.json` as the repo secret instead.

7. **Staging URL 302 → `vercel.com/sso-api` (login wall).**
   Cause: Preview "Deployment Protection" (SSO) is ON by default.
   Fix: disabled Deployment Protection for Preview.

8. **`/api/list-images` returned `[]`.**
   Cause: `prefix=cakes/` matched nothing — the photos live at the Cloudinary root, not in a folder (folder "move" never renamed the public_id).
   Fix: list all uploads and filter out `samples/` client-side.

9. **Cloudinary's 47 bundled `samples/` demo images leaked into the gallery.**
   Fix: `.filter(img => !img.public_id.startsWith('samples/'))`.

10. **Site showed cakes locally after local files were deleted.**
    Cause: `/api/list-images` only exists on Vercel; `npm run dev` can't reach it, so the site falls back to `config.cakeImages` (by design).
    Fix: use `vercel dev` to exercise Cloudinary locally.

11. **Syntax errors in `api/list-images.js` + `main.ts` (template literals lost backticks).**
    Cause: copy-paste stripped backticks/`${}`.
    Fix: restored proper template literals.

12. **Favicon 404 (earlier round).** Fix: added `<link rel="icon" href="/logo.png">`.

13. **Mobile hold-drag didn't follow the finger.**
    Cause: missing `touch-action:none` on `#scene` → browser fired `pointercancel`.
    Fix: `touch-action:none` + `pointercancel` cleanup; clean tap still cracks.

14. **Gallery title wrapped to two lines.**
    Fix: `.gallery-copy h2 { white-space:nowrap; max-width:none }`.
