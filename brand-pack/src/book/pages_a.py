from core import *
from assets import img, svg

# ---------------------------------------------------------------- cover
def cover():
    G = 372  # ground line
    k = (990 - G) / MAX_MM
    strata = ''.join(f'<rect x="0" y="{G + mm * k:.1f}" width="1400" height="{250 * k + .8:.1f}" fill="{depth_tint(mm + 125)}"/>' for mm in range(0, MAX_MM, 250))
    # a RHINO chamber cut in section, set to 3000 mm (deepest adoptable), outlet on the right at the invert
    cx, cw = 1110, 140
    inv = G + 3000 * k
    sump = inv + 350 * k
    ticks = ''.join(f'<line x1="64" x2="{78 if mm % 1000 else 92}" y1="{G + mm * k:.1f}" y2="{G + mm * k:.1f}" stroke="#fff" stroke-width="1.2" opacity=".8"/>' + (f'<text x="98" y="{G + mm * k + 4:.1f}" class="mono" font-size="11" fill="#fff" opacity=".85">{mm}</text>' if mm % 1000 == 0 and mm else '') for mm in range(0, 6001, 250))
    body = f'''
<svg class="abs" style="left:0;top:0" width="1400" height="990" viewBox="0 0 1400 990">
  {strata}
  <rect x="0" y="{G - 9}" width="1400" height="10" fill="{GREEN}"/>
  {ticks}
  <!-- chamber in section -->
  <rect x="{cx}" y="{G - 30}" width="{cw}" height="{sump - G + 30:.1f}" fill="#fff" opacity=".93"/>
  <rect x="{cx - 8}" y="{G - 30}" width="8" height="{sump - G + 38:.1f}" fill="{DEEP}"/>
  <rect x="{cx + cw}" y="{G - 30}" width="8" height="{sump - G + 38:.1f}" fill="{DEEP}"/>
  <rect x="{cx - 8}" y="{sump:.1f}" width="{cw + 16}" height="8" fill="{DEEP}"/>
  <rect x="{cx - 26}" y="{G - 38}" width="{cw + 52}" height="10" fill="{INK}"/>
  <rect x="{cx}" y="{inv - 34:.1f}" width="{cw}" height="{sump - inv + 34:.1f}" fill="{BLUE}" opacity=".55"/>
  <rect x="{cx + cw + 8}" y="{inv - 34:.1f}" width="232" height="34" fill="{BLUE}"/>
  <rect x="{cx - 160}" y="{inv - 96:.1f}" width="152" height="30" fill="{BLUE}" opacity=".85"/>
  {dim(cx - 40, G + 2, cx - 40, inv - 34, "", col=DEEP, vertical=True, size=12)}
  <text x="{cx - 50}" y="{G + 40}" class="mono" font-size="11" fill="{DEEP}" text-anchor="end">3000 to soffit</text>
  <text x="{cx + cw + 20}" y="{sump - 6:.1f}" class="mono" font-size="11" fill="#fff">sump 350</text>
  <!-- plan above section, as on a drawing: projection lines down to the cut -->
  <line x1="{cx - 8}" y1="{G - 70}" x2="{cx - 8}" y2="{G - 40}" stroke="{DEEP}" stroke-dasharray="3 4" opacity=".5"/>
  <line x1="{cx + cw + 8}" y1="{G - 70}" x2="{cx + cw + 8}" y2="{G - 40}" stroke="{DEEP}" stroke-dasharray="3 4" opacity=".5"/>
  {clock_plan(inlets=(3, 6, 9), r=(cw + 16) / 2, cx=cx + cw / 2, cy=G - 70 - (cw + 16) / 2 - 40, standalone=False, labels=True)}
  <text x="{cx + cw + 30}" y="{G - 70 - (cw + 16) - 40}" class="mono" font-size="10.5" fill="{DEEP}" letter-spacing="1.5">PLAN</text>
  <text x="{cx + cw + 30}" y="{G + 22}" class="mono" font-size="10.5" fill="{DEEP}" letter-spacing="1.5">SECTION</text>
</svg>
<div class="abs" style="left:64px;top:64px;width:470px">{svg("suds-enviro-horizontal-colour.svg")}</div>
<div class="abs mono" style="left:64px;top:150px;font-size:11.5px;letter-spacing:.16em;line-height:1.9;text-transform:uppercase;color:{DEEP}">Brand book <span style="color:{BLUE}">/</span> Edition 1 <span style="color:{BLUE}">/</span> October 2026</div>
<div class="abs" style="left:150px;top:{G + 210}px">
  <p class="eyebrow" style="color:{SKY}">Drawn in section</p>
  <h1 class="two" style="font-size:112px;line-height:.92"><span class="lt" style="color:#fff">Every drop,</span><br><b style="color:#fff">accounted for.</b></h1>
</div>
<div class="abs mono" style="left:150px;bottom:44px;font-size:11px;letter-spacing:.14em;color:{SKY};text-transform:uppercase">For SuDS Enviro Ltd <span style="color:{GREEN};padding:0 .6em">/</span> Internal</div>
'''
    page('ground', body, head=False, gauge_on=False)

