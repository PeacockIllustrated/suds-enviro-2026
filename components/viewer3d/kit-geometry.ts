import * as THREE from 'three'
import type { KitOp, KitPart, KitPiece } from './viewer-model'

/**
 * Builds kit parts: real library geometry cut into slices, stacked, resized
 * and placed (see KitOp). Everything is in millimetres.
 *
 * Library geometry is shared and never changed here: every piece is copied
 * into flat arrays first. Results are cached by their recipe, so reopening
 * the preview or changing an unrelated selection reuses them; the cache
 * frees the oldest entries once it is full.
 */

/** Looks up a loaded library part by file and node name. */
export type KitSource = (url: string, part: string) => THREE.BufferGeometry | undefined

interface Soup {
  pos: Float32Array
  idx: Uint32Array
}

/** Slack when testing a vertex against a cut height, mm. */
const CUT_SLACK = 0.02

function fromGeometry(g: THREE.BufferGeometry): Soup {
  const attr = g.getAttribute('position')
  const pos = new Float32Array(attr.count * 3)
  for (let i = 0; i < attr.count; i++) {
    pos[i * 3] = attr.getX(i)
    pos[i * 3 + 1] = attr.getY(i)
    pos[i * 3 + 2] = attr.getZ(i)
  }
  let idx: Uint32Array
  if (g.index) {
    idx = new Uint32Array(g.index.count)
    for (let i = 0; i < g.index.count; i++) idx[i] = g.index.getX(i)
  } else {
    idx = new Uint32Array(attr.count)
    for (let i = 0; i < attr.count; i++) idx[i] = i
  }
  return { pos, idx }
}

/** Keep the triangles `keep` accepts, dropping vertices nothing uses. */
function filterTriangles(s: Soup, keep: (a: number, b: number, c: number) => boolean): Soup {
  const remap = new Int32Array(s.pos.length / 3).fill(-1)
  const tris: number[] = []
  let used = 0
  for (let t = 0; t < s.idx.length; t += 3) {
    const a = s.idx[t]
    const b = s.idx[t + 1]
    const c = s.idx[t + 2]
    if (!keep(a, b, c)) continue
    for (const v of [a, b, c]) {
      if (remap[v] < 0) remap[v] = used++
      tris.push(remap[v])
    }
  }
  const pos = new Float32Array(used * 3)
  remap.forEach((to, from) => {
    if (to < 0) return
    pos[to * 3] = s.pos[from * 3]
    pos[to * 3 + 1] = s.pos[from * 3 + 1]
    pos[to * 3 + 2] = s.pos[from * 3 + 2]
  })
  return { pos, idx: Uint32Array.from(tris) }
}

function sliceY(s: Soup, y0: number, y1: number): Soup {
  const inside = (v: number) => {
    const y = s.pos[v * 3 + 1]
    return y >= y0 - CUT_SLACK && y <= y1 + CUT_SLACK
  }
  return filterTriangles(s, (a, b, c) => inside(a) && inside(b) && inside(c))
}

function dropNear(s: Soup, radius: number): Soup {
  const far = (v: number) => Math.hypot(s.pos[v * 3], s.pos[v * 3 + 2]) >= radius
  return filterTriangles(s, (a, b, c) => far(a) && far(b) && far(c))
}

function stackY(s: Soup, count: number, pitch: number): Soup {
  const n = Math.max(0, Math.floor(count))
  const verts = s.pos.length / 3
  const pos = new Float32Array(s.pos.length * n)
  const idx = new Uint32Array(s.idx.length * n)
  for (let k = 0; k < n; k++) {
    const dy = k * pitch
    for (let i = 0; i < s.pos.length; i += 3) {
      const o = k * s.pos.length + i
      pos[o] = s.pos[i]
      pos[o + 1] = s.pos[i + 1] + dy
      pos[o + 2] = s.pos[i + 2]
    }
    for (let i = 0; i < s.idx.length; i++) idx[k * s.idx.length + i] = s.idx[i] + k * verts
  }
  return { pos, idx }
}

/** Piecewise-linear lookup, extended linearly past both ends. */
function curve(knots: readonly (readonly [number, number])[], r: number): number {
  if (knots.length === 0) return r
  if (knots.length === 1) return r + knots[0][1] - knots[0][0]
  let i = 0
  while (i < knots.length - 2 && r > knots[i + 1][0]) i++
  const [x0, y0] = knots[i]
  const [x1, y1] = knots[i + 1]
  const t = x1 === x0 ? 0 : (r - x0) / (x1 - x0)
  return y0 + (y1 - y0) * t
}

