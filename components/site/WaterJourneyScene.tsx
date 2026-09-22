'use client'

import { Suspense, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { InkOutlines, TOON, ToonLights, ToonModel, toonRamp, useWaterMaterial } from './three/toon'

/**
 * The home page's scroll scene: the Webflow site's Spline scroll rebuilt
 * in its own toon style (stepped shading, inked outlines) with the real
 * product models from the 3D library.
 *
 * Everything reads one number, `progress` (0 at the top of the journey,
 * 1 at the end), which WaterJourney writes from the page scroll. Nothing
 * re-renders React on scroll: elements read the ref in useFrame and ease
 * towards where they should be.
 *
 *   0.00  droplets gather into the water                (hero)
 *   0.20  storm water and the foul line spiral down     (storm / foul)
 *   0.40  the chamber stacks up around them; autoFlo    (autoFlo)
 *   0.60  the spiral drains into the 5-inlet base; the
 *         camera turns top-down and the inlets light    (multiFlo)
 *   0.80  water branches out to the RHINO range         (all situations)
 */

const MM = 0.0022
const GROUND = -8.6
const LIB = '/models/library/v1'
const PARTS = {
  base: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--base.glb`,
  rim: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--rim.glb`,
  chamber: `${LIB}/rhino-inspection-chamber/rhino-inspection-chamber-sersic600.glb`,
  sudsceptor: `${LIB}/sudsceptor/sudsceptor-sehds1800.glb`,
  maxi: `${LIB}/rhinolift-maxi/parts/rhinolift-maxi1600d--casing.glb`,
  pumpTank: `${LIB}/rhinolift-pump-tank/parts/rhinolift-ps50--casing.glb`,
} as const

export type ProgressRef = MutableRefObject<number>

// ── helpers ─────────────────────────────────────────────────────────

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** 0 before a, 1 after b, eased between. */
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** An overshooting ease for things that pop into place. */
const pop = (t: number) => {
  const c = 1.70158
  const u = t - 1
  return t <= 0 ? 0 : 1 + (c + 1) * u * u * u + c * u * u
}

/** Clock hour to a point seen from above, 12 o'clock = north (-z). */
const clockPoint = (hour: number, r: number, y: number) => {
  const a = (hour / 12) * Math.PI * 2
  return new THREE.Vector3(Math.sin(a) * r, y, -Math.cos(a) * r)
}

/** The water's path: a descending spiral that straightens into the base. */
function waterCurve(phase: number, radius: number) {
  const pts: THREE.Vector3[] = []
  const top = 6.2
  const bottom = -5.2
  const turns = 3.25
  const steps = 160
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * Math.PI * 2 + phase
    // The spiral tightens as it descends, like water finding the drain.
    const r = radius * (1.15 - 0.45 * t)
    pts.push(new THREE.Vector3(Math.cos(a) * r, top + (bottom - top) * t, Math.sin(a) * r))
  }
  pts.push(new THREE.Vector3(0, -6.4, 0), new THREE.Vector3(0, GROUND + 0.75, 0))
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

// ── toon primitives ─────────────────────────────────────────────────

function ToonSolid({ children, color, outline = TOON.ink, thickness = 2.4 }: {
  children: ReactNode; color: string; outline?: string; thickness?: number
}) {
  return (
    <>
      {children}
      <meshToonMaterial color={color} gradientMap={toonRamp()} />
      <InkOutlines thickness={thickness} color={outline} angle={Math.PI / 5} />
    </>
  )
}

/**
 * A tube along a curve, drawn between a head and a tail that both move
 * with progress, so water can arrive and then drain on down the pipe.
 */
function FlowTube({ curve, radius, material, progress, head, tail, outline = TOON.ink, segments = 420 }: {
  curve: THREE.CatmullRomCurve3
  radius: number
  material: THREE.Material
  progress: ProgressRef
  /** Progress range over which the front of the water travels the curve. */
  head: [number, number]
  /** Progress range over which the back of the water follows it. */
  tail?: [number, number]
  outline?: string
  segments?: number
}) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, segments, radius, 14, false), [curve, radius, segments])
  const mesh = useRef<THREE.Mesh>(null)
  const eased = useRef({ head: 0, tail: 0 })
  useFrame((_, dt) => {
    const e = eased.current
    const p = progress.current
    e.head = THREE.MathUtils.damp(e.head, ramp(p, head[0], head[1]), 6, dt)
    e.tail = THREE.MathUtils.damp(e.tail, tail ? ramp(p, tail[0], tail[1]) : 0, 6, dt)
    const perRing = 14 * 6
    const rings = (geo.index?.count ?? 0) / perRing
    const start = Math.floor(rings * e.tail) * perRing
    const end = Math.floor(rings * e.head) * perRing
    geo.setDrawRange(start, Math.max(0, end - start))
    if (mesh.current) mesh.current.visible = end - start > perRing
  })
  return (
    <mesh ref={mesh} geometry={geo} material={material}>
      {/* angle={0} makes the outline share this geometry, and so its draw
          range; a creased copy would ink the whole pipe, drawn or not. */}
      <InkOutlines thickness={2.2} color={outline} angle={0} />
    </mesh>
  )
}

