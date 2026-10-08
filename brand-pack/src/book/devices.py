"""Graphic devices for the SuDS Enviro book. All geometry is computed, never traced."""
import math

BLUE, DEEP, GREEN, RED = '#1d80b9', '#005576', '#54b54d', '#c34c4a'
SURFACE, INVERT, PAPER, SKY, FIELD, INK = '#eef3f5', '#062a3a', '#ffffff', '#afdbf4', '#3d8537', '#0b2b3c'
MAX_MM = 6350  # deepest non-adoptable chamber (6000) plus the 350 mm sump

def depth_tint(mm):
    """Water darkens with depth: Surface -> Sky -> Blue -> Deep -> Invert."""
    stops = [(0, SURFACE), (1200, SKY), (2800, BLUE), (4600, DEEP), (6350, INVERT)]
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        if mm <= b:
            t = (mm - a) / (b - a)
            ha = [int(ca[i:i + 2], 16) for i in (1, 3, 5)]; hb = [int(cb[i:i + 2], 16) for i in (1, 3, 5)]
            return '#%02x%02x%02x' % tuple(round(x + (y - x) * t) for x, y in zip(ha, hb))
    return INVERT

def gauge(depth, dark=False, top=54, bottom=936, x=1352, w=30):
    """Staff gauge down the right edge of every page. The marker is how far down the book you are."""
    h = bottom - top; k = h / MAX_MM
    ink = SKY if dark else DEEP
    out = [f'<svg class="gauge" viewBox="0 0 1400 990" aria-hidden="true">']
    # passed water
    out.append(f'<rect x="{x}" y="{top}" width="{w}" height="{depth * k:.1f}" fill="{BLUE if not dark else BLUE}" opacity="{0.10 if not dark else 0.22}"/>')
    # spine alternates per metre, like a river staff gauge
    for m in range(0, 7):
        y0 = top + m * 1000 * k; y1 = min(bottom, top + (m + 1) * 1000 * k)
        if y0 >= bottom: break
        out.append(f'<rect x="{x + w - 4}" y="{y0:.1f}" width="4" height="{y1 - y0:.1f}" fill="{ink if m % 2 == 0 else BLUE}"/>')
    for mm in range(0, MAX_MM + 1, 100):
        y = top + mm * k
        if mm % 1000 == 0: L = 16
        elif mm % 500 == 0: L = 11
        else: L = 5
        col = ink if (mm // 1000) % 2 == 0 else BLUE
        out.append(f'<rect x="{x + w - 4 - L}" y="{y - 0.6:.1f}" width="{L}" height="1.2" fill="{col}"/>')
        if mm % 1000 == 0 and mm <= 6000:
            out.append(f'<text x="{x + 1}" y="{y + 3.5:.1f}" class="g-num" fill="{ink}">{mm // 1000}</text>')
    # sump zone
    ys = top + 6000 * k
    out.append(f'<rect x="{x}" y="{ys:.1f}" width="{w - 4}" height="{350 * k:.1f}" fill="{ink}" opacity="0.18"/>')
    # marker
    y = top + depth * k
    out.append(f'<path d="M{x - 4} {y:.1f} l-9 -6 v12 z" fill="{GREEN}"/>')
    out.append(f'<rect x="{x - 4}" y="{y - 1:.1f}" width="{w + 4}" height="2" fill="{GREEN}"/>')
    label = f'{depth} mm' if depth <= 6000 else 'sump'
    out.append(f'<text x="{x - 15}" y="{y + 3.5:.1f}" text-anchor="end" class="g-lab" fill="{ink}">{label}</text>')
    out.append('</svg>')
    return ''.join(out)

def clock_plan(inlets=(3, 5, 6, 7, 9), r=100, cx=None, cy=None, wall=None, active=None, dark=False, labels=True, node=None, standalone=True, outlet=True, stroke=None):
    """Plan view of a RHINO chamber. Outlet fixed at 12. Inlets only at 3, 5, 6, 7, 9."""
    cx = r * 1.75 if cx is None else cx; cy = r * 1.75 if cy is None else cy
    wall = wall or max(2.5, r * 0.07)
    node = node or max(4, r * 0.13)
    ink = SKY if dark else DEEP
    stroke = stroke or ink
    o = []
    if standalone:
        S = r * 3.5
        o.append(f'<svg viewBox="0 0 {S:.1f} {S:.1f}" class="clock">')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{stroke}" stroke-width="{wall}"/>')
    # every hour mark on the inside, faint; manufactured positions strong
    for h in range(12):
        th = math.radians(h * 30)
        x1 = cx + (r - wall * 1.6) * math.sin(th); y1 = cy - (r - wall * 1.6) * math.cos(th)
        x2 = cx + (r - wall * 3.2) * math.sin(th); y2 = cy - (r - wall * 3.2) * math.cos(th)
        o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{ink}" stroke-width="{max(1, wall * 0.35):.1f}" opacity="0.35"/>')
    for h in (3, 5, 6, 7, 9):
        th = math.radians(h * 30)
        on = h in inlets
        x = cx + r * math.sin(th); y = cy - r * math.cos(th)
        if on:
            # pipe stub
            x3 = cx + (r + node * 2.6) * math.sin(th); y3 = cy - (r + node * 2.6) * math.cos(th)
            o.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x3:.1f}" y2="{y3:.1f}" stroke="{BLUE}" stroke-width="{node * 1.25:.1f}" stroke-linecap="butt"/>')
            o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{node:.1f}" fill="{BLUE}" stroke="{PAPER if not dark else INVERT}" stroke-width="{max(1, node * 0.3):.1f}"/>')
        else:
            o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{node * 0.62:.1f}" fill="{PAPER if not dark else INVERT}" stroke="{ink}" stroke-width="{max(1, node * 0.22):.1f}" opacity="0.6"/>')
        if labels:
            lx = cx + (r + node * 4.6) * math.sin(th); ly = cy - (r + node * 4.6) * math.cos(th)
            o.append(f'<text x="{lx:.1f}" y="{ly + node * 0.55:.1f}" text-anchor="middle" class="mono" font-size="{node * 1.5:.1f}" fill="{ink}">{h}</text>')
    if outlet:
        x = cx; y = cy - r
        o.append(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y - node * 2.6:.1f}" stroke="{GREEN}" stroke-width="{node * 1.6:.1f}"/>')
        o.append(f'<circle cx="{x}" cy="{y:.1f}" r="{node * 1.25:.1f}" fill="{GREEN}" stroke="{PAPER if not dark else INVERT}" stroke-width="{max(1, node * 0.3):.1f}"/>')
        if labels:
            o.append(f'<text x="{x}" y="{y - node * 3.4:.1f}" text-anchor="middle" class="mono" font-size="{node * 1.5:.1f}" fill="{ink}">12</text>')
    if standalone: o.append('</svg>')
    return ''.join(o)

