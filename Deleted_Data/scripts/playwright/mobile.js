const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: '../screen_mobile.png', fullPage: true });
  // check console errors
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  // hero crop section on mobile
  const cropEl = await p.$('.crop-grid');
  if (cropEl) await cropEl.screenshot({ path: '../sec_crop_mobile.png' });
  const trustEl = await p.$('.trust-bar');
  if (trustEl) await trustEl.screenshot({ path: '../sec_trust_mobile.png' });
  console.log('mobile done, errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
