'use client'

import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { InkOutlines, TOON, toonRamp, useWaterMaterial } from '../three/toon'
import {
  DEPTH,
  DOWNPIPE_PHI,
  GUTTER_R,
  HOUSE_PHI,
  HOUSE_Z,
  PIPE_TO,
  R,
  RIVER,
  RIVER_BED,
  RIVER_LEVEL,
  STOP_SCENES,
  discShape,
  pipeRadius,
  polar,
  sectorShape,
  uprightAt,
} from './journeyWorld'
import { DiagramBox, DiagramTank } from './JourneyDiagrams'

/**
 * The world the water journey crosses: a slice of a small planet with a
 * house, a drive, a road, a car park, a field and a river on its rim, and
 * the drainage run exposed in the cut face below. Everything here is
 * static except the rain, the water in the river and the water in the
 * pipe, which grows as the reader travels.
 */

export type MotionRef = { current: { u: number } }

const SOIL = {
  grass: '#4fa84a',
  grassDark: '#3a8a3a',
  top: '#8a6647',
  sub: '#c9a079',
  clay: '#b88a62',
  core: '#a57b56',
  pebble: '#9c7552',
}
const TARMAC = '#5b6a74'
const PAVING = '#a3b1ba'

// ── toon primitives ─────────────────────────────────────────────────

type MeshProps = ThreeElements['mesh']

/** A mesh in the toon ramp with an inked edge. */
function Toon({ color, outline = TOON.ink, thickness = 2, children, ...mesh }: MeshProps & {
  color: string
  outline?: string
  thickness?: number
  children?: ReactNode
}) {
  return (
    <mesh {...mesh}>
      {children}
      <meshToonMaterial color={color} gradientMap={toonRamp()} />
      <InkOutlines thickness={thickness} color={outline} angle={Math.PI / 5} />
    </mesh>
  )
}

/** Stands its children upright on the rim at `phi`, `lift` above ground. */
function OnRim({ phi, z, lift = 0, children }: { phi: number; z: number; lift?: number; children: ReactNode }) {
  return (
    <group position={polar(phi, R + lift, z).toArray()} rotation={[0, 0, uprightAt(phi)]}>
      {children}
    </group>
  )
}

// ── the disc and its strata ─────────────────────────────────────────

function Disc() {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(discShape(), { depth: DEPTH, bevelEnabled: false, curveSegments: 1 })
    g.translate(0, 0, -DEPTH)
    return g
  }, [])
  const materials = useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: SOIL.core }),
      new THREE.MeshToonMaterial({ color: SOIL.grass, gradientMap: toonRamp() }),
    ],
    [],
  )
  return (
    <mesh geometry={geometry} material={materials}>
      <InkOutlines thickness={3} color={TOON.ink} angle={Math.PI / 5} />
    </mesh>
  )
}

