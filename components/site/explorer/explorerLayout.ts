import type { PartRole } from '@/components/site/three/toon'

/**
 * Where everything sits in the Site Explorer scene.
 *
 * Units are metres for the site (buildings, ground, pipes). The ground
 * surface is y = 0 and the section cut, the face where the ground is
 * sliced open, is the plane z = 0: buildings stand behind it (z < 0) and
 * the drainage runs along it, half proud of the cut, so it reads like a
 * drawn section.
 *
 * Product models are millimetre files from the 3D library
 * (public/models/library/v1, see manifest.json) scaled by PRODUCT_SCALE.
 * That is 1.6 times true size, one factor for every product and for their
 * depths below ground, so their sizes stay honest against each other and a
 * 600 mm chamber still reads small beside a house.
 *
 * Every pipe is joined to a real connection on its product: the pipe
 * stubs, sockets and wall entries measured from the models (manifest.json
 * part bounding boxes, after components/site/three/assembly.ts), listed
 * as `inlet` and `outlet` in MODELS. Each product hangs from the level of
 * its inlet, every run falls from one product to the next, and a product
 * whose top ends up below the surface gets an access riser and cover up to
 * finished ground level, as its data sheet describes. docs/visual-audit-
 * suds-scenes.md records the checks behind the layout.
 *
 * Copy for each plot and product is in lib/content/site-explorer.ts,
 * matched by id.
 */

export const PRODUCT_SCALE = 0.0016
const S = PRODUCT_SCALE

export type Stream = 'surface' | 'foul' | 'duct'
export type Vec3 = [number, number, number]

const LIB = '/models/library/v1'

export type ModelKey =
  | 'chamber'
  | 'sudsceptor'
  | 'roflo'
  | 'rhinopod'
  | 'rhinopit'
  | 'rotex'
  | 'grease'
  | 'rhinolift'
  | 'drawpit'

/** A pipe connection, in mm from the body centre and base, for a product laid with its flow along +x. */
export interface Port {
  x: number
  y: number
  /** Plan offset off the body centre, where the stub does not point along the run. */
  z?: number
}

export interface ModelSpec {
  url: string
  /** Height of the model in mm (manifest bboxMm). */
  heightMm: number
  /** Radius of the body in plan, mm; used for placeholders and markers. */
  radiusMm: number
  /** Plan centre of the body in the file, mm, so it can be recentred. */
  centreMm?: [number, number]
  roles: Record<string, PartRole>
  /** Turn about the vertical, radians, that puts the inlet upstream (-x) and the outlet downstream (+x). */
  turn?: number
  /**
   * Inserts are drawn inside a housing cut in half along the section line
   * (a gully, a chamber), sized in mm. `insert` places the insert in it.
   */
  housing?: { radiusMm: number; heightMm: number }
  insert?: { x: number; y: number }
  /** Stand wholly in front of the cut rather than half buried in it. */
  proud?: boolean
  /** Plan position of the body centre, metres, where it has to stand forward of the cut. */
  planZ?: number
  inlet: Port
  outlet: Port
}

/* Part roles follow lib/content/product-models.ts, which set them for the
   product page viewers. Connection positions are from manifest.json. */
