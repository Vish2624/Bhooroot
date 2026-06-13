const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();

  // Mobile sections
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(800);

  for (const [sel, name] of [
    ['.crop-section', 'mob_crop'],
    ['.why-buy-section', 'mob_whybuy'],
    ['.promo-section', 'mob_promos'],
    ['#page-home .section.section-white:nth-of-type(1)', 'mob_bestsellers'],
  ]) {
    const el = await p.$(sel);
    if (el) { await el.screenshot({ path: `../sec_${name}.png` }); console.log('done:', name); }
    else console.log('missing:', name);
  }

  // Desktop: check bestsellers grid closely
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(800);
  const bs = await p.$('#featuredGrid');
  if (bs) { await bs.screenshot({ path: '../sec_featuredgrid.png' }); console.log('done: featuredgrid'); }

  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
