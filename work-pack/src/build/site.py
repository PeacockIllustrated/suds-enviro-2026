"""Work pack 02, BENEATH THE SITE: the rebuilt SuDS Enviro website and its visual direction."""
from kit import *

T = 'Beneath the site'
pages = []
P = pages.append
S = lambda n, mw=1800, box=None: img('shots/' + n + '.png', mw, box)


def browser(src, w, h, pos='top'):
    return f'''<div style="width:{w}px;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.28);flex:none">
<div style="height:24px;background:#e6edf1;display:flex;align-items:center;gap:6px;padding-left:12px"><i style="width:8px;height:8px;border-radius:50%;background:#c9d6dd"></i><i style="width:8px;height:8px;border-radius:50%;background:#c9d6dd"></i><i style="width:8px;height:8px;border-radius:50%;background:#c9d6dd"></i></div>
<img src="{src}" style="display:block;width:100%;height:{h - 24}px;object-fit:cover;object-position:{pos}" alt=""></div>'''


def phone(src, w, pos='top'):
    h = int(w * 2.05)
    return f'<div style="width:{w}px;height:{h}px;border-radius:{w*.14:.0f}px;background:{INK};padding:{w*.035:.0f}px;flex:none;box-shadow:0 18px 40px rgba(0,0,0,.3)"><img src="{src}" style="width:100%;height:100%;border-radius:{w*.11:.0f}px;object-fit:cover;object-position:{pos};display:block" alt=""></div>'


def head(n, eyebrow, a, b, dark=False, top=80):
    c = SKY if dark else BLUE
    return f'''<p class="abs eyebrow" style="left:110px;top:{top}px">{n} / {eyebrow}</p>
<h2 class="abs" style="left:108px;top:{top + 32}px;font-size:58px;{'' if dark else f'color:{DEEP};'}">{a} <span class="light" style="color:{c}">{b}</span></h2>'''


# 01 cover ---------------------------------------------------------------
P(f'''<section class="pg dark">
<img class="abs" src="{S('vp-journey-stop7', 2000, (.25, .13, 1, 1))}" style="left:0;top:0;width:{W}px;height:{H}px;object-fit:cover;object-position:center" alt="">
<div class="abs" style="inset:0;background:linear-gradient(90deg,rgba(6,42,58,.97) 0%,rgba(6,42,58,.9) 42%,rgba(6,42,58,.15) 75%,rgba(6,42,58,0) 100%)"></div>
{gauge(True, .72)}
<p class="abs eyebrow" style="left:110px;top:110px">Work pack 02 / The website</p>
<h1 class="abs" style="left:100px;top:290px;font-size:178px;letter-spacing:-.04em;color:#fff">BENEATH<br><span class="light" style="color:{SKY}">THE</span> SITE<span style="color:{GREEN}">.</span></h1>
<p class="abs" style="left:110px;top:760px;width:640px;font-size:22px;line-height:1.4;color:#dcebf3"><span style="font-weight:800">The rebuilt SuDS Enviro website.</span> <span class="light">What is on it, how it looks, and where it goes next.</span></p>
<p class="abs mono" style="left:110px;bottom:40px;color:#8fb3c6;font-size:11px">Edition 1 / October 2026 / For SuDS Enviro</p>
</section>''')

