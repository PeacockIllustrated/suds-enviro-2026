// Screenshot a URL: node shot.cjs URL OUT W H [full] [waitMs]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, full, wait] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await p.waitForTimeout(+(wait || 4000));
  await p.screenshot({ path: out, fullPage: full === '1' });
  await b.close();
})();
