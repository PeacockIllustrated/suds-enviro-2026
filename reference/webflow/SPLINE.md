# Spline scenes on the Webflow site

Where every `Spline` element sits, so scene URLs can be matched to places
the moment they are available. The Webflow Data API reports
`assetId: null` on all of them, so the URLs live only in the published
HTML or in the Spline account.

## Distinct scenes

Webflow names these by CSS class, not by scene, so the class is the only
handle we have. Six distinct classes across the site.

| Class | Appears on | Placements | Notes |
|---|---|---|---|
| `Spline Scene Desktop` | Home | 1 | Hero backdrop. **Already replaced** by the parametric R3F chamber |
| `Spline Scene SideSquare` | Home, RHINO Range | 4 | Beside the foul-water and surface-water panels, twice on each page |
| `Spline Scene 3` | Contact | 1 | Sits in a `.spline` block above the main wrapper |
| `Spline Scene 14` | RHINO Range | 1 | Full-page, below the two product containers |
| `Spline Scene 12` | All six RHINO product pages | 6 | Desktop hero scene |
| `Spline Scene Mob` | SERSIC, SERFIC, Vortex | 3 | Mobile counterpart of `Scene 12`; absent from Orifice, Catchpit and Pumping Stations |

## Per page

Verified by grepping the saved outlines in this directory:

```
page-home                  Spline Scene Desktop      (line 4, hero)
                           Spline Scene SideSquare   (line 604)
                           Spline Scene SideSquare   (line 626)
page-sersic                Spline Scene Mob, Spline Scene 12
page-serfic                Spline Scene Mob, Spline Scene 12
page-vortex-flow-control   Spline Scene Mob, Spline Scene 12
page-orifice-flow-control  Spline Scene 12
page-advanced-catchpit     Spline Scene 12
page-pumping-stations      Spline Scene 12
```

Contact and the RHINO Range page were read from the API but their trees
were not saved to disk, so their placements come from that read rather
than from a file here:

```
Contact                    Spline Scene 3
RHINO Range (catalogue)    Spline Scene SideSquare x2, Spline Scene 14
```

Re-pull them with `data_element_tool > get_all_elements` on pages
`6673fa98d23d455b913986a7` and `670fda87b14b845213755a14` if that needs
confirming.

## What the rebuild currently does

Only the hero scene has been replaced, by `components/site/HeroChamber.tsx`.
The remaining five scenes are decorative and are simply absent from the
rebuild - no placeholder, no gap in the layout.

## Getting the URLs

Three routes, in order of preference:

1. **Webflow code export.** The published HTML carries each
   `scene.splinecode` URL inline. Also gives the compiled stylesheet.
2. **A Spline MCP**, if one is connected to the account that owns the
   scenes. Enough to *integrate*: `@splinetool/react-spline` fetches the
   scene in the visitor's browser, so the build never needs to download
   it. Not necessarily enough to *export*, since this container's egress
   blocks `prod.spline.design`, `app.spline.design`, `my.spline.design`,
   `api.spline.design` and `spline.design` - all `connect_rejected`. An
   MCP that returns file contents rather than links would work; one that
   returns links would not.
3. **Anyone with the site open** can read them from the page source.

## Worth weighing before re-integrating

The hero was moved off Spline deliberately: the runtime is roughly a
megabyte before the scene itself, fetched from a third party, and it
cannot be driven from the configurator's state. A Spline scene exported
to GLB is usually *heavier* than equivalent generated geometry, not
lighter, because artist-built meshes carry detail a backdrop does not
need. Worth it only where the art direction genuinely cannot be
reproduced in code.
