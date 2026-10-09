"""Logo suite for SuDS Enviro.

The lockups are SuDS Enviro's own artwork, taken from the vector masters on
the live site. Shapes are untouched. Colours are normalised to the palette in
the brand book because the masters carry three slightly different greens,
blues and reds. Everything new here (the Clockwork seal, the app icon, the
avatar) is built around the supplied drop, with type converted to outlines
so sign makers and lasers need no fonts.
"""
import re, math, io, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, '..')
OUT = os.path.join(HERE, '..', '..', 'logos')
os.makedirs(OUT, exist_ok=True)

BLUE, GREEN, RED = '#1d80b9', '#54b54d', '#c34c4a'
DEEP, WHITE, BLACK = '#005576', '#ffffff', '#000000'

# ---------- read the masters ----------
def paths_of(svgfile):
    s = open(os.path.join(SRC, 'ref', svgfile)).read()
    styles = dict(re.findall(r'\.(cls-\d+)\s*\{\s*fill:\s*(#[0-9a-fA-F]{6})', s))
    return [(styles[c], d) for c, d in re.findall(r'<path class="(cls-\d+)" d="([^"]+)"', s)], s

hz, hz_src = paths_of('suds-horizontal.svg')
HZ_VB = (0, 0, 495.69, 76.63)
# which paths are the drop (bbox x > 440 in the master)
DROP_IDX = [5, 6, 7, 8, 9]
role_hz = []
for i, (fill, d) in enumerate(hz):
    if i in DROP_IDX:
        role_hz.append('drop-' + {'#5bb44f': 'green', '#1d80b9': 'blue', '#c34c4a': 'red'}[fill])
    else:
        role_hz.append('suds' if fill == '#1d80b9' else 'envir')

rh, rh_src = paths_of('suds-rhino-colour.svg')
RH_VB = (0, 0, 1379.91, 562.07)
NORM = {'#1f81bb': BLUE, '#1d80b9': BLUE, '#54b54d': GREEN, '#5bb44f': GREEN, '#c74c4d': RED, '#c34c4a': RED, '#231f20': '#231f20'}

def svg(vb, body, pad=0):
    x, y, w, h = vb
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x-pad:.2f} {y-pad:.2f} {w+2*pad:.2f} {h+2*pad:.2f}">\n{body}\n</svg>\n')

def save(name, content):
    open(os.path.join(OUT, name), 'w').write(content)

# colourways: role -> fill
WAYS = {
    'colour':   {'suds': BLUE, 'envir': GREEN, 'drop-green': GREEN, 'drop-blue': BLUE, 'drop-red': RED},
    'reversed': {'suds': WHITE, 'envir': WHITE, 'drop-green': GREEN, 'drop-blue': BLUE, 'drop-red': RED},
    'deep':     {k: DEEP for k in ['suds', 'envir', 'drop-green', 'drop-blue', 'drop-red']},
    'white':    {k: WHITE for k in ['suds', 'envir', 'drop-green', 'drop-blue', 'drop-red']},
    'black':    {k: BLACK for k in ['suds', 'envir', 'drop-green', 'drop-blue', 'drop-red']},
}

for way, m in WAYS.items():
    body = '\n'.join(f'<path fill="{m[r]}" d="{d}"/>' for (f, d), r in zip(hz, role_hz))
    save(f'suds-enviro-horizontal-{way}.svg', svg(HZ_VB, body))
    dbody = '\n'.join(f'<path fill="{m[r]}" d="{d}"/>' for (f, d), r in zip(hz, role_hz) if r.startswith('drop'))
    save(f'suds-drop-{way}.svg', svg((441.4, -0.2, 54.5, 76.7), dbody))

DROP_PATHS = [(r, d) for (f, d), r in zip(hz, role_hz) if r.startswith('drop')]
DROP_BOX = (441.4, -0.2, 54.5, 76.7)

