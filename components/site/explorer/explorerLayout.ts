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
 * That is 1.6 times true size, one factor for every product, so their
 * sizes stay honest against each other and a 600 mm chamber still reads
 * small beside a house.
 *
 * Copy for each plot and product is in lib/content/site-explorer.ts,
 * matched by id.
 */

export const PRODUCT_SCALE = 0.0016

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

export interface ModelSpec {
  url: string
  /** Height of the model in mm (manifest bboxMm). */
  heightMm: number
  /** Radius of the body in plan, mm; used for placeholders and markers. */
  radiusMm: number
  /** Plan centre of the body in the file, mm, so it can be recentred. */
  centreMm?: [number, number]
  roles: Record<string, PartRole>
  /** Turn about the vertical, radians, so its pipe stubs face along the cut. */
  turn?: number
  /**
   * Inserts are drawn inside a housing cut in half along the section line
   * (a gully, a chamber), sized in mm.
   */
  housing?: { radiusMm: number; heightMm: number; insetMm: number }
  /** Stand wholly in front of the cut rather than half buried in it. */
  proud?: boolean
}

/* Part roles follow lib/content/product-models.ts, which set them for the
   product page viewers. */
export const MODELS: Record<ModelKey, ModelSpec> = {
  chamber: {
    url: `${LIB}/rhino-inspection-chamber/rhino-inspection-chamber-sersic600.glb`,
    heightMm: 1950,
    radiusMm: 353,
    roles: { body: 'casing', 'body-bottom': 'casing', base: 'insides', lid: 'insides', inlet: 'inlet' },
  },
  sudsceptor: {
    url: `${LIB}/sudsceptor/sudsceptor-sehds1800.glb`,
    heightMm: 4290,
    radiusMm: 905,
    centreMm: [147, 172],
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
  },
  roflo: {
    url: `${LIB}/rhinoroflo/rhinoroflo-poc600.glb`,
    heightMm: 1495,
    radiusMm: 348,
    roles: {
      'poc-tube': 'casing',
      'poc-base': 'casing',
      'poc-divider': 'insides',
      'poc-string': 'insides',
      'poc-string-clips': 'insides',
      'poc-orifice': 'accent',
      'poc-orifice-latch': 'accent',
    },
  },
  rhinopod: {
    url: `${LIB}/rhinopod/rhinopod-serpod1850.glb`,
    heightMm: 579,
    radiusMm: 163,
    roles: { casing: 'casing', top: 'insides', mid: 'insides', bottom: 'insides' },
    housing: { radiusMm: 240, heightMm: 1000, insetMm: 120 },
  },
  rhinopit: {
    url: `${LIB}/rhinopit/rhinopit-serpt600.glb`,
    heightMm: 1542,
    radiusMm: 348,
    centreMm: [0, -273],
    roles: { cube: 'xray', 'serpt-inlet': 'inlet', serptoutlet: 'inlet' },
    // The file is already drawn cut in half, so it stands proud of the cut.
    proud: true,
  },
  rotex: {
    url: `${LIB}/rhinorotex-2025/rhinorotex-2025-parts.glb`,
    heightMm: 1020,
    radiusMm: 208,
    // The outlet pipe points to -z in the file; turn it to run along the cut.
    turn: -Math.PI / 2,
    roles: {
      'snail-3-4': 'accent',
      'bypass-arm': 'accent',
      'bypass-cap': 'accent',
      'siphon-pipe': 'accent',
      'outlet-pipe': 'inlet',
    },
    housing: { radiusMm: 600, heightMm: 1800, insetMm: 60 },
  },
  grease: {
    url: `${LIB}/grease-trap-jumbo-micro/grease-trap-jumbo-micro.glb`,
    heightMm: 644,
    radiusMm: 400,
    // Inlet and outlet sit on the z faces; turn them to face along the unit.
    turn: Math.PI / 2,
    roles: {
      'jumbo-micro-casing-xray': 'xray',
      'jumbo-micro-cover': 'accent',
      'jumbo-micro-inlet-1': 'inlet',
      'jumbo-micro-inlet-2': 'inlet',
    },
  },
  rhinolift: {
    url: `${LIB}/rhinolift-mini/rhinolift-mini2000d.glb`,
    heightMm: 2000,
    radiusMm: 500,
    roles: { casing: 'casing', insides: 'insides', 'insides-2': 'insides', floats: 'accent' },
  },
  drawpit: {
    url: `${LIB}/rhinoduct-with-cover/rhinoduct-serd-cover.glb`,
    heightMm: 707,
    radiusMm: 465,
    roles: { cover: 'accent' },
  },
}

