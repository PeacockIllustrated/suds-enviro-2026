from core import *
from pages_a import opener_panel
from assets import img, svg

def rgb(h): return ', '.join(str(int(h[i:i + 2], 16)) for i in (1, 3, 5))

CORE = [
    ('Blue', BLUE, 'The bold voice. Headings, buttons, water.', 'Live site variable'),
    ('Deep', DEEP, 'Body copy, navigation, the reversed ground.', 'Live site variable'),
    ('Green', GREEN, 'The light voice, the land, the outlet node.', 'Live site variable'),
    ('Red', RED, 'Foul water. Used sparingly, always low down.', 'In the drop'),
]
ADDED = [
    ('Surface', SURFACE, 'Reading ground and catalogue ground.'),
    ('Invert', INVERT, 'Dark ground for foul water and night.'),
    ('Field', FIELD, 'Green that can carry text on Paper.'),
    ('Sky', SKY, 'Already on the site. Lines and text on dark.'),
]

def colour_opener():
    cores = ''.join(f'''<div style="display:flex;flex-direction:column;min-width:0">
      <div style="height:470px;background:{c};position:relative">
        <div class="mono" style="position:absolute;left:14px;bottom:12px;font-size:11px;color:#fff;letter-spacing:.08em;line-height:1.6">{c.upper()}<br>RGB {rgb(c)}</div></div>
      <div style="padding-top:12px"><div style="font:800 20px var(--display);text-transform:uppercase;color:{DEEP}">{n}</div>
      <p class="small" style="margin:4px 0 0">{d}</p><div class="cap" style="margin-top:6px">{src}</div></div></div>''' for n, c, d, src in CORE)
    body = opener_panel('colour', 'Keep the four colours SuDS Enviro already uses. Add only what was missing: a reading ground, a dark ground, and a green that can carry text.') + f'''
<div class="abs grid" style="left:360px;right:136px;top:590px;grid-template-columns:repeat(4,1fr);gap:16px">{cores.replace('height:470px', 'height:200px')}</div>'''
    page('colour', body, cls='opener')

