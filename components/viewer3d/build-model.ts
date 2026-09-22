import * as THREE from 'three'
import type {
  CatchpitData,
  ChamberData,
  Diameter,
  DrawpitData,
  FlowControlData,
  GreaseSeparatorData,
  GreaseTrapData,
  PipeSize,
  PumpStationData,
  RainwaterData,
  RhinoCeptorData,
  RhinoPodData,
  SepticTankData,
  WizardState,
} from '@/lib/types'
import { getMinSumpDepth } from '@/lib/rules/catchpit'
import { GREASE_TRAP_SPECS } from '@/lib/rules/grease-trap'
import {
  box,
  clockDir,
  cylinder,
  edges,
  horizontalTank,
  merge,
  orient,
  pipe,
  pipeWater,
  rectRing,
  revolve,
  roundWater,
  tankRibs,
  tube,
  type P2,
  type Vec3,
} from './geometry'
import {
  JUMBO_MICRO,
  LIFT_MAXI,
  LIFT_MINI,
  LIFT_SIZES,
  POC600,
  POC600_DIAMETER,
  RHINOPOD,
  ROTEX_SPIGOT,
  ROTEX_UNIT,
  SEHDS1800,
  SEHDS_AXIS,
  SEHDS_DIAMETER,
  SEHDS_INLET_BEARING,
} from './library-models'
import type { Callout, LibraryUse, MatchKind, ProcPart, ViewerModel } from './viewer-model'

/**
 * Turns the wizard selections into a ViewerModel.
 *
 * Chamber-bodied products (inspection chamber, catchpit, ROTEX flow
 * control, RhinoPod Plus) are built procedurally so their dimensions are
 * true to the selections. Products the 3D library covers use the library
 * model, choosing the closest variant and saying so when it is not exact.
 * Products with no library model get a procedural shape sized from the
 * selections and are labelled indicative.
 */

// ── pipes ───────────────────────────────────────────────────────────

interface PipeDims {
  /** Outside diameter drawn, mm. */
  od: number
  /** Bore, mm. */
  bore: number
}

/**
 * EN 1401 sizes are outside diameters (SN4 walls); twinwall sizes are
 * nominal bores, with the typical corrugated outside diameter.
 */
const PIPE: Record<PipeSize, PipeDims> = {
  '110mm EN1401': { od: 110, bore: 104 },
  '160mm EN1401': { od: 160, bore: 151 },
  '225mm Twinwall': { od: 270, bore: 225 },
  '300mm Twinwall': { od: 350, bore: 300 },
  '450mm Twinwall': { od: 520, bore: 450 },
}

const DEFAULT_PIPE: PipeSize = '160mm EN1401'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const v3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z]
const scaled = (v: THREE.Vector3, s: number): Vec3 => [v.x * s, v.y * s, v.z * s]
const fmt = (n: number) => Math.round(n).toLocaleString('en-GB')

