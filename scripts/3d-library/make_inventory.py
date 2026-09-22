"""Write inventory.json from the raw Drive crawl.

    python3 make_inventory.py <crawl dir>

The crawl (files.json, renders.json) is a read-only listing of the SuDS 3D
Assets and Moulded bases STEP folders. This script classifies every file:
which settled product family it belongs to, and whether it is a
conversion candidate, a size variant noted but not converted, or skipped
and why. Family names follow the brand system's naming section, not the
Drive folder names.
"""

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Drive folder (or loose-file pattern) -> settled family
FAMILY_BY_FOLDER = {
    'Hydrdynamic Separaters': 'SudSceptor',
    'SEHDS': 'SudSceptor',
    'Rhino Pod': 'RhinoPod',
    'SERPT': 'RhinoPit',
    'SERSD': 'RhinoShield',
    'RhinoDuct': 'RhinoDuct',
    'Orifice Flow Control': 'RhinoRoFlo',
    'Vortex Flow Control': 'RhinoRoTex',
    'Pumping Stations': 'RhinoLift',
    'SERSIC': 'Rhino inspection chamber',
    'Grease Traps': 'Grease trap (no settled name)',
    'Adapters': 'Pipe adapters (no settled name)',
    'Siphon Housing': 'Siphon housing (R&D, no settled name)',
    'Bell Siphon': 'Bell siphon (R&D, no settled name)',
    'Icon': 'Icon study',
    'Nurs And Bolts': 'Stock hardware',
    'Moulded bases STEP': 'Rhino inspection chamber base',
}

LOOSE = [
    (r'^(ChamberRim|BodyBase|InletTube|5 Inlet)\.fbx$', 'Rhino inspection chamber'),
    (r'^5 Inlet Base\.(stl|3mf)$', 'Rhino inspection chamber'),
    (r'^(SERCIC|FIC)\d', 'Rhino inspection chamber'),
    (r'^SERFP', 'RhinoRoFlo'),
    (r'^Rhinopod\.stl$', 'RhinoPod'),
    (r'^RhinoDuct\.stl$', 'RhinoDuct'),
    (r'^Flow Control Tank', 'RhinoRoTex'),
]

SKIP_EXT = {
    'blend1': 'Blender backup',
    '3mf': 'slicer file',
    'fcbak': 'FreeCAD backup',
    'gcode': 'printer toolpath',
    'cxprj': '3D-print slicer project',
    'pdf': '2D drawing, not geometry',
    'dwg': '2D drawing, not geometry',
    'svg': '2D artwork',
    'mtl': 'OBJ material sidecar, read with its OBJ',
    'zip': 'archive duplicating the STP/OBJ beside it',
}


def classify(f: dict) -> dict:
    path = f['path']
    rel = path.split('/', 1)[1] if '/' in path else path
    parts = rel.split('/')
    folder = parts[0] if len(parts) > 1 else None
    name = parts[-1]
    ext = (f.get('fileExtension') or name.rsplit('.', 1)[-1]).lower()
    root = path.split('/', 1)[0]

    family = None
    if root == 'Moulded bases STEP':
        family = FAMILY_BY_FOLDER[root]
        if name.lower().startswith('cap with dust cap'):
            family = 'Rhino inspection chamber cap'
    elif folder:
        family = FAMILY_BY_FOLDER.get(folder)
        if folder == 'Vortex Flow Control' and name.startswith('FloLock'):
            family = 'Rhino FloLock'
    else:
        for pat, fam in LOOSE:
            if re.search(pat, name, re.I):
                family = fam
                break

    disposition, reason = 'candidate', None
    if ext in SKIP_EXT:
        disposition, reason = 'skip', SKIP_EXT[ext]
    elif ext in ('sldprt', 'sldasm'):
        disposition, reason = 'failed', 'needs SolidWorks'
    elif ext in ('mb', 'ma'):
        disposition, reason = 'failed', 'needs Maya'
    elif name.startswith('uploads_files_'):
        disposition = 'skip' if ext not in ('sldprt', 'sldasm') else disposition
        reason = (reason + '; ' if reason else '') + 'third-party marketplace download (uploads_files_ prefix), not a SuDS Enviro product model'
    elif family == 'Siphon housing (R&D, no settled name)' and name.startswith(('First Test', 'Unnamed')):
        disposition, reason = 'skip', 'print test iteration'

    return {
        'driveId': f['id'],
        'path': path,
        'root': root,
        'family': family or 'unassigned',
        'format': ext,
        'bytes': int(f['fileSize']) if f.get('fileSize') else None,
        'modified': f.get('modifiedTime'),
        'disposition': disposition,
        **({'reason': reason} if reason else {}),
    }


def main() -> None:
    crawl = Path(sys.argv[1])
    files = json.loads((crawl / 'files.json').read_text())
    renders = json.loads((crawl / 'renders.json').read_text())
    items = sorted((classify(f) for f in files), key=lambda r: (r['family'], r['path']))
    by_disp: dict[str, int] = {}
    for r in items:
        by_disp[r['disposition']] = by_disp.get(r['disposition'], 0) + 1
    inventory = {
        'generated': '2026-09-22',
        'sources': {
            'SuDS 3D Assets': '1WvecnphSfOJQLiQZ0cp0i6fTL4LmVTce',
            'Moulded bases STEP': '1AdGuYRinP4OQXELiD208G-OtNqY6dAWe',
            'Product Renders': '1yBYnOf6YSDi2uK3ca1jIBrP9RPwx2IJ6',
            'STYLISED Renders': '1ZC-lFCc6JPbp0TgMEkF7VoOn8x4lCwpI',
        },
        'excluded': {
            'Vortex Project 11OzVl6EghwjXkWqHV6aaHB8R4JuHLqft': 'bell siphon R&D and print iterations, left alone as instructed',
            'Big_White_Rhino_Animated_MAYA 1mtiulzzsN8x-JZtFUFQYVYcvH221rodX': 'Maya scene, no render; left alone as instructed',
            'New TrNSFER/OneDrive_2024-09-25/Renders 230223': 'second copy of the render set; Product Renders treated as canonical',
        },
        'summary': {'files': len(items), 'bytes': sum(r['bytes'] or 0 for r in items), 'byDisposition': by_disp},
        'files': items,
        'renders': renders,
    }
    out = HERE / 'inventory.json'
    out.write_text(json.dumps(inventory, indent=2) + '\n')
    print(json.dumps(inventory['summary']))
    for r in items:
        if r['family'] == 'unassigned':
            print('UNASSIGNED', r['path'])


if __name__ == '__main__':
    main()
