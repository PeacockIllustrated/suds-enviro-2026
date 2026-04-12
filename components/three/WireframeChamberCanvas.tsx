'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { WireframeChamber } from './WireframeChamber'

interface WireframeChamberCanvasProps {
  exploded?: boolean
  dark?: boolean
  scrollProgress?: number
}

export default function WireframeChamberCanvas({
  exploded = false,
  dark = false,
  scrollProgress,
}: WireframeChamberCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 3.5], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      {dark && <color attach="background" args={['#071828']} />}

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} />
      <directionalLight position={[-3, 4, -2]} intensity={0.2} />

      <Suspense fallback={null}>
        <WireframeChamber
          exploded={exploded}
          scrollProgress={scrollProgress}
          rotateSpeed={0.2}
        />
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  )
}
