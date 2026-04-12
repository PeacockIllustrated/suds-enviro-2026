'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { ParticleField } from '@/components/three/ParticleField'
import { HeroSpheres } from '@/components/three/HeroSpheres'

const Scene = dynamic(() => import('@/components/three/SceneCanvas'), { ssr: false })

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

      {/* 3D layer */}
      <div className="absolute inset-0 pointer-events-auto">
        <Scene>
          <ParticleField />
          <HeroSpheres />
        </Scene>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20">
        <Image
          src="/logos/suds/icon-white.png"
          alt=""
          width={40}
          height={40}
          className="mb-6"
        />

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
          Bespoke. Standardised.
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mt-6 leading-relaxed">
          Configure drainage chambers, separators, and treatment systems - built to your exact
          specification.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/configurator"
            className="rounded-lg bg-green hover:bg-green-d text-white px-8 py-4 text-base font-bold transition-colors"
          >
            Start Configurator
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-white/30 hover:border-white/60 text-white px-8 py-4 text-base font-bold transition-colors"
          >
            View Products
          </Link>
        </div>
      </div>
    </section>
  )
}