# ---------------------------------------------------------------- contents
def contents():
    top, bot = 190, 900
    k = (bot - top) / MAX_MM
    rows = []
    for key, d, (lt, bd), fact in CHAPTERS:
        y = top + d * k
        nm = (f'<span class="lt">{lt}</span> ' if lt else '') + f'<b>{bd}</b>'
        label = f'{d}' if d <= 6000 else '+350'
        rows.append(f'''<div class="abs" style="left:430px;right:136px;top:{y - 16:.1f}px;height:32px;display:flex;align-items:center;gap:18px;border-top:1px solid rgba(0,85,118,.14)">
  <span class="mono" style="width:70px;font-size:13px;font-weight:600;color:{BLUE}">{label}</span>
  <span class="two" style="font-size:22px;flex:1">{nm}</span>
  <span class="mono" style="font-size:12px;color:{DEEP}">{{{{PAGE:{key}}}}}</span></div>''')
    col = section_column(3000, w=330)
    body = f'''
<div class="abs" style="left:0;top:0;width:330px;height:990px">{section_column(6350, w=330)}</div>
<div class="abs" style="left:64px;top:64px;width:240px;color:#fff;z-index:2">
  <p class="eyebrow" style="color:{DEEP}">Contents</p>
</div>
<div class="abs" style="left:380px;top:62px">
  <h2 class="two h2"><span class="lt">Read it</span> <b>top to bottom</b></h2>
</div>
<p class="abs small" style="left:380px;top:118px;width:620px">Chapters sit at depths, not page numbers. The gauge on the right edge of every page shows how far down you are, from ground level to the sump.</p>
{''.join(rows)}
'''
    page('ground', body)

# ---------------------------------------------------------------- the idea
def idea():
    H = 540; s = H / 76.7; X0 = 110; Y0 = 300
    def yy(v): return Y0 + (v + 0.2) * s
    labels = [
        (12, GREEN, 'Ground', 'Green is the land the rain falls on: roofs, roads, gardens, the site.'),
        (43, BLUE, 'Water', 'Blue is what SuDS Enviro catches, settles, separates and controls.'),
        (55, GREEN, 'Cleaner', 'A second, smaller green: water that leaves cleaner than it arrived.'),
        (69, RED, 'Foul', 'Red sits at the bottom, kept apart from everything above it.'),
    ]
    rows = ''
    for v, c, t, d in labels:
        y = yy(v)
        rows += f'<line x1="{X0 + 54.5 * s - 10:.0f}" y1="{y:.0f}" x2="650" y2="{y:.0f}" stroke="{c}" stroke-width="1.5" stroke-dasharray="2 4"/><circle cx="{X0 + 54.5 * s - 10:.0f}" cy="{y:.0f}" r="4" fill="{c}"/>'
        rows += f'<foreignObject x="664" y="{y - 22:.0f}" width="320" height="80"><div xmlns="http://www.w3.org/1999/xhtml"><div class="mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{c if c != GREEN else FIELD};font-weight:600">{t}</div><div style="font-size:15px;line-height:1.45;color:{DEEP}">{d}</div></div></foreignObject>'
    body = f'''
<div class="area">
  <p class="eyebrow">0 mm <span style="color:{DEEP}">/</span> The idea</p>
  <h2 class="two h1" style="max-width:900px"><span class="lt">The drop is</span> <b>already a section</b></h2>
</div>
<svg class="abs" style="left:0;top:0" width="1400" height="990" viewBox="0 0 1400 990">
  <g transform="translate({X0} {Y0})">{svg("suds-drop-colour.svg").replace("<svg ", f'<svg width="{54.5 * s:.0f}" height="{H}" ')}</g>
  {rows}
</svg>
<div class="abs" style="left:1010px;top:300px;width:250px">
  <p>Cut through any SuDS Enviro product and you get the same picture as the drop: ground on top, water in the middle, foul kept below. Everything the company makes lives under the turf line, and it is specified by depth, diameter and clock position.</p>
  <p>So the identity is drawn the way the products are drawn: <span class="hl">in section</span>. This is our reading of the mark, not its origin story. The mark itself does not change.</p>
</div>
'''
    page('ground', body)

