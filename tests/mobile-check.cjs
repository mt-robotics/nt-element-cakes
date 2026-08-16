const { chromium } = require('playwright');

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

  // Before crack
  await page.screenshot({ path: '/tmp/mobile_intro.png' });

  // Check brand title single line + no overflow
  const brand = await page.locator('#brand-title').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), right: Math.round(r.right), vw: window.innerWidth };
  });
  console.log('brand title:', JSON.stringify(brand), 'overflows right edge?', brand.right > brand.vw);

  // Check eyebrow hidden on mobile
  console.log('eyebrow visible:', await page.locator('.eyebrow').isVisible());

  // Crack
  await page.locator('#spoon-cta').click();
  await page.waitForTimeout(1700);
  await page.screenshot({ path: '/tmp/mobile_gallery.png' });

  // Check gallery cards + social bar fit without horizontal page overflow
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
  }));
  console.log('page overflow:', JSON.stringify(overflow), 'H-overflow?', overflow.scrollW > overflow.innerW);

  const socialBtns = page.locator('.social-bar .social-btn');
  console.log('social buttons visible on mobile:', await socialBtns.first().isVisible(), 'count:', await socialBtns.count());

  // Lightbox on mobile
  await page.locator('.cake-card').first().click();
  await page.waitForTimeout(500);
  const lb = await page.locator('#lightbox').evaluate((el) => el.classList.contains('is-open'));
  console.log('lightbox opens on mobile:', lb);
  await page.screenshot({ path: '/tmp/mobile_lightbox.png' });

  console.log('console errors:', errs.length ? errs.slice(0,3).join(' || ') : 'none');
  await browser.close();
})();