function num(value: string | null | undefined): number | null {
  if (!value) return null
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

// ── colours for layers that are not a role colour ───────────────────

const GREASE = '#f2cf5b'
const SLUDGE = '#a38f6d'
const SCUM = '#d8c79a'

// ── round chamber ───────────────────────────────────────────────────

interface RoundInlet {
  n: number
  hour: number
  size: PipeSize
  /** Replaces "Inlet n" in the callout, e.g. for an indicative inlet. */
  title?: string
}

interface RoundChamberOptions {
  /** External diameter, mm. */
  diameter: number
  /** Cover level down to the outlet soffit, mm. */
  depthToSoffit: number
  /** Outlet invert above the internal base, mm. */
  sump: number
  outlet: PipeSize
  outletDetail?: string
  inlets: RoundInlet[]
  top: 'cover' | 'hinged-grate' | 'sealed-grate'
  /** Water surface height; undefined = just above the outlet invert, null = dry. */
  waterTop?: number | null
  /** Show the depth and sump dimension callouts. */
  dimensions: boolean
  /** Soffit-align inlets with the outlet (true) or share its invert. */
  soffitAligned?: boolean
}

interface RoundChamber {
  parts: ProcPart[]
  callouts: Callout[]
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

/** A ribbed HDPE riser: core radius Rc, ribs out to Ro, bore Ri. */
function ribbedRiser(Ro: number, Rc: number, Ri: number, y0: number, y1: number): THREE.BufferGeometry {
  const pitch = 240
  const rib = 80
  const profile: P2[] = [[Ri, y0], [Rc, y0]]
  let y = y0 + 70
  while (y + rib < y1 - 50) {
    profile.push([Rc, y], [Ro, y], [Ro, y + rib], [Rc, y + rib])
    y += pitch
  }
  profile.push([Rc, y1], [Ri, y1], [Ri, y0])
  return revolve(edges(profile), 48)
}

function lidGeometry(opening: number, top: number): THREE.BufferGeometry {
  const r = opening - 8
  const parts = [cylinder(r, top - 45, top - 6)]
  // Raised grip bars, as cast into ductile iron covers.
  ;[-0.45, 0, 0.45].forEach((f) => parts.push(box(r * 1.3 * Math.sqrt(1 - f * f), 8, 28, 0, top - 2, f * r)))
  return merge(parts)
}

function grateGeometry(opening: number, top: number, hinged: boolean): THREE.BufferGeometry {
  const r = opening - 8
  const inner = r - 34
  const parts = [tube(r, inner, top - 45, top - 6)]
  for (let z = -inner + 45; z < inner - 30; z += 68) {
    const chord = 2 * Math.sqrt(Math.max(0, inner * inner - z * z)) + 6
    parts.push(box(chord, 34, 22, 0, top - 25, z))
  }
  if (hinged) {
    ;[-0.4, 0.4].forEach((f) => parts.push(box(80, 34, 34, f * r, top - 16, -(r + 4))))
  } else {
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2
      const bolt = cylinder(12, top - 6, top + 2, 16)
      bolt.translate(Math.sin(a) * (r - 17), 0, Math.cos(a) * (r - 17))
      parts.push(bolt)
    }
  }
  return merge(parts)
}

function roundChamber(o: RoundChamberOptions): RoundChamber {
  const Ro = o.diameter / 2
  const Rc = Ro - 16
  const Ri = Ro - 30
  const floorTop = 40
  const out = PIPE[o.outlet]
  const outletInvert = floorTop + o.sump
  const outletCentre = outletInvert + out.bore / 2
  const outletSoffit = outletInvert + out.bore
  const coverTop = outletSoffit + o.depthToSoffit
  const reduced = o.diameter > 600
  // Chambers over 600 mm take a reducing cap to a 600 mm clear opening.
  const opening = reduced ? 300 : Ri
  const coverH = 110
  const capT = reduced ? 80 : 0
  const bodyTop = coverTop - coverH - capT
  const E = clamp(o.diameter * 0.55, 350, 650)
  const riserLift = E * 0.9
  const soffit = o.soffitAligned ?? true

  const inlets = o.inlets.map((inlet) => {
    const p = PIPE[inlet.size]
    // Soffits aligned with the outlet: the usual practice, so a smaller
    // inlet's invert sits higher and never below the outlet's.
    const invert = soffit ? outletSoffit - p.bore : outletInvert
    return { ...inlet, p, centre: invert + p.bore / 2 }
  })
  const pipeTop = Math.max(outletCentre + out.od / 2, ...inlets.map((i) => i.centre + i.p.od / 2))
  const baseTop = Math.min(Math.max(pipeTop + 160, floorTop + 260), bodyTop - 150)

  const parts: ProcPart[] = []
  const callouts: Callout[] = []

  parts.push({
    id: 'base',
    label: 'Chamber base',
    role: 'casing',
    geometry: revolve(edges([[0, 0], [Ro, 0], [Ro, baseTop], [Ri, baseTop], [Ri, floorTop], [0, floorTop]]), 56),
    explode: [0, 0, 0],
  })
  parts.push({
    id: 'riser',
    label: 'Riser shaft',
    role: 'casing',
    geometry: ribbedRiser(Ro, Rc, Ri, baseTop, bodyTop),
    explode: [0, riserLift, 0],
  })
  if (reduced) {
    parts.push({
      id: 'cap',
      label: 'Reducing cap',
      role: 'casing',
      geometry: tube(Ro, opening, bodyTop, bodyTop + capT),
      explode: [0, riserLift + E * 0.55, 0],
    })
  }
  const frameRo = reduced ? opening + 70 : Ro + 25
  parts.push({
    id: 'frame',
    label: 'Cover frame',
    role: 'cover',
    geometry: tube(frameRo, opening, bodyTop + capT, coverTop),
    explode: [0, riserLift + E * 1.15, 0],
  })
  parts.push({
    id: 'lid',
    label: o.top === 'cover' ? 'Cover' : o.top === 'hinged-grate' ? 'Hinged grate' : 'Sealed grate',
    role: 'cover',
    geometry: o.top === 'cover' ? lidGeometry(opening, coverTop) : grateGeometry(opening, coverTop, o.top === 'hinged-grate'),
    explode: [0, riserLift + E * 1.8, 0],
  })

  const waterTop = o.waterTop === undefined ? outletInvert + out.bore * 0.25 : o.waterTop ?? floorTop
  if (o.waterTop !== null) {
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

  // Pipes start just inside the bore and run out past the wall.
  const rs = Ri - 12
  const outside = clamp(o.diameter * 0.5, 320, 600)
  const length = Ro - rs + outside
  const addPipe = (
    id: string,
    label: string,
    role: 'inlet' | 'outlet',
    dir: THREE.Vector3,
    centre: number,
    p: PipeDims,
    callout: Omit<Callout, 'id' | 'follows' | 'anchor'>,
  ) => {
    const start = dir.clone().multiplyScalar(rs).setY(centre)
    const explode = scaled(dir, E)
    parts.push({ id, label, role, geometry: pipe(start, dir, length, p.od, p.bore, Ro - rs), explode, labelled: false })
    parts.push({
      id: `${id}-water`,
      label: 'Water',
      role: 'water',
      water: 'flow',
      geometry: pipeWater(start, dir, length * 0.995, p.bore, role === 'inlet'),
      explode,
      labelled: false,
    })
    const tip = dir.clone().multiplyScalar(rs + length).setY(centre + p.od / 2 + 14)
    callouts.push({ ...callout, id, follows: id, anchor: v3(tip) })
  }

  inlets.forEach((inlet) => {
    addPipe(`inlet-${inlet.n}`, inlet.title ?? `Inlet ${inlet.n}`, 'inlet', clockDir(inlet.hour), inlet.centre, inlet.p, {
      title: `${inlet.title ?? `Inlet ${inlet.n}`} · ${inlet.hour} o'clock`,
      detail: `${inlet.size} · H ${fmt(inlet.centre - floorTop)}`,
      tone: 'inlet',
      priority: 9,
    })
  })
  addPipe('outlet', 'Outlet', 'outlet', clockDir(12), outletCentre, out, {
    title: "Outlet · 12 o'clock",
    detail: o.outletDetail ?? `${o.outlet} · H ${fmt(outletCentre - floorTop)}`,
    tone: 'outlet',
    priority: 10,
  })

  if (o.dimensions) {
    const d = clockDir(10.5)
    callouts.push({
      id: 'depth',
      title: 'Cover to outlet soffit',
      detail: `${fmt(o.depthToSoffit)} mm`,
      tone: 'info',
      follows: 'frame',
      anchor: [d.x * frameRo, coverTop, d.z * frameRo],
      priority: 6,
      hideWhenExploded: true,
    })
    const s = clockDir(4)
    callouts.push({
      id: 'sump',
      title: 'Sump',
      detail: `${fmt(o.sump)} mm below outlet invert`,
      tone: 'info',
      follows: 'base',
      anchor: [s.x * Ro, floorTop + o.sump / 2, s.z * Ro],
      priority: 5,
      hideWhenExploded: true,
    })
  }

  return {
    parts,
    callouts,
    Ro,
    Ri,
    floorTop,
    outletInvert,
    outletCentre,
    waterTop,
    bodyTop,
    coverTop,
    explode: E,
    riserLift,
  }
}

/** A RoTex vortex unit hung on the north wall over the outlet. */
function rotexUse(ch: RoundChamber): LibraryUse {
  return {
    id: 'rotex',
    url: ROTEX_UNIT.url,
    // Spigot tip at the start of the outlet pipe, spigot centre on the outlet centre.
    position: [0, ch.outletCentre - ROTEX_SPIGOT.centreY, -(ch.Ri - 12) - ROTEX_SPIGOT.tipZ],
    // Inside a chamber only the main parts are named, so labels stay legible.
    parts: Object.fromEntries(
      Object.entries(ROTEX_UNIT.parts).map(([name, spec]) => [
        name,
        { ...spec, labelled: name === 'snail-3-4' || name === 'bypass-arm' || name === 'back-case' },
      ]),
    ),
  }
}

/** Does the RoTex unit's back plate fit against the wall of this bore? */
function rotexFits(Ri: number): boolean {
  const z = Ri - 12 + ROTEX_SPIGOT.tipZ - ROTEX_SPIGOT.backZ
  return Math.hypot(ROTEX_SPIGOT.halfWidth, Ri - z) < Ri - 4
}

function orificePlate(ch: RoundChamber, outlet: PipeSize): ProcPart {
  const p = PIPE[outlet]
  const g = tube(p.od / 2 + 55, p.bore * 0.32, 0, 14, 40)
  const handle = box(24, 220, 14, 0, 0, 0)
  handle.translate(0, p.od / 2 + 150, 7)
  orient(g, new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, ch.outletCentre, -(ch.Ri - 30)))
  handle.translate(0, ch.outletCentre, -(ch.Ri - 23))
  return {
    id: 'orifice',
    label: 'Orifice plate',
    role: 'accent',
    geometry: merge([g, handle]),
    explode: [0, ch.explode * 0.4, ch.explode * 0.7],
  }
}

// ── horizontal tanks ────────────────────────────────────────────────

/** Water (or a layer) in a horizontal tank between two heights, from x0 to x1. */
function tankBand(r: number, base: number, lo: number, hi: number, x0: number, x1: number): THREE.BufferGeometry {
  const rr = r - 6
  const aLo = Math.asin(clamp((lo - base - r) / rr, -0.999, 0.999))
  const aHi = Math.asin(clamp((hi - base - r) / rr, -0.999, 0.999))
  const shape = new THREE.Shape()
  shape.moveTo(rr * Math.cos(aLo), rr * Math.sin(aLo))
  shape.absarc(0, 0, rr, aLo, aHi, false)
  shape.lineTo(-rr * Math.cos(aHi), rr * Math.sin(aHi))
  shape.absarc(0, 0, rr, Math.PI - aHi, Math.PI - aLo, false)
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 40 })
  g.rotateY(Math.PI / 2)
  g.translate(x0, base + r, 0)
  // Normalised UVs so the water shader's streak spacing is sensible.
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x0) / (x1 - x0), (pos.getY(i) - base) / (2 * r))
  }
  return g
}