# ---------------------------------------------------------------- four jobs
def four_jobs():
    mini_gauge = gauge(2500, x=150, top=40, bottom=300, w=26).replace('class="gauge" viewBox="0 0 1400 990"', 'viewBox="80 30 120 280" width="120" height="280"')
    frames = ''
    order = ['drop-red', 'drop-green', 'drop-blue']
    for i in range(4):
        frames += f'<div style="width:70px;height:100px;position:relative;opacity:{0.35 + i * 0.22:.2f}">{drop_partial(i)}</div>'
    rows_mini = ''.join(f'<div style="display:flex;gap:10px;font-size:12px;border-top:1px solid rgba(0,85,118,.14);padding:5px 0"><span class="mono" style="width:44px;color:{BLUE};font-weight:600">{d}</span><span style="font-weight:700;text-transform:uppercase;font-size:11.5px">{bd}</span></div>' for _, d, (lt, bd), _f in CHAPTERS[1:7])
    col = lambda n, t, body, ill: f'''<div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <div style="height:300px;display:flex;align-items:center;justify-content:center;background:{SURFACE}">{ill}</div>
      <div class="mono" style="font-size:11px;letter-spacing:.14em;color:{BLUE};font-weight:600">{n}</div>
      <h3 class="two h3" style="margin:0"><b>{t}</b></h3><p class="small">{body}</p></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">0 mm <span style="color:{DEEP}">/</span> The test</p>
  <h2 class="two h1"><span class="lt">One idea,</span> <b>four jobs</b></h2>
  <p class="lede" style="margin-top:18px;max-width:56ch">An idea only earns its place if it can do all four of these at once. The section does.</p>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-top:34px;gap:28px">
    {col("01 / Device", "A gauge and a cut", "A river staff gauge on every page, and a cut through the ground on every chapter opener. Both are measured, never decorative.", mini_gauge)}
    {col("02 / Motion", "Settle, then rise", "The drop builds the way silt settles: bottom band first, top band last. Then the wordmark rises into place. Nothing spins.", '<div style="display:flex;gap:6px;align-items:flex-end">' + frames + '</div>')}
    {col("03 / Structure", "Chapters at depth", "The book runs from ground level to the sump. Each chapter sits 500 mm below the last, on the same scale the configurator uses.", '<div style="width:220px">' + rows_mini + '</div>')}
    {col("04 / A line", "Something people say", "Every drop, accounted for. Said by an engineer it means the maths works. Said by a site manager it means nothing gets missed.", f'<div class="two" style="font-size:30px;line-height:1;text-align:left;padding:20px"><span class="lt">Every drop,</span><br><b>accounted for.</b></div>')}
  </div>
</div>'''
    page('ground', body)

def drop_partial(n):
    """The drop with its first n bands settled (n = 0..3 shows 1..4 bands)."""
    s = svg('suds-drop-colour.svg')
    import re
    paths = re.findall(r'<path [^>]+/>', s)
    # paths in master order: tiny, green top, red, blue, small green
    keep = {0: ['#c34c4a'], 1: ['#c34c4a', '#54b54d|small'], 2: ['#c34c4a', '#54b54d|small', '#1d80b9'], 3: ['all']}[n]
    out = []
    for i, p in enumerate(paths):
        fill = re.search(r'fill="([^"]+)"', p).group(1)
        is_small = i == 4
        ok = 'all' in keep or fill in keep or (fill == '#54b54d' and is_small and '#54b54d|small' in keep)
        if ok: out.append(p)
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    return f'<svg viewBox="{vb}" width="70" height="100">{"".join(out)}</svg>'

# ---------------------------------------------------------------- logo chapter
def opener_panel(key, intro, width=560):
    _, d, (lt, bd), fact = CH[key]
    f = f'<p class="fact" style="margin-top:26px">{fact}</p>' if fact else ''
    return f'''<div class="abs" style="left:0;top:0;width:300px;height:990px">{section_column(d)}</div>
<div class="abs" style="left:360px;top:92px;width:{width}px">
  <div class="depthno">{d if d <= 6000 else 6350}<small>mm</small></div>
  <h2 class="two h1" style="margin-top:22px">{('<span class="lt">' + lt + '</span> ') if lt else ''}<b>{bd}</b></h2>
  <p class="lede" style="margin-top:20px">{intro}</p>{f}
</div>'''

