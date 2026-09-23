'use client'

import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Edges, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { InkOutlines, toonRamp } from '@/components/site/three/toon'
import { ART, InkBox, InkSlab, LINE, Panels, Paper, selectHandlers, windowGrid, type Rect } from './lineArt'
import type { Vec3 } from './explorerLayout'

/**
 * The development types, as simple procedural line art: an office with a
 * canopy and vans, a multi-storey car park, a parade of shops with
 * awnings (the cafe on the end opened up in section), and a detached
 * house with a timber fence and a driveway charger.
 *
 * Every building calls `onSelect` when clicked, which picks its plot.
 */

type OnSelect = () => void

// ── vehicles ────────────────────────────────────────────────────────

function Wheels({ length, width, radius }: { length: number; width: number; radius: number }) {
  const spots: Vec3[] = [
    [length / 2 - radius * 1.8, radius, width / 2],
    [-length / 2 + radius * 1.8, radius, width / 2],
    [length / 2 - radius * 1.8, radius, -width / 2],
    [-length / 2 + radius * 1.8, radius, -width / 2],
  ]
  return (
    <>
      {spots.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius, radius, 0.28, 18]} />
          <Paper color={ART.tyre} />
          <Edges color={ART.asphaltInk} lineWidth={LINE} threshold={30} />
        </mesh>
      ))}
    </>
  )
}

const VAN_SIDE: Rect[] = [[2.15, 1.25, 1.1, 0.7]]
const VAN_FRONT: Rect[] = [[-0.85, 1.25, 1.7, 0.7]]
const VAN_STRIPE: Rect[] = [[-2.3, 1.55, 3.3, 0.22]]

/** A panel van, nose towards +x. */
export function Van({ position, turn = 0 }: { position: Vec3; turn?: number }) {
  return (
    <group position={position} rotation={[0, turn, 0]}>
      <InkBox position={[-0.55, 1.5, 0]} size={[3.9, 2.3, 2]} />
      <InkBox position={[2.1, 1.12, 0]} size={[1.5, 1.55, 2]} />
      <Panels rects={VAN_SIDE} position={[0, 0, 1.011]} />
      <Panels rects={VAN_STRIPE} position={[0, 0, 1.011]} color={ART.ink} />
      <Panels rects={VAN_FRONT} position={[2.851, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Wheels length={5.3} width={1.9} radius={0.4} />
    </group>
  )
}

/** A hatchback, nose towards +x. */
export function Car({ position, turn = 0, color = ART.paper }: { position: Vec3; turn?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, turn, 0]}>
      <InkBox position={[0, 0.66, 0]} size={[4.2, 0.72, 1.8]} color={color} />
      <InkBox position={[-0.25, 1.3, 0]} size={[2.3, 0.56, 1.62]} color={ART.glass} />
      <Wheels length={4.2} width={1.7} radius={0.33} />
    </group>
  )
}

// ── office ──────────────────────────────────────────────────────────

const OFFICE_FRONT: Rect[] = [
  [0.8, 0.35, 4.8, 2.5],
  [12.4, 0.35, 4.8, 2.5],
  ...windowGrid(8, 3, 1.7, 1.9, 2.15, 2.8, 0.85, 3.7),
]
const OFFICE_DOOR: Rect[] = [[7.2, 0, 3.6, 2.9]]
const OFFICE_SIDE: Rect[] = windowGrid(4, 4, 1.8, 1.9, 2.6, 2.8, 0.9, 0.9)