interface TankOptions {
  r: number
  length: number
  label: string
  turrets: { x: number; label: string }[]
  /** Height of the access necks above the tank crown. */
  neck: number
}

interface Tank {
  parts: ProcPart[]
  crown: number
  coverTop: number
  E: number
  dome: number
}

function tank(o: TankOptions): Tank {
  const { r, length } = o
  const dome = r * 0.3
  const E = clamp(r * 0.9, 450, 900)
  const ribXs: number[] = []
  const ribCount = Math.max(2, Math.round(length / 700))
  for (let i = 0; i < ribCount; i++) ribXs.push(-length / 2 + ((i + 0.5) * length) / ribCount)
  const parts: ProcPart[] = [
    {
      id: 'shell',
      label: o.label,
      role: 'casing',
      geometry: merge([horizontalTank(r, length, dome, 0), tankRibs(r, ribXs, 0)]),
      explode: [0, 0, 0],
    },
  ]
  const crown = 2 * r
  const rt = 300
  const coverTop = crown + o.neck + 40
  o.turrets.forEach((t, i) => {
    const neck = tube(rt, rt - 25, crown - 90, crown + o.neck)
    neck.translate(t.x, 0, 0)
    parts.push({ id: `turret-${i + 1}`, label: t.label, role: 'casing', geometry: neck, explode: [0, E, 0] })
    const lid = merge([cylinder(rt + 30, crown + o.neck, coverTop), box(rt * 1.2, 10, 30, 0, coverTop + 5, 0)])
    lid.translate(t.x, 0, 0)
    parts.push({ id: `cover-${i + 1}`, label: 'Access cover', role: 'cover', geometry: lid, explode: [0, E * 1.8, 0] })
  })
  return { parts, crown, coverTop, E, dome }
}

/** A plate across a horizontal tank at X, clipped to the shell. */
function tankPlate(r: number, x: number, lo: number, hi: number, t = 24): THREE.BufferGeometry {
  return tankBand(r, 0, lo, hi, x - t / 2, x + t / 2)
}

function tankPipe(
  id: string,
  label: string,
  role: 'inlet' | 'outlet',
  end: -1 | 1,
  x: number,
  centre: number,
  p: PipeDims,
  length: number,
  E: number,
): ProcPart[] {
  const dir = new THREE.Vector3(end, 0, 0)
  const start = new THREE.Vector3(x, centre, 0)
  const explode: Vec3 = [end * E * 0.8, 0, 0]
  return [
    { id, label, role, geometry: pipe(start, dir, length, p.od, p.bore), explode, labelled: false },
    {
      id: `${id}-water`,
      label: 'Water',
      role: 'water',
      water: 'flow',
      geometry: pipeWater(start, dir, length * 0.995, p.bore, role === 'inlet'),
      explode,
      labelled: false,
    },
  ]
}

function dipPipe(x: number, y0: number, y1: number, p: PipeDims): THREE.BufferGeometry {
  const g = tube(p.od / 2, p.bore / 2, y0, y1, 32)
  g.translate(x, 0, 0)
  return g
}

// ── per product ─────────────────────────────────────────────────────

interface Built {
  match: { kind: MatchKind; text: string; note?: string }
  parts: ProcPart[]
  libraries: LibraryUse[]
  callouts: Callout[]
  view: { azimuth: number; elevation: number }
}

const CONFIGURED = 'Built to your selections'

function notes(list: (string | false | null | undefined)[]): string | undefined {
  const out = list.filter((s): s is string => typeof s === 'string' && s.length > 0)
  return out.length ? out.join(' ') : undefined
}

function chamberInlets(d: ChamberData | CatchpitData): RoundInlet[] {
  return d.positions.map((pos, i) => ({
    n: i + 1,
    hour: Number(pos),
    size: d.pipeSizes[`inlet${i + 1}`] ?? DEFAULT_PIPE,
  }))
}

function chamberOutlet(d: ChamberData | CatchpitData): { size: PipeSize; detail: (h: number) => string } {
  const size = d.outletLocked ?? d.pipeSizes.outlet ?? DEFAULT_PIPE
  return { size, detail: (h) => `${size}${d.outletLocked ? ' (locked)' : ''} · H ${fmt(h)}` }
}