function Layer({ shape, color, z }: { shape: THREE.Shape; color: string; z: number }) {
  const geometry = useMemo(() => new THREE.ShapeGeometry(shape, 1), [shape])
  return (
    <mesh geometry={geometry} position={[0, 0, z]}>
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

/** Soil bands on the cut face, cut round the river. */
function Strata() {
  const shapes = useMemo(() => {
    const [a, b] = RIVER
    const rest: [number, number] = [b, a + 360]
    return [
      { color: SOIL.grassDark, shape: sectorShape(R - 0.12, R, ...rest) },
      { color: SOIL.top, shape: sectorShape(R - 0.55, R - 0.12, ...rest) },
      { color: SOIL.sub, shape: sectorShape(R - 1.95, R - 0.55, ...rest) },
      { color: SOIL.sub, shape: sectorShape(R - 1.95, RIVER_BED - 0.02, a + 2.3, b - 2.3) },
      { color: SOIL.clay, shape: sectorShape(R - 3.3, R - 1.95, -180, 180, 1) },
    ]
  }, [])
  return (
    <group>
      {shapes.map((s, i) => (
        <Layer key={i} shape={s.shape} color={s.color} z={0.004} />
      ))}
      <Pebbles />
    </group>
  )
}

/** Stones pressed into the face, so it reads as ground and not a plate. */
function Pebbles() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const stones = useMemo(() => {
    const list: { phi: number; r: number; s: number }[] = []
    for (let i = 0; list.length < 150 && i < 600; i++) {
      const phi = -75 + ((i * 47.13) % 150)
      const r = R - 0.7 - (((i * 0.6180339) % 1) * 2.4)
      const nearPipe = Math.abs(r - pipeRadius(phi)) < 0.22
      const inRiver = phi > RIVER[0] - 1 && phi < RIVER[1] + 1 && r > RIVER_BED - 0.2
      const nearStop = Object.values(STOP_SCENES).some((s) => Math.abs(s.phi - phi) < 2.4 && r > R - 1.7)
      if (nearPipe || inRiver || nearStop) continue
      list.push({ phi, r, s: 0.03 + ((i * 13) % 5) * 0.012 })
    }
    return list
  }, [])
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const o = new THREE.Object3D()
    stones.forEach((st, i) => {
      o.position.copy(polar(st.phi, st.r, 0.008))
      o.scale.set(st.s * 1.4, st.s, 1)
      o.rotation.z = st.phi
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }, [stones])
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, stones.length]}>
      <circleGeometry args={[1, 10]} />
      <meshBasicMaterial color={SOIL.pebble} />
    </instancedMesh>
  )
}

// ── surfaces on the rim ─────────────────────────────────────────────

/** A strip of surface laid over the rim, e.g. a road or a drive. */
function RimBand({ from, to, color, z0 = -3.7, z1 = -0.15, lift = 0.025 }: {
  from: number; to: number; color: string; z0?: number; z1?: number; lift?: number
}) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(sectorShape(R - 0.02, R + lift, from, to, 0.4), {
      depth: z1 - z0,
      bevelEnabled: false,
    })
    g.translate(0, 0, z0)
    return g
  }, [from, to, z0, z1, lift])
  return (
    <mesh geometry={geometry}>
      <meshToonMaterial color={color} gradientMap={toonRamp()} />
      <InkOutlines thickness={1.6} color={TOON.ink} angle={Math.PI / 5} />
    </mesh>
  )
}

/** Dashed white lining along a road. */
function RoadLines({ from, to, z }: { from: number; to: number; z: number }) {
  const marks = []
  for (let phi = from + 0.8; phi < to - 0.5; phi += 1.6) marks.push(phi)
  return (
    <>
      {marks.map((phi) => (
        <OnRim key={phi} phi={phi} z={z} lift={0.03}>
          <mesh>
            <boxGeometry args={[0.2, 0.012, 0.05]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </OnRim>
      ))}
    </>
  )
}

// ── things on the rim ───────────────────────────────────────────────

function roofGeometry(w: number, h: number, d: number) {
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)])
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
  g.translate(0, 0, -d / 2)
  return g
}

function House() {
  const roof = useMemo(() => roofGeometry(1.85, 0.72, 1.45), [])
  const W = 1.5
  const H = 0.98
  const D = 1.2
  return (
    <OnRim phi={HOUSE_PHI} z={HOUSE_Z}>
      <Toon position={[0, H / 2, 0]} color="#f6f1e7">
        <boxGeometry args={[W, H, D]} />
      </Toon>
      <Toon geometry={roof} position={[0, H, 0]} color={TOON.red} outline="#7a2524" />
      <Toon position={[0.42, H + 0.5, -0.25]} color="#b9483f" outline="#7a2524">
        <boxGeometry args={[0.16, 0.36, 0.16]} />
      </Toon>
      {/* Door and windows on the front wall. */}
      <Toon position={[-0.18, 0.26, D / 2 + 0.01]} color={TOON.accent} thickness={1.5}>
        <boxGeometry args={[0.26, 0.5, 0.03]} />
      </Toon>
      {[-0.52, 0.22].map((x) => (
        <Toon key={x} position={[x + 0.14, 0.7, D / 2 + 0.01]} color={TOON.accentLight} thickness={1.5}>
          <boxGeometry args={[0.28, 0.22, 0.03]} />
        </Toon>
      ))}
      <Toon position={[-0.55, 0.3, D / 2 + 0.01]} color={TOON.accentLight} thickness={1.5}>
        <boxGeometry args={[0.24, 0.22, 0.03]} />
      </Toon>
    </OnRim>
  )
}

