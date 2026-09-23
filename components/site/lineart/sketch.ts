import * as THREE from 'three'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LA, type InkWeight } from './palette'

/**
 * The drawing board behind the line-art scenery kit.
 *
 * UNITS AND AXES (the whole kit): metres; +y is up and the ground is
 * y = 0; +z is the "front" of a building (the face towards the viewer);
 * +x runs along the frontage. Rotations are radians about +y. A kit
 * component's `position` is the centre of the front edge of its
 * footprint, at ground level, unless its docs say otherwise.
 *
 * A Sketch collects primitives (boxes, prisms, cylinders, polygons, ink
 * lines) and bakes them into three buffers: one fill mesh coloured per
 * vertex and one ink mesh per line weight. However much detail a building
 * carries, it draws in at most four draw calls, and several buildings can
 * share one Sketch to draw in four between them.
 *
 * Fills are flat and unlit, with a fixed illustrator's shading baked in by
 * face direction: tops are the paper colour, fronts a touch cooler, sides
 * a pale blue-grey. Ink draws every hard edge; curved surfaces get cap
 * rings plus silhouette lines worked out for the drawing's fixed view
 * direction (`view`), so a column reads as a drawn cylinder, not a prism.
 */

export type Vec2 = [number, number]
export type Vec3 = [number, number, number]

/** How a primitive is drawn. `null` leaves the fill or the ink out. */
export interface DrawStyle {
  fill?: string | null
  ink?: string | null
  weight?: InkWeight
  /** Bake the face shading into the fill (default true). */
  shade?: boolean
}

export interface Transform {
  position?: Vec3
  /** Radians about +y, or a full Euler (x, y, z). */
  rotation?: number | Vec3
  scale?: number | Vec3
}

/** The explorer's isometric-style camera: 33 degrees round from +z, 26 up. */
export const DEFAULT_VIEW: Vec3 = (() => {
  const az = THREE.MathUtils.degToRad(33)
  const el = THREE.MathUtils.degToRad(26)
  return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
})()

const WEIGHTS: InkWeight[] = ['fine', 'line', 'bold']
const TINT: Vec3 = [0.84, 0.905, 0.955]

const colourCache = new Map<string, THREE.Color>()
/** A colour in the renderer's working (linear) space. */
function srgb(hex: string): THREE.Color {
  let c = colourCache.get(hex)
  if (!c) {
    c = new THREE.Color()
    c.setStyle(hex, THREE.SRGBColorSpace)
    colourCache.set(hex, c)
  }
  return c
}
const _rgb = { r: 0, g: 0, b: 0 }

/** How much of the blue-grey shade a face takes, by its world normal. */
function shadeAmount(n: THREE.Vector3): number {
  if (n.y > 0.75) return 0
  if (n.y < -0.6) return 0.72
  // Light comes from the front and a little to the left.
  const plan = Math.hypot(n.x, n.z) || 1
  const d = (n.x * -0.42 + n.z * 0.91) / plan
  const vertical = d > 0.7 ? 0.07 : d > 0.2 ? 0.24 : d > -0.3 ? 0.46 : 0.6
  if (n.y > 0.2) return vertical * (1 - n.y) * 0.6
  return vertical
}

const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _c = new THREE.Vector3()
const _n = new THREE.Vector3()
const _e1 = new THREE.Vector3()
const _e2 = new THREE.Vector3()
const _col = new THREE.Color()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()
const _p = new THREE.Vector3()

function toMatrix(t: Transform): THREE.Matrix4 {
  const r = t.rotation ?? 0
  const e = typeof r === 'number' ? new THREE.Euler(0, r, 0) : new THREE.Euler(r[0], r[1], r[2])
  _q.setFromEuler(e)
  const sc = t.scale ?? 1
  if (typeof sc === 'number') _s.set(sc, sc, sc)
  else _s.set(sc[0], sc[1], sc[2])
  const pos = t.position ?? [0, 0, 0]
  _p.set(pos[0], pos[1], pos[2])
  return new THREE.Matrix4().compose(_p, _q, _s)
}