function Logo() {
  const texture = useTexture('/logos/suds/horizontal-main.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
  })
  // 993 x 154 px artwork.
  return (
    <mesh position={[-3, 13.05, -6.93]}>
      <planeGeometry args={[8.4, 8.4 * (154 / 993)]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

export function Office({ onSelect }: { onSelect: OnSelect }) {
  return (
    <group {...selectHandlers(onSelect)}>
      <InkBox position={[-3, 6, -12.5]} size={[18, 12, 11]} />
      <InkBox position={[-3, 12.3, -12.5]} size={[18.3, 0.6, 11.3]} />
      <InkBox position={[-6.5, 13.1, -14.5]} size={[4, 1.2, 3.4]} />
      <InkBox position={[1.5, 12.9, -15.5]} size={[2.4, 0.8, 2.4]} />
      {/* The sign board carrying the logo, on the roof edge. */}
      <InkBox position={[-3, 13.05, -7.05]} size={[9.4, 1.6, 0.18]} />
      <Suspense fallback={null}>
        <Logo />
      </Suspense>
      <Panels rects={OFFICE_FRONT} position={[-12, 0, -6.985]} />
      <Panels rects={OFFICE_DOOR} position={[-12, 0, -6.98]} color="#e3f2fb" />
      <Panels rects={OFFICE_SIDE} position={[6.015, 0, -7]} rotation={[0, Math.PI / 2, 0]} />
      {/* Entrance canopy on two posts. */}
      <InkSlab from={[-6.6, 3.25, -7]} to={[0.6, 3.5, -3.7]} />
      <InkSlab from={[-6.35, 0, -4.1]} to={[-6.1, 3.25, -3.85]} />
      <InkSlab from={[0.1, 0, -4.1]} to={[0.35, 3.25, -3.85]} />
      <Van position={[-9.8, 0, -2.3]} />
      <Van position={[5.2, 0, -2.4]} turn={Math.PI} />
    </group>
  )
}

// ── car park ────────────────────────────────────────────────────────

const DECKS = [3.1, 6.2, 9.3]
const COLUMNS_X = [21.2, 27.8, 34.4, 40.8]
const CORE_WINDOWS: Rect[] = windowGrid(1, 4, 0.9, 1.6, 1, 2.8, 1.05, 1.2)
const CORE_SIGN: Rect[] = [[0.8, 9.35, 1.4, 1.4]]
const CORE_SIGN_P: Rect[] = [
  [1.15, 9.55, 0.28, 1.0],
  [1.15, 10.28, 0.7, 0.27],
  [1.15, 9.9, 0.7, 0.24],
  [1.7, 9.9, 0.25, 0.65],
]
const BAYS: Rect[] = [0, 1, 2, 3, 4].map((i) => [22 + i * 2.8, 0.8, 0.12, 4.2] as Rect)

export function CarPark({ onSelect }: { onSelect: OnSelect }) {
  const levels = [0, ...DECKS]
  return (
    <group {...selectHandlers(onSelect)}>
      {DECKS.map((y) => (
        <group key={y}>
          <InkSlab from={[20.9, y, -19.2]} to={[41.1, y + 0.35, -6.8]} />
          {/* Open-sided parapet band on the front and the end. */}
          <InkSlab from={[20.9, y + 0.35, -7.05]} to={[41.1, y + 1.3, -6.8]} />
          <InkSlab from={[40.85, y + 0.35, -19.2]} to={[41.1, y + 1.3, -6.8]} />
        </group>
      ))}
      {levels.slice(0, 3).map((y) =>
        COLUMNS_X.map((x) => (
          <group key={`${x}-${y}`}>
            <InkSlab from={[x - 0.18, y + 0.35, -7.4]} to={[x + 0.18, y + 3.1, -7.05]} />
            <InkSlab from={[x - 0.18, y + 0.35, -19]} to={[x + 0.18, y + 3.1, -18.65]} />
          </group>
        )),
      )}
      {/* Back wall so the decks read as a building, not a shelf. */}
      <InkSlab from={[20.9, 0, -19.2]} to={[41.1, 9.3, -18.9]} />
      {/* Stair and lift core with the parking sign. */}
      <InkSlab from={[41.1, 0, -11.5]} to={[44, 11.6, -7.3]} />
      <Panels rects={CORE_WINDOWS} position={[41.1, 0, -7.285]} />
      <Panels rects={CORE_SIGN} position={[41.1, 0, -7.28]} color={ART.ink} ink={ART.inkDark} />
      <Panels rects={CORE_SIGN_P} position={[41.1, 0, -7.27]} color={ART.paper} ink={ART.paper} />
      {/* Cars on each deck, most just showing over the parapet. */}
      <Car position={[24.5, 3.45, -9.5]} turn={Math.PI / 2} />
      <Car position={[31.2, 3.45, -9.5]} turn={Math.PI / 2} color="#e7f1f8" />
      <Car position={[37.6, 6.55, -9.5]} turn={Math.PI / 2} />
      <Car position={[27.8, 6.55, -9.5]} turn={Math.PI / 2} color="#e7f1f8" />
      <Car position={[33.9, 9.65, -10]} turn={Math.PI / 2} />
      <Car position={[24.2, 9.65, -10]} turn={Math.PI / 2} />
      <Car position={[27, 0.35, -12]} turn={Math.PI / 2} />
      {/* Surface bays in front. */}
      <Panels rects={BAYS} position={[0, 0.012, -1]} rotation={[-Math.PI / 2, 0, 0]} color={ART.ink} />
      <Car position={[25.4, 0, -3.1]} turn={Math.PI / 2} />
      <Car position={[31, 0, -3.1]} turn={-Math.PI / 2} color="#e7f1f8" />
    </group>
  )
}

// ── retail ──────────────────────────────────────────────────────────

const UNIT = 22 / 3
const RETAIL_LEFT = 51
const SHOPFRONTS: Rect[] = [0, 1, 2].flatMap((u) => [
  [u * UNIT + 0.45, 0.3, 4.6, 2.6] as Rect,
  [u * UNIT + 5.45, 0, 1.4, 2.75] as Rect,
])
const UPPER_WINDOWS: Rect[] = [0, 1, 2].flatMap((u) => [
  [u * UNIT + 1.1, 4.4, 1.9, 1.7] as Rect,
  [u * UNIT + 4.3, 4.4, 1.9, 1.7] as Rect,
])
const RETAIL_SIDE: Rect[] = windowGrid(3, 1, 1.9, 1.7, 3, 0, 1.2, 4.4)

function Awning({ x0, x1 }: { x0: number; x1: number }) {
  const width = x1 - x0
  const stripes = 6
  return (
    <group position={[(x0 + x1) / 2, 3.55, -6]} rotation={[0.42, 0, 0]}>
      <mesh position={[0, 0, 0.85]}>
        <boxGeometry args={[width, 0.07, 1.7]} />
        <Paper />
        <Edges color={ART.red} lineWidth={LINE * 1.2} threshold={20} />
      </mesh>
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} position={[-width / 2 + (i + 0.5) * (width / stripes), 0.04, 0.85]}>
          <boxGeometry args={[width / stripes / 2, 0.01, 1.7]} />
          <meshBasicMaterial color="#f3c9c7" />
        </mesh>
      ))}
      <mesh position={[0, -0.16, 1.7]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[width, 0.32, 0.05]} />
        <Paper />
        <Edges color={ART.red} lineWidth={LINE * 1.2} threshold={20} />
      </mesh>
    </group>
  )
}