def bands(w=600, h=60, flip=False):
    """The drop's four layers laid flat as a wave band: green, blue, green, red."""
    cols = [GREEN, BLUE, GREEN, RED]
    shares = [0.24, 0.42, 0.10, 0.24]
    o = [f'<svg viewBox="0 0 {w} {h}" preserveAspectRatio="none" class="bands">']
    y = 0
    gap = h * 0.06
    for c, s in zip(cols, shares):
        hh = h * s - gap
        a = hh * 0.35
        d = f'M0 {y + a:.1f} C {w*0.25:.1f} {y - a:.1f}, {w*0.5:.1f} {y + a*2:.1f}, {w*0.75:.1f} {y + a*0.5:.1f} S {w:.1f} {y:.1f}, {w:.1f} {y + a*0.4:.1f} L {w} {y + hh + a*0.4:.1f} C {w*0.75:.1f} {y + hh:.1f}, {w*0.5:.1f} {y + hh + a*2:.1f}, {w*0.25:.1f} {y + hh - a*0.2:.1f} S 0 {y + hh + a:.1f}, 0 {y + hh + a:.1f} Z'
        o.append(f'<path d="{d}" fill="{c}"/>')
        y += h * s
    o.append('</svg>')
    return ''.join(o)

def section_column(depth, w=300, h=990, dark=False, label=''):
    """A cut through the ground: strata tinted by depth, a shaft, and a level line at the chapter depth."""
    top = 150; bot = 930; k = (bot - top) / MAX_MM
    o = [f'<svg viewBox="0 0 {w} {h}" class="sectcol" preserveAspectRatio="none">']
    # sky / above ground
    # strata
    step = 250
    for mm in range(0, MAX_MM, step):
        y0 = top + mm * k; y1 = top + min(MAX_MM, mm + step) * k
        o.append(f'<rect x="0" y="{y0:.1f}" width="{w}" height="{y1 - y0 + 0.6:.1f}" fill="{depth_tint(mm + step / 2)}"/>')
    # turf line
    o.append(f'<rect x="0" y="{top - 6}" width="{w}" height="8" fill="{GREEN}"/>')
    # shaft (a chamber, cut): inner void
    sx = w * 0.56; sw = w * 0.22
    o.append(f'<rect x="{sx:.1f}" y="{top - 10}" width="{sw:.1f}" height="{depth * k + 10:.1f}" fill="{PAPER}" opacity="0.88"/>')
    o.append(f'<rect x="{sx - 5:.1f}" y="{top - 10}" width="5" height="{depth * k + 10:.1f}" fill="{DEEP if depth < 4000 else SKY}"/>')
    o.append(f'<rect x="{sx + sw:.1f}" y="{top - 10}" width="5" height="{depth * k + 10:.1f}" fill="{DEEP if depth < 4000 else SKY}"/>')
    # level line
    y = top + depth * k
    o.append(f'<line x1="0" y1="{y:.1f}" x2="{w}" y2="{y:.1f}" stroke="{GREEN}" stroke-width="3"/>')
    o.append(f'<path d="M{sx + sw / 2 - 9:.1f} {y - 15:.1f} h18 l-9 13 z" fill="{GREEN}"/>')
    # dimension line from ground
    dx = w * 0.18
    o.append(f'<line x1="{dx}" y1="{top + 4}" x2="{dx}" y2="{y - 4:.1f}" stroke="{PAPER if depth > 1500 else DEEP}" stroke-width="1.5"/>')
    for yy, d in ((top + 4, 1), (y - 4, -1)):
        o.append(f'<path d="M{dx - 5} {yy + 9 * d:.1f} L{dx} {yy:.1f} L{dx + 5} {yy + 9 * d:.1f}" fill="none" stroke="{PAPER if depth > 1500 else DEEP}" stroke-width="1.5"/>')
    o.append('</svg>')
    return ''.join(o)

