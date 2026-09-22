"""Assemble the review page's catalog.json and file map from a staging build.

    python3 review/make_catalog.py <staging dir> <out dir>

Writes <out dir>/catalog.json and copies each assembled glb and thumbnail
to <out dir>/models/ and <out dir>/thumbs/, which is what the review
artifact publishes beside index.html.
"""

import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
staging, out = Path(sys.argv[1]), Path(sys.argv[2])
manifest = json.loads((staging / 'manifest.json').read_text())
products = json.loads((HERE / 'products.json').read_text())
inventory = json.loads((HERE / 'inventory.json').read_text())
report_path = HERE / 'work' / 'download-report.json'
dl_failed = {f['driveId']: f.get('error', 'download failed') for f in json.loads(report_path.read_text()).get('failed', [])} if report_path.exists() else {}

# inventory family label -> review family id
FAMILY = {
    'SudSceptor': 'sudsceptor', 'RhinoPod': 'rhinopod', 'RhinoPit': 'rhinopit', 'RhinoShield': 'rhinoshield',
    'RhinoDuct': 'rhinoduct', 'RhinoRoFlo': 'rhinoroflo', 'RhinoRoTex': 'rhinorotex', 'Rhino FloLock': 'rhino-flolock',
    'RhinoLift': 'rhinolift', 'Rhino inspection chamber': 'rhino-inspection-chamber',
    'Rhino inspection chamber base': 'rhino-inspection-chamber', 'Rhino inspection chamber cap': 'rhino-inspection-chamber',
    'Grease trap (no settled name)': 'grease-trap', 'Pipe adapters (no settled name)': 'adapters',
    'Siphon housing (R&D, no settled name)': 'siphon-housing', 'Bell siphon (R&D, no settled name)': 'siphon-housing',
    'Icon study': 'icon-study', 'Stock hardware': 'other',
}

(out / 'models').mkdir(parents=True, exist_ok=True)
(out / 'thumbs').mkdir(parents=True, exist_ok=True)
items = []
for m in manifest['products']:
    it = {k: m.get(k) for k in ('slug', 'name', 'codes', 'family', 'status', 'reason', 'notes', 'variants',
                                'triangles', 'bboxMm')}
    if m.get('assembled'):
        src_glb = staging / m['assembled']['path']
        shutil.copy(src_glb, out / 'models' / f"{m['slug']}.glb")
        it['glb'] = f"models/{m['slug']}.glb"
        it['bytes'] = m['assembled']['bytes']
    if m.get('thumbnail'):
        shutil.copy(staging / m['thumbnail'], out / 'thumbs' / f"{m['slug']}.png")
        it['thumbnail'] = f"thumbs/{m['slug']}.png"
    it['parts'] = [{'name': p['name'], 'role': p['role'], 'triangles': p['triangles']} for p in m.get('parts', [])]
    items.append({k: v for k, v in it.items() if v not in (None, [], '')})

# Files in Drive that did not become a model, with the reason, per family.
used = {i for p in products['products'] for i in [x['driveId'] for x in p.get('parts', [])]}
variant_note = {}
for p in products['products']:
    for v in p.get('variants', []):
        variant_note[v.rsplit('Drive ', 1)[-1].rstrip(')')] = f"other size, noted on {p['name']}"
skipped = []
for f in inventory['files']:
    if f['driveId'] in used:
        continue
    if f['disposition'] in ('skip', 'failed'):
        reason = f.get('reason', f['disposition'])
    elif f['driveId'] in dl_failed:
        reason = f"could not be downloaded: {dl_failed[f['driveId']]}"
    elif f['driveId'] in variant_note:
        reason = variant_note[f['driveId']]
    else:
        reason = 'duplicate or alternative source for a converted model (Breakdown scene or STL master)'
    skipped.append({'family': FAMILY.get(f['family'], 'other'), 'path': f['path'].split('/', 1)[1],
                    'reason': reason, 'bytes': f['bytes']})

families = products['families'] + [{'id': 'other', 'name': 'Other files', 'note': 'Not SuDS Enviro product models.'}]
(out / 'catalog.json').write_text(json.dumps({'families': families, 'items': items, 'skipped': skipped}, indent=1))
print(f"{len(items)} items, {len(skipped)} not-converted files; "
      f"{sum(1 for i in items if i['status'] == 'ok')} ok, {sum(1 for i in items if i['status'] == 'degraded')} degraded, "
      f"{sum(1 for i in items if i['status'] == 'failed')} failed")
