'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ParticleField } from '@/components/three/ParticleField'
import { WireframeChamber } from '@/components/three/WireframeChamber'

interface HeroCanvasProps {
  scrollProgress: number
}

export default function HeroCanvas({ scrollProgress }: HeroCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 5], fov: 38 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} />
      <directionalLight position={[-3, 4, -2]} intensity={0.15} />

      <Suspense fallback={null}>
        {/* Wireframe particles - outline style, fewer count */}
        <ParticleField
          count={10}
          sizeRange={[0.15, 0.6]}
          spread={14}
          speed={0.1}
          mouseIntensity={1}
          opacity={0.25}
          outline
        />

        {/* Chamber model - positioned to the right */}
        <group position={[1.8, -0.2, 0]}>
          <WireframeChamber
            scrollProgress={scrollProgress}
            rotateSpeed={0.15}
          />
        </group>
      </Suspense>

      <OrbitControls
        enableRotate={false}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  )
}
