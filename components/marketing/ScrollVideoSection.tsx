'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Spline from '@splinetool/react-spline'
import type { Application } from '@splinetool/runtime'

/**
 * Scroll-locked Spline 3D section.
 *
 * The Spline canvas has pointer-events disabled until the sticky engages
 * (section top reaches viewport top). This prevents the scene's scroll
 * animation from firing early while the section scrolls into view.
 *
 * Once locked, wheel events are forwarded to the canvas so the built-in
 * scroll animation plays in sync with the page scroll.
 */

interface Keyframe {
  at: number
  label: string
}

const KEYFRAMES: Keyframe[] = [
  { at: 0, label: 'Assembled' },
  { at: 0.25, label: 'Lid Removal' },
  { at: 0.5, label: 'Component Breakdown' },
  { at: 0.75, label: 'Inlet Detail' },
  { at: 1, label: 'Base and Sump' },
]

export function ScrollVideoSection() {
  const [progress, setProgress] = useState(0)
  const [stickyEngaged, setStickyEngaged] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const splineRef = useRef<Application | null>(null)
  const engagedRef = useRef(false)

  const onSplineLoad = useCallback((app: Application) => {
    splineRef.current = app
  }, [])

  // Track when the sticky engages (section top <= 0) and compute progress
  useEffect(() => {
    function handleScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight

      // Sticky engages when the section top hits the viewport top
      const isEngaged = rect.top <= 0 && rect.bottom >= window.innerHeight
      if (isEngaged !== engagedRef.current) {
        engagedRef.current = isEngaged
        setStickyEngaged(isEngaged)
      }

      if (!isEngaged) {
        // If section hasn't reached sticky yet, keep progress at 0
        if (rect.top > 0) setProgress(0)
        return
      }

      const scrolled = -rect.top
      const p = Math.max(0, Math.min(1, scrolled / sectionHeight))
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Only forward wheel events to the Spline canvas once the sticky is engaged
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (!engagedRef.current || !canvasContainerRef.current) return

      const canvas = canvasContainerRef.current.querySelector('canvas')
      if (!canvas || e.target === canvas) return

      const syntheticWheel = new WheelEvent('wheel', {
        deltaY: e.deltaY,
        deltaX: e.deltaX,
        bubbles: true,
        cancelable: true,
      })
      canvas.dispatchEvent(syntheticWheel)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const activeIndex = KEYFRAMES.reduce((best, kf, i) => {
    return Math.abs(kf.at - progress) < Math.abs(KEYFRAMES[best].at - progress) ? i : best
  }, 0)

  return (
    <div
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: '800vh' }}
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

        {/* Spline 3D scene - pointer-events disabled until sticky engages */}
        <div
          ref={canvasContainerRef}
          className="flex-1 relative"
          style={{ pointerEvents: stickyEngaged ? 'auto' : 'none' }}
        >
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-light">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted font-medium">Loading 3D scene...</p>
              </div>
            </div>
          }>
            <Spline
              scene="https://prod.spline.design/Dkbe-Ih1j2SJ2yN5/scene.splinecode"
              style={{ width: '100%', height: '100%' }}
              onLoad={onSplineLoad}
            />
          </Suspense>
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
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 -mt-[9px] ${
                      i === activeIndex
                        ? 'bg-blue border-blue scale-125'
                        : progress >= kf.at
                          ? 'bg-blue/60 border-blue/60'
                          : 'bg-white border-border'
                    }`}
                  />
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
