// node film_render.cjs landscape|portrait [stills t1,t2,...]   -> stills/*.jpg or frames piped to ffmpeg
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => {
  const fmt = process.argv[2] || 'landscape'; const stills = process.argv[3];
  const W = fmt === 'portrait' ? 1080 : 1920, H = fmt === 'portrait' ? 1920 : 1080;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto('file://' + path.resolve(__dirname, 'film.html') + '?fmt=' + fmt);
  await p.waitForFunction('window.READY && window.READY()', null, { timeout: 60000 });
  const out = path.resolve(__dirname, 'stills'); fs.mkdirSync(out, { recursive: true });
  if (stills) {
    let n = 0;
    for (const t of stills.split(',').map(Number)) {
      await p.evaluate(t => render(t), t);
      await p.screenshot({ path: path.join(out, `${fmt}-${String(++n).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
    }
    await b.close(); return;
  }
  const FPS = 60, N = Math.round(36 * FPS);
  const dest = path.resolve(__dirname, `../../film/suds-enviro-identity-${fmt === 'portrait' ? '9x16' : '16x9'}-silent.mp4`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', dest], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => render(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(fmt, i, '/', N);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', dest); await b.close();
})();