/** Droplets drifting down and gathering into the head of the stream. */
function Droplets({ progress }: { progress: ProgressRef }) {
  const count = 22
  const mesh = useRef<THREE.InstancedMesh>(null)
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: Math.sin(i * 12.9898) * 2.4, z: Math.cos(i * 78.233) * 1.3,
      y: 6.6 + ((i * 37) % 23) / 10, s: 0.05 + ((i * 17) % 7) / 80, v: 0.25 + ((i * 11) % 5) / 12,
    })),
    [],
  )
  const tmp = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const gather = ramp(progress.current, 0, 0.18)
    const gone = ramp(progress.current, 0.14, 0.24)
    m.visible = gone < 0.99
    seeds.forEach((d, i) => {
      const fall = (clock.elapsedTime * d.v * 0.35 + i * 0.13) % 1
      tmp.position.set(d.x * (1 - gather * 0.75), d.y - fall * 1.4 - gather * 0.6, d.z * (1 - gather * 0.75))
      tmp.scale.setScalar(d.s * (1 - gone))
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 18, 12]} />
      <meshToonMaterial color={TOON.water} gradientMap={toonRamp()} />
      <InkOutlines thickness={2} color={TOON.ink} />
    </instancedMesh>
  )
}

/** The corrugated chamber, ring by ring, stacking up around the stream. */
function ChamberRings({ progress }: { progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null)
  const rings = 13
  useFrame(() => {
    const g = group.current
    if (!g) return
    const p = progress.current
    g.children.forEach((ring, i) => {
      const inK = pop(ramp(p, 0.3 + i * 0.009, 0.37 + i * 0.009))
      const outK = 1 - ramp(p, 0.55 + (rings - i) * 0.003, 0.6 + (rings - i) * 0.003)
      const k = Math.max(0, inK * outK)
      ring.visible = k > 0.01
      ring.scale.set(k, k, Math.max(0.01, k))
    })
  })
  return (
    <group ref={group}>
      {Array.from({ length: rings }, (_, i) => (
        <mesh key={i} position={[0, -1.2 - i * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ToonSolid color={i % 4 === 0 ? TOON.accentLight : TOON.body}>
            <torusGeometry args={[1.5, 0.11, 10, 72]} />
          </ToonSolid>
        </mesh>
      ))}
    </group>
  )
}

/** autoFlo: the yellow siphon block riding the stream. */
function AutoFloBlock({ curve, progress }: { curve: THREE.CatmullRomCurve3; progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null)
  const at = useMemo(() => curve.getPointAt(0.34), [curve])
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const p = progress.current
    const k = pop(ramp(p, 0.36, 0.42)) * (1 - ramp(p, 0.54, 0.58))
    g.visible = k > 0.01
    g.scale.setScalar(Math.max(0.001, k))
    g.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.12
  })
  return (
    <group ref={group} position={at}>
      <mesh>
        <ToonSolid color={TOON.yellow} outline="#8a7400">
          <boxGeometry args={[0.46, 0.74, 0.34]} />
        </ToonSolid>
      </mesh>
      <mesh position={[0.3, 0.08, 0]}>
        <ToonSolid color={TOON.yellow} outline="#8a7400">
          <boxGeometry args={[0.16, 0.4, 0.26]} />
        </ToonSolid>
      </mesh>
    </group>
  )
}

