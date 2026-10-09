// Render an SVG file to a PNG at a given width: node svgpng.cjs in.svg out.png width [bg]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [inp, out, w, bg] = process.argv.slice(2);
  const svg = fs.readFileSync(inp, 'utf8');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 100 } });
  await p.setContent(`<html><body style="margin:0;background:${bg || 'transparent'}"><div id=s style="width:${w}px">${svg}</div><style>svg{width:100%;height:auto;display:block}</style></body></html>`);
  const el = await p.$('#s'); await el.screenshot({ path: out, omitBackground: !bg });
  await b.close();
})();
