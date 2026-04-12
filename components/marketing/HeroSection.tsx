'use client'

import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(26,130,162,0.04) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(68,175,67,0.03) 0%, transparent 40%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 md:pt-44 pb-20 md:pb-28">
        <div className="max-w-2xl">
          <Image
            src="/logos/rhino/logo-horizontal.png"
            alt="SuDS Enviro RHINO"
            width={200}
            height={65}
            className="mb-8 md:mb-10 w-[160px] md:w-[200px] h-auto"
          />

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.08]">
            Water Management
            <br />
            <span className="text-green">Just Got Exciting</span>
          </h1>

          <p className="text-base md:text-lg text-muted mt-5 md:mt-6 leading-relaxed max-w-lg">
            Innovation and proven technology fuse together to create water
            management solutions that are streets ahead.
          </p>

          <p className="text-xs md:text-sm font-semibold text-muted/50 uppercase tracking-widest mt-3 md:mt-4">
            Welcome to SuDS Enviro.
          </p>

          <div className="mt-8 md:mt-10 flex flex-wrap gap-3 md:gap-4">
            <Link
              href="/configurator"
              className="rounded-full bg-green hover:bg-green-d text-white px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base font-bold transition-colors duration-200 shadow-lg shadow-green/25"
            >
              Start Configurator
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-border hover:border-navy text-ink px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base font-bold transition-colors duration-200 hover:shadow-sm"
            >
              View Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
