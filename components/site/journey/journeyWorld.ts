import { PRODUCT_MODELS, type ProductModel } from '@/lib/content/product-models'
import type { JourneyStop } from '@/lib/content/water-journey'
import { PRODUCT_SCALE } from '@/components/site/explorer/explorerLayout'
import type { ProfilePoint, SurfaceSpan, Vec3 } from './scenery'

/**
 * Where everything sits on the water journey: one continuous isometric
 * section through a small development, from the roof of a house to a river
 * outfall, drawn in the Site Explorer's line-art style.
 *
 * Units are metres. The section cut is the plane z = 0; the site runs back
 * to -z, drainage runs along the cut (z = CUT_Z) and products stand in the
 * cut soil, half proud of it.
 *
 * Scale: scenery (house, cars, road, river) is true size. Products and
 * their pipes are the library's millimetre models (and data-sheet sizes
 * for the two illustrative items) at S = PRODUCT_SCALE, the Site
 * Explorer's factor: 1.6 times true size, the same for every product, so
 * their sizes stay honest against each other (a 600 mm chamber reads a
 * third the width of the 1800 mm separator) and still read beside a house.
 * Depths below ground are scaled by the same factor, so each product's
 * cover level and pipe inverts sit where its model puts them.
 *
 * Pipe levels come from the models (manifest.json part bounding boxes):
 * each product is hung from the level of its inlet, and the run falls
 * product to product. Products that end up below the surface get an access
 * riser up to it, as their data sheets describe.
 *
 * The page copy is in lib/content/water-journey.ts, keyed by stop `id`; the
 * size callouts are here with the models they describe, so the editor can
 * change the words but never what is drawn.
 */

export const S = PRODUCT_SCALE

export type StopId = JourneyStop['id']
export type Box = { min: Vec3; max: Vec3 }

/** The section face; pipes and product centres sit just proud of it. */
export const CUT_Z = 0.15
export const GROUND_DEPTH = 10.4
export const BACK = -24
export const X_MIN = -26
export const X_MAX = 82

/** The ground along the cut: level to the car park, falling to the river. */
export const RIVER = { level: -3.8, bed: -4.35, headwallX: 59.6 } as const
export const PROFILE: ProfilePoint[] = [
  [X_MIN, 0],
  [41, 0],
  [59.6, -1.2],
  [59.9, RIVER.bed],
  [66.2, RIVER.bed],
  [69.8, -1.2],
  [X_MAX, -1.2],
]

/** Ground level at x, away from the river. */
export function groundAt(x: number): number {
  for (let i = 1; i < PROFILE.length; i++) {
    const [ax, ay] = PROFILE[i - 1]
    const [bx, by] = PROFILE[i]
    if (x >= ax && x <= bx && bx > ax) return ay + ((x - ax) / (bx - ax)) * (by - ay)
  }
  return 0
}

export const SURFACES: SurfaceSpan[] = [
  { from: X_MIN, to: 10.2, kind: 'grass' },
  { from: 10.2, to: 16.4, kind: 'paving' },
  { from: 16.4, to: 23.6, kind: 'road' },
  { from: 23.6, to: 25, kind: 'paving' },
  { from: 25, to: 28.2, kind: 'grass' },
  { from: 28.2, to: 41, kind: 'paving' },
  { from: 41, to: X_MAX, kind: 'grass' },
]

/** The house: front wall on z = -1.2, from x = -6.4 to 3.6. */
export const HOUSE_AT: Vec3 = [-6.4, 0, -1.2]
export const ROAD = { from: 16.4, to: 23.6, gullyX: 23.1 } as const
export const CAR_PARK = { from: 28.2, to: 41 } as const

// ── products ────────────────────────────────────────────────────────

const heroOf = (slug: string): ProductModel => {
  const hero = PRODUCT_MODELS[slug]?.hero
  if (!hero) throw new Error(`No 3D model for ${slug}`)
  return hero
}