/** The gutter and downpipe the roof water runs down. */
function Downpipe() {
  const len = GUTTER_R - R
  const z = HOUSE_Z + 0.62
  return (
    <>
      <OnRim phi={DOWNPIPE_PHI} z={z}>
        <Toon position={[0, len / 2, 0]} color="#dfe9ef" thickness={1.4}>
          <cylinderGeometry args={[0.045, 0.045, len, 10]} />
        </Toon>
      </OnRim>
      {/* The water butt-style cover of the harvesting tank, at ground level. */}
      <OnRim phi={STOP_SCENES.harvest.phi} z={-0.7}>
        <Toon position={[0, 0.03, 0]} color="#2f6f3a" outline="#1f4a27" thickness={1.4}>
          <cylinderGeometry args={[0.26, 0.28, 0.06, 20]} />
        </Toon>
      </OnRim>
    </>
  )
}

function Tree({ phi, z, scale = 1 }: { phi: number; z: number; scale?: number }) {
  return (
    <OnRim phi={phi} z={z}>
      <group scale={scale}>
        <Toon position={[0, 0.3, 0]} color="#8a5a3a" outline="#4a2f1f" thickness={1.5}>
          <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
        </Toon>
        <Toon position={[0, 0.78, 0]} color={TOON.green} outline="#2f6b30">
          <icosahedronGeometry args={[0.42, 1]} />
        </Toon>
        <Toon position={[0.16, 1.1, 0.05]} color="#6cc464" outline="#2f6b30">
          <icosahedronGeometry args={[0.26, 1]} />
        </Toon>
      </group>
    </OnRim>
  )
}

function Wheels({ x, z }: { x: number[]; z: number }) {
  return (
    <>
      {x.flatMap((wx) =>
        [z, -z].map((wz) => (
          <Toon key={`${wx}${wz}`} position={[wx, 0.07, wz]} rotation={[Math.PI / 2, 0, 0]} color="#27323a" thickness={1.2}>
            <cylinderGeometry args={[0.075, 0.075, 0.05, 12]} />
          </Toon>
        )),
      )}
    </>
  )
}

function Car({ phi, z, color = TOON.red, flip = false }: { phi: number; z: number; color?: string; flip?: boolean }) {
  return (
    <OnRim phi={phi} z={z} lift={0.025}>
      <group rotation={[0, flip ? Math.PI : 0, 0]}>
        <Toon position={[0, 0.17, 0]} color={color} outline="#6d2020">
          <boxGeometry args={[0.66, 0.17, 0.34]} />
        </Toon>
        <Toon position={[-0.04, 0.32, 0]} color={color} outline="#6d2020">
          <boxGeometry args={[0.36, 0.15, 0.3]} />
        </Toon>
        <Toon position={[-0.04, 0.33, 0.152]} color={TOON.accentLight} thickness={1}>
          <boxGeometry args={[0.28, 0.1, 0.01]} />
        </Toon>
        <Wheels x={[-0.2, 0.2]} z={0.16} />
      </group>
    </OnRim>
  )
}

function Van({ phi, z }: { phi: number; z: number }) {
  return (
    <OnRim phi={phi} z={z} lift={0.025}>
      <Toon position={[-0.1, 0.3, 0]} color="#f7fbfd">
        <boxGeometry args={[0.72, 0.44, 0.4]} />
      </Toon>
      <Toon position={[0.38, 0.22, 0]} color="#f7fbfd">
        <boxGeometry args={[0.26, 0.3, 0.38]} />
      </Toon>
      <Toon position={[0.43, 0.3, 0.001]} color={TOON.accentLight} thickness={1}>
        <boxGeometry args={[0.1, 0.12, 0.39]} />
      </Toon>
      <Toon position={[-0.1, 0.28, 0.205]} color={TOON.green} outline="#2f6b30" thickness={1}>
        <boxGeometry args={[0.5, 0.06, 0.01]} />
      </Toon>
      <Wheels x={[-0.3, 0.32]} z={0.18} />
    </OnRim>
  )
}

