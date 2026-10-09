"""Write reel.html: a page whose render(t) draws the SuDS Enviro showcase reel deterministically."""
import os, re, json, sys, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'book'))
from assets import img, font

PACK = os.path.abspath(os.path.join(HERE, '..', '..'))
LOGOS = os.path.join(PACK, 'logos')

def paths(name):
    s = open(os.path.join(LOGOS, name)).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    return {'vb': vb, 'p': [{'f': f, 'd': d} for f, d in re.findall(r'<path fill="([^"]+)" d="([^"]+)"', s)]}

def svg_uri(name):
    s = open(os.path.join(LOGOS, name), 'rb').read()
    return 'data:image/svg+xml;base64,' + base64.b64encode(s).decode()

XRAY = ['sersic600', 'sehds1800', 'serpt600', 'rotexc1200', 'ps50', 'serpod1850', 'sercic600-5', 'seb1050',
        'poc600', 'mini2000d', 'maxi1600d', 'aqua190s', 'jumbomicro', 'serd', 'flolock']
MARKS = ['suds-app-icon.svg', 'suds-avatar.svg', 'suds-clockwork-seal-filled.svg', 'suds-drop-colour.svg',
         'suds-drop-white.svg', 'suds-enviro-horizontal-colour.svg', 'suds-rhino-lockup-white.svg',
         'suds-clockwork-seal-line.svg', 'suds-app-icon-light.svg', 'suds-avatar-deep.svg',
         'suds-clockwork-seal-filled-deep.svg', 'suds-drop-reversed.svg', 'suds-rhino-lockup-colour.svg',
         'suds-enviro-horizontal-white.svg']

data = {
    'hz': paths('suds-enviro-horizontal-reversed.svg'),
    'drop': paths('suds-drop-colour.svg'),
    'xr': {k: img(f'../photography/xray/{k}.png', 760, 'png') for k in XRAY},
    'marks': {m: svg_uri(m) for m in MARKS},
    'mont': {
        'p01': img('../pages/page-01.jpg', 1400, q=82), 'p11': img('../pages/page-11.jpg', 1400, q=82),
        'p31': img('../pages/page-31.jpg', 1400, q=82), 'p42': img('../pages/page-42.jpg', 1400, q=82),
        'h1': img('../photography/hero/hero-1-trench.jpg', 1600, q=82), 'h2': img('../photography/hero/hero-2-yard.jpg', 1600, q=82),
        'h4': img('../photography/hero/hero-4-dusk.jpg', 1600, q=82), 'h6': img('../photography/hero/hero-6-outfall.jpg', 1600, q=82),
        'site': img('shots/site-home.png', 1600, q=82), 'phone': img('shots/m-configurator.png', 700, q=85),
    },
}
tpl = open(os.path.join(HERE, 'reel.tpl.html')).read()
html = (tpl.replace('/*DATA*/', 'const D = ' + json.dumps(data) + ';')
           .replace('FONT_MI', font('Montserrat-italic-300-900.woff2'))
           .replace('FONT_M', font('Montserrat-normal-300-900.woff2'))
           .replace('FONT_P5', font('IBMPlexMono-normal-500.woff2')))
open(os.path.join(HERE, 'reel.html'), 'w').write(html)
print('ok', len(html))
