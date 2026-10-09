// Phone frames (390 x 844) of the key pages, first screen plus one scrolled screen.
const { chromium } = require('playwright'); const path = require('path');
const OUT = p => path.resolve(__dirname, '../shots', p);
const pages = [['home', '/', [0, 2200]], ['journey', '/water-journey', [0, 1400]], ['explorer', '/site-explorer', [0, 900]], ['range', '/rhino-range', [0, 900]], ['chamber', '/products/inspection-chamber', [0, 1200]], ['builder', '/builder', [0]]];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [n, u, ys] of pages) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await p.goto('http://localhost:3100' + u, { waitUntil: 'load', timeout: 180000 });
    await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }); await p.waitForTimeout(6000);
    for (const y of ys) {
      await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(3000);
      await p.screenshot({ path: OUT(`ph-${n}-${y}.png`), timeout: 180000 }); console.log(n, y);
    }
    await p.close();
  }
  await b.close();
})();
