const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();

  // Allow all requests including Iconify CDN
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:57326', { waitUntil: 'networkidle', timeout: 20000 });
  // Wait for Iconify to fetch and render icons from CDN
  await p.waitForTimeout(4000);

  const shots = [
    ['.trust-bar',       'sec_trust'],
    ['.hero-content',    'sec_hero'],
    ['.why-buy-section', 'sec_whybuy'],
    ['.crop-section',    'sec_crops'],
    ['.footer',          'sec_footer'],
    ['#page-home .section.section-white', 'sec_bestsellers'],
  ];

  for (const [sel, name] of shots) {
    const el = await p.$(sel);
    if (el) { await el.screenshot({ path: `../${name}.png` }); console.log('done:', name); }
    else console.log('missing:', sel);
  }

  // Mobile bottom nav
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:57326', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(3000);
  const bn = await p.$('.bottom-nav');
  if (bn) { await bn.screenshot({ path: '../sec_bnav.png' }); console.log('done: bnav'); }

  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