/** A low building behind the car park. */
function Shop({ phi, z }: { phi: number; z: number }) {
  return (
    <OnRim phi={phi} z={z}>
      <Toon position={[0, 0.45, 0]} color="#eef3f6">
        <boxGeometry args={[1.6, 0.9, 0.9]} />
      </Toon>
      <Toon position={[0, 0.93, 0]} color={TOON.accent}>
        <boxGeometry args={[1.7, 0.08, 1]} />
      </Toon>
      <Toon position={[0, 0.62, 0.47]} color={TOON.green} outline="#2f6b30" thickness={1.5}>
        <boxGeometry args={[1.3, 0.1, 0.12]} />
      </Toon>
      <Toon position={[0, 0.28, 0.455]} color={TOON.accentLight} thickness={1.5}>
        <boxGeometry args={[1.1, 0.38, 0.02]} />
      </Toon>
    </OnRim>
  )
}

function Reeds({ phi, z }: { phi: number; z: number }) {
  return (
    <OnRim phi={phi} z={z}>
      {[-0.12, 0, 0.1, 0.2].map((x, i) => (
        <mesh key={x} position={[x, 0.18 + (i % 2) * 0.05, 0]} rotation={[0, 0, (i - 1.5) * 0.12]}>
          <cylinderGeometry args={[0.015, 0.02, 0.36 + (i % 2) * 0.1, 5]} />
          <meshToonMaterial color="#3f8f3a" gradientMap={toonRamp()} />
        </mesh>
      ))}
    </OnRim>
  )
}

// ── what sits in the cut face ───────────────────────────────────────

/** A chamber shaft in the cut face: a ribbed riser from the rim down to below the pipe. */
function Shaft({ phi, radius = 0.3, sump = 0.42, accent = TOON.accent }: { phi: number; radius?: number; sump?: number; accent?: string }) {
  const bottom = pipeRadius(phi) - sump
  const height = R - bottom
  const ribs = Math.floor((height - 0.3) / 0.16)
  return (
    <group position={polar(phi, bottom + height / 2, 0).toArray()} rotation={[0, 0, uprightAt(phi)]}>
      <Toon color={TOON.body}>
        <cylinderGeometry args={[radius, radius, height, 28, 1, false, 0, Math.PI]} />
      </Toon>
      {/* The back wall, seen through the open front. */}
      <mesh position={[0, 0, -0.01]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, height - 0.04, 28, 1, true, Math.PI, Math.PI]} />
        <meshToonMaterial color={TOON.bodyShade} gradientMap={toonRamp()} side={THREE.BackSide} />
      </mesh>
      {Array.from({ length: ribs }, (_, i) => (
        <mesh key={i} position={[0, height / 2 - 0.12 - i * 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + 0.012, 0.02, 6, 28, Math.PI]} />
          <meshToonMaterial color={TOON.bodyShade} gradientMap={toonRamp()} />
        </mesh>
      ))}
      {/* Base band and cover. */}
      <Toon position={[0, -height / 2 + 0.14, 0]} color={accent} thickness={1.6}>
        <cylinderGeometry args={[radius + 0.03, radius + 0.03, 0.28, 28, 1, false, 0, Math.PI]} />
      </Toon>
      <Toon position={[0, height / 2 + 0.02, -0.2]} color="#2c3a44" thickness={1.6}>
        <cylinderGeometry args={[radius + 0.05, radius + 0.05, 0.05, 28]} />
      </Toon>
    </group>
  )
}

/** The headwall where the pipe leaves the ground into the river. */
function Headwall() {
  const r = pipeRadius(PIPE_TO)
  return (
    <group position={polar(PIPE_TO + 0.2, r, 0.05).toArray()} rotation={[0, 0, uprightAt(PIPE_TO)]}>
      <Toon position={[0, 0.05, 0]} color="#c9d3d9">
        <boxGeometry args={[0.16, 0.5, 0.2]} />
      </Toon>
    </group>
  )
}

