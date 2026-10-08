from core import *
from pages_a import opener_panel
from assets import img, svg
import os, io, base64, glob

HERE = os.path.dirname(__file__)

def qr_svg(data, size=120, col=DEEP):
    import qrcode
    q = qrcode.QRCode(border=0, box_size=1); q.add_data(data); q.make()
    m = q.get_matrix(); n = len(m); c = size / n
    rects = ''.join(f'<rect x="{x * c:.2f}" y="{y * c:.2f}" width="{c + .05:.2f}" height="{c + .05:.2f}"/>' for y, row in enumerate(m) for x, v in enumerate(row) if v)
    return f'<svg viewBox="0 0 {size} {size}" width="{size}" height="{size}"><g fill="{col}">{rects}</g></svg>'

def browser(src, w, h, url='sudsenviro.com'):
    return f'''<div style="width:{w}px;background:#fff;border:1px solid rgba(0,85,118,.18)"><div style="height:26px;display:flex;align-items:center;gap:6px;padding:0 10px;background:{SURFACE};border-bottom:1px solid rgba(0,85,118,.12)"><i style="width:8px;height:8px;border-radius:50%;background:#c9d6dd"></i><i style="width:8px;height:8px;border-radius:50%;background:#c9d6dd"></i><i style="width:8px;height:8px;border-radius:50%;background:#c9d6dd"></i><span class="mono" style="font-size:10px;margin-left:10px;color:{DEEP};opacity:.7">{url}</span></div><img src="{src}" style="width:100%;height:{h}px;object-fit:cover;object-position:top" alt=""></div>'''

def phone(src, w=230):
    h = round(w * 2.16)
    return f'<div style="width:{w}px;height:{h}px;border-radius:30px;background:{INK};padding:9px;flex:none"><img src="{src}" style="width:100%;height:100%;border-radius:22px;object-fit:cover;object-position:top" alt=""></div>'

# ---------------------------------------------------------------- on screen
def screen_opener():
    body = opener_panel('screen', 'The rebuilt website already speaks most of this language. The book adds three things: the cut, the gauge and real photography.') + f'''
<div class="abs" style="left:360px;right:136px;top:560px">{browser(img('shots/site-home.png', 1600), 904, 300)}</div>'''
    page('screen', body, cls='opener')

def screen_site():
    shots = [('site-rhino-range', 'The RHINO range'), ('site-chamber', 'A product page'), ('site-explorer', 'Site Explorer: the cut, already live'), ('site-journey', 'Water Journey: roof to river')]
    cells = ''.join(f'<div style="min-width:0">{browser(img("shots/" + s + ".png", 1400), 560, 300)}<p class="cap" style="margin-top:6px">{c}</p></div>' for s, c in shots)
    body = f'''
<div class="area">
  <p class="eyebrow">4000 mm <span style="color:{DEEP}">/</span> The website, run locally from the repo</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px 30px;margin-top:6px">{cells}</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:14px">
    <p class="small"><b>01 / Field for the light voice.</b> Swap the light green heading words to Field on white grounds. Same look, readable at every size.</p>
    <p class="small"><b>02 / The gauge as scroll progress.</b> A thin staff gauge down the right edge of long pages, green marker at your depth.</p>
    <p class="small"><b>03 / Real photography.</b> Replace the generic water stock with the shot list. Heroes on the home page, catalogue images on product pages.</p>
  </div>
</div>'''
    page('screen', body)

def screen_phones():
    body = f'''
<div class="area">
  <p class="eyebrow">4000 mm <span style="color:{DEEP}">/</span> On the phone, where site teams are</p>
  <div style="display:flex;gap:40px;align-items:flex-start;margin-top:10px">
    <div style="width:330px;flex:none">
      <h2 class="two h2"><span class="lt">Built for</span> <b>a muddy thumb</b></h2>
      <p style="margin-top:16px">The configurator was built mobile first, for people on a site or in a van. The phone screens keep the bottom nav bar, big targets and the Clockwork clock face.</p>
      <p class="small">The configurator's own navy and greens already sit close to this palette. Moving it onto the same tokens as the website (Deep, Blue, Green, Field) makes them one product.</p>
      <div style="margin-top:20px">{clock_plan(inlets=(3, 5, 9), r=50)}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:30px">{phone(img('shots/m-home.png', 600), 252)}{phone(img('shots/m-chamber.png', 600), 252)}{phone(img('shots/m-configurator.png', 600), 252)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,252px);gap:30px"><p class="cap" style="margin:0">Home. The stacked lockup and the two-voice line, already live.</p><p class="cap" style="margin:0">Product page. Catalogue image goes here, x-ray on tap.</p><p class="cap" style="margin:0">Configurator, step 0. Moves onto the website tokens.</p></div>
    </div>
  </div>
</div>'''
    page('screen', body, surf=True)

