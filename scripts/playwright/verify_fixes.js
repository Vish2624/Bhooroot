const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();

  // Desktop — best sellers + promo
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(800);

  const fg = await p.$('#featuredGrid');
  if (fg) { await fg.screenshot({ path: '../fix_bestsellers.png' }); console.log('bestsellers done'); }

  const pr = await p.$('.promo-section');
  if (pr) { await pr.screenshot({ path: '../fix_promos.png' }); console.log('promos done'); }

  // Mobile — crop grid
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(800);

  const cg = await p.$('.crop-section');
  if (cg) { await cg.screenshot({ path: '../fix_crop_mobile.png' }); console.log('crop mobile done'); }

  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