export function Retail({ onSelect }: { onSelect: OnSelect }) {
  const cafe0 = RETAIL_LEFT + UNIT * 2
  const right = RETAIL_LEFT + 22
  return (
    <group {...selectHandlers(onSelect)}>
      {/* Three shop units with flats over, and a parapet. */}
      <InkSlab from={[RETAIL_LEFT, 0, -16]} to={[right, 7, -6]} />
      <InkSlab from={[RETAIL_LEFT - 0.1, 7, -16.1]} to={[right + 0.1, 7.45, -5.9]} />
      <InkSlab from={[RETAIL_LEFT, 3.55, -6.02]} to={[right, 3.75, -5.9]} />
      <Panels rects={SHOPFRONTS} position={[RETAIL_LEFT, 0, -5.985]} />
      <Panels rects={UPPER_WINDOWS} position={[RETAIL_LEFT, 0, -5.985]} />
      <Panels rects={RETAIL_SIDE} position={[right + 0.015, 0, -6]} rotation={[0, Math.PI / 2, 0]} />
      {/* Extract flue on the cafe roof. */}
      <InkSlab from={[right - 2.2, 7.45, -13]} to={[right - 1.6, 8.6, -12.4]} />
      <Awning x0={RETAIL_LEFT + 0.2} x1={RETAIL_LEFT + UNIT - 0.2} />
      <Awning x0={RETAIL_LEFT + UNIT + 0.2} x1={cafe0 - 0.2} />
      <Awning x0={cafe0 + 0.2} x1={right - 0.2} />
      {/* Cafe tables out front. */}
      <InkSlab from={[67.2, 0.75, -4.6]} to={[68.2, 0.82, -3.6]} />
      <InkSlab from={[67.65, 0, -4.15]} to={[67.75, 0.75, -4.05]} />
      <InkSlab from={[70, 0.75, -4.6]} to={[71, 0.82, -3.6]} />
      <InkSlab from={[70.45, 0, -4.15]} to={[70.55, 0.75, -4.05]} />
    </group>
  )
}

// ── house ───────────────────────────────────────────────────────────

const HOUSE_FRONT: Rect[] = [
  [0.9, 0.9, 1.9, 1.4],
  [6.9, 0.9, 1.9, 1.4],
  [0.9, 3.4, 1.9, 1.35],
  [4.05, 3.4, 1.9, 1.35],
  [6.9, 3.4, 1.9, 1.35],
]
const HOUSE_DOOR: Rect[] = [[4.3, 0, 1.3, 2.3]]
const HOUSE_SIDE: Rect[] = [
  [2.2, 0.9, 1.6, 1.4],
  [2.2, 3.4, 1.6, 1.35],
  [5.2, 3.4, 1.6, 1.35],
]