def colour_meaning():
    W, H, G = 600, 600, 150          # diagram size, turf line
    strata = ''.join(f'<rect x="0" y="{G + 14 + i * 20}" width="{W}" height="21" fill="{depth_tint(500 + i * 6000 / 22)}"/>' for i in range(22))
    rain = ''.join(f'<line x1="{x}" y1="{y}" x2="{x - 6}" y2="{y + 18}" stroke="{SKY}" stroke-width="2.5" stroke-linecap="round"/>' for x, y in [(60, 30), (130, 70), (200, 24), (270, 86), (350, 40), (420, 92), (490, 30), (560, 74), (95, 108), (310, 116), (530, 120)])
    grass = ''.join(f'<line x1="{x}" y1="{G}" x2="{x + 3}" y2="{G - 9}" stroke="{FIELD}" stroke-width="2"/>' for x in range(8, W, 17))
    pin = lambda n, x, y: f'<circle cx="{x}" cy="{y}" r="15" fill="#fff" stroke="{DEEP}" stroke-width="2"/><text x="{x}" y="{y + 5}" text-anchor="middle" style="font:700 14px var(--mono)" fill="{DEEP}">{n}</text>'
    diagram = f'''<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect x="0" y="0" width="{W}" height="{G}" fill="{SURFACE}"/>{rain}
  {strata}
  <rect x="0" y="{G}" width="{W}" height="14" fill="{GREEN}"/>{grass}
  <rect x="262" y="{G - 6}" width="86" height="372" fill="{PAPER}" stroke="{DEEP}" stroke-width="3"/>
  <rect x="254" y="{G - 12}" width="102" height="8" fill="{DEEP}"/>
  <rect x="262" y="476" width="86" height="40" fill="{SKY}" opacity=".7"/>
  <rect x="0" y="288" width="262" height="24" fill="{BLUE}" stroke="#fff" stroke-width="2"/>
  <rect x="348" y="306" width="{W - 348 - 34}" height="24" fill="{BLUE}" stroke="#fff" stroke-width="2"/>
  <path d="M{W - 34} 300 L{W - 6} 318 L{W - 34} 336 Z" fill="{GREEN}"/>
  <text x="{W - 10}" y="292" text-anchor="end" style="font:500 11px var(--mono);letter-spacing:.08em" fill="#fff">LEAVES CLEANER</text>
  <rect x="0" y="548" width="{W}" height="20" fill="{RED}" stroke="#fff" stroke-width="2"/>
  <text x="12" y="590" style="font:500 11px var(--mono);letter-spacing:.08em" fill="{SKY}">FOUL, KEPT APART AND BELOW</text>
  {pin(1, 40, 60)}{pin(2, 40, G + 7)}{pin(3, 130, 300)}{pin(4, 470, 450)}{pin(5, 470, 558)}
</svg>'''
    rows = [
        (1, SKY, 'Sky', 'Rain', 'The sky and the rain before it lands.', 'Lines, rules and text on dark grounds.'),
        (2, GREEN, 'Green', 'The ground, and cleaner water', 'The land the rain falls on: roofs, roads, gardens, the site. The small green in the drop is water leaving cleaner than it arrived.', 'The light voice, the outlet node, the turf line.'),
        (3, BLUE, 'Blue', 'Surface water', 'Rain and runoff: the water SuDS Enviro catches, settles, separates and controls.', 'The bold voice, buttons, clean-water products.'),
        (4, DEEP, 'Deep', 'Below ground', 'Depth, structure and the engineering. Water darkens the further down it goes.', 'Body copy, navigation, the reversed ground.'),
        (5, RED, 'Red', 'Foul water', 'Sewage, grease and off-mains treatment, kept at the bottom and apart from everything above it.', 'The one accent on foul material. Used sparingly, always low down.'),
    ]
    li = ''.join(f'''<div style="display:grid;grid-template-columns:30px 64px 1fr;gap:16px;align-items:start;padding:14px 0;border-top:1px solid rgba(0,85,118,.14)">
      <div class="mono" style="font-size:13px;font-weight:600;color:{DEEP};padding-top:4px">{n}</div>
      <div style="width:64px;height:64px;background:{c}"></div>
      <div><div style="font:800 17px var(--display);text-transform:uppercase;color:{DEEP}">{nm} <span style="font-weight:300;color:{FIELD if c != RED else RED}">{what}</span></div>
      <p class="small" style="margin:4px 0 2px;max-width:none">{d}</p><div class="cap">{use}</div></div></div>''' for n, c, nm, what, d, use in rows)
    body = f'''
<div class="area">
  <p class="eyebrow">1000 mm <span style="color:{DEEP}">/</span> What the colours mean</p>
  <h2 class="two h2"><span class="lt">Every colour</span> <b>is a layer of the ground</b></h2>
</div>
<div class="abs" style="left:64px;top:200px">{diagram}</div>
<div class="abs" style="left:714px;right:136px;top:192px">{li}
  <p class="small" style="margin-top:16px;max-width:none"><b>The order never changes.</b> Green over blue over red, as in the ground and in the drop: clean water above, foul water below.</p>
  <p class="cap" style="margin-top:6px;max-width:none">Surface, Invert and Field are grounds and a text green, chosen to carry these five. They have no meaning of their own.</p>
</div>'''
    page('colour', body)

def colour_added():
    adds = ''.join(f'''<div style="display:flex;gap:18px;align-items:stretch;min-width:0">
      <div style="width:120px;height:120px;background:{c};flex:none;{'border:1px solid rgba(0,85,118,.18);' if c == SURFACE else ''}"></div>
      <div style="min-width:0"><div style="font:800 18px var(--display);text-transform:uppercase;color:{DEEP}">{n}</div>
      <div class="mono" style="font-size:11.5px;color:{DEEP};margin:4px 0 6px">{c.upper()} &nbsp; RGB {rgb(c)}</div><p class="small" style="margin:0">{d}</p></div></div>''' for n, c, d in ADDED)
    shares = [('Paper and Surface', 58, SURFACE), ('Deep', 18, DEEP), ('Blue', 12, BLUE), ('Green', 7, GREEN), ('Invert', 3, INVERT), ('Red', 2, RED)]
    bar = ''.join(f'<div style="flex:{p};background:{c};height:84px;{"border:1px solid rgba(0,85,118,.18);" if c == SURFACE else ""}"></div>' for n, p, c in shares)
    bar += '</div><div style="display:flex;gap:22px;margin-top:12px">' + ''.join(f'<span class="mono" style="font-size:11px;color:{DEEP};display:flex;align-items:center;gap:7px"><i style="width:10px;height:10px;background:{c};display:inline-block;outline:1px solid rgba(0,85,118,.2)"></i>{n} {p}%</span>' for n, p, c in shares)
    body = f'''
<div class="area">
  <p class="eyebrow">1000 mm <span style="color:{DEEP}">/</span> What we added</p>
  <h2 class="two h2"><span class="lt">Four additions,</span> <b>each with a job</b></h2>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:34px 40px;margin-top:34px">{adds}</div>
  <p class="eyebrow" style="margin-top:50px">How much of each, across a typical document</p>
  <div style="display:flex;gap:3px">{bar}</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:40px;margin-top:40px">
    <p class="small"><b>Autoflo yellow</b> <span class="mono">#FFE313</span> stays where the live site uses it: the Rhino autoFlo sub-brand, and nowhere else. It is a product accent, not a brand colour.</p>
    <p class="small">These are screen values in hex and RGB. Print colours are not specified here: match them to these values on a press proof before any run, and keep the proof as the reference for that printer.</p>
  </div>
</div>'''
    page('colour', body)

