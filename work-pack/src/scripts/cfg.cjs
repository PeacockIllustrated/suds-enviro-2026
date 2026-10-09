// Configurator walk-through at phone size: one screenshot per step.
const { chromium } = require('playwright'); const path = require('path');
const OUT = p => path.resolve(__dirname, '../shots', p);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3100/configurator', { waitUntil: 'load', timeout: 180000 });
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }); await p.waitForTimeout(5000);
  const shot = async n => { await p.waitForTimeout(1000); await p.screenshot({ path: OUT(`cfg-${n}.png`) }); console.log('cfg', n); };
  const btn = async re => { const l = p.getByRole('button', { name: re }).first(); try { await l.click({ timeout: 4000 }); return true; } catch (e) { console.log('miss', re); return false; } };
  const next = () => btn(/^(Next|Generate Output)/);
  await btn(/^Inspection Chamber/); await shot('00-product'); await next();
  await btn(/^Surface Water/); await shot('01-system'); await next();
  await btn(/^600/); await shot('02-diameter'); await next();
  await btn(/^3\s*inlets/); await shot('03-inlets'); await next();
  for (const h of ['3', '6', '9']) await btn(new RegExp('^' + h + '$'));
  await shot('04-clock'); await next();
  for (const n of ['Inlet 1', 'Inlet 2', 'Inlet 3']) {
    try { await p.getByRole('button', { name: /Select size/ }).first().click({ timeout: 3000 }); await p.waitForTimeout(600);
      await p.waitForTimeout(600); await p.getByText('110mm EN1401', { exact: true }).last().click({ timeout: 3000, force: true }); await p.waitForTimeout(700); } catch (e) { console.log('pipe miss', n, e.message.slice(0, 80)); }
  }
  await shot('05-pipes'); await next();
  await btn(/^No/); await shot('06-flow'); await next();
  await btn(/^Yes \(S104\)/); await btn(/^1\.5/); await shot('07-depth'); await next();
  await shot('08-review'); await p.screenshot({ path: OUT('cfg-08-review-full.png'), fullPage: true }); await next();
  await shot('09-output');
  await b.close();
})();
