"""Build public/models/library/v1 from products.json and the downloaded sources.

    python3 build.py [slug ...]      # all products, or just the named ones

Inputs
  products.json         settled names, codes and which Drive files make each
                        product (hand-authored from inventory.json)
  work/src/<driveId>.*  the Drive originals, downloaded read-only (see README)

Outputs
  public/models/library/v1/<slug>/<file>.glb           assembled, parts as named nodes
  public/models/library/v1/<slug>/parts/<file>--<part>.glb
  public/models/library/v1/<slug>/<file>.png           512 px three-quarter thumbnail
  public/models/library/v1/manifest.json

Needs: the venv with bpy and cadquery-ocp (VENV env var, default ./work/venv),
and `npm i` in this directory for glTF-Transform, three and playwright-core.
"""

import datetime as dt
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
LIB = REPO / 'public' / 'models' / 'library' / 'v1'
WORK = Path(os.environ.get('WORK', HERE / 'work'))
SRC = WORK / 'src'
VENV_PY = Path(os.environ.get('VENV', WORK / 'venv')) / 'bin' / 'python'
LIBRARY_VERSION = '1.0.0'
MAX_BYTES = 3 * 1024 * 1024
MAX_TRIS = 150_000


def run(cmd: list[str], **kw) -> str:
    res = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if res.returncode != 0:
        raise RuntimeError(f'{Path(cmd[1]).name} failed: {(res.stderr or res.stdout).strip()[-800:]}')
    return res.stdout


def report_line(out: str) -> dict:
    for line in out.splitlines():
        if line.startswith('REPORT '):
            return json.loads(line[7:])
    raise RuntimeError('convert.py printed no report')


def local_source(drive_id: str) -> Path:
    hits = [p for p in SRC.glob(f'{drive_id}.*') if p.is_file()]
    if not hits:
        raise FileNotFoundError(f'source {drive_id} not downloaded')
    return hits[0]


def resolve_parts(product: dict, tmp: Path) -> tuple[list[dict], list[str]]:
    """Turn products.json part entries into convert.py job parts.

    CAD masters (STEP, FreeCAD) are tessellated to STL first."""
    parts, notes = [], []
    for part in product['parts']:
        src = local_source(part['driveId'])
        if src.suffix.lower() in ('.stp', '.step', '.fcstd'):
            out_dir = tmp / 'cad' / part['name']
            rep = json.loads(run([str(VENV_PY), str(HERE / 'cad_to_stl.py'), str(src), str(out_dir)]))
            notes.append(f"{part['name']}: tessellated from {src.suffix} ({rep['solids']} solids, declared {rep['declaredUnit']})")
            for i, stl in enumerate(rep['files']):
                name = part['name'] if len(rep['files']) == 1 else f"{part['name']}-{i + 1:02d}"
                parts.append({'name': name, 'role': part.get('role', 'body'), 'src': stl})
        else:
            entry = {'name': part['name'], 'role': part.get('role', 'body'), 'src': str(src)}
            if part.get('objects'):
                entry['objects'] = part['objects']
            parts.append(entry)
    return parts, notes


