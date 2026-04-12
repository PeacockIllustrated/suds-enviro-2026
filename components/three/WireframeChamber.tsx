'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { STLModel } from './STLModel'
import type { Group } from 'three'
import { MathUtils } from 'three'

interface WireframeChamberProps {
  autoRotate?: boolean
  rotateSpeed?: number
  exploded?: boolean
}

/**
 * Composes the SIC (Standard Inspection Chamber) STL parts into a
 * wireframe/blueprint-style 3D chamber model.
 *
 * Parts:
 *   lid         - top cover (green wireframe)
 *   body        - corrugated twinwall shaft (blue wireframe)
 *   body-bottom - lower section of the body (blue wireframe)
 *   base        - bottom base plate (green wireframe)
 *   inlet       - inlet pipe connector (blue wireframe)
 *
 * All STL files are in mm from CAD. We scale uniformly to fit
 * a roughly 2-3 unit bounding box inside the Canvas.
 */

const MODEL_BASE = '/models/sic'
const SCALE = 0.003

// Blueprint colours
const BLUE = '#1a82a2'
const BLUE_DARK = '#14708f'
const GREEN = '#44af43'

// Assembled Y-axis offsets (tuned to stack the parts)
const ASSEMBLED = {
  lid: 1.3,
  body: 0.3,
  bodyBottom: -0.6,
  base: -1.1,
  inlet: 0,
}

// Exploded Y-axis offsets
const EXPLODED = {
  lid: 2.2,
  body: 0.7,
  bodyBottom: -0.6,
  base: -1.6,
  inlet: 0,
}

// Inlet X offset when exploded
const INLET_X_EXPLODED = 0.6

export function WireframeChamber({
  autoRotate = true,
  rotateSpeed = 0.3,
  exploded = false,
}: WireframeChamberProps) {
  const groupRef = useRef<Group>(null)

  // Smoothly lerp positions between assembled/exploded
  const currentOffsets = useRef({
    lidY: ASSEMBLED.lid,
    bodyY: ASSEMBLED.body,
    bodyBottomY: ASSEMBLED.bodyBottom,
    baseY: ASSEMBLED.base,
    inletX: 0,
  })

  useFrame((_state, delta) => {
    // Auto-rotation
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotateSpeed
    }

    // Lerp offsets toward target (assembled or exploded)
    const target = exploded ? EXPLODED : ASSEMBLED
    const lerpFactor = 1 - Math.pow(0.001, delta)
    const c = currentOffsets.current

    c.lidY = MathUtils.lerp(c.lidY, target.lid, lerpFactor)
    c.bodyY = MathUtils.lerp(c.bodyY, target.body, lerpFactor)
    c.bodyBottomY = MathUtils.lerp(c.bodyBottomY, target.bodyBottom, lerpFactor)
    c.baseY = MathUtils.lerp(c.baseY, target.base, lerpFactor)
    c.inletX = MathUtils.lerp(
      c.inletX,
      exploded ? INLET_X_EXPLODED : 0,
      lerpFactor
    )
  })

  return (
    <group ref={groupRef}>
      {/* Lid - green wireframe */}
      <STLModel
        url={`${MODEL_BASE}/lid.stl`}
        color={GREEN}
        fillOpacity={0.04}
        position={[0, ASSEMBLED.lid, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={SCALE}
      />

      {/* Body - blue wireframe (corrugated shaft) */}
      <STLModel
        url={`${MODEL_BASE}/body.stl`}
        color={BLUE}
        fillOpacity={0.03}
        position={[0, ASSEMBLED.body, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={SCALE}
      />

      {/* Body bottom - darker blue wireframe */}
      <STLModel
        url={`${MODEL_BASE}/body-bottom.stl`}
        color={BLUE_DARK}
        fillOpacity={0.04}
        position={[0, ASSEMBLED.bodyBottom, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={SCALE}
      />

      {/* Base - green wireframe */}
      <STLModel
        url={`${MODEL_BASE}/base.stl`}
        color={GREEN}
        fillOpacity={0.04}
        position={[0, ASSEMBLED.base, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={SCALE}
      />

      {/* Inlet pipe - blue wireframe */}
      <STLModel
        url={`${MODEL_BASE}/inlet.stl`}
        color={BLUE}
        fillOpacity={0.04}
        position={[0, ASSEMBLED.inlet, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={SCALE}
      />
    </group>
  )
}