for way in ['colour', 'white', 'black', 'deep']:
    body = []
    for f, d in rh:
        c = NORM.get(f.lower(), f)
        if way == 'white': c = WHITE
        if way == 'black': c = BLACK
        if way == 'deep': c = DEEP
        if f.lower() == '#231f20' and way == 'colour': c = WHITE
        body.append(f'<path fill="{c}" d="{d}"/>')
    save(f'suds-rhino-lockup-{way}.svg', svg(RH_VB, '\n'.join(body)))

# ---------- type to outlines ----------
fontfile = os.path.join(SRC, 'fonts', 'Montserrat-normal-300-900.woff2')
def font_at(w):
    f = TTFont(fontfile)
    return instantiateVariableFont(f, {'wght': w})
F7 = font_at(700)
F5 = font_at(500)

def glyph_path(font, ch, tx):
    gs = font.getGlyphSet(); cmap = font.getBestCmap()
    name = cmap[ord(ch)]
    pen = SVGPathPen(gs)
    gs[name].draw(TransformPen(pen, tx))
    return pen.getCommands(), gs[name].width

def text_on_arc(font, text, cx, cy, r, centre_deg, size, track=0.0, inside=False):
    """Lay glyphs along a circle. centre_deg: 0 = 12 o'clock, clockwise.
    Top arcs read clockwise with glyphs upright outward; bottom arcs (inside=True)
    read anticlockwise so the text is the right way up."""
    upm = font['head'].unitsPerEm; k = size / upm
    gs = font.getGlyphSet(); cmap = font.getBestCmap()
    widths = [gs[cmap[ord(c)]].width * k + track for c in text]
    total = sum(widths) - track
    arc = total / r  # radians
    out = []
    a = math.radians(centre_deg) + (-arc / 2 if not inside else arc / 2)
    for c, w in zip(text, widths):
        mid = a + ((w - track) / 2 / r) * (1 if not inside else -1)
        if c != ' ':
            # glyph local: x centred on advance, baseline at 0
            gw = gs[cmap[ord(c)]].width * k
            theta = mid
            px = cx + r * math.sin(theta); py = cy - r * math.cos(theta)
            rot = theta if not inside else theta + math.pi
            cs, sn = math.cos(rot), math.sin(rot)
            # transform: scale k, flip y, translate -gw/2, rotate, translate to point
            # point = R * (k*x - gw/2, -k*y) + p
            t = (k * cs, k * sn, k * sn * 1, -k * cs, 0, 0)
            # build affine: [a c e; b d f]
            a_ = k * cs; b_ = k * sn; c_ = k * sn; d_ = -k * cs
            e_ = px + (-gw / 2) * cs; f_ = py + (-gw / 2) * sn
            # with flip: y' = -k*y, then rotate: X = cs*x' - sn*y', Y = sn*x' + cs*y'
            a_, b_ = k * cs, k * sn
            c_, d_ = -(-k) * sn * -1, -k * cs
            c_ = k * sn
            d_ = -k * cs
            cmds, _ = glyph_path(font, c, (a_, b_, c_, d_, e_, f_))
            out.append(cmds)
        a += (w / r) * (1 if not inside else -1)
    return ' '.join(out)

def text_line(font, text, x, y, size, track=0.0, anchor='middle'):
    upm = font['head'].unitsPerEm; k = size / upm
    gs = font.getGlyphSet(); cmap = font.getBestCmap()
    widths = [gs[cmap[ord(c)]].width * k + track for c in text]
    total = sum(widths) - track
    cx = x - total / 2 if anchor == 'middle' else x
    out = []
    for c, w in zip(text, widths):
        if c != ' ':
            cmds, _ = glyph_path(font, c, (k, 0, 0, -k, cx, y))
            out.append(cmds)
        cx += w
    return ' '.join(out)

def drop_group(x, y, h, way='colour'):
    bx, by, bw, bh = DROP_BOX
    s = h / bh
    m = WAYS[way]
    ps = '\n'.join(f'<path fill="{m[r]}" d="{d}"/>' for r, d in DROP_PATHS)
    return f'<g transform="translate({x - bw * s / 2:.2f} {y - bh * s / 2:.2f}) scale({s:.4f}) translate({-bx} {-by})">{ps}</g>'

