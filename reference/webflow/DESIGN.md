# SuDS Enviro - design spec, taken from the Webflow original

Two kinds of fact live in this file, and they are labelled:

- **Exact** - read straight out of Webflow (variable values, breakpoints,
  the global CSS embed). Trust these.
- **Observed** - measured by eye from Designer element snapshots. Close, but
  a Webflow code export would replace them with real numbers.

---

## Palette (exact)

Read from the Webflow variable collection `default`
(`collection-97c1751e-4f83-8252-59cb-5cc6c2c44009`).

| Webflow name | CSS var | Value | Hex | Role |
|---|---|---|---|---|
| Blue | `--blue` | `#1d80b9` | `#1d80b9` | Primary. Bold heading voice, button fill |
| DarkBlue | `--darkblue` | `#005576` | `#005576` | Nav bar, body copy, deep ground |
| Green | `--green` | `hsla(115.96, 41.27%, 50.59%, 1)` | `#54b54d` | Accent. Light heading voice, inline emphasis |
| DarkGreen | `--darkgreen` | `hsla(160.34, 57.34%, 42.37%, 1)` | `#2eaa81` | Secondary green, teal-leaning |
| LightBlue | `--lightblue` | `hsla(201.92, 76.34%, 82.16%, 1)` | `#afdbf4` | Button outlines, tab highlights |
| UI Light Blue | `--ui-light-blue` | `hsla(197.14, 28%, 80.39%, 1)` | `#bfd3db` | Muted UI chrome |
| UI Light Green | `--ui-light-green` | `hsla(112.87, 50.07%, 76.15%, 1)` | `#abe1a4` | Muted green chrome |
| Dark | `--dark` | `hsla(240, 1.69%, 23.14%, 1)` | `#3a3a3c` | Near-black text |
| Red | `--red` | `#c34c4a` | `#c34c4a` | Alert / foul-water marker |
| Yello | `--yello` | `hsla(53, 100%, 53.78%, 1)` | `#ffe313` | autoFlo accent |
| WhiteTrans | `--whitetrans` | `hsla(0, 0%, 100%, 0.77)` | `#ffffff` @ 77% | Frosted panels |
| NavColour | `--navcolour` | alias -> Green | `#54b54d` | |

`Yellow` (`--yellow`) is also defined but holds `#c34c4a`, identical to
`Red`. That looks like a mistake in the Webflow project; `Yello` is the
one actually carrying the yellow.

> These differ from the palette in the root `CLAUDE.md` (`#004d70`,
> `#1a82a2`, `#44af43`). The values above are what the live site renders,
> so they win for the marketing pages.

## Breakpoints (exact)

| Webflow id | Name | Applies |
|---|---|---|
| `main` | Desktop | base, all widths |
| `medium` | Tablet | <= 991px |
| `small` | Mobile (L) | <= 767px |
| `tiny` | Mobile | <= 479px |

Tailwind's defaults do not line up with these, and Tailwind breakpoints
are min-width while Webflow's are max-width. `app/globals.css` defines
`--breakpoint-site-tablet: 992px`, `--breakpoint-site-mobile-l: 768px` and
`--breakpoint-site-mobile: 480px` - each the Webflow ceiling plus one, so
that `max-site-tablet:` compiles to `width < 992px`, i.e. `<= 991px`.
Always use the `max-` variants of these; bare they mean min-width and
invert.

## Utility layer (exact)

The site is built on **Client-First / Relume** conventions - the
`global-styles` embed is the stock Client-First utility sheet. That is why
the class list contains `padding-section-large`, `margin-bottom` +
`margin-xxlarge`, `max-width-large`, `text-size-medium`,
`heading-style-h5`, `button-group`, `layout230_list` / `layout230_item`.

Practical consequence: spacing follows the Client-First rem scale, and the
`margin-*` / `padding-*` helpers zero out every side except the named one.
Recreate the intent in Tailwind rather than porting the utility sheet.

---

## Typography (observed)

Geometric sans throughout, double-storey `a`, single-storey `g`.
**The exact family still needs confirming** - no custom fonts are uploaded
to the Webflow site, so it is a Google or Webflow-hosted family.

Treatment is consistent and is the signature of the design:

- **Headings are uppercase** and set in **two voices in one line**, one
  light green, one bold blue. "THE" light green over "RHINO RANGE" bold
  blue; "ONE SOLUTION" green over "ALL SITUATIONS" blue; "INSPECTION"
  green over "CHAMBERS" blue.
- The hero inverts it: plain text green, emphasised spans bold blue.
- Body copy inverts it again: plain text dark blue `#005576`, emphasised
  words green `#54b54d`.
- Sub-brand names are **bold italic** - `RHINO` blue upright next to
  `ROFLO` green italic.
- Long-form blocks in the RHINO and Hydrology sections are
  **right-aligned**, not left.
- Generous line-height on body copy, roughly 1.5.

That alternating green/blue emphasis mid-sentence is why the copy in
`lib/content/` is stored as segments rather than strings. Which colour
each voice takes is decided per block, not globally - the component maps
`emphasis` to a colour.

## Buttons - `.button1` (observed)

- Full pill radius
- Fill `#1d80b9`, outline roughly 3px in a lighter blue near `#afdbf4`
- Label white, **bold italic uppercase**, noticeably letterspaced
- Soft drop shadow
- Card variant (`.button1.card`) is the same shape at small size with a
  trailing chevron
- Nav secondary variant is transparent with a green outline and green label

## Navigation (observed)

Solid `#005576` bar. Left: white SuDS Enviro mark, a vertical rule, then
"BESPOKE," upright over "STANDARDISED" italic. Centre: "THE RHINO RANGE"
with a chevron, and "CONTACT" - white, uppercase, letterspaced. Right: two
pills, "RHINO RANGE" filled blue and "BUILD YOUR SUDS" outlined green.

## Product cards - `.layout230_item` (observed)

Image panel with a large corner radius, then the two-voice uppercase
heading, then a row of small chevron pills.

## Tabs - water management (observed)

Four pill tabs sitting on top of a rounded panel with a `#1d80b9` outline,
overlapping its top edge. Labels white bold italic uppercase on a blue
gradient; the active tab reads lighter. Panel body is white with the
standard dark-blue/green inline emphasis.

---

## Still missing

- The exact font family, weights and type scale
- Real spacing and radius values
- Spline scene URLs - the `Spline` elements report `assetId: null`, so the
  scene lives only in the published HTML

All three come from a Webflow code export, unpacked to
`reference/webflow-export/`.