/** A library model and where its pipes connect, in its own millimetres. */
export interface ModelFit {
  model: ProductModel
  heightMm: number
  radiusMm: number
  /** Plan centre of the body in the file, so it can be recentred. */
  centreMm?: [number, number]
  /** Turn about the vertical so its inlet faces -x (upstream). */
  turn?: number
  /** Centre height of the inlet and outlet stubs above the base. */
  inletMm: number
  outletMm: number
  /** Stub ends along x from the body centre, after the turn. */
  inletXMm: number
  outletXMm: number
  /** Stand wholly in front of the cut (the file is already drawn cut open). */
  proud?: boolean
  /** Plan position of the body centre off the cut, metres, where set. */
  z?: number
  /** Stub ends in plan, [x, z] mm from the body centre after the turn, where not along x. */
  inletTipMm?: [number, number]
  outletTipMm?: [number, number]
}

/*
 * Measured from manifest.json (bboxMm of each part):
 * - SERSIC600 chamber: 1950 mm body, Ø705 over the ribs; its 225 stubs sit
 *   in holes centred 192.5 mm up on the 12 / 6 o'clock line (z in the file),
 *   so it is turned a quarter to put them along the run, outlet downstream.
 *   The data sheet gives a 10 mm fall across the chamber (inlet invert 85,
 *   outlet 75 mm above the base); the model's stubs are level.
 * - SERPT600 catchpit: tubing 1495 mm, inlet and outlet stubs centred 374 mm
 *   up, ends at x = -540 and +540. The file is drawn cut in half.
 * - SEHDS1800 separator: 4290 mm, Ø1800 shell; inlet and outlet stubs
 *   centred 3520 mm up, 90 degrees apart (inlet tip at x -1200, outlet tip
 *   at z -1250 from the shell centre). Turned an eighth so both point back
 *   at 45 degrees either side, and stood forward of the cut so both stub
 *   ends reach the section face and the run visibly passes through it.
 *   The data sheet puts both inverts 2970 mm above the base (1320 mm below
 *   the top); the model's stubs sit about 400 mm higher, and the pipes
 *   follow the model so they meet its stubs.
 * - POC600 orifice chamber: 1495 mm tube, Ø696; stubs on the lower band
 *   centred 356 mm up, ends at x = +/-452. The orifice plate sits on the
 *   -x stub, so it is turned half round to put the outlet downstream.
 */
export const FITS = {
  chamber: {
    model: heroOf('inspection-chamber'),
    heightMm: 1950,
    radiusMm: 353,
    // The 12 o'clock outlet (the file's -z) downstream, the 6 o'clock inlet upstream.
    turn: -Math.PI / 2,
    inletMm: 192.5,
    outletMm: 192.5,
    inletXMm: -353,
    outletXMm: 353,
  },
  silt: {
    model: heroOf('catchpit-silt-trap'),
    heightMm: 1495,
    radiusMm: 348,
    centreMm: [0, -273],
    inletMm: 374,
    outletMm: 374,
    inletXMm: -540,
    outletXMm: 540,
    proud: true,
  },
  separator: {
    model: heroOf('rhinoceptor'),
    heightMm: 4290,
    radiusMm: 905,
    centreMm: [147, 172],
    turn: -Math.PI / 4,
    inletMm: 3520,
    outletMm: 3520,
    inletXMm: -764,
    outletXMm: 883,
    inletTipMm: [-764, -932],
    outletTipMm: [883, -883],
    z: 1.3,
  },
  flow: {
    model: heroOf('flow-control'),
    heightMm: 1495,
    radiusMm: 348,
    turn: Math.PI,
    inletMm: 356,
    outletMm: 356,
    inletXMm: -452,
    outletXMm: 452,
  },
} satisfies Record<string, ModelFit>

export type FitKey = keyof typeof FITS

export interface ProductPlace {
  fit: FitKey
  x: number
  /** Level of the inlet pipe centre; the product hangs from it. */
  inletY: number
}

/** Plan position of a product's centre off the cut. */
export function placeZ(fit: ModelFit): number {
  if (fit.z !== undefined) return fit.z
  return fit.proud ? fit.radiusMm * S + 0.05 : CUT_Z
}

export function baseOf(p: ProductPlace): number {
  return p.inletY - FITS[p.fit].inletMm * S
}

export function topOf(p: ProductPlace): number {
  return baseOf(p) + FITS[p.fit].heightMm * S
}

/*
 * The run, product by product. The chamber is set with its cover at the
 * surface, which puts its pipes about 1.8 m down (2.86 m drawn); every
 * product downstream hangs a little lower, so the water always falls.
 */