def social():
    W, H = 300, 533
    f1 = f'''<div style="width:{W}px;height:{H}px;background:{INVERT};position:relative;overflow:hidden;flex:none">
      <div style="position:absolute;left:24px;top:28px;width:120px">{svg('suds-enviro-horizontal-reversed.svg')}</div>
      <div style="position:absolute;left:0;right:0;top:66px;display:flex;justify-content:center">{clock_plan(inlets=(3, 5, 6, 7, 9), r=52, dark=True)}</div>
      <div class="two" style="position:absolute;left:24px;right:24px;bottom:66px;font-size:32px"><span class="lt" style="color:{GREEN}">Five ways in.</span><br><b style="color:#fff">One way out.</b></div>
      <div class="mono" style="position:absolute;left:24px;bottom:30px;font-size:10px;color:{SKY}">RHINO SERSIC · 3 / 5 / 6 / 7 / 9 · 12</div></div>'''
    f2 = f'''<div style="width:{W}px;height:{H}px;position:relative;overflow:hidden;flex:none">
      <img src="{img('../photography/hero/hero-1-trench.jpg', 900)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:28% 50%" alt="">
      <div style="position:absolute;inset:auto 0 0 0;height:230px;background:linear-gradient(180deg,rgba(6,42,58,0),rgba(6,42,58,.9))"></div>
      {gauge(6000, dark=True, top=30, bottom=340, x=1352, w=22).replace('class="gauge" viewBox="0 0 1400 990"', 'viewBox="1290 0 110 533" style="position:absolute;right:0;top:0;width:110px;height:533px"')}
      <div class="two" style="position:absolute;left:22px;bottom:62px;font-size:34px"><span class="lt" style="color:#fff">Down to</span><br><b style="color:#fff">six metres.</b></div>
      <div style="position:absolute;left:22px;bottom:26px;width:100px">{svg('suds-enviro-horizontal-white.svg')}</div></div>'''
    f3 = f'''<div style="width:{W}px;height:{H}px;background:{SURFACE};position:relative;overflow:hidden;flex:none">
      <img src="{img('../photography/xray/sehds1800.png', 700, 'webp')}" style="position:absolute;left:30px;top:70px;width:240px" alt="">
      <div class="mono" style="position:absolute;left:22px;top:26px;font-size:10px;color:{BLUE};letter-spacing:.12em">SUDSCEPTOR SEHDS1800</div>
      <div style="position:absolute;left:22px;right:22px;bottom:84px"><div style="font:800 60px/0.9 var(--display);color:{BLUE}">&gt;50%</div><div style="font:500 14px/1.35 var(--display);color:{DEEP};margin-top:6px">of fine suspended solids, 0 to 200 microns, removed at design flow.</div></div>
      <div style="position:absolute;left:22px;bottom:28px;width:110px">{svg('suds-enviro-horizontal-colour.svg')}</div></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">4000 mm <span style="color:{DEEP}">/</span> Social, 9:16</p>
  <div style="display:flex;gap:34px;align-items:flex-start;margin-top:8px">
    <div style="width:260px;flex:none">
      <h2 class="two h2"><span class="lt">One fact</span> <b>per frame</b></h2>
      <p style="margin-top:16px">Every post carries one true number: a depth, a clock position, a percentage. The device does the talking, the logo signs off at the bottom.</p>
      <p class="cap">Text stays inside the middle 70% so platform buttons never cover it. Frames are laid out for portrait, never cropped from landscape.</p>
    </div>
    {f1}{f2}{f3}
  </div>
  <div style="margin-top:26px;display:flex;gap:24px;align-items:flex-end">
    <div style="width:1000px;height:252px;position:relative;overflow:hidden;background:#fff;flex:none;outline:1px solid rgba(0,85,118,.15)">
      <svg width="1000" height="252" style="position:absolute;inset:0">{''.join(f'<rect x="0" y="{120 + i * 12}" width="1000" height="12.5" fill="{depth_tint(300 + i * 560)}"/>' for i in range(12))}<rect x="0" y="114" width="1000" height="7" fill="{GREEN}"/></svg>
      <div style="position:absolute;left:300px;top:40px;width:300px">{svg('suds-enviro-horizontal-colour.svg')}</div>
      <div class="two" style="position:absolute;left:300px;top:160px;font-size:30px"><span class="lt" style="color:#fff">Every drop,</span> <b style="color:#fff">accounted for.</b></div>
      <div style="position:absolute;right:40px;top:16px">{clock_plan(inlets=(3, 5, 6, 7, 9), r=26, labels=False)}</div>
    </div>
    <p class="cap" style="margin:0">LinkedIn cover, 1584 x 396. The left quarter stays clear for the profile avatar (the drop).</p>
  </div>
</div>'''
    page('screen', body)

