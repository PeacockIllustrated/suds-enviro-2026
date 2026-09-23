import * as THREE from 'three'
import type { PipeSize } from '@/lib/types'
import { PIPE_DIMS, type PipeDims } from '@/lib/pipe-dims'
import {
  blankingCap,
  box,
  clockDir,
  cylinder,
  merge,
  orient,
  pipe,
  pipeWater,
  reducer,
  roundWater,
  tube,
  twinwallPipe,
  type Vec3,
} from './geometry'
import type { Callout, KitOp, KitPart, KitPiece, LegendEntry, MatchKind, ProcPart } from './viewer-model'

/**
 * Round chambers assembled from the manufacturer's own part files, as a
 * kit of parts:
 *
 *   base    the SERCIC600 5-inlet moulded base (sockets at 3, 5, 6, 7, 9
 *           and 12 o'clock) for chambers up to 750 mm, the SEB1050 benched
 *           base from 900 mm, or a flat sump floor where the product has a
 *           sump (catchpits, flow control chambers)
 *   shaft   the corrugated chamber body, cut into whole corrugations and
 *           stacked to the depth, so the ribs keep their true 65 mm pitch
 *   cap     the SERSIC600 cap, with a cover and frame drawn in its opening
 *   pipes   true outside diameters, twinwall drawn corrugated and EN 1401
 *           smooth, joined to the sockets with the library's 225 twinwall
 *           adapter and stub where that is the fitting, otherwise a drawn
 *           reducer. Unused sockets are capped.
 *
 * Library parts are modelled at 600 mm. Other diameters widen the shaft and
 * cap radially (wall and rib depth unchanged) and scale the base, and the
 * viewer says so. All numbers below were measured from the files in
 * public/models/library/v1 (millimetres, Y up, base at y = 0).
 */

const LIB = '/models/library/v1'