def build(product: dict) -> dict:
    slug, file = product['slug'], product['file']
    base = {k: product[k] for k in ('name', 'codes', 'family') if k in product}
    base.update({'slug': slug, 'file': file,
                 'sourceDriveIds': [p['driveId'] for p in product.get('parts', [])] + product.get('extraSourceIds', [])})
    for k in ('variants', 'notes'):
        if product.get(k):
            base[k] = list(product[k])
    base.setdefault('notes', [])

    if product.get('status') == 'failed':
        base.update({'status': 'failed', 'reason': product['reason']})
        if product.get('fallbackStill'):
            base['fallbackStill'] = product['fallbackStill']
        return base

    tmp = WORK / 'build' / slug
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True)
    out_dir = LIB / slug
    shutil.rmtree(out_dir, ignore_errors=True)
    (out_dir / 'parts').mkdir(parents=True)

    parts, cad_notes = resolve_parts(product, tmp)
    base['notes'] += cad_notes
    job = {'file': file, 'outDir': str(tmp), 'triBudget': product.get('triBudget', 140_000),
           'toMm': product.get('toMm'), 'rotate': product.get('rotate', [0, 0, 0]), 'parts': parts}
    (tmp / 'job.json').write_text(json.dumps(job, indent=2))
    rep = report_line(run([str(VENV_PY), str(HERE / 'convert.py'), str(tmp / 'job.json')]))
    base['notes'] += rep['notes']

    # Compress: assembled file and each part.
    asm = json.loads(run(['node', str(HERE / 'optimize.mjs'), rep['rawGlb'], str(out_dir / f'{file}.glb')]))
    part_out = []
    for p in rep['parts']:
        dst = out_dir / 'parts' / f"{file}--{p['name']}.glb"
        po = json.loads(run(['node', str(HERE / 'optimize.mjs'), p['rawGlb'], str(dst)]))
        part_out.append({
            'name': p['name'], 'role': p['role'], 'source': p['src'],
            'path': str(dst.relative_to(LIB)), 'bytes': po['bytes'], 'triangles': po['tris'],
            'bboxMm': p['bboxMm'], 'sourceUnit': p['declaredUnit'], 'unitResolution': p['unitSource'],
            'materialsInSource': p['materials'],
        })

    roles = {p['name']: p['role'] for p in rep['parts']}
    thumb = out_dir / f'{file}.png'
    th = json.loads(run(['node', str(HERE / 'thumbnail.mjs'), str(out_dir / f'{file}.glb'), str(thumb), json.dumps(roles)]))

    problems = list(product.get('degradedBecause', []))
    if asm['bytes'] > MAX_BYTES:
        problems.append(f"assembled glb is {asm['bytes'] / 1048576:.2f} MB, over the 3 MB target")
    if asm['tris'] > MAX_TRIS:
        problems.append(f"{asm['tris']} triangles, over the 150k target")
    if rep['decimateRatio'] < 0.25:
        problems.append(f"decimated to {rep['decimateRatio']:.0%} of source triangles; check fine detail against the renders")
    if product.get('toMm') is not None:
        base['notes'].append(f"unit override: 1 source unit = {product['toMm']:g} mm ({product.get('toMmReason', 'no reason given')})")

    base.update({
        'status': 'degraded' if problems else 'ok',
        **({'reason': '; '.join(problems)} if problems else {}),
        'units': 'mm', 'unitScale': 0.001, 'upAxis': 'Y',
        'assembled': {'path': str((out_dir / f'{file}.glb').relative_to(LIB)), 'bytes': asm['bytes'],
                      'nodes': asm['nodes']},
        'thumbnail': str(thumb.relative_to(LIB)),
        'thumbnailMaterials': 'source' if th['hasMaterials'] else 'brand defaults (body ink-600, accent brand-blue #1E80BA)',
        'triangles': asm['tris'],
        'trianglesSource': rep['trisIn'],
        'bboxMm': rep['bboxMm'],
        'parts': part_out,
    })
    return base


def main() -> None:
    products = json.loads((HERE / 'products.json').read_text())
    only = set(sys.argv[1:])
    manifest_path = LIB / 'manifest.json'
    previous = {}
    if only and manifest_path.exists():
        previous = {p['slug']: p for p in json.loads(manifest_path.read_text())['products']}
    out = []
    for product in products['products']:
        if only and product['slug'] not in only:
            if product['slug'] in previous:
                out.append(previous[product['slug']])
            continue
        print(f"== {product['slug']}", file=sys.stderr)
        try:
            out.append(build(product))
        except Exception as e:  # recorded, not swallowed: it lands in the manifest
            out.append({'slug': product['slug'], 'file': product['file'], 'name': product['name'],
                        'codes': product.get('codes'), 'family': product.get('family'),
                        'sourceDriveIds': [p['driveId'] for p in product.get('parts', [])],
                        'status': 'failed', 'reason': f'conversion error: {e}'})
        print(f"   {out[-1]['status']} {out[-1].get('reason', '')}", file=sys.stderr)
    LIB.mkdir(parents=True, exist_ok=True)
    manifest = {
        'library': 'SuDS Enviro 3D product library',
        'version': LIBRARY_VERSION,
        'generated': dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        'conventions': {
            'units': 'Millimetres: 1 glTF unit = 1 mm. glTF assumes metres, so scale by unitScale (0.001) for AR or physically based lighting.',
            'upAxis': 'Y, product base at y = 0, centred on x and z',
            'compression': 'EXT_meshopt_compression with KHR_mesh_quantization; three.js needs GLTFLoader.setMeshoptDecoder',
            'naming': 'Settled product names and codes per the SuDS Enviro brand system naming section; sales code first, drawing code carried alongside until the mapping is written',
            'paths': 'Relative to this manifest',
        },
        'noAsset': products.get('noAsset', []),
        'products': out,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'wrote {manifest_path}', file=sys.stderr)


if __name__ == '__main__':
    main()
