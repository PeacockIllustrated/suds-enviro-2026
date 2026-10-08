from core import *
from pages_a import opener_panel
from assets import img, svg
import itertools, json, os

# ---------------------------------------------------------------- devices
def devices_opener():
    body = opener_panel('devices', 'Six devices, all harvested from work SuDS Enviro already has: the drop, the configurator, the website and the drawings. Use one or two at a time. They are seasoning.') + f'''
<div class="abs" style="left:960px;right:136px;top:100px;height:400px;display:flex;align-items:center;justify-content:center">{clock_plan(r=96)}</div>
<div class="abs" style="left:360px;right:136px;top:560px">
  <table>
    <tr><th>Device</th><th>Harvested from</th><th>Use it for</th></tr>
    <tr><td><b>The cut</b></td><td>The site's Site Explorer, where the ground cuts away</td><td>Covers, chapter openers, footers</td></tr>
    <tr><td><b>The gauge</b></td><td>River staff gauges; the 500 mm depth steps in the configurator</td><td>Progress: page edges, scroll, configurator steps</td></tr>
    <tr><td><b>The Clockwork plan</b></td><td>The configurator's clock face and the Clockwork inlet system</td><td>Anything about inlets and outlets</td></tr>
    <tr><td><b>The bands</b></td><td>The drop's four layers and the site's wave borders</td><td>One divider per spread, the edge of a page</td></tr>
    <tr><td><b>The x-ray</b></td><td>The ghosted product drawings on the live site</td><td>Showing what is inside a product</td></tr>
    <tr><td><b>The ring</b></td><td>The diameter picker on the site</td><td>Sizes, in pairs with the plan</td></tr>
  </table>
</div>'''
    page('devices', body, cls='opener')

def devices_tiles():
    def tile(n, title, inner, note, bg=SURFACE):
        return f'''<div style="display:flex;flex-direction:column;gap:10px;min-width:0"><div style="height:290px;background:{bg};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">{inner}</div>
        <div style="display:flex;gap:10px;align-items:baseline"><span class="mono" style="font-size:11px;color:{BLUE};font-weight:600">{n}</span><b style="font-size:15px;text-transform:uppercase">{title}</b></div><p class="small" style="margin:0">{note}</p></div>'''
    cut = f'<svg viewBox="0 0 300 290" width="300" height="290">' + section_column(3000, w=300, h=990).replace('<svg viewBox="0 0 300 990" class="sectcol" preserveAspectRatio="none">', '<g transform="translate(0 -60) scale(1 .36)">').replace('</svg>', '</g>') + '</svg>'
    g = gauge(4000, top=20, bottom=270, x=150, w=30).replace('class="gauge" viewBox="0 0 1400 990"', 'viewBox="60 0 160 290" width="160" height="290"')
    ring = f'<div style="display:flex;gap:18px;align-items:center">{ring_label("600 mm", r=58, col=BLUE)}{ring_label("900 mm", r=80, col=DEEP)}</div>'
    tiles = [
        tile('01', 'The cut', cut, 'Ground on top, strata tinted by depth, a shaft cut to the level that matters. Always measured.', PAPER),
        tile('02', 'The gauge', g, 'Alternates colour every metre like a river staff gauge. The green marker is where you are.'),
        tile('03', 'The Clockwork plan', clock_plan(inlets=(3, 6, 9), r=64), 'Outlet green at 12, inlets blue at the positions used. Unused positions stay as faint rings.'),
        tile('04', 'The bands', f'<div style="width:100%;padding:0 26px">{bands(560, 150)}</div>', 'The drop laid flat: green, blue, green, red, in that order, never re-ordered.', PAPER),
        tile('05', 'The x-ray', f'<img src="{img("../photography/xray/sehds1800.png", 600, "webp")}" style="height:270px" alt="">', 'A ghosted product drawn in Blue lines, Green on the parts that move water.'),
        tile('06', 'The ring', ring, 'A diameter with its size set along the arc, white on the band. Darker blue for larger sizes.', PAPER),
    ]
    body = f'''
<div class="area">
  <p class="eyebrow">2500 mm <span style="color:{DEEP}">/</span> The six</p>
  <h2 class="two h2"><span class="lt">One or two</span> <b>at a time</b></h2>
  <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:24px 28px;margin-top:24px">{''.join(tiles)}</div>
</div>'''
    page('devices', body)