/** The mini stand-ins in the face, in the same diagram style as their close-ups. */
function FaceDiagrams() {
  const tank = STOP_SCENES.harvest
  const store = STOP_SCENES.storage
  return (
    <>
      <group position={polar(tank.phi, R - 0.78, 0).toArray()} rotation={[0, 0, uprightAt(tank.phi)]} scale={0.46}>
        <DiagramTank />
      </group>
      <group position={polar(store.phi, pipeRadius(store.phi) - 0.05, 0).toArray()} rotation={[0, 0, uprightAt(store.phi)]}>
        <DiagramBox size={[2.6, 0.95, 0.7]} cells={[6, 2, 1]} water={0.55} />
      </group>
    </>
  )
}

// ── water ───────────────────────────────────────────────────────────

function River() {
  const water = useWaterMaterial(5)
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(sectorShape(RIVER_BED - 0.05, RIVER_LEVEL, RIVER[0] - 0.5, RIVER[1] + 0.5, 0.3), {
      depth: DEPTH - 0.1,
      bevelEnabled: false,
    })
    g.translate(0, 0, -DEPTH + 0.05)
    return g
  }, [])
  return (
    <mesh geometry={geometry} material={water}>
      <InkOutlines thickness={2} color={TOON.ink} angle={Math.PI / 5} />
    </mesh>
  )
}

/**
 * The water in the drainage run: a tube along the route that is drawn
 * up to `head` (0..1), with a dashed line marking the way still to go.
 */
function Flow({ curve, fractions, motionRef }: { curve: THREE.CatmullRomCurve3; fractions: number[]; motionRef: MotionRef }) {
  const material = useWaterMaterial(40)
  const RADIAL = 10
  const SEGMENTS = 900
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, SEGMENTS, 0.065, RADIAL, false), [curve])
  const guide = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(600))
    const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: TOON.inkSoft, dashSize: 0.1, gapSize: 0.08 }))
    line.computeLineDistances()
    return line
  }, [curve])
  const tube = useRef<THREE.Mesh>(null)
  const head = useRef(-1)
  useFrame(() => {
    const u = motionRef.current.u
    const i = Math.min(fractions.length - 2, Math.max(0, Math.floor(u)))
    const f = Math.min(1, Math.max(0, u - i))
    const want = fractions[i] + (fractions[i + 1] - fractions[i]) * f
    if (Math.abs(want - head.current) < 1e-4) return
    head.current = want
    const perSegment = RADIAL * 6
    const end = Math.floor(SEGMENTS * want) * perSegment
    geometry.setDrawRange(0, end)
    if (tube.current) tube.current.visible = end > perSegment
  })
  return (
    <>
      <primitive object={guide} />
      <mesh ref={tube} geometry={geometry} material={material}>
        {/* angle={0} shares this geometry, and with it the draw range. */}
        <InkOutlines thickness={2} color={TOON.ink} angle={0} />
      </mesh>
    </>
  )
}

