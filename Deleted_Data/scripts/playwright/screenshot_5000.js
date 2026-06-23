const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();

  // Desktop Screenshot
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(__dirname, 'desktop_current.png'), fullPage: true });
  console.log('Saved desktop_current.png');

  // Mobile Screenshot
  await p.setViewportSize({ width: 375, height: 812 });
  await p.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 15000 });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(__dirname, 'mobile_current.png'), fullPage: true });
  console.log('Saved mobile_current.png');

  await b.close();
})().catch(e => {
  console.error(e);
  process.exit(1);
});