export const MODELS: Record<ModelKey, ModelSpec> = {
  // SERSIC600: 1950 mm body; 225 twinwall stubs in holes centred 192.5 mm
  // up on the 12 / 6 o'clock line (the file's z), couplers ending 642 mm
  // out. Turned a quarter so the 12 o'clock outlet points downstream.
  chamber: {
    url: `${LIB}/rhino-inspection-chamber/rhino-inspection-chamber-sersic600.glb`,
    heightMm: 1954,
    radiusMm: 353,
    turn: -Math.PI / 2,
    roles: { body: 'casing', 'body-bottom': 'casing', base: 'insides', lid: 'accent', inlet: 'inlet', outlet: 'inlet' },
    inlet: { x: -600, y: 192.5 },
    outlet: { x: 600, y: 192.5 },
  },
  // SEHDS1800: 4290 mm, Ø1800 shell; tangential inlet and radial outlet
  // centred 3520 mm up, 90 degrees apart. Turned an eighth so both stubs
  // point back into the cut, and stood forward so their ends meet the run.
  sudsceptor: {
    url: `${LIB}/sudsceptor/sudsceptor-sehds1800.glb`,
    heightMm: 4290,
    radiusMm: 905,
    centreMm: [147, 172],
    turn: -Math.PI / 4,
    planZ: 1.6,
    roles: {
      casing: 'casing',
      inlet: 'inlet',
      outlet: 'inlet',
      'center-pipe': 'insides',
      'inner-curved-baffle': 'insides',
      'outer-curved-baffle': 'insides',
      'water-track': 'insides',
      stand: 'accent',
    },
    inlet: { x: -764, y: 3520, z: -932 },
    outlet: { x: 884, y: 3520, z: -884 },
  },
  // POC600: 1495 mm tube, Ø696; stubs on the lower band centred 356 mm up,
  // ends at +/-452. The orifice sits on the file's -x stub, so it is turned
  // half round to put the orifice on the outlet, downstream.
  roflo: {
    url: `${LIB}/rhinoroflo/rhinoroflo-poc600.glb`,
    heightMm: 1495,
    radiusMm: 348,
    turn: Math.PI,
    roles: {
      'poc-tube': 'casing',
      'poc-base': 'casing',
      'poc-divider': 'insides',
      'poc-string': 'insides',
      'poc-string-clips': 'accent',
      'poc-orifice': 'insides',
      'poc-orifice-latch': 'accent',
    },
    inlet: { x: -452, y: 356 },
    outlet: { x: 452, y: 356 },
  },
  // A RhinoPod floating in the standing water of a Ø480 road gully pot,
  // whose trapped outlet leaves the side 350 mm below the grating.
  rhinopod: {
    url: `${LIB}/rhinopod/rhinopod-serpod1850.glb`,
    heightMm: 579,
    radiusMm: 163,
    roles: { casing: 'casing', top: 'insides', mid: 'insides', bottom: 'insides' },
    housing: { radiusMm: 240, heightMm: 1000 },
    insert: { x: 0, y: 1000 - 579 - 120 },
    inlet: { x: -240, y: 650 },
    outlet: { x: 240, y: 650 },
  },
  // SERPT600: 1495 mm tubing; stubs centred 374.5 mm up, ends at +/-540.
  // The file is already drawn cut in half, so it stands proud of the cut.
  rhinopit: {
    url: `${LIB}/rhinopit/rhinopit-serpt600.glb`,
    heightMm: 1542,
    radiusMm: 348,
    centreMm: [0, -273],
    roles: { cube: 'xray', 'serpt-inlet': 'inlet', serptoutlet: 'inlet' },
    proud: true,
    inlet: { x: -540, y: 374.5 },
    outlet: { x: 540, y: 374.5 },
  },
  // The vortex regulator in a Ø1200 x 2000 chamber (ROTEX1200 data sheet):
  // mounted on the outlet wall with the outlet invert 500 mm above the base,
  // the sump below it, and the inlet opposite at 6 o'clock. The regulator's
  // outlet pipe points to -z in the file; the turn runs it downstream.
  rotex: {
    url: `${LIB}/rhinorotex-2025/rhinorotex-2025-parts.glb`,
    heightMm: 1020,
    radiusMm: 208,
    turn: -Math.PI / 2,
    roles: {
      'snail-3-4': 'accent',
      'bypass-arm': 'accent',
      'bypass-cap': 'accent',
      'siphon-pipe': 'accent',
      'outlet-pipe': 'inlet',
    },
    housing: { radiusMm: 600, heightMm: 2000 },
    // Its outlet pipe (tip 210 mm out, centre 226 mm up) meets the wall.
    insert: { x: 600 - 210 - 15, y: 586 - 226 },
    inlet: { x: -600, y: 586 },
    outlet: { x: 600, y: 586 },
  },
  // Jumbo Micro: floor-standing (RHINO GT data sheet: under-sink or floor
  // mounted). Inlet centred 446 mm up, outlet 416 mm, on the file's z faces.
  grease: {
    url: `${LIB}/grease-trap-jumbo-micro/grease-trap-jumbo-micro.glb`,
    heightMm: 644,
    radiusMm: 400,
    turn: -Math.PI / 2,
    roles: {
      'jumbo-micro-casing-xray': 'xray',
      'jumbo-micro-cover': 'accent',
      'jumbo-micro-inlet-1': 'inlet',
      'jumbo-micro-inlet-2': 'inlet',
    },
    inlet: { x: -415, y: 446 },
    outlet: { x: 415, y: 416 },
  },
  // MINI 2000D wet well, Ø1000: the gravity inlet enters low, the pumped
  // discharge leaves near the top for the rising main.
  rhinolift: {
    url: `${LIB}/rhinolift-mini/rhinolift-mini2000d.glb`,
    heightMm: 2000,
    radiusMm: 500,
    roles: { casing: 'casing', insides: 'insides', 'insides-2': 'insides', floats: 'accent' },
    inlet: { x: -500, y: 1300 },
    outlet: { x: 500, y: 1850 },
  },
  // RhinoDuct 930 x 780 with its cover; the duct enters the side wall.
  drawpit: {
    url: `${LIB}/rhinoduct-with-cover/rhinoduct-serd-cover.glb`,
    heightMm: 634,
    radiusMm: 465,
    roles: { cover: 'accent', frame: 'accent' },
    inlet: { x: -465, y: 320 },
    outlet: { x: 465, y: 320 },
  },
}