export const CHAMBER: ProductPlace = { fit: 'chamber', x: 13.2, inletY: -0.05 - (1950 - 192.5) * S }
export const SILT: ProductPlace = { fit: 'silt', x: 26.6, inletY: CHAMBER.inletY - 0.09 }
export const SEPARATOR: ProductPlace = { fit: 'separator', x: 34, inletY: SILT.inletY - 0.1 }
// The storage sits below the separator's outlet and the flow control below
// the storage's outlet, so the run falls all the way to the outfall.
export const FLOW: ProductPlace = { fit: 'flow', x: 56.4, inletY: SEPARATOR.inletY - 0.28 }

/*
 * The illustrative items, at data-sheet sizes times S.
 * - Rainwater tank: the data sheet gives capacities (1000 to 3300 L) but
 *   says dimensions are confirmed at order, so this is a 3300 L tank drawn
 *   at an assumed Ø1700 x 1450 mm body with a Ø600 access neck.
 * - Attenuation: modules of 1000 x 500 x 400 mm (a common crate size),
 *   six long, three high and two deep: 7.2 m3 gross. Sized per site.
 */
export const TANK = { x: 6.9, radius: 0.85 * S * 1000, height: 1.45 * S * 1000, top: -1.15, neck: 0.3 * S * 1000 }
export const TANK_BASE = TANK.top - TANK.height
export const CRATES = {
  from: 43,
  module: [1.0 * S * 1000, 0.4 * S * 1000, 0.5 * S * 1000] as Vec3,
  count: [6, 3, 2] as [number, number, number],
  bottom: SEPARATOR.inletY - 0.4,
}
export const CRATES_TO = CRATES.from + CRATES.module[0] * CRATES.count[0]
export const CRATES_TOP = CRATES.bottom + CRATES.module[1] * CRATES.count[1]

/** The road gully by the kerb: a Ø450 pot, 900 mm deep. */
export const GULLY = { x: ROAD.gullyX, radius: 0.225 * S * 1000, height: 0.9 * S * 1000, top: -0.02 }

// ── pipe runs ───────────────────────────────────────────────────────

export type Stream = 'surface' | 'foul'

export interface PipeRun {
  /** Water reaches it on the way from stop `leg` to stop `leg + 1`. */
  leg: number
  /** Downstream order. */
  points: Vec3[]
  /** Outside radius, metres (pipe bore times S plus the wall). */
  radius: number
  stream?: Stream
}

const stubX = (p: ProductPlace, end: 'in' | 'out') =>
  p.x + (end === 'in' ? FITS[p.fit].inletXMm : FITS[p.fit].outletXMm) * S
const outY = (p: ProductPlace) => baseOf(p) + FITS[p.fit].outletMm * S
const siltZ = placeZ(FITS.silt)
const sepZ = placeZ(FITS.separator)
const sepIn: Vec3 = [SEPARATOR.x + FITS.separator.inletTipMm[0] * S, SEPARATOR.inletY, sepZ + FITS.separator.inletTipMm[1] * S]
const sepOut: Vec3 = [SEPARATOR.x + FITS.separator.outletTipMm[0] * S, SEPARATOR.inletY, sepZ + FITS.separator.outletTipMm[1] * S]

/*
 * The house's rainwater goods, where the kit house (DetachedHouse, drawn
 * from HOUSE_AT with the sizes in scenery.tsx) puts them: the eaves gutter
 * sits 0.41 m proud of the front wall with its top 5.175 m up, and the
 * downpipe drops against the wall at the right-hand corner.
 */
const DOWNPIPE_X = HOUSE_AT[0] + 9.75
const GUTTER_Y = 5.16
const GUTTER_Z = HOUSE_AT[2] + 0.41
export const HOUSE_DOWNPIPE = { x: DOWNPIPE_X, z: HOUSE_AT[2] + 0.13, top: 4.72 } as const
const TANK_IN_Y = TANK.top - 0.35
const TANK_OUT_Y = TANK.top - 0.5

