// Screenshot the locally-run site (next dev on :3100) for the applications chapter.
const { chromium } = require('playwright');
const OUT = __dirname + '/../shots/';
const routes = [
  ['site-home', '/', 1440, 900],
  ['site-rhino-range', '/rhino-range', 1440, 900],
  ['site-products', '/products', 1440, 900],
  ['site-chamber', '/products/inspection-chamber', 1440, 900],
  ['site-builder', '/builder', 1440, 900],
  ['site-configurator', '/configurator', 1440, 900],
  ['site-journey', '/water-journey', 1440, 900],
  ['site-explorer', '/site-explorer', 1440, 900],
  ['site-home-2', '/', 1440, 900, 1400],
  ['site-home-3', '/', 1440, 900, 3000],
  ['m-home', '/', 390, 844],
  ['m-chamber', '/products/inspection-chamber', 390, 844],
  ['m-configurator', '/configurator', 390, 844],
];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  for (const [name, path, w, h, scroll] of routes) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    try {
      await p.goto('http://localhost:3100' + path, { waitUntil: 'load', timeout: 180000 });
      await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(()=>{});
      if (scroll) { await p.evaluate(y => window.scrollTo(0, y), scroll); }
      await p.waitForTimeout(9000);
      await p.screenshot({ path: OUT + name + '.png' });
      console.log('ok', name);
    } catch (e) { console.log('fail', name, e.message); }
    await p.close();
  }
  await b.close();
})();
