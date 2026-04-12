'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Mesh, Group, Plane } from 'three'

const SPHERE_DATA = [
  { position: [0, 0, 0] as [number, number, number], radius: 0.8, color: '#004d70' },
  { position: [1.5, 0.5, -0.5] as [number, number, number], radius: 0.6, color: '#1a82a2' },
  { position: [-1, 1, 0.5] as [number, number, number], radius: 0.5, color: '#44af43' },
  { position: [0.5, -1, 1] as [number, number, number], radius: 0.7, color: '#2a9fc5' },
  { position: [-1.5, -0.5, -1] as [number, number, number], radius: 0.45, color: '#339932' },
]

export function HeroSpheres() {
  const groupRef = useRef<Group>(null)
  const sphereRefs = useRef<(Mesh | null)[]>([])
  const { camera } = useThree()

  const mouseWorldPos = useMemo(() => new Vector3(), [])
  const raycasterPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])
  const tempDir = useMemo(() => new Vector3(), [])
  const tempRayOrigin = useMemo(() => new Vector3(), [])
  const tempRayDir = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    const { pointer } = state

    // Group rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.1
    }

    // Unproject pointer to world space
    tempRayOrigin.set(pointer.x, pointer.y, 0).unproject(camera)
    tempRayDir.copy(tempRayOrigin).sub(camera.position).normalize()

    const denom = raycasterPlane.normal.dot(tempRayDir)
    if (Math.abs(denom) > 0.0001) {
      const t = -(raycasterPlane.normal.dot(camera.position) + raycasterPlane.constant) / denom
      mouseWorldPos.copy(camera.position).add(tempRayDir.multiplyScalar(t))
    }

    // Individual sphere float oscillation + mouse repulsion
    for (let i = 0; i < SPHERE_DATA.length; i++) {
      const mesh = sphereRefs.current[i]
      if (!mesh) continue

      const s = SPHERE_DATA[i]
      const phase = i * 1.3

      const baseX = s.position[0] + Math.sin(elapsed * 0.4 + phase) * 0.15
      const baseY = s.position[1] + Math.cos(elapsed * 0.3 + phase * 0.7) * 0.2
      const baseZ = s.position[2] + Math.sin(elapsed * 0.25 + phase * 1.2) * 0.1

      // Mouse repulsion (intensity 3)
      tempDir.set(baseX - mouseWorldPos.x, baseY - mouseWorldPos.y, baseZ - mouseWorldPos.z)
      const distSq = tempDir.lengthSq()
      const force = 3 / (distSq + 1)
      const maxDisplacement = 2
      tempDir.normalize().multiplyScalar(Math.min(force, maxDisplacement))

      mesh.position.set(
        baseX + tempDir.x,
        baseY + tempDir.y,
        baseZ + tempDir.z
      )
    }
  })

  return (
    <group ref={groupRef}>
      {SPHERE_DATA.map((s, i) => {
        const sphereOpacity = 0.5 + (i % 3) * 0.1
        return (
          <mesh
            key={i}
            ref={(el) => { sphereRefs.current[i] = el }}
            position={s.position}
          >
            <sphereGeometry args={[s.radius, 32, 32]} />
            <meshStandardMaterial
              color={s.color}
              transparent
              opacity={sphereOpacity}
              emissive={s.color}
              emissiveIntensity={0.25}
            />
          </mesh>
        )
      })}
    </group>
  )
}