function buildChamber(d: ChamberData): Built {
  const diameter = d.diameter ?? 600
  const depth = d.depth ?? 1500
  const outlet = chamberOutlet(d)
  const sump = 350
  const outletCentre = 40 + sump + PIPE[outlet.size].bore / 2
  const ch = roundChamber({
    diameter,
    depthToSoffit: depth,
    sump,
    outlet: outlet.size,
    outletDetail: outlet.detail(outletCentre - 40),
    inlets: chamberInlets(d),
    top: 'cover',
    dimensions: true,
  })
  const parts = [...ch.parts]
  const libraries: LibraryUse[] = []
  const callouts = [...ch.callouts]
  let flowNote: string | undefined
  if (d.flowControl && d.flowType === 'Orifice plate') {
    parts.push(orificePlate(ch, outlet.size))
    callouts.push({
      id: 'flow',
      title: 'Orifice plate',
      detail: d.flowRate ? `${d.flowRate} L/s` : undefined,
      tone: 'accent',
      follows: 'orifice',
      priority: 7,
    })
  } else if (d.flowControl && d.flowType === 'Vortex') {
    if (rotexFits(ch.Ri)) {
      libraries.push(rotexUse(ch))
      callouts.push({
        id: 'flow',
        title: 'Vortex flow control',
        detail: d.flowRate ? `${d.flowRate} L/s` : undefined,
        tone: 'accent',
        follows: 'rotex:snail-3-4',
        priority: 7,
      })
    } else {
      flowNote = 'The vortex unit is not drawn in a chamber this small.'
    }
  }
  const pending = (d.inletCount ?? 0) > d.positions.length
  return {
    match: {
      kind: 'configured',
      text: CONFIGURED,
      note: notes([
        !d.diameter && 'Showing 600 mm until a diameter is chosen.',
        !d.depth && 'Showing 1500 mm deep until a depth is chosen.',
        pending && 'Inlets appear once their clock positions are chosen.',
        flowNote,
      ]),
    },
    parts,
    libraries,
    callouts,
    view: { azimuth: 30, elevation: 18 },
  }
}

function buildCatchpit(d: CatchpitData): Built {
  const variant = d.variant ?? 'SERDS'
  const diameter = d.diameter ?? (variant === 'SERS' ? 450 : 600)
  const depth = d.depth ?? 1500
  const sump = getMinSumpDepth(diameter as Diameter)
  const outlet = chamberOutlet(d)
  const outletCentre = 40 + sump + PIPE[outlet.size].bore / 2
  const ch = roundChamber({
    diameter,
    depthToSoffit: depth,
    sump,
    outlet: outlet.size,
    outletDetail: outlet.detail(outletCentre - 40),
    inlets: chamberInlets(d),
    top: d.grateType === 'sealed' ? 'sealed-grate' : d.grateType === 'hinged' ? 'hinged-grate' : 'cover',
    dimensions: true,
  })
  let parts = [...ch.parts]
  const p = PIPE[outlet.size]
  if (variant === 'SERS') {
    // The bucket lifts out through the shaft, so in breakout it rises clear
    // of the base and everything above it rises by the same amount.
    const lift = ch.outletInvert - ch.floorTop + 120
    const above = new Set(['riser', 'cap', 'frame', 'lid'])
    parts = parts.map((part) =>
      above.has(part.id) ? { ...part, explode: [part.explode[0], part.explode[1] + lift, part.explode[2]] as Vec3 } : part,
    )
    // Removable silt bucket: sits on the base, rim below the outlet invert.
    const ro = ch.Ri - 20
    const top = ch.outletInvert - 60
    const handle = new THREE.TorusGeometry(ro * 0.8, 9, 8, 32, Math.PI)
    handle.rotateY(Math.PI / 2)
    handle.translate(0, top, 0)
    parts.push({
      id: 'bucket',
      label: 'Removable silt bucket',
      role: 'insides',
      geometry: merge([tube(ro, ro - 10, ch.floorTop + 12, top, 48), cylinder(ro - 10, ch.floorTop + 12, ch.floorTop + 24, 48), handle]),
      explode: [0, lift + ch.explode * 0.3, 0],
    })
  } else {
    // Built-in settling: a weir splits the sump into a primary (inlet side)
    // and a secondary (outlet side) settling chamber.
    const z = ch.Ri * 0.12
    const half = Math.sqrt(ch.Ri * ch.Ri - z * z) - 6
    parts.push({
      id: 'weir',
      label: 'Settling weir',
      role: 'insides',
      geometry: box(half * 2, ch.outletInvert - 110 - ch.floorTop, 22, 0, (ch.floorTop + ch.outletInvert - 110) / 2, z),
      explode: [0, 0, 0],
    })
  }
  if (d.baffleType === 'internal') {
    const z = -(ch.Ri - p.od * 0.9)
    const halfChord = Math.sqrt(Math.max(0, ch.Ri * ch.Ri - z * z)) - 12
    const w = Math.min(p.od * 2.4, halfChord * 2)
    const y0 = ch.outletInvert - 220
    const y1 = ch.outletInvert + p.bore + 160
    parts.push({
      id: 'baffle',
      label: 'Internal baffle plate',
      role: 'accent',
      geometry: box(w, y1 - y0, 16, 0, (y0 + y1) / 2, z),
      explode: [0, 0, ch.explode * 0.6],
    })
  } else if (d.baffleType === 'external') {
    const g = dipPipe(0, ch.outletInvert - 260, ch.outletInvert + p.bore + 120, p)
    g.translate(0, 0, -(ch.Ri - p.od / 2 - 14))
    parts.push({
      id: 'baffle',
      label: 'Outlet baffle',
      role: 'accent',
      geometry: g,
      explode: [0, 0, ch.explode * 0.6],
    })
  }
  const pending = (d.inletCount ?? 0) > d.positions.length
  return {
    match: {
      kind: 'configured',
      text: CONFIGURED,
      note: notes([
        !d.diameter && `Showing ${diameter} mm until a diameter is chosen.`,
        !d.depth && 'Showing 1500 mm deep until a depth is chosen.',
        pending && 'Inlets appear once their clock positions are chosen.',
      ]),
    },
    parts,
    libraries: [],
    callouts: ch.callouts,
    view: { azimuth: 30, elevation: 18 },
  }
}