export interface ProductPlacement {
  /** Matches the product id in lib/content/site-explorer.ts. */
  id: string
  model: ModelKey
  stream: Stream
  x: number
  /** Centre level of the inlet connection, metres; the product hangs from it. */
  inY?: number
  /** Or the level of its base, for products standing on a floor or finished at the surface. */
  base?: number
  /** Direction the water runs along x through it. */
  flow?: 1 | -1
  /** Plan position off the cut, where not set by the model. */
  z?: number
}

export interface PipeRun {
  stream: Stream
  /** Downstream order: water flows from the first point to the last. */
  points: Vec3[]
  radius?: number
  /** Pipe ends that finish in a socket: a wall entry, crates, a housing. */
  collars?: ('start' | 'end')[]
}

export interface Box3Spec {
  min: Vec3
  max: Vec3
}

/** Geocellular attenuation storage, drawn as an illustration (no product model). */
export interface StorageSpec {
  from: number
  bottom: number
  /** Modules along x, up, and back from the front face. */
  count: [number, number, number]
}

export interface PlotLayout {
  id: string
  /** Plot centre along the strip. */
  cx: number
  /** What the camera frames on a wide screen. */
  frame: Box3Spec
  /** A tighter frame for tall, narrow screens. */
  frameNarrow: Box3Spec
  products: ProductPlacement[]
  pipes: PipeRun[]
  storage?: StorageSpec
}

/** The section cut runs along z = 0; products and pipes sit just proud of it. */
export const CUT_Z = 0.15
/** Bottom of the ground slab: deep enough for the separator's sump. */
export const GROUND_DEPTH = 9
/** The whole strip of plots, x from and to. */
export const STRIP: [number, number] = [-16, 104]
/** Depth of the slab behind the cut. */
export const STRIP_BACK = -23

/** One crate module (1000 x 400 x 500 mm) at the product scale. */
export const MODULE: Vec3 = [1.0 * S * 1000, 0.4 * S * 1000, 0.5 * S * 1000]

// ── geometry helpers ─────────────────────────────────────────────────

/** Metres from the model's base to its top, including any housing. */
export function productHeight(p: ProductPlacement): number {
  const spec = MODELS[p.model]
  return (spec.housing ? spec.housing.heightMm : spec.heightMm) * PRODUCT_SCALE
}

export function productRadius(p: ProductPlacement): number {
  const spec = MODELS[p.model]
  return (spec.housing ? spec.housing.radiusMm : spec.radiusMm) * PRODUCT_SCALE
}

/** Plan offset from the cut: half proud by default, housings fully proud. */
export function productZ(p: ProductPlacement): number {
  if (p.z !== undefined) return p.z
  const spec = MODELS[p.model]
  if (spec.planZ !== undefined) return spec.planZ
  if (spec.housing) return spec.housing.radiusMm * PRODUCT_SCALE + 0.03
  if (spec.proud) return spec.radiusMm * PRODUCT_SCALE + 0.05
  return CUT_Z
}

/** Level of the product's base (of its housing, where it has one). */
export function productBase(p: ProductPlacement): number {
  if (p.base !== undefined) return p.base
  return (p.inY ?? 0) - MODELS[p.model].inlet.y * S
}

export function productTop(p: ProductPlacement): number {
  return productBase(p) + productHeight(p)
}

/** Where a pipe meets the product's inlet or outlet, in the scene. */
export function port(p: ProductPlacement, end: 'in' | 'out'): Vec3 {
  const spec = MODELS[p.model]
  const at = end === 'in' ? spec.inlet : spec.outlet
  const f = p.flow ?? 1
  return [p.x + f * at.x * S, productBase(p) + at.y * S, productZ(p) + f * (at.z ?? 0) * S]
}