export interface ProductPlacement {
  /** Matches the product id in lib/content/site-explorer.ts. */
  id: string
  model: ModelKey
  stream: Stream
  x: number
  /** Top of the product (or of its housing), metres; the surface is 0. */
  top: number
  /** Plan position off the cut; defaults to half proud of it. */
  z?: number
}

export interface PipeRun {
  stream: Stream
  /** Downstream order: water flows from the first point to the last. */
  points: Vec3[]
  radius?: number
}

export interface Box3Spec {
  min: Vec3
  max: Vec3
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
}

/** The section cut runs along z = 0; products and pipes sit just proud of it. */
export const CUT_Z = 0.15
/** Bottom of the ground slab. */
export const GROUND_DEPTH = 7.5
/** The whole strip of plots, x from and to. */
export const STRIP: [number, number] = [-16, 104]
/** Depth of the slab behind the cut. */
export const STRIP_BACK = -23

export const PLOTS: PlotLayout[] = [
  {
    id: 'office',
    cx: 0,
    frame: { min: [-15, -7.2, -19], max: [15, 13, 1] },
    frameNarrow: { min: [-11.5, -7.2, -9], max: [12, 13, 1.5] },
    products: [
      { id: 'office-surface-chamber', model: 'chamber', stream: 'surface', x: -9.5, top: -0.05 },
      { id: 'office-separator', model: 'sudsceptor', stream: 'surface', x: -2.5, top: -0.25, z: 0.1 },
      { id: 'office-flow-control', model: 'roflo', stream: 'surface', x: 4.5, top: -0.05 },
      { id: 'office-foul-chamber', model: 'chamber', stream: 'foul', x: 10.5, top: -0.05 },
    ],
    pipes: [
      // Roof downpipe on the front of the office, into the first chamber.
      { stream: 'surface', points: [[-11.4, 11.7, -6.8], [-11.4, -0.75, -6.8], [-11.4, -0.8, CUT_Z], [-9.5, -0.95, CUT_Z]] },
      { stream: 'surface', points: [[-9.5, -1.05, CUT_Z], [-2.5, -1.45, CUT_Z]] },
      { stream: 'surface', points: [[-2.5, -1.5, CUT_Z], [4.5, -1.7, CUT_Z]] },
      // Outfall at the restricted rate, on towards the public sewer.
      { stream: 'surface', points: [[4.5, -1.8, CUT_Z], [14, -1.95, CUT_Z], [14, -1.95, -3]] },
      // Foul drain from the building.
      { stream: 'foul', points: [[2, -2.3, -7], [2, -2.35, CUT_Z], [10.5, -2.45, CUT_Z]] },
      { stream: 'foul', points: [[10.5, -2.55, CUT_Z], [15, -2.65, CUT_Z], [15, -2.65, -3]] },
    ],
  },
  {
    id: 'car-park',
    cx: 31,
    frame: { min: [17, -7.2, -20], max: [46, 12, 1] },
    frameNarrow: { min: [20.5, -7.2, -9], max: [43, 12, 1.5] },
    products: [
      { id: 'car-park-rhinopod', model: 'rhinopod', stream: 'surface', x: 23, top: 0 },
      { id: 'car-park-catchpit', model: 'rhinopit', stream: 'surface', x: 30, top: -0.05 },
      { id: 'car-park-vortex', model: 'rotex', stream: 'surface', x: 37.5, top: -0.05 },
    ],
    pipes: [
      { stream: 'surface', points: [[23, -1.2, CUT_Z], [30, -1.85, CUT_Z]] },
      // Deck drainage down the front of the car park, joining the run.
      { stream: 'surface', points: [[26.6, 9.2, -6.75], [26.6, -1.1, -6.75], [26.6, -1.25, CUT_Z], [26.6, -1.5, CUT_Z]] },
      { stream: 'surface', points: [[30, -1.95, CUT_Z], [37.5, -2.3, CUT_Z]] },
      { stream: 'surface', points: [[37.5, -2.47, CUT_Z], [44, -2.6, CUT_Z], [44, -2.6, -3]] },
    ],
  },
  {
    id: 'retail',
    cx: 62,
    frame: { min: [48, -7.2, -18], max: [76, 9, 1] },
    frameNarrow: { min: [51, -7.2, -9], max: [73.5, 9, 1.5] },
    products: [
      { id: 'retail-surface-chamber', model: 'chamber', stream: 'surface', x: 53.5, top: -0.05 },
      { id: 'retail-grease-trap', model: 'grease', stream: 'foul', x: 70, top: -0.05 },
      { id: 'retail-foul-chamber', model: 'chamber', stream: 'foul', x: 64.5, top: -0.05 },
    ],
    pipes: [
      { stream: 'surface', points: [[51.3, 7.1, -5.8], [51.3, -0.75, -5.8], [51.3, -0.8, CUT_Z], [53.5, -0.95, CUT_Z]] },
      { stream: 'surface', points: [[53.5, -1.05, CUT_Z], [58, -1.2, CUT_Z], [58, -1.2, -3]] },
      // The cafe kitchen drain, through the grease trap to the foul chamber.
      { stream: 'foul', points: [[72, -0.3, -6], [72, -0.35, CUT_Z], [70, -0.4, CUT_Z]] },
      { stream: 'foul', points: [[70, -0.45, CUT_Z], [66.6, -0.6, CUT_Z], [64.5, -1.25, CUT_Z]] },
      { stream: 'foul', points: [[64.5, -1.35, CUT_Z], [60.5, -1.5, CUT_Z], [60.5, -1.5, -3]] },
    ],
  },
  {
    id: 'house',
    cx: 90,
    frame: { min: [76, -7.2, -20], max: [104, 10, 1] },
    frameNarrow: { min: [78, -7.2, -10], max: [103, 9, 1.5] },
    products: [
      { id: 'house-surface-chamber', model: 'chamber', stream: 'surface', x: 80.5, top: -0.05 },
      { id: 'house-pumping-station', model: 'rhinolift', stream: 'foul', x: 87.5, top: -0.05 },
      { id: 'house-foul-chamber', model: 'chamber', stream: 'foul', x: 94, top: -0.05 },
      { id: 'house-drawpit', model: 'drawpit', stream: 'duct', x: 101, top: 0 },
    ],
    pipes: [
      { stream: 'surface', points: [[84.4, 5.7, -8.8], [84.4, -0.75, -8.8], [84.4, -0.8, CUT_Z], [80.5, -1.0, CUT_Z]] },
      { stream: 'surface', points: [[80.5, -1.1, CUT_Z], [77.5, -1.2, CUT_Z], [77.5, -1.2, -3]] },
      // The house drain falls to the pumping station, below the sewer level.
      { stream: 'foul', points: [[89.8, -1.85, -9], [89.8, -1.9, CUT_Z], [87.5, -2.05, CUT_Z]] },
      // Rising main: pumped up and across to a gravity chamber.
      { stream: 'foul', radius: 0.08, points: [[87.5, -0.55, CUT_Z], [94, -0.55, CUT_Z]] },
      { stream: 'foul', points: [[94, -1.0, CUT_Z], [97, -1.1, CUT_Z], [97, -1.1, -3]] },
      // Cable duct from the driveway charger to the drawpit.
      { stream: 'duct', radius: 0.07, points: [[98.3, 0.6, -6.6], [98.3, -0.45, -6.6], [98.3, -0.5, CUT_Z], [101, -0.5, CUT_Z]] },
    ],
  },
]

/** The view before a plot is chosen: the whole strip. */
export const OVERVIEW: Box3Spec = { min: [STRIP[0], -GROUND_DEPTH, STRIP_BACK], max: [STRIP[1], 12, 1] }

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
  if (spec.housing) return spec.housing.radiusMm * PRODUCT_SCALE + 0.03
  if (spec.proud) return spec.radiusMm * PRODUCT_SCALE + 0.05
  return CUT_Z
}