# ---------------------------------------------------------------- print
def datasheet(scale=1.0):
    rows = [('Material', 'HDPE, extruded and thermoformed'), ('Diameters', '450, 600, 750, 900, 1050, 1200 mm'), ('Depth, adoptable', 'To 3000 mm to soffit (DCG / SfA7)'), ('Depth, non-adoptable', 'To 6000 mm'), ('Sump', '350 mm integral'), ('Pipe sizes', '110 / 160 / 225 / 300 mm'), ('Inlets', 'Up to 5, at 3, 5, 6, 7, 9 o\'clock'), ('Outlet', 'Fixed at 12 o\'clock')]
    tr = ''.join(f'<tr><td style="padding:3px 0;border-bottom:1px solid rgba(0,85,118,.14);font-size:8.5px;color:{DEEP};font-weight:600">{a}</td><td style="padding:3px 0;border-bottom:1px solid rgba(0,85,118,.14);font:400 8.5px var(--mono);color:{DEEP}">{b}</td></tr>' for a, b in rows)
    return f'''<div style="width:420px;height:594px;background:#fff;position:relative;overflow:hidden;box-shadow:0 18px 40px -20px rgba(0,40,60,.45);flex:none">
  <div style="height:64px;background:{DEEP};display:flex;align-items:center;justify-content:space-between;padding:0 22px"><div style="width:150px">{svg('suds-enviro-horizontal-reversed.svg')}</div><span class="mono" style="font-size:8px;color:{SKY};letter-spacing:.12em">DATA SHEET · SERSIC</span></div>
  <div style="padding:18px 22px 0">
    <div class="mono" style="font-size:7.5px;letter-spacing:.14em;color:{BLUE}">CHAMBERS / SURFACE WATER</div>
    <div class="two" style="font-size:25px;margin-top:4px"><span class="lt">RHINO</span> <b>SERSIC</b></div>
    <div style="font:500 10px/1.4 var(--display);color:{DEEP};margin-top:6px;max-width:300px">One-piece HDPE benched and channelled inspection chambers, six diameters from 450 to 1200 mm.</div>
  </div>
  <div style="display:grid;grid-template-columns:170px 1fr;gap:14px;padding:12px 22px 0">
    <img src="{img('../photography/catalogue/sersic600.jpg', 400)}" style="width:170px" alt="">
    <div>{clock_plan(r=40)}</div>
  </div>
  <table style="margin:10px 22px 0;width:376px">{tr}</table>
  <div class="mono" style="position:absolute;left:22px;right:22px;bottom:40px;font-size:7.5px;color:{DEEP};line-height:1.6">BS EN 13598-2 · SfA7 · DCG · Building Regulations Part H1</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:26px;background:{SURFACE};display:flex;align-items:center;justify-content:space-between;padding:0 22px" class="mono"><span style="font-size:7px;color:{DEEP}">SuDS Enviro Ltd · 9 Ambleside Court, Chester-le-Street DH3 2EB</span><span style="font-size:7px;color:{DEEP}">01224 057 700 · sales@sudsenviro.com</span></div>
</div>'''

def print_opener():
    body = opener_panel('print', 'Print is where an engineer meets the brand at a desk: the data sheet, the quote, the card left on site.', width=440) + f'''
<div class="abs" style="left:830px;top:160px">{datasheet()}</div>
<p class="abs cap" style="left:360px;top:640px;width:400px">The data sheet. Deep header with the reversed lockup, the two-voice title, the catalogue image beside the Clockwork plan, then the numbers in Plex Mono. Every figure on it comes from the SERSIC data sheet.</p>'''
    page('print', body, cls='opener')

