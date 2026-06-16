const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('https://vish2624.github.io/Uhazvumart/');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'z:/Uhazvumart/Uhazvumart/tmp_debug.png', fullPage: true });
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})();
