import * as THREE from 'three'
import { PRODUCT_MODELS, type ProductModel } from '@/lib/content/product-models'
import type { JourneyStop } from '@/lib/content/water-journey'

/**
 * The little world the water journey happens on, and where each stop sits.
 *
 * The world is a thick disc seen side-on, like a slice through a small
 * planet: houses, roads and a river on its rim, and the drainage run in
 * the cut face below ground. Positions are polar: `phi` is degrees round
 * from the top, clockwise (left of the top is negative), `r` is the
 * distance from the centre. The front face is at z = 0 and the disc runs
 * back to z = -DEPTH.
 */

export const R = 14
export const DEPTH = 4
/** The river notch in the rim, in degrees. */
export const RIVER: [number, number] = [50, 61]
export const RIVER_BED = R - 1.3
export const RIVER_LEVEL = R - 0.72

export type StopId = JourneyStop['id']

/** A procedural stand-in, drawn as a diagram, where no product model exists. */
export type DiagramKind = 'tank' | 'crates'

export interface StopScene {
  /** Where the camera looks and the product rises from. */
  phi: number
  r: number
  /** Camera lift above the stop, and how far back it sits. */
  lift: number
  distance: number
  /** A real product model from the 3D library. */
  model?: ProductModel
  diagram?: DiagramKind
  /** Degrees to turn the model so its best side leads. */
  yaw?: number
}

const heroOf = (slug: string): ProductModel | undefined => PRODUCT_MODELS[slug]?.hero

export const STOP_SCENES: Record<StopId, StopScene> = {
  rain: { phi: -55, r: R + 1.7, lift: 0.3, distance: 10 },
  harvest: { phi: -47.5, r: R - 0.75, lift: 0.9, distance: 7.2, diagram: 'tank' },
  chamber: { phi: -31, r: R - 0.7, lift: 0.9, distance: 7.2, model: heroOf('inspection-chamber'), yaw: 30 },
  silt: { phi: -13, r: R - 0.7, lift: 0.9, distance: 7.2, model: heroOf('catchpit-silt-trap'), yaw: 20 },
  separator: { phi: 5, r: R - 0.7, lift: 0.9, distance: 7.2, model: heroOf('rhinoceptor'), yaw: -110 },
  storage: { phi: 23, r: R - 0.8, lift: 0.9, distance: 7.2, diagram: 'crates' },
  flow: { phi: 39, r: R - 0.7, lift: 0.9, distance: 7.2, model: heroOf('flow-control'), yaw: 30 },
  river: { phi: 54.5, r: R - 0.45, lift: 0.9, distance: 8.2 },
}

// ── polar helpers ───────────────────────────────────────────────────

const DEG = Math.PI / 180

/** Unit vector pointing out of the rim at `phi` degrees. */
export function radial(phi: number, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(Math.sin(phi * DEG), Math.cos(phi * DEG), 0)
}

/** A point at `phi` degrees, radius `r`, depth `z`. */
export function polar(phi: number, r: number, z = 0, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(Math.sin(phi * DEG) * r, Math.cos(phi * DEG) * r, z)
}

/** Rotation about z that stands an object upright on the rim at `phi`. */
export const uprightAt = (phi: number) => -phi * DEG

// ── the drainage run ────────────────────────────────────────────────

/** Depth of the pipe below the rim, falling gently along the run. */
export const PIPE_FROM = -54.3
export const PIPE_TO = 51.2
export function pipeRadius(phi: number): number {
  const t = (phi - PIPE_FROM) / (PIPE_TO - PIPE_FROM)
  return R - 0.78 - 0.32 * Math.min(1, Math.max(0, t))
}

/** Where the roof gutter and downpipe sit, relative to the house. */
export const HOUSE_PHI = -56.5
export const DOWNPIPE_PHI = -53.9
export const GUTTER_R = R + 1.02
export const HOUSE_Z = -1.9
export const PIPE_Z = 0.07

