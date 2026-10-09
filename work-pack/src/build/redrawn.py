"""Work pack 01, REDRAWN: the SuDS Enviro data sheets, then and now."""
from kit import *

T = 'Redrawn'
pages = []
P = pages.append

d23_1800 = 'drive/DATA_SHEET_SEHDS1800.png'
d23_1200 = 'drive/SEHDS1200_HYDRODYNAMIC_DATA_SHEET_REV_A.png'
d25_1800 = 'drive/SEHDS_1800_Data_Sheet.png'
d25_1200 = 'drive/SEHDS_1200_Data_Sheet.png'
dw_450 = 'drive/SERSIC450225-2.png'
dw_1200 = 'drive/SERSIC1200110-600_RANGE.png'
dw_750 = 'drive/SEHDS750150-12-5-3.5.png'
w = lambda n, p: f'sheets/{n}-p{p}.png'


def stage(label, year, src, h, note, dark=True, tag_bg=None):
    tb = tag_bg or (RED if year.startswith('2021') or year.startswith('2022') or year.startswith('2023') else BLUE if year == '2025' else GREEN)
    return f'''<div style="display:flex;flex-direction:column;align-items:flex-start">
  <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:14px"><span style="font-weight:800;font-size:44px;letter-spacing:-.02em">{year}</span><span class="tag" style="background:{tb};color:#fff">{label}</span></div>
  <img class="sheet" src="{img(src, 1100)}" style="height:{h}px" alt="">
  <p class="cap" style="margin-top:12px;max-width:{int(h*.72)}px">{note}</p></div>'''


# 01 cover ---------------------------------------------------------------
P(f'''<section class="pg dark grid">{gauge(True, .72)}
<img class="abs sheet" src="{img(d23_1800, 1100)}" style="left:1110px;top:100px;width:380px;transform:rotate(-4deg);filter:grayscale(.6) brightness(.8);opacity:.75" alt="">
<img class="abs sheet" src="{img(w('rhino-sehds', 1), 1200)}" style="left:1190px;top:190px;width:380px;transform:rotate(2.5deg)" alt="">
<p class="abs eyebrow" style="left:110px;top:110px">Work pack 01 / Data sheets</p>
<h1 class="abs" style="left:100px;top:300px;font-size:236px;letter-spacing:-.045em;color:#fff">RE<br>DRAWN<span style="color:{GREEN}">.</span></h1>
<p class="abs" style="left:110px;top:800px;width:620px;font-size:22px;line-height:1.4;color:#dcebf3"><span style="font-weight:800">The SuDS Enviro data sheets, 2021 to 2026.</span> <span class="light">What they were, what they are now, and the sheet that now draws itself.</span></p>
<p class="abs mono" style="left:110px;bottom:40px;color:#8fb3c6;font-size:11px">Edition 1 / October 2026 / For SuDS Enviro</p>
</section>''')

# 02 four editions -------------------------------------------------------
eds = [
    ('2021 to 2023', 'Supplied', d23_1800, RED, 'Drawing packs from AutoCAD 2017 and Inventor 2023. Data sheets assembled in Adobe Express, Nov 2023.', 'Bitmap drawings, pasted title bars'),
    ('2025', 'First pass', d25_1800, BLUE, 'Rebuilt in Illustrator, June and July 2025, on one template with the RHINO lockup.', 'One masthead, typeset tables'),
    ('2026', 'Redrawn', w('rhino-sehds', 1), GREEN, '14 sheets written as web pages that print to A4. Every drawing redrawn in vector from the drawing packs.', 'Vector drawings, one system'),
    ('2026+', 'Generated', 'gen/SERSIC1050-3000-S104-5-inlets-p1.png', DEEP, 'The configurator writes a project sheet from the customer’s own choices, checked against the rules.', 'Drawn to order'),
]
cols = ''.join(f'''<div style="border-top:4px solid {c};padding-top:22px">
  <div style="font-weight:800;font-size:{56 if len(y) < 8 else 40}px;letter-spacing:-.03em;line-height:1;height:60px">{y}</div>
  <p class="eyebrow" style="color:{c};margin:10px 0 20px">{l}</p>
  <div style="height:330px;display:flex;align-items:flex-start"><img class="sheet" src="{img(s, 800)}" style="max-height:330px;max-width:300px" alt=""></div>
  <p class="small" style="margin-top:22px">{d}</p>
  <p class="cap" style="margin-top:10px">{k}</p></div>''' for y, l, s, c, d, k in eds)