function buildFlowControl(d: FlowControlData): Built {
  if (d.variant === 'ROTEX') {
    const diameter = d.chamberDiameter ?? 600
    const head = num(d.headDepthMm) ?? 1000
    const sump = 250
    const out = PIPE[DEFAULT_PIPE]
    // Cover level: design head above the outlet invert plus freeboard.
    const coverTop = 40 + sump + Math.max(head, 900) + 450
    const depthToSoffit = coverTop - (40 + sump + out.bore)
    const ch = roundChamber({
      diameter,
      depthToSoffit,
      sump,
      outlet: DEFAULT_PIPE,
      outletDetail: 'Vortex outlet',
      inlets: [{ n: 1, hour: 6, size: DEFAULT_PIPE, title: 'Inlet' }],
      top: 'cover',
      dimensions: false,
    })
    // Water at its working level; a ring on the wall marks the design head
    // so the vortex unit stays visible.
    const level = Math.min(40 + sump + head, ch.bodyTop - 40)
    const ring = tube(ch.Ri - 1, ch.Ri - 34, level - 10, level + 10)
    const parts: ProcPart[] = [
      ...ch.parts,
      { id: 'head', label: 'Design top water level', role: 'insides', color: '#3d9fd6', geometry: ring, explode: [0, 0, 0] },
    ]
    const callouts = ch.callouts.map((c) =>
      c.id === 'inlet-1' ? { ...c, title: "Inlet · 6 o'clock", detail: 'Position to suit site' } : c,
    )
    const w = clockDir(4.5)
    callouts.push({
      id: 'head',
      title: 'Design head',
      detail: `${fmt(head)} mm above outlet invert`,
      tone: 'info',
      anchor: [w.x * (ch.Ri - 34), level + 10, w.z * (ch.Ri - 34)],
      priority: 6,
      hideWhenExploded: true,
    })
    callouts.push({
      id: 'flow',
      title: 'Vortex regulator',
      detail: d.dischargeRateLs ? `${d.dischargeRateLs} L/s` : undefined,
      tone: 'accent',
      follows: 'rotex:snail-3-4',
      priority: 7,
    })
    return {
      match: {
        kind: 'configured',
        text: CONFIGURED,
        note: notes([
          !d.chamberDiameter && 'Showing 600 mm until a diameter is chosen.',
          'Chamber height is indicative, set from the design head. Vortex unit from the 3D library.',
        ]),
      },
      parts,
      libraries: [rotexUse(ch)],
      callouts,
      view: { azimuth: 30, elevation: 20 },
    }
  }
  // SERF orifice chamber: the RoFlo POC600 is the only size in the library.
  const exact = d.chamberDiameter === null || d.chamberDiameter === POC600_DIAMETER
  return {
    match: exact
      ? {
          kind: 'exact',
          text: `Library model: ${POC600.name}`,
          note: d.chamberDiameter === null ? 'Showing 600 mm until a diameter is chosen.' : undefined,
        }
      : {
          kind: 'nearest',
          text: `Nearest model shown: ${POC600.name}`,
          note: `Your chamber is ${d.chamberDiameter} mm; the library has the 600 mm unit only.`,
        },
    parts: [],
    libraries: [{ id: 'poc', url: POC600.url, parts: POC600.parts }],
    callouts: [],
    view: { azimuth: 35, elevation: 18 },
  }
}

function buildRhinoceptor(d: RhinoCeptorData): Built {
  const bearing = d.inletAngleDeg ?? SEHDS_INLET_BEARING
  const swing = -THREE.MathUtils.degToRad(bearing - SEHDS_INLET_BEARING)
  const libraries: LibraryUse[] = [
    {
      id: 'sehds',
      url: SEHDS1800.url,
      parts: SEHDS1800.parts,
      swing: { inlet: { pivot: SEHDS_AXIS, angle: swing } },
    },
  ]
  const callouts: Callout[] = [
    {
      id: 'inlet',
      title: `Inlet · ${Math.round(bearing)}° from N`,
      detail: d.inletAngleDeg === null ? 'Angle not chosen yet' : undefined,
      tone: 'inlet',
      follows: 'sehds:inlet',
      priority: 9,
    },
    { id: 'outlet', title: 'Outlet · 0° (north)', tone: 'outlet', follows: 'sehds:outlet', priority: 10 },
  ]
  if (d.rhinoPodAddOn) {
    // Shown alongside the separator; its parts are named only on the pod itself.
    const parts = Object.fromEntries(
      Object.entries(RHINOPOD.parts).map(([name, spec]) => [name, { ...spec, labelled: false }]),
    )
    libraries.push({ id: 'pod', url: RHINOPOD.url, position: [1350, 0, 1500], parts })
    callouts.push({ id: 'pod', title: 'RhinoPod add-on', tone: 'accent', follows: 'pod:casing', priority: 6 })
  }
  const dia = d.sehdsDiameter
  const exact = dia === null || dia === SEHDS_DIAMETER
  return {
    match: exact
      ? {
          kind: 'exact',
          text: `Library model: ${SEHDS1800.name}`,
          note: dia === null ? 'Showing the 1800 mm unit until a diameter is chosen.' : undefined,
        }
      : {
          kind: 'nearest',
          text: `Nearest model shown: ${SEHDS1800.name}`,
          note: `Your separator is ${dia} mm; the library has the 1800 mm unit only. The inlet is turned to your chosen angle.`,
        },
    parts: [],
    libraries,
    callouts,
    // Look from a little round from the inlet side.
    view: { azimuth: 180 - bearing + 40, elevation: 16 },
  }
}

function buildPumpStation(d: PumpStationData): Built {
  const twin = d.pumpCount === 2
  const entry = twin ? LIFT_MAXI : LIFT_MINI
  const size = twin ? LIFT_SIZES.maxi : LIFT_SIZES.mini
  const exact = d.wetWellDiameter === size.diameter && d.depth === size.depth
  const yours = `Your well: ${d.wetWellDiameter ?? '-'} mm across, ${d.depth ?? '-'} mm deep.`
  return {
    match: {
      kind: exact ? 'exact' : 'nearest',
      text: exact ? `Library model: ${entry.name}` : `Nearest model shown: ${entry.name}`,
      note: exact
        ? undefined
        : `Library well is ${size.diameter} mm across, ${size.depth} mm deep${twin ? ', twin pump' : ''}. ${yours}`,
    },
    parts: [],
    libraries: [{ id: 'lift', url: entry.url, parts: entry.parts }],
    callouts: [],
    view: { azimuth: 25, elevation: 18 },
  }
}

