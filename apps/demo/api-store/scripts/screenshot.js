const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const outDir = path.join(__dirname, '..', 'design-references');

  const pages = [
    { url: 'http://localhost:3002', name: 'landing' },
    { url: 'http://localhost:3002/login', name: 'login' },
    { url: 'http://localhost:3002/signup', name: 'signup' },
    { url: 'http://localhost:3002/marketplace', name: 'marketplace' },
  ];

  for (const p of pages) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, `implemented-${p.name}.png`), fullPage: false });
      console.log(`Screenshot saved: ${p.name}`);
    } catch (e) {
      console.error(`Failed ${p.name}: ${e.message}`);
    }
  }

  await browser.close();
})();
