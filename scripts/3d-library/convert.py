"""Convert one product's source meshes to glTF with Blender (bpy, headless).

    python convert.py job.json            # convert
    python convert.py job.json --measure  # import only, print raw sizes

A job names the product, its parts and where each part comes from:

    {
      "file": "rhinopod-serpod1850",      # output basename
      "outDir": ".../public/models/library/v1/rhinopod",
      "triBudget": 150000,
      "toMm": null,                       # override the declared unit (see below)
      "rotate": [0, 0, 0],                # degrees, applied after import, before Y-up export
      "parts": [
        {"name": "casing", "role": "body", "src": ".../Casing.fbx"},
        {"name": "lid", "role": "accent", "src": ".../Breakdown.blend", "objects": ["Lid"]}
      ]
    }

Units: the unit each file declares is recorded and geometry is scaled to
millimetres. STL and OBJ are read raw; Blender's FBX importer applies the
file's UnitScaleFactor itself and hands back metres. glTF says one
unit is one metre; this library deliberately stores millimetres so that
dimensions read straight off the model, and the manifest carries
unitScale 0.001 for any viewer that needs metres. Where a file's declared
unit is contradicted by the product's nominal size, the job sets toMm and
the manifest says why.

Axes: Blender is Z-up. The glTF exporter converts to Y-up on the way out.
"""

import json
import math
import struct
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector


def reset() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0


# ---------- declared units ----------------------------------------------

def fbx_unit_scale(path: Path) -> float | None:
    """UnitScaleFactor from an FBX's GlobalSettings, in centimetres per unit."""
    data = path.read_bytes()
    if data[:18] == b'Kaydara FBX Binary':
        i = data.find(b'UnitScaleFactor')
        if i < 0:
            return None
        # A P record: name, then type strings, then a 'D' double value.
        j = data.find(b'D', i + 15, i + 120)
        while j > 0:
            try:
                v = struct.unpack('<d', data[j + 1:j + 9])[0]
                if 1e-6 < v < 1e6:
                    return v
            except struct.error:
                return None
            j = data.find(b'D', j + 1, i + 120)
        return None
    text = data[:200_000].decode('latin-1', 'ignore')
    k = text.find('"UnitScaleFactor"')
    if k < 0:
        return None
    try:
        return float(text[k:k + 120].rstrip().split(',')[-1].split()[0])
    except ValueError:
        return None


def declared_unit(path: Path) -> tuple[str, float | None]:
    """(label, millimetres per file unit) as the file itself declares it."""
    ext = path.suffix.lower()
    if ext == '.fbx':
        cm = fbx_unit_scale(path)
        if cm is None:
            return ('fbx: no UnitScaleFactor', None)
        # Blender's importer has already applied this factor and brought the
        # geometry in as metres, so a metre is the unit left to convert.
        return (f'fbx UnitScaleFactor {cm:g} (1 file unit = {cm * 10:g} mm)', 1000.0)
    if ext == '.stl':
        return ('stl: unitless', None)
    if ext == '.obj':
        return ('obj: unitless', None)
    if ext == '.blend':
        us = bpy.context.scene.unit_settings  # read after the blend is loaded
        return (f'blend scale_length {us.scale_length:g} {us.length_unit}', us.scale_length * 1000)
    return (f'{ext}: unknown', None)


# ---------- import ------------------------------------------------------

def import_source(src: Path, object_names: list[str] | None) -> list[bpy.types.Object]:
    before = set(bpy.data.objects)
    ext = src.suffix.lower()
    if ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=str(src), use_custom_props=False)
    elif ext == '.stl':
        bpy.ops.wm.stl_import(filepath=str(src))
    elif ext == '.obj':
        bpy.ops.wm.obj_import(filepath=str(src))
    elif ext in ('.glb', '.gltf'):
        bpy.ops.import_scene.gltf(filepath=str(src))
    elif ext == '.blend':
        with bpy.data.libraries.load(str(src), link=False) as (data_from, data_to):
            data_to.objects = [n for n in data_from.objects if not object_names or n in object_names]
        for ob in data_to.objects:
            if ob is not None:
                bpy.context.scene.collection.objects.link(ob)
    else:
        raise ValueError(f'unsupported source {ext}')
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == 'MESH']
    if object_names and ext != '.blend':
        meshes = [o for o in meshes if o.name.split('.')[0] in object_names]
    # Drop anything not in the scene or hidden from render in the source.
    return [o for o in meshes if o.name in bpy.context.scene.objects and not o.hide_render]


def join_as(objs: list[bpy.types.Object], name: str) -> bpy.types.Object:
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    # Parent transforms from FBX/blend hierarchies must be baked before joining.
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.make_single_user(object=True, obdata=True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(objs) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    ob.data.name = name
    return ob


def slug(name: str) -> str:
    import re
    return re.sub(r'[^a-z0-9]+', '-', name.lower().split('.')[0]).strip('-') or 'part'


def tri_count(ob: bpy.types.Object) -> int:
    ob.data.calc_loop_triangles()
    return len(ob.data.loop_triangles)


def weld(ob: bpy.types.Object, dist: float) -> None:
    # STL has no shared vertices; weld so normals and decimation behave.
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=dist)
    bm.to_mesh(ob.data)
    bm.free()