P(f'''<section class="pg">{gauge(False, .1)}
<p class="abs eyebrow" style="left:110px;top:90px">Four editions of one sheet</p>
<h2 class="abs" style="left:108px;top:125px;font-size:64px;color:{DEEP}">Same products.<br><span class="light" style="color:{BLUE}">A new drawing office.</span></h2>
<div class="abs" style="left:110px;right:80px;top:330px;display:grid;grid-template-columns:repeat(4,1fr);gap:36px">{cols}</div>
<p class="abs cap" style="left:110px;top:282px">Dates and software from each file’s own metadata.</p>
{folio(2, T)}</section>''')

# 03 SEHDS1800 three stages ----------------------------------------------
P(f'''<section class="pg dark grid">{gauge(True, .3)}
<p class="abs eyebrow" style="left:110px;top:80px">01 / SudSceptor SEHDS1800</p>
<h2 class="abs" style="left:108px;top:112px;font-size:58px">Three sheets. <span class="light" style="color:{SKY}">One separator.</span></h2>
<div class="abs" style="left:110px;right:70px;top:240px;display:flex;gap:46px;align-items:flex-start">
{stage('Supplied', '2023', d23_1800, 580, 'Adobe Express, November 2023. One page.')}
{stage('First pass', '2025', d25_1800, 580, 'Illustrator, June 2025. One page.')}
{stage('Redrawn', '2026', w('rhino-sehds', 1), 580, 'Web sheet, page 1 of 4. Covers SEHDS750 to SEHDS3000.')}
</div>{folio(3, T, True)}</section>''')

# 04 redline 2023 --------------------------------------------------------
marks23 = [(.405, .05, .66, .145), (.677, .145, .939, .17, 2), (.697, .334, .959, .359, 2), (.007, .06, .38, .475, 3), (.745, .69, .97, .765, 4)]
P(f'''<section class="pg dark grid">{gauge(True, .4)}
<div class="abs" style="left:110px;top:70px">{callouts(img(d23_1800, 1400), 610, marks23)}</div>
<p class="abs eyebrow" style="left:800px;top:90px">Redline / the 2023 sheet as supplied</p>
<h2 class="abs" style="left:798px;top:124px;font-size:54px;width:720px">What the old sheet<br><span class="light" style="color:{SKY}">was telling people.</span></h2>
<ol class="abs notes" style="left:800px;top:300px;width:690px;color:#dcebf3">
<li><b>The brand, written two ways</b>“Suds Enviro” in the title, “SuDS Enviro” in the logo beside it.</li>
<li><b>A title bar pasted twice</b>“DATA SHEET SEHDS1800” appears twice, both times as a low-resolution screenshot with JPEG blocking around the letters.</li>
<li><b>A drawing at 222 × 349 pixels</b>The elevation is a small bitmap stretched to a third of the page. Dimensions blur when printed.</li>
<li><b>Figures with typos in them</b>“1027 litires” in the technical data. The 3740 mm overall height does not match the 4290 mm on the later sheets.</li>
</ol>
<p class="abs cap" style="left:800px;bottom:80px;width:640px">Shown untouched, as supplied. Redlines mark what a specifier would notice, not the engineering, which belongs to SuDS Enviro.</p>
{folio(4, T, True)}</section>''')

