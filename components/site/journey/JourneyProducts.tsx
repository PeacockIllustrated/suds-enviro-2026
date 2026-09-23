'use client'

import { Component, Suspense, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { InkOutlines, TOON, ToonModel, toonRamp } from '@/components/site/three/toon'
import { ART, InkBox, LINE, Paper } from '@/components/site/explorer/lineArt'
import {
  CRATES,
  CRATES_TOP,
  CUT_Z,
  FITS,
  GULLY,
  S,
  TANK,
  TANK_BASE,
  baseOf,
  groundAt,
  placeZ,
  topOf,
  type ModelFit,
  type ProductPlace,
  type StopScene,
} from './journeyWorld'
import type { Vec3 } from './scenery'
import type { JourneyMotionState } from './journeyFraming'
import { VIEW_DIR } from '@/components/site/explorer/cameraFit'

/**
 * The drainage products in the section: the real library models at one
 * scale (S, see journeyWorld.ts), each hung at its pipe level with an
 * access riser up to the surface where it sits deeper than its own top,
 * plus the two illustrative items (rainwater tank, attenuation crates)
 * drawn at data-sheet sizes with dashed ink, so they never pass for models.
 */

type MotionRef = { current: JourneyMotionState }

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** A drawn stand-in with the product's outline, while its model loads. */
function Placeholder({ height, radius }: { height: number; radius: number }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[radius, radius, height, 28]} />
      <meshBasicMaterial color="#e6f4fb" transparent opacity={0.85} />
      <Edges color={ART.ink} lineWidth={LINE} threshold={20} />
    </mesh>
  )
}

/**
 * An access riser from `from` up to `to`: a ribbed plastic shaft with a
 * cover frame at the surface, as on the products' data sheets.
 */
export function Riser({ x, z, radius, from, to }: { x: number; z: number; radius: number; from: number; to: number }) {
  const rings = useMemo(() => {
    const out: number[] = []
    const pitch = 0.16
    for (let y = from; y < to - 0.14; y += pitch) out.push(y)
    return out
  }, [from, to])
  const height = to - from
  if (height <= 0.02) return null
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, from + height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshToonMaterial color={TOON.body} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.1} color={TOON.ink} angle={0} />
      </mesh>
      {rings.map((y) => (
        <mesh key={y} position={[0, y + 0.02, 0]}>
          <cylinderGeometry args={[radius * 1.04, radius * 1.04, 0.04, 32]} />
          <meshToonMaterial color={TOON.bodyShade} gradientMap={toonRamp()} />
        </mesh>
      ))}
      {/* Cover and frame at the surface. */}
      <mesh position={[0, to - 0.04, 0]}>
        <cylinderGeometry args={[radius * 1.18, radius * 1.18, 0.1, 32]} />
        <Paper color={ART.asphalt} />
        <Edges color={ART.asphaltInk} lineWidth={LINE} threshold={20} />
      </mesh>
    </group>
  )
}

const REVEAL_SECONDS = 0.45

function LibraryModel({ fit, revealed, animate }: { fit: ModelFit; revealed: boolean; animate: boolean }) {
  const [cx, cz] = fit.centreMm ?? [0, 0]
  // The casing fades over a moment, or at once without motion.
  const [reveal, setReveal] = useState(revealed ? 1 : 0)
  const current = useRef(reveal)
  useFrame((_, dt) => {
    const target = revealed ? 1 : 0
    if (current.current === target) return
    const step = animate ? Math.min(dt, 0.1) / REVEAL_SECONDS : 1
    current.current = target > current.current ? Math.min(target, current.current + step) : Math.max(target, current.current - step)
    setReveal(current.current)
  })
  const eased = reveal * reveal * (3 - 2 * reveal)
  return (
    <group rotation={[0, fit.turn ?? 0, 0]}>
      <group position={[-cx * S, 0, -cz * S]}>
        <ToonModel url={fit.model.url} roles={fit.model.roles} reveal={eased} scale={S} thickness={1.2} />
      </group>
    </group>
  )
}

