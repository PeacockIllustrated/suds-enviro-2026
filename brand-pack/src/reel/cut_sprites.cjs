// node cut_sprites.cjs [from] [to]   -> sprites/{solid,xray}-N.png and sprites/index.json (N = frame at 30 fps)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const FS = 30, from = +(process.argv[2] || 0), to = +(process.argv[3] || 16 * FS);
  const out = path.resolve(__dirname, 'sprites'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 900, height: 900 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('http://localhost:3200/brand-pack/src/reel/cut.html?mode=sprite');
  await p.waitForFunction('window.READY && window.READY()', null, { timeout: 120000 });
  for (let n = from; n < to; n++) for (const layer of ['solid', 'xray']) {
    const f = path.join(out, `${layer}-${n}.png`); if (fs.existsSync(f)) continue;
    const t0 = Date.now(); const url = await p.evaluate(([t, l]) => window.sprite(t, l), [n / FS, layer]);
    if (!url) continue;
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(layer, n, Date.now() - t0, 'ms');
  }
  const ix = fs.readdirSync(out).filter(f => /^(solid|xray)-\d+\.png$/.test(f)).map(f => { const [l, n] = f.slice(0, -4).split('-'); return [l, +n]; });
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(ix));
  await b.close();
})();