# 05 green 2026 ----------------------------------------------------------
marks26 = [(.04, .015, .45, .125), (.66, .145, .97, .42), (.045, .435, .6, .53), (.655, .445, .95, .72), (.03, .945, .7, .985)]
P(f'''<section class="pg">{gauge(False, .5)}
<p class="abs eyebrow" style="left:110px;top:90px">Greenline / the 2026 sheet</p>
<h2 class="abs" style="left:108px;top:124px;font-size:54px;width:720px;color:{DEEP}">What the new sheet<br><span class="light" style="color:{BLUE}">does instead.</span></h2>
<ol class="abs notes g" style="left:110px;top:300px;width:690px">
<li><b>One masthead, one name</b>Product, family and code in a single set of type. SudSceptor, SEHDS750 to SEHDS3000.</li>
<li><b>Drawn, not pasted</b>Elevations redrawn in vector from SuDS Enviro’s own drawing packs, dimensioned in millimetres and marked not to scale.</li>
<li><b>Tables you can read</b>Mitigation indices set as a table, with the footnotes written out in full.</li>
<li><b>The blue pane, kept</b>Features and benefits stay in the blue pane SuDS customers already know.</li>
<li><b>Prints from the website</b>Each sheet is a page on the site that prints to four A4 pages, so the web and the PDF never drift apart.</li>
</ol>
<div class="abs" style="left:880px;top:70px">{callouts(img(w('rhino-sehds', 1), 1400), 610, marks26, green=True)}</div>
{folio(5, T)}</section>''')

# 06 drawing close-up ----------------------------------------------------
old_draw = img(d23_1800, 900, box=(.007, .06, .38, .475))
old_zoom = img(d23_1800, 600, box=(.2, .045, .32, .11), q=90)
svg = repo('public/brochures/drawings/sehds/sehds1800-elev.svg')
P(f'''<section class="pg dark grid">{gauge(True, .55)}
<p class="abs eyebrow" style="left:110px;top:80px">The drawing, up close</p>
<h2 class="abs" style="left:108px;top:112px;font-size:58px">Same unit. <span class="light" style="color:{SKY}">New line.</span></h2>
<div class="abs" style="left:110px;top:240px;width:380px;height:600px;background:#fff;display:flex;align-items:center;justify-content:center"><img src="{old_draw}" style="max-width:360px;max-height:580px;image-rendering:auto" alt=""></div>
<div class="abs" style="left:520px;top:240px;width:260px;height:260px;background:#fff;overflow:hidden;border:3px solid {RED}"><img src="{old_zoom}" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated" alt=""></div>
<p class="abs cap" style="left:520px;top:516px;width:260px">2023, enlarged. The bitmap breaks up before the numbers can be read.</p>
<div class="abs" style="left:830px;top:240px;width:380px;height:600px;background:#fff;display:flex;align-items:center;justify-content:center;padding:18px"><img src="{svg}" style="max-width:100%;max-height:100%" alt=""></div>
<div class="abs" style="left:1240px;top:240px;width:260px;height:260px;background:#fff;overflow:hidden;border:3px solid {GREEN}"><img src="{svg}" style="width:900px;margin:-60px 0 0 -330px" alt=""></div>
<p class="abs cap" style="left:1240px;top:516px;width:260px">2026, enlarged. Vector, so it holds at any size.</p>
<div class="abs" style="left:110px;top:862px;display:flex;gap:430px"><span class="tag" style="background:{RED};color:#fff">2023 / bitmap, 222 × 349 px</span><span class="tag" style="background:{GREEN};color:#fff">2026 / vector, from the drawing pack</span></div>
{folio(6, T, True)}</section>''')