def clockwork31():
    combos = [c for n in range(1, 6) for c in itertools.combinations((3, 5, 6, 7, 9), n)]
    allowed = {1: '450 mm and up', 2: '450 mm and up', 3: '600 mm and up', 4: '600 mm and up', 5: '750 mm and up'}
    rows = ''
    for n in range(1, 6):
        cs = [c for c in combos if len(c) == n]
        cells = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:0;width:84px">{clock_plan(inlets=c, r=24, labels=False, node=5, wall=2.4, dark=True).replace("class=\"clock\"", "width=\"84\" height=\"84\"")}<span class="mono" style="font-size:9.5px;color:{SKY}">{"·".join(map(str, c))}</span></div>' for c in cs)
        rows += f'''<div style="display:flex;align-items:center;gap:20px;border-top:1px solid rgba(175,219,244,.16);padding:8px 0">
          <div style="width:150px;flex:none"><div style="font:800 26px var(--display);color:#fff">{n} <span style="font-weight:300;color:{GREEN};font-size:18px;text-transform:uppercase">inlet{"s" if n > 1 else ""}</span></div><div class="mono" style="font-size:10.5px;color:{SKY}">{len(cs)} layout{"s" if len(cs) > 1 else ""} · {allowed[n]}</div></div>
          <div style="display:flex;flex-wrap:wrap;gap:0 4px">{cells}</div></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">2500 mm <span style="color:{SKY}">/</span> The Clockwork system</p>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:30px">
    <h2 class="two h1"><span class="lt">Five ways in.</span><br><b>One way out.</b></h2>
    <p class="small" style="max-width:430px;margin:0">Inlets are manufactured at 3, 5, 6, 7 and 9 o'clock, the outlet is fixed at 12. That gives exactly 31 inlet layouts, drawn here. Bespoke for the site, standardised in the factory: the slogan, as a diagram.</p>
  </div>
  <div style="margin-top:20px">{rows}</div>
  <p class="cap" style="margin-top:8px">How many inlets a chamber takes depends on its diameter (450 mm: two, 600 mm: four, 750 mm and up: five), from the SERSIC and SERFIC data sheets and the configurator's rule R1.</p>
</div>'''
    page('devices', body, dark=True)

# ---------------------------------------------------------------- photography
ITEMS = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'catalogue', 'items.json')))

def photo_opener():
    body = opener_panel('photo', 'Two jobs, kept strictly apart. Catalogue images show the product and nothing else, all in one format. Hero images show it in the ground, the yard, the rain.') + f'''
<div class="abs" style="left:960px;right:136px;top:100px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <img src="{img('../photography/catalogue/sersic600.jpg', 520)}" style="width:100%" alt="RHINO SERSIC600 catalogue image">
  <img src="{img('../photography/catalogue/sehds1800.jpg', 520)}" style="width:100%" alt="SudSceptor SEHDS1800 catalogue image">
  <img src="{img('../photography/hero/hero-1-trench.jpg', 700)}" style="width:100%;grid-column:span 2;aspect-ratio:3/2;object-fit:cover" alt="Chamber lowered into a trench">
</div>
<div class="abs" style="left:360px;top:640px;width:560px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
  <div><p class="eyebrow">Catalogue</p><p class="small">Data sheets, the configurator, the product pages, quotes. One fixed format, so forty products read as one set.</p></div>
  <div><p class="eyebrow">Hero</p><p class="small">Covers, the home page, social, hoardings. Shot the way a site photographer would, never in the catalogue format.</p></div>
</div>'''
    page('photo', body, cls='opener')

