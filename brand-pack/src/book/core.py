"""Page shell for the SuDS Enviro brand book: 1400 x 990 pages, running head, staff gauge, folio."""
from devices import *
from assets import font

CHAPTERS = [
    # key, depth mm, title (light voice, bold voice), fact at this depth (true, from the data sheets and rule engine) or ''
    ('ground', 0, ('Ground', 'level'), 'Ground level. Where the rain lands and the cover sits flush with the road.'),
    ('logo', 500, ('The', 'logo'), ''),
    ('colour', 1000, ('', 'Colour'), '1000 mm. The shallowest RHINO inspection chamber we make.'),
    ('type', 1500, ('', 'Type'), ''),
    ('voice', 2000, ('', 'Voice'), '2000 mm. The deepest adoptable catchpit.'),
    ('devices', 2500, ('Graphic', 'devices'), ''),
    ('photo', 3000, ('', 'Photography'), '3000 mm. The deepest adoptable inspection chamber, to pipe soffit, under DCG and SfA7.'),
    ('rhino', 3500, ('The', 'RHINO range'), ''),
    ('screen', 4000, ('On', 'screen'), ''),
    ('print', 4500, ('In', 'print'), ''),
    ('made', 5000, ('Made', 'things'), ''),
    ('motion', 5500, ('', 'Motion'), ''),
    ('files', 6000, ('The', 'files'), '6000 mm. The deepest non-adoptable chamber. The bottom of the range.'),
    ('sump', 6350, ('The', 'sump'), 'The sump. Always 350 mm below the outlet, where the silt settles.'),
]
CH = {c[0]: c for c in CHAPTERS}
PAGES = []  # filled by pages modules: (chapter, html, opts)

def two(light, bold, cls='h1', tag='h2'):
    l = f'<span class="lt">{light}</span> ' if light else ''
    return f'<{tag} class="{cls} two">{l}<b>{bold}</b></{tag}>'

def page(chapter, body, dark=False, surf=False, cls='', head=True, gauge_on=True):
    PAGES.append((chapter, body, dict(dark=dark, surf=surf, cls=cls, head=head, gauge=gauge_on)))

def render_pages():
    out = []
    n = len(PAGES)
    for i, (chapter, body, o) in enumerate(PAGES, 1):
        key, depth, title, fact = CH[chapter]
        klass = 'pg' + (' dark' if o['dark'] else '') + (' surf' if o['surf'] else '') + (' ' + o['cls'] if o['cls'] else '')
        name = (title[0] + ' ' + title[1]).strip()
        h = ''
        if o['head']:
            h = (f'<div class="rh"><span>SuDS Enviro <i>/</i> Brand book</span>'
                 f'<span class="rh-ch">{depth if depth <= 6000 else 6000}{"" if depth <= 6000 else " + 350"} mm <i>/</i> {name}</span></div>'
                 f'<div class="folio"><span class="fn">{i:02d}</span><span class="ft">of {n}</span><span class="fs">Bespoke, <em>standardised</em></span></div>')
        g = gauge(depth, dark=o['dark'] or 'axis' in o['cls']) if o['gauge'] else ''
        out.append(f'<div class="slot"><section class="{klass}" id="p{i}" data-depth="{depth}">{h}{body}{g}</section></div>')
    return '\n'.join(out)

def css():
    return f'''
@font-face{{font-family:"Montserrat";src:url({font("Montserrat-normal-300-900.woff2")}) format("woff2");font-weight:300 900;font-style:normal}}
@font-face{{font-family:"Montserrat";src:url({font("Montserrat-italic-300-900.woff2")}) format("woff2");font-weight:300 900;font-style:italic}}
@font-face{{font-family:"Plex Mono";src:url({font("IBMPlexMono-normal-400.woff2")}) format("woff2");font-weight:400}}
@font-face{{font-family:"Plex Mono";src:url({font("IBMPlexMono-normal-500.woff2")}) format("woff2");font-weight:500}}
@font-face{{font-family:"Plex Mono";src:url({font("IBMPlexMono-normal-600.woff2")}) format("woff2");font-weight:600}}
@font-face{{font-family:"Plex Mono";src:url({font("IBMPlexMono-italic-400.woff2")}) format("woff2");font-weight:400;font-style:italic}}
'''