# 07 SEHDS1200 -----------------------------------------------------------
P(f'''<section class="pg dark grid">{gauge(True, .62)}
<p class="abs eyebrow" style="left:110px;top:80px">02 / SudSceptor SEHDS1200</p>
<h2 class="abs" style="left:108px;top:112px;font-size:58px">Rev A to <span class="light" style="color:{SKY}">the whole range.</span></h2>
<div class="abs" style="left:110px;right:70px;top:240px;display:flex;gap:46px;align-items:flex-start">
{stage('Supplied', '2023', d23_1200, 580, 'Rev A, Adobe Express, November 2023. “415itires” in the storage data.')}
{stage('First pass', '2025', d25_1200, 580, 'Illustrator, July 2025. One sheet per size.')}
{stage('Redrawn', '2026', w('rhino-sehds', 4), 580, 'Page 4 of the range sheet. Every size side by side in one table.')}
</div>{folio(7, T, True)}</section>''')

# 08 the 2025 pass, honestly --------------------------------------------
marks25 = [(.095, .32, .17, .345), (.065, .53, .42, .56), (.065, .598, .42, .628, 2)]
P(f'''<section class="pg">{gauge(False, .66)}
<div class="abs" style="left:110px;top:70px">{callouts(img(d25_1800, 1400), 610, marks25)}</div>
<p class="abs eyebrow" style="left:800px;top:90px">Redline / the 2025 first pass</p>
<h2 class="abs" style="left:798px;top:124px;font-size:54px;width:720px;color:{DEEP}">The step between,<br><span class="light" style="color:{BLUE}">checked the same way.</span></h2>
<ol class="abs notes" style="left:800px;top:300px;width:690px">
<li><b>NUDEP for NJDEP</b>The compliance line reads “NUDEP 2015 &amp; 2020”. The 2026 sheet spells it correctly.</li>
<li><b>One heading, used twice</b>“Dimensional &amp; storage data” heads both blocks, though one of them holds flow rates and head loss.</li>
</ol>
<ol class="abs notes g" style="left:800px;top:560px;width:690px">
<li><b>What it got right</b>One masthead with the RHINO lockup, the blue features pane, and typeset tables. The 2026 sheets kept all three.</li>
</ol>
{folio(8, T)}</section>''')

# 09 drawing packs to sheets ---------------------------------------------
P(f'''<section class="pg dark grid">{gauge(True, .72)}
<p class="abs eyebrow" style="left:110px;top:80px">03 / RHINO SERSIC and SudSceptor SEHDS750</p>
<h2 class="abs" style="left:108px;top:112px;font-size:58px">From drawing pack <span class="light" style="color:{SKY}">to data sheet.</span></h2>
<div class="abs" style="left:110px;top:220px;display:grid;grid-template-columns:auto auto auto;gap:16px 30px;align-items:start">
  <div><span class="tag" style="background:{RED};color:#fff">2022 / Inventor</span><img class="sheet" src="{img(dw_450, 1200)}" style="width:400px;margin-top:10px" alt=""><p class="cap" style="margin-top:8px">SERSIC450, drawing pack sheet. A3, third angle.</p></div>
  <div><span class="tag" style="background:{RED};color:#fff">2023 / Inventor</span><img class="sheet" src="{img(dw_1200, 1200)}" style="width:400px;margin-top:10px" alt=""><p class="cap" style="margin-top:8px">SERSIC1200 range. 35 model codes in one table.</p></div>
  <div style="grid-row:span 2"><span class="tag" style="background:{GREEN};color:#fff">2026</span><div style="display:flex;gap:14px;margin-top:10px"><img class="sheet" src="{img(w('rhino-sersic', 1), 900)}" style="width:250px" alt=""><img class="sheet" src="{img(w('rhino-sersic', 2), 900)}" style="width:250px" alt=""></div><p class="cap" style="margin-top:10px;width:510px">RHINO SERSIC, 2026, pages 1 and 2: the plan with the clock face, elevations and pipework options from the same drawing pack.</p></div>
  <div><span class="tag" style="background:{RED};color:#fff">2021 / AutoCAD</span><img class="sheet" src="{img(dw_750, 1200)}" style="width:400px;margin-top:10px" alt=""><p class="cap" style="margin-top:8px">SEHDS750 general arrangement, March 2021.</p></div>
  <div style="padding-top:34px;width:400px"><p style="color:#dcebf3">The drawing packs were always right; they were made for the workshop. The 2026 sheets carry the same views, re-lettered to one standard, so a specifier can read them.</p></div>
</div>

{folio(9, T, True)}</section>''')

