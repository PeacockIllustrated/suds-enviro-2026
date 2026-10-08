"""Assemble the SuDS Enviro brand book into one self-contained HTML file."""
import os, re, sys, importlib
sys.path.insert(0, os.path.dirname(__file__))
import core
mods = [m for m in ['pages_a', 'pages_b', 'pages_c', 'pages_d'] if os.path.exists(os.path.join(os.path.dirname(__file__), m + '.py'))]
for m in mods: importlib.import_module(m).build()

html = core.render_pages()
# first page of each chapter, for the contents page
first = {}
for i, (ch, _, _) in enumerate(core.PAGES, 1): first.setdefault(ch, i)
html = re.sub(r'\{\{PAGE:(\w+)\}\}', lambda m: f'{first.get(m.group(1), 0):02d}', html)

style = core.css() + open(os.path.join(os.path.dirname(__file__), 'style.css')).read()
script = '''<script>
(function(){
  function fit(){
    var w = document.documentElement.clientWidth - 32;
    var k = Math.min(1, Math.max(0.2, w / 1400));
    document.documentElement.style.setProperty('--k', k.toFixed(4));
  }
  fit(); window.addEventListener('resize', fit);
})();
</script>'''
doc = f'''<title>SuDS Enviro Brand Book</title>
<meta name="description" content="The SuDS Enviro identity, drawn in section: logo, colour, type, voice, devices, photography, the RHINO range and applications.">
<style>{style}</style>
<main class="book">
{html}
</main>
{script}
'''
out = os.path.join(os.path.dirname(__file__), '..', '..', 'brand-book.html')
open(out, 'w').write(doc)
print('pages', len(core.PAGES), 'bytes', len(doc))
