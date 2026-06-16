const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DOCS = 'z:/Uhazvumart/Uhazvumart/docs';
const server = http.createServer((req, res) => {
  let filePath = path.join(DOCS, req.url === '/' ? '/index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  const mime = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg' };
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

(async () => {
  server.listen(8181);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:8181');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'z:/Uhazvumart/Uhazvumart/tmp_docs.png', fullPage: false });
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  server.close();
  await browser.close();
})();