def bbox(obs: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    lo = Vector((math.inf,) * 3)
    hi = Vector((-math.inf,) * 3)
    for ob in obs:
        for c in ob.bound_box:
            w = ob.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi


def yup_box(lo: Vector, hi: Vector) -> dict:
    """A Blender Z-up box restated in the glb's Y-up frame: x, y (up), z."""
    return {'min': [round(lo.x, 1), round(lo.z, 1), round(-hi.y, 1)],
            'max': [round(hi.x, 1), round(hi.z, 1), round(-lo.y, 1)],
            'size': [round(hi.x - lo.x, 1), round(hi.z - lo.z, 1), round(hi.y - lo.y, 1)]}


def export(objs: list[bpy.types.Object], path: Path) -> None:
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(path), export_format='GLB', use_selection=True,
        export_yup=True, export_apply=True, export_materials='EXPORT',
        export_extras=False, export_cameras=False, export_lights=False,
        export_animations=False, export_draco_mesh_compression_enable=False,
    )


# ---------- main --------------------------------------------------------

def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text())
    measure = '--measure' in sys.argv
    reset()
    report = {'file': job['file'], 'parts': [], 'notes': []}
    parts = []
    for p in job['parts']:
        src = Path(p['src'])
        objs = import_source(src, p.get('objects'))
        if not objs:
            report['notes'].append(f"{p['name']}: no mesh objects imported from {src.name}")
            continue
        label, file_mm = declared_unit(src)
        # split: a breakdown scene, one part per mesh object, named after it.
        groups = [([o], slug(o.name)) for o in objs] if p.get('split') else [(objs, p['name'])]
        for group, name in groups:
            ob = join_as(group, name)
            lo, hi = bbox([ob])
            role = p.get('role', 'body')
            if p.get('split'):
                role = next((r for k, r in (p.get('roles') or {}).items() if k.replace('-', '') in name.replace('-', '')), 'body')
            entry = {'name': ob.name, 'role': role, 'src': src.name,
                     'declaredUnit': label, 'declaredMmPerUnit': file_mm,
                     'rawSize': [round(v, 4) for v in (hi - lo)],
                     'trisIn': tri_count(ob),
                     'materials': [m.name for m in ob.data.materials if m]}
            parts.append((ob, entry, src))
    if measure:
        report['parts'] = [e for _, e, _ in parts]
        print('REPORT ' + json.dumps(report))
        return

    # Scale to millimetres: the job override wins, else the file's own claim,
    # else unitless (STL) sources are taken as millimetres, which is what the
    # CAD exports in this Drive use.
    for ob, e, src in parts:
        if job.get('toMm') is not None:
            k = float(job['toMm'])
            e['toMm'] = k
            e['unitSource'] = 'job override'
        elif e['declaredMmPerUnit']:
            k = e['declaredMmPerUnit']
            e['toMm'] = k
            e['unitSource'] = 'declared'
        else:
            k = 1.0
            e['toMm'] = k
            e['unitSource'] = 'assumed mm (unitless source)'
        ob.scale = (k, k, k)
        rx, ry, rz = (math.radians(a) for a in job.get('rotate', [0, 0, 0]))
        ob.rotation_euler = (rx, ry, rz)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        if src.suffix.lower() in ('.stl',):
            weld(ob, 0.01)

    # Base the product at the origin: centred in plan, sitting on z = 0.
    objs = [ob for ob, _, _ in parts]
    lo, hi = bbox(objs)
    shift = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    for ob in objs:
        ob.data.transform(Matrix.Translation(-shift))
        ob.data.update()

    # Decimate to the product budget, one ratio for every part so detail
    # stays proportional. Parts already small are left alone.
    total = sum(tri_count(o) for o in objs)
    budget = int(job.get('triBudget', 150000))
    ratio = min(1.0, budget / total) if total else 1.0
    for ob, e, _ in parts:
        if ratio < 1.0 and tri_count(ob) > 2000:
            bpy.context.view_layer.objects.active = ob
            mod = ob.modifiers.new('decimate', 'DECIMATE')
            mod.decimate_type = 'COLLAPSE'
            mod.ratio = ratio
            mod.use_collapse_triangulate = True
            bpy.ops.object.select_all(action='DESELECT')
            ob.select_set(True)
            bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(30))
        e['trisOut'] = tri_count(ob)
        e['bboxMm'] = yup_box(*bbox([ob]))

    out_dir = Path(job['outDir'])
    out_dir.mkdir(parents=True, exist_ok=True)
    raw_dir = out_dir / '_raw'
    raw_dir.mkdir(exist_ok=True)
    for ob, e, _ in parts:
        dst = raw_dir / f"{job['file']}--{ob.name}.glb"
        export([ob], dst)
        e['rawGlb'] = str(dst)

    # Assembled file: one root node named for the product, parts beneath it.
    root = bpy.data.objects.new(job['file'], None)
    bpy.context.scene.collection.objects.link(root)
    for ob in objs:
        ob.parent = root
    root.select_set(True)
    dst = raw_dir / f"{job['file']}.glb"
    export([root] + objs, dst)

    lo, hi = bbox(objs)
    report.update({
        'rawGlb': str(dst),
        'decimateRatio': round(ratio, 4),
        'trisIn': total,
        'trisOut': sum(e['trisOut'] for _, e, _ in parts),
        'bboxMm': yup_box(lo, hi),
        'parts': [e for _, e, _ in parts],
    })
    print('REPORT ' + json.dumps(report))


if __name__ == '__main__':
    main()
