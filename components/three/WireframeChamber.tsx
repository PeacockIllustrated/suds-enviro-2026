'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib'
import * as THREE from 'three'

/**
 * Wireframe chamber with exploded-view animation.
 *
 * All STL parts are loaded without individual centering. The combined
 * bounding box is used to centre the assembly, and each part's own
 * centre-of-mass is computed so the exploded view can spread parts
 * along the Y axis relative to the assembly centre.
 */

interface WireframeChamberProps {
  autoRotate?: boolean
  rotateSpeed?: number
  exploded?: boolean
  scrollProgress?: number
}

const MODEL_BASE = '/models/sic'

const BLUE = '#1a82a2'
const BLUE_DARK = '#14708f'
const GREEN = '#44af43'

// How far parts spread on the Y axis when fully exploded
const EXPLODE_SPREAD = 1.8
// How far the inlet spreads laterally (X axis) when exploded
const INLET_LATERAL = 1.2

const PART_CONFIGS = [
  { color: GREEN, fillOpacity: 0.06, wireOpacity: 0.5 },      // lid
  { color: BLUE, fillOpacity: 0.03, wireOpacity: 0.45 },       // body
  { color: BLUE_DARK, fillOpacity: 0.05, wireOpacity: 0.5 },   // body-bottom
  { color: GREEN, fillOpacity: 0.06, wireOpacity: 0.5 },       // base
  { color: BLUE, fillOpacity: 0.05, wireOpacity: 0.55 },       // inlet
]

export function WireframeChamber({
  autoRotate = true,
  rotateSpeed = 0.3,
  exploded = false,
  scrollProgress,
}: WireframeChamberProps) {
  const groupRef = useRef<THREE.Group>(null)
  const partGroupRefs = useRef<(THREE.Group | null)[]>([null, null, null, null, null])

  const rawGeos = useLoader(
    STLLoader,
    [
      `${MODEL_BASE}/lid.stl`,
      `${MODEL_BASE}/body.stl`,
      `${MODEL_BASE}/body-bottom.stl`,
      `${MODEL_BASE}/base.stl`,
      `${MODEL_BASE}/inlet.stl`,
    ]
  ) as THREE.BufferGeometry[]

  const { parts, partCentresY, inletCentreX, scale } = useMemo(() => {
    const cloned = rawGeos.map((raw) => {
      const geo = raw.clone()
      geo.computeVertexNormals()
      geo.computeBoundingBox()
      return geo
    })

    // Combined bounding box
    const combinedBox = new THREE.Box3()
    for (const geo of cloned) {
      if (geo.boundingBox) combinedBox.union(geo.boundingBox)
    }
    const assemblyCenter = combinedBox.getCenter(new THREE.Vector3())
    const size = combinedBox.getSize(new THREE.Vector3())

    // Per-part centre (in original STL coordinates)
    const centres = cloned.map((geo) => {
      const c = new THREE.Vector3()
      geo.boundingBox!.getCenter(c)
      return c
    })

    // Translate all vertices so assembly is centred at origin
    for (const geo of cloned) {
      geo.translate(-assemblyCenter.x, -assemblyCenter.y, -assemblyCenter.z)
    }

    // Part centres relative to assembly centre (in STL coords, Z = up)
    // After the -90deg X rotation, STL Z becomes scene Y
    const centresY = centres.map((c) => c.z - assemblyCenter.z)
    const inletCX = centres[4].x - assemblyCenter.x

    const maxDim = Math.max(size.x, size.y, size.z)
    const fitScale = maxDim > 0 ? 2.5 / maxDim : 1

    return {
      parts: cloned,
      partCentresY: centresY,
      inletCentreX: inletCX,
      scale: fitScale,
    }
  }, [rawGeos])

  useFrame((_state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotateSpeed
    }

    let t: number
    if (scrollProgress !== undefined) {
      t = THREE.MathUtils.clamp(scrollProgress, 0, 1)
    } else {
      t = exploded ? 1 : 0
    }

    // Ease in-out
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2

    const lerpSpeed = 1 - Math.pow(0.003, delta)

    // Animate each part's Y offset based on its centre-of-mass
    // relative to the assembly. Parts above centre go up, below go down.
    for (let i = 0; i < 5; i++) {
      const ref = partGroupRefs.current[i]
      if (!ref) continue

      // Y spread: direction based on part's relative position
      const dir = partCentresY[i] > 0 ? 1 : -1
      const dist = Math.abs(partCentresY[i])
      const targetY = eased * dir * (EXPLODE_SPREAD + dist * 0.5) * scale
      ref.position.y = THREE.MathUtils.lerp(ref.position.y, targetY, lerpSpeed)

      // Inlet (index 4): also spread laterally
      if (i === 4) {
        const lateralDir = inletCentreX > 0 ? 1 : -1
        const targetX = eased * lateralDir * INLET_LATERAL * scale
        ref.position.x = THREE.MathUtils.lerp(ref.position.x, targetX, lerpSpeed)
      }
    }
  })

  return (
    <group ref={groupRef}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
        {parts.map((geo, i) => {
          const cfg = PART_CONFIGS[i]
          return (
            <group
              key={i}
              ref={(el) => { partGroupRefs.current[i] = el }}
            >
              <mesh geometry={geo}>
                <meshBasicMaterial
                  color={cfg.color}
                  transparent
                  opacity={cfg.fillOpacity}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              <mesh geometry={geo}>
                <meshBasicMaterial
                  color={cfg.color}
                  wireframe
                  transparent
                  opacity={cfg.wireOpacity}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}
