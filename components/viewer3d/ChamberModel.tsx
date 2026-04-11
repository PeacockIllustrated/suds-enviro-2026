'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useWizardContext } from '@/components/wizard/WizardContext'
import {
  getDiameterValue,
  getDepthValue,
  getPositionsValue,
  getPipeSizesValue,
  getOutletLockedValue,
} from '@/components/wizard/steps/helpers'

// Scale factor: 1 unit = 100mm
const SCALE = 1 / 100

// Pipe radius by size string (approximate external diameter)
const PIPE_RADIUS: Record<string, number> = {
  '110mm EN1401': 55 * SCALE,
  '160mm EN1401': 80 * SCALE,
  '225mm Twinwall': 112 * SCALE,
  '300mm Twinwall': 150 * SCALE,
  '450mm Twinwall': 225 * SCALE,
}

const SUMP_HEIGHT = 350 * SCALE

function clockToAngle(hour: number): number {
  return (hour / 12) * Math.PI * 2
}

export function ChamberModel() {
  const { state } = useWizardContext()

  const diameterVal = getDiameterValue(state) ?? 600
  const depthVal = getDepthValue(state) ?? 1500
  const positions = getPositionsValue(state)
  const pipeSizes = getPipeSizesValue(state)
  const outletLocked = getOutletLockedValue(state)

  const diameter = diameterVal * SCALE
  const radius = diameter / 2
  const wallThickness = 12 * SCALE
  const depth = depthVal * SCALE
  const totalHeight = depth + SUMP_HEIGHT

  // Chamber body
  const bodyGeom = useMemo(
    () => new THREE.CylinderGeometry(radius, radius, totalHeight, 32, 1, true),
    [radius, totalHeight]
  )

  // Inner wall
  const innerRadius = radius - wallThickness
  const innerGeom = useMemo(
    () => new THREE.CylinderGeometry(innerRadius, innerRadius, totalHeight, 32, 1, true),
    [innerRadius, totalHeight]
  )

  // Cover plate
  const coverGeom = useMemo(
    () => new THREE.CylinderGeometry(radius + 2 * SCALE, radius + 2 * SCALE, 3 * SCALE, 32),
    [radius]
  )

  // Sump disc
  const sumpGeom = useMemo(
    () => new THREE.CylinderGeometry(innerRadius, innerRadius, 2 * SCALE, 32),
    [innerRadius]
  )

  // Pipe dimensions
  const pipeLength = radius * 1.2
  const outletSize = outletLocked ?? '160mm EN1401'
  const outletRadius = PIPE_RADIUS[outletSize] ?? 80 * SCALE

  return (
    <group>
      {/* Chamber body - outer wall */}
      <mesh geometry={bodyGeom}>
        <meshStandardMaterial
          color="#004d70"
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Inner wall (slightly visible) */}
      <mesh geometry={innerGeom}>
        <meshStandardMaterial
          color="#1a82a2"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Base */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -totalHeight / 2, 0]}
      >
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color="#003a54" />
      </mesh>

      {/* Cover plate */}
      <mesh geometry={coverGeom} position={[0, totalHeight / 2 + 1.5 * SCALE, 0]}>
        <meshStandardMaterial color="#1a3a50" />
      </mesh>

      {/* Cover ring */}
      <mesh position={[0, totalHeight / 2, 0]}>
        <torusGeometry args={[radius, 2 * SCALE, 8, 32]} />
        <meshStandardMaterial color="#0a1e2e" />
      </mesh>

      {/* Sump zone indicator */}
      <mesh
        geometry={sumpGeom}
        position={[0, -totalHeight / 2 + SUMP_HEIGHT / 2, 0]}
      >
        <meshStandardMaterial color="#1a82a2" transparent opacity={0.25} />
      </mesh>

      {/* Inlet pipes */}
      {positions.map((pos, i) => {
        const hour = parseInt(pos)
        const angle = clockToAngle(hour)
        const slot = `inlet${i + 1}`
        const size = pipeSizes[slot] ?? '160mm EN1401'
        const pipeRad = PIPE_RADIUS[size] ?? 80 * SCALE

        // Position pipe at 75% of chamber height
        const pipeY = totalHeight / 2 * 0.5 - i * 30 * SCALE

        const dx = Math.sin(angle)
        const dz = Math.cos(angle)

        return (
          <group
            key={pos}
            position={[
              dx * (radius + pipeLength / 2),
              pipeY,
              dz * (radius + pipeLength / 2),
            ]}
            rotation={[0, -angle + Math.PI / 2, Math.PI / 2]}
          >
            <mesh>
              <cylinderGeometry args={[pipeRad, pipeRad, pipeLength, 16]} />
              <meshStandardMaterial color="#1a82a2" />
            </mesh>
          </group>
        )
      })}

      {/* Outlet pipe at 6 o'clock */}
      {(() => {
        const angle = clockToAngle(6)
        const dx = Math.sin(angle)
        const dz = Math.cos(angle)
        const pipeY = -totalHeight / 2 + SUMP_HEIGHT + 50 * SCALE

        return (
          <group
            position={[
              dx * (radius + pipeLength / 2),
              pipeY,
              dz * (radius + pipeLength / 2),
            ]}
            rotation={[0, -angle + Math.PI / 2, Math.PI / 2]}
          >
            <mesh>
              <cylinderGeometry args={[outletRadius, outletRadius, pipeLength, 16]} />
              <meshStandardMaterial color="#44af43" />
            </mesh>
          </group>
        )
      })()}
    </group>
  )
}