export const PIPES: PipeRun[] = [
  // Roof: along the gutter and down the downpipe, into the ground and to the tank.
  {
    leg: 0,
    radius: 0.07,
    points: [
      [HOUSE_AT[0] + 0.1, GUTTER_Y, GUTTER_Z],
      [DOWNPIPE_X, GUTTER_Y - 0.03, GUTTER_Z],
      [DOWNPIPE_X, HOUSE_DOWNPIPE.top + 0.05, HOUSE_DOWNPIPE.z],
      [DOWNPIPE_X, -0.6, HOUSE_DOWNPIPE.z],
      [DOWNPIPE_X, TANK_IN_Y + 0.05, CUT_Z],
      [TANK.x - TANK.radius, TANK_IN_Y, CUT_Z],
    ],
  },
  // Tank overflow, dropping to the chamber.
  {
    leg: 1,
    radius: 0.11,
    points: [
      [TANK.x + TANK.radius, TANK_OUT_Y, CUT_Z],
      [11.3, TANK_OUT_Y - 0.15, CUT_Z],
      [12.1, CHAMBER.inletY, CUT_Z],
      [stubX(CHAMBER, 'in'), CHAMBER.inletY, CUT_Z],
    ],
  },
  // Chamber to the catchpit, under the road.
  {
    leg: 2,
    radius: 0.17,
    points: [
      [stubX(CHAMBER, 'out'), outY(CHAMBER), CUT_Z],
      [24.9, SILT.inletY + 0.04, CUT_Z],
      [stubX(SILT, 'in'), SILT.inletY, siltZ],
    ],
  },
  // The road gully joining the run.
  {
    leg: 2,
    radius: 0.1,
    points: [
      [GULLY.x + GULLY.radius, GULLY.top - GULLY.height + 0.35, CUT_Z],
      [23.9, GULLY.top - GULLY.height + 0.3, CUT_Z],
      [24.5, SILT.inletY + 0.12, CUT_Z],
    ],
  },
  // Catchpit to the separator.
  {
    leg: 3,
    radius: 0.14,
    points: [
      [stubX(SILT, 'out'), outY(SILT), siltZ],
      [28.2, outY(SILT) - 0.02, CUT_Z],
      [sepIn[0] - 0.7, SEPARATOR.inletY + 0.01, CUT_Z],
      sepIn,
    ],
  },
  // Separator to storage.
  {
    leg: 4,
    radius: 0.24,
    points: [
      sepOut,
      [sepOut[0] + 0.7, outY(SEPARATOR) - 0.01, CUT_Z],
      [CRATES.from, CRATES.bottom + 0.3, CUT_Z],
    ],
  },
  // Storage to the flow control.
  {
    leg: 5,
    radius: 0.13,
    points: [
      [CRATES_TO, CRATES.bottom + 0.2, CUT_Z],
      [stubX(FLOW, 'in'), FLOW.inletY, CUT_Z],
    ],
  },
  // Out through the headwall to the river.
  {
    leg: 6,
    radius: 0.13,
    points: [
      [stubX(FLOW, 'out'), outY(FLOW), CUT_Z],
      [RIVER.headwallX + 0.2, outY(FLOW) - 0.08, CUT_Z],
    ],
  },
]

/** Where the outfall pours into the river. */
export const OUTFALL: Vec3 = [RIVER.headwallX + 0.2, outY(FLOW) - 0.08, CUT_Z]

/** A foul sewer under the road, seen end on: surface water is kept apart. */
export const FOUL_SEWER = { x: 19.4, y: -2.1, radius: 0.19 } as const

// ── stops ───────────────────────────────────────────────────────────

/** A procedural stand-in, drawn as an illustration, where no product model exists. */
export type DiagramKind = 'tank' | 'crates'

export interface StopScene {
  /** What the camera frames on a wide stage, and on a tall narrow one. */
  frame: Box
  frameNarrow: Box
  /** A real product model from the 3D library. */
  model?: ProductModel
  diagram?: DiagramKind
  /** Size callout, from the data sheet (or the model where they differ). */
  size?: string
  /** The dimension line: x, base, top and the z it is drawn at. */
  dimension?: { x: number; from: number; to: number; z: number }
}

const dim = (p: ProductPlace) => {
  const f: ModelFit = FITS[p.fit]
  return { x: p.x + f.radiusMm * S + 0.35, from: baseOf(p), to: topOf(p), z: placeZ(f) + f.radiusMm * S }
}

