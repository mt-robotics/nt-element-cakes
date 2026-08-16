const { chromium } = require('playwright');

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  // iPhone-ish portrait
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(e.message));

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load' });
  await page.waitForSelector('#loading', { state: 'detached', timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(900);

  // Brand title single line + no overflow
  const brand = await page.locator('#brand-title').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), right: Math.round(r.right), vw: window.innerWidth };
  });
  check('brand title fits one line', brand.h <= 28, `h=${brand.h}px`);
  check('brand title does not overflow right', brand.right <= brand.vw, `right=${brand.right} vw=${brand.vw}`);

  // Crack
  await page.locator('#spoon-cta').click();
  await page.waitForTimeout(1700);

  // No horizontal page overflow
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  check('no horizontal page overflow', overflow.scrollW <= overflow.innerW, `scrollW=${overflow.scrollW} innerW=${overflow.innerW}`);

  // Carousel must actually be scrollable (regression: card-arc wrapped in .carousel
  // ballooned the grid track to content width, leaving no scroll room).
  const scrollable = await page.evaluate(async () => {
    const arc = document.querySelector('#card-arc');
    if (!arc) return { ok: false, why: 'missing' };
    const before = arc.scrollLeft;
    arc.scrollTo({ left: 400, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 100));
    return { ok: arc.scrollLeft > 50, scrollWidth: arc.scrollWidth, clientWidth: arc.clientWidth, before, after: arc.scrollLeft };
  });
  check('carousel scrolls horizontally', scrollable.ok, `scrollW=${scrollable.scrollWidth} clientW=${scrollable.clientWidth} before=${scrollable.before} after=${scrollable.after}`);

  // Social buttons must sit fully inside the viewport (regression: centered in a
  // 2000px-wide track put them off-screen at x=888 even though isVisible()=true).
  const social = await page.evaluate(() => {
    const vw = window.innerWidth;
    return [...document.querySelectorAll('.social-bar .social-btn')].map((b) => {
      const r = b.getBoundingClientRect();
      return { text: b.textContent.trim(), x: Math.round(r.x), right: Math.round(r.right), w: Math.round(r.width) };
    });
  });
  check('social buttons present', social.length === 2, `count=${social.length}`);
  for (const b of social) {
    check(`social button "${b.text}" on-screen`, b.x >= 0 && b.right <= 390, `x=${b.x} right=${b.right} w=${b.w}`);
  }

  // Lightbox on mobile
  await page.locator('.cake-card').first().click();
  await page.waitForTimeout(500);
  const lb = await page.locator('#lightbox').evaluate((el) => el.classList.contains('is-open'));
  check('lightbox opens on mobile', lb);

  check('no console errors', errs.length === 0, errs.slice(0, 3).join(' || '));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n==== ${results.length - failed.length}/${results.length} passed ====`);
  process.exit(failed.length ? 1 : 0);
})();
