const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
  page.on('requestfailed', request =>
    console.log('BROWSER_REQUEST_FAILED:', request.url(), request.failure().errorText)
  );

  const fileUrl = 'file://' + path.resolve(__dirname, 'frontend/index.html').replace(/\\/g, '/');
  console.log('Navigating to:', fileUrl);
  
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  console.log('Page loaded. Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
