"""Resolve products.src.json into products.json with Drive ids.

    python3 resolve_products.py

Every path regex must match exactly one inventory entry, so a typo or an
ambiguous pattern fails here rather than converting the wrong file. Where
a product's parts are not all downloaded (the Drive tool returns very
small files inline, which cannot be saved reliably) and its Breakdown
.blend is, the product is switched to build from the .blend, one part per
mesh object, and says so in its notes.
"""

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
inv = json.loads((HERE / 'inventory.json').read_text())
src = json.loads((HERE / 'products.src.json').read_text())
downloaded = {p.name.split('.')[0] for p in (HERE / 'work' / 'src').glob('*') if p.is_file()}


def one(pattern: str) -> dict:
    hits = [f for f in inv['files'] if re.search(pattern, f['path'])]
    if len(hits) != 1:
        raise SystemExit(f'{pattern!r} matched {len(hits)} inventory entries: {[h["path"] for h in hits]}')
    return hits[0]


def label(f: dict) -> str:
    return f"{f['path'].split('/', 1)[1]} ({f['bytes'] / 1048576:.1f} MB, Drive {f['driveId']})"


out = []
for p in src['products']:
    q = {k: v for k, v in p.items() if k not in ('parts', 'variantPaths', 'blendFallback', 'extraPaths')}
    q['notes'] = list(p.get('notes', []))
    if p.get('variantPaths'):
        q['variants'] = [label(one(v)) for v in p['variantPaths']]
    if p.get('extraPaths'):
        q['extraSourceIds'] = [f['driveId'] for f in inv['files'] if any(x in f['path'] for x in p['extraPaths'])]
    if p.get('status') == 'failed':
        out.append(q)
        continue
    parts = []
    for part in p['parts']:
        f = one(part['path'])
        parts.append({'name': part['name'], 'role': part['role'], 'driveId': f['driveId'], 'sourcePath': f['path']})
    missing = [x for x in parts if x['driveId'] not in downloaded]
    if missing and p.get('blendFallback'):
        blend = one(p['blendFallback'])
        if blend['driveId'] in downloaded:
            q['notes'].append(
                f"built from {blend['path'].split('/', 1)[1]} because these parts could not be downloaded on their own: "
                + ', '.join(m['sourcePath'].rsplit('/', 1)[1] for m in missing))
            parts = [{'name': 'from-blend', 'role': 'body', 'driveId': blend['driveId'],
                      'sourcePath': blend['path'], 'split': True, 'roles': {**{x['name']: x['role'] for x in parts}, **p.get('sceneRoles', {})}}]
            missing = []
    if missing and len(missing) < len(parts):
        # Build what arrived and say what is absent, rather than show nothing.
        q['degradedBecause'] = q.get('degradedBecause', []) + ['missing parts that could not be downloaded from Drive: '
                                + ', '.join(m['sourcePath'].rsplit('/', 1)[1] for m in missing)]
        parts = [x for x in parts if x not in missing]
    elif missing:
        q['status'] = 'failed'
        q['reason'] = 'source not downloaded: ' + ', '.join(m['sourcePath'] for m in missing)
    q['parts'] = parts
    out.append(q)

(HERE / 'products.json').write_text(json.dumps({'families': src['families'], 'noAsset': src.get('noAsset', []), 'products': out}, indent=2) + '\n')
for q in out:
    print(f"{q['slug']:40s} {q.get('status', 'ready'):8s} {len(q.get('parts', []))} parts  {q.get('reason', '')[:90]}")
