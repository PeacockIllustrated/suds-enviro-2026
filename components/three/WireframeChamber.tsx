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
const SCALE = 0.003

const BLUE = '#1a82a2'
const BLUE_DARK = '#14708f'
const GREEN = '#44af43'

const ASSEMBLED = {
  lid: 1.3,
  body: 0.3,
  bodyBottom: -0.6,
  base: -1.1,
  inletY: -0.8,
  inletX: 0,
}

const EXPLODED = {
  lid: 2.8,
  body: 0.8,
  bodyBottom: -0.8,
  base: -2.2,
  inletY: -0.8,
  inletX: 1.2,
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

    // Determine target based on scrollProgress (0-1) or exploded boolean
    let t: number
    if (scrollProgress !== undefined) {
      t = MathUtils.clamp(scrollProgress, 0, 1)
    } else {
      t = exploded ? 1 : 0
    }

    const lerpFactor = 1 - Math.pow(0.005, delta)

    // Lerp each part position
    if (lidRef.current) {
      const targetY = MathUtils.lerp(ASSEMBLED.lid, EXPLODED.lid, t)
      lidRef.current.position.y = MathUtils.lerp(lidRef.current.position.y, targetY, lerpFactor)
    }
    if (bodyRef.current) {
      const targetY = MathUtils.lerp(ASSEMBLED.body, EXPLODED.body, t)
      bodyRef.current.position.y = MathUtils.lerp(bodyRef.current.position.y, targetY, lerpFactor)
    }
    if (bodyBottomRef.current) {
      const targetY = MathUtils.lerp(ASSEMBLED.bodyBottom, EXPLODED.bodyBottom, t)
      bodyBottomRef.current.position.y = MathUtils.lerp(bodyBottomRef.current.position.y, targetY, lerpFactor)
    }
    if (baseRef.current) {
      const targetY = MathUtils.lerp(ASSEMBLED.base, EXPLODED.base, t)
      baseRef.current.position.y = MathUtils.lerp(baseRef.current.position.y, targetY, lerpFactor)
    }
    if (inletRef.current) {
      const targetX = MathUtils.lerp(ASSEMBLED.inletX, EXPLODED.inletX, t)
      const targetY = MathUtils.lerp(ASSEMBLED.inletY, EXPLODED.inletY, t)
      inletRef.current.position.x = MathUtils.lerp(inletRef.current.position.x, targetX, lerpFactor)
      inletRef.current.position.y = MathUtils.lerp(inletRef.current.position.y, targetY, lerpFactor)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={lidRef} position={[0, ASSEMBLED.lid, 0]}>
        <STLModel
          url={`${MODEL_BASE}/lid.stl`}
          color={GREEN}
          fillOpacity={0.04}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      <group ref={bodyRef} position={[0, ASSEMBLED.body, 0]}>
        <STLModel
          url={`${MODEL_BASE}/body.stl`}
          color={BLUE}
          fillOpacity={0.03}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      <group ref={bodyBottomRef} position={[0, ASSEMBLED.bodyBottom, 0]}>
        <STLModel
          url={`${MODEL_BASE}/body-bottom.stl`}
          color={BLUE_DARK}
          fillOpacity={0.04}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      <group ref={baseRef} position={[0, ASSEMBLED.base, 0]}>
        <STLModel
          url={`${MODEL_BASE}/base.stl`}
          color={GREEN}
          fillOpacity={0.04}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>

      <group ref={inletRef} position={[ASSEMBLED.inletX, ASSEMBLED.inletY, 0]}>
        <STLModel
          url={`${MODEL_BASE}/inlet.stl`}
          color={BLUE}
          fillOpacity={0.04}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={SCALE}
        />
      </group>
    </group>
  )
}
