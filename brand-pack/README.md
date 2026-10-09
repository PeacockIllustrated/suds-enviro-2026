# SuDS Enviro brand pack

The SuDS Enviro identity, drawn in section. Edition 1, October 2026. For SuDS Enviro's eyes only.

## The idea

The SuDS Enviro drop is already a section through the ground: green land on top, blue water in the middle, red foul water kept below. Everything the company makes lives under the turf line and is specified by depth, diameter and clock position. So the identity is drawn the way the products are drawn: in section.

- **Device:** a river staff gauge down the edge of every page, and a cut through the ground on every chapter opener.
- **Motion:** the drop builds the way silt settles, bottom band first, then the wordmark rises. Nothing spins. The camera only moves down.
- **Structure:** the book's chapters sit at depths, 0 to 6000 mm in 500 mm steps (the configurator's own steps), ending in the 350 mm sump.
- **Line:** Every drop, accounted for. The slogan, Bespoke, standardised, is unchanged.

## What is in this folder

| Path | What it is |
|---|---|
| `brand-book.html` | The brand book, 43 fixed pages (1400 x 990), self-contained: fonts and images embedded |
| `brand-book.pdf` | The same book as a print PDF (screen grain off) |
| `pages/page-NN.jpg` | A JPG of every page, for review and slides |
| `logos/*.svg` | Logo suite in vector: horizontal lockup in five colourways, the drop in five, the SuDS RHINO lockup in four, the Clockwork seal (filled, filled deep, line), app icons, avatars |
| `logos/png/*.png` | Every logo as a transparent PNG at 2400 px wide |
| `photography/catalogue/` | The catalogue set: 15 products in one fixed format, 1600 px square |
| `photography/xray/` | The x-ray set: the same products ghosted in brand lines, transparent PNG |
| `photography/hero/` | Six hero images (see the note below) |
| `film/` | Identity film, 36 s at 60 fps with score: 16:9 (1920 x 1080) and 9:16 (1080 x 1920) |
| `src/` | Every script that made the pack, so it can be rebuilt |

## How it was made

| Step | Script |
|---|---|
| Logo suite, seal type outlined with fontTools | `src/scripts/logo_suite.py` |
| SVG to transparent PNG | `src/scripts/svgpng.cjs` |
| Catalogue and x-ray renders from the 3D product library (`public/models/library/v1`) | `src/catalogue/render.html`, `src/scripts/catalogue.cjs` |
| Website screenshots (the repo run locally with `next dev`) | `src/scripts/site-shots.cjs` |
| Brand book | `src/book/build.py` (pages in `pages_a.py` to `pages_d.py`, devices in `devices.py`) |
| Page JPGs and PDF | `src/scripts/pages.cjs`, `src/scripts/pdf.cjs` |
| Film frames, deterministic `render(t)` stepped by Playwright, piped to ffmpeg | `src/film/film.tpl.html`, `src/film/film_build.py`, `src/film/film_render.cjs` |
| Score, 100 bpm, synthesised | `src/film/score.py` |

Rebuild the book: `python3 src/book/build.py`, then `NODE_PATH=$(npm root -g) node src/scripts/pages.cjs` and `node src/scripts/pdf.cjs`. Catalogue renders need a static server on port 3200 at the repo root (`npx http-server -p 3200`).

## Decisions made in the book

- **Palette:** the live site's four colours are kept as they are: Blue `#1D80B9`, Deep `#005576`, Green `#54B54D`, Red `#C34C4A`. Added: Surface `#EEF3F5` (reading ground), Invert `#062A3A` (foul and night ground), Field `#3D8537` (a green that can carry text), and Sky `#AFDBF4`, which is already on the site. Autoflo yellow `#FFE313` stays with the autoFlo sub-brand only.
- **Contrast:** the site's light green heading voice is 2.59:1 on white and fails for text at every size. On light grounds the light voice moves to Field (4.56:1). All ratios are printed on page 13.
- **Axis:** clean water (surface, rain, silt) on Paper and Surface in Blue and Green; foul water (foul, grease, septic) on Invert with Sky lines and Red as the one accent.
- **Type:** Montserrat (already the site face) in two voices, 300 and 800, uppercase headings. IBM Plex Mono for every measurement. Both are SIL OFL.
- **Logo:** clear space half the drop height; minimum sizes on page 06. The drop never rotates and its bands never change order.

## For SuDS Enviro to decide

1. RHINO or Rhino: the product names are written several ways. The book suggests RHINO for the range and Rhino + name, one word, for named products.
2. SudSceptor or SuDSceptor.
3. One list mapping sales codes to drawing codes (SERCIC and SERSIC both appear).
4. One green: the logo masters carry `#5BB44F`, the site `#54B54D`. The book uses the site value.
5. Retire the earlier S-and-leaf mark and the thin wordmark still in the website asset library.
6. A vector master of the stacked lockup with slogan. Only a PNG exists, so it is not in the vector suite.

## Notes on the artwork

- All lockups are SuDS Enviro's own artwork from the master files on the live site. Shapes are untouched; colours are normalised to the palette above because the masters disagree slightly.
- The Clockwork seal, app icons and avatars are new pieces built around the supplied drop.
- Hero photographs were re-photographed from the 3D product files with an image model, with the brief to keep each product exactly as it is. They show the direction, not finished photography: check each against the real product before use, and replace them with the shoot list on page 28.
- Catalogue renders use the 3D library's default body colour until real material samples are matched.
- Made things (van, hoarding, signs, etched and cut pieces) are concepts for OneSign and OneLaser, to be surveyed and sampled before production.
