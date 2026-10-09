// Water Journey: one viewport frame per stop, by clicking the timeline.
const { chromium } = require('playwright'); const path = require('path');
const OUT = p => path.resolve(__dirname, '../shots', p);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await p.goto('http://localhost:3100/water-journey', { waitUntil: 'load', timeout: 180000 });
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }); await p.waitForTimeout(6000);
  const n = await p.locator('nav button[aria-label*=" of "]').count(); console.log('stops', n);
  for (let i = 0; i < n; i++) {
    await p.locator('nav button[aria-label*=" of "]').nth(i).click(); await p.waitForTimeout(4500);
    await p.screenshot({ path: OUT(`vp-journey-stop${i}.png`), timeout: 180000 }); console.log('stop', i);
  }
  await b.close();
})();