def logo_marks():
    body = opener_panel('logo', 'SuDS Enviro already has a strong family of marks. This chapter sets the rules for using them. It does not redraw them.') + f'''
<div class="abs grid" style="left:960px;right:136px;top:92px;grid-template-columns:1fr;gap:18px">
  <div class="tile" style="height:205px;display:flex;align-items:center;justify-content:center;padding:28px"><img src="{img('../../public/logos/suds/logo-slogan-main.png', 900, 'png')}" style="height:118px" alt="SuDS Enviro stacked logo with slogan"></div>
  <div class="tile" style="height:150px;display:flex;align-items:center;justify-content:center;padding:28px">{svg('suds-enviro-horizontal-colour.svg').replace('<svg ', '<svg style="width:300px" ')}</div>
  <div class="tile" style="height:205px;display:flex;align-items:center;justify-content:center;padding:28px">{svg('suds-rhino-lockup-colour.svg').replace('<svg ', '<svg style="height:118px" ')}</div>
  <div class="tile" style="height:205px;display:flex;align-items:center;justify-content:center;padding:28px;gap:46px">{svg('suds-drop-colour.svg').replace('<svg ', '<svg style="height:110px" ')}<span class="cap" style="max-width:170px">The drop, lifted from the horizontal master. Use it where the name is already said.</span></div>
</div>
<div class="abs" style="left:360px;top:640px;width:540px">
  <table>
    <tr><th>Mark</th><th>Use it for</th></tr>
    <tr><td><b>Stacked, with slogan</b></td><td>Covers, the website hero, the first page of anything.</td></tr>
    <tr><td><b>Horizontal</b></td><td>Headers, footers, email signatures, vans, title blocks.</td></tr>
    <tr><td><b>SuDS RHINO lockup</b></td><td>Anything about the product range rather than the company.</td></tr>
    <tr><td><b>The drop</b></td><td>App icons, avatars, favicons, the seal, small spaces.</td></tr>
  </table>
  <p class="cap" style="margin-top:12px">All four are SuDS Enviro's own artwork, taken from the master files on the live site. Vector masters exist for the horizontal and RHINO lockups; the stacked lockup is held as a PNG only.</p>
</div>'''
    page('logo', body, cls='opener')

def clear_space():
    # horizontal lockup at width 760 -> height = 760 * 76.63/495.69
    W = 760; H = W * 76.63 / 495.69; x0 = 230; y0 = 300; c = H / 2
    body = f'''
<div class="area">
  <p class="eyebrow">500 mm <span style="color:{DEEP}">/</span> Space and size</p>
  <h2 class="two h2"><span class="lt">Half a drop</span> <b>of clear space</b></h2>
</div>
<svg class="abs" style="left:0;top:0" width="1400" height="990" viewBox="0 0 1400 990">
  <rect x="{x0 - c:.1f}" y="{y0 - c:.1f}" width="{W + 2 * c:.1f}" height="{H + 2 * c:.1f}" fill="{SURFACE}"/>
  <rect x="{x0}" y="{y0}" width="{W}" height="{H:.1f}" fill="none" stroke="{BLUE}" stroke-dasharray="4 4"/>
  <g transform="translate({x0} {y0})">{svg("suds-enviro-horizontal-colour.svg").replace("<svg ", f'<svg width="{W}" height="{H:.1f}" ')}</g>
  {''.join(f'<g transform="translate({px:.1f} {py:.1f})">{svg("suds-drop-colour.svg").replace("<svg ", f'<svg width="{c * 54.5 / 76.7:.1f}" height="{c:.1f}" opacity=".35" ')}</g>' for px, py in [(x0 - c + (c - c*54.5/76.7)/2, y0), (x0 + W + (c - c*54.5/76.7)/2, y0), (x0 + W / 2 - c*54.5/76.7/2, y0 - c), (x0 + W / 2 - c*54.5/76.7/2, y0 + H)])}
  {dim(x0 - c, y0 + H + c + 26, x0, y0 + H + c + 26, "½ h")}
  {dim(x0 + W + c + 26, y0, x0 + W + c + 26, y0 + H, "h", vertical=True)}
</svg>
<div class="abs" style="left:64px;top:600px;width:520px">
  <p>Clear space is half the height of the drop, on every side. In the horizontal lockup the drop is the full height of the logo, so the rule is simply half the logo's height. Nothing else, not even a page edge, comes inside it.</p>
  <p class="cap">Measure from the master artwork, not from a screenshot with padding.</p>
</div>
<div class="abs" style="left:660px;top:600px;right:136px">
  <table>
    <tr><th>Mark</th><th class="num">Print, min width</th><th class="num">Screen, min width</th></tr>
    <tr><td>Horizontal</td><td class="num">35 mm</td><td class="num">140 px</td></tr>
    <tr><td>Stacked, with slogan</td><td class="num">30 mm</td><td class="num">120 px</td></tr>
    <tr><td>SuDS RHINO lockup</td><td class="num">30 mm</td><td class="num">120 px</td></tr>
    <tr><td>The drop</td><td class="num">6 mm tall</td><td class="num">24 px tall</td></tr>
    <tr><td>Clockwork seal</td><td class="num">20 mm</td><td class="num">80 px</td></tr>
  </table>
  <p class="cap" style="margin-top:10px">Below the stacked minimum the slogan stops being readable. Switch to the horizontal lockup instead of shrinking further.</p>
</div>'''
    page('logo', body)

