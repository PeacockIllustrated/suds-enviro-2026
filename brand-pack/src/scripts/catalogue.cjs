// Render every product GLB in the one catalogue format. node catalogue.cjs [mode] [size]
const { chromium } = require('playwright'); const path = require('path');
const items = require('../catalogue/items.json');
(async () => {
  const mode = process.argv[2] || 'solid', S = process.argv[3] || 1600;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const it of items) {
    if (process.argv[4] && it.id !== process.argv[4]) continue;
    const p = await b.newPage({ viewport: { width: +S, height: +S } });
    p.on('console', m => m.type() === 'error' && console.log(it.id, m.text()));
    const url = `http://localhost:3200/brand-pack/src/catalogue/render.html?f=/public/models/library/v1/${it.file}&m=${mode}&s=${S}` + (it.yaw ? `&yaw=${it.yaw}` : '') + (it.pitch ? `&pitch=${it.pitch}` : '');
    await p.goto(url); await p.waitForFunction('window.DONE', null, { timeout: 240000 });
    await p.screenshot({ path: path.join(__dirname, `../catalogue/out/${mode}-${it.id}.png`), omitBackground: mode === 'xray' || mode === 'cut' });
    console.log('ok', it.id, await p.title()); await p.close();
  }
  await b.close();
})();
