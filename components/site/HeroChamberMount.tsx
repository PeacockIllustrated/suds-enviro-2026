'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const HeroChamberCanvas = dynamic(() => import('./HeroChamberCanvas'), { ssr: false })

/**
 * Mounts the hero's 3D chamber only once the page is idle.
 *
 * The hero's job is to render its headline instantly. Three.js is a
 * large parse even with no model to download, so it is deferred past
 * first paint rather than competing with it. Anyone who prefers reduced
 * motion never gets it at all - the chamber's only behaviour is rotation.
 */
export function HeroChamberMount() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // requestIdleCallback is typed as always present but is missing on
    // older Safari, so it is feature-checked rather than narrowed.
    const requestIdle: typeof window.requestIdleCallback | undefined =
      window.requestIdleCallback

    if (typeof requestIdle === 'function') {
      const handle = requestIdle(() => setShow(true), { timeout: 2500 })
      return () => window.cancelIdleCallback(handle)
    }

    const handle = window.setTimeout(() => setShow(true), 900)
    return () => window.clearTimeout(handle)
  }, [])

  if (!show) return null

  return (
    <div aria-hidden className="pointer-events-none h-full w-full">
      <HeroChamberCanvas />
    </div>
  )
}
