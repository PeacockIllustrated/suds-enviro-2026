'use client'

import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib'
import { DoubleSide } from 'three'
import type { BufferGeometry } from 'three'

interface STLModelProps {
  url: string
  color?: string
  fillColor?: string
  fillOpacity?: number
  wireframe?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

export function STLModel({
  url,
  color = '#1a82a2',
  fillColor,
  fillOpacity = 0.05,
  wireframe = true,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: STLModelProps) {
  const rawGeometry = useLoader(STLLoader, url) as BufferGeometry

  const geometry = useMemo(() => {
    const geo = rawGeometry.clone()
    geo.center()
    geo.computeVertexNormals()
    return geo
  }, [rawGeometry])

  const resolvedFillColor = fillColor ?? color
  const scaleArray: [number, number, number] =
    typeof scale === 'number' ? [scale, scale, scale] : scale

  return (
    <group position={position} rotation={rotation} scale={scaleArray}>
      {/* Semi-transparent solid fill for blueprint body */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={resolvedFillColor}
          transparent
          opacity={fillOpacity}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay for blueprint line look */}
      {wireframe && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.6}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
