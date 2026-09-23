import { LA, type InkWeight } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * Drawing helpers shared by the kit's buildings: walls with real window
 * reveals, framed and barred glazing with a reflection band, sills,
 * railings, louvres and paving joints. All in metres, in the Sketch's
 * current frame, with the face being drawn on looking down +z.
 */

/** [x, y, width, height] from the bottom-left, on a face. */
export type Rect = [number, number, number, number]

/** A regular grid of openings: cols x rows, each w x h, pitched px x py, from ox, oy. */
export function grid(cols: number, rows: number, w: number, h: number, px: number, py: number, ox: number, oy: number): Rect[] {
  const out: Rect[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push([ox + c * px, oy + r * py, w, h])
  return out
}

/**
 * A wall skin from x0..x1, y0..y1, its face at z and `depth` thick, with
 * rectangular openings cut right through it. The reveals are real faces,
 * so they take the shading; glaze the openings at z - depth.
 */
export function wall(s: Sketch, x0: number, x1: number, y0: number, y1: number, z: number, depth: number, openings: Rect[], opts: { fill?: string; ink?: string; outline?: boolean; weight?: InkWeight } = {}) {
  const { fill = LA.paper, ink = LA.ink, outline = true, weight = 'line' } = opts
  const xs = new Set<number>([x0, x1])
  for (const [x, , w] of openings) {
    if (x > x0 && x < x1) xs.add(x)
    if (x + w > x0 && x + w < x1) xs.add(x + w)
  }
  const cols = [...xs].sort((a, b) => a - b)
  for (let i = 0; i + 1 < cols.length; i++) {
    const xa = cols[i]
    const xb = cols[i + 1]
    const mid = (xa + xb) / 2
    const holes = openings
      .filter(([x, , w]) => mid > x && mid < x + w)
      .map(([, y, , h]) => [y, y + h] as Vec2)
      .sort((a, b) => a[0] - b[0])
    let y = y0
    for (const [ha, hb] of holes) {
      if (ha > y) s.box([xa, y, z - depth], [xb, ha, z], { fill, ink: null })
      y = Math.max(y, hb)
    }
    if (y < y1) s.box([xa, y, z - depth], [xb, y1, z], { fill, ink: null })
  }
  if (outline) s.polyline([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], ink, weight, true)
  for (const [x, y, w, h] of openings) {
    s.polyline([[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]], ink, weight, true)
    // The reveal's inner corners, where it meets the frame.
    s.line([x, y, z], [x, y, z - depth], ink, 'fine')
    s.line([x, y + h, z], [x, y + h, z - depth], ink, 'fine')
    s.line([x + w, y + h, z], [x + w, y + h, z - depth], ink, 'fine')
    s.line([x + w, y, z], [x + w, y, z - depth], ink, 'fine')
    s.polyline([[x, y, z - depth], [x + w, y, z - depth], [x + w, y + h, z - depth], [x, y + h, z - depth]], ink, 'fine', true)
  }
}

/** Clip a polygon to the half plane a*x + b*y <= c. */
function clip(poly: Vec2[], a: number, b: number, c: number): Vec2[] {
  const out: Vec2[] = []
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const dp = a * p[0] + b * p[1] - c
    const dq = a * q[0] + b * q[1] - c
    if (dp <= 0) out.push(p)
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
      const t = dp / (dp - dq)
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])
    }
  }
  return out
}

export interface GlazingOptions {
  /** Vertical and horizontal divisions (glazing bars). */
  cols?: number
  rows?: number
  /** A transom this far up from the bottom, as a fraction of the height. */
  transom?: number
  /** Frame width, drawn as a second, inset outline. */
  frame?: number
  glass?: string
  ink?: string
  /** The pale diagonal reflection band. */
  reflection?: boolean
}

/**
 * A glazed panel in the plane z: glass, frame, glazing bars and a pale
 * reflection band across it. x, y from the bottom-left.
 */
