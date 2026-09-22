"""Tessellate CAD masters (STEP, FreeCAD .fcstd) to STL with OpenCASCADE.

Blender cannot read B-rep formats, so these go through OCP first and come
out as millimetre STL for convert.py to pick up like any other mesh.

    python cad_to_stl.py <in.stp|in.fcstd> <out_dir> [--deflection 0.5]

Writes one STL per solid (or one per FreeCAD shape) plus a JSON report on
stdout: the unit the file declares, solid count, and the files written.

FreeCAD documents are zip archives. Each feature's final shape is stored
as an OpenCASCADE .brp file referenced from Document.xml, so they can be
read without FreeCAD itself. Only each PartDesign Body's finished shape is
taken, not the sketches and features that built it.
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


# OCP renamed the static downcasts between releases (Solid_s vs Solid).
_solid = getattr(TopoDS, 'Solid_s', None) or getattr(TopoDS, 'Solid')


def solids(shape: TopoDS_Shape) -> list[TopoDS_Shape]:
    found = []
    exp = TopExp_Explorer(shape, TopAbs_SOLID)
    while exp.More():
        found.append(_solid(exp.Current()))
        exp.Next()
    return found


def step_unit(path: Path) -> str:
    # The file names its length unit in SI_UNIT(.MILLI.,.METRE.) or a
    # CONVERSION_BASED_UNIT('INCH', ...). Read it rather than assume mm.
    head = path.read_bytes().decode('latin-1', 'ignore').upper()
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
    # Each PartDesign Body stores its finished solid as <Body>.Shape.brp;
    # sketches, pads and fillets beneath it are construction history.
    with zipfile.ZipFile(path) as z:
        names = set(z.namelist())
        doc = z.read('Document.xml').decode('utf-8', 'ignore')
        bodies = re.findall(r'<Object\s+type="PartDesign::Body"\s+name="([^"]+)"', doc)
        if not bodies:  # plain Part workbench documents: take every top-level shape
            bodies = [n[:-len('.Shape.brp')] for n in names if n.endswith('.Shape.brp') and '.' not in n[:-len('.Shape.brp')]]
        written, skipped = [], []
        builder = BRep_Builder()
        with tempfile.TemporaryDirectory() as tmp:
            for name in bodies:
                brp = f'{name}.Shape.brp'
                if brp not in names:
                    skipped.append(name)
                    continue
                local = Path(tmp) / brp
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
    return {'declaredUnit': 'mm', 'solids': len(written), 'files': written, 'bodies': bodies, 'emptySkipped': skipped}


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
