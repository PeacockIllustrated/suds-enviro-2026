// Print configurator-generated spec sheets to PDF.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const n of process.argv.slice(2)) {
    await p.goto('file://' + path.resolve(__dirname, '../gen', n + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.resolve(__dirname, '../gen', n + '.pdf'), preferCSSPageSize: true, printBackground: true });
  }
  await b.close();
})();
