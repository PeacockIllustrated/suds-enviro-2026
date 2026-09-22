# Webflow extraction - SuDS Enviro

Source of truth for the 2026 rebuild of the public marketing site. Everything
here was pulled from the live Webflow project (`SuDS Enviro`,
site `6662e401ea62d861a416088f`) via the Webflow MCP Data API on 2026-09-22.

## What is here

| File | Contents |
|---|---|
| `pages.json` | All 27 Webflow pages: id, title, published path, grouping, whether public |
| `page-home.elements.json` | Full element tree for the Home page (raw MCP `get_all_elements` output) |
| `page-home.outline.txt` | The same tree flattened to a readable outline with all copy inline |
| `assets.index.json` | Asset id to filename map, with display name, MIME type and alt text |
| `assets.raw.json` | Raw asset listing including S3 hosted URLs and responsive variants |
| `styles.classlist.json` | All 712 Webflow class names and their CSS selectors |
| `flatten.py` | Turns a raw element tree into the readable outline format |
| `DESIGN.md` | The design spec: exact palette and breakpoints from Webflow, plus the type, button, nav and card treatment read off Designer snapshots |
| `page-*.elements.json` / `page-*.outline.txt` | Element trees and readable outlines for Home and the six RHINO product pages |

Every image asset (93 files, 6.4 MB) is downloaded to `public/webflow/`,
keyed by the filenames in `assets.index.json`.

```bash
python3 reference/webflow/flatten.py reference/webflow/page-home.elements.json
```

## What is NOT here, and why

**The CSS.** Webflow's Data API returns class names but never property
values - fonts, colours, type scale, spacing all live behind the Designer
API, which requires the Webflow Designer to be open with the MCP app running.
The published site could be read instead, except this build container's
egress policy blocks `suds-enviro.webflow.io`, `*.website-files.com` and
`webflow.com` (403 at the proxy). Only `s3.amazonaws.com` is reachable,
which is how the images were retrieved.

**Spline scene URLs.** The Home, Contact and Product Catalogue pages each
embed `Spline` elements (classes `Spline Scene Desktop`,
`Spline Scene SideSquare`, `Spline Scene 3`, `Spline Scene 14`). The API
exposes the element but not the scene URL.

Both gaps close with a **Webflow code export** (`Share > Export Code`),
which ships the compiled stylesheet and the full rendered HTML for every
page. Unpack it to `reference/webflow-export/`.

## Notes on the Webflow content itself

- The **Contact page is unfinished**: the three cards (Sales, Help & Support,
  More info) all still carry lorem ipsum. Real copy is needed from the client.
- Several nav entries are placeholders: the Hydrodynamic Separator and
  Oil/Water Separator dropdown items read `*****` and are marked `disabled`.
- Six of the Home page product-card images are AI-generated stand-ins
  (`assets_task_*.webp`), not product photography. The line-drawing product
  renders (`SERSIC.png`, `SERFIC.png` and siblings) are genuine brand assets.
- The site has no custom fonts uploaded, so the typeface is a Google or
  Webflow-hosted family. The export names it.

## Regenerating the asset map

`public/webflow/` filenames are normalised to `<assetId>-<slug>.<ext>`
(the raw Webflow names contain spaces and, in one case, a `#`). After
adding or replacing files there, rebuild `lib/content/webflow-assets.generated.ts`:

```bash
python3 - <<'PY'
import json
idx = json.load(open('reference/webflow/assets.index.json'))
L = ["export const WEBFLOW_ASSETS = {"]
for aid in sorted(idx):
    L.append(f"  '{aid}': '{idx[aid]['path']}',")
L += ["} as const", ""]
print("\n".join(L))
PY
```

`assets.index.json` records both the normalised `path` and the `original`
Webflow filename for each id.


## Conflicts with this repo's data

**Pipe sizes: 150 mm or 160 mm.** The Webflow SERSIC and SERFIC pages list
the channelled base as `110mm, 150mm, 225mm, or 300mm`. This repo says
160 mm throughout - `lib/product-catalog.ts`, the `PipeSize` union in
`CLAUDE.md`, and rule R7 in the rule engine.

160 mm is a standard EN1401 outside diameter; 150 mm is not. So the
Webflow figure is most likely the error, but it is on the live site and
this is a manufacturing spec, so **it needs confirming with the client
rather than quietly resolving**. Nothing has been changed either way.

The Webflow pages also stop at 300 mm where this repo goes to 450 mm.

## The product page template

The six RHINO product pages are one template with a variant class per
product (`Section 11.serfic`, `Section 11.vortex`). Structure is: nav,
two Spline scenes, a hero section, a content section, the wave image,
footer.

Their typography departs from the home page: the product heroes are set
**entirely in italic**, running a four-line lockup - "the RHINO" small,
the series name large in green italic bold, the water type in blue, then
the product category in a lighter grey-blue.

The SERSIC and SERFIC pages carry a **clock-face inlet diagram** built
from layered PNGs (`Clock Div`, with `InletAbs` images positioned at the
3, 5, 6, 7 and 9 o'clock inlets, and a `highlight` combo class marking
which are available). This is the same clock model the configurator's
rule engine already implements, so it should be rebuilt as SVG driven by
the rule engine rather than as stacked images.

## Snapshot reliability

`element_snapshot_tool` needs the Webflow Designer open, in the
foreground and not idle. On the Spline-heavy product pages it times out
after 60s for anything larger than a single section, and the connection
drops if the Designer tab is backgrounded. Element trees via
`get_all_elements` are unaffected and are the reliable route for copy.