# 02 numbers -------------------------------------------------------------
nums = [('11', 'products', 'in the RHINO catalogue, each with its own page'), ('14', 'data sheets', 'drawn, on the site, printable to A4'), ('27', '3D models', 'in the web-ready product library'), ('8', 'stops', 'on the Water Journey, roof to river'), ('4', 'plots', 'in the Site Explorer, cut open'), ('7', 'steps', 'in the configurator, checked by seven rules')]
cells = ''.join(f'<div style="border-top:3px solid {[BLUE, GREEN, DEEP][i % 3]};padding-top:14px"><div style="font-weight:800;font-size:150px;letter-spacing:-.05em;line-height:.9;color:{DEEP}">{a}</div><p style="font-weight:800;text-transform:uppercase;font-size:20px;margin-top:8px">{b}</p><p class="small" style="color:#4d6b7c;margin-top:4px">{c}</p></div>' for i, (a, b, c) in enumerate(nums))
P(f'''<section class="pg">{gauge(False, .12)}
<p class="abs eyebrow" style="left:110px;top:90px">The site in six numbers</p>
<div class="abs" style="left:110px;right:90px;top:170px;display:grid;grid-template-columns:repeat(3,1fr);gap:60px 70px">{cells}</div>
<p class="abs cap" style="left:110px;bottom:80px">Counted from the repo: the product catalogue, /public/brochures, the 3D library manifest, and the page components.</p>
{folio(2, T)}</section>''')

# 03 site map as a section -----------------------------------------------
layers = [(250, 'Surface', '0 mm'), (430, 'Range', '1000 mm'), (590, 'Products', '2000 mm'), (750, 'Experiences', '3000 mm'), (890, 'Build', '4000 mm')]
nodes = [
    (300, 250, 'Home', 'Scroll scene'), (560, 250, 'About', ''), (760, 250, 'Contact', ''),
    (420, 430, 'RHINO range', 'Foul and surface'), (760, 430, 'Products', '11 cards'),
    (300, 590, 'Product pages', '11, with 3D viewers'), (640, 590, 'Data sheets', '14 at /brochures'),
    (980, 750, 'Water Journey', '8 stops'), (1300, 750, 'Site Explorer', '4 plots'),
    (980, 890, 'Builder hub', 'Pick a product'), (1300, 890, 'Configurator', '7 steps, R1 to R7'),
]
pipes = [((300, 250), (420, 430)), ((420, 430), (760, 430)), ((760, 430), (300, 590)), ((300, 590), (640, 590)), ((760, 430), (980, 750)), ((980, 750), (1300, 750)), ((640, 590), (980, 890)), ((980, 890), (1300, 890))]
def pipe(a, b):
    (x1, y1), (x2, y2) = a, b
    return f'<path d="M{x1} {y1} C{x1} {(y1 + y2) / 2} {x2} {(y1 + y2) / 2} {x2} {y2}" fill="none" stroke="{SKY}" stroke-width="3" opacity=".55"/>'
svg = f'''<svg class="abs" style="left:0;top:0" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect x="0" y="210" width="{W}" height="{H - 210}" fill="#5a3d26" opacity=".18"/>
<rect x="0" y="210" width="{W}" height="14" fill="{GREEN}"/>
{''.join(f'<line x1="200" x2="{W - 60}" y1="{y + 40}" y2="{y + 40}" stroke="{SKY}" stroke-dasharray="2 8" opacity=".25"/>' for y, _, _ in layers[1:])}
{''.join(pipe(a, b) for a, b in pipes)}
<rect x="1530" y="224" width="40" height="{H - 300}" fill="none" stroke="{SKY}" opacity=".4"/>
<rect x="1530" y="{H - 140}" width="40" height="64" fill="{BLUE}" opacity=".5"/>
</svg>'''
labels = ''.join(f'<div class="abs mono" style="left:88px;top:{y - 8}px;color:#8fb3c6;font-size:10.5px;width:120px">{d}<br><span style="color:{SKY}">{n}</span></div>' for y, n, d in layers)
nd = ''.join(f'<div class="abs" style="left:{x - 9}px;top:{y - 9}px;width:18px;height:18px;border-radius:50%;background:{GREEN if y == 250 else BLUE};border:3px solid #fff"></div><div class="abs" style="left:{x + 16}px;top:{y - 12}px;white-space:nowrap"><span style="font-weight:800;text-transform:uppercase;font-size:17px">{t}</span><br><span class="cap">{s}</span></div>' for x, y, t, s in nodes)
P(f'''<section class="pg dark">{svg}{labels}{nd}
<p class="abs eyebrow" style="left:110px;top:70px">The site map, drawn in section</p>
<h2 class="abs" style="left:108px;top:102px;font-size:52px">Every page <span class="light" style="color:{SKY}">at its depth.</span></h2>
<p class="abs cap" style="left:1300px;top:100px;width:220px;text-align:right">Surface pages above the turf line. The deeper you go, the more the page does for you.</p>
<p class="abs cap" style="left:1350px;top:812px;width:170px;text-align:right">Sump: the on-page site editor</p>
{folio(3, T, True)}</section>''')