function buildGreaseTrap(d: GreaseTrapData): Built {
  const model = d.model ?? 'micro'
  const spec = GREASE_TRAP_SPECS[model]
  const exact = model === 'micro'
  const name = model.charAt(0).toUpperCase() + model.slice(1)
  return {
    match: exact
      ? {
          kind: 'exact',
          text: `Library model: ${JUMBO_MICRO.name}`,
          note: d.model === null ? 'Showing the Micro until a model is chosen.' : undefined,
        }
      : {
          kind: 'nearest',
          text: `Nearest model shown: ${JUMBO_MICRO.name}`,
          note: `The ${name} is ${spec.lengthMm} x ${spec.widthMm} x ${spec.heightMm} mm; only the Micro (830 x 640 x 630 mm) is in the 3D library.`,
        },
    parts: [],
    libraries: [{ id: 'trap', url: JUMBO_MICRO.url, parts: JUMBO_MICRO.parts }],
    callouts: [
      {
        id: 'inlet',
        title: 'Inlet',
        detail: d.connectionInlet ?? undefined,
        tone: 'inlet',
        follows: 'trap:jumbo-micro-inlet-1',
        priority: 9,
      },
      {
        id: 'outlet',
        title: 'Outlet',
        detail: d.connectionOutlet ?? undefined,
        tone: 'outlet',
        follows: 'trap:jumbo-micro-inlet-2',
        priority: 10,
      },
    ],
    view: { azimuth: 55, elevation: 22 },
  }
}

function buildGreaseSeparator(d: GreaseSeparatorData): Built {
  const flow = num(d.flowRateLs)
  const ns = flow ?? 2
  // Indicative only: a two-stage separator sized at about 500 L per NS.
  const volume = clamp(500 * ns + 500, 1200, 25000)
  const D = volume <= 3000 ? 1200 : volume <= 8000 ? 1600 : 2000
  const r = D / 2
  const length = Math.max((volume * 1e6) / (Math.PI * r * r), D * 1.3)
  const t = tank({
    r,
    length,
    label: 'Separator tank',
    turrets: [
      { x: -length * 0.26, label: 'Sludge trap access' },
      { x: length * 0.26, label: 'Separator access' },
    ],
    neck: 450,
  })
  const p = PIPE[DEFAULT_PIPE]
  const level = r * 1.55
  const divider = -length * 0.02
  const parts: ProcPart[] = [...t.parts]
  parts.push(
    { id: 'water', label: 'Water', role: 'water', water: 'still', geometry: tankBand(r, 0, 4, level, -length / 2, length / 2), explode: [0, 0, 0], labelled: false },
    { id: 'sludge', label: 'Settled solids', role: 'insides', color: SLUDGE, geometry: tankBand(r, 0, 4, r * 0.32, -length / 2, divider), explode: [0, 0, 0] },
    { id: 'grease', label: 'Retained grease', role: 'insides', color: GREASE, geometry: tankBand(r, 0, level - 70, level + 4, divider, length / 2), explode: [0, t.E * 0.35, 0] },
    { id: 'divider', label: 'Sludge trap divider', role: 'accent', geometry: tankPlate(r, divider, 10, r * 1.35), explode: [0, 0, 0] },
    { id: 'deflector', label: 'Inlet deflector', role: 'accent', geometry: dipPipe(-length / 2 + 200, r * 0.95, r * 1.8, p), explode: [0, t.E * 0.3, 0] },
    { id: 'dip', label: 'Outlet dip pipe', role: 'accent', geometry: dipPipe(length / 2 - 200, r * 0.55, r * 1.65, p), explode: [0, t.E * 0.3, 0] },
    ...tankPipe('inlet', 'Inlet', 'inlet', -1, -length / 2 + 200, level + 50 + p.bore / 2, p, t.dome + 420, t.E),
    ...tankPipe('outlet', 'Outlet', 'outlet', 1, length / 2 - 200, level + p.bore / 2, p, t.dome + 420, t.E),
  )
  return {
    match: {
      kind: 'indicative',
      text: 'Indicative shape, no 3D library model',
      note: `Sized at about ${fmt(volume)} litres for NS ${ns}${flow === null ? ' until a flow rate is entered' : ''}. Final size comes from the design.`,
    },
    parts,
    libraries: [],
    callouts: [
      { id: 'inlet', title: 'Inlet', detail: `${DEFAULT_PIPE} (indicative)`, tone: 'inlet', follows: 'inlet', priority: 9 },
      { id: 'outlet', title: 'Outlet', detail: `${DEFAULT_PIPE} (indicative)`, tone: 'outlet', follows: 'outlet', priority: 10 },
      { id: 'size', title: `NS ${ns}`, detail: `About ${fmt(volume)} L`, tone: 'info', follows: 'shell', anchor: [0, 2 * r, r * 0.6], priority: 5, hideWhenExploded: true },
    ],
    view: { azimuth: 35, elevation: 22 },
  }
}

const DISCHARGE: Record<string, string> = {
  watercourse: 'To watercourse',
  soakaway: 'To soakaway',
  drainfield: 'To drainage field',
}