def cards():
    front = f'''<div style="width:340px;height:220px;background:{DEEP};position:relative;overflow:hidden;box-shadow:0 14px 30px -18px rgba(0,40,60,.5)">
      <div style="position:absolute;left:26px;top:26px;width:30px">{svg('suds-drop-colour.svg')}</div>
      <div style="position:absolute;left:26px;bottom:66px;font:800 19px var(--display);color:#fff">Sean Taylor</div>
      <div class="mono" style="position:absolute;left:26px;bottom:26px;font-size:10px;line-height:1.6;color:{SKY}">sales@sudsenviro.com<br>01224 057 700</div>
      <div style="position:absolute;right:20px;top:20px">{clock_plan(inlets=(3, 6, 9), r=26, labels=False, dark=True)}</div></div>'''
    back = f'''<div style="width:340px;height:220px;background:#fff;position:relative;overflow:hidden;box-shadow:0 14px 30px -18px rgba(0,40,60,.5)">
      <div style="position:absolute;left:26px;top:30px;width:190px">{svg('suds-enviro-horizontal-colour.svg')}</div>
      <svg style="position:absolute;left:0;bottom:0" width="340" height="110" viewBox="0 0 340 110">{''.join(f'<rect x="0" y="{8 + i * 8.5:.1f}" width="340" height="9" fill="{depth_tint(i * 520)}"/>' for i in range(12))}<rect x="0" y="2" width="340" height="6" fill="{GREEN}"/></svg>
      <div class="two" style="position:absolute;left:26px;bottom:20px;font-size:15px"><span class="lt" style="color:#fff">Every drop,</span> <b style="color:#fff">accounted for.</b></div></div>'''
    sig = f'''<div style="width:520px;background:#fff;padding:22px 24px;border:1px solid rgba(0,85,118,.14)"><div style="font:600 14px var(--display);color:{DEEP}">Sean Taylor</div><div class="mono" style="font-size:11px;color:{DEEP};margin:4px 0 14px">01224 057 700 · sales@sudsenviro.com</div>
      <div style="display:flex;align-items:center;gap:16px;border-top:1px solid rgba(0,85,118,.14);padding-top:14px"><div style="width:170px">{svg('suds-enviro-horizontal-colour.svg')}</div><span style="font:700 10px var(--display);letter-spacing:.12em;color:{BLUE};text-transform:uppercase">Bespoke, <i>standardised</i></span></div>
      <div class="mono" style="font-size:9px;color:#6d8796;margin-top:10px">SuDS Enviro Ltd · 9 Ambleside Court, Chester-le-Street DH3 2EB</div></div>'''
    quote = f'''<div style="width:420px;height:594px;background:#fff;position:relative;overflow:hidden;box-shadow:0 18px 40px -20px rgba(0,40,60,.45);flex:none">
      <svg width="420" height="250" viewBox="0 0 420 250" style="position:absolute;left:0;bottom:0">{''.join(f'<rect x="0" y="{10 + i * 20:.1f}" width="420" height="20.6" fill="{depth_tint(i * 530)}"/>' for i in range(12))}<rect x="0" y="4" width="420" height="7" fill="{GREEN}"/></svg>
      <div style="position:absolute;left:28px;top:30px;width:170px">{svg('suds-enviro-horizontal-colour.svg')}</div>
      <div class="mono" style="position:absolute;right:28px;top:34px;font-size:8px;color:{DEEP};text-align:right;line-height:1.7">QUOTATION<br>REF Q-0000<br>DATE __ / __ / ____</div>
      <div style="position:absolute;left:28px;top:150px"><div class="mono" style="font-size:8px;letter-spacing:.14em;color:{BLUE}">PREPARED FOR</div><div style="font:800 26px/1.05 var(--display);color:{DEEP};margin-top:6px;text-transform:uppercase">Project name<br><span style="font-weight:300;color:{FIELD}">Site address</span></div></div>
      <div class="two" style="position:absolute;left:28px;bottom:40px;font-size:22px"><span class="lt" style="color:#fff">Every drop,</span><br><b style="color:#fff">accounted for.</b></div></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">4500 mm <span style="color:{DEEP}">/</span> Desk pieces</p>
  <div style="display:flex;gap:40px;margin-top:10px">
    <div style="display:flex;flex-direction:column;gap:26px">
      <h2 class="two h2"><span class="lt">Cards, quotes</span> <b>and the inbox</b></h2>
      <div style="display:flex;gap:22px">{front}{back}</div>
      {sig}
      <div style="width:740px;height:120px;background:{DEEP};position:relative;overflow:hidden"><div style="position:absolute;left:26px;top:30px;width:200px">{svg('suds-enviro-horizontal-reversed.svg')}</div><div class="mono" style="position:absolute;left:26px;bottom:18px;font-size:10px;color:{SKY};letter-spacing:.14em">RHINO NEWS · OCTOBER</div><div style="position:absolute;right:0;top:0;width:300px;height:120px">{bands(300, 120)}</div></div>
      <p class="cap" style="max-width:700px">Cards 85 x 55 mm, uncoated 450 gsm. The back carries the cut. The quote cover uses the same cut at the foot of the page, with fields for the project, never a stock photo. The name and number shown are SuDS Enviro's primary contact and sales line.</p>
    </div>
    {quote}
  </div>
</div>'''
    page('print', body, surf=True)

def brochure():
    cover = f'''<div style="width:420px;height:594px;background:{INVERT};position:relative;overflow:hidden;box-shadow:0 18px 40px -20px rgba(0,40,60,.6);flex:none">
      <img src="{img('../photography/hero/hero-4-dusk.jpg', 900)}" style="position:absolute;left:0;top:0;width:100%;height:330px;object-fit:cover" alt="">
      <div style="position:absolute;left:0;top:322px;width:100%;height:8px;background:{GREEN}"></div>
      <div style="position:absolute;left:26px;top:28px;width:150px">{svg('suds-enviro-horizontal-white.svg')}</div>
      <div class="two" style="position:absolute;left:26px;top:360px;font-size:40px"><span class="lt" style="color:{GREEN}">The</span><br><b style="color:#fff">RHINO range</b></div>
      <p style="position:absolute;left:26px;top:470px;width:300px;font:500 12px/1.45 var(--display);color:#dcebf3;margin:0">Chambers, catchpits, separators, flow control and pumping stations. From roof to river.</p>
      <div class="mono" style="position:absolute;left:26px;bottom:22px;font-size:8px;color:{SKY};letter-spacing:.14em">PRODUCT GUIDE · EDITION 1</div></div>'''
    spread = f'''<div style="width:600px;height:424px;background:#fff;position:relative;overflow:hidden;box-shadow:0 18px 40px -20px rgba(0,40,60,.45);display:grid;grid-template-columns:1fr 1fr">
      <div style="padding:22px;border-right:1px solid rgba(0,85,118,.1)"><div class="mono" style="font-size:7.5px;letter-spacing:.14em;color:{BLUE}">SEPARATE / STORMWATER TREATMENT</div><div class="two" style="font-size:22px;margin-top:6px"><span class="lt">SudSceptor</span><br><b>separators</b></div>
        <p style="font:400 9px/1.5 var(--display);color:{DEEP};margin-top:10px">Removes over 50% of fine suspended solids, 0 to 200 microns, at design flows, and up to 99% of coarse solids of 0.1 to 0.4 mm.</p>
        <img src="{img('../photography/catalogue/sehds1800.jpg', 400)}" style="width:170px;margin-top:6px" alt=""></div>
      <div style="background:{SURFACE};position:relative"><img src="{img('../photography/xray/sehds1800.png', 600, 'webp')}" style="position:absolute;left:30px;top:20px;width:240px" alt="">
        <div class="mono" style="position:absolute;left:20px;bottom:16px;font-size:7.5px;color:{DEEP};line-height:1.6">SEHDS750 to SEHDS3000<br>TSS 0.5 · metals 0.40 · hydrocarbons 0.40</div></div></div>'''
    label = f'''<div style="width:400px;height:240px;background:#fff;position:relative;overflow:hidden;border-radius:6px;box-shadow:0 14px 30px -18px rgba(0,40,60,.5);border:1px solid rgba(0,85,118,.15)">
      <div style="position:absolute;left:0;top:0;width:100%;height:46px;background:{DEEP};display:flex;align-items:center;padding:0 18px;justify-content:space-between"><div style="width:130px">{svg('suds-enviro-horizontal-reversed.svg')}</div><span class="mono" style="font-size:9px;color:{SKY}">CHAMBER LABEL</span></div>
      <div style="position:absolute;left:18px;top:60px"><div class="mono" style="font-size:22px;font-weight:600;color:{DEEP}">SERSIC600</div>
        <div class="mono" style="font-size:10px;line-height:1.85;color:{DEEP};margin-top:4px">Ø600 mm · depth ______ mm<br>Inlets 3 · 6 · 9 &nbsp; Outlet 12<br>Made ___ / ___ / ______<br>No. ____________</div></div>
      <div style="position:absolute;right:112px;top:60px">{clock_plan(inlets=(3, 6, 9), r=26, labels=False)}</div>
      <div style="position:absolute;right:18px;top:62px">{qr_svg('https://www.sudsenviro.com/products/inspection-chamber', 84)}</div>
      <div class="mono" style="position:absolute;right:18px;top:152px;font-size:7.5px;color:{DEEP};width:84px;text-align:center">Data sheet</div>
      <div style="position:absolute;left:0;bottom:0;width:100%;height:9px;display:flex"><i style="flex:24;background:{GREEN}"></i><i style="flex:42;background:{BLUE}"></i><i style="flex:10;background:{GREEN}"></i><i style="flex:24;background:{RED}"></i></div></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">4500 mm <span style="color:{DEEP}">/</span> Product guide and the chamber label</p>
  <div style="display:flex;gap:36px;margin-top:10px;zoom:1.07">
    {cover}
    <div style="display:flex;flex-direction:column;gap:26px">{spread}
      <div style="display:flex;gap:24px;align-items:flex-start">{label}<p class="small" style="max-width:220px;margin:0">A weatherproof label on every chamber, filled in at the factory. Site teams quote the code when they ring, and the QR opens the data sheet. The bands along the foot are the drop laid flat.</p></div></div>
  </div>
</div>'''
    page('print', body, surf=True)

