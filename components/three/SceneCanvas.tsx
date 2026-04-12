'use client'

import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

interface SceneCanvasProps {
  children: ReactNode
  className?: string
}

export default function SceneCanvas({ children, className }: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 50 }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0 }}
      className={className}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      {children}
    </Canvas>
  )
}