export function glazing(s: Sketch, x: number, y: number, w: number, h: number, z: number, opts: GlazingOptions = {}) {
  const { cols = 1, rows = 1, transom, frame = 0.05, glass = LA.glass, ink = LA.ink, reflection = true } = opts
  s.rect(x, y, w, h, z, { fill: glass, ink, weight: 'line', shade: false })
  if (reflection && w > 0.3 && h > 0.3) {
    // A band at 55 degrees, a third of the way across.
    const k = 0.7
    const c0 = x + w * 0.28 - k * y
    const band = Math.min(w, h) * 0.32
    let poly: Vec2[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    poly = clip(poly, 1, -k, c0 + band)
    poly = clip(poly, -1, k, -c0)
    if (poly.length > 2) s.polygon(poly.map(([px, py]) => [px, py, z + 0.002] as Vec3), { fill: '#e6f4fc', ink: null, shade: false })
    const c1 = c0 + band * 1.45
    let thin: Vec2[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    thin = clip(thin, 1, -k, c1 + band * 0.25)
    thin = clip(thin, -1, k, -c1)
    if (thin.length > 2) s.polygon(thin.map(([px, py]) => [px, py, z + 0.002] as Vec3), { fill: '#e6f4fc', ink: null, shade: false })
  }
  const zf = z + 0.004
  if (frame > 0 && w > frame * 4 && h > frame * 4) {
    s.polyline([[x + frame, y + frame, zf], [x + w - frame, y + frame, zf], [x + w - frame, y + h - frame, zf], [x + frame, y + h - frame, zf]], ink, 'fine', true)
  }
  for (let i = 1; i < cols; i++) {
    const bx = x + (w * i) / cols
    s.line([bx, y, zf], [bx, y + h, zf], ink, 'fine')
  }
  for (let j = 1; j < rows; j++) {
    const by = y + (h * j) / rows
    s.line([x, by, zf], [x + w, by, zf], ink, 'fine')
  }
  if (transom !== undefined) {
    const ty = y + h * transom
    s.line([x, ty, zf], [x + w, ty, zf], ink, 'line')
  }
}

/** A projecting sill under an opening at face z. */
export function sill(s: Sketch, x: number, y: number, w: number, z: number, opts: { fill?: string; ink?: string; project?: number; overhang?: number } = {}) {
  const { fill = LA.paper, ink = LA.ink, project = 0.08, overhang = 0.07 } = opts
  s.box([x - overhang, y - 0.07, z - 0.03], [x + w + overhang, y, z + project], { fill, ink, weight: 'fine' })
}

/** A window punched in a wall: reveal, glazing, sill. The wall is drawn separately with `wall`. */
export function punchedWindow(s: Sketch, rect: Rect, z: number, depth: number, opts: GlazingOptions & { sill?: boolean; head?: boolean } = {}) {
  const [x, y, w, h] = rect
  glazing(s, x, y, w, h, z - depth + 0.03, opts)
  if (opts.sill !== false) sill(s, x, y, w, z, { ink: opts.ink })
  if (opts.head) s.box([x - 0.12, y + h, z - 0.01], [x + w + 0.12, y + h + 0.18, z + 0.02], { ink: opts.ink, weight: 'fine' })
}

/**
 * A guard rail along a path at height `base`: posts every `pitch`, a top
 * rail and a mid rail, drawn in ink only.
 */
export function railing(s: Sketch, path: Vec2[], base: number, height = 1.1, pitch = 1.5, ink: string = LA.ink) {
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1]
    const [bx, bz] = path[i]
    const len = Math.hypot(bx - ax, bz - az)
    const n = Math.max(1, Math.round(len / pitch))
    for (let k = 0; k <= n; k++) {
      if (k === 0 && i > 1) continue
      const t = k / n
      const px = ax + (bx - ax) * t
      const pz = az + (bz - az) * t
      s.line([px, base, pz], [px, base + height, pz], ink, 'fine')
    }
    s.line([ax, base + height, az], [bx, base + height, bz], ink, 'line')
    s.line([ax, base + height * 0.5, az], [bx, base + height * 0.5, bz], ink, 'fine')
  }
}

/** Horizontal louvre lines across a rectangle in the plane z. */
export function louvres(s: Sketch, x: number, y: number, w: number, h: number, z: number, pitch = 0.15, ink: string = LA.ink) {
  for (let ly = y + pitch; ly < y + h - pitch * 0.4; ly += pitch) s.line([x, ly, z], [x + w, ly, z], ink, 'fine')
}

/** Joint lines on the ground in a grid, x0..x1 by z0..z1 at height y. */
export function joints(s: Sketch, x0: number, z0: number, x1: number, z1: number, y: number, px: number, pz: number, ink: string = LA.pavingInk) {
  for (let x = x0 + px; x < x1 - 1e-6; x += px) s.line([x, y, z0], [x, y, z1], ink, 'fine')
  for (let z = z0 + pz; z < z1 - 1e-6; z += pz) s.line([x0, y, z], [x1, y, z], ink, 'fine')
}

/** Points round an arc in the x/y plane, from angle a0 to a1 (radians). */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps: number): Vec2[] {
  const out: Vec2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps
    out.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r])
  }
  return out
}

/** A small deterministic random sequence, for scatter that does not change per render. */
export function seeded(seed: number): () => number {
  let v = seed % 2147483647
  if (v <= 0) v += 2147483646
  return () => {
    v = (v * 16807) % 2147483647
    return (v - 1) / 2147483646
  }
}