# ---------------------------------------------------------------- made things
def van():
    # Long wheelbase panel van, side elevation, drawn in mm at 1:20 (1px = 20mm)
    W = 5980 / 20 * 3.0; H = 2550 / 20 * 3.0
    s = 0.135
    def X(mm): return 40 + mm * s
    def Y(mm): return 40 + (2550 - mm) * s
    body_d = f'M{X(300)} {Y(450)} L{X(300)} {Y(2350)} Q{X(320)} {Y(2550)} {X(600)} {Y(2550)} L{X(4700)} {Y(2550)} Q{X(5000)} {Y(2540)} {X(5150)} {Y(2300)} L{X(5650)} {Y(1350)} Q{X(5900)} {Y(1250)} {X(5930)} {Y(1000)} L{X(5960)} {Y(500)} L{X(300)} {Y(450)} Z'
    cargo_end = 4550
    strata = ''.join(f'<rect x="{X(300)}" y="{Y(1250) + i * 13:.1f}" width="{X(cargo_end) - X(300):.1f}" height="13.6" fill="{depth_tint(500 + i * 600)}"/>' for i in range(10))
    svgv = f'''<svg viewBox="0 0 {X(6100):.0f} {Y(-60):.0f}" width="{X(6100):.0f}" height="{Y(-60):.0f}">
  <defs><clipPath id="vanclip"><path d="{body_d}"/></clipPath></defs>
  <path d="{body_d}" fill="#fff"/>
  <g clip-path="url(#vanclip)">{strata}<rect x="{X(300)}" y="{Y(1250) - 7:.1f}" width="{X(cargo_end) - X(300):.1f}" height="8" fill="{GREEN}"/>
    <rect x="{X(cargo_end)}" y="{Y(2550)}" width="{X(6000) - X(cargo_end):.1f}" height="{Y(450) - Y(2550):.1f}" fill="{DEEP}"/></g>
  <path d="M{X(4750)} {Y(2250)} L{X(5120)} {Y(2250)} L{X(5560)} {Y(1450)} L{X(4750)} {Y(1450)} Z" fill="{INVERT}" opacity=".85"/>
  <path d="{body_d}" fill="none" stroke="{INK}" stroke-width="2"/>
  <line x1="{X(cargo_end)}" y1="{Y(2500)}" x2="{X(cargo_end)}" y2="{Y(480)}" stroke="{INK}" stroke-width="1" opacity=".5"/>
  <line x1="{X(2550)}" y1="{Y(2450)}" x2="{X(2550)}" y2="{Y(480)}" stroke="{INK}" stroke-width="1" opacity=".3"/>
  {''.join(f'<circle cx="{X(cx)}" cy="{Y(350)}" r="{350 * s * 1.1:.1f}" fill="{INK}"/><circle cx="{X(cx)}" cy="{Y(350)}" r="{180 * s:.1f}" fill="#9fb0ba"/>' for cx in (1150, 4950))}
  <rect x="0" y="{Y(0)}" width="{X(6100):.0f}" height="2" fill="{DEEP}" opacity=".4"/>
  <foreignObject x="{X(500)}" y="{Y(2350)}" width="{X(2600) - X(500):.0f}" height="90"><div xmlns="http://www.w3.org/1999/xhtml">{svg('suds-enviro-horizontal-colour.svg')}</div></foreignObject>
  <foreignObject x="{X(500)}" y="{Y(1150)}" width="{X(4400) - X(500):.0f}" height="60"><div xmlns="http://www.w3.org/1999/xhtml" class="two" style="font-size:34px"><span class="lt" style="color:#fff">Every drop,</span> <b style="color:#fff">accounted for.</b></div></foreignObject>
  <text x="{X(500)}" y="{Y(1450)}" font-family="Plex Mono" font-size="14" fill="{DEEP}">01224 057 700 · sudsenviro.com</text>
  <g transform="translate({X(3300)} {Y(2420)})">{clock_plan(inlets=(3, 5, 6, 7, 9), r=46, standalone=False, cx=60, cy=60, labels=False)}</g>
</svg>'''
    body = opener_panel('made', 'Concepts for the things that get made: drawn for OneSign (vehicles, signs, hoardings) and OneLaser (etched and cut pieces).') + f'''
<div class="abs" style="left:350px;top:470px">{svgv}</div>
<p class="abs cap" style="left:360px;top:868px;width:880px">Van side, long wheelbase panel van, drawn to scale. The cut runs the length of the load area, green turf line at mid-height, darkening to the sills. Concept for OneSign; templates to be taken from the actual vehicle.</p>'''
    page('made', body, cls='opener')

