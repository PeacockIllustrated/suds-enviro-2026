'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Scroll-driven video section - Apple-style scroll-to-scrub.
 *
 * When the real rendered videos arrive, replace the placeholder
 * with a <video> element and set currentTime based on scrollProgress.
 *
 * For now, shows a visual timeline with labelled keyframes
 * to communicate the concept and mark where video content goes.
 */

interface Keyframe {
  at: number  // 0-1 progress position
  label: string
  description: string
}

const KEYFRAMES: Keyframe[] = [
  {
    at: 0,
    label: 'Assembled',
    description: 'Complete inspection chamber, factory-assembled and ready for installation.',
  },
  {
    at: 0.25,
    label: 'Lid Removal',
    description: 'Access lid lifts away, revealing the internal shaft and stepped collar.',
  },
  {
    at: 0.5,
    label: 'Component Breakdown',
    description: 'Corrugated twinwall body separates from the base, showing the sump and inlet connections.',
  },
  {
    at: 0.75,
    label: 'Inlet Detail',
    description: 'Pipe connections at clock-face positions with precision-moulded seals.',
  },
  {
    at: 1,
    label: 'Base and Sump',
    description: 'Stepped base with integrated sump for sediment collection. Outlet at 6 o\'clock.',
  },
]

export function ScrollVideoSection() {
  const [progress, setProgress] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      const p = Math.max(0, Math.min(1, scrolled / sectionHeight))
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Find the active keyframe
  const activeIndex = KEYFRAMES.reduce((best, kf, i) => {
    return Math.abs(kf.at - progress) < Math.abs(KEYFRAMES[best].at - progress) ? i : best
  }, 0)

  const activeKf = KEYFRAMES[activeIndex]

  return (
    <div
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: '300vh' }}
    >
      {/* Sticky container - fills viewport while scrolling through */}
      <div className="sticky top-0 h-dvh flex flex-col overflow-hidden">

        {/* Top label */}
        <div className="pt-24 md:pt-28 px-6 text-center">
          <p className="text-xs font-semibold text-blue uppercase tracking-[0.2em]">
            Scroll to explore
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-ink tracking-tight mt-2">
            Inside the Inspection Chamber
          </h2>
        </div>

        {/* Video placeholder area */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl border border-border/50 bg-light overflow-hidden">

            {/* Placeholder visual - progress-driven gradient */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: `linear-gradient(${135 + progress * 90}deg,
                  rgba(0,77,112,${0.03 + progress * 0.06}) 0%,
                  rgba(26,130,162,${0.04 + progress * 0.04}) 40%,
                  rgba(68,175,67,${0.02 + progress * 0.04}) 100%)`,
              }}
            />

            {/* Centre content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
              {/* Progress ring */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Track */}
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="#ccdde8"
                    strokeWidth="2"
                  />
                  {/* Progress */}
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="#1a82a2"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
                    className="transition-all duration-100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>

              {/* Active keyframe label */}
              <p className="text-lg md:text-xl font-bold text-ink tracking-tight">
                {activeKf.label}
              </p>
              <p className="text-sm text-muted mt-2 max-w-sm leading-relaxed">
                {activeKf.description}
              </p>

              {/* Video placeholder note */}
              <p className="text-[10px] font-medium text-muted/40 uppercase tracking-widest mt-6">
                Video renders will play here
              </p>
            </div>
          </div>
        </div>

        {/* Bottom timeline */}
        <div className="px-6 pb-8 md:pb-12">
          <div className="mx-auto max-w-2xl">
            {/* Track */}
            <div className="relative h-1 bg-border/40 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-blue rounded-full transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Keyframe dots and labels */}
            <div className="relative mt-3">
              {KEYFRAMES.map((kf, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${kf.at * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {/* Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 -mt-[9px] ${
                      i === activeIndex
                        ? 'bg-blue border-blue scale-125'
                        : progress >= kf.at
                          ? 'bg-blue/60 border-blue/60'
                          : 'bg-white border-border'
                    }`}
                  />
                  {/* Label - only show on md+ to avoid crowding */}
                  <span
                    className={`hidden md:block text-[10px] font-semibold mt-2 whitespace-nowrap transition-colors duration-200 ${
                      i === activeIndex ? 'text-navy' : 'text-muted/50'
                    }`}
                  >
                    {kf.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
