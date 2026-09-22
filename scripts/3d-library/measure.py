"""Measure raw source sizes for one or more Drive files: python3 measure.py <path regex>...

Imports each downloaded match on its own with convert.py --measure and
prints its size in raw units and the unit it declares, so the unit
decision per product is made from evidence, not assumed."""
import json, re, subprocess, sys, tempfile
from pathlib import Path
HERE = Path(__file__).resolve().parent
inv = json.loads((HERE / 'inventory.json').read_text())
py = HERE / 'work' / 'venv' / 'bin' / 'python'
for pat in sys.argv[1:]:
    for f in inv['files']:
        if not re.search(pat, f['path']):
            continue
        src = next((HERE / 'work' / 'src').glob(f"{f['driveId']}.*"), None)
        if not src:
            print(f"MISSING  {f['path']}"); continue
        if src.suffix.lower() in ('.stp', '.step', '.fcstd'):
            out = tempfile.mkdtemp()
            r = subprocess.run([str(py), str(HERE / 'cad_to_stl.py'), str(src), out], capture_output=True, text=True)
            if r.returncode: print(f"FAIL {f['path']}: {r.stderr[-300:]}"); continue
            rep = json.loads(r.stdout)
            srcs = rep['files']; note = f"declared {rep['declaredUnit']}"
        else:
            srcs = [str(src)]; note = ''
        job = {'file': 'm', 'outDir': tempfile.mkdtemp(), 'parts': [{'name': f'p{i}', 'src': s} for i, s in enumerate(srcs)]}
        jp = Path(tempfile.mkdtemp()) / 'job.json'; jp.write_text(json.dumps(job))
        r = subprocess.run([str(py), str(HERE / 'convert.py'), str(jp), '--measure'], capture_output=True, text=True)
        line = next((l for l in r.stdout.splitlines() if l.startswith('REPORT ')), None)
        if not line: print(f"FAIL {f['path']}: {(r.stderr or r.stdout)[-300:]}"); continue
        rep = json.loads(line[7:])
        for p in rep['parts']:
            print(f"{f['path'].split('/',1)[1]:55s} size {p['rawSize']} tris {p['trisIn']:>7} unit[{p['declaredUnit']}] mats{p['materials'][:4]} {note}")
        for n in rep['notes']: print('   NOTE', n)
