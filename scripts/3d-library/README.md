# 3D product library pipeline

Builds `public/models/library/v1/`: one web-ready glTF per product with its
parts as named nodes, one glb per part, a 512 px thumbnail each, and
`manifest.json`. Sources are the `SuDS 3D Assets` and `Moulded bases STEP`
Drive folders, read only. Nothing here is part of the app build.

## Output conventions

- **Names** follow the brand system's naming section, not the Drive folders:
  `sudsceptor/sudsceptor-sehds1800.glb`, `rhinopod/rhinopod-serpod1850.glb`.
  Sales code first, drawing code carried alongside until the two are mapped.
- **Millimetres**, 1 glTF unit = 1 mm. glTF assumes metres, so the manifest
  carries `unitScale: 0.001` for AR or physically based lighting.
- **Y-up**, product base at y = 0, centred on x and z.
- **Meshopt** compression with quantised attributes. three.js needs
  `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)`.
- Every product is under 3 MB and 150k triangles.
- Parts with no source material render in the brand defaults: body
  `ink-600`, accent `brand-blue #1E80BA`. The manifest's per-part `role`
  says which. The RhinoPit x-ray shell carries its own translucent material.

## Files

| File | What it does |
|---|---|
| `inventory.json` | Every file in the two Drive roots: Drive id, path, family, format, bytes, modified date, and whether it is a candidate, skipped or failed and why |
| `make_inventory.py` | Writes `inventory.json` from a raw Drive listing |
| `products.src.json` | Hand-authored: settled names and codes, which files make each product, the unit decision and its evidence |
| `resolve_products.py` | Resolves `products.src.json` to `products.json` with Drive ids; every path must match exactly one file |
| `build.py` | Runs the pipeline and writes the manifest. `OUT=<dir>` builds to a staging folder instead |
| `cad_to_stl.py` | STEP and FreeCAD `.fcstd` to STL via OpenCASCADE (FreeCAD files are read as the zip of BREP shapes they are) |
| `convert.py` | Blender (`bpy`, headless): import, scale to mm, clear imported custom normals and turn faces outward, decimate, export |
| `optimize.mjs` | Meshopt compression without flattening the node tree |
| `thumbnail.mjs` | Renders the finished file in three.js in headless Chromium, which doubles as a check that it decodes |
| `measure.py` | Prints raw sizes and declared units of sources, for making unit decisions |
| `contact_sheet.mjs` | Tiles thumbnails into one image for a visual check |
| `review/` | The review page used to choose what went into the library |

## Rebuilding

```bash
python3 -m venv work/venv
work/venv/bin/pip install "bpy==4.5.*" cadquery-ocp numpy   # bpy 4.5 needs Python 3.11
npm i
# put the Drive originals in work/src/ as <driveId>.<ext> (see inventory.json)
python3 resolve_products.py
python3 build.py                    # or: python3 build.py <slug> ... to rebuild some
```

`work/` is gitignored. Chromium is expected at `/opt/pw-browsers/chromium`;
set `CHROMIUM_PATH` otherwise.

## Units, and why they are set per product

Headers are not trustworthy here. The Blender-made FBX and `.blend` files
declare centimetre-based FBX units, but were modelled so that 1 unit = 1 cm
of the real product. Each product's unit was checked against a master STL
where one could be downloaded:

| Product | Evidence | Unit |
|---|---|---|
| SudSceptor | matches `1.8 dia Hydro Sep.stl` exactly, 2105 x 4290 x 2155 mm | 1 cm |
| RhinoLift AQUA | matches `AQUA190S.stl` exactly | 1 cm |
| RhinoPit | tubing 696 mm against 708 mm on `SERPT600160-2.stl` | 1 cm |
| RhinoRoFlo | tube 59.8 units tall against 1495 mm on `POC600-1.5.stl` | **25 mm** |
| RhinoShield | fitted to the nominal 500 diameter; master not checked | 100 mm, approximate |
| RhinoPod, RhinoRoTex | masters over the download limit | 1 cm, unverified |
| STEP, FreeCAD, RhinoDuct.stl, FloLock STLs | true millimetres | 1 mm |

The three unverified or approximate products are marked `degraded` in the
manifest until checked against `Rhinopod.stl`, `RoTex-C1200-2.stl` and
`SERSD500160-2.stl`.

## Limits met

- The Drive connector saves files between about 40 KB and 6 MB. Smaller ones
  come back inline and cannot be saved reliably; larger ones drop the
  connection, and 10 MB is a hard cap. Families missing a small part were
  built from their `Breakdown.blend` instead; the rest were supplied by hand.
- Artifacts serve no binary model type, so the review page publishes each
  glb as base64 text and decodes it back to the same bytes.
- SolidWorks and Maya files cannot be opened here and are listed as failed.