def colour_axis():
    clean = ['RHINO SERSIC inspection chambers', 'Catchpits and silt traps (SERS, SERDS)', 'SudSceptor hydrodynamic separators', 'RhinoPod filters', 'RhinoRoFlo and RhinoRoTex flow control', 'Rainwater harvesting']
    foul = ['RHINO SERFIC inspection chambers', 'RhinoLift pumping stations', 'Grease traps (RHINO GT)', 'Grease separators', 'Septic tanks']
    li = lambda xs, c: ''.join(f'<li style="font-size:15px;margin:0 0 7px;list-style:none;padding-left:18px;position:relative"><span style="position:absolute;left:0;top:8px;width:8px;height:8px;background:{c}"></span>{x}</li>' for x in xs)
    body = f'''
<div class="abs" style="left:0;top:0;width:700px;height:990px;background:{SURFACE}"></div>
<div class="abs" style="left:700px;top:0;width:700px;height:990px;background:{INVERT}"></div>
<div class="abs" style="left:64px;top:84px;width:580px">
  <p class="eyebrow">1000 mm <span style="color:{DEEP}">/</span> The axis</p>
  <h2 class="two h1"><span class="lt">Clean</span><br><b>water</b></h2>
  <p class="lede" style="margin-top:22px;font-size:18px">Surface water, rainwater and silt. Material for these products sits on Paper or Surface, in Blue and Green.</p>
  <ul style="margin:26px 0 0;padding:0">{li(clean, BLUE)}</ul>
  <div style="margin-top:28px;display:flex;gap:6px">{''.join(f'<span style="width:56px;height:56px;background:{c};{"border:1px solid rgba(0,85,118,.2)" if c in (PAPER, SURFACE) else ""}"></span>' for c in [PAPER, SURFACE, BLUE, GREEN, DEEP])}</div>
</div>
<div class="abs" style="left:764px;top:84px;width:500px;color:#fff">
  <p class="eyebrow" style="color:{RED}">&nbsp;</p>
  <h2 class="two h1"><span class="lt" style="color:{SKY}">Foul</span><br><b style="color:#fff">water</b></h2>
  <p class="lede" style="margin-top:22px;font-size:18px;color:#dcebf3">Foul drainage, grease and off-mains treatment. Material for these sits on Invert, with Sky for lines and Red as the one accent.</p>
  <ul style="margin:26px 0 0;padding:0;color:#dcebf3">{li(foul, RED)}</ul>
  <div style="margin-top:28px;display:flex;gap:6px">{''.join(f'<span style="width:56px;height:56px;background:{c};outline:1px solid rgba(175,219,244,.25)"></span>' for c in [INVERT, DEEP, SKY, RED, PAPER])}</div>
</div>
<img class="abs" src="{img('../photography/xray/sehds1800.png', 700, 'webp')}" style="left:420px;top:470px;width:300px" alt="">
<img class="abs" src="{img('../photography/xray/mini2000d.png', 700, 'webp')}" style="left:1010px;top:470px;width:300px;filter:brightness(1.6) saturate(.8)" alt="">
<div class="abs" style="left:64px;right:136px;bottom:70px;display:flex;justify-content:space-between;gap:40px">
  <p class="small" style="max-width:520px">This is how the customer meets the products: the site splits every range into foul and surface water solutions, and so does the drop, with red kept at the bottom. The two grounds make the split visible from across a room.</p>
  <p class="small" style="max-width:420px;color:#dcebf3">Products used on both sides, like the chambers and pumping stations, follow the job they are doing in that piece.</p>
</div>'''
    page('colour', body, head=True, cls='axis')