/*
 * Framing. Each product stop frames the product itself (its body, with its
 * riser up to the surface) grown by a margin across (x) and up and down
 * (y), and nothing else, so the product lands in the part of the stage the
 * card leaves clear, a little below its middle so the surface over it shows. The margins set how much of the run and
 * the scenery shows round it: wide stages get more (and the surface above
 * for context), tall narrow ones less. Neighbouring products are either
 * wholly in shot or wholly out of it at 1440 x 900 and 390 x 844, except
 * where a long neighbour (the separator, the crates) can only show in part.
 */
const around = (b: Box, mx: number, below: number, above: number): Box => ({
  min: [b.min[0] - mx, b.min[1] - below, b.min[2]],
  max: [b.max[0] + mx, b.max[1] + above, b.max[2]],
})

/** A library product's extent, from its base to the surface over it. */
function productBox(p: ProductPlace): Box {
  const f: ModelFit = FITS[p.fit]
  const r = f.radiusMm * S
  const z = placeZ(f)
  return { min: [p.x - r, baseOf(p), z - r], max: [p.x + r, Math.max(topOf(p), groundAt(p.x)), z + r] }
}

const TANK_BOX: Box = {
  min: [TANK.x - TANK.radius, TANK_BASE, CUT_Z - TANK.radius],
  max: [TANK.x + TANK.radius, groundAt(TANK.x), CUT_Z + TANK.radius],
}
const CRATES_BOX: Box = {
  min: [CRATES.from, CRATES.bottom, 0],
  max: [CRATES_TO, CRATES_TOP + 0.5, CRATES.module[2] * CRATES.count[2]],
}

export const STOP_SCENES: Record<StopId, StopScene> = {
  rain: {
    frame: { min: [-9, -1.5, -9], max: [9, 12.5, 1] },
    frameNarrow: { min: [-7, -1.6, -5], max: [8.5, 12.5, 1] },
  },
  harvest: {
    frame: around(TANK_BOX, 2, 1.2, 3.6),
    frameNarrow: around(TANK_BOX, 1, 0.5, 1.4),
    diagram: 'tank',
    size: '3300 litre tank shown',
    dimension: { x: TANK.x + TANK.radius + 0.35, from: TANK_BASE, to: TANK.top, z: CUT_Z + TANK.radius * 0.6 },
  },
  chamber: {
    frame: around(productBox(CHAMBER), 2, 1.2, 3.6),
    frameNarrow: around(productBox(CHAMBER), 1, 0.5, 1.5),
    model: FITS.chamber.model,
    size: 'Ø600 mm, 1950 mm high',
    dimension: dim(CHAMBER),
  },
  silt: {
    frame: around(productBox(SILT), 2, 1.2, 3.6),
    frameNarrow: around(productBox(SILT), 1, 0.5, 1.5),
    model: FITS.silt.model,
    size: 'Ø600 mm, 300 mm silt sump',
    dimension: dim(SILT),
  },
  separator: {
    frame: around(productBox(SEPARATOR), 2, 0.6, 2.2),
    frameNarrow: around(productBox(SEPARATOR), 1, 0.3, 0.8),
    model: FITS.separator.model,
    size: 'Ø1800 mm, 4290 mm high',
    dimension: dim(SEPARATOR),
  },
  storage: {
    frame: around(CRATES_BOX, 1.2, 1, 3.2),
    frameNarrow: around(CRATES_BOX, 0.6, 0.5, 1.6),
    diagram: 'crates',
    size: 'Crate modules, sized per site',
  },
  flow: {
    frame: around(productBox(FLOW), 2, 1.2, 3.6),
    frameNarrow: around(productBox(FLOW), 1, 0.5, 1.6),
    model: FITS.flow.model,
    size: 'Ø600 mm, 1500 mm high, 300 mm sump',
    dimension: dim(FLOW),
  },
  river: {
    frame: { min: [53, -4.8, -16], max: [76, 4, 1] },
    frameNarrow: { min: [55.5, -4.8, -7], max: [71, 2, 1] },
  },
}

/** The products and where each is drawn, by stop. */
export const PRODUCT_STOPS: { stop: StopId; place: ProductPlace }[] = [
  { stop: 'chamber', place: CHAMBER },
  { stop: 'silt', place: SILT },
  { stop: 'separator', place: SEPARATOR },
  { stop: 'flow', place: FLOW },
]