# 10 the full set --------------------------------------------------------
names = ['rhino-sersic', 'rhino-serfic', 'rhino-sers', 'rhino-serds', 'rhino-serf', 'rhino-rotex', 'rhino-sehds', 'rhino-pod', 'rhinolift', 'rhino-drawpit', 'rhino-gt', 'rhino-grease-separator', 'rhino-rainwater', 'rhino-septic']
grid = ''.join(f'<img class="sheet" src="{img(w(n, 1), 520)}" style="width:170px" alt="">' for n in names)
P(f'''<section class="pg" style="background:{SURFACE}">{gauge(False, .8)}
<p class="abs eyebrow" style="left:110px;top:80px">The 2026 set</p>
<h2 class="abs" style="left:108px;top:112px;font-size:64px;color:{DEEP}">14 sheets.<br><span class="light" style="color:{BLUE}">One system.</span></h2>
<p class="abs" style="left:110px;top:300px;width:400px">Chambers, catchpits, flow control, separators, pumping, drawpits, grease and septic. Same masthead, same grid, same drawing standard, same footer.</p>
<p class="abs cap" style="left:110px;top:470px;width:400px">Each is a page on the website at /brochures, printed here exactly as the site prints it.</p>
<div class="abs" style="left:590px;top:90px;width:930px;display:grid;grid-template-columns:repeat(5,170px);gap:20px 18px">{grid}</div>
{folio(10, T)}</section>''')

# 11 the sheet that draws itself -----------------------------------------
cfg = ['cfg-01-system', 'cfg-02-diameter', 'cfg-03-inlets', 'cfg-04-clock', 'cfg-05-pipes', 'cfg-06-flow', 'cfg-07-depth']
strip = ''.join(f'<img src="{img("shots/" + c + ".png", 420)}" style="width:118px;border-radius:10px;box-shadow:0 8px 20px rgba(0,0,0,.35)" alt="">' for c in cfg)
P(f'''<section class="pg dark grid">{gauge(True, .9)}
<p class="abs eyebrow" style="left:110px;top:80px">04 / The sheet that draws itself</p>
<h2 class="abs" style="left:108px;top:112px;font-size:58px">Seven choices <span class="light" style="color:{SKY}">in.</span><br>A drawn sheet <span class="light" style="color:{SKY}">out.</span></h2>
<div class="abs" style="left:110px;top:300px;display:flex;gap:12px">{strip}</div>
<p class="abs cap" style="left:110px;top:570px;width:880px">System, diameter, inlets, clock positions, pipe sizes, flow control, depth. Each step is checked against the seven rules (R1 to R7) before the next opens.</p>
<div class="abs" style="left:110px;top:640px;width:880px;height:3px;background:linear-gradient(90deg,{SKY},{GREEN})"></div>
<p class="abs" style="left:110px;top:670px;width:850px;color:#dcebf3">The configurator turns those answers into a two-page technical specification: project information, the rule check, pipework schedule, a plan and section drawn to the chosen sizes, and a bill of materials. No two are the same; this one is a SERSIC1050, 3000 mm deep, five inlets.</p>
<img class="abs sheet" src="{img('gen/SERSIC1050-3000-S104-5-inlets-p1.png', 1400)}" style="left:1030px;top:110px;width:500px" alt="">
<img class="abs sheet" src="{img('gen/SERSIC1050-3000-S104-5-inlets-p2.png', 1400)}" style="left:1030px;top:480px;width:500px" alt="">
{folio(11, T, True)}</section>''')

