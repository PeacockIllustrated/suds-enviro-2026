// Viewport frames at set scroll positions for scroll-driven pages.
const { chromium } = require('playwright'); const path = require('path');
const OUT = p => path.resolve(__dirname, '../shots', p);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const plan = { home: ['/', [0, 1100, 2200, 3300, 4400, 5600, 7000, 8600, 10500, 12500]], chamber: ['/products/inspection-chamber', [0, 900, 1800, 2700, 3600, 4400]], journey: ['/water-journey', [0]], explorer: ['/site-explorer', [0]] };
  for (const [n, [u, ys]] of Object.entries(plan)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
    await p.goto('http://localhost:3100' + u, { waitUntil: 'load', timeout: 180000 });
    await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }); await p.waitForTimeout(6000);
    for (const y of ys) {
      await p.mouse.wheel(0, 0); await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(2600);
      const f = OUT(`vp-${n}-${String(y).padStart(5, '0')}.png`); if (require('fs').existsSync(f)) continue;
      await p.screenshot({ path: f, timeout: 180000 }); console.log(n, y);
    }
    if (n === 'journey') {
      for (let i = 1; i < 8; i++) {
        const nx = p.locator('button[aria-label*="ext" i]').last();
        try { await nx.click({ timeout: 3000 }); } catch { await p.keyboard.press('ArrowRight'); }
        await p.waitForTimeout(2600); await p.screenshot({ path: OUT(`vp-journey-stop${i}.png`), timeout: 180000 }); console.log('stop', i);
      }
    }
    await p.close();
  }
  await b.close();
})();
