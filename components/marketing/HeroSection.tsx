'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'

// Lazy-load the combined scene (particles + chamber in one canvas)
const HeroCanvas = dynamic(
  () => import('@/components/marketing/HeroCanvas'),
  { ssr: false }
)

export function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight
      // Progress: 0 when section top is at viewport top, 1 when section bottom reaches viewport top
      const progress = Math.max(0, Math.min(1, -rect.top / (sectionHeight * 0.6)))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[120vh] overflow-hidden">
      {/* Clean white background */}
      <div className="absolute inset-0 bg-white" />

      {/* Subtle radial gradient for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 65% 50%, rgba(26,130,162,0.04) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(68,175,67,0.03) 0%, transparent 40%)',
        }}
      />

      {/* 3D canvas covering the full section */}
      <div className="absolute inset-0">
        <HeroCanvas scrollProgress={scrollProgress} />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 md:pt-40 pb-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left: headline, subtitle, CTAs */}
          <div className="max-w-lg">
            <Image
              src="/logos/rhino/logo-horizontal.png"
              alt="SuDS Enviro RHINO"
              width={200}
              height={65}
              className="mb-10"
            />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.08]">
              Water Management
              <br />
              <span className="text-green">Just Got Exciting</span>
            </h1>

            <p className="text-lg text-muted mt-6 leading-relaxed max-w-md">
              Innovation and proven technology fuse together to create water
              management solutions that are streets ahead.
            </p>

            <p className="text-sm font-semibold text-muted/60 uppercase tracking-widest mt-4">
              Welcome to SuDS Enviro.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/configurator"
                className="rounded-full bg-green hover:bg-green-d text-white px-8 py-4 text-base font-bold transition-colors shadow-lg shadow-green/25"
              >
                Start Configurator
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-border hover:border-navy text-ink px-8 py-4 text-base font-bold transition-colors hover:shadow-sm"
              >
                View Products
              </Link>
            </div>
          </div>

          {/* Right: 3D model lives in the full-section canvas behind */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5">
        <span className="text-[11px] font-semibold text-muted/40 uppercase tracking-[0.2em]">
          Scroll to explore
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-border/60 to-transparent" />
      </div>
    </section>
  )
}
