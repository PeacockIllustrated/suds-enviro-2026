'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { InkOutlines, toonRamp, useWaterMaterial } from '@/components/site/three/toon'
import { ART, InkBox, InkSlab, LINE, Panels, Paper, type Rect } from '@/components/site/explorer/lineArt'
import { Car, Poplars } from '@/components/site/explorer/Buildings'

/**
 * The water journey's scenery, and only its scenery: the house, garden,
 * drive, road, car park, lawn, trees, cloud and rain, the river and its
 * headwall, and the ground slab cut in section under all of it.
 *
 * This file is the one adapter between the journey and whichever line-art
 * kit draws the world. Everything here is built from the Site Explorer's
 * line-art primitives (white volumes, thin site-blue ink, pale blue
 * glazing), so the two pages read as one drawing. To move the journey onto
 * another kit, change the bodies of these components and keep their props:
 * nothing else in the journey draws scenery.
 *
 * Units are metres. The ground surface is y = 0 away from the river, the
 * section cut is the plane z = 0 and the site runs back towards -z.
 */

export type Vec3 = [number, number, number]

/** A point on the ground profile along the cut: [x, y]. */
export type ProfilePoint = [number, number]

/** How the top of the ground is finished between two x positions. */
export type SurfaceKind = 'paving' | 'road' | 'grass'

export interface SurfaceSpan {
  from: number
  to: number
  kind: SurfaceKind
}

/** A small seeded random source, so scattered details land the same every time. */
function random(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

// ── the ground slab ─────────────────────────────────────────────────

/** Surfacing, then two soil bands; the third band runs to the slab bottom. */
const BANDS = [0.35, 1.35, 3.75] as const
const TOPSOIL = '#8c6a48'
const TOPSOIL_INK = '#5e3d22'

/** The profile clipped to [from, to], with its ends interpolated. */
function clipProfile(profile: ProfilePoint[], from: number, to: number): ProfilePoint[] {
  const out: ProfilePoint[] = []
  const at = (x: number): number => {
    for (let i = 1; i < profile.length; i++) {
      const [ax, ay] = profile[i - 1]
      const [bx, by] = profile[i]
      if (x >= ax && x <= bx && bx > ax) return ay + ((x - ax) / (bx - ax)) * (by - ay)
    }
    return profile[profile.length - 1][1]
  }
  out.push([from, at(from)])
  profile.forEach(([x, y]) => {
    if (x > from && x < to) out.push([x, y])
  })
  out.push([to, at(to)])
  return out
}

/** A band of the slab between `top` and `bottom` metres under the profile (or down to `floor`). */
function bandShape(line: ProfilePoint[], top: number, bottom: number | null, floor: number): THREE.Shape {
  const upper = line.map(([x, y]) => new THREE.Vector2(x, y - top))
  const lower = line.map(([x, y]) => new THREE.Vector2(x, bottom === null ? floor : y - bottom)).reverse()
  return new THREE.Shape([...upper, ...lower])
}

function Band({ shape, back, front, top, ink }: { shape: THREE.Shape; back: number; front: string; top: string; ink: string }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, { depth: -back, bevelEnabled: false, steps: 1 }), [shape, back])
  const materials = useMemo(() => {
    const mat = (color: string) =>
      new THREE.MeshBasicMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
    // Extrusion groups: 0 is the two caps (the section face), 1 the sides (the top).
    return [mat(front), mat(top)]
  }, [front, top])
  return (
    <mesh geometry={geometry} material={materials} position={[0, 0, back]}>
      <Edges color={ink} lineWidth={LINE} threshold={20} />
    </mesh>
  )
}

