# PRODUCT_SPEC — NT Element Cakes (Tiramisu Showcase)

> Generation: AI-first (owner delegated full generation to AI agent, 2026-08-09) | Lane: full | Blind-spots at generation: N/A (no owner skeleton to diff against)

## 0. Why

NT Element Cakes sells artisanal tiramisu in Australia. The website's job is NOT to process orders — it is to **create desire and drive customers to social media** (Facebook, Messenger, Instagram) where ordering happens. The site is a brand experience first, a product catalog second.

**Success metric:** Social media click-through rate from site → ordering conversation. Target: 15%+ of site visitors tap a social link.

## 1. Actors

| Actor | Role | Pays? |
|---|---|---|
| Stranger | First-time visitor. Lands on site via link, search, or social share. Browses cakes, experiences the interaction. | No — but they are the revenue source if converted |
| Customer | Converted stranger who followed through to social media and placed an order | Yes — pays via social platform ordering |
| Site Owner | NT Element Cakes. Manages all content via code changes (git). Adds/removes cake images, updates brand copy, adjusts social links. | Funds the site |
| CDN / Hosting | Serves static assets. Not a human actor but a deployment dependency. | N/A |

**External systems (outbound only):**
- Instagram — link-out to brand profile for visual browsing and DM ordering
- Facebook — link-out to brand page
- Messenger — direct link to Messenger conversation for ordering

## 2. Entities (conceptual)

| Entity | One-line meaning |
|---|---|
| Cake | A tiramisu product showcased on the site — image, name/title, optional short description |
| Brand | The brand identity: logo, about text, tagline, visual theme |
| SocialLink | A clickable outbound link to a specific social media platform or contact channel |
| ShowcasePage | A distinct view/section of the site: cake gallery, about section, hero/landing |

## 3. CRUD Matrix

> Note: This is a static site with no backend. "Operations" for the Site Owner happen via code changes, not through a web interface. The matrix reflects runtime operations (what the live site does) plus content-management reality.

| Entity | Op | Who | Through what | When |
|---|---|---|---|---|
| Cake | R | Stranger, Customer | Cake gallery (interactive reveal, scroll, or 3D scene — per chosen concept) | Anytime during site visit |
| Cake | C/U/D | Site Owner | Git commit → redeploy (add/remove images, update copy in config) | When product lineup changes |
| Brand | R | Stranger, Customer | About section, logo, tagline | Anytime during site visit |
| Brand | C/U | Site Owner | Git commit → redeploy (logo file, about text, tagline — created at site launch, updated as brand evolves) | Site launch; brand identity changes |
| SocialLink | R | Stranger, Customer | Social icons/buttons in footer or persistent nav | Anytime — this is the conversion action |
| SocialLink | C/U/D | Site Owner | Git commit → redeploy (update platform URLs) | When social accounts change |

**ShowcasePage removed from entities** — it is a UI structure (the site's sections and layout), not a domain entity. Created implicitly during site development, not operated on at runtime.

**No persistent user data.** No accounts, no sessions, no cookies required. The site is stateless from the visitor's perspective.

## 4. Journeys

| P | Journey (stranger → value) | Arrows (each lands on a matrix cell) |
|---|---|---|
| P0 | **Money journey:** Stranger sees shared link → lands on site → experiences the creative interaction (dust-reveal / layer-lift / 3D-spoon) → uncovers cake gallery → taps Instagram/Messenger link → orders tiramisu on social platform | Cake.R (gallery) → SocialLink.R (click) → external conversion |
| P1 | **Discovery via share:** Friend shares site link → stranger lands directly → experiences interaction mechanic → browses 2-3 cakes → taps Messenger to ask about flavors/pricing | Cake.R (gallery) → SocialLink.R (Messenger) |
| P2 | **Brand immersion (no purchase yet):** Stranger lands from Instagram ad → experiences interaction → reads about NT Element Cakes → follows Instagram → returns later via Instagram story | Brand.R (about) → SocialLink.R (Instagram follow) → future P0 |
| P3 | **Return for re-order:** Previous customer → opens site directly → skips to cake gallery (or interaction is brief) → taps Messenger → "same as last time please" | Cake.R (quick scan) → SocialLink.R (Messenger) |
| P4 | **Mobile quick scan:** Stranger on phone → lands on site → experiences touch-based interaction → sees 1-2 cakes → taps Messenger for immediate order | Cake.R (mobile gallery) → SocialLink.R (Messenger) |
| P5 | **Loading & fallback:** Stranger lands → creative mechanic initializes (canvas/WebGL/CSS) → loading indicator (themed to concept: cocoa settling, mascarpone spreading, spoon hovering) → mechanic becomes interactive → stranger proceeds to P0/P1/P2 | Loading state → Cake.R (gallery once loaded) |
| P6 | **404 / dead end:** Stranger hits broken/nonexistent URL → themed error state (cocoa-smudged "not found", empty plate) → navigation back to main experience | Brand.R (logo → home link) |

## 5. NFR

| Slot | Value |
|---|---|
| Scale | Static site, CDN-served. Zero server-side processing. Handles any traffic volume within CDN limits. Target: 10K+ concurrent visitors without degradation. |
| Latency | Initial load <3s on 4G mobile (creative assets may be heavy — optimize aggressively). Time-to-interactive <5s. |
| Availability | 99.9% (standard static hosting SLA). No backend to go down. |
| Compliance | Australian privacy law. No data collected — no cookie consent needed. Social links are outbound only. |
| Language | English. Australian market. |
| Accessibility | Interaction concepts must degrade gracefully. Concept A (dust-reveal): keyboard-accessible fallback (click-to-reveal). Concept B (layer-lift): standard scroll fallback. Concept C (3D spoon): static image gallery fallback. |
| Browser support | Modern browsers (last 2 years). No IE11. WebGL required for Concepts A and C; CSS 3D transforms for Concept B. |
| Mobile | Touch interactions must feel native — not a shrunken desktop version. The mechanic must be reimagined for touch, not just responsive-scaled. |

## 6. Non-goals

| Skipped | Because | Revisit when |
|---|---|---|
| E-commerce / ordering on site | Owner wants social media as the ordering channel. Keeps site simple and forces social engagement. | If social ordering becomes a bottleneck at scale |
| User accounts / login | No persistent user data. No ordering on site. | Never — fundamentally incompatible with static showcase model |
| CMS / admin panel | Content managed via git. Owner is technical enough for this. Simpler and more secure. | If non-technical team members need to update cakes |
| Payment processing | Orders happen on social platforms (bank transfer, cash, whatever the owner arranges via DM) | If volume demands automation |
| Analytics / tracking | Privacy-respecting. Can add later if needed. | If owner wants conversion data beyond social-platform insights |
| Mailing list / newsletter | Adds complexity. Social media IS the communication channel. | If owner wants direct customer re-engagement |
| Multi-language | Australian market is English-only for V1 | If expanding to non-English markets |
| SEO optimization | Showcase site — discovery is via social media, not search. Basic meta tags only. | If organic search becomes a meaningful channel |

## 7. Coverage footer

| # | Slot | Status |
|---|---|---|
| 1 | Business case (why) | PRODUCT_SPEC.md §0 |
| 2 | Requirements (what) | PRODUCT_SPEC.md §§1–6 |
| 3 | Architecture | Pending — /tech-stack step |
| 4 | Data model / ERD | Consciously skipped — static site, no database |
| 5 | API contract | Consciously skipped — no API surface |
| 6 | UI/UX spec | Pending — per-concept wireframes after concept selection |
| 7 | Backlog | Pending — after concept selection and tech stack |
| 8 | Code + tests | Pending — development phase |
