"""Tessellate CAD masters (STEP, FreeCAD .fcstd) to STL with OpenCASCADE.

Blender cannot read B-rep formats, so these go through OCP first and come
out as millimetre STL for convert.py to pick up like any other mesh.

    python cad_to_stl.py <in.stp|in.fcstd> <out_dir> [--deflection 0.5]

Writes one STL per solid (or one per FreeCAD shape) plus a JSON report on
stdout: the unit the file declares, solid count, and the files written.

FreeCAD documents are zip archives. Each feature's final shape is stored
as an OpenCASCADE .brp file referenced from Document.xml, so they can be
read without FreeCAD itself. Only shapes marked visible in GuiDocument.xml
are kept, which drops the construction bodies a parametric model carries.
"""

import json
import re
import sys
import tempfile
import zipfile
from pathlib import Path

from OCP.BRep import BRep_Builder
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepTools import BRepTools
from OCP.IFSelect import IFSelect_RetDone
from OCP.STEPControl import STEPControl_Reader
from OCP.StlAPI import StlAPI_Writer
from OCP.TopAbs import TopAbs_SOLID
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS, TopoDS_Shape
from OCP.Interface import Interface_Static


def mesh_and_write(shape: TopoDS_Shape, out: Path, deflection: float) -> None:
    BRepMesh_IncrementalMesh(shape, deflection, False, 0.5, True)
    writer = StlAPI_Writer()
    writer.ASCIIMode = False
    if not writer.Write(shape, str(out)):
        raise RuntimeError(f'STL write failed for {out.name}')


def solids(shape: TopoDS_Shape) -> list[TopoDS_Shape]:
    found = []
    exp = TopExp_Explorer(shape, TopAbs_SOLID)
    while exp.More():
        found.append(TopoDS.Solid_s(exp.Current()))
        exp.Next()
    return found


def step_unit(path: Path) -> str:
    # The header names the length unit in SI_UNIT(.MILLI.,.METRE.) or a
    # CONVERSION_BASED_UNIT('INCH', ...). Read it rather than assume mm.
    head = path.read_bytes()[:400_000].decode('latin-1', 'ignore').upper()
    if re.search(r"CONVERSION_BASED_UNIT\s*\(\s*'INCH'", head):
        return 'inch'
    m = re.search(r'SI_UNIT\s*\(\s*\.(\w+)\.\s*,\s*\.METRE\.\s*\)', head)
    if m:
        return {'MILLI': 'mm', 'CENTI': 'cm'}.get(m.group(1), m.group(1).lower())
    if re.search(r'SI_UNIT\s*\(\s*\$\s*,\s*\.METRE\.\s*\)', head):
        return 'm'
    return 'unknown'


def read_step(path: Path, out_dir: Path, deflection: float) -> dict:
    # OCP converts to its session unit on transfer; pin that to mm.
    Interface_Static.SetCVal_s('xstep.cascade.unit', 'MM')
    reader = STEPControl_Reader()
    if reader.ReadFile(str(path)) != IFSelect_RetDone:
        raise RuntimeError('STEP read failed')
    reader.TransferRoots()
    shape = reader.OneShape()
    parts = solids(shape) or [shape]
    written = []
    for i, s in enumerate(parts):
        out = out_dir / f'{path.stem}-{i:02d}.stl'
        mesh_and_write(s, out, deflection)
        written.append(str(out))
    return {'declaredUnit': step_unit(path), 'solids': len(parts), 'files': written}


def read_fcstd(path: Path, out_dir: Path, deflection: float) -> dict:
    with zipfile.ZipFile(path) as z:
        doc = z.read('Document.xml').decode('utf-8', 'ignore')
        gui = z.read('GuiDocument.xml').decode('utf-8', 'ignore') if 'GuiDocument.xml' in z.namelist() else ''
        hidden = set()
        for m in re.finditer(r'<ViewProvider name="([^"]+)"[^>]*>(.*?)</ViewProvider>', gui, re.S):
            if re.search(r'<Property name="Visibility"[^>]*>\s*<Bool value="false"', m.group(2)):
                hidden.add(m.group(1))
        # <Object name="Body"> ... <Property name="Shape"> <Part file="PartShape.brp"/>
        shapes = []
        for m in re.finditer(r'<Object name="([^"]+)"[^>]*>(.*?)</Object>', doc, re.S):
            f = re.search(r'<Part\s+file="([^"]+\.brp)"', m.group(2))
            if f and m.group(1) not in hidden:
                shapes.append((m.group(1), f.group(1)))
        written, skipped = [], []
        builder = BRep_Builder()
        with tempfile.TemporaryDirectory() as tmp:
            for name, brp in shapes:
                if brp not in z.namelist():
                    skipped.append(name)
                    continue
                local = Path(tmp) / Path(brp).name
                local.write_bytes(z.read(brp))
                shape = TopoDS_Shape()
                BRepTools.Read_s(shape, str(local), builder)
                if shape.IsNull() or not solids(shape):
                    skipped.append(name)
                    continue
                out = out_dir / f'{path.stem}-{name}.stl'
                mesh_and_write(shape, out, deflection)
                written.append(str(out))
    # FreeCAD's internal length unit is always the millimetre.
    return {'declaredUnit': 'mm', 'solids': len(written), 'files': written,
            'hiddenSkipped': sorted(hidden), 'emptySkipped': skipped}


def main() -> None:
    src, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    deflection = float(sys.argv[sys.argv.index('--deflection') + 1]) if '--deflection' in sys.argv else 0.5
    out_dir.mkdir(parents=True, exist_ok=True)
    ext = src.suffix.lower()
    if ext in ('.stp', '.step'):
        report = read_step(src, out_dir, deflection)
    elif ext == '.fcstd':
        report = read_fcstd(src, out_dir, deflection)
    else:
        raise SystemExit(f'unsupported: {ext}')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