/** Rain falling from the cloud onto the roof and drive. */
function Rain({ animate }: { animate: boolean }) {
  const COUNT = 56
  const mesh = useRef<THREE.InstancedMesh>(null)
  const drops = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({
      phi: -60.3 + ((i * 0.7548776) % 1) * 7.8,
      z: -3.2 + ((i * 0.5698403) % 1) * 3,
      offset: (i * 0.618034) % 1,
      speed: 0.8 + ((i * 7) % 5) * 0.08,
    })),
    [],
  )
  const top = R + 3.0
  const scratch = useMemo(() => new THREE.Object3D(), [])
  const place = (t: number) => {
    const m = mesh.current
    if (!m) return
    drops.forEach((d, i) => {
      const fall = (d.offset + t * d.speed * 0.9) % 1
      scratch.position.copy(polar(d.phi, top - fall * (top - R), d.z))
      scratch.rotation.set(0, 0, uprightAt(d.phi))
      scratch.updateMatrix()
      m.setMatrixAt(i, scratch.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }
  useLayoutEffect(() => place(0))
  useFrame(({ clock }) => {
    if (animate) place(clock.elapsedTime)
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <capsuleGeometry args={[0.016, 0.16, 2, 6]} />
      <meshBasicMaterial color={TOON.waterDeep} />
    </instancedMesh>
  )
}

function Cloud({ phi, lift, z, scale = 1, color = '#ffffff' }: { phi: number; lift: number; z: number; scale?: number; color?: string }) {
  const puffs: [number, number, number, number][] = [
    [-0.75, 0, 0, 0.5],
    [0, 0.18, 0.05, 0.68],
    [0.72, 0.02, 0, 0.5],
    [0.3, -0.12, 0.3, 0.42],
    [-0.35, -0.1, 0.3, 0.42],
  ]
  return (
    <OnRim phi={phi} z={z} lift={lift}>
      <group scale={scale}>
        {puffs.map(([x, y, pz, r]) => (
          <Toon key={`${x}${y}`} position={[x, y, pz]} color={color} thickness={2.2}>
            <sphereGeometry args={[r, 24, 16]} />
          </Toon>
        ))}
      </group>
    </OnRim>
  )
}

// ── the whole world ─────────────────────────────────────────────────

export function JourneyWorld({ curve, fractions, motionRef, animate }: {
  curve: THREE.CatmullRomCurve3
  fractions: number[]
  motionRef: MotionRef
  animate: boolean
}) {
  return (
    <group>
      <Disc />
      <Strata />
      <River />

      {/* Rain on the house. */}
      <Cloud phi={-56.5} lift={3.35} z={-1.7} />
      <Cloud phi={16} lift={4.2} z={-3} scale={0.7} color="#f2f9fd" />
      <Cloud phi={44} lift={3.6} z={-3.4} scale={0.55} color="#f2f9fd" />
      <Rain animate={animate} />
      <House />
      <Downpipe />
      <Tree phi={-62} z={-2.6} scale={1.1} />
      <Tree phi={-44} z={-2.9} scale={0.9} />

      {/* The drive and the chamber under it. */}
      <RimBand from={-38} to={-26} color={PAVING} />
      <Car phi={-35.5} z={-1.5} />
      <Tree phi={-22} z={-2.7} scale={1.2} />

      {/* The road, a van and the silt trap at the gully. */}
      <RimBand from={-19.5} to={-4} color={TARMAC} />
      <RoadLines from={-19.5} to={-4} z={-1.95} />
      <Van phi={-10} z={-2.6} />

      {/* The car park and the separator. */}
      <RimBand from={-2} to={12.5} color={TARMAC} />
      <Car phi={1.5} z={-1.2} color={TOON.accent} />
      <Car phi={8.5} z={-1.2} color="#f7fbfd" flip />
      <Shop phi={5} z={-3.1} />

      {/* The field over the storage. */}
      <Tree phi={15.5} z={-2.8} scale={1.25} />
      <Tree phi={30.5} z={-2.2} />

      {/* Flow control, then down to the river. */}
      <Tree phi={35} z={-3} scale={0.95} />
      <Tree phi={45.5} z={-2.6} scale={1.15} />
      <Reeds phi={RIVER[0] - 0.4} z={-0.8} />
      <Reeds phi={RIVER[1] + 0.3} z={-1.6} />

      {/* The cut face. */}
      <Shaft phi={STOP_SCENES.chamber.phi} />
      <Shaft phi={STOP_SCENES.silt.phi} sump={0.62} accent={TOON.green} />
      <Shaft phi={STOP_SCENES.separator.phi} radius={0.42} sump={0.8} />
      <Shaft phi={STOP_SCENES.flow.phi} sump={0.5} accent={TOON.green} />
      <FaceDiagrams />
      <Headwall />

      <Flow curve={curve} fractions={fractions} motionRef={motionRef} />
      {/* Keep the route's first point visible as a marker at the gutter. */}
      <mesh position={polar(-58.4, GUTTER_R, HOUSE_Z + 0.62).toArray()}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshBasicMaterial color={TOON.waterDeep} />
      </mesh>
    </group>
  )
}
