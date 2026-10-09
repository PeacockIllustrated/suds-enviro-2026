// Render a work-pack HTML book to page JPGs (for review) and a print PDF.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const name = process.argv[2]; const ROOT = path.resolve(__dirname, '../..');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('file://' + path.join(ROOT, name + '.html'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const dir = path.join(ROOT, 'pages', name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = await p.locator('section.pg').count();
  for (let i = 0; i < n; i++) await p.locator('section.pg').nth(i).screenshot({ path: path.join(dir, `page-${String(i + 1).padStart(2, '0')}.jpg`), quality: 82, type: 'jpeg' });
  await p.pdf({ path: path.join(ROOT, name + '.pdf'), width: '1600px', height: '1000px', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log(name, n, 'pages');
})();
