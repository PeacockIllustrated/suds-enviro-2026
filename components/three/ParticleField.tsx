'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Mesh, Plane } from 'three'

interface ParticleFieldProps {
  count?: number
  colors?: string[]
  sizeRange?: [number, number]
  spread?: number
  speed?: number
  mouseIntensity?: number
  opacity?: number
  outline?: boolean
}

interface SphereData {
  position: [number, number, number]
  color: string
  radius: number
  phaseX: number
  phaseY: number
  phaseZ: number
}

const DEFAULT_COLORS = ['#004d70', '#1a82a2', '#44af43']

export function ParticleField({
  count = 12,
  colors = DEFAULT_COLORS,
  sizeRange = [0.12, 0.5],
  spread = 12,
  speed = 0.15,
  mouseIntensity = 1.5,
  opacity = 0.35,
  outline = true,
}: ParticleFieldProps) {
  const refs = useRef<(Mesh | null)[]>([])
  const { camera } = useThree()

  const spheres = useMemo<SphereData[]>(() => {
    const result: SphereData[] = []
    for (let i = 0; i < count; i++) {
      const t = i / count
      const golden = (1 + Math.sqrt(5)) / 2
      const theta = 2 * Math.PI * i * golden
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count)

      const r = spread * 0.5 * (0.3 + 0.7 * ((i * 7 + 3) % 11) / 11)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.6
      const z = r * Math.cos(phi) * 0.3 - 2

      const radiusRange = sizeRange[1] - sizeRange[0]
      const radius = sizeRange[0] + radiusRange * ((i * 13 + 5) % 17) / 17

      result.push({
        position: [x, y, z],
        color: colors[i % colors.length],
        radius,
        phaseX: t * Math.PI * 2 + ((i * 3) % 7) * 0.9,
        phaseY: t * Math.PI * 2 + ((i * 5) % 11) * 0.57,
        phaseZ: t * Math.PI * 2 + ((i * 7) % 13) * 0.43,
      })
    }
    return result
  }, [count, colors, sizeRange, spread])

  const mouseWorldPos = useMemo(() => new Vector3(), [])
  const raycasterPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])
  const tempDir = useMemo(() => new Vector3(), [])
  const tempRayOrigin = useMemo(() => new Vector3(), [])
  const tempRayDir = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const { pointer } = state
    const elapsed = state.clock.elapsedTime

    tempRayOrigin.set(pointer.x, pointer.y, 0).unproject(camera)
    tempRayDir.copy(tempRayOrigin).sub(camera.position).normalize()

    const denom = raycasterPlane.normal.dot(tempRayDir)
    if (Math.abs(denom) > 0.0001) {
      const t = -(raycasterPlane.normal.dot(camera.position) + raycasterPlane.constant) / denom
      mouseWorldPos.copy(camera.position).add(tempRayDir.multiplyScalar(t))
    }

    for (let i = 0; i < spheres.length; i++) {
      const mesh = refs.current[i]
      if (!mesh) continue

      const s = spheres[i]
      const baseX = s.position[0] + Math.sin(elapsed * speed + s.phaseX) * 0.4
      const baseY = s.position[1] + Math.cos(elapsed * speed * 0.8 + s.phaseY) * 0.3
      const baseZ = s.position[2] + Math.sin(elapsed * speed * 0.6 + s.phaseZ) * 0.2

      tempDir.set(baseX - mouseWorldPos.x, baseY - mouseWorldPos.y, baseZ - mouseWorldPos.z)
      const distSq = tempDir.lengthSq()
      const force = mouseIntensity / (distSq + 1)
      const maxDisplacement = 1.2
      tempDir.normalize().multiplyScalar(Math.min(force, maxDisplacement))

      mesh.position.set(
        baseX + tempDir.x,
        baseY + tempDir.y,
        baseZ + tempDir.z
      )
    }
  })

  if (outline) {
    // Wireframe outline style matching the chamber blueprint
    return (
      <group>
        {spheres.map((s, i) => (
          <group
            key={i}
            ref={(el) => {
              if (el) {
                const mesh = el.children[0] as Mesh | undefined
                if (mesh) refs.current[i] = mesh
              }
            }}
          >
            <mesh position={s.position}>
              <sphereGeometry args={[s.radius, 12, 12]} />
              <meshBasicMaterial
                color={s.color}
                transparent
                opacity={0.04}
                depthWrite={false}
              />
            </mesh>
            <mesh position={s.position}>
              <sphereGeometry args={[s.radius, 12, 12]} />
              <meshBasicMaterial
                color={s.color}
                wireframe
                transparent
                opacity={opacity}
              />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  return (
    <group>
      {spheres.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el }}
          position={s.position}
        >
          <sphereGeometry args={[s.radius, 16, 16]} />
          <meshStandardMaterial
            color={s.color}
            transparent
            opacity={opacity}
            emissive={s.color}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}
