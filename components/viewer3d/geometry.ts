import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Small geometry kit for the configurator's procedural models.
 *
 * Everything is in millimetres, Y up, with the product's base at y = 0,
 * matching the 3D library's conventions so procedural and library parts can
 * share one scene. Solids of revolution are built from a (radius, height)
 * profile traversed anticlockwise (outer wall up, top inwards, inner wall
 * down, bottom outwards) so every face points out of the solid.
 */

/** A profile point: [radius, height]. */
export type P2 = readonly [number, number]
export type Vec3 = readonly [number, number, number]

const SEGMENTS = 56

const Y_AXIS = new THREE.Vector3(0, 1, 0)

/**
 * Revolve a profile about Y. Each pair of points becomes its own strip so
 * corners stay crisp under the toon ramp; pass several runs to keep a curve
 * (a dome, a torus) smooth within the run.
 */
export function revolve(runs: P2[][], segments = SEGMENTS): THREE.BufferGeometry {
  const pieces: THREE.BufferGeometry[] = []
  runs.forEach((run) => {
    if (run.length > 2) {
      pieces.push(new THREE.LatheGeometry(run.map(([r, y]) => new THREE.Vector2(r, y)), segments))
      return
    }
    const [a, b] = run
    if (a[0] === b[0] && a[1] === b[1]) return
    pieces.push(new THREE.LatheGeometry([new THREE.Vector2(a[0], a[1]), new THREE.Vector2(b[0], b[1])], segments))
  })
  return merge(pieces)
}

/** Split a polyline profile into hard-edged two-point runs. */
export function edges(profile: P2[]): P2[][] {
  const out: P2[][] = []
  for (let i = 0; i < profile.length - 1; i++) out.push([profile[i], profile[i + 1]])
  return out
}

/** Solid cylinder from y0 to y1. */
export function cylinder(r: number, y0: number, y1: number, segments = SEGMENTS): THREE.BufferGeometry {
  return revolve(edges([[0, y0], [r, y0], [r, y1], [0, y1]]), segments)
}

/** Thick-walled tube from y0 to y1. */
export function tube(ro: number, ri: number, y0: number, y1: number, segments = SEGMENTS): THREE.BufferGeometry {
  return revolve(edges([[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]]), segments)
}

/** Box centred on (cx, cy, cz). */
export function box(w: number, h: number, d: number, cx = 0, cy = 0, cz = 0): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(cx, cy, cz)
  return g
}

/**
 * A rectangular ring (a drawpit section): outer length x width, wall
 * thickness t, from y0 to y1. Length runs along X, width along Z.
 */
export function rectRing(length: number, width: number, t: number, y0: number, y1: number): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(-length / 2, -width / 2)
  shape.lineTo(length / 2, -width / 2)
  shape.lineTo(length / 2, width / 2)
  shape.lineTo(-length / 2, width / 2)
  shape.closePath()
  const hole = new THREE.Path()
  hole.moveTo(-length / 2 + t, -width / 2 + t)
  hole.lineTo(-length / 2 + t, width / 2 - t)
  hole.lineTo(length / 2 - t, width / 2 - t)
  hole.lineTo(length / 2 - t, -width / 2 + t)
  hole.closePath()
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false })
  // Extrusion runs along +Z; stand it up so it runs along +Y.
  g.rotateX(-Math.PI / 2)
  g.translate(0, y0, 0)
  return g
}

/** Point a geometry built along +Y from the origin along `dir`, starting at `start`. */
export function orient(g: THREE.BufferGeometry, dir: THREE.Vector3, start: THREE.Vector3): THREE.BufferGeometry {
  const q = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir.clone().normalize())
  g.applyQuaternion(q)
  g.translate(start.x, start.y, start.z)
  return g
}

/**
 * A pipe stub: a tube of outside diameter `od` and bore `bore`, `length`
 * long, from `start` along `dir`, with a socket collar where it leaves the
 * chamber wall (`collarAt` mm from the start).
 */
export function pipe(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  od: number,
  bore: number,
  collarAt?: number,
): THREE.BufferGeometry {
  const parts = [tube(od / 2, bore / 2, 0, length, 40)]
  if (collarAt !== undefined) {
    const collar = Math.max(70, od * 0.35)
    parts.push(tube(od / 2 + Math.max(12, od * 0.07), od / 2 - 1, collarAt, collarAt + collar, 40))
  }
  return orient(merge(parts), dir, start)
}

/**
 * A twinwall pipe: a smooth bore inside a corrugated outer wall, `length`
 * long from `start` along `dir`. Corrugations run at a pitch set from the
 * outside diameter, so a 225 pipe reads like the library's 225 stubs.
 */