/** A library product at its place in the section, with its riser. */
export function JourneyProduct({ place, revealed, animate, load }: {
  place: ProductPlace
  revealed: boolean
  animate: boolean
  /** Fetch the model yet; until then the outline stands in. */
  load: boolean
}) {
  const fit: ModelFit = FITS[place.fit]
  const base = baseOf(place)
  const top = topOf(place)
  const z = placeZ(fit)
  const ground = groundAt(place.x)
  const placeholder = <Placeholder height={fit.heightMm * S} radius={fit.radiusMm * S} />
  return (
    <group>
      <group position={[place.x, base, z]}>
        {load ? (
          <ModelBoundary fallback={placeholder}>
            <Suspense fallback={placeholder}>
              <LibraryModel fit={fit} revealed={revealed} animate={animate} />
            </Suspense>
          </ModelBoundary>
        ) : (
          placeholder
        )}
      </group>
      {top < ground - 0.05 ? (
        <Riser x={place.x} z={z} radius={Math.min(fit.radiusMm, 330) * S} from={top - 0.02} to={ground} />
      ) : null}
    </group>
  )
}

// ── illustrative items ──────────────────────────────────────────────

const DASH = { dashed: true, dashSize: 0.22, gapSize: 0.14 } as const

/** Plan direction of a vertical cylinder's outline from the fixed camera. */
const SIDE: [number, number] = [VIEW_DIR.z, -VIEW_DIR.x].map((v, _, a) => v / Math.hypot(a[0], a[1])) as [number, number]

/** Water inside an illustrative item, at `level` 0..1 of `height`. */
function useLevel(motionRef: MotionRef, level: (u: number) => number) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const m = ref.current
    if (!m) return
    const k = Math.max(0.02, Math.min(1, level(motionRef.current.u)))
    m.scale.y = k
    m.visible = k > 0.021
  })
  return ref
}

/**
 * The rainwater harvesting tank, illustrative: a 3300 litre below-ground
 * tank at an assumed size (see journeyWorld.ts), with its access neck to
 * the surface. It fills as the first of the storm runs off the roof.
 */
export function RainTank({ motionRef }: { motionRef: MotionRef }) {
  const { x, radius, height, top, neck } = TANK
  const ground = groundAt(x)
  const water = useLevel(motionRef, (u) => 0.28 + 0.5 * Math.min(1, Math.max(0, u - 0.2)))
  // Standing on its base, so scaling it raises the water line.
  const waterGeometry = useMemo(() => new THREE.CylinderGeometry(radius * 0.97, radius * 0.97, height * 0.97, 40).translate(0, (height * 0.97) / 2, 0), [radius, height])
  return (
    <group position={[x, 0, CUT_Z]}>
      {/* The shell, see-through so the stored water shows. */}
      <mesh position={[0, TANK_BASE + height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 40]} />
        <meshBasicMaterial color="#f4f9fc" transparent opacity={0.4} depthWrite={false} />
        <Edges color={ART.ink} lineWidth={LINE} threshold={20} {...DASH} />
      </mesh>
      {/* The shell's sides as seen from the fixed camera, dashed like its rims. */}
      {[1, -1].map((k) => (
        <Line
          key={k}
          points={[[k * SIDE[0] * radius, TANK_BASE, k * SIDE[1] * radius], [k * SIDE[0] * radius, top, k * SIDE[1] * radius]]}
          color={ART.ink}
          lineWidth={LINE}
          {...DASH}
        />
      ))}
      <mesh ref={water} position={[0, TANK_BASE + 0.02, 0]} geometry={waterGeometry}>
        <meshToonMaterial color={TOON.water} gradientMap={toonRamp()} />
      </mesh>
      {/* Domed shoulders are drawn as a lid ring and the neck. */}
      <mesh position={[0, top + 0.06, 0]}>
        <cylinderGeometry args={[radius * 0.7, radius, 0.12, 40]} />
        <meshBasicMaterial color="#f4f9fc" />
        <Edges color={ART.ink} lineWidth={LINE} threshold={20} {...DASH} />
      </mesh>
      <mesh position={[0, (top + 0.12 + ground) / 2, 0]}>
        <cylinderGeometry args={[neck, neck, ground - top - 0.12, 28]} />
        <meshBasicMaterial color="#f4f9fc" />
        <Edges color={ART.ink} lineWidth={LINE} threshold={20} {...DASH} />
      </mesh>
      <InkBox position={[0, ground + 0.02, 0]} size={[neck * 2.5, 0.06, neck * 2.5]} color={ART.asphalt} ink={ART.asphaltInk} />
    </group>
  )
}

/** Water levels in the crates by journey position: filling in the storm, then draining. */
const crateLevel = (u: number) => {
  const rise = Math.min(1, Math.max(0, (u - 4.6) / 0.9))
  const fall = Math.min(1, Math.max(0, (u - 5.8) / 1.0))
  return 0.72 * rise * (1 - 0.55 * fall)
}