def catalogue():
    cells = ''.join(f'<div style="min-width:0"><img src="{img("../photography/catalogue/" + it["id"] + ".jpg", 420, q=82)}" style="width:100%;aspect-ratio:1" alt="{it["name"]}"><div class="mono" style="font-size:10.5px;margin-top:5px;color:{DEEP}">{it["name"]}</div></div>' for it in ITEMS[:15])
    body = f'''
<div class="area">
  <p class="eyebrow">3000 mm <span style="color:{DEEP}">/</span> Catalogue format</p>
  <div style="display:grid;grid-template-columns:330px 1fr;gap:34px;margin-top:6px">
    <div>
      <h2 class="two h2"><span class="lt">One camera,</span> <b>every product</b></h2>
      <table style="margin-top:20px;font-size:13px">
        <tr><td>Frame</td><td class="num">Square, product centred, filling 78%</td></tr>
        <tr><td>Camera</td><td class="num">22° above level, 35° round from front left</td></tr>
        <tr><td>Ground</td><td class="num">Surface #EEF3F5, seamless</td></tr>
        <tr><td>Light</td><td class="num">Key top left, soft fill, soft contact shadow</td></tr>
        <tr><td>Lens</td><td class="num">Long: 22° field of view, no distortion</td></tr>
        <tr><td>Product</td><td class="num">As made. Lid on, no props, no pipes</td></tr>
      </table>
      <p class="small" style="margin-top:16px">This set was rendered from SuDS Enviro's own 3D product files, so it is complete today and every new product can join it the day its file exists. A studio reshoot should copy the same numbers.</p>
      <p class="cap">Body colour follows the 3D library's defaults until real material samples are matched.</p>
    </div>
    <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:14px 12px">{cells}</div>
  </div>
</div>'''
    page('photo', body)

def heroes():
    body = f'''
<div class="abs" style="left:0;top:0;width:1400px;height:990px"><img src="{img('../photography/hero/hero-2-yard.jpg', 1600)}" style="width:100%;height:100%;object-fit:cover" alt="RHINO chambers on pallets in a wet stock yard"></div>
<div class="abs" style="left:0;bottom:0;width:1400px;height:330px;background:linear-gradient(180deg,rgba(6,42,58,0),rgba(6,42,58,.88))"></div>
<div class="abs" style="left:64px;bottom:70px;width:760px;color:#fff">
  <p class="eyebrow" style="color:{GREEN}">3000 mm / Hero</p>
  <h2 class="two h1"><span class="lt" style="color:#fff">Shot where</span> <b style="color:#fff">it lives</b></h2>
  <p style="color:#dcebf3;margin-top:12px">Three-quarter or low angles, real light: an overcast morning, low sun, work lights. The product exactly as it is made.</p>
</div>'''
    page('photo', body, dark=True)

def heroes_grid():
    pics = [('hero-1-trench', 'Lowering a RHINO SERSIC chamber, housing site, morning'), ('hero-3-delivery', 'SudSceptor SEHDS1800 arriving on site, low sun'), ('hero-4-dusk', 'RhinoLift PS50 bedded in, under work lights'), ('hero-5-street', 'Where the water starts: rain on a new street'), ('hero-6-outfall', 'Where it ends: a clean outfall to the beck')]
    cells = ''.join(f'<figure style="margin:0;min-width:0;{"grid-row:span 2;" if i == 0 else ""}"><img src="{img("photo/" + p + ".png", 1100 if i == 0 else 640)}" style="width:100%;{"height:726px" if i == 0 else "height:337px"};object-fit:cover" alt="{c}"><figcaption class="cap" style="margin-top:6px">{c}</figcaption></figure>' for i, (p, c) in enumerate(pics))
    body = f'''
<div class="area">
  <p class="eyebrow">3000 mm <span style="color:{DEEP}">/</span> Hero set</p>
  <div class="grid" style="grid-template-columns:1.25fr 1fr 1fr;gap:16px;margin-top:4px">{cells}</div>
  <p class="cap" style="margin-top:14px;max-width:150ch">These were re-photographed from the 3D product files with an image model, with the brief to keep each product exactly as it is. They show the direction, not finished photography: check every one against the real product before use, and replace them with the shoot on the next page.</p>
</div>'''
    page('photo', body)