function buildSeptic(d: SepticTankData): Built {
  const pe = num(d.populationEquivalent)
  const people = pe ?? 6
  // BS 6297: septic tank capacity C = 180P + 2000 litres.
  const capacity = 180 * people + 2000
  const D = capacity <= 4500 ? 1400 : capacity <= 9000 ? 1800 : 2200
  const r = D / 2
  const length = Math.max((capacity * 1e6) / (Math.PI * r * r), D * 1.3)
  const secondary = d.treatmentLevel === 'secondary'
  const t = tank({
    r,
    length,
    label: secondary ? 'Treatment plant tank' : 'Septic tank',
    turrets: [
      { x: -length * 0.3, label: secondary ? 'Settlement access' : 'Primary chamber access' },
      { x: length * 0.3, label: secondary ? 'Clarifier access' : 'Secondary chamber access' },
    ],
    neck: 450,
  })
  const p = PIPE['110mm EN1401']
  const level = r * 1.6
  const x0 = -length / 2
  const parts: ProcPart[] = [...t.parts]
  const walls = secondary ? [x0 + length * 0.38, x0 + length * 0.76] : [x0 + (length * 2) / 3]
  walls.forEach((x, i) => {
    parts.push({
      id: `wall-${i + 1}`,
      label: 'Compartment wall',
      role: 'accent',
      geometry: tankPlate(r, x, 10, r * 1.75),
      explode: [0, 0, 0],
      labelled: i === 0,
    })
  })
  parts.push(
    { id: 'water', label: 'Water', role: 'water', water: 'still', geometry: tankBand(r, 0, 4, level, -length / 2, length / 2), explode: [0, 0, 0], labelled: false },
    { id: 'sludge', label: 'Sludge', role: 'insides', color: SLUDGE, geometry: tankBand(r, 0, 4, r * 0.34, x0, walls[0]), explode: [0, 0, 0] },
    { id: 'scum', label: 'Scum layer', role: 'insides', color: SCUM, geometry: tankBand(r, 0, level - 60, level + 4, x0, walls[0]), explode: [0, t.E * 0.3, 0] },
    { id: 'inlet-dip', label: 'Inlet dip pipe', role: 'accent', geometry: dipPipe(x0 + 180, r * 1.0, r * 1.9, p), explode: [0, t.E * 0.3, 0] },
    { id: 'outlet-dip', label: 'Outlet dip pipe', role: 'accent', geometry: dipPipe(length / 2 - 180, r * 0.9, r * 1.8, p), explode: [0, t.E * 0.3, 0] },
    ...tankPipe('inlet', 'Inlet', 'inlet', -1, x0 + 180, level + 60 + p.bore / 2, p, t.dome + 420, t.E),
    ...tankPipe('outlet', 'Outlet', 'outlet', 1, length / 2 - 180, level + p.bore / 2, p, t.dome + 420, t.E),
  )
  if (secondary) {
    const mx0 = walls[0] + 60
    const mx1 = walls[1] - 60
    parts.push(
      {
        id: 'media',
        label: 'Biological media',
        role: 'accent',
        geometry: box(mx1 - mx0, r * 0.85, r * 1.1, (mx0 + mx1) / 2, r * 0.95, 0),
        explode: [0, t.E * 0.5, 0],
      },
      {
        id: 'diffuser',
        label: 'Air diffuser',
        role: 'insides',
        geometry: merge([
          orient(tube(28, 20, 0, mx1 - mx0, 24), new THREE.Vector3(1, 0, 0), new THREE.Vector3(mx0, r * 0.3, 0)),
          orient(tube(22, 15, r * 0.3, t.coverTop - 60, 24), new THREE.Vector3(0, 1, 0), new THREE.Vector3(mx0 + 40, 0, r * 0.5)),
        ]),
        explode: [0, 0, 0],
      },
      {
        id: 'blower',
        label: 'Air blower kiosk',
        role: 'body',
        geometry: box(520, 720, 420, walls[0], t.coverTop - 40 + 360, r + 520),
        explode: [0, 0, t.E * 0.6],
      },
    )
  }
  return {
    match: {
      kind: 'indicative',
      text: 'Indicative shape, no 3D library model',
      note: `${secondary ? 'Packaged treatment plant' : 'Two-chamber septic tank'} sized at about ${fmt(capacity)} litres (BS 6297, 180P + 2000) for ${people} people${pe === null ? ' until a population is entered' : ''}.`,
    },
    parts,
    libraries: [],
    callouts: [
      { id: 'inlet', title: 'Inlet', detail: '110mm EN1401 (indicative)', tone: 'inlet', follows: 'inlet', priority: 9 },
      {
        id: 'outlet',
        title: 'Outlet',
        detail: d.dischargePoint ? DISCHARGE[d.dischargePoint] : undefined,
        tone: 'outlet',
        follows: 'outlet',
        priority: 10,
      },
      { id: 'size', title: `About ${fmt(capacity)} L`, detail: `${people} PE`, tone: 'info', follows: 'shell', anchor: [0, 2 * r, r * 0.6], priority: 5, hideWhenExploded: true },
    ],
    view: { azimuth: 35, elevation: 22 },
  }
}

function buildRainwater(d: RainwaterData): Built {
  const capacity = d.capacityLitres ?? 2200
  const D = capacity <= 1400 ? 1000 : capacity <= 2400 ? 1200 : 1400
  const r = D / 2
  const length = Math.max((capacity * 1e6) / (Math.PI * r * r), D * 0.9)
  const t = tank({ r, length, label: 'Storage tank', turrets: [{ x: 0, label: 'Access turret' }], neck: 500 })
  const p = PIPE['110mm EN1401']
  const crown = t.crown
  const level = r * 1.45
  const rt = 300
  const parts: ProcPart[] = [...t.parts]
  parts.push(
    { id: 'water', label: 'Water', role: 'water', water: 'still', geometry: tankBand(r, 0, 4, level, -length / 2, length / 2), explode: [0, 0, 0], labelled: false },
    {
      id: 'filter',
      label: 'Inlet filter',
      role: 'insides',
      geometry: merge([tube(rt - 45, rt - 55, crown + 120, crown + 360, 40), cylinder(rt - 55, crown + 110, crown + 122, 40)]),
      explode: [0, t.E * 1.2, 0],
    },
    {
      id: 'calmed',
      label: 'Calmed inlet',
      role: 'insides',
      geometry: merge([
        orient(tube(p.od / 2, p.bore / 2, 0, crown + 110 - 150, 28), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-160, 150, 0)),
        orient(tube(p.od / 2, p.bore / 2, 0, 260, 28), new THREE.Vector3(-1, 0.35, 0).normalize(), new THREE.Vector3(-160, 150, 0)),
      ]),
      explode: [0, 0, 0],
    },
    ...tankPipe('inlet', 'Inlet', 'inlet', -1, -rt + 30, crown + 280, p, 520, t.E),
    ...tankPipe('overflow', 'Overflow', 'outlet', 1, rt - 30, crown + 180, p, 520, t.E),
  )
  const pumped = d.systemType !== 'gravity'
  if (pumped) {
    parts.push({
      id: 'pump',
      label: 'Submersible pump',
      role: 'accent',
      geometry: merge([
        cylinder(75, 60, 420, 32),
        box(200, 40, 200, 0, 40, 0),
        orient(tube(22, 15, 420, t.coverTop - 80, 20), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0)),
      ]).translate(150, 0, 90),
      explode: [0, t.E * 0.6, 0],
    })
  } else {
    parts.push(...tankPipe('gravity', 'Gravity outlet', 'outlet', 1, length / 2 - 60, r * 0.35, p, t.dome + 420, t.E))
  }
  const system = d.systemType === 'direct' ? 'Direct' : d.systemType === 'indirect' ? 'Indirect' : d.systemType === 'gravity' ? 'Gravity' : null
  return {
    match: {
      kind: 'indicative',
      text: 'Indicative shape, no 3D library model',
      note: notes([
        `Tank sized to ${fmt(capacity)} litres${d.capacityLitres === null ? ' until a capacity is chosen' : ''}.`,
        system && `${system} system${pumped ? ' with submersible pump' : ''}.`,
      ]),
    },
    parts,
    libraries: [],
    callouts: [
      { id: 'inlet', title: 'Inlet', detail: 'From downpipes', tone: 'inlet', follows: 'inlet', priority: 9 },
      { id: 'overflow', title: 'Overflow', tone: 'outlet', follows: 'overflow', priority: 8 },
      ...(pumped ? [] : [{ id: 'gravity', title: 'Gravity outlet', tone: 'outlet' as const, follows: 'gravity', priority: 8 }]),
      { id: 'size', title: `${fmt(capacity)} L`, detail: 'Storage', tone: 'info', follows: 'shell', anchor: [length * 0.3, 2 * r, r * 0.5], priority: 5, hideWhenExploded: true },
    ],
    view: { azimuth: 35, elevation: 22 },
  }
}