export function twinwallPipe(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  od: number,
  bore: number,
): THREE.BufferGeometry {
  const ro = od / 2
  const rv = ro - Math.max(4, od * 0.05)
  const ri = bore / 2
  const pitch = Math.max(24, od * 0.15)
  // The corrugations are one smooth run (rounded crests, as moulded) so the
  // ink outline follows the silhouette instead of ruling every rib.
  const wave: P2[] = []
  const steps = 10
  const ribs = Math.max(1, Math.floor((length - pitch * 0.4) / pitch))
  const y0 = (length - ribs * pitch) / 2
  wave.push([rv, 0])
  for (let k = 0; k < ribs; k++) {
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      wave.push([rv + (ro - rv) * (0.5 - 0.5 * Math.cos(t * Math.PI * 2)), y0 + (k + t) * pitch])
    }
  }
  wave.push([rv, y0 + ribs * pitch], [rv, length])
  const runs: P2[][] = [[[ri, 0], [rv, 0]], wave, [[rv, length], [ri, length]], [[ri, length], [ri, 0]]]
  return orient(revolve(runs, 36), dir, start)
}

/** A concentric reducer: outside radius r0 at the start to r1 at the far end. */
export function reducer(start: THREE.Vector3, dir: THREE.Vector3, length: number, r0: number, r1: number): THREE.BufferGeometry {
  const t = 8
  const lip = Math.min(40, length * 0.3)
  const profile: P2[] = [
    [r0 - t, 0],
    [r0, 0],
    [r0, lip],
    [r1, length - lip],
    [r1, length],
    [r1 - t, length],
    [r1 - t, length - lip],
    [r0 - t, lip],
    [r0 - t, 0],
  ]
  return orient(revolve(edges(profile), 36), dir, start)
}

/** A blanking cap over a socket mouth: a shallow closed cup, `depth` long. */
export function blankingCap(start: THREE.Vector3, dir: THREE.Vector3, r: number, depth: number): THREE.BufferGeometry {
  const profile: P2[] = [[r - 6, 0], [r, 0], [r, depth], [0, depth]]
  return orient(revolve(edges(profile), 36), dir, start)
}

/**
 * A water core for a pipe: a slim cylinder lying on the invert, with its
 * UVs turned so the water shader's streaks run along the pipe. `inwards`
 * reverses the flow so inlet water runs towards the chamber.
 */
export function pipeWater(
  start: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  bore: number,
  inwards: boolean,
): THREE.BufferGeometry {
  const r = bore * 0.3
  const g = new THREE.CylinderGeometry(r, r, length, 20, 1)
  g.translate(0, length / 2, 0)
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    // The shader's streaks travel towards larger uv.x; v is 0 at the wall.
    uv.setXY(i, inwards ? 1 - v : v, u)
  }
  orient(g, dir, start)
  // Settle the core onto the invert so it reads as flow, not a full bore.
  g.translate(0, -(bore / 2 - r - bore * 0.06), 0)
  return g
}

/** Still water filling a round chamber from y0 to y1. */
export function roundWater(r: number, y0: number, y1: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, SEGMENTS, 1)
  g.translate(0, (y0 + y1) / 2, 0)
  return g
}

/**
 * Horizontal tank shell along X: a cylinder of radius r and barrel length
 * `length` with shallow domed ends `dome` deep, its underside at y = base.
 */
export function horizontalTank(r: number, length: number, dome: number, base: number): THREE.BufferGeometry {
  const half = length / 2
  const steps = 8
  const endA: P2[] = []
  const endB: P2[] = []
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2)
    endA.push([Math.sin(a) * r, -half - Math.cos(a) * dome])
    endB.push([Math.cos(a) * r, half + Math.sin(a) * dome])
  }
  const g = revolve([endA, [[r, -half], [r, half]], endB])
  g.rotateZ(-Math.PI / 2)
  g.translate(0, base + r, 0)
  return g
}

/** Rib bands round a horizontal tank at the given X positions. */
export function tankRibs(r: number, xs: number[], base: number, width = 60, proud = 22): THREE.BufferGeometry {
  const ribs = xs.map((x) => {
    const g = tube(r + proud, r - 4, x - width / 2, x + width / 2)
    g.rotateZ(-Math.PI / 2)
    g.translate(0, base + r, 0)
    return g
  })
  return merge(ribs)
}

/** Unit direction for a clock hour, 12 = north (-Z), 3 = east (+X). */
export function clockDir(hour: number): THREE.Vector3 {
  const a = (hour / 12) * Math.PI * 2
  return new THREE.Vector3(Math.sin(a), 0, -Math.cos(a))
}

/**
 * Merge geometries into one, normalising attributes to position, normal
 * and uv (indexed only if every input is). Inputs are disposed.
 */
export function merge(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (list.length === 1) return list[0]
  const indexed = list.every((g) => g.index !== null)
  const prepared = list.map((g) => {
    const out = indexed || g.index === null ? g : g.toNonIndexed()
    Object.keys(out.attributes).forEach((name) => {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') out.deleteAttribute(name)
    })
    if (!out.getAttribute('normal')) out.computeVertexNormals()
    if (!out.getAttribute('uv')) {
      out.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(out.getAttribute('position').count * 2), 2))
    }
    return out
  })
  const merged = mergeGeometries(prepared, false)
  if (!merged) throw new Error('Could not merge viewer geometry')
  list.forEach((g) => g.dispose())
  prepared.forEach((g) => g.dispose())
  return merged
}