/** Pebbles in the section face, so the soil reads as soil. */
function SoilSpecks({ profile, depth }: { profile: ProfilePoint[]; depth: number }) {
  const geometry = useMemo(() => {
    const pos: number[] = []
    const x0 = profile[0][0]
    const x1 = profile[profile.length - 1][0]
    const line = clipProfile(profile, x0, x1)
    const surface = (x: number) => {
      for (let i = 1; i < line.length; i++) {
        const [ax, ay] = line[i - 1]
        const [bx, by] = line[i]
        if (x >= ax && x <= bx && bx > ax) return ay + ((x - ax) / (bx - ax)) * (by - ay)
      }
      return 0
    }
    const rand = random(11)
    const count = Math.round((x1 - x0) * 4.5)
    for (let i = 0; i < count; i++) {
      const x = x0 + 0.3 + rand() * (x1 - x0 - 0.6)
      const top = surface(x) - BANDS[0] - 0.25
      const y = top - rand() * (top + depth - 0.3)
      const w = 0.1 + rand() * 0.2
      const h = w * (0.45 + rand() * 0.3)
      pos.push(x - w / 2, y, 0.004, x + w / 2, y, 0.004, x, y + h, 0.004)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [profile, depth])
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={ART.soilInk} transparent opacity={0.3} />
    </mesh>
  )
}

const SURFACE_STYLE: Record<SurfaceKind, { front: string; top: string; ink: string }> = {
  paving: { front: ART.asphalt, top: ART.ground, ink: ART.asphaltInk },
  road: { front: ART.asphalt, top: '#5a5b5e', ink: ART.asphaltInk },
  grass: { front: TOPSOIL, top: ART.grass, ink: TOPSOIL_INK },
}

/**
 * The ground under the whole journey, cut open along z = 0: a surfacing
 * layer (paving, road or topsoil under grass) over three soil bands, all
 * following the ground profile, so the slab steps down to the river.
 */
export function JourneyGround({ profile, surfaces, depth, back }: {
  profile: ProfilePoint[]
  surfaces: SurfaceSpan[]
  depth: number
  back: number
}) {
  const shapes = useMemo(() => {
    const x0 = profile[0][0]
    const x1 = profile[profile.length - 1][0]
    const whole = clipProfile(profile, x0, x1)
    return {
      surfacing: surfaces.map((s) => ({ key: `${s.from}-${s.kind}`, kind: s.kind, shape: bandShape(clipProfile(profile, s.from, s.to), 0, BANDS[0], -depth) })),
      bands: [
        bandShape(whole, BANDS[0], BANDS[1], -depth),
        bandShape(whole, BANDS[1], BANDS[2], -depth),
        bandShape(whole, BANDS[2], null, -depth),
      ],
    }
  }, [profile, surfaces, depth])
  return (
    <group>
      {shapes.surfacing.map(({ key, kind, shape }) => (
        <Band key={key} shape={shape} back={back} {...SURFACE_STYLE[kind]} />
      ))}
      {shapes.bands.map((shape, i) => (
        <Band key={i} shape={shape} back={back} front={ART.soil[i]} top={ART.soil[i]} ink={ART.soilInk} />
      ))}
      <SoilSpecks profile={profile} depth={depth} />
    </group>
  )
}

// ── the house ───────────────────────────────────────────────────────

const HOUSE_FRONT: Rect[] = [
  [0.9, 0.9, 1.9, 1.4],
  [7.2, 0.9, 1.9, 1.4],
  [0.9, 3.4, 1.9, 1.35],
  [4.05, 3.4, 1.9, 1.35],
  [7.2, 3.4, 1.9, 1.35],
]
const HOUSE_DOOR: Rect[] = [[4.35, 0, 1.3, 2.3]]
const HOUSE_SIDE: Rect[] = [
  [1.6, 0.9, 1.6, 1.4],
  [1.6, 3.4, 1.6, 1.35],
  [4.4, 3.4, 1.6, 1.35],
]

/** A pitched roof over a w x d plan, ridge along x, from the eaves at y = 0. */
function Roof({ width, depth, rise }: { width: number; depth: number; rise: number }) {
  const geometry = useMemo(() => {
    const half = depth / 2 + 0.35
    const shape = new THREE.Shape()
    shape.moveTo(-half, 0)
    shape.lineTo(half, 0)
    shape.lineTo(0, rise)
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: width + 0.6, bevelEnabled: false })
    g.translate(0, 0, -(width + 0.6) / 2)
    return g
  }, [width, depth, rise])
  return (
    <mesh geometry={geometry} rotation={[0, Math.PI / 2, 0]}>
      <Paper color="#eef5fa" />
      <Edges color={ART.ink} lineWidth={LINE} threshold={20} />
    </mesh>
  )
}

