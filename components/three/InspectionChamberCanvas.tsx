'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { InspectionChamber3D } from './InspectionChamber3D'

/**
 * Standalone canvas wrapper for the Inspection Chamber 3D model.
 * Used in the product showcase on the marketing homepage.
 *
 * Transparent background so it sits cleanly on the white card.
 */
export default function InspectionChamberCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 3.5], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} />
      <directionalLight position={[-3, 4, -2]} intensity={0.2} />

      <Suspense fallback={null}>
        <InspectionChamber3D rotateSpeed={0.2} />
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  )
}