def site_things():
    hoarding = f'''<div style="width:680px;height:346px;background:#fff;position:relative;overflow:hidden;outline:1px solid rgba(0,85,118,.2)">
      <svg width="680" height="346" style="position:absolute;inset:0">{''.join(f'<rect x="0" y="{150 + i * 17:.1f}" width="680" height="17.6" fill="{depth_tint(250 + i * 560)}"/>' for i in range(12))}<rect x="0" y="144" width="680" height="8" fill="{GREEN}"/>
        <rect x="470" y="140" width="64" height="206" fill="#fff" opacity=".92"/><rect x="465" y="140" width="5" height="206" fill="{DEEP}"/><rect x="534" y="140" width="5" height="206" fill="{DEEP}"/><rect x="452" y="132" width="100" height="8" fill="{INK}"/></svg>
      <div style="position:absolute;left:28px;top:26px;width:260px">{svg('suds-enviro-horizontal-colour.svg')}</div>
      <div class="mono" style="position:absolute;right:28px;top:30px;font-size:11px;color:{DEEP};text-align:right;line-height:1.7">Drainage on this site<br>01224 057 700</div>
      <div class="two" style="position:absolute;left:28px;top:210px;font-size:38px"><span class="lt" style="color:#fff">Working</span><br><b style="color:#fff">below ground</b></div></div>'''
    vest = f'''<svg width="250" height="300" viewBox="0 0 250 300"><path d="M60 20 L100 10 Q125 40 150 10 L190 20 L230 70 L215 290 L35 290 L20 70 Z" fill="#e8ff3a"/><rect x="28" y="160" width="194" height="22" fill="#cfd8dc"/><rect x="31" y="215" width="188" height="22" fill="#cfd8dc"/>
      <foreignObject x="70" y="70" width="110" height="80"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:28px">{svg('suds-drop-deep.svg')}</div><div style="font:800 13px var(--display);color:{DEEP};letter-spacing:.06em">SuDS ENVIRO</div></div></foreignObject></svg>'''
    sign = f'''<div style="width:330px;height:300px;background:#e9edef;position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:linear-gradient(180deg,#f3f5f6,#dde3e6)"></div>
      <div style="position:absolute;left:50px;top:70px;width:230px;filter:drop-shadow(6px 10px 6px rgba(0,30,45,.28))">{svg('suds-enviro-horizontal-colour.svg')}</div>
      <div class="mono" style="position:absolute;left:50px;top:150px;font-size:10px;color:{DEEP};letter-spacing:.14em">BESPOKE, STANDARDISED</div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:52px;background:#c9a77d"></div></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">5000 mm <span style="color:{DEEP}">/</span> On site and at the office</p>
  <div style="display:grid;grid-template-columns:680px 1fr;gap:30px;margin-top:10px">
    <div>{hoarding}<p class="cap" style="margin-top:8px">Heras fence banner, 3400 x 1730 mm, for sites where SuDS Enviro products are going in. Mesh PVC, eyelets every 500 mm. The chamber in the cut stands where the work is. OneSign.</p></div>
    <div><div style="display:flex;justify-content:center;background:{SURFACE};padding:20px 0">{vest}</div><p class="cap" style="margin-top:8px">Hi-vis vest, back print. The drop and the name in Deep, one colour, heat transfer. Above the reflective bands only.</p></div>
  </div>
  <div style="display:grid;grid-template-columns:330px 1fr;gap:30px;margin-top:24px;align-items:start">
    {sign}
    <div><h3 class="two h3"><span class="lt">Reception</span> <b>wall</b></h3><p class="small" style="margin-top:10px">The horizontal lockup in built-up acrylic letters, 10 mm thick, on 25 mm stand-offs, colours matched to Blue, Green and Red by sample. The slogan below in cut vinyl, Deep. About 1500 mm wide for a typical reception wall. Concept for OneSign; sizes to follow a survey.</p>
    <p class="small">Rule that applies to all made things: colours are matched to a physical sample before production, and the logo is cut from the vector master, never traced.</p></div>
  </div>
</div>'''
    page('made', body)

