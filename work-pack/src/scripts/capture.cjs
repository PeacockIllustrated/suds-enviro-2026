// Full-page site captures and a configurator walk-through, from the site running locally.
const { chromium } = require('playwright'); const path = require('path');
const OUT = p => path.resolve(__dirname, '../shots', p);
const HIDE = 'nextjs-portal{display:none!important}';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const full = [['home', '/'], ['journey', '/water-journey'], ['explorer', '/site-explorer'], ['range', '/rhino-range'], ['products', '/products'], ['chamber', '/products/inspection-chamber'], ['builder', '/builder'], ['contact', '/contact'], ['about', '/about']];
  for (const [n, u] of full) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
    try {
      await p.goto('http://localhost:3100' + u, { waitUntil: 'load', timeout: 180000 });
      await p.addStyleTag({ content: HIDE }); await p.waitForTimeout(6000);
      // walk the page so lazy content renders
      const h = await p.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < h; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(250); }
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
      await p.screenshot({ path: OUT(`full-${n}.png`), fullPage: true });
      console.log('full', n, h);
    } catch (e) { console.log('fail', n, e.message); }
    await p.close();
  }
  // configurator walk-through, phone size
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3100/configurator', { waitUntil: 'load', timeout: 180000 });
  await p.addStyleTag({ content: HIDE }); await p.waitForTimeout(5000);
  const shot = async n => { await p.waitForTimeout(900); await p.screenshot({ path: OUT(`cfg-${n}.png`) }); console.log('cfg', n); };
  const tryClick = async (...texts) => { for (const t of texts) { const l = p.getByText(t, { exact: false }).first(); if (await l.count()) { try { await l.click({ timeout: 3000 }); return true; } catch {} } } return false; };
  const next = async () => { const n = p.getByRole('button', { name: /^Next|Generate Output/ }).last(); try { await n.click({ timeout: 4000 }); } catch (e) { console.log('next fail'); } };
  await shot('00-product'); await tryClick('Inspection Chamber'); await shot('00b-product-picked'); await next();
  await shot('01-system'); await tryClick('Surface Water'); await next();
  await shot('02-diameter'); await tryClick('600'); await next();
  await shot('03-inlets'); await tryClick('3 inlets', '3'); await next();
  await shot('04-clock');
  for (const h of ['3', '6', '9']) { const t = p.locator('svg text', { hasText: new RegExp('^' + h + '$') }).first(); try { await t.click({ timeout: 2000, force: true }); } catch {} }
  await shot('04b-clock-set'); await next();
  await shot('05-pipes'); await next();
  await shot('06-flow'); await tryClick('No flow control', 'No'); await next();
  await shot('07-depth'); await tryClick('Adoptable', 'Yes'); await tryClick('1500'); await next();
  await shot('08-review'); await next();
  await shot('09-output');
  await b.close();
})();
