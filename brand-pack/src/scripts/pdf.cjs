// Print the brand book to PDF, one 1400 x 990 page per sheet, screen grain off.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../../brand-book.html'), 'utf8');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: '@page{size:1400px 990px;margin:0} :root{--k:1 !important} body{padding:0 !important}' });
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.resolve(__dirname, '../../brand-book.pdf'), width: '1400px', height: '990px', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('pdf ok');
})();