def laser():
    plate = f'''<div style="width:340px;height:340px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f4f6f7,#b9c2c7 55%,#8e999f);position:relative;box-shadow:0 18px 30px -16px rgba(0,30,45,.6),inset 0 0 0 6px rgba(255,255,255,.35)">
      <div style="position:absolute;inset:26px;opacity:.82;mix-blend-mode:multiply">{svg('suds-clockwork-seal-line.svg').replace(DEEP, '#2a3338')}</div></div>'''
    tag = f'''<div style="width:300px;height:150px;border-radius:10px;background:linear-gradient(135deg,#e9edef,#aeb8bd);position:relative;box-shadow:0 14px 26px -14px rgba(0,30,45,.6)">
      <div style="position:absolute;left:14px;top:14px;width:10px;height:10px;border-radius:50%;background:#7d898f"></div><div style="position:absolute;right:14px;top:14px;width:10px;height:10px;border-radius:50%;background:#7d898f"></div>
      <div style="position:absolute;left:26px;top:34px;width:150px;opacity:.85">{svg('suds-enviro-horizontal-black.svg').replace('#000000', '#2a3338')}</div>
      <div class="mono" style="position:absolute;left:26px;top:72px;font-size:13px;color:#2a3338;font-weight:600">SEHDS1800</div>
      <div class="mono" style="position:absolute;left:26px;top:94px;font-size:9.5px;color:#2a3338;line-height:1.6">Inlet Ø___ · Outlet Ø___<br>Service: lift out silt at ___ mm</div></div>'''
    cut = f'''<div style="width:300px;height:300px;background:#2b2f31;position:relative;display:flex;align-items:center;justify-content:center"><div style="width:220px;filter:drop-shadow(0 6px 4px rgba(0,0,0,.5))">{svg('suds-drop-white.svg').replace('#ffffff', '#c8cfd3')}</div></div>'''
    body = f'''
<div class="area">
  <p class="eyebrow">5000 mm <span style="color:{DEEP}">/</span> Etched and cut, for OneLaser</p>
  <h2 class="two h2"><span class="lt">Pieces that</span> <b>outlast the paperwork</b></h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:34px;margin-top:30px;align-items:start">
    <div><div style="height:470px;display:flex;align-items:center;justify-content:center;background:{SURFACE}">{plate}</div><p class="small" style="margin-top:12px"><b>The Clockwork seal</b>, fibre-laser etched into 300 mm brushed stainless. For the reception wall, awards, and the first chamber off a new line. The seal's type is already outlined, so no fonts are needed.</p></div>
    <div><div style="height:470px;display:flex;align-items:center;justify-content:center;background:{SURFACE}">{tag}</div><p class="small" style="margin-top:12px"><b>The service plate</b>, etched stainless riveted inside the access opening of separators and pumping stations. The code, the pipe sizes and the one maintenance number a service engineer needs.</p></div>
    <div><div style="height:470px;display:flex;align-items:center;justify-content:center;background:{SURFACE}">{cut}</div><p class="small" style="margin-top:12px"><b>The drop, cut</b> from 6 mm aluminium in four pieces, one per band, mounted 4 mm apart so the layers read in shadow. Powder coated, or left brushed for the factory.</p></div>
  </div>
  <p class="cap" style="margin-top:22px">Laser and etched pieces use the one-colour logo files (black and deep). The bands stay in their order even in one colour.</p>
</div>'''
    page('made', body)

# ---------------------------------------------------------------- motion
def motion():
    frames = sorted(glob.glob(os.path.join(HERE, '..', 'film', 'stills', 'still-*.jpg')))
    caps = ['Rain on the turf line', 'The drop\'s bands wash past, scene to scene', 'Down the shaft, the gauge counts', 'Five ways in', 'The bands settle, the wordmark rises', 'Every drop, accounted for']
    if frames:
        cells = ''.join(f'<figure style="margin:0;min-width:0"><img src="{img(os.path.relpath(f, os.path.join(HERE, "..")), 700, q=82)}" style="width:100%;aspect-ratio:16/9;object-fit:cover" alt=""><figcaption class="cap" style="margin-top:6px">{i + 1:02d} · {caps[i] if i < len(caps) else ""}</figcaption></figure>' for i, f in enumerate(frames[:6]))
    else:
        cells = ''
    body = opener_panel('motion', 'A 36 second identity film, built as one page and rendered frame by frame. The camera only ever moves down.') + f'''
<div class="abs grid" style="left:360px;right:136px;top:520px;grid-template-columns:repeat(3,1fr);gap:16px 18px">{cells}</div>
<div class="abs" style="left:960px;right:136px;top:100px">
  <table style="font-size:13px">
    <tr><th>Rule</th><th>Value</th></tr>
    <tr><td>Tempo</td><td class="num">100 bpm, cuts on the beat</td></tr>
    <tr><td>Camera</td><td class="num">Down only. Never up, never sideways</td></tr>
    <tr><td>Type</td><td class="num">Soft rise 12 px, 600 ms, ease out</td></tr>
    <tr><td>Drop</td><td class="num">Bands settle bottom first, 220 ms apart</td></tr>
    <tr><td>Transitions</td><td class="num">Water only: ripples, a wave of the four bands, a wash, a rising level</td></tr>
    <tr><td>Grain</td><td class="num">Light and even, screen only</td></tr>
    <tr><td>Formats</td><td class="num">16:9 and 9:16, laid out again for each</td></tr>
  </table>
</div>'''
    page('motion', body, cls='opener')

