'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib'
import * as THREE from 'three'

/**
 * Assembled inspection chamber using the real STL model parts.
 *
 * All parts are loaded WITHOUT individual centering so they retain
 * their original spatial relationships from the CAD export.
 * The entire assembly is centred by translating geometry vertices
 * before the coordinate-system rotation is applied.
 */

const MODEL_BASE = '/models/sic'

const BLUE = '#1a82a2'
const BLUE_DARK = '#14708f'
const GREEN = '#44af43'

interface InspectionChamber3DProps {
  rotateSpeed?: number
}

export function InspectionChamber3D({
  rotateSpeed = 0.25,
}: InspectionChamber3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Load all geometries at once
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

  // Clone geometries, compute normals, find combined bounding box,
  // then translate all geometry so the assembly is centred at origin
  const { parts, scale } = useMemo(() => {
    const cloned = rawGeos.map((raw) => {
      const geo = raw.clone()
      geo.computeVertexNormals()
      geo.computeBoundingBox()
      return geo
    })

    // Combined bounding box across all parts
    const combinedBox = new THREE.Box3()
    for (const geo of cloned) {
      if (geo.boundingBox) combinedBox.union(geo.boundingBox)
    }

    const center = combinedBox.getCenter(new THREE.Vector3())
    const size = combinedBox.getSize(new THREE.Vector3())

    // Translate all vertices so the assembly is centred at origin
    for (const geo of cloned) {
      geo.translate(-center.x, -center.y, -center.z)
    }

    // Scale factor to fit the model in roughly a 2.5-unit cube
    const maxDim = Math.max(size.x, size.y, size.z)
    const fitScale = maxDim > 0 ? 2.5 / maxDim : 1

    return { parts: cloned, scale: fitScale }
  }, [rawGeos])

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotateSpeed
    }
  })

  const partConfigs: { color: string; fillOpacity: number; wireOpacity: number }[] = [
    { color: GREEN, fillOpacity: 0.12, wireOpacity: 0.5 },       // lid
    { color: BLUE, fillOpacity: 0.04, wireOpacity: 0.45 },       // body
    { color: BLUE_DARK, fillOpacity: 0.08, wireOpacity: 0.5 },   // body-bottom
    { color: GREEN, fillOpacity: 0.12, wireOpacity: 0.5 },       // base
    { color: BLUE, fillOpacity: 0.08, wireOpacity: 0.55 },       // inlet
  ]

  return (
    <group ref={groupRef}>
      {/* STL files are Z-up; rotate to Y-up and apply computed scale */}
      <group rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
        {parts.map((geo, i) => {
          const cfg = partConfigs[i]
          return (
            <group key={i}>
              {/* Semi-transparent fill */}
              <mesh geometry={geo}>
                <meshBasicMaterial
                  color={cfg.color}
                  transparent
                  opacity={cfg.fillOpacity}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              {/* Wireframe overlay */}
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
