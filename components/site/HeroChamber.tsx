'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ClockPosition } from '@/lib/types'

/**
 * Parametric chamber for the marketing hero.
 *
 * Deliberately not the STL assembly the configurator uses. Those meshes
 * are manufacturing-accurate and weigh 1.19 MB gzipped, which is the
 * wrong trade for a hero that only needs to read as a chamber. This is
 * generated in code: nothing to download, and the inlet ring is derived
 * from the manufactured clock positions, so it stays true to the product.
 */

const BLUE = '#1d80b9'
const BLUE_DARK = '#005576'
const GREEN = '#54b54d'
const LIGHT = '#afdbf4'

/** Inlets are manufactured at these positions; the outlet is fixed at 12. */
const INLETS: ClockPosition[] = ['3', '5', '6', '7', '9']
const OUTLET_HOUR = 12

const BODY_RADIUS = 1
const BODY_HEIGHT = 2.6
const RIB_COUNT = 11
const PIPE_RADIUS = 0.17
const PIPE_LENGTH = 0.75

/** Clock hour to a direction on the horizontal plane, 12 being north. */
function clockDirection(hour: number): THREE.Vector3 {
  const angle = (hour / 12) * Math.PI * 2
  return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle))
}

function Pipe({ hour, colour, y }: { hour: number; colour: string; y: number }) {
  const direction = clockDirection(hour)
  const distance = BODY_RADIUS + PIPE_LENGTH / 2 - 0.08

  return (
    <group
      position={[direction.x * distance, y, direction.z * distance]}
      rotation={[0, Math.atan2(direction.x, direction.z), Math.PI / 2]}
    >
      <mesh>
        <cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, PIPE_LENGTH, 24, 1, true]} />
        <meshBasicMaterial color={colour} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, PIPE_LENGTH, 24, 1, true]} />
        <meshStandardMaterial
          color={colour}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function HeroChamber() {
  const group = useRef<THREE.Group>(null)

  // Corrugation rings, evenly spaced up the shaft.
  const ribs = useMemo(
    () =>
      Array.from({ length: RIB_COUNT }, (_, i) => {
        const t = (i + 0.5) / RIB_COUNT
        return -BODY_HEIGHT / 2 + t * BODY_HEIGHT
      }),
    [],
  )

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18
  })

  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      {/* Shaft */}
      <mesh>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_HEIGHT, 48, 1, true]} />
        <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.22} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_HEIGHT, 48, 1, true]} />
        <meshStandardMaterial
          color={BLUE}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {ribs.map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BODY_RADIUS, 0.028, 8, 64]} />
          <meshStandardMaterial color={LIGHT} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Cover. Unlit, so it holds the exact brand navy instead of
          washing out to slate under the scene lights. */}
      <mesh position={[0, BODY_HEIGHT / 2 + 0.07, 0]}>
        <cylinderGeometry args={[BODY_RADIUS * 1.06, BODY_RADIUS * 1.06, 0.14, 48]} />
        <meshBasicMaterial color={BLUE_DARK} transparent opacity={0.9} />
      </mesh>

      {/* Sump */}
      <mesh position={[0, -BODY_HEIGHT / 2 - 0.16, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS * 0.94, 0.32, 48]} />
        <meshStandardMaterial color={GREEN} transparent opacity={0.16} />
      </mesh>
      <mesh position={[0, -BODY_HEIGHT / 2 - 0.16, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS * 0.94, 0.32, 48, 1, true]} />
        <meshBasicMaterial color={GREEN} wireframe transparent opacity={0.35} />
      </mesh>

      {INLETS.map((position) => (
        <Pipe key={position} hour={Number(position)} colour={BLUE} y={-0.35} />
      ))}
      <Pipe hour={OUTLET_HOUR} colour={GREEN} y={-0.75} />
    </group>
  )
}