/**
 * Attenuation storage, illustrative: geocellular crate modules at a common
 * size, wrapped in a membrane and standing in front of the cut. The stored
 * water rises in the storm and drains down through the flow control.
 */
export function Crates({ motionRef }: { motionRef: MotionRef }) {
  const [mx, my, mz] = CRATES.module
  const [nx, ny, nz] = CRATES.count
  const width = mx * nx
  const height = my * ny
  const depth = mz * nz
  const water = useLevel(motionRef, crateLevel)
  const waterGeometry = useMemo(() => new THREE.BoxGeometry(width - 0.06, height - 0.04, depth - 0.06).translate(0, (height - 0.04) / 2, 0), [width, height, depth])
  const cells = useMemo(() => {
    const out: Vec3[] = []
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) out.push([CRATES.from + (i + 0.5) * mx, CRATES.bottom + (j + 0.5) * my, depth - mz / 2])
    return out
  }, [depth, mx, my, mz, nx, ny])
  return (
    <group>
      {/* Stored water first, so the lattice draws over it. */}
      <mesh ref={water} position={[CRATES.from + width / 2, CRATES.bottom + 0.02, depth / 2]} geometry={waterGeometry}>
        <meshBasicMaterial color={TOON.water} transparent opacity={0.8} />
      </mesh>
      {/* The front row of modules as a lattice, the whole block as a membrane. */}
      {cells.map((p) => (
        <group key={`${p[0]}-${p[1]}`} position={p}>
          <mesh>
            <boxGeometry args={[mx, my, mz]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
            <Edges color={ART.ink} lineWidth={LINE} threshold={20} {...DASH} />
          </mesh>
          {/* Lattice openings on the face. */}
          <mesh position={[0, 0, mz / 2 + 0.005]}>
            <planeGeometry args={[mx * 0.72, my * 0.55]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} />
            <Edges color={ART.glassInk} lineWidth={LINE * 0.8} threshold={20} />
          </mesh>
        </group>
      ))}
      <mesh position={[CRATES.from + width / 2, CRATES.bottom + height / 2, depth / 2]}>
        <boxGeometry args={[width + 0.08, height + 0.08, depth + 0.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        <Edges color={ART.inkDark} lineWidth={LINE * 1.2} threshold={20} />
      </mesh>
      {/* Inspection and vent pipe up to the surface. */}
      <mesh position={[CRATES.from + width - 0.6, (CRATES_TOP + groundAt(CRATES.from + width - 0.6)) / 2, depth - 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, groundAt(CRATES.from + width - 0.6) - CRATES_TOP, 16]} />
        <meshToonMaterial color={TOON.body} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.1} color={TOON.ink} angle={0} />
      </mesh>
    </group>
  )
}

/** The road gully pot under the grating, trapping grit before it joins the run. */
export function GullyPot() {
  const { x, radius, height, top } = GULLY
  return (
    <group position={[x, top - height, CUT_Z]}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 28]} />
        <meshToonMaterial color={TOON.body} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.1} color={TOON.ink} angle={0} />
      </mesh>
    </group>
  )
}

// ── the size callout ────────────────────────────────────────────────

/**
 * A drawn dimension line beside the product at the active stop, with its
 * size from the data sheet on a tag. Decorative: the same words are in the
 * stop's card for assistive technology.
 */
export function Dimension({ scene }: { scene: StopScene }) {
  const d = scene.dimension
  if (!d || !scene.size) return null
  const tick = 0.22
  return (
    <group>
      <Line points={[[d.x, d.from, d.z], [d.x, d.to, d.z]]} color={ART.inkDark} lineWidth={1.4} />
      <Line points={[[d.x - tick, d.from, d.z], [d.x + tick, d.from, d.z]]} color={ART.inkDark} lineWidth={1.4} />
      <Line points={[[d.x - tick, d.to, d.z], [d.x + tick, d.to, d.z]]} color={ART.inkDark} lineWidth={1.4} />
      <Html position={[d.x + 0.25, (d.from + d.to) / 2, d.z]} zIndexRange={[5, 0]} className="pointer-events-none">
        <span className="hidden -translate-y-1/2 rounded-full sm:block border border-site-blue/40 bg-white/95 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-site-blue-dark shadow-sm">
          {scene.size}
        </span>
      </Html>
    </group>
  )
}
