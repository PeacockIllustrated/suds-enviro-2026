"""Asset loading for the brand book: every image and font is embedded as a data URI."""
import base64, io, os, re
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PACK = os.path.abspath(os.path.join(ROOT, '..'))
_cache = {}

def _b64(data, mime):
    return f'data:{mime};base64,' + base64.b64encode(data).decode()

def font(name):
    return _b64(open(os.path.join(ROOT, 'fonts', name), 'rb').read(), 'font/woff2')

def img(rel, width=None, fmt='jpg', q=80, bg=None):
    key = (rel, width, fmt, q, bg)
    if key in _cache: return _cache[key]
    im = Image.open(os.path.join(ROOT, rel))
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    if fmt == 'jpg':
        if im.mode in ('RGBA', 'P', 'LA'):
            im = im.convert('RGBA')
            base = Image.new('RGB', im.size, bg or '#ffffff'); base.paste(im, mask=im.split()[-1]); im = base
        im.convert('RGB').save(buf, 'JPEG', quality=q, optimize=True, progressive=True); mime = 'image/jpeg'
    elif fmt == 'webp':
        im.save(buf, 'WEBP', quality=q, method=6); mime = 'image/webp'
    else:
        im.save(buf, 'PNG', optimize=True); mime = 'image/png'
    _cache[key] = _b64(buf.getvalue(), mime)
    return _cache[key]

def svg(name, cls=''):
    """Inline one of the logo-suite SVGs."""
    s = open(os.path.join(PACK, 'logos', name)).read()
    s = re.sub(r'<\?xml[^>]*>', '', s).strip()
    if cls: s = s.replace('<svg ', f'<svg class="{cls}" ', 1)
    return s