# 04 home ----------------------------------------------------------------
ys = ['00000', '01100', '02200', '03300', '04400', '05600']
strip = ''.join(f'<div><img src="{S("vp-home-" + y, 900)}" style="width:300px;height:188px;object-fit:cover;border-radius:6px;display:block;box-shadow:0 10px 26px rgba(0,0,0,.16)" alt=""><p class="cap" style="margin-top:6px">{int(y)} px</p></div>' for y in ys)
P(f'''<section class="pg">{gauge(False, .2)}
{head('01', 'Home', 'One storm,', 'scrolled.')}
<div class="abs" style="left:110px;top:230px;width:980px;display:grid;grid-template-columns:repeat(3,300px);gap:22px 30px">{strip}</div>
<div class="abs" style="left:1180px;top:110px">{phone(S('ph-home-0', 900), 330)}</div>
<p class="abs" style="left:110px;top:760px;width:960px">The home page is one scroll scene, rebuilt from the original Spline recording in the site’s toon style: the drop and bubbles, storm and foul water pipes, the autoFlo device, then the RHINO range laid out on a line. Scrolling is the only control.</p>
<p class="abs cap" style="left:1180px;top:820px;width:330px">Phone, 390 px. The same scene, recomposed for a narrow screen.</p>
{folio(4, T)}</section>''')

# 05 water journey -------------------------------------------------------
stops = ''.join(f'<img src="{S(f"vp-journey-stop{i}", 900)}" style="width:330px;height:206px;object-fit:cover;border-radius:6px;display:block" alt="">' for i in range(8))
P(f'''<section class="pg dark">{gauge(True, .45)}
{head('02', 'Water Journey', 'Roof', 'to river.', True)}
<div class="abs" style="left:110px;top:220px;display:grid;grid-template-columns:repeat(4,330px);gap:16px">{stops}</div>
<div class="abs" style="left:110px;top:680px;display:grid;grid-template-columns:repeat(8,1fr);width:1376px">{''.join(f'<p class="mono" style="color:{SKY};font-size:11px">0{i + 1} {s}</p>' for i, s in enumerate(['Rain', 'Harvesting', 'Chambers', 'Silt trap', 'Separator', 'Storage', 'Flow control', 'River']))}</div>
<p class="abs" style="left:110px;top:740px;width:900px;color:#dcebf3">One house, one storm, eight stops. The camera follows the water through an isometric line-art section, and each stop opens the product that does that job, with a link to its page and to the configurator.</p>
<div class="abs" style="left:1180px;top:700px;display:flex;gap:14px"><img src="{S('ph-journey-1400', 600)}" style="width:140px;border-radius:14px;border:5px solid {INK}" alt=""><img src="{S('ph-journey-0', 600)}" style="width:140px;border-radius:14px;border:5px solid {INK}" alt=""></div>
{folio(5, T, True)}</section>''')

# 06 site explorer -------------------------------------------------------
P(f'''<section class="pg">{gauge(False, .55)}
{head('03', 'Site Explorer', 'Pick a plot.', 'Cut the ground away.')}
<div class="abs" style="left:110px;top:220px">{browser(S('vp-explorer-00000', 2000), 980, 620)}</div>
<div class="abs" style="left:1140px;top:220px;display:flex;gap:18px">{phone(S('ph-explorer-0', 800), 175)}{phone(S('ph-explorer-900', 800), 175)}</div>
<p class="abs" style="left:1140px;top:620px;width:370px">Four developments, an office, a car park, retail and a house, each with the drainage beneath it drawn in. Numbered markers name every product in the treatment train and link to it.</p>
<p class="abs cap" style="left:1140px;top:800px;width:370px">The brand book’s cut through the ground, already live on the site.</p>
{folio(6, T)}</section>''')

