'use client'

import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The home page's scroll scene, rebuilt from the Webflow site's Spline
 * scroll (see reference/webflow/SPLINE.md) as line art in the site palette.
 *
 * Everything is driven by one number, `progress` (0 at the top of the
 * journey, 1 at the end), which WaterJourney writes from the page scroll.
 * Nothing here re-renders React on scroll; each element reads the ref in
 * useFrame and eases towards where it should be.
 *
 * Beats, in the order the copy runs:
 *   0.00  droplets gather into the water tube            (hero)
 *   0.20  storm tube and foul line spiral down together  (storm / foul)
 *   0.40  they pass through the chamber, autoFlo rides   (autoFlo)
 *   0.60  top-down onto the 5-inlet base, the clock      (multiFlo)
 *   0.80  water branches out to the RHINO range          (all situations)
 *
 * Product geometry is the real 3D library (public/models/library/v1),
 * drawn as edges over a pale translucent fill.
 */

const C = {
  blue: '#1d80b9',
  blueDark: '#005576',
  blueLight: '#afdbf4',
  green: '#54b54d',
  red: '#c34c4a',
  yellow: '#ffe313',
} as const

// Library models are in millimetres; this puts a 2 m product at ~4.4 units.
const MM = 0.0022
const GROUND = -8.6
const LIB = '/models/library/v1'
const PARTS = {
  base: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--base.glb`,
  rim: `${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--rim.glb`,
  chamber: `${LIB}/rhino-inspection-chamber/parts/rhino-inspection-chamber-sersic600--body.glb`,
  chamberInlet: `${LIB}/rhino-inspection-chamber/parts/rhino-inspection-chamber-sersic600--inlet.glb`,
  sudsceptor: `${LIB}/sudsceptor/parts/sudsceptor-sehds1800--casing.glb`,
  sudsceptorStand: `${LIB}/sudsceptor/parts/sudsceptor-sehds1800--stand.glb`,
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

/** Clock hour to a point on a circle seen from above, 12 o'clock = north (-z). */
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
  pts.push(new THREE.Vector3(0, -6.4, 0), new THREE.Vector3(0, GROUND + 0.9, 0))
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

// ── materials, shared ───────────────────────────────────────────────

function useMaterials() {
  return useMemo(
    () => ({
      fill: new THREE.MeshBasicMaterial({
        color: C.blueLight, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide,
      }),
      line: new THREE.LineBasicMaterial({ color: C.blue, transparent: true, opacity: 0.9 }),
      lineGreen: new THREE.LineBasicMaterial({ color: C.green, transparent: true, opacity: 0.95 }),
      water: new THREE.MeshStandardMaterial({
        color: C.blueLight, emissive: C.blue, emissiveIntensity: 0.12,
        roughness: 0.15, metalness: 0, transparent: true, opacity: 0.72,
      }),
      foul: new THREE.MeshBasicMaterial({ color: C.red }),
      amber: new THREE.MeshBasicMaterial({
        color: C.yellow, transparent: true, opacity: 0.45, depthWrite: false,
      }),
      amberLine: new THREE.LineBasicMaterial({ color: '#c9b000' }),
      marker: new THREE.MeshBasicMaterial({ color: C.green }),
      outlet: new THREE.MeshBasicMaterial({ color: C.blue }),
    }),
    [],
  )
}
type Materials = ReturnType<typeof useMaterials>

/** Fade every material under a group; line art reads as drawn in. */
function setGroupOpacity(group: THREE.Object3D, k: number) {
  group.visible = k > 0.002
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material
    if (!m || Array.isArray(m)) return
    // Each material remembers its authored opacity the first time through.
    if (typeof m.userData.base !== 'number') m.userData.base = m.opacity
    m.opacity = (m.userData.base as number) * k
  })
}

// ── scene elements ──────────────────────────────────────────────────

/** A tube along the water path that grows with progress. */
function GrowingTube({ curve, radius, material, progress, from, to }: {
  curve: THREE.CatmullRomCurve3; radius: number; material: THREE.Material
  progress: ProgressRef; from: number; to: number
}) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 420, radius, 12, false), [curve, radius])
  const shown = useRef(0)
  useFrame((_, dt) => {
    const target = ramp(progress.current, from, to)
    shown.current = THREE.MathUtils.damp(shown.current, target, 6, dt)
    const count = geo.index ? geo.index.count : 0
    // Draw whole rings of the tube so the growing end stays clean.
    const perSegment = 12 * 6
    geo.setDrawRange(0, Math.floor((count * shown.current) / perSegment) * perSegment)
  })
  return <mesh geometry={geo} material={material} />
}

/** Droplets that drift down and gather into the start of the tube. */
function Droplets({ progress }: { progress: ProgressRef }) {
  const count = 26
  const mesh = useRef<THREE.InstancedMesh>(null)
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      x: Math.sin(i * 12.9898) * 2.2, z: Math.cos(i * 78.233) * 1.2,
      y: 6.4 + ((i * 37) % 23) / 10, s: 0.035 + ((i * 17) % 7) / 90, v: 0.25 + ((i * 11) % 5) / 12,
    })),
    [],
  )
  const tmp = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const fade = 1 - ramp(progress.current, 0.12, 0.26)
    m.visible = fade > 0.01
    const material = m.material as THREE.MeshBasicMaterial
    material.opacity = 0.55 * fade
    seeds.forEach((d, i) => {
      const fall = (clock.elapsedTime * d.v * 0.4 + i * 0.13) % 1
      const pull = ramp(progress.current, 0, 0.18)
      tmp.position.set(d.x * (1 - pull * 0.7), d.y - fall * 1.6, d.z * (1 - pull * 0.7))
      tmp.scale.setScalar(d.s)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 8]} />
      <meshBasicMaterial color={C.blue} transparent opacity={0.55} />
    </instancedMesh>
  )
}

/** The corrugated chamber the water falls through: stacked flat rings. */
function ChamberRings({ progress, mats }: { progress: ProgressRef; mats: Materials }) {
  const group = useRef<THREE.Group>(null)
  const rings = 13
  const geo = useMemo(() => new THREE.TorusGeometry(1.45, 0.07, 6, 64), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 25), [geo])
  useFrame(() => {
    const g = group.current
    if (!g) return
    const p = progress.current
    g.children.forEach((ring, i) => {
      // Rings arrive top first, then clear away before the top-down view.
      const inK = ramp(p, 0.3 + i * 0.008, 0.4 + i * 0.008)
      const outK = 1 - ramp(p, 0.56, 0.62)
      const k = inK * outK
      ring.scale.set(1, 1, 1).multiplyScalar(0.85 + 0.15 * k)
      setGroupOpacity(ring, k)
    })
  })
  return (
    <group ref={group}>
      {Array.from({ length: rings }, (_, i) => (
        <group key={i} position={[0, -1.2 - i * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={geo} material={mats.fill.clone()} />
          <lineSegments geometry={edges} material={mats.line.clone()} />
        </group>
      ))}
    </group>
  )
}

/** autoFlo: the amber siphon block riding the stream. */
function AutoFloBlock({ curve, progress, mats }: { curve: THREE.CatmullRomCurve3; progress: ProgressRef; mats: Materials }) {
  const group = useRef<THREE.Group>(null)
  const geo = useMemo(() => new THREE.BoxGeometry(0.42, 0.7, 0.3), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo])
  const at = useMemo(() => curve.getPointAt(0.34), [curve])
  useFrame(() => {
    const g = group.current
    if (!g) return
    const k = ramp(progress.current, 0.36, 0.44) * (1 - ramp(progress.current, 0.55, 0.6))
    setGroupOpacity(g, k)
  })
  return (
    <group ref={group} position={at}>
      <mesh geometry={geo} material={mats.amber.clone()} />
      <lineSegments geometry={edges} material={mats.amberLine.clone()} />
    </group>
  )
}

/** A library part drawn as edges over a translucent fill. */
function LinePart({ url, accent = false, mats }: { url: string; accent?: boolean; mats: Materials }) {
  const { scene } = useGLTF(url)
  const drawn = useMemo(() => {
    const out = new THREE.Group()
    scene.updateMatrixWorld(true)
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      // Library meshes use quantised (16-bit normalised) positions; the
      // node transform undoes that. Bake it into float positions, or the
      // transform would be clipped back into the integer range.
      const src = mesh.geometry.getAttribute('position')
      const pos = new Float32Array(src.count * 3)
      for (let i = 0; i < src.count; i++) {
        pos[i * 3] = src.getX(i)
        pos[i * 3 + 1] = src.getY(i)
        pos[i * 3 + 2] = src.getZ(i)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      if (mesh.geometry.index) g.setIndex(mesh.geometry.index.clone())
      g.applyMatrix4(mesh.matrixWorld)
      out.add(new THREE.Mesh(g, mats.fill.clone()))
      out.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 32), (accent ? mats.lineGreen : mats.line).clone()))
    })
    return out
  }, [scene, accent, mats])
  return <primitive object={drawn} />
}

/** The 5-inlet base with its clock markers: 3, 5, 6, 7, 9 in, 12 out. */
function ClockBase({ progress, mats }: { progress: ProgressRef; mats: Materials }) {
  const markers = useRef<THREE.Group>(null)
  const hours = [3, 5, 6, 7, 9]
  const top = GROUND + 0.72
  useFrame(() => {
    const g = markers.current
    if (!g) return
    const p = progress.current
    g.children.forEach((m, i) => {
      // Inlets light one after another, like hands going round.
      const k = i === 0 ? ramp(p, 0.58, 0.61) : ramp(p, 0.59 + i * 0.012, 0.62 + i * 0.012)
      m.scale.setScalar(0.001 + k * (1 - 0.3 * ramp(p, 0.8, 0.9)))
    })
  })
  return (
    <group>
      <group scale={MM} position={[0, GROUND, 0]}>
        <LinePart url={PARTS.base} mats={mats} />
        <LinePart url={PARTS.rim} accent mats={mats} />
      </group>
      <group ref={markers}>
        <mesh position={clockPoint(0, 0.95, top)} material={mats.outlet}>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
        {hours.map((h) => (
          <mesh key={h} position={clockPoint(h, 0.95, top)} material={mats.marker}>
            <sphereGeometry args={[0.08, 16, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** The range the water branches out to, and the pipes that feed it. */
// Presentation sizes, not true relative scale: a 4.3 m SudSceptor beside a
// 1.5 m MAXI would dwarf it. `span` is the product's largest dimension in
// mm (from the library manifest) and `size` the stage units it is fitted
// to. The pump tank lies long, so it gets a little more room.
const LINEUP: { url: string; accent?: string; span: number; size: number; x: number; z: number; hour: number }[] = [
  { url: PARTS.pumpTank, span: 5083, size: 4.2, x: -7.4, z: -1.6, hour: 9 },
  { url: PARTS.chamber, accent: PARTS.chamberInlet, span: 1950, size: 3.1, x: -3.7, z: 0.6, hour: 7 },
  { url: PARTS.sudsceptor, accent: PARTS.sudsceptorStand, span: 4290, size: 3.1, x: 3.7, z: 0.6, hour: 5 },
  { url: PARTS.maxi, span: 1500, size: 3.1, x: 7.2, z: -1.6, hour: 3 },
]

function RangeLineup({ progress, mats }: { progress: ProgressRef; mats: Materials }) {
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
    g.children.forEach((c, i) => setGroupOpacity(c, ramp(p, 0.82 + i * 0.025, 0.9 + i * 0.025)))
  })
  return (
    <>
      {pipes.map((curve, i) => (
        <GrowingTube key={i} curve={curve} radius={0.1} material={mats.water} progress={progress} from={0.78 + i * 0.02} to={0.9 + i * 0.02} />
      ))}
      <group ref={group}>
        {LINEUP.map((item, i) => (
          <group key={i} position={[item.x, GROUND, item.z]} scale={item.size / item.span}>
            <LinePart url={item.url} mats={mats} />
            {item.accent ? <LinePart url={item.accent} accent mats={mats} /> : null}
          </group>
        ))}
      </group>
    </>
  )
}

/** Fades everything under it out between two progress points. */
function FadingGroup({ progress, from, to, children }: {
  progress: ProgressRef; from: number; to: number; children: ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (group.current) setGroupOpacity(group.current, 1 - ramp(progress.current, from, to))
  })
  return <group ref={group}>{children}</group>
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
      const back = progress.current > 0.8 ? Math.max(1.3, 1.35 / aspect) : 1.3
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

// ── scene ───────────────────────────────────────────────────────────

function Journey({ progress }: { progress: ProgressRef }) {
  const mats = useMaterials()
  const storm = useMemo(() => waterCurve(0, 1.0), [])
  const foul = useMemo(() => waterCurve(Math.PI * 0.55, 1.22), [])
  const drop = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0, GROUND + 3.4, 0), new THREE.Vector3(0, GROUND + 0.9, 0)]), [])
  // The spiral fades out on its own materials, leaving the shared ones alone.
  const spiralWater = useMemo(() => mats.water.clone(), [mats])
  const dropWater = useMemo(() => mats.water.clone(), [mats])
  const spiralFoul = useMemo(() => Object.assign(mats.foul.clone(), { transparent: true }), [mats])
  return (
    <>
      <CameraRig progress={progress} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 8, 5]} intensity={1.1} />
      <Droplets progress={progress} />
      <FadingGroup progress={progress} from={0.55} to={0.6}>
        <GrowingTube curve={storm} radius={0.14} material={spiralWater} progress={progress} from={0.02} to={0.56} />
        <GrowingTube curve={foul} radius={0.025} material={spiralFoul} progress={progress} from={0.05} to={0.56} />
      </FadingGroup>
      {/* The drop into the base: out of the way for the top-down clock,
          back for the line-up as the feed the range branches from. */}
      <FadingGroup progress={progress} from={0.58} to={0.61}>
        <GrowingTube curve={drop} radius={0.14} material={dropWater} progress={progress} from={0.54} to={0.6} />
      </FadingGroup>
      <GrowingTube curve={drop} radius={0.14} material={mats.water} progress={progress} from={0.78} to={0.84} />
      <ChamberRings progress={progress} mats={mats} />
      <AutoFloBlock curve={storm} progress={progress} mats={mats} />
      <ClockBase progress={progress} mats={mats} />
      <RangeLineup progress={progress} mats={mats} />
    </>
  )
}

export default function WaterJourneyScene({ progress }: { progress: ProgressRef }) {
  return (
    <Canvas
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