# 12 figures to confirm --------------------------------------------------
rows = [
    ('SEHDS1800', 'Overall height', '3740 mm', '4290 mm', '4290 mm'),
    ('SEHDS1800', 'Inlet invert from top', '1170 mm', '1320 mm', '1320 mm'),
    ('SEHDS1800', 'Oil / debris storage', '1455 L', '1462 L', '1462 L'),
    ('SEHDS1200', 'Overall height', '3455 mm', '2723 mm', '2723 mm'),
    ('SEHDS1200', 'Inlet invert', '923 mm', '1800 mm', 'TBC'),
    ('SEHDS1200', 'Sediment storage', '415 L', '415 L', '415 L'),
]
tr = ''.join(f'<tr><td class="mono" style="color:{DEEP}">{a}</td><td>{b}</td><td style="color:{RED}">{c}</td><td>{d}</td><td style="font-weight:800;color:{FIELD if e != "TBC" else RED}">{e}</td></tr>' for a, b, c, d, e in rows)
P(f'''<section class="pg">{gauge(False, .95)}
<p class="abs eyebrow" style="left:110px;top:90px">Before anything else is printed</p>
<h2 class="abs" style="left:108px;top:124px;font-size:64px;color:{DEEP}">Figures that moved<br><span class="light" style="color:{BLUE}">between editions.</span></h2>
<style>.ft{{border-collapse:collapse;width:100%}}.ft th{{font:600 11px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;color:#557584;text-align:left;padding:0 14px 12px 0;border-bottom:2px solid {DEEP}}}.ft td{{font-size:17px;padding:15px 14px 15px 0;border-bottom:1px solid #d5e1e7}}</style>
<div class="abs" style="left:110px;top:330px;width:900px"><table class="ft"><tr><th>Model</th><th>Figure</th><th>2023</th><th>2025</th><th>2026</th></tr>{tr}</table></div>
<div class="abs" style="left:1080px;top:330px;width:420px">
<p>The redraw copied figures across; it did not invent them. Where the 2023 sheets and the drawing packs disagree, the 2026 sheet carries the 2025 figures, and where no source settles it, it says <b style="color:{RED}">TBC</b> rather than guess.</p>
<p class="small" style="margin-top:20px;color:#3d5d6c">These are SuDS Enviro’s numbers to confirm. One sign-off against the current drawing packs closes every line.</p></div>
{folio(12, T)}</section>''')

# 13 close ----------------------------------------------------------------
P(f'''<section class="pg dark">{gauge(True, 1)}
<div class="abs" style="left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg,{DEEP},{INVERT})"></div>
<div class="abs" style="left:0;right:0;top:700px;height:4px;background:{GREEN}"></div>
<div class="abs" style="left:110px;top:150px;display:grid;grid-template-columns:1fr 1fr;gap:80px;width:1380px">
<div><p class="eyebrow" style="color:{GREEN}">What changed</p>
<ul style="list-style:none;margin-top:18px;font-size:21px;line-height:1.6;color:#fff">
<li>Every drawing, redrawn in vector</li><li>One template across 14 sheets</li><li>One spelling of the brand and the range</li><li>Sheets live on the website and print to A4</li><li>Project sheets written by the configurator</li></ul></div>
<div><p class="eyebrow">What stayed</p>
<ul style="list-style:none;margin-top:18px;font-size:21px;line-height:1.6;color:#dcebf3" class="light">
<li>Product codes and model names</li><li>The features and benefits</li><li>The compliance claims and their footnotes</li><li>The blue pane and the SuDS Enviro voice</li><li>SuDS Enviro’s engineering</li></ul></div></div>
<p class="abs" style="left:110px;top:760px;font-weight:800;font-size:46px;text-transform:uppercase;letter-spacing:-.01em">Every drop, <span class="light">accounted for.</span></p>
<p class="abs mono" style="left:110px;bottom:40px;color:#8fb3c6;font-size:11px">Work pack 01 / Redrawn / Edition 1, October 2026</p>
</section>''')

open(os.path.join(ROOT, 'redrawn.html'), 'w').write(doc('Redrawn', pages))
print('pages', len(pages))