/** Where the house's gutter runs and its downpipe drops, for the drainage. */
export const HOUSE = { width: 10, depth: 7, eaves: 5.6 } as const

/**
 * A two-storey detached house. `position` is the bottom-left corner of its
 * front wall; the house runs to +x and back to -z. The gutter along the
 * front eaves is drawn by the drainage, not here.
 */
export function JourneyHouse({ position }: { position: Vec3 }) {
  const { width, depth, eaves } = HOUSE
  return (
    <group position={position}>
      <InkSlab from={[0, 0, -depth]} to={[width, eaves, 0]} />
      <group position={[width / 2, eaves, -depth / 2]}>
        <Roof width={width} depth={depth} rise={2.9} />
      </group>
      <InkSlab from={[width - 2.4, eaves + 1.2, -depth / 2 - 1.2]} to={[width - 1.5, eaves + 3.4, -depth / 2 - 0.3]} />
      <Panels rects={HOUSE_FRONT} position={[0, 0, 0.015]} />
      <Panels rects={HOUSE_DOOR} position={[0, 0, 0.02]} color={ART.paper} />
      <Panels rects={HOUSE_SIDE} position={[width + 0.015, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <InkSlab from={[4.1, 2.45, 0]} to={[5.9, 2.6, 0.8]} />
    </group>
  )
}

// ── garden, drive, road, car park, lawn ─────────────────────────────

const FENCE_BOARDS: Rect[] = Array.from({ length: 11 }, (_, i) => [0.02 + i * 0.16, 0.05, 0.14, 1.1] as Rect)

function FencePanel({ position, turn = 0 }: { position: Vec3; turn?: number }) {
  return (
    <group position={position} rotation={[0, turn, 0]}>
      <InkBox position={[0.9, 0.6, 0]} size={[1.8, 1.2, 0.06]} color={ART.timber} ink={ART.timberInk} />
      <Panels rects={FENCE_BOARDS} position={[0, 0, 0.035]} color={ART.timber} ink={ART.timberInk} />
      <InkBox position={[0, 0.65, 0]} size={[0.12, 1.3, 0.12]} color={ART.timber} ink={ART.timberInk} />
    </group>
  )
}

/** A back garden: a timber fence down its far side, from x `from` to `to`. */
export function JourneyGarden({ from, to, back }: { from: number; to: number; back: number }) {
  const panels = useMemo(() => {
    const out: number[] = []
    for (let z = -1.2; z > back; z -= 1.8) out.push(z)
    return out
  }, [back])
  return (
    <group>
      {panels.map((z) => (
        <FencePanel key={z} position={[to - 0.1, 0, z]} turn={Math.PI / 2} />
      ))}
      {/* A flower bed and a bench, to say garden. */}
      <InkSlab from={[from + 0.6, 0, -2.2]} to={[from + 3.6, 0.12, -1.2]} color="#e9dcc5" ink={ART.timberInk} />
      <InkSlab from={[to - 2.8, 0.42, -4.6]} to={[to - 1.2, 0.5, -4.1]} color={ART.timber} ink={ART.timberInk} />
      <InkSlab from={[to - 2.7, 0, -4.5]} to={[to - 2.55, 0.42, -4.2]} color={ART.timber} ink={ART.timberInk} />
      <InkSlab from={[to - 1.45, 0, -4.5]} to={[to - 1.3, 0.42, -4.2]} color={ART.timber} ink={ART.timberInk} />
    </group>
  )
}

/** A paved drive with a car on it, from x `from` to `to`. */
export function JourneyDrive({ from, to }: { from: number; to: number }) {
  const setts: Rect[] = useMemo(() => [[0, 0, to - from, 0.25]], [from, to])
  return (
    <group>
      <Panels rects={setts} position={[from, 0.012, -0.05]} rotation={[-Math.PI / 2, 0, 0]} color="#dfe6ea" ink={ART.ink} />
      <Car position={[(from + to) / 2, 0, -4.2]} turn={Math.PI / 2} />
    </group>
  )
}

/**
 * A two-lane road crossing the section, from x `from` to `to`, with kerbs,
 * footways, a centre line and a gully grating in the kerb at `gullyX`.
 */
export function JourneyRoad({ from, to, back, gullyX }: { from: number; to: number; back: number; gullyX: number }) {
  const mid = (from + to) / 2
  const dashes = useMemo(() => {
    const out: Rect[] = []
    for (let z = 0.6; z < -back - 1; z += 3) out.push([-0.06, z, 0.12, 1.6])
    return out
  }, [back])
  const bars = useMemo(() => Array.from({ length: 5 }, (_, i) => [0.06 + i * 0.1, 0.05, 0.05, 0.5] as Rect), [])
  return (
    <group>
      {/* Kerbs, a little proud of the road. */}
      <InkSlab from={[from, 0, back]} to={[from + 0.25, 0.14, 0]} />
      <InkSlab from={[to - 0.25, 0, back]} to={[to, 0.14, 0]} />
      <Panels rects={dashes} position={[mid, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} color={ART.paper} ink={ART.paper} />
      {/* Gully grating in the channel by the kerb. */}
      <group position={[gullyX - 0.3, 0.012, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <Panels rects={[[0, 0, 0.6, 0.6]]} position={[0, 0, 0]} color={ART.asphaltInk} ink={ART.asphaltInk} />
        <Panels rects={bars} position={[0, 0, 0.002]} color="#8a8c90" ink="#8a8c90" />
      </group>
      <Car position={[mid - 1.8, 0, -9]} turn={Math.PI / 2} color="#e7f1f8" />
      <Car position={[mid + 1.8, 0, -16]} turn={-Math.PI / 2} />
    </group>
  )
}

function LampPost({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <InkSlab from={[-0.08, 0, -0.08]} to={[0.08, 5.2, 0.08]} />
      <InkSlab from={[-0.08, 5.05, -0.08]} to={[0.9, 5.2, 0.08]} />
      <InkSlab from={[0.55, 4.95, -0.14]} to={[1.05, 5.05, 0.14]} color={ART.glass} />
    </group>
  )
}

/** A surface car park from x `from` to `to`: bay lines, parked cars and lighting. */
export function JourneyCarPark({ from, to, back }: { from: number; to: number; back: number }) {
  const bays = useMemo(() => {
    const out: Rect[] = []
    for (let x = from + 0.6; x <= to - 0.6; x += 2.5) {
      out.push([x - from, 1.4, 0.1, 4.8])
      out.push([x - from, 10.4, 0.1, 4.8])
    }
    return out
  }, [from, to])
  const cars = useMemo(() => {
    const spots: { x: number; z: number; color: string }[] = []
    let k = 0
    for (let x = from + 1.85; x < to - 1; x += 2.5) {
      k++
      if (k % 3 !== 2) spots.push({ x, z: -3.8, color: k % 2 ? ART.paper : '#e7f1f8' })
      if (k % 4 !== 1) spots.push({ x, z: -12.8, color: k % 2 ? '#e7f1f8' : ART.paper })
    }
    return spots
  }, [from, to])
  return (
    <group>
      <Panels rects={bays} position={[from, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} color={ART.ink} />
      {cars.map((c) => (
        <Car key={`${c.x}-${c.z}`} position={[c.x, 0, c.z]} turn={Math.PI / 2} color={c.color} />
      ))}
      <LampPost position={[from + 0.6, 0, -8.3]} />
      <LampPost position={[to - 1.6, 0, -8.3]} />
      {/* A low wall along the back of the car park. */}
      <InkSlab from={[from, 0, back + 3.4]} to={[to, 0.8, back + 3.1]} />
    </group>
  )
}

/** Trees, as the Site Explorer's poplars, at [x, z] spots on flat ground. */
export function JourneyTrees({ spots }: { spots: [number, number][] }) {
  return <Poplars spots={spots} />
}

/** A single tree at any height, for sloping ground and river banks. */
export function JourneyTree({ position, height = 1 }: { position: Vec3; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 1.4, 8]} />
        <meshBasicMaterial color={ART.trunk} />
      </mesh>
      <mesh position={[0, 1.3 + 2.6 * height, 0]} scale={[0.95, 2.6 * height, 0.95]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshToonMaterial color={ART.tree} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.4} color={ART.treeInk} />
      </mesh>
    </group>
  )
}

/** A car, nose towards +x. */
export function JourneyCar({ position, turn = 0, color }: { position: Vec3; turn?: number; color?: string }) {
  return <Car position={position} turn={turn} color={color} />
}

// ── weather ─────────────────────────────────────────────────────────

const PUFFS: { p: Vec3; r: number }[] = [
  { p: [-2.2, 0, 0], r: 1.25 },
  { p: [-0.6, 0.55, 0.2], r: 1.65 },
  { p: [1.3, 0.35, -0.1], r: 1.45 },
  { p: [2.8, -0.05, 0.1], r: 1.05 },
  { p: [0.4, -0.35, 0.8], r: 1.1 },
]

/** A line-art cloud: white puffs inked in site blue, flat underneath. */
export function JourneyCloud({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      {PUFFS.map(({ p, r }, i) => (
        <mesh key={i} position={p} scale={[r, r * 0.82, r]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color="#ffffff" />
          <InkOutlines thickness={1.6} color={ART.ink} />
        </mesh>
      ))}
      <InkBox position={[0.3, -0.62, 0.1]} size={[5.6, 0.05, 1.8]} color="#ffffff" ink="#ffffff" />
    </group>
  )
}

/**
 * Rain falling from `top` to `bottom` over a patch `size` wide (x) and
 * deep (z), as short site-blue streaks. Still under reduced motion.
 */
export function JourneyRain({ centre, size, top, bottom, animate }: {
  centre: [number, number]
  size: [number, number]
  top: number
  bottom: number
  animate: boolean
}) {
  const count = 150
  const ref = useRef<THREE.LineSegments>(null)
  const seeds = useMemo(() => {
    const rand = random(5)
    return Array.from({ length: count }, () => ({
      x: centre[0] + (rand() - 0.5) * size[0],
      z: centre[1] + (rand() - 0.5) * size[1],
      phase: rand(),
      speed: 0.8 + rand() * 0.4,
    }))
  }, [centre, size])
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(count * 6), 3))
    return g
  }, [])
  const time = useRef(0)
  const place = (t: number) => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const span = top - bottom
    seeds.forEach((s, i) => {
      const y = top - (((s.phase + t * s.speed * 0.9) % 1) * span)
      attr.setXYZ(i * 2, s.x, y, s.z)
      attr.setXYZ(i * 2 + 1, s.x - 0.05, y - 0.42, s.z)
    })
    attr.needsUpdate = true
    geometry.computeBoundingSphere()
  }
  useLayoutEffect(() => {
    place(0)
  })
  useFrame((_, dt) => {
    if (!animate) return
    time.current += Math.min(dt, 0.1)
    place(time.current)
  })
  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={ART.glassInk} transparent opacity={0.85} />
    </lineSegments>
  )
}

