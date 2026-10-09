"""Write cut.html: the calmer 3D showcase cut. Served from the repo root so it can load the 3D library."""
import os, re, json, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'book'))
from assets import font
LOGOS = os.path.join(HERE, '..', '..', 'logos')
def paths(name):
    s = open(os.path.join(LOGOS, name)).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    return {'vb': vb, 'p': [{'f': f, 'd': d} for f, d in re.findall(r'<path fill="([^"]+)" d="([^"]+)"', s)]}
data = {'hz': paths('suds-enviro-horizontal-reversed.svg'), 'drop': paths('suds-drop-colour.svg')}
tpl = open(os.path.join(HERE, 'cut.tpl.html')).read()
html = (tpl.replace('/*DATA*/', 'const D = ' + json.dumps(data) + ';')
           .replace('FONT_MI', font('Montserrat-italic-300-900.woff2'))
           .replace('FONT_M', font('Montserrat-normal-300-900.woff2'))
           .replace('FONT_P5', font('IBMPlexMono-normal-500.woff2')))
open(os.path.join(HERE, 'cut.html'), 'w').write(html)
print('ok', len(html))