def shot_list():
    rows = [
        ('01', 'A chamber lowered into a trench', 'Housing site, overcast morning, low from the trench edge', 'Hero, covers'),
        ('02', 'Stock yard after rain', 'Chambers on pallets, puddles, low sun from the left', 'Hero, website'),
        ('03', 'A separator delivered', 'Flatbed and crane hook, late afternoon', 'Hero, social'),
        ('04', 'A pumping station at dusk', 'Excavation, pea gravel, work lights', 'Foul water material'),
        ('05', 'Rain on a new street', 'Kerb-level, gully grate, silver light', 'Openers, the cut'),
        ('06', 'The outfall', 'Headwall into a beck after rain', 'Endings, back covers'),
        ('07', 'In the factory', 'Extrusion, thermoforming, a weld being made', 'About, recruitment'),
        ('08', 'Details', 'An inlet stub with pipe fitted; a cover flush in paving', 'Data sheets, social'),
        ('09', 'The team', 'Real staff in the yard, with their consent', 'About, LinkedIn'),
        ('10', 'Studio catalogue', 'Every product, to the catalogue numbers', 'Everywhere'),
    ]
    tr = ''.join(f'<tr><td class="num" style="color:{BLUE};font-weight:600">{a}</td><td><b>{b}</b></td><td>{c}</td><td>{d}</td></tr>' for a, b, c, d in rows)
    body = f'''
<div class="area">
  <p class="eyebrow">3000 mm <span style="color:{DEEP}">/</span> For a real shoot</p>
  <h2 class="two h2"><span class="lt">Shot list,</span> <b>one day on site, one in the yard</b></h2>
  <div style="display:grid;grid-template-columns:1fr 330px;gap:34px;margin-top:22px">
    <table class="roomy" style="font-size:14px"><tr><th></th><th>Shot</th><th>Where and when</th><th>For</th></tr>{tr}</table>
    <div>
      <p class="eyebrow">The rules</p>
      <ul style="padding-left:18px;margin:0">
        <li class="small">Every image starts from SuDS Enviro's own product, site or people. No stock people.</li>
        <li class="small">Retouch light and dust, never the product. No added inlets, no changed colours.</li>
        <li class="small">Heroes never appear in the catalogue format, and catalogue images never get a background.</li>
        <li class="small">Deliver at least 6000 px on the long side. The site's current photos are too small for hoardings and A1 print.</li>
      </ul>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:300px repeat(5,1fr);gap:12px;margin-top:26px;align-items:end">
    <p class="small" style="margin:0"><b>Replace first.</b> The photographs on the live site today are general water scenes. None of them shows a SuDS Enviro product, site or person.</p>
    {''.join(f'<img src="{img("../../public/webflow/" + f, 360)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;filter:saturate(.7);opacity:.85" alt="">' for f in ['666326464320d333445d309f-rain-nature-droplet-landscape.jpg','66632657222161642e3a65a2-rain-nature-droplet.jpg','66632788f1ca278301a2d149-centered-droplet.jpg','666327b669bc6b7b6d5556dc-drain.jpg','666327c72b944352a324c984-house-drain.jpg'])}
  </div>
</div>'''
    page('photo', body)

# ---------------------------------------------------------------- RHINO
def rhino_opener():
    body = opener_panel('rhino', 'SuDS Enviro is the company. RHINO is the range. Each product is Rhino plus its own name, with the SuDS Enviro drop always somewhere on the page.') + f'''
<div class="abs" style="left:960px;right:136px;top:100px;height:300px;display:flex;align-items:center;justify-content:center">{svg('suds-rhino-lockup-colour.svg').replace('<svg ', '<svg style="width:100%" ')}</div>
<div class="abs" style="left:360px;right:136px;top:600px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">
  <div style="background:{DEEP};padding:24px;height:170px"><div style="font:800 40px/1 var(--display);color:#fff">Rhino <i style="color:{GREEN}">RoFlo</i></div><p class="cap" style="color:{SKY};margin-top:12px">Innovating hydrology. Orifice flow control.</p></div>
  <div style="background:{DEEP};padding:24px;height:170px"><div style="font:800 40px/1 var(--display);color:#fff">Rhino <i style="color:{GREEN}">multiFlo</i></div><p class="cap" style="color:{SKY};margin-top:12px">Versatile system entry. The Clockwork inlets.</p></div>
  <div style="background:{DEEP};padding:24px;height:170px"><div style="font:800 40px/1 var(--display);color:#fff">Rhino <i style="color:var(--yello)">autoFlo</i></div><p class="cap" style="color:{SKY};margin-top:12px">Sensible contingencies. The auto-siphon, in its own yellow.</p></div>
</div>
<p class="abs cap" style="left:360px;right:136px;bottom:70px">The three sub-brand lockups and their straplines are from the live site. The rule: Rhino upright in white, the name in bold italic in Green, except autoFlo, which keeps its yellow.</p>'''
    page('rhino', body, cls='opener')

