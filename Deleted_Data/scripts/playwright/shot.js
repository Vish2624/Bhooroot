const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: undefined });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:4321', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '../screen_desktop.png', fullPage: true });
  console.log('desktop done');
  await p.setViewportSize({ width: 390, height: 844 });
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: '../screen_mobile.png', fullPage: true });
  console.log('mobile done');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
