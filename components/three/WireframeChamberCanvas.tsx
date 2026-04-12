'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { WireframeChamber } from './WireframeChamber'

interface WireframeChamberCanvasProps {
  exploded?: boolean
  dark?: boolean
}

export default function WireframeChamberCanvas({
  exploded = false,
  dark = false,
}: WireframeChamberCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      {dark && <color attach="background" args={['#071828']} />}

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.5} />

      <Suspense fallback={null}>
        <WireframeChamber exploded={exploded} />
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  )
}
