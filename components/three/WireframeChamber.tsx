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
  scrollProgress?: number
}

const MODEL_BASE = '/models/sic'
const SCALE = 0.0028

const BLUE = '#1a82a2'
const BLUE_DARK = '#14708f'
const GREEN = '#44af43'

// Assembled positions - parts stacked tightly
const ASSEMBLED = {
  lidY: 1.2,
  bodyY: 0.2,
  bodyBottomY: -0.65,
  baseY: -1.05,
  inletX: 0,
  inletY: -0.75,
  inletZ: 0,
}

// Exploded positions - parts spread apart dramatically
const EXPLODED = {
  lidY: 3.0,
  bodyY: 0.9,
  bodyBottomY: -0.9,
  baseY: -2.5,
  inletX: 1.8,
  inletY: -0.75,
  inletZ: 0.5,
}

export function WireframeChamber({
  autoRotate = true,
  rotateSpeed = 0.3,
  exploded = false,
  scrollProgress,
}: WireframeChamberProps) {
  const groupRef = useRef<Group>(null)
  const lidRef = useRef<Group>(null)
  const bodyRef = useRef<Group>(null)
  const bodyBottomRef = useRef<Group>(null)
  const baseRef = useRef<Group>(null)
  const inletRef = useRef<Group>(null)

  useFrame((_state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotateSpeed
    }

    let t: number
    if (scrollProgress !== undefined) {
      t = MathUtils.clamp(scrollProgress, 0, 1)
    } else {
      t = exploded ? 1 : 0
    }

    // Smooth eased progress (ease-in-out)
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2

    const lerpSpeed = 1 - Math.pow(0.003, delta)

    if (lidRef.current) {
      const target = MathUtils.lerp(ASSEMBLED.lidY, EXPLODED.lidY, eased)
      lidRef.current.position.y = MathUtils.lerp(lidRef.current.position.y, target, lerpSpeed)
    }
    if (bodyRef.current) {
      const target = MathUtils.lerp(ASSEMBLED.bodyY, EXPLODED.bodyY, eased)
      bodyRef.current.position.y = MathUtils.lerp(bodyRef.current.position.y, target, lerpSpeed)
    }
    if (bodyBottomRef.current) {
      const target = MathUtils.lerp(ASSEMBLED.bodyBottomY, EXPLODED.bodyBottomY, eased)
      bodyBottomRef.current.position.y = MathUtils.lerp(bodyBottomRef.current.position.y, target, lerpSpeed)
    }
    if (baseRef.current) {
      const target = MathUtils.lerp(ASSEMBLED.baseY, EXPLODED.baseY, eased)
      baseRef.current.position.y = MathUtils.lerp(baseRef.current.position.y, target, lerpSpeed)
    }
    if (inletRef.current) {
      const targetX = MathUtils.lerp(ASSEMBLED.inletX, EXPLODED.inletX, eased)
      const targetY = MathUtils.lerp(ASSEMBLED.inletY, EXPLODED.inletY, eased)
      const targetZ = MathUtils.lerp(ASSEMBLED.inletZ, EXPLODED.inletZ, eased)
      inletRef.current.position.x = MathUtils.lerp(inletRef.current.position.x, targetX, lerpSpeed)
      inletRef.current.position.y = MathUtils.lerp(inletRef.current.position.y, targetY, lerpSpeed)
      inletRef.current.position.z = MathUtils.lerp(inletRef.current.position.z, targetZ, lerpSpeed)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Lid - green, top cap */}
      <group ref={lidRef} position={[0, ASSEMBLED.lidY, 0]}>
        <STLModel
          url={`${MODEL_BASE}/lid.stl`}
          color={GREEN}
          fillOpacity={0.05}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      {/* Body - blue, corrugated shaft */}
      <group ref={bodyRef} position={[0, ASSEMBLED.bodyY, 0]}>
        <STLModel
          url={`${MODEL_BASE}/body.stl`}
          color={BLUE}
          fillOpacity={0.03}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      {/* Body bottom - connects to base */}
      <group ref={bodyBottomRef} position={[0, ASSEMBLED.bodyBottomY, 0]}>
        <STLModel
          url={`${MODEL_BASE}/body-bottom.stl`}
          color={BLUE_DARK}
          fillOpacity={0.05}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      {/* Base - green, bottom plate */}
      <group ref={baseRef} position={[0, ASSEMBLED.baseY, 0]}>
        <STLModel
          url={`${MODEL_BASE}/base.stl`}
          color={GREEN}
          fillOpacity={0.05}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      {/* Inlet pipe - blue */}
      <group ref={inletRef} position={[ASSEMBLED.inletX, ASSEMBLED.inletY, ASSEMBLED.inletZ]}>
        <STLModel
          url={`${MODEL_BASE}/inlet.stl`}
          color={BLUE}
          fillOpacity={0.05}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>
    </group>
  )
}