function Roof() {
  const geometry = useMemo(() => {
    const half = 4.35
    const shape = new THREE.Shape()
    shape.moveTo(-half, 0)
    shape.lineTo(half, 0)
    shape.lineTo(0, 2.9)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 10.6, bevelEnabled: false })
  }, [])
  return (
    <mesh geometry={geometry} position={[83.7, 5.6, -13]} rotation={[0, Math.PI / 2, 0]}>
      <Paper color="#eef5fa" />
      <Edges color={ART.ink} lineWidth={LINE} threshold={20} />
    </mesh>
  )
}

const FENCE_BOARDS: Rect[] = Array.from({ length: 11 }, (_, i) => [0.02 + i * 0.16, 0.05, 0.14, 1.4] as Rect)

function FencePanel({ position, turn }: { position: Vec3; turn: number }) {
  return (
    <group position={position} rotation={[0, turn, 0]}>
      <InkBox position={[0.9, 0.75, 0]} size={[1.8, 1.5, 0.06]} color={ART.timber} ink={ART.timberInk} />
      <Panels rects={FENCE_BOARDS} position={[0, 0, 0.035]} color={ART.timber} ink={ART.timberInk} />
      <InkBox position={[0, 0.8, 0]} size={[0.12, 1.6, 0.12]} color={ART.timber} ink={ART.timberInk} />
    </group>
  )
}

export function House({ onSelect }: { onSelect: OnSelect }) {
  const sidePanels = useMemo(() => Array.from({ length: 9 }, (_, i) => -19 + i * 1.8), [])
  const frontPanels = useMemo(() => [77.9, 79.7, 81.5], [])
  return (
    <group {...selectHandlers(onSelect)}>
      <InkSlab from={[84, 0, -17]} to={[94, 5.6, -9]} />
      <Roof />
      <InkSlab from={[91.2, 7, -14.6]} to={[92.1, 9.2, -13.7]} />
      <Panels rects={HOUSE_FRONT} position={[84, 0, -8.985]} />
      <Panels rects={HOUSE_DOOR} position={[84, 0, -8.98]} color={ART.paper} />
      <Panels rects={HOUSE_SIDE} position={[94.015, 0, -9]} rotation={[0, Math.PI / 2, 0]} />
      {/* Porch canopy over the door. */}
      <InkSlab from={[87.9, 2.45, -9]} to={[90, 2.6, -8.2]} />
      {/* Lawn and the timber fence round it. */}
      <InkSlab from={[77.8, 0, -19.2]} to={[83.6, 0.04, -3.2]} color={ART.grass} ink={ART.grassInk} />
      {sidePanels.map((z) => (
        <FencePanel key={z} position={[77.9, 0, z + 1.8]} turn={Math.PI / 2} />
      ))}
      {frontPanels.map((x) => (
        <FencePanel key={x} position={[x, 0, -3.1]} turn={0} />
      ))}
      {/* Driveway, car and the charger post. */}
      <InkSlab from={[95, 0, -12]} to={[102.5, 0.03, -0.6]} color="#e8edf0" />
      <Car position={[100.4, 0.03, -6]} turn={Math.PI / 2} />
      <InkSlab from={[98.15, 0, -6.72]} to={[98.45, 1.4, -6.48]} />
      <InkSlab from={[98.2, 0.95, -6.47]} to={[98.4, 1.2, -6.46]} color="#54b54d" ink="#2f8a3a" />
    </group>
  )
}

// ── trees and verges ────────────────────────────────────────────────

/** Rows of poplars, one instanced crown and trunk for the whole strip. */
export function Poplars({ spots }: { spots: [number, number][] }) {
  const crowns = useRef<THREE.InstancedMesh>(null)
  const trunks = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    spots.forEach(([x, z], i) => {
      const h = 0.9 + ((i * 37) % 7) / 20
      o.position.set(x, 1.3 + 2.6 * h, z)
      o.scale.set(0.95, 2.6 * h, 0.95)
      o.updateMatrix()
      crowns.current?.setMatrixAt(i, o.matrix)
      o.position.set(x, 0.7, z)
      o.scale.set(1, 1, 1)
      o.updateMatrix()
      trunks.current?.setMatrixAt(i, o.matrix)
    })
    if (crowns.current) {
      crowns.current.instanceMatrix.needsUpdate = true
      crowns.current.computeBoundingSphere()
    }
    if (trunks.current) {
      trunks.current.instanceMatrix.needsUpdate = true
      trunks.current.computeBoundingSphere()
    }
  }, [spots])
  return (
    <group>
      <instancedMesh ref={crowns} args={[undefined, undefined, spots.length]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshToonMaterial color={ART.tree} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.4} color={ART.treeInk} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, spots.length]}>
        <cylinderGeometry args={[0.1, 0.13, 1.4, 8]} />
        <meshBasicMaterial color={ART.trunk} />
      </instancedMesh>
    </group>
  )
}