# 07 range and product page ----------------------------------------------
ch = ['00000', '00900', '01800', '02700']
P(f'''<section class="pg" style="background:{SURFACE}">{gauge(False, .62)}
{head('04', 'Range and product pages', 'Find it.', 'Turn it round.')}
<div class="abs" style="left:110px;top:220px">{browser(S('full-range', 1400), 470, 640)}</div>
<div class="abs" style="left:610px;top:220px;display:grid;grid-template-columns:repeat(2,330px);gap:16px">{''.join(f'<img src="{S("vp-chamber-" + y, 900)}" style="width:330px;height:206px;object-fit:cover;border-radius:6px;display:block;box-shadow:0 8px 20px rgba(0,0,0,.12)" alt="">' for y in ch)}</div>
<p class="abs" style="left:610px;top:670px;width:676px">The range splits by water: foul and surface. Each product page opens on a 3D model you can turn, built from SuDS Enviro’s own part files, then the clock-face inlet options, specification, compliance and the data sheet.</p>
<div class="abs" style="left:1330px;top:220px">{phone(S('ph-chamber-0', 800), 190)}</div>
<p class="abs cap" style="left:1330px;top:640px;width:190px">RHINO SIC / SERSIC on a phone.</p>
{folio(7, T)}</section>''')

# 08 configurator filmstrip ----------------------------------------------
steps = [('cfg-00-product', 'Product'), ('cfg-01-system', 'System'), ('cfg-02-diameter', 'Diameter'), ('cfg-03-inlets', 'Inlets'), ('cfg-04-clock', 'Clock face'), ('cfg-05-pipes', 'Pipe sizes'), ('cfg-06-flow', 'Flow control'), ('cfg-07-depth', 'Depth'), ('cfg-08-review', 'Review'), ('cfg-09-output', 'Output')]
film = ''.join(f'<div><img src="{S(s, 500)}" style="width:128px;border-radius:10px;display:block;box-shadow:0 8px 20px rgba(0,0,0,.35)" alt=""><p class="mono" style="margin-top:10px;font-size:10.5px;color:{SKY}">{i:02d} {l}</p></div>' for i, (s, l) in enumerate(steps))
P(f'''<section class="pg dark grid">{gauge(True, .7)}
{head('05', 'Configurator', 'Seven steps', 'to a drawn chamber.', True)}
<div class="abs" style="left:110px;top:250px;display:flex;gap:12px">{film}</div>
<div class="abs" style="left:110px;top:640px;width:1400px;height:3px;background:linear-gradient(90deg,{SKY},{GREEN})"></div>
<div class="abs" style="left:110px;top:680px;display:grid;grid-template-columns:repeat(3,1fr);gap:50px;width:1380px">
<p style="color:#dcebf3"><b style="color:#fff">Phone first.</b> Big targets, one decision a screen, Back and Next always in the same place.</p>
<p style="color:#dcebf3"><b style="color:#fff">Rules, not guesswork.</b> Seven rules (R1 to R7) lock what is not allowed: inlet counts by diameter, the minimum outlet, adoptable depth.</p>
<p style="color:#dcebf3"><b style="color:#fff">A 3D preview and a drawn sheet.</b> The chamber builds in 3D as you choose, and the output is a two-page specification with drawings.</p></div>
<p class="abs cap" style="left:110px;top:890px">Walked through at 390 px: inspection chamber, surface water, Ø600, three inlets at 3, 6 and 9 o’clock, 110 mm, no flow control, S104 at 1.5 m.</p>
{folio(8, T, True)}</section>''')

