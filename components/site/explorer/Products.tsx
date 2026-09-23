'use client'

import { Component, Suspense, type ReactNode } from 'react'
import { Edges } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ToonModel } from '@/components/site/three/toon'
import { ART, LINE } from './lineArt'
import { MODELS, PRODUCT_SCALE, productHeight, productRadius, productZ, type ProductPlacement } from './explorerLayout'

/**
 * A library product placed in the section. Each model has its own
 * Suspense and error boundary, so a slow or missing file only ever leaves
 * a drawn placeholder in its own spot and never blanks the scene.
 *
 * Inserts (the RhinoPod, the vortex regulator) stand in a housing drawn
 * cut in half along the section line, so the insert shows inside it.
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

/** The back half of a chamber or gully, open towards the viewer. */
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
      <mesh position={[0, height - 0.05, 0]}>
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
  const lift = spec.housing ? spec.housing.insetMm * PRODUCT_SCALE : 0
  // A housed insert sits near the top of a gully, or on the floor of a chamber.
  const y = spec.housing && placement.model === 'rhinopod'
    ? (spec.housing.heightMm - spec.heightMm - spec.housing.insetMm) * PRODUCT_SCALE
    : lift
  return (
    <group position={[0, y, 0]} rotation={[0, spec.turn ?? 0, 0]}>
      <group position={[-cx * PRODUCT_SCALE, 0, -cz * PRODUCT_SCALE]}>
        <ToonModel url={spec.url} roles={spec.roles} reveal={reveal} scale={PRODUCT_SCALE} thickness={1.1} />
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
  const base = placement.top - height
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
  const placeholder = <Placeholder height={spec.housing ? spec.heightMm * PRODUCT_SCALE : height} radius={spec.radiusMm * PRODUCT_SCALE} />
  return (
    <group position={[placement.x, base, productZ(placement)]} {...handlers}>
      {spec.housing ? <Housing radius={radius} height={height} /> : null}
      <ModelBoundary fallback={placeholder}>
        <Suspense fallback={placeholder}>
          <LibraryModel placement={placement} reveal={selected ? 1 : 0} />
        </Suspense>
      </ModelBoundary>
    </group>
  )
}
