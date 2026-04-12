'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ParticleField } from '@/components/three/ParticleField'

const Scene = dynamic(() => import('@/components/three/SceneCanvas'), { ssr: false })

const ChamberModel = dynamic(
  () => import('@/components/three/WireframeChamberCanvas'),
  { ssr: false }
)

export function HeroSection() {
  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-d to-[#001a2e]" />

      {/* Radial overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(26,130,162,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(68,175,67,0.05) 0%, transparent 50%)',
        }}
      />

      {/* Particle field background */}
      <div className="absolute inset-0 pointer-events-none">
        <Scene>
          <ParticleField />
        </Scene>
      </div>

      {/* Content overlay - two-column on desktop */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-40 pb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: headline, subtitle, CTAs */}
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
              Water Management
              <br />
              <span className="text-green">Just Got Exciting</span>
            </h1>

            <p className="text-lg text-white/60 mt-6 leading-relaxed">
              Innovation and proven technology fuse together to create water
              management solutions that are streets ahead.
            </p>

            <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mt-4">
              Welcome to SuDS Enviro.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/configurator"
                className="rounded-full bg-green hover:bg-green-d text-white px-8 py-4 text-base font-bold transition-colors"
              >
                Start Configurator
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-white/30 hover:border-white/60 text-white px-8 py-4 text-base font-bold transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>

          {/* Right: wireframe chamber 3D model */}
          <div className="relative h-[400px] lg:h-[500px] pointer-events-auto">
            <ChamberModel dark />
          </div>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