const LOAD_RATING: Record<string, string> = {
  A15: 'A15 (pedestrian)',
  B125: 'B125 (car parks)',
  C250: 'C250 (kerbside)',
  D400: 'D400 (carriageway)',
  E600: 'E600 (docks)',
  F900: 'F900 (airfields)',
}

function buildDrawpit(d: DrawpitData): Built {
  const length = num(d.lengthMm) ?? 600
  const width = num(d.widthMm) ?? 450
  const depth = num(d.depthMm) ?? 600
  const rings = clamp(Math.round(num(d.ringCount) ?? Math.max(1, Math.round(depth / 150))), 1, 40)
  const ringH = depth / rings
  const wall = 35
  const gap = clamp(Math.min(length, width) * 0.35, 90, 220)
  const parts: ProcPart[] = []
  for (let i = 0; i < rings; i++) {
    parts.push({
      id: `ring-${i + 1}`,
      label: rings > 1 ? `Ring ${i + 1}` : 'Ring',
      role: 'casing',
      geometry: rectRing(length, width, wall, i * ringH, (i + 1) * ringH - 3),
      explode: [0, i * gap, 0],
      labelled: i === 0 || i === rings - 1,
    })
  }
  const top = depth
  parts.push({
    id: 'frame',
    label: 'Cover frame',
    role: 'cover',
    geometry: rectRing(length + 70, width + 70, 60, top, top + 50),
    explode: [0, rings * gap + gap * 0.4, 0],
  })
  const grated = d.coverType === 'grated'
  const lid: THREE.BufferGeometry[] = []
  const lw = length - 2 * wall
  const lz = width - 2 * wall
  if (grated) {
    lid.push(rectRing(lw, lz, 30, top + 5, top + 45))
    for (let z = -lz / 2 + 55; z < lz / 2 - 40; z += 60) lid.push(box(lw - 40, 36, 20, 0, top + 25, z))
  } else {
    lid.push(box(lw, 40, lz, 0, top + 25, 0))
    lid.push(box(lw * 0.3, 8, 30, 0, top + 49, 0))
  }
  parts.push({
    id: 'cover',
    label: grated ? 'Grated cover' : 'Solid cover',
    role: 'cover',
    geometry: merge(lid),
    explode: [0, rings * gap + gap * 1.3, 0],
  })
  return {
    match: {
      kind: 'configured',
      text: CONFIGURED,
      note: notes([
        (!d.lengthMm || !d.widthMm) && 'Showing 600 x 450 mm until dimensions are entered.',
        !d.depthMm && 'Showing 600 mm deep until a depth is entered.',
      ]),
    },
    parts,
    libraries: [],
    callouts: [
      {
        id: 'size',
        title: `${fmt(length)} x ${fmt(width)} mm`,
        detail: `${fmt(depth)} mm deep, ${rings} ring${rings === 1 ? '' : 's'}`,
        tone: 'info',
        follows: 'ring-1',
        anchor: [length / 2, depth * 0.35, width / 2],
        priority: 6,
        hideWhenExploded: true,
      },
      ...(d.loadRating
        ? [{ id: 'load', title: 'Load rating', detail: LOAD_RATING[d.loadRating], tone: 'accent' as const, follows: 'cover', priority: 7 }]
        : []),
    ],
    view: { azimuth: 35, elevation: 28 },
  }
}

function buildRhinoPod(d: RhinoPodData): Built {
  if (d.podType === 'plus') {
    const diameter = d.chamberDiameter ?? 600
    const ch = roundChamber({
      diameter,
      depthToSoffit: 1000,
      sump: 350,
      outlet: DEFAULT_PIPE,
      outletDetail: 'Position and size indicative',
      inlets: [{ n: 1, hour: 6, size: DEFAULT_PIPE, title: 'Inlet' }],
      top: 'cover',
      dimensions: false,
    })
    const callouts = ch.callouts.map((c) =>
      c.id === 'inlet-1' ? { ...c, title: 'Inlet', detail: 'Position and size indicative' } : { ...c, title: 'Outlet' },
    )
    callouts.push({ id: 'pod', title: 'RhinoPod', detail: 'Floats at water level', tone: 'accent', follows: 'pod:casing', priority: 8 })
    return {
      match: {
        kind: 'configured',
        text: 'Chamber built to your diameter',
        note: notes([
          !d.chamberDiameter && 'Showing 600 mm until a diameter is chosen.',
          'RhinoPod from the 3D library, scale indicative. Depth and pipes indicative.',
        ]),
      },
      parts: ch.parts,
      libraries: [{ id: 'pod', url: RHINOPOD.url, position: [0, ch.waterTop - 300, 0], parts: RHINOPOD.parts }],
      callouts,
      view: { azimuth: 30, elevation: 24 },
    }
  }
  return {
    match: {
      kind: 'indicative',
      text: `Library model: ${RHINOPOD.name}`,
      note: notes([
        'Scale indicative.',
        d.retrofitExisting === true && 'Retrofits into an existing catchpit or gully.',
      ]),
    },
    parts: [],
    libraries: [{ id: 'pod', url: RHINOPOD.url, parts: RHINOPOD.parts }],
    callouts: [],
    view: { azimuth: 35, elevation: 20 },
  }
}

function buildFor(state: WizardState): Built | null {
  const pd = state.productData
  if (!pd) return null
  switch (pd.kind) {
    case 'chamber':
      return buildChamber(pd.data)
    case 'catchpit':
      return buildCatchpit(pd.data)
    case 'flow-control':
      return buildFlowControl(pd.data)
    case 'rhinoceptor':
      return buildRhinoceptor(pd.data)
    case 'pump-station':
      return buildPumpStation(pd.data)
    case 'grease-trap':
      return buildGreaseTrap(pd.data)
    case 'grease-separator':
      return buildGreaseSeparator(pd.data)
    case 'rhinopod':
      return buildRhinoPod(pd.data)
    case 'rainwater':
      return buildRainwater(pd.data)
    case 'septic-tank':
      return buildSeptic(pd.data)
    case 'drawpit':
      return buildDrawpit(pd.data)
  }
}

export function buildViewerModel(state: WizardState): ViewerModel | null {
  const built = buildFor(state)
  if (!built || !state.productData) return null
  const parts = built.parts
  return {
    key: `${state.productData.kind}|${JSON.stringify(state.productData.data)}`,
    ...built,
    dispose: () => parts.forEach((p) => p.geometry.dispose()),
  }
}
