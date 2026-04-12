'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AmbientCircles } from '@/components/three/AmbientCircles'
import { WireframeChamber } from '@/components/three/WireframeChamber'

interface HeroCanvasProps {
  scrollProgress: number
}

export default function HeroCanvas({ scrollProgress }: HeroCanvasProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 1024)
    }
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Responsive positioning
  const chamberPos: [number, number, number] = isMobile
    ? [0, -1.8, 0]      // centred below text on mobile
    : [2.2, -0.1, 0]    // right side on desktop

  const chamberScale = isMobile ? 0.85 : 1

  return (
    <Canvas
      camera={{
        position: isMobile ? [0, 0, 5.5] : [0, 0.2, 4.5],
        fov: isMobile ? 42 : 36,
      }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, isMobile ? 1 : 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.5} />
      <directionalLight position={[-4, 3, -3]} intensity={0.2} />

      <Suspense fallback={null}>
        {/* Ambient circles - fewer on mobile */}
        <AmbientCircles
          count={isMobile ? 4 : 6}
          spread={isMobile ? 10 : 14}
          speed={0.06}
          mouseIntensity={isMobile ? 1.5 : 2.5}
        />

        {/* Chamber model */}
        <group position={chamberPos} scale={chamberScale}>
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
