'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  const handleComplete = useCallback(() => {
    setVisible(false)
    onComplete()
  }, [onComplete])

  useEffect(() => {
    // Start fading out at 2.0s
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2000)

    // Unmount at 2.5s
    const unmountTimer = setTimeout(() => {
      handleComplete()
    }, 2500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(unmountTimer)
    }
  }, [handleComplete])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-b from-navy to-[#002a40] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Radial gradient overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(26,130,162,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Centered content */}
      <div className="relative flex flex-col items-center">
        {/* Icon - fades in and scales at 0.3s */}
        <div
          className="splash-animate"
          style={{
            animation: 'scaleIn 0.5s ease forwards',
            animationDelay: '0.3s',
            opacity: 0,
          }}
        >
          <Image
            src="/logos/suds/icon-white.png"
            alt="SuDS Enviro"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
        </div>

        {/* Horizontal logo - fades in at 0.6s */}
        <div
          className="mt-5 splash-animate"
          style={{
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.6s',
            opacity: 0,
          }}
        >
          <Image
            src="/logos/suds/horizontal-white.png"
            alt="SuDS enviro"
            width={200}
            height={48}
            className="object-contain"
            priority
          />
        </div>

        {/* Green divider line - grows at 1.0s */}
        <div className="mt-4 flex justify-center">
          <div
            className="h-[1px] bg-green"
            style={{
              animation: 'lineGrow 0.4s ease forwards',
              animationDelay: '1.0s',
              width: 0,
            }}
          />
        </div>

        {/* CONFIGURATOR text - fades in at 1.3s */}
        <div
          className="mt-3 splash-animate"
          style={{
            animation: 'fadeInUp 0.4s ease forwards',
            animationDelay: '1.3s',
            opacity: 0,
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Configurator
          </span>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30"
          style={{
            animation: 'fadeInUp 0.4s ease forwards',
            animationDelay: '1.5s',
            opacity: 0,
          }}
        >
          Bespoke, Standardised
        </span>
      </div>
    </div>
  )
}