function radial(s: Soup, knots: readonly (readonly [number, number])[]): Soup {
  const pos = s.pos.slice()
  for (let i = 0; i < pos.length; i += 3) {
    const r = Math.hypot(pos[i], pos[i + 2])
    if (r < 1e-6) continue
    const k = Math.max(0, curve(knots, r)) / r
    pos[i] *= k
    pos[i + 2] *= k
  }
  return { pos, idx: s.idx }
}

function affine(s: Soup, m: THREE.Matrix4): Soup {
  const pos = s.pos.slice()
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.length; i += 3) {
    v.set(pos[i], pos[i + 1], pos[i + 2]).applyMatrix4(m)
    pos[i] = v.x
    pos[i + 1] = v.y
    pos[i + 2] = v.z
  }
  // A mirroring scale turns every triangle inside out; flip them back.
  if (m.determinant() < 0) {
    const idx = s.idx.slice()
    for (let t = 0; t < idx.length; t += 3) {
      const b = idx[t + 1]
      idx[t + 1] = idx[t + 2]
      idx[t + 2] = b
    }
    return { pos, idx }
  }
  return { pos, idx: s.idx }
}

function apply(s: Soup, op: KitOp): Soup {
  switch (op.op) {
    case 'sliceY':
      return sliceY(s, op.y0, op.y1)
    case 'dropNear':
      return dropNear(s, op.radius)
    case 'stackY':
      return stackY(s, op.count, op.pitch)
    case 'radial':
      return radial(s, op.knots)
    case 'scale':
      return affine(s, new THREE.Matrix4().makeScale(op.v[0], op.v[1], op.v[2]))
    case 'rotateX':
      return affine(s, new THREE.Matrix4().makeRotationX(op.angle))
    case 'rotateY':
      return affine(s, new THREE.Matrix4().makeRotationY(op.angle))
    case 'translate':
      return affine(s, new THREE.Matrix4().makeTranslation(op.v[0], op.v[1], op.v[2]))
  }
}

function concat(list: Soup[]): Soup {
  let nPos = 0
  let nIdx = 0
  list.forEach((s) => {
    nPos += s.pos.length
    nIdx += s.idx.length
  })
  const pos = new Float32Array(nPos)
  const idx = new Uint32Array(nIdx)
  let p = 0
  let i = 0
  list.forEach((s) => {
    const base = p / 3
    pos.set(s.pos, p)
    for (let k = 0; k < s.idx.length; k++) idx[i + k] = s.idx[k] + base
    p += s.pos.length
    i += s.idx.length
  })
  return { pos, idx }
}

function toGeometry(s: Soup): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(s.pos, 3))
  g.setIndex(new THREE.BufferAttribute(s.idx, 1))
  g.computeVertexNormals()
  g.computeBoundingBox()
  g.computeBoundingSphere()
  return g
}

function pieceSoup(piece: KitPiece, source: KitSource): Soup | null {
  const g = source(piece.url, piece.part)
  if (!g) return null
  return piece.ops.reduce(apply, fromGeometry(g))
}

// ── cache ───────────────────────────────────────────────────────────

const CACHE_SIZE = 48
const cache = new Map<string, THREE.BufferGeometry>()

function kitKey(part: KitPart): string {
  return JSON.stringify(part.pieces)
}

/**
 * The merged geometry for a kit part, or null when none of its library
 * parts is loaded. Cached by recipe; do not dispose the result.
 */
export function kitGeometry(part: KitPart, source: KitSource): THREE.BufferGeometry | null {
  const key = kitKey(part)
  const hit = cache.get(key)
  if (hit) {
    // Refresh its place so the least recently used entry is evicted first.
    cache.delete(key)
    cache.set(key, hit)
    return hit
  }
  const soups = part.pieces.map((p) => pieceSoup(p, source)).filter((s): s is Soup => s !== null && s.idx.length > 0)
  if (soups.length === 0) return null
  const g = toGeometry(concat(soups))
  cache.set(key, g)
  while (cache.size > CACHE_SIZE) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.get(oldest)?.dispose()
    cache.delete(oldest)
  }
  return g
}

/** Every library file a set of kit parts reads from. */
export function kitUrls(parts: KitPart[]): string[] {
  return [...new Set(parts.flatMap((p) => p.pieces.map((piece) => piece.url)))]
}