# ---------- the Clockwork seal ----------
# Plan view of a RHINO chamber: outlet fixed at 12, inlets manufactured at 3, 5, 6, 7, 9.
def seal(variant):
    C = 500; R_OUT = 478; R_IN = 322; R_TXT = 400
    filled = variant in ('filled', 'filled-deep')
    ground = DEEP if variant == 'filled-deep' else BLUE
    ink = WHITE if filled else DEEP
    parts = []
    if filled:
        parts.append(f'<circle cx="{C}" cy="{C}" r="{R_OUT}" fill="{ground}"/>')
        parts.append(f'<circle cx="{C}" cy="{C}" r="{R_IN}" fill="{WHITE}"/>')
    else:
        parts.append(f'<circle cx="{C}" cy="{C}" r="{R_OUT}" fill="none" stroke="{DEEP}" stroke-width="10"/>')
        parts.append(f'<circle cx="{C}" cy="{C}" r="{R_IN}" fill="none" stroke="{DEEP}" stroke-width="10"/>')
    top = text_on_arc(F7, 'SUDS ENVIRO  ·  BESPOKE, STANDARDISED', C, C, R_TXT - 22, 0, 52, track=5)
    bot = text_on_arc(F5, 'THE HOME OF SUDS RHINO', C, C, R_TXT + 36, 180, 42, track=8, inside=True)
    parts.append(f'<path fill="{ink}" d="{top} {bot}"/>')
    # position nodes on the inner wall
    for hour in [3, 5, 6, 7, 9]:
        th = math.radians(hour * 30)
        x = C + R_IN * math.sin(th); y = C - R_IN * math.cos(th)
        parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="17" fill="{WHITE}" stroke="{ground if filled else DEEP}" stroke-width="10"/>')
    th = 0; x = C; y = C - R_IN
    parts.append(f'<circle cx="{x}" cy="{y}" r="24" fill="{GREEN if variant != "line" else DEEP}" stroke="{WHITE if filled else DEEP}" stroke-width="{8 if filled else 0}"/>')
    # drop at the centre
    parts.append(drop_group(C, C + 8, 420, 'colour' if variant != 'line' else 'deep'))
    return svg((0, 0, 1000, 1000), '\n'.join(parts))

save('suds-clockwork-seal-filled.svg', seal('filled'))
save('suds-clockwork-seal-filled-deep.svg', seal('filled-deep'))
save('suds-clockwork-seal-line.svg', seal('line'))

# ---------- app icon and avatar ----------
save('suds-app-icon.svg', svg((0, 0, 1024, 1024), f'<rect width="1024" height="1024" rx="0" fill="{DEEP}"/>' + drop_group(512, 520, 640, 'reversed')))
save('suds-app-icon-light.svg', svg((0, 0, 1024, 1024), f'<rect width="1024" height="1024" fill="#eef3f5"/>' + drop_group(512, 520, 640, 'colour')))
save('suds-avatar.svg', svg((0, 0, 1080, 1080), f'<circle cx="540" cy="540" r="540" fill="{WHITE}"/>' + drop_group(540, 548, 600, 'colour')))
save('suds-avatar-deep.svg', svg((0, 0, 1080, 1080), f'<circle cx="540" cy="540" r="540" fill="{DEEP}"/>' + drop_group(540, 548, 600, 'reversed')))

# a "Bespoke, Standardised" wordline in outlines (two voices: upright then italic is not available in
# one instanced face, so the line is set upright 700 and the italic voice is kept for live text only)
save('line-bespoke-standardised-deep.svg', svg((0, -60, 1300, 80), f'<path fill="{DEEP}" d="{text_line(F7, "BESPOKE, STANDARDISED", 650, 0, 64, track=6)}"/>'))
print('\n'.join(sorted(os.listdir(OUT))))