def contrast():
    import math
    def L(h):
        r, g, b = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    def cr(a, b):
        la, lb = L(a), L(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
    grounds = [('Paper', PAPER), ('Surface', SURFACE), ('Sky', SKY), ('Blue', BLUE), ('Deep', DEEP), ('Invert', INVERT)]
    inks = [('Ink', INK), ('Deep', DEEP), ('Blue', BLUE), ('Field', FIELD), ('Green', GREEN), ('Red', RED), ('Sky', SKY), ('White', PAPER)]
    head = '<tr><th style="width:120px">Text on</th>' + ''.join(f'<th class="num" style="text-align:center">{n}</th>' for n, _ in grounds) + '</tr>'
    rows = ''
    for n, c in inks:
        rows += f'<tr><td style="font-weight:700">{n} <span class="mono" style="font-weight:400;font-size:11px;opacity:.7">{c.upper()}</span></td>'
        for gn, g in grounds:
            if g == c: rows += '<td style="background:#f6f9fa"></td>'; continue
            v = cr(c, g)
            mark = 'AA' if v >= 4.5 else ('Large' if v >= 3 else 'Fail')
            col = {'AA': FIELD, 'Large': BLUE, 'Fail': RED}[mark]
            rows += f'<td style="text-align:center;padding:6px"><div style="background:{g};color:{c};font:800 15px var(--display);padding:8px 0 6px;{"outline:1px solid rgba(0,85,118,.15);" if g in (PAPER, SURFACE) else ""}">{v:.2f}</div><div class="mono" style="font-size:10px;margin-top:3px;color:{col};font-weight:600;letter-spacing:.08em">{mark.upper()}</div></td>'
        rows += '</tr>'
    body = f'''
<div class="area">
  <p class="eyebrow">1000 mm <span style="color:{DEEP}">/</span> Contrast, measured</p>
  <h2 class="two h2"><span class="lt">Every pairing,</span> <b>with its ratio</b></h2>
  <div style="display:grid;grid-template-columns:1fr 320px;gap:36px;margin-top:22px">
    <table style="font-size:13px">{head}{rows}</table>
    <div>
      <p class="small"><b>AA</b> means 4.5 : 1 or better, fine for body text. <b>Large</b> means 3 : 1 or better, fine for text at 24 px and up, or 19 px bold. <b>Fail</b> means not for text at any size.</p>
      <p class="fact" style="margin-top:18px;border-color:{RED}">The site's light green heading voice measures 2.59 : 1 on white. It fails for text at every size.</p>
      <p class="small" style="margin-top:16px">So the light voice moves to <b style="color:{FIELD}">Field</b> on light grounds, 4.56 : 1, the same hue made darker. Green keeps every non-text job: the land, the outlet node, the light voice on Deep and Invert.</p>
      <p class="small">Blue reads at 4.34 : 1 on white: headings and buttons yes, body copy no. Body copy is Deep.</p>
    </div>
  </div>
</div>'''
    page('colour', body)

# ---------------------------------------------------------------- type
def type_opener():
    body = opener_panel('type', 'Montserrat, the face the live site already uses, in two voices. IBM Plex Mono for anything that is a measurement.') + f'''
<div class="abs" style="left:960px;right:136px;top:96px">
  <div style="font:300 200px/0.8 var(--display);color:{FIELD};letter-spacing:-.04em">Aa</div>
  <div style="font:800 200px/0.8 var(--display);color:{BLUE};letter-spacing:-.04em;margin-top:6px">Aa</div>
  <div style="font:500 72px/1 var(--mono);color:{DEEP};margin-top:26px">Ø225</div>
</div>
<div class="abs" style="left:360px;right:136px;top:640px;display:grid;grid-template-columns:repeat(3,1fr);gap:26px">
  <div><p class="eyebrow">Display</p><div style="font:800 26px var(--display);text-transform:uppercase;color:{BLUE}">Montserrat 800</div><div style="font:300 26px var(--display);text-transform:uppercase;color:{FIELD}">Montserrat 300</div><p class="cap" style="margin-top:8px">Headings, uppercase, two weights in one line.</p></div>
  <div><p class="eyebrow">Text</p><div style="font:400 17px/1.5 var(--display);color:{DEEP}">Montserrat 400 and 600 for reading. Sentence case, never centred in long runs.</div><p class="cap" style="margin-top:8px">Body, captions, forms.</p></div>
  <div><p class="eyebrow">Measurement</p><div style="font:500 17px/1.5 var(--mono);color:{DEEP}">IBM Plex Mono 400 / 500<br>SERSIC600 · 3000 mm · 9 o'clock</div><p class="cap" style="margin-top:8px">Codes, sizes, depths, eyebrows.</p></div>
</div>
<p class="abs cap" style="left:360px;right:136px;bottom:70px">Both families are open licence (SIL OFL) from Google Fonts, so any printer, sign maker or web developer can use them without a licence.</p>'''
    page('type', body, cls='opener')

def type_voices():
    body = f'''
<div class="area">
  <p class="eyebrow">1500 mm <span style="color:{DEEP}">/</span> Two voices</p>
  <h2 class="two h2"><span class="lt">Light says what it is.</span> <b>Bold says which one.</b></h2>
  <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:46px;margin-top:34px">
    <div style="display:flex;flex-direction:column;gap:22px">
      <div class="tile" style="padding:26px 28px"><div class="two" style="font-size:54px"><span class="lt">The</span> <b>RHINO range</b></div><p class="cap" style="margin:10px 0 0">The live site's own pattern: the generic word light, the name bold.</p></div>
      <div class="tile" style="padding:26px 28px"><div class="two" style="font-size:54px"><span class="lt">Inspection</span> <b>chambers</b></div><p class="cap" style="margin:10px 0 0">Light for the family, bold for the thing.</p></div>
      <div class="tile" style="padding:26px 28px;background:{DEEP};border:0"><div style="font:800 54px/1 var(--display);color:#fff">Rhino <i style="color:{GREEN};font-weight:800">RoFlo</i></div><p class="cap" style="margin:10px 0 0;color:{SKY}">Sub-brands: Rhino upright, the product name in bold italic, as on the site.</p></div>
    </div>
    <div>
      <p class="eyebrow">The rules</p>
      <ol style="padding-left:20px;margin:0">
        <li>Headings are uppercase, Montserrat 300 then 800 in the same line. Never more than two weights in one heading.</li>
        <li>The light voice comes first and is the general word. The bold voice is the specific one.</li>
        <li>On Paper and Surface the light voice is Field and the bold voice is Blue. On Deep and Invert they are Green and White.</li>
        <li>Body copy is sentence case, Montserrat 400, Deep. Highlight a phrase in Field 600 at most once a paragraph.</li>
        <li>Every measurement is set in Plex Mono with a space before the unit: <span class="mono">600 mm</span>, <span class="mono">Ø225 mm</span>, <span class="mono">5 l/s</span>.</li>
        <li>Long passages are left aligned. The site's right-aligned blocks stay as feature moments only.</li>
      </ol>
      <div class="tile" style="margin-top:20px;padding:18px 20px"><div class="mono" style="font-size:13px;line-height:1.9;color:{DEEP}">SERSIC600 &nbsp;Ø600 mm<br>Inlets 3 / 5 / 6 / 7 / 9 o'clock<br>Outlet 12 o'clock &nbsp;Ø225 mm Twinwall<br>Depth 1500 mm to soffit &nbsp;Sump 350 mm</div></div>
    </div>
  </div>
</div>'''
    page('type', body)

def type_scale():
    rows = [
        ('Display', '72 / 72', '800 + 300 caps', '60 pt', 'The two voices', 'font:800 46px/1 var(--display);text-transform:uppercase;color:' + BLUE),
        ('Heading 1', '48 / 50', '800 + 300 caps', '36 pt', 'One solution', 'font:800 34px/1 var(--display);text-transform:uppercase;color:' + BLUE),
        ('Heading 2', '32 / 36', '800 caps', '22 pt', 'Flow control', 'font:800 24px/1 var(--display);text-transform:uppercase;color:' + BLUE),
        ('Heading 3', '22 / 28', '700', '14 pt', 'Choose your inlets', 'font:700 19px/1.2 var(--display);color:' + DEEP),
        ('Lede', '20 / 29', '500', '12 pt', 'One-piece HDPE chambers, six diameters.', 'font:500 18px/1.4 var(--display);color:' + DEEP),
        ('Body', '17 / 26', '400', '9.5 / 14 pt', 'Outlet fixed at 12 o\'clock on every chamber.', 'font:400 15px/1.5 var(--display);color:' + DEEP),
        ('Eyebrow', '12 / 16 +0.16em', 'Mono 500 caps', '7 pt', '3000 MM / PHOTOGRAPHY', 'font:500 11px var(--mono);letter-spacing:.16em;color:' + BLUE),
        ('Data', '14 / 20', 'Mono 400', '8 pt', 'SEHDS1800  Ø1800 mm', 'font:400 13px var(--mono);color:' + DEEP),
        ('Caption', '12 / 17', 'Mono 400', '7 pt', 'Re-shot from the 3D file.', 'font:400 11.5px var(--mono);color:' + DEEP),
    ]
    tr = ''.join(f'<tr><td style="font-weight:700;width:110px;padding:5px 10px">{a}</td><td class="num">{b}</td><td>{c}</td><td class="num">{d}</td><td style="{s};white-space:nowrap">{e}</td></tr>' for a, b, c, d, e, s in rows)
    body = f'''
<div class="area">
  <p class="eyebrow">1500 mm <span style="color:{DEEP}">/</span> Scale</p>
  <h2 class="two h2"><span class="lt">Nine sizes,</span> <b>screen and print</b></h2>
  <table style="margin-top:18px" class="tight"><tr><th>Role</th><th>Screen px</th><th>Weight</th><th>Print</th><th>Sample</th></tr>{tr}</table>
  <p class="cap" style="margin-top:12px">Screen sizes are for desktop; on phones, Display and Heading 1 drop to 44 and 34 px. Line lengths stay near 65 characters.</p>
  <div style="display:grid;grid-template-columns:1.3fr 1fr 200px;gap:30px;margin-top:16px;background:{SURFACE};padding:20px 30px;align-items:center">
    <div><p class="eyebrow">In use</p><div class="two" style="font-size:38px"><span class="lt">Inspection</span><br><b>chambers</b></div>
      <p style="font:500 17px/1.45 var(--display);margin:12px 0 0">One-piece HDPE, benched and channelled. Six diameters from 450 to 1200 mm.</p></div>
    <div class="mono" style="font-size:13px;line-height:2;color:{DEEP}">SERSIC600 &nbsp; Ø600 mm<br>Inlets 3 / 5 / 6 / 7 / 9<br>Outlet 12 o'clock<br>Depth to 6000 mm</div>
    <div>{clock_plan(r=46)}</div>
  </div>
</div>'''
    page('type', body)

def names():
    body = f'''
<div class="area">
  <p class="eyebrow">1500 mm <span style="color:{DEEP}">/</span> Writing the name</p>
  <h2 class="two h2"><span class="lt">SuDS Enviro,</span> <b>every time</b></h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:46px;margin-top:28px">
    <div>
      <table>
        <tr><th>Write</th><th>Not</th></tr>
        <tr><td><b>SuDS Enviro</b> in running text</td><td>Suds Enviro, SUDS Enviro, SuDS-Enviro, Suds</td></tr>
        <tr><td><b>SuDS Enviro Ltd</b> on legal lines and invoices</td><td>SuDS Enviro Limited (unless the registered name says so)</td></tr>
        <tr><td><b>SuDS</b> for sustainable drainage systems</td><td>SUDS, Suds, suds</td></tr>
        <tr><td><b>the RHINO range</b> for the family</td><td>the Rhino Range, the rhino range</td></tr>
        <tr><td><b>SERSIC600</b>: sales codes in capitals, no spaces, set in Plex Mono</td><td>Sersic 600, SERSIC-600</td></tr>
      </table>
      <p class="cap" style="margin-top:12px">In all-capital settings, such as the seal and the eyebrows, SUDS ENVIRO is acceptable. Everywhere else the small u stays.</p>
    </div>
    <div>
      <p class="eyebrow" style="color:{RED}">For SuDS Enviro to decide</p>
      <p class="small">Product names are written several ways across the site, the data sheets and the 3D files. We have not picked silently. These need one answer each:</p>
      <ol style="padding-left:20px;margin:0">
        <li><b>RHINO or Rhino.</b> "RHINO SERSIC" on chambers, "Rhino RoFlo" and "RhinoRoFlo" on flow control, "RhinoLift" on pumps. We suggest RHINO for the range and Rhino + name, one word, for named products (RhinoLift, RhinoPod, RhinoRoFlo).</li>
        <li><b>SudSceptor.</b> The separator's name breaks the SuDS capitals. Keep it as a product name, or make it SuDSceptor?</li>
        <li><b>Sales and drawing codes.</b> The 3D library carries both (SERCIC and SERSIC appear for chambers). One list should map them.</li>
        <li><b>The three greens.</b> The logo masters hold #5BB44F, the site holds #54B54D, the RHINO lockup #54B54D. This book uses the site value; the masters should be re-saved to match.</li>
      </ol>
    </div>
  </div>
  <p class="eyebrow" style="margin-top:30px">The range as it is written today, with sales codes</p>
  <table style="font-size:13.5px">
    <tr><th>Product</th><th>Codes</th><th>Sizes</th><th>Product</th><th>Codes</th><th>Sizes</th></tr>
    <tr><td><b>RHINO inspection chamber</b></td><td class="num">SERSIC, SERFIC</td><td class="num">450 to 1200 mm</td><td><b>RhinoLift</b></td><td class="num">PS50, Mini, Maxi, Aqua</td><td class="num">600 to 1200 mm</td></tr>
    <tr><td><b>Catchpit / silt trap</b></td><td class="num">SERS, SERDS</td><td class="num">300 to 1200 mm</td><td><b>RHINO GT</b> grease trap</td><td class="num">Jumbo Micro</td><td class="num">under sink, floor</td></tr>
    <tr><td><b>RhinoRoFlo</b> orifice</td><td class="num">SERF300, 450, 600</td><td class="num">300 to 600 mm</td><td><b>RhinoPod</b></td><td class="num">SERPOD1850</td><td class="num">floating cartridge</td></tr>
    <tr><td><b>RhinoRoTex</b> vortex</td><td class="num">ROTEX600 to 1200</td><td class="num">600 to 1200 mm</td><td><b>RhinoDuct</b> drawpit</td><td class="num">SERD</td><td class="num">150 mm sections</td></tr>
    <tr><td><b>SudSceptor</b> separator</td><td class="num">SEHDS750 to 3000</td><td class="num">750 to 3000 mm</td><td><b>RhinoPit</b></td><td class="num">SERPT600</td><td class="num">600 mm</td></tr>
  </table>
</div>'''
    page('type', body)

# ---------------------------------------------------------------- voice
def voice_opener():
    pr = [
        ('Say the size.', 'Ø225 mm outlet at 12 o\'clock, not a large outlet. Numbers are what engineers trust.'),
        ('Answer first.', 'The reply to a question goes in the first sentence. The reasons follow.'),
        ('Site English.', 'Write the way a good contracts manager talks on the phone: plain, specific, calm.'),
        ('One job per sentence.', 'If a sentence needs a second comma, it is usually two sentences.'),
    ]
    items = ''.join(f'<div style="border-top:2px solid {BLUE};padding-top:12px"><div class="mono" style="font-size:11px;color:{BLUE};font-weight:600">0{i + 1}</div><div style="font:800 22px var(--display);text-transform:uppercase;color:{DEEP};margin:6px 0 8px">{t}</div><p class="small" style="margin:0">{d}</p></div>' for i, (t, d) in enumerate(pr))
    body = opener_panel('voice', 'SuDS Enviro should sound like the best person on its sales line: someone who knows the product range by heart and gives you the number before you ask.') + f'''
<div class="abs grid" style="left:360px;right:136px;top:620px;grid-template-columns:repeat(4,1fr);gap:24px">{items}</div>
<p class="abs cap" style="left:360px;bottom:70px">British English. No exclamation marks. No em dashes. Numbers as figures, with units.</p>'''
    page('voice', body, cls='opener')

def line_bank():
    lines = [
        ('Every drop,', 'accounted for.', 'The working line for the identity.'),
        ('Bespoke,', 'standardised.', 'SuDS Enviro\'s own slogan. Unchanged.'),
        ('Five ways in.', 'One way out.', 'The Clockwork chambers: inlets at 3, 5, 6, 7 and 9, outlet at 12.'),
        ('From roof', 'to river.', 'Already on the site\'s Water Journey page.'),
        ('Down to', 'six metres.', 'Non-adoptable chambers go to 6000 mm.'),
        ('No moving parts.', 'No power.', 'True of RhinoRoFlo and RhinoRoTex flow control.'),
        ('The home of', 'SuDS RHINO.', 'From the drawing title block.'),
        ('Built for the bit', 'nobody sees.', 'For recruitment and the about page.'),
    ]
    cards = ''.join(f'<div style="border-top:1px solid rgba(175,219,244,.25);padding:22px 0 10px;min-width:0;min-height:290px"><div class="two" style="font-size:32px;line-height:1.04"><span class="lt">{a}</span><br><b>{b}</b></div><p class="cap" style="margin-top:10px">{c}</p></div>' for a, b, c in lines)
    body = f'''
<div class="area">
  <p class="eyebrow">2000 mm <span style="color:{SKY}">/</span> Line bank</p>
  <h2 class="two h2"><span class="lt">Lines that</span> <b>can be used as they are</b></h2>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:20px 30px;margin-top:34px">{cards}</div>
</div>'''
    page('voice', body, dark=True)

def say_table():
    rows = [
        ('Lead time', 'We will confirm a delivery date once we have checked your drawing.', 'Super fast turnaround on all orders!'),
        ('A spec question', 'A 600 mm chamber takes up to four inlets, at 3, 5, 6, 7 or 9 o\'clock. The outlet is at 12.', 'Our revolutionary multi-inlet solution offers unmatched flexibility.'),
        ('Something we don\'t make', 'We don\'t make that combination. The nearest is a 750 mm chamber with the same inlets.', 'Unfortunately we are unable to accommodate your request at this time.'),
        ('Adoption', 'Adoptable chambers go to 3000 mm to soffit under DCG. Deeper than that, we can talk you through a non-adoptable option.', 'Fully compliant with all regulations.'),
        ('A problem on site', 'Send us a photo and the chamber code from the label. We will call you back.', 'We apologise for any inconvenience caused.'),
        ('Web copy', 'Catchpits that hold the silt until you lift it out.', 'Cutting-edge silt management solutions for a sustainable future.'),
        ('Performance', 'Removes over 50% of fine suspended solids, 0 to 200 microns, at design flow.', 'Industry-leading performance you can trust.'),
    ]
    tr = ''.join(f'<tr><td style="font-weight:700;width:180px">{a}</td><td style="color:{DEEP}">{b}</td><td style="color:#6d8796;text-decoration:line-through;text-decoration-color:rgba(195,76,74,.6)">{c}</td></tr>' for a, b, c in rows)
    body = f'''
<div class="area">
  <p class="eyebrow">2000 mm <span style="color:{DEEP}">/</span> We say, we don&rsquo;t say</p>
  <h2 class="two h2"><span class="lt">On the phone,</span> <b>in the inbox, on the site</b></h2>
  <table class="roomy" style="margin-top:22px;font-size:15px"><tr><th>When</th><th>We say</th><th>We don't say</th></tr>{tr}</table>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:24px">
    <div style="background:{SURFACE};padding:20px 22px"><p class="eyebrow" style="color:#6d8796">Before, from the live site</p><p class="small" style="margin:0;color:#4d6b7c">Improper surface water management can lead to flooding, erosion, and pollution. Effective management involves drainage basins, conveyance systems, and retention basins. At SuDS Enviro, we use advanced techniques to control runoff, reduce erosion, and improve water quality.</p></div>
    <div style="background:{SURFACE};padding:20px 22px;border-left:3px solid {GREEN}"><p class="eyebrow">After</p><p class="small" style="margin:0">Rain that can't soak away has to go somewhere. Our chambers, catchpits and flow controls catch it, take the silt and oil out, and let it go at the rate your sewer or river can take. Tell us the site and we will tell you which ones.</p></div>
  </div>
</div>'''
    page('voice', body)

def build():
    colour_opener(); colour_meaning(); colour_added(); colour_axis(); contrast()
    type_opener(); type_voices(); type_scale(); names()
    voice_opener(); line_bank(); say_table()