# ---------------------------------------------------------------- files
def files():
    names = sorted(os.listdir(os.path.join(HERE, '..', '..', 'logos')))
    svgs = [n for n in names if n.endswith('.svg') and not n.startswith('line-')]
    tiles = ''
    for n in svgs:
        dark = any(k in n for k in ['reversed', 'white'])
        bg = DEEP if dark else '#ffffff'
        sv = svg(n).replace('<svg ', '<svg style="max-width:100%;max-height:68px" ')
        tiles += f'<div style="min-width:0"><div style="height:92px;background:{bg};display:flex;align-items:center;justify-content:center;padding:12px">{sv}</div><div class="mono" style="font-size:9.5px;color:{SKY};margin-top:5px;word-break:break-all">{n}</div></div>'
    body = f'''
<div class="area">
  <p class="eyebrow">6000 mm <span style="color:{SKY}">/</span> The files</p>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:30px">
    <h2 class="two h2"><span class="lt">Everything,</span> <b>at the bottom of the range</b></h2>
    <p class="small" style="max-width:520px;margin:0">Every mark below is in <span class="mono">brand-pack/logos</span> as SVG and as a transparent PNG at 2400 px. Type in the seal is converted to outlines, so sign makers and lasers need no fonts.</p>
  </div>
  <div class="grid" style="grid-template-columns:repeat(6,1fr);gap:14px 14px;margin-top:22px">{tiles}</div>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:24px;margin-top:22px">
    <p class="small"><b>brand-book.html</b> and <b>brand-book.pdf</b>: this book.</p>
    <p class="small"><b>film/</b>: the identity film, 16:9 and 9:16, 60 fps.</p>
    <p class="small"><b>photography/</b>: catalogue set and hero set.</p>
    <p class="small"><b>src/</b>: every script that made this pack, so it can be rebuilt.</p>
  </div>
</div>'''
    page('files', body, dark=True)

def sump():
    body = f'''
<img class="abs" src="{img('../photography/hero/hero-6-outfall.jpg', 1800)}" style="left:0;top:0;width:1400px;height:990px;object-fit:cover;object-position:50% 40%" alt="A clean outfall into a beck">
<div class="abs" style="left:0;top:0;width:1400px;height:990px;background:linear-gradient(180deg,rgba(6,42,58,.55) 0%,rgba(6,42,58,0) 26%,rgba(6,42,58,0) 38%,rgba(6,42,58,.82) 62%,{INVERT} 84%)"></div>
<div class="abs" style="left:64px;top:56px;width:300px">{svg('suds-enviro-horizontal-white.svg')}</div>
<div class="abs mono" style="right:136px;top:62px;text-align:right;font-size:11px;letter-spacing:.14em;line-height:1.8;color:#fff;text-transform:uppercase">From roof to river<br><span style="color:{SKY}">The outfall</span></div>
<div class="abs" style="left:64px;top:590px;width:1000px">
  <h2 class="two" style="font-size:96px;line-height:.92;text-wrap:nowrap"><span class="lt" style="color:{GREEN}">Every drop,</span><br><b style="color:#fff">accounted for.</b></h2>
  <div style="margin-top:26px;font:700 15px var(--display);letter-spacing:.16em;text-transform:uppercase;color:{SKY}">Bespoke, <i>standardised</i></div>
</div>
<div class="abs" style="right:136px;top:600px;width:200px">{svg('suds-clockwork-seal-filled-deep.svg')}</div>
<div class="abs mono" style="left:64px;right:136px;bottom:44px;display:flex;justify-content:space-between;gap:30px;font-size:10.5px;color:{SKY};letter-spacing:.08em;border-top:1px solid rgba(175,219,244,.22);padding-top:14px">
  <span>SuDS Enviro Ltd · 9 Ambleside Court, Chester-le-Street DH3 2EB</span><span>01224 057 700 · sales@sudsenviro.com · sudsenviro.com</span><span>Brand book, edition 1, October 2026</span></div>
<div class="abs" style="left:0;bottom:0;width:1400px;height:10px;display:flex"><i style="flex:24;background:{GREEN}"></i><i style="flex:42;background:{BLUE}"></i><i style="flex:10;background:{GREEN}"></i><i style="flex:24;background:{RED}"></i></div>'''
    page('sump', body, dark=True, head=False)

def build():
    screen_opener(); screen_site(); screen_phones(); social()
    print_opener(); cards(); brochure()
    site_things(); laser()
    motion(); files(); sump()