def journey():
    stops = [
        ('Rain', 'Roofs, roads and drives', None, 0),
        ('Harvest', 'Rainwater harvesting', None, 1),
        ('Inspect', 'RHINO SERSIC chambers', 'xray-sersic600', 2),
        ('Settle', 'Catchpits: SERS, SERDS, RhinoPit', 'xray-serpt600', 3),
        ('Separate', 'SudSceptor and RhinoPod', 'xray-sehds1800', 4),
        ('Control', 'RhinoRoFlo and RhinoRoTex', 'xray-rotexc1200', 5),
        ('River', 'A clean outfall', None, 6),
    ]
    W = 1400; G = 390
    x0, x1 = 120, 1250
    step = (x1 - x0) / (len(stops) - 1)
    k = 0.085  # px per mm
    svgp = [f'<svg class="abs" style="left:0;top:0" width="1400" height="990" viewBox="0 0 1400 990">']
    for mm in range(0, 6350, 250):
        svgp.append(f'<rect x="0" y="{G + mm * k:.1f}" width="1400" height="{250 * k + .6:.1f}" fill="{depth_tint(mm + 125)}" opacity=".55"/>')
    svgp.append(f'<rect x="0" y="{G - 6}" width="1400" height="7" fill="{GREEN}"/>')
    # pipe falls left to right
    pts = [(x0 + i * step, G + (1900 + i * 420) * k) for i in range(len(stops))]
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    svgp.append(f'<path d="{d}" fill="none" stroke="{BLUE}" stroke-width="10" stroke-linejoin="round"/>')
    svgp.append(f'<path d="{d}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="2 14" opacity=".9"/>')
    for i, (t, sub, im, _) in enumerate(stops):
        x, y = pts[i]
        svgp.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="{GREEN if i in (0, len(stops) - 1) else "#fff"}" stroke="{BLUE}" stroke-width="3"/>')
        svgp.append(f'<line x1="{x:.1f}" y1="{G - 120}" x2="{x:.1f}" y2="{y - 10:.1f}" stroke="{DEEP}" stroke-width="1" stroke-dasharray="2 4" opacity=".5"/>')
        svgp.append(f'<text x="{x:.1f}" y="{G - 150}" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="19" fill="{BLUE}" style="text-transform:uppercase">{t.upper()}</text>')
        svgp.append(f'<text x="{x:.1f}" y="{G - 130}" text-anchor="middle" class="mono" font-size="10.5" fill="{DEEP}">{sub}</text>')
    svgp.append(f'<text x="{x1 + 20}" y="{pts[-1][1] + 34:.1f}" class="mono" font-size="11" fill="#fff" text-anchor="end">falls with the ground</text>')
    svgp.append('</svg>')
    imgs = ''.join(f'<img class="abs" src="{img("../photography/xray/" + im.replace("xray-", "") + ".png", 400, "webp")}" style="left:{pts[i][0] - 95:.0f}px;top:{pts[i][1] - 150:.0f}px;width:190px;height:190px;object-fit:contain;filter:drop-shadow(0 0 0 #fff) brightness(1.15)" alt="">' for i, (t, sub, im, _) in enumerate(stops) if im)
    body = f'''
<div class="area"><p class="eyebrow">3500 mm <span style="color:{DEEP}">/</span> The range, in order</p>
  <h2 class="two h2"><span class="lt">From roof</span> <b>to river</b></h2></div>
{''.join(svgp)}
{imgs}
<p class="abs small" style="left:64px;top:810px;width:1150px;max-width:none;color:#fff">The site's Water Journey follows one storm from the roof to the river. The range sits along it in the same order, each product a little deeper than the last because the pipe falls with the ground. This strip is the brochure's contents, the website's product menu and the order of the data sheets.</p>'''
    page('rhino', body)

def build():
    devices_opener(); devices_tiles(); clockwork31()
    photo_opener(); catalogue(); heroes(); heroes_grid(); shot_list()
    rhino_opener(); journey()