const storageTo = (s: StorageSpec) => s.from + MODULE[0] * s.count[0]
/** Level of a pipe entering the crates' end face, a little above their base. */
const storageIn = (s: StorageSpec): Vec3 => [s.from, s.bottom + 0.22, CUT_Z]
const storageOut = (s: StorageSpec): Vec3 => [storageTo(s), s.bottom + 0.12, CUT_Z]

/**
 * A roof downpipe: down the wall into its gully at the foot, then (out of
 * sight, below ground behind the cut) down to the drain's depth and
 * forward to the section, where it turns into the product's inlet.
 */
function downpipe(x: number, top: number, z: number, into: Vec3, radius = 0.12): PipeRun {
  const y = into[1]
  return {
    stream: 'surface',
    radius,
    points: [[x, top, z], [x, -0.2, z], [x, y + 0.1, z], [x, y + 0.04, CUT_Z], into],
  }
}

/** A lateral out of the cut face (from a gully or a building) joining the drain at `join`. */
function lateral(stream: Stream, x: number, fromY: number, z: number, join: Vec3, radius = 0.12): PipeRun {
  return {
    stream,
    radius,
    points: [[x, fromY, z], [x, join[1] + 0.2, z], [x, join[1] + 0.14, CUT_Z - 0.02], join],
  }
}

/** Level of the inlet stub on a SERSIC600 set with its cap just under the finished surface. */
const CHAMBER_IN = -0.03 - (1950 - 192.5) * S

/** Pipe radii, metres, at the product scale (outside diameter times S over 2, a little inside the sockets). */
const R225 = 0.2
const R150 = 0.14
const R100 = 0.09

// ── office ───────────────────────────────────────────────────────────

const OFFICE_CHAMBER: ProductPlacement = { id: 'office-surface-chamber', model: 'chamber', stream: 'surface', x: -9.8, inY: CHAMBER_IN }
const OFFICE_SEPARATOR: ProductPlacement = { id: 'office-separator', model: 'sudsceptor', stream: 'surface', x: -3.4, inY: CHAMBER_IN - 0.1 }
const OFFICE_STORAGE: StorageSpec = { from: 0, bottom: CHAMBER_IN - 0.4, count: [3, 3, 2] }
const OFFICE_FLOW: ProductPlacement = { id: 'office-flow-control', model: 'roflo', stream: 'surface', x: 7.4, inY: storageOut(OFFICE_STORAGE)[1] - 0.07 }
const OFFICE_FOUL: ProductPlacement = { id: 'office-foul-chamber', model: 'chamber', stream: 'foul', x: 12.8, inY: CHAMBER_IN }

// ── car park ─────────────────────────────────────────────────────────

const PARK_GULLY: ProductPlacement = { id: 'car-park-rhinopod', model: 'rhinopod', stream: 'surface', x: 21.2, base: -1.6 }
const PARK_CATCHPIT: ProductPlacement = { id: 'car-park-catchpit', model: 'rhinopit', stream: 'surface', x: 28.8, inY: -1.95 }
const PARK_STORAGE: StorageSpec = { from: 31.4, bottom: -2.35, count: [3, 2, 2] }
const PARK_VORTEX: ProductPlacement = { id: 'car-park-vortex', model: 'rotex', stream: 'surface', x: 39.2, inY: storageOut(PARK_STORAGE)[1] - 0.07 }

// ── retail ───────────────────────────────────────────────────────────

/** The cafe's back kitchen, a single-storey room on the parade's gable: x from and to, z front and back. */
export const BACK_KITCHEN = { x0: 73.0, x1: 75.6, z0: -6.3, z1: -9.9, height: 2.7 } as const

const RETAIL_CHAMBER: ProductPlacement = { id: 'retail-surface-chamber', model: 'chamber', stream: 'surface', x: 53.8, inY: CHAMBER_IN }
const RETAIL_GREASE: ProductPlacement = { id: 'retail-grease-trap', model: 'grease', stream: 'foul', x: 74.2, base: 0.02, z: -8.1 }
const RETAIL_FOUL: ProductPlacement = { id: 'retail-foul-chamber', model: 'chamber', stream: 'foul', x: 66.4, inY: CHAMBER_IN, flow: -1 }

// ── house ────────────────────────────────────────────────────────────