def colourways():
    tiles = [
        ('Full colour on Paper', PAPER, 'suds-enviro-horizontal-colour.svg', DEEP, 'The default. Use it whenever the ground allows.'),
        ('Full colour on Surface', SURFACE, 'suds-enviro-horizontal-colour.svg', DEEP, 'Data sheets, the website, catalogue pages.'),
        ('Reversed on Deep', DEEP, 'suds-enviro-horizontal-reversed.svg', SKY, 'Navigation bars, van sides, hoardings.'),
        ('Reversed on Invert', INVERT, 'suds-enviro-horizontal-reversed.svg', SKY, 'Foul water material and night-time pieces.'),
        ('White on Blue', BLUE, 'suds-enviro-horizontal-white.svg', PAPER, 'Buttons and banners in the brand blue.'),
        ('Deep, one colour', PAPER, 'suds-enviro-horizontal-deep.svg', DEEP, 'One-colour print, stamps, tape.'),
    ]
    t = ''.join(f'''<div style="display:flex;flex-direction:column;gap:10px;min-width:0"><div style="background:{bg};height:250px;display:flex;align-items:center;justify-content:center;{'border:1px solid rgba(0,85,118,.16);' if bg == PAPER else ''}">{svg(f).replace('<svg ', '<svg style="width:300px" ')}</div>
      <div class="mono" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:{BLUE}">{n}</div><p class="small" style="margin:0">{d}</p></div>''' for n, bg, f, ink, d in tiles)
    body = f'''
<div class="area">
  <p class="eyebrow">500 mm <span style="color:{DEEP}">/</span> Colourways</p>
  <h2 class="two h2"><span class="lt">Six ways</span> <b>to set it</b></h2>
  <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:26px 28px;margin-top:30px">{t}</div>
  <p class="cap" style="margin-top:22px;max-width:110ch">Reversed keeps the drop in full colour and turns the letters white, as the live site does. Black, one colour, is kept for engraving and laser marking only (see Made things).</p>
</div>'''
    page('logo', body)