const FILE = {
  body: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--body.glb`,
  base5: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--base.glb`,
  stub: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--inlet.glb`,
  cap: `${LIB}/rhino-inspection-chamber/parts/rhino-inspection-chamber-sersic600--lid.glb`,
  seb: `${LIB}/rhino-inspection-chamber-base/parts/rhino-inspection-chamber-base-seb1050--base.glb`,
  adapter: `${LIB}/adapter-225-twinwall-en150/adapter-225-twinwall-en150.glb`,
} as const

/**
 * The corrugated body (SERCIC600): bore 302.2 mm radius at the valleys,
 * 348.2 at the crests. Vertex rings at 57.661 and 122.637 bound one whole
 * corrugation, so a slice between them stacks without gaps; the last
 * valley ring is at 1552.622 and the plain end at 1556.327.
 */
const BODY = {
  bore: 302.2,
  outer: 348.2,
  foot: 57.661,
  unitTop: 122.637,
  headFrom: 1552.622,
  headTo: 1556.327,
} as const
const PITCH = BODY.unitTop - BODY.foot
/** Nominal diameter the library parts were modelled at. */
const KIT_DIAMETER = 600

/**
 * The SERSIC600 cap: a dished ring with a 319 mm opening. Its flange
 * (r 296.8 to 327.4) seats on the top of the shaft at y 758.1; a small
 * marker at the centre of the file is left out.
 */
const CAP = { seat: 758.1, top: 761.1, bottom: 711.1, opening: 159.7, dish: 296.8, flange: 327.4 } as const

/**
 * The 5-inlet moulded base. In the file its underside is at y 248.874 and
 * the outlet faces +Z; it is turned half a turn so the outlet faces north
 * (12 o'clock, -Z). Socket centres are heights above the underside, mouths
 * are the socket ends' distance from the axis. The 12 and 6 o'clock sockets
 * sit on the main channel (the 6 slightly higher, for the fall), 3 and 9
 * are higher side entries, and the two smaller sockets either side of 6 are
 * moulded at 45 degrees off the 6 o'clock line.
 */
const BASE5 = { underside: 248.874, top: 553.852 - 248.874 } as const
interface Socket {
  bearing: number
  centre: number
  radius: number
  mouth: number
  /** Outside diameter of pipe the socket takes, mm. */
  nominal: number
}
const SOCKETS: Record<number, Socket> = {
  12: { bearing: 0, centre: 102.3, radius: 91.9, mouth: 303, nominal: 160 },
  6: { bearing: 180, centre: 117.6, radius: 91.8, mouth: 303, nominal: 160 },
  3: { bearing: 90, centre: 196.7, radius: 91.8, mouth: 301, nominal: 160 },
  9: { bearing: 270, centre: 196.7, radius: 91.8, mouth: 301, nominal: 160 },
  5: { bearing: 135, centre: 170.5, radius: 60.5, mouth: 303, nominal: 110 },
  7: { bearing: 225, centre: 170.5, radius: 60.5, mouth: 303, nominal: 110 },
}

/**
 * The SEB1050 benched base: 536 mm radius, 380 mm high, a 600 mm channel
 * through from 6 to 12 o'clock and side channels at 3 and 9. Turned half a
 * turn like the 5-inlet base. Channel inverts at the wall by bearing.
 */
const SEB = { radius: 536, height: 380 } as const
const SEB_INVERT: Record<number, number> = { 0: 27.9, 180: 37.9, 90: 78, 270: 78 }

/**
 * The 225 twinwall to 150 adapter: axis along Z, twinwall end (265 mm
 * across, centre y 132.45) from z -195 to 0, 150 spigot (173 mm across,
 * centre y 94.95) from 0 to 182.
 */
const ADAPTER = { spigotY: 94.95, twinY: 132.45, spigotTip: 182, twinEnd: 195 } as const
/**
 * The 225 twinwall stub: a smooth coupler (276 mm across) from z -177 to 0
 * and twinwall from 0 to 172, on an axis at y 360.2.
 */
const STUB = { axisY: 360.2, coupler: 177, twin: 172 } as const

const PIPE = PIPE_DIMS
const ADAPTER_SIZE: PipeSize = '225mm Twinwall'
const isTwinwall = (s: PipeSize) => s.includes('Twinwall')
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const fmt = (n: number) => Math.round(n).toLocaleString('en-GB')
const v3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z]
const scaled = (v: THREE.Vector3, s: number): Vec3 => [v.x * s, v.y * s, v.z * s]
const rad = (deg: number) => (deg * Math.PI) / 180

// ── options and result ──────────────────────────────────────────────

export interface KitInlet {
  n: number
  hour: number
  size: PipeSize
  /** Replaces "Inlet n" in the callout, e.g. for an indicative inlet. */
  title?: string
}

export interface KitChamberOptions {
  /** Nominal (internal) diameter, mm. */
  diameter: number
  /** Cover level down to the outlet soffit, mm. */
  depthToSoffit: number
  /**
   * moulded  a channelled moulded base (the inspection chamber)
   * sump     a flat floor with the outlet invert `sump` mm above it
   */
  base: { kind: 'moulded' } | { kind: 'sump'; sump: number }
  outlet: PipeSize
  /** Replaces the whole outlet callout detail. */
  outletDetail?: string
  /** Replaces the size in the outlet callout detail, e.g. "(locked)". */
  outletLabel?: string
  inlets: KitInlet[]
  top: 'cover' | 'hinged-grate' | 'sealed-grate'
  /** Water surface height; undefined = just above the outlet invert, null = dry. */
  waterTop?: number | null
  /** Show the depth (and sump) dimension callouts. */
  dimensions: boolean
}

export interface KitChamber {
  parts: ProcPart[]
  kit: KitPart[]
  callouts: Callout[]
  legend: LegendEntry[]
  match: { kind: MatchKind; text: string; note?: string }
  Ro: number
  Ri: number
  floorTop: number
  outletInvert: number
  outletCentre: number
  waterTop: number
  bodyTop: number
  coverTop: number
  explode: number
  riserLift: number
}

// ── pieces ──────────────────────────────────────────────────────────

/** Shift every radius by `delta`: a wider or narrower shell, same wall. */
const widen = (delta: number): KitOp => ({ op: 'radial', knots: [[0, delta], [1000, 1000 + delta]] })

/**
 * The shaft from y 0 to the top of `count` whole corrugations above the
 * foot, widened by `delta`. Returns the pieces and the height reached.
 */
function shaftPieces(count: number, delta: number): { pieces: KitPiece[]; top: number } {
  const w = widen(delta)
  const headAt = BODY.foot + count * PITCH
  return {
    pieces: [
      { url: FILE.body, part: 'body', ops: [{ op: 'sliceY', y0: 0, y1: BODY.foot }, w] },
      {
        url: FILE.body,
        part: 'body',
        ops: [{ op: 'sliceY', y0: BODY.foot, y1: BODY.unitTop }, { op: 'stackY', count, pitch: PITCH }, w],
      },
      {
        url: FILE.body,
        part: 'body',
        ops: [{ op: 'sliceY', y0: BODY.headFrom, y1: BODY.headTo }, { op: 'translate', v: [0, headAt - BODY.headFrom, 0] }, w],
      },
    ],
    top: headAt + (BODY.headTo - BODY.headFrom),
  }
}

function capPiece(bodyTop: number, delta: number): KitPiece {
  return {
    url: FILE.cap,
    part: 'lid',
    ops: [
      { op: 'dropNear', radius: 40 },
      // Keep the opening, move the dish and flange out with the shaft.
      { op: 'radial', knots: [[CAP.opening, CAP.opening], [CAP.dish, CAP.dish + delta], [CAP.flange, CAP.flange + delta]] },
      { op: 'translate', v: [0, bodyTop - CAP.seat, 0] },
    ],
  }
}

/** Place a piece whose axis runs along +Z (at height `axisY`) along a bearing. */
function alongBearing(axisY: number, bearing: number, outwards: boolean, startR: number, y: number, nearEndZ: number): KitOp[] {
  const a = rad(bearing)
  const out = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a))
  // Native +Z turns to the inward direction (theta = -a) or outward (pi - a).
  const turn = outwards ? Math.PI - a : -a
  // After turning, native z = nearEndZ must land `startR` from the axis.
  const along = outwards ? startR - nearEndZ : startR + nearEndZ
  const at = out.multiplyScalar(along)
  return [
    { op: 'translate', v: [0, -axisY, 0] },
    { op: 'rotateY', angle: turn },
    { op: 'translate', v: [at.x, y, at.z] },
  ]
}

function coverGeometry(top: 'cover' | 'hinged-grate' | 'sealed-grate', opening: number, coverTop: number): THREE.BufferGeometry {
  const r = opening - 8
  if (top === 'cover') {
    const parts = [cylinder(r, coverTop - 45, coverTop - 6)]
    // Raised grip bars, as cast into ductile iron covers.
    ;[-0.45, 0, 0.45].forEach((f) => parts.push(box(r * 1.3 * Math.sqrt(1 - f * f), 8, 28, 0, coverTop - 2, f * r)))
    return merge(parts)
  }
  const inner = r - 30
  const parts = [tube(r, inner, coverTop - 45, coverTop - 6)]
  for (let z = -inner + 40; z < inner - 26; z += 58) {
    const chord = 2 * Math.sqrt(Math.max(0, inner * inner - z * z)) + 6
    parts.push(box(chord, 34, 20, 0, coverTop - 25, z))
  }
  if (top === 'hinged-grate') {
    ;[-0.4, 0.4].forEach((f) => parts.push(box(60, 30, 30, f * r, coverTop - 16, -(r + 4))))
  } else {
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2
      const bolt = cylinder(10, coverTop - 6, coverTop + 2, 16)
      bolt.translate(Math.sin(a) * (r - 15), 0, Math.cos(a) * (r - 15))
      parts.push(bolt)
    }
  }
  return merge(parts)
}

function wallCollar(from: THREE.Vector3, dir: THREE.Vector3, at: number, od: number): THREE.BufferGeometry {
  const collar = Math.max(70, od * 0.35)
  return orient(tube(od / 2 + Math.max(12, od * 0.07), od / 2 - 1, at, at + collar, 40), dir, from)
}

function notes(list: (string | null)[]): string | undefined {
  const out = list.filter((s): s is string => !!s)
  return out.length ? out.join(' ') : undefined
}

function benchNote(hours: number[]): string | null {
  if (hours.length === 0) return null
  const list = [...new Set(hours)].sort((a, b) => a - b).join(' and ')
  return `No base channel at ${list} o'clock: shown entering over the benching.`
}