# 09 the design as built -------------------------------------------------
sw = [(BLUE, 'Blue', '#1D80B9'), (DEEP, 'Deep', '#005576'), (GREEN, 'Green', '#54B54D'), (RED, 'Red', '#C34C4A'), (SKY, 'Sky', '#AFDBF4')]
swatches = ''.join(f'<div><div style="height:110px;background:{c};border-radius:4px"></div><p style="font-weight:800;text-transform:uppercase;font-size:14px;margin-top:8px">{n}</p><p class="cap">{h}</p></div>' for c, n, h in sw)
icons = img('shots/full-range.png', 1400, box=(.03, .345, .97, .62))
P(f'''<section class="pg">{gauge(False, .8)}
{head('06', 'The design as built', 'Toon 3D, line art,', 'one typeface.')}
<div class="abs" style="left:110px;top:220px;width:620px">
<p class="eyebrow">Colour</p><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:12px">{swatches}</div>
<p class="eyebrow" style="margin-top:44px">Type</p>
<p style="font-weight:800;font-size:64px;text-transform:uppercase;line-height:.95;margin-top:10px;color:{DEEP}">The RHINO <span style="font-weight:300;color:{BLUE}">range</span></p>
<p class="small" style="margin-top:12px;color:#3d5d6c">Montserrat throughout, heavy and light set side by side in one heading: the site’s signature. Italic for sub-brands.</p></div>
<div class="abs" style="left:800px;top:220px;width:700px">
<p class="eyebrow">Illustration</p><img src="{icons}" style="width:700px;margin-top:12px;border-radius:6px" alt="">
<p class="small" style="margin-top:10px;color:#3d5d6c">Flat spot illustrations in brand colours on a warm ground, one per product family.</p>
<p class="eyebrow" style="margin-top:28px">3D</p>
<div style="display:flex;gap:14px;margin-top:12px"><img src="{S('vp-home-01100', 900, (.2, .05, .7, .95))}" style="width:200px;height:200px;object-fit:cover;border-radius:6px" alt=""><img src="{S('vp-home-02200', 900, (.4, .15, .75, .95))}" style="width:200px;height:200px;object-fit:cover;border-radius:6px" alt=""><img src="{S('vp-chamber-00000', 900, (.5, .18, .85, .95))}" style="width:200px;height:200px;object-fit:cover;border-radius:6px" alt=""></div>
<p class="small" style="margin-top:10px;color:#3d5d6c">Toon-shaded, outlined and see-through, so the inside of a chamber reads as well as the outside.</p></div>
{folio(9, T)}</section>''')

# 10 three improvements --------------------------------------------------
P(f'''<section class="pg dark">{gauge(True, .88)}
{head('07', 'From the brand book', 'Three things', 'the site takes next.', True)}
<div class="abs" style="left:110px;top:240px;display:grid;grid-template-columns:repeat(3,430px);gap:45px">
<div><div style="display:flex;gap:10px;height:300px">
  <div style="flex:1;background:#fff;display:flex;flex-direction:column;justify-content:center;padding:20px"><p style="font-weight:300;font-size:26px;color:{GREEN};text-transform:uppercase;line-height:1">Management</p><p class="mono" style="color:{RED};margin-top:14px">2.59 : 1 / fails</p></div>
  <div style="flex:1;background:#fff;display:flex;flex-direction:column;justify-content:center;padding:20px"><p style="font-weight:300;font-size:26px;color:{FIELD};text-transform:uppercase;line-height:1">Management</p><p class="mono" style="color:{FIELD};margin-top:14px">4.56 : 1 / passes</p></div></div>
  <p style="font-weight:800;text-transform:uppercase;font-size:20px;margin-top:22px">01 Field for the light voice</p><p class="small" style="color:#dcebf3;margin-top:6px">The light green heading words fail contrast on white. Field keeps the look and reads at every size.</p></div>
<div><div style="height:300px;background:#fff;position:relative;overflow:hidden"><img src="{S('ph-range-0', 700)}" style="position:absolute;left:30px;top:0;width:330px" alt=""><div style="position:absolute;right:0;top:0;bottom:0;width:44px;background:rgba(238,243,245,.95)">{''.join(f'<div style="position:absolute;right:0;top:{y}px;width:{16 if y % 50 == 0 else 8}px;height:1.5px;background:{DEEP};opacity:.5"></div>' for y in range(0, 300, 10))}<div style="position:absolute;right:0;top:120px;width:30px;height:4px;background:{GREEN}"></div></div></div>
  <p style="font-weight:800;text-transform:uppercase;font-size:20px;margin-top:22px">02 The gauge as scroll progress</p><p class="small" style="color:#dcebf3;margin-top:6px">A thin staff gauge down the right edge of long pages, with a green marker at your depth.</p></div>
<div><img src="{img(os.path.join(REPO, 'brand-pack/photography/hero/hero-2-yard.jpg'), 900)}" style="width:430px;height:300px;object-fit:cover;display:block" alt="">
  <p style="font-weight:800;text-transform:uppercase;font-size:20px;margin-top:22px">03 Real photography</p><p class="small" style="color:#dcebf3;margin-top:6px">Replace the stock water images with the brand book’s shot list. This frame is a direction image, not a finished photograph.</p></div>
</div>
{folio(10, T, True)}</section>''')

