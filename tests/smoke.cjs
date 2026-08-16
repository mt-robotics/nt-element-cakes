// Smoke test for NT Element Cakes (Concept C — First Spoon).
// Usage: npm run test:smoke   (requires `npm run dev` running on :5173)
const { chromium } = require('playwright');

const URL = process.env.TEST_URL || 'http://127.0.0.1:5173/';
const results = [];
const log = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));
  await page.addInitScript(() => {
    window.__opened = [];
    const orig = window.open;
    window.open = function (url, ...rest) { window.__opened.push(String(url)); return orig.call(window, url, ...rest); };
  });

  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('#loading', { state: 'detached', timeout: 6000 }).catch(() => {});
  log('loading overlay dismissed', (await page.locator('#loading').count()) === 0);
  await page.waitForTimeout(800);

  const box = await page.locator('#scene').boundingBox();
  log('3D canvas fullscreen', !!box && box.width >= 1200, box ? `${box.width}x${box.height}` : 'none');
  log('brand header visible', await page.locator('.brand-shell').isVisible());

  // Brand name single line
  const brandH = await page.locator('#brand-title').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { h: r.height, lines: Math.round(r.height / parseFloat(getComputedStyle(el).lineHeight)) };
  });
  log('brand title fits one line', brandH.lines <= 1, `height=${Math.round(brandH.h)}px`);

  const cta = page.locator('#spoon-cta');
  log('#spoon-cta visible+enabled', (await cta.isVisible()) && (await cta.isEnabled()));
  await cta.click();
  await page.waitForTimeout(1600);
  log('gallery interactive after crack',
    (await page.locator('#gallery').evaluate((el) => getComputedStyle(el).pointerEvents)) === 'auto');

  // Social bar present + clickable (3 buttons)
  const socialBtns = page.locator('.social-bar .social-btn');
  log('social bar has 3 buttons', (await socialBtns.count()) === 3, `${await socialBtns.count()}`);
  const socialLabels = await socialBtns.allTextContents();
  log('social buttons labeled', socialLabels.some((t) => /instagram/i.test(t)) && socialLabels.some((t) => /facebook/i.test(t)) && socialLabels.some((t) => /messenger/i.test(t)), socialLabels.join(','));

  // Reset button
  const reset = page.locator('#reset');
  log('reset button clickable', await reset.isVisible()
    && (await reset.evaluate((el) => getComputedStyle(el).pointerEvents)) === 'auto');

  log('cake cards rendered', (await page.locator('.cake-card').count()) >= 10, `${await page.locator('.cake-card').count()} cards`);

  // Lightbox: click a card -> lightbox opens -> close
  await page.locator('.cake-card').first().click();
  await page.waitForTimeout(500);
  log('lightbox opens on card click', await page.locator('#lightbox').evaluate((el) => el.classList.contains('is-open')));
  const lbImg = page.locator('.lightbox-img');
  log('lightbox shows image', (await lbImg.getAttribute('src'))?.includes('/cakes/') || false);
  await page.locator('.lightbox-close').click();
  await page.waitForTimeout(300);
  log('lightbox closes', await page.locator('#lightbox').evaluate((el) => !el.classList.contains('is-open')));

  // Social bar opens correct URLs (anchors with target=_blank → popup event, not window.open)
  const popups = [];
  page.on('popup', (p) => popups.push(p.url()));
  const socialHrefs = await socialBtns.evaluateAll((els) => els.map((e) => e.href));
  log('social hrefs wired', socialHrefs.every((h) => h && h !== 'about:blank'), socialHrefs.join(' | '));
  await socialBtns.first().click();
  await page.waitForTimeout(500);
  log('social button opens popup', popups.length >= 1, popups.join(','));

  // Reset hides gallery
  await reset.click();
  await page.waitForTimeout(700);
  log('reset hides gallery', parseFloat(await page.locator('#gallery').evaluate((el) => getComputedStyle(el).opacity)) < 0.5);

  log('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' || '));

  await browser.close();

  const fails = results.filter((r) => !r.pass);
  console.log(`\n==== ${results.length - fails.length}/${results.length} passed ====`);
  if (fails.length) { console.log('Failures:'); fails.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`)); }
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
