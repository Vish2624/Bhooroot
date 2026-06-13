const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(1500);

  const shots = [
    { sel: '.hero-wrap',             name: 'hero' },
    { sel: '.trust-bar',             name: 'trust' },
    { sel: '.hero-search-section',   name: 'search' },
    { sel: '#page-home .section.section-alt', name: 'categories' },
    { sel: '#page-home .section.section-white', name: 'bestsellers' },
    { sel: '.crop-section',          name: 'crops' },
    { sel: '.promo-section',         name: 'promos' },
    { sel: '.why-buy-section',       name: 'whybuy' },
    { sel: '.vendor-strip',          name: 'vendors' },
    { sel: '.reviews-grid',          name: 'reviews' },
    { sel: '.footer',                name: 'footer' },
  ];

  for (const s of shots) {
    try {
      const el = await p.$(s.sel);
      if (el) {
        await el.screenshot({ path: `../sec_${s.name}.png` });
        console.log(`done: ${s.name}`);
      } else {
        console.log(`missing: ${s.name}`);
      }
    } catch(e) { console.log(`err ${s.name}: ${e.message.slice(0,60)}`); }
  }

  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:4322', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: '../screen_mobile.png', fullPage: true });
  console.log('mobile done');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