export interface BuiltSketch {
  /** Fill triangles with per-vertex colour; null when nothing was filled. */
  fill: THREE.BufferGeometry | null
  /** Ink segments per weight, ready for LineSegments2. */
  ink: Partial<Record<InkWeight, LineSegmentsGeometry>>
  /** World-space bounds of everything drawn. */
  box: THREE.Box3
  /** Triangle and segment counts, for budgeting. */
  stats: { triangles: number; segments: number }
}

export class Sketch {
  private fillPos: number[] = []
  private fillCol: number[] = []
  private inkPos: Record<InkWeight, number[]> = { fine: [], line: [], bold: [] }
  private inkCol: Record<InkWeight, number[]> = { fine: [], line: [], bold: [] }
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()]
  /** Unit vector from the scene towards the camera. */
  readonly view: THREE.Vector3

  constructor(options: { view?: Vec3; transform?: Transform } = {}) {
    const v = options.view ?? DEFAULT_VIEW
    this.view = new THREE.Vector3(v[0], v[1], v[2]).normalize()
    if (options.transform) this.stack[0] = toMatrix(options.transform)
  }

  /** The current local-to-world matrix. */
  get matrix(): THREE.Matrix4 {
    return this.stack[this.stack.length - 1]
  }

  /** Draw `fn` in a frame moved, turned and scaled by `t`. */
  frame(t: Transform, fn: () => void): this {
    this.stack.push(this.matrix.clone().multiply(toMatrix(t)))
    try {
      fn()
    } finally {
      this.stack.pop()
    }
    return this
  }

  // ── low level ────────────────────────────────────────────────────

  private pushTri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, fill: string, shade: boolean) {
    _e1.subVectors(b, a)
    _e2.subVectors(c, a)
    _n.crossVectors(_e1, _e2)
    if (_n.lengthSq() < 1e-14) return
    _n.normalize()
    // Shade the side the viewer sees, so one-sided panels need no winding care.
    if (_n.dot(this.view) < 0) _n.negate()
    // Shade in sRGB, where the tint amounts were judged by eye.
    srgb(fill).getRGB(_rgb, THREE.SRGBColorSpace)
    const k = shade ? shadeAmount(_n) : 0
    _col.setRGB(
      _rgb.r * (1 - k * (1 - TINT[0])),
      _rgb.g * (1 - k * (1 - TINT[1])),
      _rgb.b * (1 - k * (1 - TINT[2])),
      THREE.SRGBColorSpace,
    )
    this.fillPos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
    for (let i = 0; i < 3; i++) this.fillCol.push(_col.r, _col.g, _col.b)
  }

  /** A triangle in local coordinates. */
  tri(a: Vec3, b: Vec3, c: Vec3, fill: string, shade = true): this {
    const m = this.matrix
    this.pushTri(_a.set(...a).applyMatrix4(m), _b.set(...b).applyMatrix4(m), _c.set(...c).applyMatrix4(m), fill, shade)
    return this
  }

  /** An ink segment in local coordinates. */
  line(a: Vec3, b: Vec3, ink: string = LA.ink, weight: InkWeight = 'line'): this {
    const m = this.matrix
    _a.set(...a).applyMatrix4(m)
    _b.set(...b).applyMatrix4(m)
    this.inkPos[weight].push(_a.x, _a.y, _a.z, _b.x, _b.y, _b.z)
    _col.set(srgb(ink))
    this.inkCol[weight].push(_col.r, _col.g, _col.b, _col.r, _col.g, _col.b)
    return this
  }

  /** Ink through the points, optionally back to the first. */
  polyline(points: Vec3[], ink: string = LA.ink, weight: InkWeight = 'line', closed = false): this {
    for (let i = 1; i < points.length; i++) this.line(points[i - 1], points[i], ink, weight)
    if (closed && points.length > 2) this.line(points[points.length - 1], points[0], ink, weight)
    return this
  }

  /** Add any geometry: filled, shaded, and inked along edges sharper than `threshold` degrees. */
  geometry(geo: THREE.BufferGeometry, style: DrawStyle = {}, threshold = 25): this {
    const { fill = LA.paper, ink = LA.ink, weight = 'line', shade = true } = style
    const m = this.matrix
    if (fill) {
      const g = geo.index ? geo.toNonIndexed() : geo
      const p = g.getAttribute('position')
      for (let i = 0; i + 2 < p.count; i += 3) {
        _a.fromBufferAttribute(p, i).applyMatrix4(m)
        _b.fromBufferAttribute(p, i + 1).applyMatrix4(m)
        _c.fromBufferAttribute(p, i + 2).applyMatrix4(m)
        this.pushTri(_a, _b, _c, fill, shade)
      }
      if (g !== geo) g.dispose()
    }
    if (ink) {
      const edges = new THREE.EdgesGeometry(geo, threshold)
      const p = edges.getAttribute('position')
      _col.set(srgb(ink))
      for (let i = 0; i + 1 < p.count; i += 2) {
        _a.fromBufferAttribute(p, i).applyMatrix4(m)
        _b.fromBufferAttribute(p, i + 1).applyMatrix4(m)
        this.inkPos[weight].push(_a.x, _a.y, _a.z, _b.x, _b.y, _b.z)
        this.inkCol[weight].push(_col.r, _col.g, _col.b, _col.r, _col.g, _col.b)
      }
      edges.dispose()
    }
    geo.dispose()
    return this
  }

  // ── primitives ───────────────────────────────────────────────────

  /** An axis-aligned box between two corners (in the current frame). */
  box(from: Vec3, to: Vec3, style: DrawStyle = {}): this {
    const { fill = LA.paper, ink = LA.ink, weight = 'line', shade = true } = style
    const x0 = Math.min(from[0], to[0])
    const x1 = Math.max(from[0], to[0])
    const y0 = Math.min(from[1], to[1])
    const y1 = Math.max(from[1], to[1])
    const z0 = Math.min(from[2], to[2])
    const z1 = Math.max(from[2], to[2])
    const v: Vec3[] = [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
    ]
    if (fill) {
      const quads: [number, number, number, number][] = [
        [4, 5, 6, 7], // +z
        [1, 0, 3, 2], // -z
        [5, 1, 2, 6], // +x
        [0, 4, 7, 3], // -x
        [7, 6, 2, 3], // +y
        [0, 1, 5, 4], // -y
      ]
      for (const [a, b, c, d] of quads) {
        this.tri(v[a], v[b], v[c], fill, shade)
        this.tri(v[a], v[c], v[d], fill, shade)
      }
    }
    if (ink) {
      const edges: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ]
      for (const [a, b] of edges) this.line(v[a], v[b], ink, weight)
    }
    return this
  }

  /** A box by its centre and size. */
  block(centre: Vec3, size: Vec3, style: DrawStyle = {}): this {
    const [cx, cy, cz] = centre
    const [sx, sy, sz] = size
    return this.box([cx - sx / 2, cy - sy / 2, cz - sz / 2], [cx + sx / 2, cy + sy / 2, cz + sz / 2], style)
  }

  /**
   * A flat rectangle facing +z at depth `z`: x, y from the bottom-left,
   * w x h. For glazing, panels and markings on a face.
   */
  rect(x: number, y: number, w: number, h: number, z: number, style: DrawStyle = {}): this {
    const { fill = LA.glass, ink = LA.ink, weight = 'line', shade = true } = style
    const a: Vec3 = [x, y, z]
    const b: Vec3 = [x + w, y, z]
    const c: Vec3 = [x + w, y + h, z]
    const d: Vec3 = [x, y + h, z]
    if (fill) {
      this.tri(a, b, c, fill, shade)
      this.tri(a, c, d, fill, shade)
    }
    if (ink) this.polyline([a, b, c, d], ink, weight, true)
    return this
  }

  /** A flat rectangle lying on the ground plane at height y: x0..x1, z0..z1. */
  patch(x0: number, z0: number, x1: number, z1: number, y: number, style: DrawStyle = {}): this {
    const { fill = LA.paving, ink = LA.pavingInk, weight = 'fine', shade = false } = style
    const a: Vec3 = [x0, y, z1]
    const b: Vec3 = [x1, y, z1]
    const c: Vec3 = [x1, y, z0]
    const d: Vec3 = [x0, y, z0]
    if (fill) {
      this.tri(a, b, c, fill, shade)
      this.tri(a, c, d, fill, shade)
    }
    if (ink) this.polyline([a, b, c, d], ink, weight, true)
    return this
  }

  /** A planar polygon (convex or not), filled and outlined. */
  polygon(points: Vec3[], style: DrawStyle = {}): this {
    const { fill = LA.paper, ink = LA.ink, weight = 'line', shade = true } = style
    if (points.length < 3) return this
    if (fill) {
      // Newell normal, then a 2D basis in the polygon's plane.
      const n = new THREE.Vector3()
      for (let i = 0; i < points.length; i++) {
        const [x0, y0, z0] = points[i]
        const [x1, y1, z1] = points[(i + 1) % points.length]
        n.x += (y0 - y1) * (z0 + z1)
        n.y += (z0 - z1) * (x0 + x1)
        n.z += (x0 - x1) * (y0 + y1)
      }
      n.normalize()
      const u = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0).cross(n).normalize() : new THREE.Vector3(1, 0, 0).cross(n).normalize()
      const w = new THREE.Vector3().crossVectors(n, u)
      const flat = points.map((p) => new THREE.Vector2(p[0] * u.x + p[1] * u.y + p[2] * u.z, p[0] * w.x + p[1] * w.y + p[2] * w.z))
      for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(flat, [])) this.tri(points[a], points[b], points[c], fill, shade)
    }
    if (ink) this.polyline(points, ink, weight, true)
    return this
  }

  /**
   * A 2D profile in the local x/y plane, extruded along z from z0 to z1.
   * Roofs, awnings, canopies, car bodies, kerbs. Ink follows the profile
   * on both ends and runs along every corner sharper than `threshold`.
   */
  prism(profile: Vec2[], z0: number, z1: number, style: DrawStyle = {}, threshold = 25): this {
    const { fill = LA.paper, ink = LA.ink, weight = 'line', shade = true } = style
    const n = profile.length
    if (n < 3) return this
    const flat = profile.map(([x, y]) => new THREE.Vector2(x, y))
    const ccw = !THREE.ShapeUtils.isClockWise(flat)
    const pts = ccw ? profile : [...profile].reverse()
    const P = (i: number, z: number): Vec3 => [pts[(i + n) % n][0], pts[(i + n) % n][1], z]
    if (fill) {
      const tris = THREE.ShapeUtils.triangulateShape(pts.map(([x, y]) => new THREE.Vector2(x, y)), [])
      for (const [a, b, c] of tris) {
        this.tri(P(a, z1), P(b, z1), P(c, z1), fill, shade)
        this.tri(P(a, z0), P(c, z0), P(b, z0), fill, shade)
      }
      for (let i = 0; i < n; i++) {
        this.tri(P(i, z0), P(i + 1, z0), P(i + 1, z1), fill, shade)
        this.tri(P(i, z0), P(i + 1, z1), P(i, z1), fill, shade)
      }
    }
    if (ink) {
      const cos = Math.cos(THREE.MathUtils.degToRad(threshold))
      for (let i = 0; i < n; i++) {
        this.line(P(i, z0), P(i + 1, z0), ink, weight)
        this.line(P(i, z1), P(i + 1, z1), ink, weight)
        // Corner test: the directions in and out of vertex i.
        const [px, py] = pts[(i - 1 + n) % n]
        const [cx, cy] = pts[i]
        const [nx, ny] = pts[(i + 1) % n]
        const ax = cx - px
        const ay = cy - py
        const bx = nx - cx
        const by = ny - cy
        const d = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1)
        if (d < cos) this.line(P(i, z0), P(i, z1), ink, weight)
      }
    }
    return this
  }

  /** A plan outline, as (x, z) pairs, extruded straight up from y0 to y1. */
  extrude(plan: Vec2[], y0: number, y1: number, style: DrawStyle = {}, threshold = 25): this {
    return this.frame({ rotation: [-Math.PI / 2, 0, 0] }, () => {
      this.prism(plan.map(([x, z]) => [x, -z] as Vec2), y0, y1, style, threshold)
    })
  }

  /**
   * A cylinder or cone standing on `base` along the local axis, with cap
   * rings and silhouette lines for the drawing's view direction.
   */
  cylinder(base: Vec3, radius: number, height: number, style: DrawStyle & { axis?: 'x' | 'y' | 'z'; segments?: number; radiusTop?: number; caps?: boolean; rings?: 'both' | 'start' | 'end' } = {}): this {
    const { fill = LA.paper, ink = LA.ink, weight = 'line', shade = true, axis = 'y', segments = 16, radiusTop = radius, caps = true, rings = 'both' } = style
    const geo = new THREE.CylinderGeometry(radiusTop, radius, height, segments, 1, !caps)
    geo.translate(0, height / 2, 0)
    if (axis === 'x') geo.rotateZ(-Math.PI / 2)
    if (axis === 'z') geo.rotateX(Math.PI / 2)
    geo.translate(base[0], base[1], base[2])
    const m = this.matrix
    if (fill) this.geometry(geo.clone(), { fill, ink: null, shade })
    if (ink) {
      // Cap rings, as many sides as the fill. The ring at the far end has
      // its back half hidden by the body, so only its near half is drawn.
      const inv = new THREE.Matrix4().copy(m).invert()
      const viewLocal = this.view.clone().transformDirection(inv)
      const ring = (r: number, h: number, nearOnly: boolean) => {
        const n = Math.max(8, segments)
        const at = (i: number): Vec3 => {
          const t = (i / n) * Math.PI * 2
          const c = Math.cos(t) * r
          const sn = Math.sin(t) * r
          return axis === 'y' ? [base[0] + c, base[1] + h, base[2] + sn] : axis === 'x' ? [base[0] + h, base[1] + c, base[2] + sn] : [base[0] + c, base[1] + sn, base[2] + h]
        }
        for (let i = 0; i < n; i++) {
          const a = at(i)
          const b = at(i + 1)
          if (nearOnly) {
            const mx = (a[0] + b[0]) / 2 - base[0]
            const my = (a[1] + b[1]) / 2 - base[1]
            const mz = (a[2] + b[2]) / 2 - base[2]
            const rx = axis === 'x' ? 0 : mx
            const ry = axis === 'y' ? 0 : my
            const rz = axis === 'z' ? 0 : mz
            if (rx * viewLocal.x + ry * viewLocal.y + rz * viewLocal.z < -0.02 * r) continue
          }
          this.line(a, b, ink, weight)
        }
      }
      const axisView = axis === 'x' ? viewLocal.x : axis === 'y' ? viewLocal.y : viewLocal.z
      if (rings !== 'end') ring(radius, 0, axisView > 0)
      if (rings !== 'start') ring(radiusTop, height, axisView < 0)
      // Silhouettes: offset across the axis, square to the view.
      const dir = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0)
      const worldDir = dir.clone().transformDirection(m)
      const side = new THREE.Vector3().crossVectors(worldDir, this.view)
      if (side.lengthSq() > 1e-6) {
        side.normalize()
        // Back into the local frame (rotation only; the kit does not skew).
        const localSide = side.clone().transformDirection(inv)
        for (const sgn of [-1, 1]) {
          const a: Vec3 = [base[0] + localSide.x * radius * sgn, base[1] + localSide.y * radius * sgn, base[2] + localSide.z * radius * sgn]
          const b: Vec3 = [
            base[0] + dir.x * height + localSide.x * radiusTop * sgn,
            base[1] + dir.y * height + localSide.y * radiusTop * sgn,
            base[2] + dir.z * height + localSide.z * radiusTop * sgn,
          ]
          this.line(a, b, ink, weight)
        }
      }
    }
    geo.dispose()
    return this
  }

  /** A flat disc facing the viewer: heads, lamp globes, round shrubs. */
  disc(centre: Vec3, radius: number, style: DrawStyle = {}, segments = 18): this {
    const inv = new THREE.Matrix4().copy(this.matrix).invert()
    const n = this.view.clone().transformDirection(inv)
    const u = new THREE.Vector3(0, 1, 0).cross(n)
    if (u.lengthSq() < 1e-6) u.set(1, 0, 0)
    u.normalize()
    const w = new THREE.Vector3().crossVectors(n, u)
    const pts: Vec3[] = []
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2
      pts.push([
        centre[0] + (u.x * Math.cos(t) + w.x * Math.sin(t)) * radius,
        centre[1] + (u.y * Math.cos(t) + w.y * Math.sin(t)) * radius,
        centre[2] + (u.z * Math.cos(t) + w.z * Math.sin(t)) * radius,
      ])
    }
    return this.polygon(pts, { shade: false, ...style })
  }

  /**
   * A flat cut-out standing upright at `origin` and turned square to the
   * viewer: (a, b) points are across and up, in metres. People, signs.
   */
  billboard(origin: Vec3, points: Vec2[], style: DrawStyle = {}, layer = 0): this {
    const inv = new THREE.Matrix4().copy(this.matrix).invert()
    const n = this.view.clone().transformDirection(inv)
    const up = new THREE.Vector3(0, 1, 0)
    const u = new THREE.Vector3().crossVectors(up, n)
    if (u.lengthSq() < 1e-6) u.set(1, 0, 0)
    u.normalize()
    // Layers stack towards the viewer so overlapping pieces never fight.
    const lx = n.x * layer * 0.01
    const lz = n.z * layer * 0.01
    const pts = points.map(([a, b]) => [origin[0] + u.x * a + lx, origin[1] + b, origin[2] + u.z * a + lz] as Vec3)
    return this.polygon(pts, { shade: false, ...style })
  }

  // ── output ───────────────────────────────────────────────────────

  build(): BuiltSketch {
    const box = new THREE.Box3()
    let fill: THREE.BufferGeometry | null = null
    if (this.fillPos.length) {
      fill = new THREE.BufferGeometry()
      fill.setAttribute('position', new THREE.Float32BufferAttribute(this.fillPos, 3))
      fill.setAttribute('color', new THREE.Float32BufferAttribute(this.fillCol, 3))
      fill.computeBoundingBox()
      fill.computeBoundingSphere()
      if (fill.boundingBox) box.union(fill.boundingBox)
    }
    const ink: Partial<Record<InkWeight, LineSegmentsGeometry>> = {}
    let segments = 0
    for (const w of WEIGHTS) {
      const pos = this.inkPos[w]
      if (!pos.length) continue
      const g = new LineSegmentsGeometry()
      g.setPositions(pos)
      g.setColors(this.inkCol[w])
      ink[w] = g
      segments += pos.length / 6
      for (let i = 0; i < pos.length; i += 3) box.expandByPoint(_a.set(pos[i], pos[i + 1], pos[i + 2]))
    }
    return { fill, ink, box, stats: { triangles: this.fillPos.length / 9, segments } }
  }
}
