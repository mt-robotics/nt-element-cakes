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

  // Load + loading overlay
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('#loading', { state: 'detached', timeout: 6000 }).catch(() => {});
  log('loading overlay dismissed', (await page.locator('#loading').count()) === 0);
  await page.waitForTimeout(800);

  // Canvas + header
  const box = await page.locator('#scene').boundingBox();
  log('3D canvas fullscreen', !!box && box.width >= 1200, box ? `${box.width}x${box.height}` : 'none');
  log('brand header visible', await page.locator('.brand-shell').isVisible());

  // CTA -> crack -> gallery
  const cta = page.locator('#spoon-cta');
  log('#spoon-cta visible+enabled', (await cta.isVisible()) && (await cta.isEnabled()));
  await cta.click();
  await page.waitForTimeout(1600);
  log('gallery interactive after crack',
    (await page.locator('#gallery').evaluate((el) => getComputedStyle(el).pointerEvents)) === 'auto');

  // Reset button
  const reset = page.locator('#reset');
  log('reset button clickable', await reset.isVisible()
    && (await reset.evaluate((el) => getComputedStyle(el).pointerEvents)) === 'auto');

  // Cake cards
  log('cake cards rendered', (await page.locator('.cake-card').count()) >= 10, `${await page.locator('.cake-card').count()} cards`);

  // Reset hides gallery
  await reset.click();
  await page.waitForTimeout(700);
  log('reset hides gallery', parseFloat(await page.locator('#gallery').evaluate((el) => getComputedStyle(el).opacity)) < 0.5);

  // Social coffee beans — locate via the hover label signal, then click
  let found = [];
  for (let gx = 0.02; gx <= 0.98 && found.length < 3; gx += 0.015) {
    for (let gy = 0.02; gy <= 0.98 && found.length < 3; gy += 0.015) {
      const sx = box.x + box.width * gx;
      const sy = box.y + box.height * gy;
      await page.mouse.move(sx, sy);
      await page.waitForTimeout(15);
      const label = await page.locator('#social-label').textContent();
      if (label && label.includes('tap to order')) {
        const platform = label.replace(' — tap to order', '').trim();
        if (!found.includes(platform)) { found.push(platform); await page.mouse.click(sx, sy); await page.waitForTimeout(120); }
      }
    }
  }
  const opened = await page.evaluate(() => window.__opened || []);
  log('social coffee beans clickable', found.length >= 2 && opened.length >= 2,
    `beans=${found.join(',')} | opened=${opened.length}`);
  opened.forEach((u) => console.log('  -> ' + u));

  // Console errors
  log('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' || '));

  await browser.close();

  const fails = results.filter((r) => !r.pass);
  console.log(`\n==== ${results.length - fails.length}/${results.length} passed ====`);
  if (fails.length) { console.log('Failures:'); fails.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`)); }
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
