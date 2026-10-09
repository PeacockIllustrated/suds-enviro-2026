// Render every brand book page to JPG, plus a contact sheet input. node pages.cjs [from] [to]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const file = path.resolve(__dirname, '../../brand-book.html');
  const out = path.resolve(__dirname, '../../pages'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1432, height: 1000 }, deviceScaleFactor: 1 });
  const html = fs.readFileSync(file, 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: ':root{--k:1 !important} .pg{box-shadow:none}' });
  const n = await p.$$eval('.pg', e => e.length);
  const from = +(process.argv[2] || 1), to = +(process.argv[3] || n);
  for (let i = from; i <= Math.min(to, n); i++) {
    const el = await p.$('#p' + i);
    await el.screenshot({ path: path.join(out, `page-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 88 });
  }
  console.log('rendered', from, '-', Math.min(to, n), 'of', n);
  await b.close();
})();
