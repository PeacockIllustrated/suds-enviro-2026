# Visual audit: Site Explorer and Water Journey

What was checked in the `/site-explorer` and `/water-journey` scenes against
UK SuDS practice and the SuDS Enviro data sheets, what was wrong, and what
was changed. References: CIRIA C753 (management train, pre-treatment ahead
of storage), DCG / Sewers for Adoption, Approved Document H (separate foul
and surface water), BS EN 752, BS EN 1825, BS EN 16941-1, and the data sheets
in `public/brochures/`.

Layout code: `components/site/explorer/explorerLayout.ts` and
`components/site/journey/journeyWorld.ts`.

## Treatment train and system logic

| Finding | Status |
|---|---|
| Office and car park had a flow control with no storage upstream of it, so the "controlled rate" had nothing to hold back. | Fixed: attenuation crates added on both plots; the RhinoRoFlo and RhinoRoTex now sit at the storage outlet. |
| Office: roof chamber, separator and flow control in a line, but the surface water outfall ran straight through the foul chamber (visual cross-connection). | Fixed: surface and foul now leave the plot on separate lines to separate sewers, and never share a chamber. |
| Car park: RhinoPod, catchpit and vortex with no storage; deck drainage joined mid-pipe. | Fixed: gully (with RhinoPod) to catchpit to storage to vortex to sewer; deck drainage joins the carrier upstream of the catchpit. |
| Retail: grease trap buried outside under a cover. The RHINO GT data sheet says under-sink or floor-mounted. | Fixed (data sheet followed): the trap stands on the floor of a cut-away back kitchen on the cafe gable, fed from the sink, with its outlet dropping through the floor to the foul chamber. |
| House: the rising main ran level at shallow depth into a chamber whose invert was at the same depth as the pump inlet, so nothing read as "pumped up". | Fixed: the house drain reaches the wet well below the sewer level; the rising main climbs to the gravity chamber and enters at its invert (DCG practice for rising main discharges). |
| Drawpit on the EV charger duct, not drainage. | Correct; card copy now says it carries cables, not water. |
| Journey order (roof, harvesting with overflow, chamber, catchpit with road gully, separator, storage, flow control, headwall with flap valve above river level). | Correct; kept. Harvesting copy now mentions the filter and the overflow to the surface water drain. |

## Geometry

| Finding | Status |
|---|---|
| Explorer chambers were not turned: their 225 stubs pointed at the viewer and pipes entered the shaft about 2 m (drawn) above the stubs. | Fixed: every product has measured inlet and outlet ports (`MODELS[...].inlet/outlet`, from `manifest.json` after `assembly.ts`); pipes end in the stub couplers and each product hangs from its inlet level. |
| Explorer separator outlet pointed into the soil behind the cut, and the downstream pipe left the shell at a point with no stub. | Fixed: turned an eighth and stood forward (as on the journey) so both stub ends meet the run. |
| Products floated or sat with tops below ground and no access. | Fixed: products finish at the surface or get a ribbed access riser with cover and frame up to finished ground level. |
| Flow direction: 12 o'clock outlet faced upstream on both scenes (visually identical stubs). | Fixed: outlet downstream. |
| Journey: separator to storage ran 30 mm uphill; storage to flow control was flat. | Fixed: crates set 400 mm (drawn) below the separator inlet, the flow control below the crates' outlet. |
| Every run now falls continuously except the pumped rising main (checked numerically for both scenes). Journey outfall invert sits 0.26 m (drawn) above the river's normal level, with the flap valve on the headwall. | Verified. |
| Pipes that end at walls, housings, crates and the wet well now finish in a socket collar. | Added. |
| Downpipes land in gullies at their foot (line-art kit), then run below ground to the chamber inlet. | Verified. |

## Scale

One factor (PRODUCT_SCALE, 1.6 times true size) for every product, its
housing, pipes and depths below ground, on both scenes. The explorer slab
was deepened to 9 m (drawn) to take the 4290 mm SEHDS1800 at a credible
depth. Pipe radii follow the pipe sizes (225, 150, 100 mm, rising main).

## Copy

Card roles rewritten to match the scene and the data sheets: RhinoPod
filters dissolved metals, phosphate and hydrocarbons (its data sheet: low
suspended solids removal); catchpit before storage; separator ahead of
storage; flow controls at the storage outlet; grease trap floor-standing in
the kitchen; rising main entering the chamber at its invert; drawpit carries
cables. Plot summaries describe the full train.

## Data sheet conflicts, left as the model draws them

- SEHDS1800: data sheet inverts are 2970 mm above the base (1320 mm below
  the top); the library model's stubs sit about 400 mm higher. Pipes follow
  the model so they meet its stubs.
- SERSIC600: data sheet gives a 10 mm fall across the chamber (85 / 75 mm
  inverts); the model's stubs are level. SERF600 (40 mm) and SERS (25 mm)
  falls are likewise within a stub's thickness at this scale.
- RhinoPod model scale is flagged "unverified" in the manifest; drawn at
  the data sheet's Ø325 x 579 mm.
- RoTex: the library holds only the regulator, so the Ø1200 x 2000 mm
  ROTEX1200 chamber is drawn as a cut-away housing, regulator on the outlet
  wall with a 500 mm sump below, as on the data sheet.
- Attenuation storage and the rainwater tank have no product models and
  are drawn dashed as illustrations.

## Not changed

- Products that must stand forward of the section (the separator, the cut
  RhinoPit, housings) show their risers and covers in front of the slab
  edge; this is the scenes' existing section convention.
- Side inlets (3, 5, 7, 9 o'clock) are not modelled on the library
  chamber, so laterals join at the 6 o'clock stub or upstream of a chamber.