const HOUSE_CHAMBER: ProductPlacement = { id: 'house-surface-chamber', model: 'chamber', stream: 'surface', x: 81.4, inY: CHAMBER_IN, flow: -1 }
const HOUSE_PUMP: ProductPlacement = { id: 'house-pumping-station', model: 'rhinolift', stream: 'foul', x: 91.6, inY: -4.4 }
const HOUSE_FOUL: ProductPlacement = { id: 'house-foul-chamber', model: 'chamber', stream: 'foul', x: 95.8, inY: CHAMBER_IN }
const HOUSE_DRAWPIT: ProductPlacement = { id: 'house-drawpit', model: 'drawpit', stream: 'duct', x: 101, base: -MODELS.drawpit.heightMm * S }

export const PLOTS: PlotLayout[] = [
  {
    id: 'office',
    cx: 0,
    frame: { min: [-15, -9, -19], max: [15, 13, 3.2] },
    frameNarrow: { min: [-11.5, -9, -9], max: [12, 13, 3.2] },
    products: [OFFICE_CHAMBER, OFFICE_SEPARATOR, OFFICE_FLOW, OFFICE_FOUL],
    storage: OFFICE_STORAGE,
    pipes: [
      // Roof downpipe on the front of the office, through its gully to the head of the run.
      downpipe(-11.4, 11.7, -6.8, port(OFFICE_CHAMBER, 'in')),
      // Chamber to the separator: the whole catchment is treated before storage.
      { stream: 'surface', radius: R225, points: [port(OFFICE_CHAMBER, 'out'), port(OFFICE_SEPARATOR, 'in')] },
      // A yard gully joining the carrier drain.
      lateral('surface', -6.9, -0.25, -1.2, [-6.45, -2.89, CUT_Z]),
      // Separator to the attenuation crates.
      {
        stream: 'surface',
        radius: R225,
        collars: ['end'],
        points: [port(OFFICE_SEPARATOR, 'out'), [-1.0, storageIn(OFFICE_STORAGE)[1] + 0.02, CUT_Z], storageIn(OFFICE_STORAGE)],
      },
      // Crates to the orifice flow control at their outlet.
      { stream: 'surface', radius: R150, collars: ['start'], points: [storageOut(OFFICE_STORAGE), port(OFFICE_FLOW, 'in')] },
      // Out at the restricted rate, back to the public surface water sewer.
      {
        stream: 'surface',
        radius: R150,
        points: [port(OFFICE_FLOW, 'out'), [10.0, port(OFFICE_FLOW, 'out')[1] - 0.05, CUT_Z], [10.0, port(OFFICE_FLOW, 'out')[1] - 0.07, -3]],
      },
      // Foul drain from the building (below ground behind the cut) to its own chamber.
      {
        stream: 'foul',
        radius: R150,
        points: [[5.4, -2.5, -7.2], [10.9, -2.72, -7.2], [10.9, -2.78, CUT_Z], port(OFFICE_FOUL, 'in')],
      },
      { stream: 'foul', radius: R225, points: [port(OFFICE_FOUL, 'out'), [14.6, -2.9, CUT_Z], [14.6, -2.92, -3]] },
    ],
  },
  {
    id: 'car-park',
    cx: 31,
    frame: { min: [17, -7.2, -20], max: [46, 12, 1.8] },
    frameNarrow: { min: [20, -7.2, -9], max: [43, 12, 1.8] },
    products: [PARK_GULLY, PARK_CATCHPIT, PARK_VORTEX],
    storage: PARK_STORAGE,
    pipes: [
      // The RhinoPod gully's trapped outlet, dropping to the carrier drain and on to the catchpit.
      {
        stream: 'surface',
        radius: R150,
        points: [port(PARK_GULLY, 'out'), [22.1, -0.6, CUT_Z], [23.2, -1.7, CUT_Z], [27.3, -1.9, CUT_Z], port(PARK_CATCHPIT, 'in')],
      },
      // Deck drainage down the front of the car park, joining the carrier upstream of the catchpit.
      downpipe(26.6, 9.2, -6.75, [26.95, -1.87, CUT_Z]),
      // Catchpit to the attenuation crates under the bays.
      {
        stream: 'surface',
        radius: R150,
        collars: ['end'],
        points: [port(PARK_CATCHPIT, 'out'), [30.5, storageIn(PARK_STORAGE)[1] + 0.03, CUT_Z], storageIn(PARK_STORAGE)],
      },
      // Crates to the vortex flow control at their outlet.
      {
        stream: 'surface',
        radius: R150,
        collars: ['start', 'end'],
        points: [storageOut(PARK_STORAGE), [37.4, port(PARK_VORTEX, 'in')[1] + 0.03, CUT_Z], port(PARK_VORTEX, 'in')],
      },
      // Out at the restricted rate to the public surface water sewer.
      {
        stream: 'surface',
        radius: R150,
        collars: ['start'],
        points: [port(PARK_VORTEX, 'out'), [41.2, port(PARK_VORTEX, 'out')[1] - 0.05, CUT_Z], [43.6, port(PARK_VORTEX, 'out')[1] - 0.12, CUT_Z], [43.6, port(PARK_VORTEX, 'out')[1] - 0.14, -3]],
      },
    ],
  },
  {
    id: 'retail',
    cx: 62,
    frame: { min: [48, -7.2, -18], max: [76.2, 9, 1] },
    frameNarrow: { min: [51, -7.2, -10], max: [76, 9, 1.5] },
    products: [RETAIL_CHAMBER, RETAIL_GREASE, RETAIL_FOUL],
    pipes: [
      downpipe(51.3, 7.1, -5.8, port(RETAIL_CHAMBER, 'in')),
      { stream: 'surface', radius: R225, points: [port(RETAIL_CHAMBER, 'out'), [57.6, -2.9, CUT_Z], [57.6, -2.92, -3]] },
      // The pavement gully joining the run.
      lateral('surface', 55.4, -0.25, -0.9, [55.85, -2.86, CUT_Z]),
      // Kitchen waste from the sink into the grease trap.
      { stream: 'foul', radius: R100, points: [[BACK_KITCHEN.x0 + 0.32, 0.8, -9.2], [BACK_KITCHEN.x0 + 0.32, 0.77, -8.1], port(RETAIL_GREASE, 'in')] },
      // From the trap down through the floor, below ground to the foul chamber.
      {
        stream: 'foul',
        radius: R100,
        points: [port(RETAIL_GREASE, 'out'), [75.2, port(RETAIL_GREASE, 'out')[1] - 0.02, -8.1], [75.2, -2.5, -8.1], [72.0, -2.66, -8.1], [72.0, -2.72, CUT_Z], port(RETAIL_FOUL, 'in')],
      },
      { stream: 'foul', radius: R150, points: [port(RETAIL_FOUL, 'out'), [62.0, -2.9, CUT_Z], [62.0, -2.92, -3]] },
    ],
  },
  {
    id: 'house',
    cx: 90,
    frame: { min: [76, -7.2, -20], max: [104, 10, 1] },
    frameNarrow: { min: [78, -7.2, -10], max: [103, 9, 1.5] },
    products: [HOUSE_CHAMBER, HOUSE_PUMP, HOUSE_FOUL, HOUSE_DRAWPIT],
    pipes: [
      downpipe(84.4, 5.7, -8.8, port(HOUSE_CHAMBER, 'in')),
      { stream: 'surface', radius: R225, points: [port(HOUSE_CHAMBER, 'out'), [78.4, -2.9, CUT_Z], [78.4, -2.92, -3]] },
      // The house drain, too low to fall to the sewer, into the pumping station.
      {
        stream: 'foul',
        radius: R150,
        collars: ['end'],
        points: [[89.4, -2.4, -9.4], [89.4, -4.3, -9.4], [89.4, -4.34, CUT_Z], port(HOUSE_PUMP, 'in')],
      },
      // Rising main: pumped up to the gravity chamber, entering at its invert.
      { stream: 'foul', radius: 0.07, collars: ['start'], points: [port(HOUSE_PUMP, 'out'), [93.6, -3.36, CUT_Z], port(HOUSE_FOUL, 'in')] },
      { stream: 'foul', radius: R150, points: [port(HOUSE_FOUL, 'out'), [97.6, -2.9, CUT_Z], [97.6, -2.92, -3]] },
      // Cable duct from the driveway charger to the drawpit.
      { stream: 'duct', radius: 0.07, collars: ['end'], points: [[98.3, 0.6, -6.6], [98.3, -0.45, -6.6], [98.3, -0.5, CUT_Z], port(HOUSE_DRAWPIT, 'in')] },
    ],
  },
]

/** The view before a plot is chosen: the whole strip. */
export const OVERVIEW: Box3Spec = { min: [STRIP[0], -7.2, STRIP_BACK], max: [STRIP[1], 12, 1] }

export function storageBox(s: StorageSpec): Box3Spec {
  return {
    min: [s.from, s.bottom, 0.02],
    max: [storageTo(s), s.bottom + MODULE[1] * s.count[1], 0.02 + MODULE[2] * s.count[2]],
  }
}
