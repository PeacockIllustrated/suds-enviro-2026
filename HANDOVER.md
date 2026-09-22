# Marketing site rebuild - handover

State as of 2026-09-22. Branch `claude/hopeful-johnson-5fa7b9`,
[PR #1](https://github.com/PeacockIllustrated/suds-enviro-2026/pull/1),
draft, green, 14 commits.

## What this was

Rebuild the public marketing pages of the client's Webflow site on this
Next.js stack, matching the original design as closely as possible. The
Webflow site is the design source of truth; this repo already held the
configurator, the product catalogue and the rule engine.

## Where it lives

Served from **`/preview`**, not `/`. The original marketing pages under
`app/(marketing)/` are untouched and still own `/`, `/contact` and
`/products`. Nothing has been replaced yet - that is a deliberate, and
still open, decision.

| Route | |
|---|---|
| `/preview` | Home, including the 3D hero |
| `/preview/contact` | Contact, form posts to the existing `/api/enquiries` |
| `/preview/rhino-range` | RHINO Range |
| `/preview/products` | Product index |
| `/preview/products/[slug]` | 11 product pages |
| `/preview/builder` | SuDS Builder Hub |

**To flip it live:** move `app/(site-preview)/preview/*` up to own `/`,
`/contact`, `/products`, `/builder`; delete the `SitePathProvider` from
the route-group layout; retire `app/(marketing)/`. The prefix machinery
in `components/site/SitePath.tsx` exists only for the preview and
collapses to nothing once the routes are real.

## Layout of the work

- **`reference/webflow/`** - everything extracted from the Webflow
  project. Start with `README.md`, then `DESIGN.md` for the design spec.
  `DESIGN.md` separates **exact** values (read from Webflow's variable
  collection) from **observed** ones (measured by eye off Designer
  snapshots) - do not treat the second kind as authoritative.
  `SPLINE.md` maps where every Spline scene sits.
- **`public/webflow/`** - all 93 images, filenames normalised.
- **`lib/content/`** - copy and structure, typed, separate from
  presentation. Read `rich-text.ts` first: copy is stored as emphasis
  segments because the Webflow headings switch voice mid-sentence, and
  which colour each voice takes **flips between blocks**. The component
  decides the colours, not the content.
- **`components/site/`** - the design system and page sections.
- **`scripts/`** - the verification harness (see below).

## Decisions a new session should not silently reverse

**The palette comes from Webflow's variables, not `CLAUDE.md`.** The live
site is `#1d80b9` / `#005576` / `#54b54d`. `CLAUDE.md` says `#004d70` /
`#1a82a2` / `#44af43`. Both exist: the Webflow values are the `site-`
prefixed tokens in `globals.css` and are used by `components/site/`; the
`CLAUDE.md` values remain untouched for the configurator and admin.

**The hero 3D is generated in code, not loaded.** `HeroChamber.tsx` is
parametric. The STL assembly in `public/models/sic/` is
manufacturing-accurate but 1.19 MB gzipped, which is the wrong trade for
a backdrop; it stays in the configurator where accuracy earns its weight.
The canvas mounts on `requestIdleCallback` and not at all under
`prefers-reduced-motion`.

**The clock diagram is drawn, not stacked images.** `InletClock.tsx`
derives its nodes from the manufactured positions so it cannot drift from
the rule engine. Webflow uses one PNG per inlet.

**Some Webflow pages collapse onto one page here.** Vortex and Orifice,
and SERSIC and SERFIC, are separate Webflow pages but single entries in
`lib/product-catalog.ts`, so they are sections on one page. Same on the
Builder Hub, where Webflow has separate 3-inlet/5-inlet builder pages and
this app has one wizard that takes inlet count as a step.

## Open, and needing the client rather than code

1. **Pipe diameters: 150 mm or 160 mm.** Webflow's SERSIC and SERFIC
   pages say 150 mm. This repo says 160 mm in `product-catalog.ts`, the
   `PipeSize` union and rule R7. 160 mm is a standard EN1401 diameter;
   150 mm is not. **Nothing has been changed either way**, and the
   marketing copy omits the figure deliberately so nothing ships taking a
   side. This is a manufacturing spec - do not resolve it by guessing.
2. **Contact card copy** - Sales, Help & Support and More info are lorem
   ipsum on the live Webflow site. Carried over verbatim and flagged in
   `lib/content/contact.ts`. Do not invent replacements.
3. **"SuDS" or "SUDS"** in uppercase headings. `uppercase` currently
   flattens the brand's own capitalisation.
4. **Whether to flip `/preview` onto the real routes.**

Also unresolved, lower stakes: the Webflow nav lists the Hydrodynamic
Separator and Oil/Water Separator as `*****`, and the Aqua and Mini
pumping stations carry identical descriptions. Both flagged in place.

## Still missing from the extraction

- **The compiled stylesheet.** Webflow's Data API returns class names but
  never property values. The palette and breakpoints came from the
  variable collection, but the **type scale and spacing are eyeballed**.
  A Webflow code export (`Share > Export Code`) unpacked to
  `reference/webflow-export/` fixes this and is the single highest-value
  thing still outstanding.
- **Spline scene URLs.** Every `Spline` element reports `assetId: null`.
  They exist only in the published HTML. Five decorative scenes are
  simply absent from the rebuild. See `reference/webflow/SPLINE.md`.

## Environment traps, all hit at least once

- **Egress is restricted.** `webflow.com`, `preview.webflow.com`,
  `*.website-files.com` and every `spline.design` host are
  `connect_rejected` by the proxy. `s3.amazonaws.com` is allowed, which
  is the only reason the images could be downloaded. Check with
  `curl -sS "$HTTPS_PROXY/__agentproxy/status"` before assuming a fetch
  failure is a bug.
- **Never run `next build` while `next start` is serving.** They fight
  over `.next` and the build fails with ~30 unrelated Turbopack errors
  that look real. Kill the server first - and **not** with
  `pkill -f "next start"`, which matches the shell running it. See
  `AGENTS.md`.
- **Webflow Designer tooling is fragile.** `element_snapshot_tool` and
  `data_variable_tool` need the Designer open, in the foreground, not
  idle. Snapshots time out after 60s on the Spline-heavy product pages
  for anything bigger than one section, and the connection drops if the
  tab is backgrounded. `get_all_elements` is unaffected and is the
  reliable route for copy.

## Verifying changes

`npx tsc --noEmit` and `npx eslint` are clean; keep them that way. Note
that `app/configurator`, `app/review` and `app/admin` carry 11
pre-existing lint errors that are not from this work.

Beyond that, the harness in `scripts/`:

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright

npm run build && npm start &
node scripts/check-links.mjs               # every internal link, requested
node scripts/screenshot.mjs /preview home  # desktop + mobile, image check
```

Playwright is installed on demand rather than as a devDependency, so it
does not land in every Vercel build. Chromium is already present in this
environment; the scripts point at it and take `CHROMIUM_PATH` if not.
Screenshots go to `.screenshots/`, which is gitignored.

`check-links.mjs` earned its place: it caught the "Download datasheet"
button and every `/configurator` link 404ing after the path prefix went
in - both well-formed, both broken, neither visible in the diff.
