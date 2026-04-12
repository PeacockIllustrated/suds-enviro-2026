'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'

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
      const progress = Math.max(0, Math.min(1, -rect.top / (sectionHeight * 0.5)))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* White background */}
      <div className="absolute inset-0 bg-white" />

      {/* Subtle gradient for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, rgba(26,130,162,0.04) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(68,175,67,0.03) 0%, transparent 40%)',
        }}
      />

      {/* 3D canvas - full section on desktop, bottom half on mobile */}
      <div className="absolute inset-0 lg:inset-0">
        <HeroCanvas scrollProgress={scrollProgress} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
        {/* Desktop: side-by-side. Mobile: stacked with model below */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Text content */}
          <div className="pt-32 md:pt-40 pb-8 lg:pb-32 max-w-lg">
            <Image
              src="/logos/rhino/logo-horizontal.png"
              alt="SuDS Enviro RHINO"
              width={200}
              height={65}
              className="mb-10 w-[160px] md:w-[200px] h-auto"
            />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.08]">
              Water Management
              <br />
              <span className="text-green">Just Got Exciting</span>
            </h1>

            <p className="text-base md:text-lg text-muted mt-5 md:mt-6 leading-relaxed max-w-md">
              Innovation and proven technology fuse together to create water
              management solutions that are streets ahead.
            </p>

            <p className="text-xs md:text-sm font-semibold text-muted/50 uppercase tracking-widest mt-3 md:mt-4">
              Welcome to SuDS Enviro.
            </p>

            <div className="mt-8 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <Link
                href="/configurator"
                className="rounded-full bg-green hover:bg-green-d text-white px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base font-bold transition-colors shadow-lg shadow-green/25"
              >
                Start Configurator
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-border hover:border-navy text-ink px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base font-bold transition-colors hover:shadow-sm"
              >
                View Products
              </Link>
            </div>
          </div>

          {/* Spacer for 3D model area on mobile */}
          <div className="h-[320px] sm:h-[380px] lg:hidden" />

          {/* Desktop spacer (model renders in the canvas behind) */}
          <div className="hidden lg:block lg:h-[600px]" />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] md:text-[11px] font-semibold text-muted/40 uppercase tracking-[0.2em]">
          Scroll to explore
        </span>
        <div className="w-px h-8 md:h-10 bg-gradient-to-b from-border/60 to-transparent" />
      </div>
    </section>
  )
}