/**
 * The route the water takes, gutter to river, as one curve. Above ground
 * it runs along the gutter and down the downpipe at the house front;
 * below ground it follows the cut face, stepping down into each stop.
 */
export function waterRoute(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = []
  const gz = HOUSE_Z + 0.62
  // Gutter along the eaves, then down the downpipe.
  for (let phi = -58.4; phi <= DOWNPIPE_PHI; phi += 0.9) pts.push(polar(phi, GUTTER_R, gz))
  pts.push(polar(DOWNPIPE_PHI, GUTTER_R - 0.12, gz))
  for (let r = GUTTER_R - 0.35; r >= R + 0.05; r -= 0.3) pts.push(polar(DOWNPIPE_PHI, r, gz))
  pts.push(polar(DOWNPIPE_PHI, R - 0.05, gz))
  // Into the ground, out onto the cut face (the step through the soil is hidden).
  pts.push(polar(DOWNPIPE_PHI + 0.05, R - 0.32, PIPE_Z))
  pts.push(polar(DOWNPIPE_PHI + 0.4, pipeRadius(PIPE_FROM), PIPE_Z))
  // The main run under the rim.
  for (let phi = PIPE_FROM + 1.2; phi <= PIPE_TO; phi += 0.6) pts.push(polar(phi, pipeRadius(phi), PIPE_Z))
  // Out of the headwall and into the river.
  pts.push(polar(PIPE_TO + 0.9, pipeRadius(PIPE_TO) - 0.06, PIPE_Z))
  pts.push(polar(PIPE_TO + 1.8, RIVER_LEVEL - 0.25, PIPE_Z))
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.1)
}

/**
 * How far along the route (0..1) the water has reached when the camera
 * arrives at each stop. Rain has not left the roof yet; the river is the
 * end of the line.
 */
export function stopFractions(curve: THREE.Curve<THREE.Vector3>, stops: StopId[]): number[] {
  const samples = 900
  const pts = curve.getSpacedPoints(samples)
  return stops.map((id, i) => {
    if (i === 0) return 0
    if (i === stops.length - 1) return 1
    const s = STOP_SCENES[id]
    const target = polar(s.phi, pipeRadius(s.phi), PIPE_Z)
    let best = 0
    let bestD = Infinity
    pts.forEach((p, k) => {
      const d = p.distanceToSquared(target)
      if (d < bestD) {
        bestD = d
        best = k
      }
    })
    return best / samples
  })
}

// ── shapes on the face ──────────────────────────────────────────────

/** An annular sector in the x-y plane, as a flat shape. */
export function sectorShape(r0: number, r1: number, phi0: number, phi1: number, step = 0.5): THREE.Shape {
  const shape = new THREE.Shape()
  const outer: THREE.Vector2[] = []
  const inner: THREE.Vector2[] = []
  for (let phi = phi0; phi <= phi1 + 1e-6; phi += step) {
    const a = Math.min(phi, phi1) * DEG
    outer.push(new THREE.Vector2(Math.sin(a) * r1, Math.cos(a) * r1))
    inner.push(new THREE.Vector2(Math.sin(a) * r0, Math.cos(a) * r0))
  }
  shape.setFromPoints([...outer, ...inner.reverse()])
  return shape
}

/** The disc's outline: a full circle with the river notched into it. */
export function discShape(): THREE.Shape {
  const pts: THREE.Vector2[] = []
  const [a, b] = RIVER
  for (let phi = -180; phi < 180; phi += 0.75) {
    const inRiver = phi > a && phi < b
    // Sloped banks: ease the radius down over the first and last 2 degrees.
    let r = R
    if (inRiver) {
      const edge = Math.min(phi - a, b - phi)
      const k = Math.min(1, edge / 2.2)
      r = R - (R - RIVER_BED) * (k * k * (3 - 2 * k))
    }
    pts.push(new THREE.Vector2(Math.sin(phi * DEG) * r, Math.cos(phi * DEG) * r))
  }
  return new THREE.Shape(pts)
}
