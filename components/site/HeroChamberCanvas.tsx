'use client'

import { Canvas } from '@react-three/fiber'
import { HeroChamber } from './HeroChamber'

/**
 * Canvas for the hero chamber. Default-exported so it can be pulled in
 * with `dynamic(..., { ssr: false })` and kept out of the critical path.
 */
export default function HeroChamberCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 6.2], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={0.5} />
      <directionalLight position={[-3, 2, -4]} intensity={0.25} />
      <HeroChamber />
    </Canvas>
  )
}
