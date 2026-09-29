const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    timeout: 15000
  });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  desktop.on('pageerror', error => errors.push(error.message));
  await desktop.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await desktop.waitForTimeout(2900);
  await desktop.screenshot({ path: 'desktop.png', fullPage: false });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await mobile.waitForTimeout(2900);
  await mobile.screenshot({ path: 'mobile.png', fullPage: false });

  console.log(JSON.stringify({ title: await desktop.title(), errors }));
  await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 2000))]);
  process.exit(0);
})();
