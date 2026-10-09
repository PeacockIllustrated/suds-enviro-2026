// Print the repo's web data sheets to PDF exactly as the site prints them.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const n of process.argv.slice(2)) {
    await p.goto(`http://localhost:3300/public/brochures/${n}.html`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.resolve(__dirname, `../sheets/${n}.pdf`), preferCSSPageSize: true, printBackground: true });
    console.log('ok', n);
  }
  await b.close();
})();
