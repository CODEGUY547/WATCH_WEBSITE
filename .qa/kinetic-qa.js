const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.28));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'kinetic-mid.png' });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.72));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'kinetic-late.png' });
  console.log(JSON.stringify({ title: await page.title(), errors }));
  process.exit(0);
})();
