"""Write film.html: a page whose render(t) draws the SuDS Enviro identity film deterministically."""
import os, re, json, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'book'))
from assets import img, font

LOGOS = os.path.join(os.path.dirname(__file__), '..', '..', 'logos')
def paths(name):
    s = open(os.path.join(LOGOS, name)).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    return {'vb': vb, 'p': [{'f': f, 'd': d} for f, d in re.findall(r'<path fill="([^"]+)" d="([^"]+)"', s)]}

data = {
    'hz': paths('suds-enviro-horizontal-colour.svg'),
    'drop': paths('suds-drop-colour.svg'),
    'xr': {k: img(f'../photography/xray/{k}.png', 900, 'png') for k in ['sersic600', 'serpt600', 'sehds1800', 'rotexc1200']},
    'photo': img('../photography/hero/hero-6-outfall.jpg', 1600),
}
tpl = open(os.path.join(os.path.dirname(__file__), 'film.tpl.html')).read()
html = (tpl.replace('/*DATA*/', 'const D = ' + json.dumps(data) + ';')
           .replace('FONT_M', font('Montserrat-normal-300-900.woff2'))
           .replace('FONT_MI', font('Montserrat-italic-300-900.woff2'))
           .replace('FONT_P5', font('IBMPlexMono-normal-500.woff2')))
open(os.path.join(os.path.dirname(__file__), 'film.html'), 'w').write(html)
print('ok', len(html))