/** The 5-inlet base with its clock: 3, 5, 6, 7, 9 in, 12 out. */
function ClockBase({ progress }: { progress: ProgressRef }) {
  const markers = useRef<THREE.Group>(null)
  const hours = [3, 5, 6, 7, 9]
  const top = GROUND + 0.72
  useFrame(() => {
    const g = markers.current
    if (!g) return
    const p = progress.current
    g.children.forEach((m, i) => {
      // Outlet first, then the inlets one after another, like a hand going round.
      const k = i === 0 ? pop(ramp(p, 0.58, 0.61)) : pop(ramp(p, 0.59 + i * 0.012, 0.62 + i * 0.012))
      const settle = 1 - 0.35 * ramp(p, 0.8, 0.9)
      m.visible = k > 0.01
      m.scale.setScalar(Math.max(0.001, k * settle))
    })
  })
  return (
    <group>
      <group position={[0, GROUND, 0]}>
        <ToonModel url={PARTS.base} scale={MM} />
        <ToonModel url={PARTS.rim} scale={MM} roles={{ 'rhino-inspection-chamber-sercic600-5-inlet--rim': 'inlet', rim: 'inlet' }} />
      </group>
      <group ref={markers}>
        <mesh position={clockPoint(0, 1.0, top)}>
          <ToonSolid color={TOON.accent}>
            <sphereGeometry args={[0.13, 20, 14]} />
          </ToonSolid>
        </mesh>
        {hours.map((h) => (
          <mesh key={h} position={clockPoint(h, 1.0, top)}>
            <ToonSolid color={TOON.green} outline="#2f7c3a">
              <sphereGeometry args={[0.1, 20, 14]} />
            </ToonSolid>
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * The range the water branches out to. Sized for presentation, not true
 * relative scale: `span` is the product's largest dimension in mm (from
 * the library manifest) and `size` the stage units it is fitted to.
 */
const LINEUP: { url: string; roles?: Record<string, 'inlet' | 'accent'>; span: number; size: number; x: number; z: number; hour: number }[] = [
  { url: PARTS.pumpTank, span: 5083, size: 4.2, x: -7.4, z: -1.6, hour: 9 },
  { url: PARTS.chamber, roles: { inlet: 'inlet', lid: 'accent' }, span: 1950, size: 3.1, x: -3.7, z: 0.6, hour: 7 },
  { url: PARTS.sudsceptor, roles: { stand: 'inlet', inlet: 'inlet', outlet: 'inlet' }, span: 4290, size: 3.1, x: 3.7, z: 0.6, hour: 5 },
  { url: PARTS.maxi, span: 1500, size: 3.1, x: 7.2, z: -1.6, hour: 3 },
]

function RangeLineup({ progress, water }: { progress: ProgressRef; water: THREE.Material }) {
  const group = useRef<THREE.Group>(null)
  const pipes = useMemo(
    () => LINEUP.map((item) => {
      const start = clockPoint(item.hour, 0.95, GROUND + 0.35)
      const out = clockPoint(item.hour, 2.4, GROUND + 0.35)
      const end = new THREE.Vector3(item.x * 0.82, GROUND + 0.35, item.z)
      return new THREE.CatmullRomCurve3([start, out, new THREE.Vector3((out.x + end.x) / 2, GROUND + 0.6, (out.z + end.z) / 2 + 1.2), end])
    }),
    [],
  )
  useFrame(() => {
    const g = group.current
    if (!g) return
    const p = progress.current
    g.children.forEach((c, i) => {
      // Each product rises into place as its pipe reaches it.
      const k = pop(ramp(p, 0.84 + i * 0.022, 0.9 + i * 0.022))
      c.visible = k > 0.01
      c.position.y = GROUND - (1 - Math.min(1, k)) * 1.2
      c.scale.setScalar((LINEUP[i].size / LINEUP[i].span) * Math.max(0.001, k))
    })
  })
  return (
    <>
      {pipes.map((curve, i) => (
        <FlowTube key={i} curve={curve} radius={0.11} material={water} progress={progress} head={[0.78 + i * 0.02, 0.88 + i * 0.02]} segments={120} />
      ))}
      <group ref={group}>
        {LINEUP.map((item, i) => (
          <group key={i} position={[item.x, GROUND, item.z]}>
            <Suspense fallback={null}>
              <ToonModel url={item.url} roles={item.roles} scale={1} />
            </Suspense>
          </group>
        ))}
      </group>
    </>
  )
}

// ── camera ──────────────────────────────────────────────────────────

/** Camera keyframes: [progress, position, target, up]. */
const SHOTS: [number, [number, number, number], [number, number, number], [number, number, number]][] = [
  [0.0, [1.2, 6.6, 7.5], [0, 5.3, 0], [0, 1, 0]],
  // Storm and foul: the spiral sits right of the copy.
  [0.22, [2.2, 4.4, 6.2], [-1.5, 3.1, 0], [0, 1, 0]],
  [0.42, [0.6, -1.4, 8.4], [0, -2.6, 0], [0, 1, 0]],
  [0.56, [0.2, -3.2, 3.6], [0, -6.6, 0], [0, 1, 0]],
  // Top-down on the base, north up the screen so 12 o'clock is at the top.
  [0.64, [-1.6, GROUND + 5.2, 0.001], [-1.6, GROUND, 0], [0, 0, -1]],
  [0.76, [-1.6, GROUND + 5.2, 0.001], [-1.6, GROUND, 0], [0, 0, -1]],
  [0.92, [0, GROUND + 4.2, 15.5], [0, GROUND + 2.6, 0], [0, 1, 0]],
  [1.0, [0, GROUND + 4.0, 14.5], [0, GROUND + 2.5, 0], [0, 1, 0]],
]

function shotAt(p: number, out: { pos: THREE.Vector3; target: THREE.Vector3; up: THREE.Vector3 }) {
  let i = SHOTS.findIndex((s) => s[0] > p)
  if (i <= 0) i = i === 0 ? 1 : SHOTS.length - 1
  const [p0, a0, t0, u0] = SHOTS[i - 1]
  const [p1, a1, t1, u1] = SHOTS[i]
  const k = ramp(p, p0, p1)
  out.pos.set(...a0).lerp(new THREE.Vector3(...a1), k)
  out.target.set(...t0).lerp(new THREE.Vector3(...t1), k)
  out.up.set(...u0).lerp(new THREE.Vector3(...u1), k).normalize()
}

function CameraRig({ progress }: { progress: ProgressRef }) {
  // Per-frame scratch vectors, kept in a ref so nothing allocates in the loop.
  const scratch = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3() })
  const look = useRef(new THREE.Vector3(0, 5.3, 0))
  useFrame(({ camera, size }, dt) => {
    const want = scratch.current
    shotAt(progress.current, want)
    // Portrait screens: the copy sits over the scene rather than beside
    // it, so shots centre, and the camera pulls back - far enough on the
    // final shot for the whole line-up to fit the width.
    const aspect = size.width / size.height
    if (aspect < 1) {
      want.pos.x -= want.target.x
      want.target.x = 0
      const back = progress.current > 0.8 ? Math.max(1.3, 1.7 / aspect) : 1.3
      want.pos.sub(want.target).multiplyScalar(back).add(want.target)
    }
    camera.position.x = THREE.MathUtils.damp(camera.position.x, want.pos.x, 4, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, want.pos.y, 4, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, want.pos.z, 4, dt)
    look.current.lerp(want.target, 1 - Math.exp(-4 * dt))
    camera.up.lerp(want.up, 1 - Math.exp(-4 * dt)).normalize()
    camera.lookAt(look.current)
  })
  return null
}

/** Contact shadows under the line-up, shown with it. */
function GroundShadow({ progress }: { progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (group.current) group.current.visible = progress.current > 0.8
  })
  return (
    <group ref={group} position={[0, GROUND - 0.01, 0]}>
      <ContactShadows scale={24} width={24} height={10} far={4} blur={2.4} opacity={0.35} color={TOON.ink} frames={1} />
    </group>
  )
}

/** Suspends until every line-up model has loaded. */
function AfterLineupLoads() {
  useGLTF(LINEUP.map((item) => item.url))
  return null
}

// ── scene ───────────────────────────────────────────────────────────

function Journey({ progress }: { progress: ProgressRef }) {
  const water = useWaterMaterial(26)
  const branchWater = useWaterMaterial(8)
  const storm = useMemo(() => waterCurve(0, 1.0), [])
  const foul = useMemo(() => waterCurve(Math.PI * 0.55, 1.22), [])
  const foulMat = useMemo(() => new THREE.MeshToonMaterial({ color: TOON.red, gradientMap: toonRamp() }), [])
  return (
    <>
      <CameraRig progress={progress} />
      <ToonLights />
      <Droplets progress={progress} />
      {/* The spiral fills from the top, then drains on down into the base. */}
      <FlowTube curve={storm} radius={0.16} material={water} progress={progress} head={[0.02, 0.58]} tail={[0.44, 0.66]} />
      <FlowTube curve={foul} radius={0.035} material={foulMat} outline="#7a2524" progress={progress} head={[0.05, 0.56]} tail={[0.44, 0.62]} />
      <ChamberRings progress={progress} />
      <AutoFloBlock curve={storm} progress={progress} />
      {/* Separate boundaries so each model appears as soon as it has loaded,
          rather than the slowest one holding back the rest on a phone. */}
      <Suspense fallback={null}>
        <ClockBase progress={progress} />
      </Suspense>
      <RangeLineup progress={progress} water={branchWater} />
      {/* The shadow is baked once, so it waits for every model it is cast by. */}
      <Suspense fallback={null}>
        <AfterLineupLoads />
        <GroundShadow progress={progress} />
      </Suspense>
    </>
  )
}

export default function WaterJourneyScene({ progress }: { progress: ProgressRef }) {
  return (
    <Canvas
      flat
      camera={{ position: [1.2, 6.6, 7.5], fov: 38, near: 0.05, far: 200 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Journey progress={progress} />
    </Canvas>
  )
}

Object.values(PARTS).forEach((url) => useGLTF.preload(url))