def dim(x1, y1, x2, y2, text, col=DEEP, off=0, size=12, vertical=False):
    """An engineering dimension line with ticks and a mono label."""
    o = [f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="1"/>']
    for (x, y) in ((x1, y1), (x2, y2)):
        if vertical:
            o.append(f'<line x1="{x - 5}" y1="{y}" x2="{x + 5}" y2="{y}" stroke="{col}" stroke-width="1"/>')
        else:
            o.append(f'<line x1="{x}" y1="{y - 5}" x2="{x}" y2="{y + 5}" stroke="{col}" stroke-width="1"/>')
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if vertical:
        o.append(f'<text x="{mx + 8 + off}" y="{my + 4}" class="mono" font-size="{size}" fill="{col}">{text}</text>')
    else:
        o.append(f'<text x="{mx}" y="{my - 8 + off}" text-anchor="middle" class="mono" font-size="{size}" fill="{col}">{text}</text>')
    return ''.join(o)

def ring_label(text, r=100, size=None, col=BLUE, thick=None):
    """The diameter ring from the configurator: a band with its size set along the arc."""
    thick = thick or r * 0.28
    size = size or r * 0.22
    S = r * 2 + thick + 8
    c = S / 2
    pid = f'arc{abs(hash((text, r))) % 10**6}'
    rr = r
    return (f'<svg viewBox="0 0 {S:.0f} {S:.0f}" width="{S:.0f}" height="{S:.0f}" class="ring"><defs><path id="{pid}" d="M {c - rr*0.98:.1f} {c:.1f} A {rr*0.98:.1f} {rr*0.98:.1f} 0 0 1 {c + rr*0.98:.1f} {c:.1f}"/></defs>'
            f'<circle cx="{c}" cy="{c}" r="{rr}" fill="none" stroke="{col}" stroke-width="{thick:.1f}"/>'
            f'<text font-family="Montserrat" font-weight="800" font-size="{size:.1f}" fill="#fff" letter-spacing="1"><textPath href="#{pid}" startOffset="50%" text-anchor="middle" dy="{size*0.35:.1f}">{text}</textPath></text></svg>')
