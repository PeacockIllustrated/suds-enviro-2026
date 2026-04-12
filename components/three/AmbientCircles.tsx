'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Mesh, Plane } from 'three'

interface AmbientCirclesProps {
  count?: number
  colors?: string[]
  sizeRange?: [number, number]
  spread?: number
  speed?: number
  mouseIntensity?: number
}

interface CircleData {
  position: [number, number, number]
  color: string
  radius: number
  opacity: number
  phaseX: number
  phaseY: number
}

const DEFAULT_COLORS = ['#ccdde8', '#1a82a2', '#44af43', '#004d70']

export function AmbientCircles({
  count = 6,
  colors = DEFAULT_COLORS,
  sizeRange = [0.3, 1.2],
  spread = 12,
  speed = 0.08,
  mouseIntensity = 2.5,
}: AmbientCirclesProps) {
  const refs = useRef<(Mesh | null)[]>([])
  const { camera } = useThree()

  const circles = useMemo<CircleData[]>(() => {
    const result: CircleData[] = []
    for (let i = 0; i < count; i++) {
      const golden = (1 + Math.sqrt(5)) / 2
      const theta = 2 * Math.PI * i * golden

      const r = spread * 0.4 * (0.4 + 0.6 * ((i * 7 + 3) % 11) / 11)
      const x = r * Math.cos(theta) * 0.8
      const y = r * Math.sin(theta) * 0.5
      const z = -2 - ((i * 3) % 5) * 0.5

      const radiusRange = sizeRange[1] - sizeRange[0]
      const radius = sizeRange[0] + radiusRange * ((i * 13 + 5) % 17) / 17

      result.push({
        position: [x, y, z],
        color: colors[i % colors.length],
        radius,
        opacity: 0.06 + ((i * 3) % 7) * 0.012,
        phaseX: ((i * 3) % 7) * 0.9,
        phaseY: ((i * 5) % 11) * 0.57,
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

    for (let i = 0; i < circles.length; i++) {
      const mesh = refs.current[i]
      if (!mesh) continue

      const c = circles[i]
      const baseX = c.position[0] + Math.sin(elapsed * speed + c.phaseX) * 0.3
      const baseY = c.position[1] + Math.cos(elapsed * speed * 0.7 + c.phaseY) * 0.2

      // Gentle mouse/touch repulsion
      tempDir.set(baseX - mouseWorldPos.x, baseY - mouseWorldPos.y, 0)
      const distSq = tempDir.lengthSq()
      const force = mouseIntensity / (distSq + 2)
      tempDir.normalize().multiplyScalar(Math.min(force, 1.0))

      mesh.position.x = baseX + tempDir.x
      mesh.position.y = baseY + tempDir.y
      mesh.position.z = c.position[2]
    }
  })

  return (
    <group>
      {circles.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el }}
          position={c.position}
        >
          <circleGeometry args={[c.radius, 48]} />
          <meshBasicMaterial
            color={c.color}
            transparent
            opacity={c.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