# 11 status --------------------------------------------------------------
col = lambda c, t, items: f'<div style="border-top:5px solid {c};padding-top:18px"><p class="eyebrow" style="color:{c}">{t}</p><ul style="list-style:none;margin-top:16px">{"".join(f"<li style=\'font-size:16.5px;line-height:1.45;margin-bottom:14px\'>{i}</li>" for i in items)}</ul></div>'
P(f'''<section class="pg">{gauge(False, .94)}
{head('08', 'Where it stands', 'Built, in review,', 'waiting on you.')}
<div class="abs" style="left:110px;top:240px;display:grid;grid-template-columns:repeat(3,1fr);gap:60px;width:1380px">
{col(GREEN, 'Built and merged', ['The rebuilt site on its root routes, merged in nine pull requests, September 2026', '3D product library, toon scroll scene and product viewers', 'Configurator with real parts, rules and spec sheet', 'Water Journey and Site Explorer', '14 redrawn data sheets', 'On-page site copy editor'])}
{col(BLUE, 'In review', ['Deployed to a Vercel preview. sudsenviro.com had not been switched over when last checked on 8 October', 'The brand pack: book, logo suite, photography and film, in a draft pull request', 'These two work packs'])}
{col(RED, 'Waiting on SuDS Enviro', ['RHINO or Rhino, and SudSceptor or SuDSceptor', 'One list of sales codes against drawing codes', 'One green: #5BB44F or #54B54D', 'Retire the old S-and-leaf mark', 'A vector master of the stacked lockup', 'Sign-off on the figures flagged in Redrawn'])}
</div>
{folio(11, T)}</section>''')

# 12 close ---------------------------------------------------------------
P(f'''<section class="pg dark">
<img class="abs" src="{S('vp-journey-stop7', 2000, (.42, .13, 1, 1))}" style="left:0;top:0;width:{W}px;height:{H}px;object-fit:cover" alt="">
<div class="abs" style="inset:0;background:linear-gradient(0deg,rgba(6,42,58,.96) 0%,rgba(6,42,58,.75) 40%,rgba(6,42,58,0) 75%)"></div>{gauge(True, 1)}
<p class="abs" style="left:110px;top:720px;font-weight:800;font-size:58px;text-transform:uppercase;letter-spacing:-.01em;line-height:1">Bespoke, <span class="light">standardised.</span></p>
<p class="abs" style="left:110px;top:800px;font-size:20px;color:#dcebf3" class="light">The water reaches the river cleaner and slower than it fell.</p>
<p class="abs mono" style="left:110px;bottom:40px;color:#8fb3c6;font-size:11px">Work pack 02 / Beneath the site / Edition 1, October 2026</p>
</section>''')

open(os.path.join(ROOT, 'beneath-the-site.html'), 'w').write(doc('Beneath the site', pages))
print('pages', len(pages))