// ── the chamber ─────────────────────────────────────────────────────

interface Run {
  id: string
  label: string
  role: 'inlet' | 'outlet'
  bearing: number
  hour: number
  size: PipeSize
  /** Axis height where the run leaves the chamber. */
  centre: number
  title: string
  priority: number
}

export function kitChamber(o: KitChamberOptions): KitChamber {
  const D = o.diameter
  const exactSize = Math.abs(D - KIT_DIAMETER) < 1
  const Ri = D / 2
  const delta = Ri - BODY.bore
  const Ro = BODY.outer + delta
  const E = clamp(D * 0.55, 350, 650)
  const riserLift = E * 0.9
  const out = PIPE[o.outlet]

  const moulded = o.base.kind === 'moulded'
  const useSeb = moulded && D >= 900
  const baseScale = useSeb ? Ri / SEB.radius : Ri / BODY.bore
  const baseExact = Math.abs(baseScale - 1) < 0.03

  const parts: ProcPart[] = []
  const kit: KitPart[] = []
  const callouts: Callout[] = []
  const legend: LegendEntry[] = []

  // ── base and pipe heights
  let floorTop: number
  let outletCentre: number
  const socketFor = (hour: number): Socket | undefined => (moulded && !useSeb ? SOCKETS[hour] : undefined)

  if (moulded && !useSeb) {
    floorTop = 0
    const sk = SOCKETS[12]
    outletCentre = sk.centre * baseScale
    kit.push({
      id: 'base',
      label: 'Moulded 5-inlet base',
      role: 'body',
      pieces: [
        {
          url: FILE.base5,
          part: 'base',
          ops: [
            { op: 'translate', v: [0, -BASE5.underside, 0] },
            { op: 'rotateY', angle: Math.PI },
            { op: 'scale', v: [baseScale, baseScale, baseScale] },
          ],
        },
      ],
      explode: [0, 0, 0],
    })
    legend.push({
      kind: baseExact ? 'library' : 'scaled',
      text: baseExact ? 'SERCIC600 5-inlet base' : `SERCIC600 5-inlet base, scaled ${Math.round(baseScale * 100)}%`,
    })
  } else if (useSeb) {
    floorTop = 0
    outletCentre = SEB_INVERT[0] * baseScale + out.bore / 2
    kit.push({
      id: 'base',
      label: 'Moulded benched base',
      role: 'body',
      pieces: [
        {
          url: FILE.seb,
          part: 'base',
          ops: [
            { op: 'rotateY', angle: Math.PI },
            { op: 'scale', v: [baseScale, 1, baseScale] },
          ],
        },
      ],
      explode: [0, 0, 0],
    })
    legend.push({
      kind: baseExact ? 'library' : 'scaled',
      text: baseExact ? 'SEB1050 benched base' : `SEB1050 benched base, widened ${Math.round(baseScale * 100)}%`,
    })
  } else {
    floorTop = 40
    const sump = o.base.kind === 'sump' ? o.base.sump : 350
    outletCentre = floorTop + sump + out.bore / 2
    parts.push({
      id: 'floor',
      label: 'Sump base',
      role: 'casing',
      geometry: cylinder(Ri + 6, 0, floorTop, 56),
      explode: [0, 0, 0],
    })
  }
  const outletInvert = outletCentre - out.bore / 2

  // Where each pipe leaves the chamber. The outlet takes the 12 o'clock
  // socket; inlets take theirs, or (through the wall) sit soffit-level with
  // the outlet so a smaller inlet never drops below it.
  const outletSoffit = outletCentre + out.bore / 2
  const inletCentre = (hour: number, p: PipeDims): number => {
    const sk = socketFor(hour)
    if (sk) return sk.centre * baseScale
    if (useSeb) {
      const bearing = (hour % 12) * 30
      const invert = SEB_INVERT[bearing]
      // Positions with no channel come in over the benching.
      return (invert !== undefined ? invert : SEB.height) * baseScale + p.bore / 2
    }
    return outletSoffit - p.bore / 2
  }

  const runs: Run[] = [
    {
      id: 'outlet',
      label: 'Outlet',
      role: 'outlet',
      bearing: 0,
      hour: 12,
      size: o.outlet,
      centre: outletCentre,
      title: "Outlet · 12 o'clock",
      priority: 10,
    },
    ...o.inlets.map((inlet): Run => {
      const p = PIPE[inlet.size]
      const title = inlet.title ?? `Inlet ${inlet.n}`
      return {
        id: `inlet-${inlet.n}`,
        label: title,
        role: 'inlet',
        // A socket's own bearing: the small sockets either side of 6 are
        // moulded at 45 degrees off it, not at the 5 and 7 clock marks.
        bearing: socketFor(inlet.hour)?.bearing ?? (inlet.hour % 12) * 30,
        hour: inlet.hour,
        size: inlet.size,
        centre: inletCentre(inlet.hour, p),
        title: `${title} · ${inlet.hour} o'clock`,
        priority: 9,
      }
    }),
  ]

  // ── pipes
  const run = clamp(D * 0.5, 320, 600)
  const rEnd = Ro + run
  let adapters = 0
  let stubs = 0
  let reducers = 0
  let highestPipe = 0
  // Axis height of the outlet pipe outside the chamber, which the depth is
  // measured to (the library adapter lifts it a little off the socket axis).
  let outletY = outletCentre

  const addWater = (id: string, start: THREE.Vector3, dir: THREE.Vector3, length: number, bore: number, role: 'inlet' | 'outlet', explode: Vec3) => {
    parts.push({
      id: `${id}-water`,
      label: 'Water',
      role: 'water',
      water: 'flow',
      geometry: pipeWater(start, dir, length * 0.995, bore, role === 'inlet'),
      explode,
      labelled: false,
    })
  }

  const stubPart = (r: Run, startR: number, y: number, dir: THREE.Vector3): KitPart => ({
    id: `${r.id}-stub`,
    label: '225 twinwall stub',
    role: r.role,
    pieces: [{ url: FILE.stub, part: 'inlet', ops: alongBearing(STUB.axisY, r.bearing, true, startR, y, -STUB.coupler) }],
    explode: scaled(dir, E * 0.8),
    labelled: false,
  })

  runs.forEach((r) => {
    const p = PIPE[r.size]
    const dir = clockDir(r.bearing / 30)
    const explode = scaled(dir, E)
    const tw = isTwinwall(r.size)
    const sk = socketFor(r.hour)
    // Axis height of the pipe run outside the chamber, and where it starts.
    let y = r.centre
    let start: number
    let runEnd = rEnd

    if (sk) {
      const mouth = sk.mouth * baseScale
      const nominal = sk.nominal * baseScale
      if (r.size === ADAPTER_SIZE && baseExact && sk.nominal === 160) {
        // The library fitting: adapter spigot into the socket, then the
        // twinwall stub's coupler over the adapter's twinwall end.
        const tip = mouth - 60
        kit.push({
          id: `${r.id}-adapter`,
          label: 'Adapter, 225 twinwall to 150',
          role: r.role,
          pieces: [
            { url: FILE.adapter, part: 'adapter', ops: alongBearing(ADAPTER.spigotY, r.bearing, false, tip, r.centre, ADAPTER.spigotTip) },
          ],
          explode: scaled(dir, E * 0.45),
          labelled: adapters === 0,
        })
        adapters++
        const twinEnd = tip + ADAPTER.spigotTip + ADAPTER.twinEnd
        y = r.centre + (ADAPTER.twinY - ADAPTER.spigotY)
        const couplerFrom = twinEnd - 90
        kit.push(stubPart(r, couplerFrom, y, dir))
        stubs++
        start = couplerFrom + STUB.coupler + STUB.twin - 15
        runEnd = start + 110
      } else if (Math.abs(p.od - nominal) <= 14) {
        start = mouth - 50
      } else {
        // No library fitting for this size change: a drawn reducer.
        const from = mouth - 30
        const length = 130
        parts.push({
          id: `${r.id}-reducer`,
          label: 'Reducer',
          role: 'accent',
          geometry: reducer(dir.clone().multiplyScalar(from).setY(y), dir, length, nominal / 2, p.od / 2 + 7),
          explode: scaled(dir, E * 0.45),
          labelled: reducers === 0,
        })
        reducers++
        start = from + length - 40
      }
    } else {
      start = Ri - 12
      if (r.size === ADAPTER_SIZE) {
        // Through the wall: the library stub's coupler makes the wall
        // connection, drawn pipe either side.
        const couplerFrom = Ro - 40
        const inside = couplerFrom + 20 - start
        parts.push({
          id: `${r.id}-inner`,
          label: r.label,
          role: r.role,
          geometry: twinwallPipe(dir.clone().multiplyScalar(start).setY(y), dir, inside, p.od, p.bore),
          explode,
          labelled: false,
        })
        kit.push(stubPart(r, couplerFrom, y, dir))
        stubs++
        addWater(`${r.id}-inner`, dir.clone().multiplyScalar(start).setY(y), dir, inside, p.bore, r.role, explode)
        start = couplerFrom + STUB.coupler + STUB.twin - 15
      }
    }

    const length = Math.max(110, runEnd - start)
    const from = dir.clone().multiplyScalar(start).setY(y)
    // Drawn pipes through the wall get a sealing collar where they leave it.
    const collarAt = sk || r.size === ADAPTER_SIZE ? undefined : Ro - start
    const body = tw ? twinwallPipe(from, dir, length, p.od, p.bore) : pipe(from, dir, length, p.od, p.bore)
    parts.push({
      id: r.id,
      label: r.label,
      role: r.role,
      geometry: collarAt === undefined ? body : merge([body, wallCollar(from, dir, collarAt, p.od)]),
      explode,
      labelled: false,
    })
    addWater(r.id, from, dir, length, p.bore, r.role, explode)
    highestPipe = Math.max(highestPipe, y + p.od / 2)
    if (r.role === 'outlet') outletY = y
    const tip = dir.clone().multiplyScalar(start + length).setY(y + p.od / 2 + 14)
    const sizeText = r.role === 'outlet' && o.outletLabel ? o.outletLabel : r.size
    const detail = r.role === 'outlet' && o.outletDetail ? o.outletDetail : `${sizeText} · H ${fmt(r.centre - floorTop)}`
    callouts.push({ id: r.id, title: r.title, detail, tone: r.role, follows: r.id, anchor: v3(tip), priority: r.priority })
  })

  // ── blanking caps on unused sockets
  if (moulded && !useSeb) {
    const used = new Set(runs.map((r) => r.hour))
    let capped = 0
    Object.entries(SOCKETS).forEach(([hour, sk]) => {
      if (used.has(Number(hour))) return
      const dir = clockDir(sk.bearing / 30)
      const at = dir.clone().multiplyScalar(sk.mouth * baseScale - 10).setY(sk.centre * baseScale)
      parts.push({
        id: `cap-${hour}`,
        label: 'Blanking cap',
        role: 'insides',
        geometry: blankingCap(at, dir, sk.radius * baseScale + 3, 24),
        explode: scaled(dir, E * 0.3),
        labelled: capped === 0,
      })
      capped++
    })
    if (capped) legend.push({ kind: 'drawn', text: `${capped} blanking cap${capped === 1 ? '' : 's'}` })
  }

  // ── shaft, cap, cover
  const coverTop = Math.max(outletY + out.bore / 2 + o.depthToSoffit, highestPipe + 350)
  const frameMin = 60
  const minTop = Math.max(highestPipe + 80, (moulded ? (useSeb ? SEB.height : BASE5.top) * baseScale : floorTop) + 120)
  const count = Math.max(1, Math.floor((coverTop - (CAP.top - CAP.seat) - frameMin - BODY.foot - (BODY.headTo - BODY.headFrom)) / PITCH))
  const minCount = Math.ceil((minTop - BODY.foot) / PITCH)
  const shaft = shaftPieces(Math.max(count, minCount), delta)
  const bodyTop = shaft.top
  const capTop = bodyTop + (CAP.top - CAP.seat)
  kit.push({ id: 'shaft', label: 'Chamber shaft', role: 'casing', pieces: shaft.pieces, explode: [0, riserLift, 0] })
  const corrugations = Math.max(count, minCount)
  legend.push({
    kind: exactSize ? 'library' : 'scaled',
    text: exactSize
      ? `Shaft: ${corrugations} x 65 mm SERCIC600 corrugations`
      : `Shaft: ${corrugations} x 65 mm SERCIC600 corrugations, widened to ${D} mm`,
  })

  kit.push({ id: 'cap', label: 'Chamber cap', role: 'cover', pieces: [capPiece(bodyTop, delta)], explode: [0, riserLift + E * 0.5, 0] })
  legend.push({ kind: exactSize ? 'library' : 'scaled', text: exactSize ? 'SERSIC600 cap' : `SERSIC600 cap, widened to ${D} mm` })

  // Cover and frame in the cap's opening; the frame height takes up the
  // difference between whole corrugations and the chosen depth.
  const opening = CAP.opening + 1
  const frameBottom = bodyTop - (CAP.seat - CAP.bottom)
  const finalCoverTop = Math.max(coverTop, capTop + 40)
  parts.push({
    id: 'frame',
    label: 'Cover frame',
    role: 'cover',
    geometry: merge([tube(opening + 26, opening, frameBottom, finalCoverTop - 20, 48), tube(opening + 70, opening, finalCoverTop - 20, finalCoverTop, 48)]),
    explode: [0, riserLift + E * 0.95, 0],
  })
  parts.push({
    id: 'lid',
    label: o.top === 'cover' ? 'Cover' : o.top === 'hinged-grate' ? 'Hinged grate' : 'Sealed grate',
    role: 'cover',
    geometry: coverGeometry(o.top, opening, finalCoverTop),
    explode: [0, riserLift + E * 1.5, 0],
  })
  legend.push({ kind: 'drawn', text: `${o.top === 'cover' ? 'Cover' : 'Grate'} and frame` })

  // ── water
  const waterTop = o.waterTop === undefined ? outletInvert + out.bore * 0.25 : o.waterTop ?? floorTop
  if (o.waterTop !== null && !moulded) {
    parts.push({
      id: 'sump-water',
      label: 'Water',
      role: 'water',
      water: 'still',
      geometry: roundWater(Ri - 2, floorTop + 1, Math.min(waterTop, bodyTop - 40)),
      explode: [0, 0, 0],
      labelled: false,
    })
  }

  if (adapters) legend.push({ kind: 'library', text: `${adapters} x 225 twinwall to 150 adapter` })
  if (stubs) legend.push({ kind: 'library', text: `${stubs} x 225 twinwall stub` })
  if (reducers) legend.push({ kind: 'drawn', text: `${reducers} reducer${reducers === 1 ? '' : 's'}` })
  legend.push({ kind: 'drawn', text: 'Pipes, true outside diameter' })
  if (!moulded) legend.push({ kind: 'drawn', text: 'Sump floor' })
  // The benched base has channels at 3, 6, 9 and 12 o'clock only.
  const overBench = useSeb ? o.inlets.filter((i) => SEB_INVERT[(i.hour % 12) * 30] === undefined).map((i) => i.hour) : []

  // ── dimensions
  if (o.dimensions) {
    const d = clockDir(10.5)
    callouts.push({
      id: 'depth',
      title: 'Cover to outlet soffit',
      detail: `${fmt(o.depthToSoffit)} mm`,
      tone: 'info',
      follows: 'frame',
      anchor: [d.x * (opening + 70), finalCoverTop, d.z * (opening + 70)],
      priority: 6,
      hideWhenExploded: true,
    })
    if (!moulded && o.base.kind === 'sump') {
      const s = clockDir(4)
      callouts.push({
        id: 'sump',
        title: 'Sump',
        detail: `${fmt(o.base.sump)} mm below outlet invert`,
        tone: 'info',
        follows: 'floor',
        anchor: [s.x * Ro, floorTop + o.base.sump / 2, s.z * Ro],
        priority: 5,
        hideWhenExploded: true,
      })
    }
  }

  const order = { library: 0, scaled: 1, drawn: 2 } as const
  legend.sort((a, b) => order[a.kind] - order[b.kind])

  const baseName = useSeb ? 'SEB1050 base' : 'SERCIC600 parts'
  const match: KitChamber['match'] =
    exactSize && (!moulded || baseExact)
      ? { kind: 'exact', text: 'Assembled from library parts at true size' }
      : useSeb && baseExact
        ? {
            kind: 'nearest',
            text: `Representative model: true ${baseName}, shaft widened from SERCIC600`,
            note: notes([
              `Shaft and cap are modelled at 600 mm and widened to ${D} mm; wall, corrugations and pipes are true size.`,
              benchNote(overBench),
            ]),
          }
        : {
            kind: 'nearest',
            text: `Representative model, scaled from ${useSeb ? 'SEB1050 and SERCIC600' : 'SERCIC600'}`,
            note: notes([
              `Library parts are modelled at ${useSeb ? '600 mm (base 1050 mm)' : '600 mm'}. Shown at ${D} mm with the shaft and cap widened${moulded ? ' and the base scaled' : ''}; wall, corrugations and pipes are true size.`,
              benchNote(overBench),
            ]),
          }

  return {
    parts,
    kit,
    callouts,
    legend,
    match,
    Ro,
    Ri,
    floorTop,
    outletInvert,
    outletCentre,
    waterTop,
    bodyTop,
    coverTop: finalCoverTop,
    explode: E,
    riserLift,
  }
}

