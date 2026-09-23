'use client'

import { Component, Suspense, useMemo, type ReactNode } from 'react'
import { Edges } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { InkOutlines, TOON, ToonModel, toonRamp } from '@/components/site/three/toon'
import { ART, LINE, Paper } from './lineArt'
import {
  MODELS,
  PRODUCT_SCALE,
  productBase,
  productHeight,
  productRadius,
  productTop,
  productZ,
  MODULE,
  storageBox,
  type ProductPlacement,
  type StorageSpec,
} from './explorerLayout'

/**
 * A library product placed in the section. Each model has its own
 * Suspense and error boundary, so a slow or missing file only ever leaves
 * a drawn placeholder in its own spot and never blanks the scene.
 *
 * Inserts (the RhinoPod, the vortex regulator) stand in a housing drawn
 * cut in half along the section line, so the insert shows inside it.
 * Products that sit deeper than their own top get an access riser up to
 * the finished surface, with a cover and frame on it.
 */

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
 * cover and frame finished just proud of the surface, as on the products'
 * data sheets. Shared with the water journey.
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
      <mesh position={[0, to - 0.015, 0]}>
        <cylinderGeometry args={[radius * 1.18, radius * 1.18, 0.1, 32]} />
        <Paper color={ART.asphalt} />
        <Edges color={ART.asphaltInk} lineWidth={LINE} threshold={20} />
      </mesh>
    </group>
  )
}

/** The back half of a chamber or gully, open towards the viewer, with benching, a sump and its cover frame. */
function Housing({ radius, height }: { radius: number; height: number }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 36, 1, true, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#eef6fb" side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        <Edges color={ART.ink} lineWidth={LINE} threshold={20} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[radius, radius, 0.08, 36, 1, false, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#dcebf4" />
        <Edges color={ART.ink} lineWidth={LINE} threshold={20} />
      </mesh>
      {/* Cover frame at the surface. */}
      <mesh position={[0, height - 0.035, 0]}>
        <cylinderGeometry args={[radius * 1.08, radius * 1.08, 0.1, 36, 1, false, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color={ART.asphalt} />
        <Edges color={ART.asphaltInk} lineWidth={LINE} threshold={20} />
      </mesh>
    </group>
  )
}

function LibraryModel({ placement, reveal }: { placement: ProductPlacement; reveal: number }) {
  const spec = MODELS[placement.model]
  const [cx, cz] = spec.centreMm ?? [0, 0]
  const [ix, iy] = spec.insert ? [spec.insert.x * PRODUCT_SCALE, spec.insert.y * PRODUCT_SCALE] : [0, 0]
  // Laid against the flow, the whole product (and any insert in it) turns half round.
  return (
    <group rotation={[0, (placement.flow ?? 1) < 0 ? Math.PI : 0, 0]}>
      <group position={[ix, iy, 0]} rotation={[0, spec.turn ?? 0, 0]}>
        <group position={[-cx * PRODUCT_SCALE, 0, -cz * PRODUCT_SCALE]}>
          <ToonModel url={spec.url} roles={spec.roles} reveal={reveal} scale={PRODUCT_SCALE} thickness={1.1} />
        </group>
      </group>
    </group>
  )
}

export function ExplorerProduct({ placement, selected, onSelect }: {
  placement: ProductPlacement
  selected: boolean
  onSelect: (id: string) => void
}) {
  const spec = MODELS[placement.model]
  const height = productHeight(placement)
  const radius = productRadius(placement)
  const base = productBase(placement)
  const top = productTop(placement)
  const z = productZ(placement)
  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onSelect(placement.id)
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const t = e.nativeEvent.target
      if (t instanceof HTMLElement) t.style.cursor = 'pointer'
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      const t = e.nativeEvent.target
      if (t instanceof HTMLElement) t.style.cursor = ''
    },
  }
  const placeholder = <Placeholder height={spec.heightMm * PRODUCT_SCALE} radius={spec.radiusMm * PRODUCT_SCALE} />
  // Below ground and short of the surface: an access riser up to it.
  const needsRiser = base < -0.05 && top < -0.05
  return (
    <group {...handlers}>
      <group position={[placement.x, base, z]}>
        {spec.housing ? <Housing radius={radius} height={height} /> : null}
        <ModelBoundary fallback={placeholder}>
          <Suspense fallback={placeholder}>
            <LibraryModel placement={placement} reveal={selected ? 1 : 0} />
          </Suspense>
        </ModelBoundary>
      </group>
      {needsRiser ? <Riser x={placement.x} z={z} radius={Math.min(spec.radiusMm, 330) * PRODUCT_SCALE} from={top - 0.02} to={0} /> : null}
    </group>
  )
}

const DASH = { dashed: true, dashSize: 0.22, gapSize: 0.14 } as const

/**
 * Attenuation storage, illustrative: geocellular crate modules (1000 x 400
 * x 500 mm, a common size, at the product scale) wrapped in a membrane,
 * standing in front of the cut with water held in the lower part, and an
 * inspection and vent pipe up to the surface. Dashed, so it never passes
 * for a product model; storage is sized per site.
 */
export function ExplorerStorage({ spec }: { spec: StorageSpec }) {
  const box = storageBox(spec)
  const [mx, my, mz] = MODULE
  const [nx, ny] = spec.count
  const width = box.max[0] - box.min[0]
  const height = box.max[1] - box.min[1]
  const depth = box.max[2] - box.min[2]
  // The front row of modules as a lattice; the block behind reads through the membrane.
  const cells: [number, number, number][] = []
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) cells.push([box.min[0] + (i + 0.5) * mx, box.min[1] + (j + 0.5) * my, box.max[2] - mz / 2])
  const water = Math.min(height * 0.42, height - 0.06)
  const ventX = box.max[0] - 0.5
  return (
    <group>
      <mesh position={[box.min[0] + width / 2, box.min[1] + 0.02 + water / 2, box.min[2] + depth / 2]}>
        <boxGeometry args={[width - 0.06, water, depth - 0.06]} />
        <meshBasicMaterial color={TOON.water} transparent opacity={0.75} />
      </mesh>
      {cells.map((p) => (
        <mesh key={`${p[0]}-${p[1]}`} position={p}>
          <boxGeometry args={[mx, my, mz]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
          <Edges color={ART.ink} lineWidth={LINE} threshold={20} {...DASH} />
        </mesh>
      ))}
      <mesh position={[box.min[0] + width / 2, box.min[1] + height / 2, box.min[2] + depth / 2]}>
        <boxGeometry args={[width + 0.08, height + 0.08, depth + 0.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        <Edges color={ART.inkDark} lineWidth={LINE * 1.2} threshold={20} />
      </mesh>
      <mesh position={[ventX, box.max[1] / 2, box.max[2] - 0.35]}>
        <cylinderGeometry args={[0.1, 0.1, -box.max[1], 16]} />
        <meshToonMaterial color={TOON.body} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.1} color={TOON.ink} angle={0} />
      </mesh>
      <mesh position={[ventX, 0.02, box.max[2] - 0.35]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 20]} />
        <Paper color={ART.asphalt} />
        <Edges color={ART.asphaltInk} lineWidth={LINE} threshold={20} />
      </mesh>
    </group>
  )
}
