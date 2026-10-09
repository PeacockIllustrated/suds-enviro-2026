"""Shared kit for the work pack: palette, fonts, image cache, page shell and devices."""
import os, hashlib
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))   # work-pack/
SRC = os.path.join(ROOT, 'src')
REPO = os.path.abspath(os.path.join(ROOT, '..'))
CACHE = os.path.join(SRC, 'img')
os.makedirs(CACHE, exist_ok=True)

BLUE, DEEP, GREEN, RED = '#1D80B9', '#005576', '#54B54D', '#C34C4A'
SURFACE, INVERT, FIELD, SKY, PAPER, INK = '#EEF3F5', '#062A3A', '#3D8537', '#AFDBF4', '#FFFFFF', '#0B2532'
W, H = 1600, 1000


def img(path, maxw=1800, box=None, q=84, fmt='jpg'):
    """Cached JPEG (or PNG) of a source image, optionally cropped to a fractional box (x0, y0, x1, y1). Returns a path relative to work-pack/."""
    full = path if os.path.isabs(path) else os.path.join(SRC, path)
    key = hashlib.md5(f'{full}{maxw}{box}{q}{fmt}{os.path.getmtime(full)}'.encode()).hexdigest()[:10]
    out = os.path.join(CACHE, f'{os.path.splitext(os.path.basename(full))[0]}-{key}.{fmt}')
    if not os.path.exists(out):
        im = Image.open(full)
        im = im.convert('RGBA' if fmt == 'png' else 'RGB') if im.mode != 'RGB' or fmt == 'png' else im
        if box:
            x0, y0, x1, y1 = box
            im = im.crop((int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height)))
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        im.save(out, quality=q) if fmt == 'jpg' else im.save(out, optimize=True)
    return os.path.relpath(out, ROOT)


def repo(rel):
    """A repo file referenced from work-pack/."""
    return os.path.relpath(os.path.join(REPO, rel), ROOT)


FONTS = repo('brand-pack/src/fonts')

CSS = f'''
@font-face{{font-family:Montserrat;src:url({FONTS}/Montserrat-normal-300-900.woff2) format('woff2');font-weight:300 900;font-style:normal}}
@font-face{{font-family:Montserrat;src:url({FONTS}/Montserrat-italic-300-900.woff2) format('woff2');font-weight:300 900;font-style:italic}}
@font-face{{font-family:Plex;src:url({FONTS}/IBMPlexMono-normal-400.woff2) format('woff2');font-weight:400}}
@font-face{{font-family:Plex;src:url({FONTS}/IBMPlexMono-normal-500.woff2) format('woff2');font-weight:500}}
@font-face{{font-family:Plex;src:url({FONTS}/IBMPlexMono-normal-600.woff2) format('woff2');font-weight:600}}
@page{{size:{W}px {H}px;margin:0}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:#555}}
body{{font-family:Montserrat,sans-serif;color:{INK};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pg{{width:{W}px;height:{H}px;position:relative;overflow:hidden;background:{PAPER};page-break-after:always;break-after:page}}
@media screen{{.pg{{margin:0 auto 24px}}}}
.dark{{background:{INVERT};color:#fff}}
.grid{{background-image:linear-gradient(rgba(175,219,244,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(175,219,244,.07) 1px,transparent 1px);background-size:40px 40px}}
.abs{{position:absolute}}
.mono{{font-family:Plex,monospace;font-weight:500;letter-spacing:.06em;text-transform:uppercase;font-size:12px}}
.eyebrow{{font-family:Plex,monospace;font-weight:500;letter-spacing:.12em;text-transform:uppercase;font-size:13px;color:{BLUE}}}
.dark .eyebrow{{color:{SKY}}}
h1,h2,h3{{font-weight:800;text-transform:uppercase;letter-spacing:-.01em;line-height:.9}}
.light{{font-weight:300}}
p{{font-size:17px;line-height:1.5}}
.small{{font-size:14.5px;line-height:1.5}}
.cap{{font-family:Plex,monospace;font-size:11.5px;letter-spacing:.04em;line-height:1.5;color:#557584}}
.dark .cap{{color:#8fb3c6}}
.sheet{{display:block;box-shadow:0 18px 50px rgba(0,0,0,.35);background:#fff}}
.frame{{position:relative;display:inline-block}}
.frame img{{display:block}}
.co{{position:absolute;border:2.5px solid {RED};border-radius:4px}}
.co.g{{border-color:{GREEN}}}
.pin{{position:absolute;width:30px;height:30px;border-radius:50%;background:{RED};color:#fff;font:600 14px Plex,monospace;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35)}}
.pin.g{{background:{GREEN}}}
.notes{{list-style:none;counter-reset:n}}
.notes li{{position:relative;padding-left:46px;margin-bottom:20px;font-size:16px;line-height:1.45}}
.notes li b{{display:block;font-weight:800;text-transform:uppercase;font-size:15px;letter-spacing:.02em;margin-bottom:3px}}
.notes li:before{{counter-increment:n;content:counter(n);position:absolute;left:0;top:-2px;width:30px;height:30px;border-radius:50%;background:{RED};color:#fff;font:600 14px Plex,monospace;display:flex;align-items:center;justify-content:center}}
.notes.g li:before{{background:{GREEN}}}
.tag{{display:inline-block;font:600 11px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;padding:5px 9px;border-radius:3px}}
'''


def gauge(dark=False, depth=None, side='left'):
    """The brand's staff gauge down a page edge: ticks every 25 px, numbered every 100, a marker at `depth` (0..1)."""
    col = 'rgba(175,219,244,.45)' if dark else 'rgba(0,85,118,.35)'
    ticks = ''.join(
        f'<div class="abs" style="{side}:0;top:{y}px;width:{18 if y % 100 == 0 else 9}px;height:1.5px;background:{col}"></div>'
        + (f'<div class="abs mono" style="{side}:24px;top:{y - 7}px;font-size:9.5px;color:{col}">{y * 6}</div>' if y % 200 == 0 and 0 < y < H else '')
        for y in range(0, H, 25))
    mark = f'<div class="abs" style="{side}:0;top:{int(depth * H) - 2}px;width:34px;height:4px;background:{GREEN}"></div>' if depth is not None else ''
    return f'<div class="abs" style="{side}:0;top:0;bottom:0;width:60px">{ticks}{mark}</div>'


def folio(n, title, dark=False):
    c = '#8fb3c6' if dark else '#7c97a5'
    return f'<div class="abs mono" style="left:88px;right:70px;bottom:34px;display:flex;justify-content:space-between;color:{c};font-size:11px"><span>SuDS Enviro / {title}</span><span>{n:02d}</span></div>'


def callouts(src, w, marks, green=False):
    """An image at width w with numbered boxes. marks: list of (x0, y0, x1, y1) fractions; numbered in order."""
    g = ' g' if green else ''
    boxes = ''
    for i, m in enumerate(marks, 1):
        x0, y0, x1, y1 = m[:4]; i = m[4] if len(m) > 4 else i
        boxes += f'<div class="co{g}" style="left:{x0*100:.2f}%;top:{y0*100:.2f}%;width:{(x1-x0)*100:.2f}%;height:{(y1-y0)*100:.2f}%"></div>'
        boxes += f'<div class="pin{g}" style="left:calc({x1*100:.2f}% - 12px);top:calc({y0*100:.2f}% - 18px)">{i}</div>'
    return f'<div class="frame sheet" style="width:{w}px"><img src="{src}" style="width:{w}px" alt="">{boxes}</div>'


def doc(title, pages):
    return f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>{title}</title><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'