// ── the river ───────────────────────────────────────────────────────

/** The part of the profile below `level`, closed along the water line. */
function waterShape(profile: ProfilePoint[], level: number): THREE.Shape | null {
  const pts: THREE.Vector2[] = []
  for (let i = 1; i < profile.length; i++) {
    const [ax, ay] = profile[i - 1]
    const [bx, by] = profile[i]
    if (ay < level) pts.push(new THREE.Vector2(ax, ay))
    if ((ay < level) !== (by < level)) {
      const t = (level - ay) / (by - ay)
      pts.push(new THREE.Vector2(ax + (bx - ax) * t, level))
    }
  }
  return pts.length > 2 ? new THREE.Shape(pts) : null
}

/**
 * The river running across the site (along z) in the channel the ground
 * profile cuts, filled to `level`: a cut water section at the front, a
 * flowing surface, and reeds along both edges.
 */
export function JourneyRiver({ profile, level, back }: {
  profile: ProfilePoint[]
  level: number
  back: number
}) {
  const shape = useMemo(() => waterShape(profile, level), [profile, level])
  const geometry = useMemo(
    () => (shape ? new THREE.ExtrudeGeometry(shape, { depth: -back, bevelEnabled: false }) : null),
    [shape, back],
  )
  const span = useMemo(() => {
    if (!shape) return [0, 0] as [number, number]
    const xs = shape.getPoints().map((p) => p.x)
    return [Math.min(...xs), Math.max(...xs)] as [number, number]
  }, [shape])
  const flow = useWaterMaterial(26)
  const cut = useMemo(() => new THREE.MeshBasicMaterial({ color: '#bfe3f5', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }), [])
  const reeds = useMemo(() => {
    const out: Vec3[] = []
    const rand = random(3)
    // Clumps of three along both edges, a few metres apart.
    for (let z = -1.2; z > back + 1.5; z -= 2.2 + rand() * 1.6) {
      const edges = [span[0] + 0.25 + rand() * 0.3, span[1] - 0.3 - rand() * 0.5]
      edges.forEach((x) => {
        for (let k = 0; k < 3; k++) out.push([x + (k - 1) * 0.12, level, z + (rand() - 0.5) * 0.3])
      })
    }
    return out
  }, [span, level, back])
  if (!geometry) return null
  const width = span[1] - span[0]
  return (
    <group>
      <mesh geometry={geometry} material={[cut, cut]} position={[0, 0, back]}>
        <Edges color={ART.glassInk} lineWidth={LINE} threshold={20} />
      </mesh>
      {/* The surface, streaking downstream (towards -z). */}
      <group position={[(span[0] + span[1]) / 2, level + 0.006, back / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} material={flow}>
          <planeGeometry args={[-back, width]} />
        </mesh>
      </group>
      {reeds.map((p, i) => (
        <InkSlab key={i} from={[p[0] - 0.025, p[1], p[2] - 0.025]} to={[p[0] + 0.025, p[1] + 0.45 + (i % 3) * 0.18, p[2] + 0.025]} color={ART.grassInk} ink={ART.treeInk} />
      ))}
    </group>
  )
}

/**
 * A concrete outfall headwall on the river bank at `x`: a wall from the
 * river bed up to `top`, with wing walls back into the bank. The outfall
 * pipe passes through it at the cut.
 */
export function JourneyHeadwall({ x, top, bottom }: { x: number; top: number; bottom: number }) {
  return (
    <group>
      <InkSlab from={[x - 0.5, bottom, -2.6]} to={[x + 0.05, top, 0.4]} color={ART.paperShade} />
      <InkSlab from={[x - 0.6, top, -2.7]} to={[x + 0.12, top + 0.16, 0.5]} color={ART.paperShade} />
      {/* Apron on the river bed, where the outfall lands. */}
      <InkSlab from={[x + 0.05, bottom - 0.05, -2.6]} to={[x + 1.3, bottom + 0.1, 0.4]} color="#e1e8ec" />
    </group>
  )
}