def drop_rules():
    frames = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:84px;height:118px;display:flex;align-items:flex-end;justify-content:center">{drop_partial(i).replace("width=\"70\" height=\"100\"", "width=\"84\" height=\"118\"")}</div><span class="mono" style="font-size:10.5px;color:{SKY}">{t}</span></div>' for i, t in enumerate(['0 ms', '220 ms', '440 ms', '660 ms']))
    body = f'''
<div class="area">
  <p class="eyebrow">500 mm <span style="color:{SKY}">/</span> The drop and how it moves</p>
  <h2 class="two h2"><span class="lt">It settles.</span> <b>It never spins.</b></h2>
</div>
<div class="abs" style="left:64px;top:220px;width:420px;height:560px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04)">{svg('suds-drop-colour.svg').replace('<svg ', '<svg style="height:420px" ')}</div>
<div class="abs" style="left:540px;top:220px;width:740px">
  <div style="display:flex;gap:26px;align-items:flex-end;padding:26px 30px;background:rgba(255,255,255,.04)">{frames}<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:220px;height:118px;display:flex;align-items:center">{svg('suds-enviro-horizontal-reversed.svg').replace('<svg ', '<svg style="width:220px" ')}</div><span class="mono" style="font-size:10.5px;color:{SKY}">900 ms, wordmark rises 8 px</span></div></div>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:30px;margin-top:30px">
    <div><p class="eyebrow">What moves</p><ul style="padding-left:18px;margin:0">
      <li>The bands arrive from above and settle bottom first, red then the small green, blue, and the top green last. The way silt settles in a sump.</li>
      <li>The wordmark rises 8 px into place once the drop is complete.</li>
      <li>Ease out on every move. 220 ms between bands.</li></ul></div>
    <div><p class="eyebrow" style="color:{RED}">What never moves</p><ul style="padding-left:18px;margin:0">
      <li>The drop never rotates, tilts, wobbles or splashes.</li>
      <li>The bands never change order or colour. Red is always at the bottom.</li>
      <li>The letters never animate one by one.</li></ul></div>
  </div>
  <p class="cap" style="margin-top:16px">Use the drop alone only where the name is already said nearby: app icon, avatar, favicon, the centre of the seal.</p>
</div>'''
    page('logo', body, dark=True)

def donts():
    hz = svg('suds-enviro-horizontal-colour.svg')
    def t(label, inner, bg=PAPER):
        return f'''<div style="display:flex;flex-direction:column;gap:8px;min-width:0"><div style="position:relative;height:250px;background:{bg};border:1px solid rgba(0,85,118,.14);display:flex;align-items:center;justify-content:center;overflow:hidden">{inner}
        <svg viewBox="0 0 24 24" width="22" height="22" style="position:absolute;top:10px;right:10px"><circle cx="12" cy="12" r="11" fill="{RED}"/><path d="M7 7 L17 17 M17 7 L7 17" stroke="#fff" stroke-width="2.4"/></svg></div><p class="small" style="margin:0">{label}</p></div>'''
    tiles = [
        t('Retire the earlier S-and-leaf mark. It still sits in the website asset library.', f'<img src="{img("../../public/webflow/666592ec8224dc964288d508-suds-icon-web.png", 300, "png")}" style="height:120px" alt="">'),
        t('Retire the earlier thin wordmark, also still in the asset library.', f'<img src="{img("../../public/webflow/6665edb26a5b60714dad74db-logo-final-web.png", 600, "png")}" style="width:220px" alt="">'),
        t('Do not stretch or squash it.', hz.replace('<svg ', '<svg preserveAspectRatio="none" style="width:270px;height:28px" ')),
        t('Do not reorder or recolour the bands.', svg('suds-drop-colour.svg').replace('#c34c4a', '#tmp').replace('#54b54d', '#c34c4a').replace('#tmp', '#54b54d').replace('<svg ', '<svg style="height:120px" ')),
        t('Do not rotate the drop.', svg('suds-drop-colour.svg').replace('<svg ', '<svg style="height:120px;transform:rotate(-28deg)" ')),
        t('Do not set it straight onto a busy photo.', f'<img src="{img("../photography/hero/hero-5-street.jpg", 600)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt=""><div style="position:relative;width:250px">{svg("suds-enviro-horizontal-colour.svg")}</div>'),
        t('Do not retype the name in Montserrat as a logo.', f'<div style="font:800 40px var(--display);color:{BLUE};letter-spacing:-.01em">SuDS <span style="color:{GREEN}">Enviro</span></div>'),
        t('Do not outline it or add effects.', hz.replace('<svg ', f'<svg style="width:270px;filter:drop-shadow(4px 5px 0 rgba(0,0,0,.35))" ').replace('fill="#1d80b9"', f'fill="none" stroke="#1d80b9" stroke-width="1.2"').replace('fill="#54b54d"', 'fill="none" stroke="#54b54d" stroke-width="1.2"')),
    ]
    body = f'''
<div class="area">
  <p class="eyebrow">500 mm <span style="color:{DEEP}">/</span> Please don&rsquo;t</p>
  <h2 class="two h2"><span class="lt">Eight things</span> <b>we have seen happen</b></h2>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:22px 24px;margin-top:28px">{''.join(tiles)}</div>
</div>'''
    page('logo', body)

def build():
    cover(); contents(); idea(); four_jobs()
    logo_marks(); clear_space(); colourways(); drop_rules(); donts()
