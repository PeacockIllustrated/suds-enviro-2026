'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { HERO, INNOVATION_SLIDES, RHINO_RANGE, WATER_STREAMS } from '@/lib/content/home'
import { RichText, HEADING_VOICES } from './RichText'
import { SiteButton } from './SiteButton'

const WaterJourneyScene = dynamic(() => import('./WaterJourneyScene'), { ssr: false })

/**
 * The home page opener: the Webflow site's Spline scroll scene rebuilt as
 * a pinned 3D stage with the page's own copy scrolling over it.
 *
 * Five beats, each one screen tall. The copy is real text in the flow of
 * the page, so it reads, indexes and works with no JavaScript; the scene
 * is decoration layered behind it (aria-hidden) and follows the scroll.
 * Only the short lockups and straplines are used here - the sections
 * further down carry the full paragraphs.
 *
 * The scene mounts once the page is idle and never under reduced motion,
 * as the old hero chamber did; the beats simply stack without it.
 */

const multiFlo = INNOVATION_SLIDES.find((s) => s.id === 'multiflo')
const autoFlo = INNOVATION_SLIDES.find((s) => s.id === 'autoflo')

function Beat({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'centre' }) {
  const side =
    align === 'right' ? 'md:ml-auto md:text-right' : align === 'centre' ? 'mx-auto text-center' : 'md:mr-auto'
  return (
    <div className="relative flex min-h-[100svh] items-center px-5 py-24">
      <div className={`w-full max-w-md bg-white/80 p-5 backdrop-blur-[2px] md:bg-white/60 ${side}`}>{children}</div>
    </div>
  )
}

export function WaterJourney() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [mount, setMount] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const requestIdle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback
    if (typeof requestIdle === 'function') {
      const handle = requestIdle(() => setMount(true), { timeout: 2500 })
      return () => window.cancelIdleCallback(handle)
    }
    const handle = window.setTimeout(() => setMount(true), 900)
    return () => window.clearTimeout(handle)
  }, [])

  useEffect(() => {
    const el = section.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      const run = r.height - window.innerHeight
      progress.current = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section ref={section} className="relative bg-white">
      {/* The stage: pinned for the length of the section, behind the copy. */}
      <div className="pointer-events-none absolute inset-0">
        <div aria-hidden className="sticky top-0 h-[100svh] w-full">
          {mount ? <WaterJourneyScene progress={progress} /> : null}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        {/* 1. Hero: the water gathers. */}
        <div className="flex min-h-[100svh] flex-col items-center justify-start px-5 pt-16 text-center md:pt-24">
          <Image
            src={HERO.logo}
            alt="SuDS Enviro - Bespoke, Standardised"
            width={420}
            height={220}
            priority
            sizes="(max-width: 768px) 220px, 300px"
            className="mx-auto h-auto w-[220px] md:w-[300px]"
          />
          <h1 className="mx-auto mt-8 max-w-4xl bg-white/70 px-3 text-[clamp(1.5rem,4.2vw,2.75rem)] leading-tight tracking-tight uppercase">
            <RichText content={HERO.heading} voices={HEADING_VOICES} />
          </h1>
        </div>

        {/* 2. Storm and foul: two streams, one system. */}
        <Beat>
          <ul className="space-y-4">
            {WATER_STREAMS.map((stream) => (
              <li key={stream.id} className="flex items-center gap-4">
                <span
                  aria-hidden
                  className={
                    stream.id === 'storm'
                      ? 'h-3 w-12 shrink-0 rounded-full bg-site-blue-light ring-1 ring-site-blue'
                      : 'h-1 w-12 shrink-0 rounded-full bg-site-red'
                  }
                />
                <span className="text-[clamp(1.4rem,3vw,2rem)] leading-tight uppercase">
                  <span className="font-bold text-site-blue">{stream.lead}</span>{' '}
                  <span className="text-site-green">{stream.trail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Beat>

        {/* 3. autoFlo rides the stream through the chamber. */}
        {autoFlo ? (
          <Beat align="right">
            <p className="text-[clamp(2rem,5vw,3.5rem)] leading-none font-bold tracking-tight uppercase">
              <span className="text-site-blue">{autoFlo.brand.lead}</span>{' '}
              <span className="italic text-site-yellow">{autoFlo.brand.mark}</span>
            </p>
            <p className="mt-1 text-[clamp(1.25rem,3vw,2rem)] leading-tight uppercase">
              <RichText content={autoFlo.strapline} voices={HEADING_VOICES} />
            </p>
          </Beat>
        ) : null}

        {/* 4. multiFlo: the clockwork base, seen from above. */}
        {multiFlo ? (
          <Beat>
            <p className="text-[clamp(2rem,5vw,3.5rem)] leading-none font-bold tracking-tight uppercase">
              <span className="text-site-blue">{multiFlo.brand.lead}</span>{' '}
              <span className="italic text-site-green">{multiFlo.brand.mark}</span>
            </p>
            <p className="mt-1 text-[clamp(1.25rem,3vw,2rem)] leading-tight uppercase">
              <RichText content={multiFlo.strapline} voices={HEADING_VOICES} />
            </p>
            <p className="mt-4 text-base text-site-blue-dark">
              Inlets at <span className="font-bold text-site-green">3, 5, 6, 7 and 9 o’clock</span>, outlet at 12.
            </p>
          </Beat>
        ) : null}

        {/* 5. The range: water branches out to every situation. */}
        <div className="relative flex min-h-[100svh] items-start justify-center px-5 pt-20 text-center">
          <div className="bg-white/70 p-5">
            <p className="text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-tight uppercase">
              <span className="text-site-green">{RHINO_RANGE.eyebrow.lead}</span>{' '}
              <span className="font-bold text-site-blue">{RHINO_RANGE.eyebrow.mark}</span>
            </p>
            <h2 className="mt-3 text-[clamp(1.5rem,3.6vw,2.5rem)] leading-tight uppercase">
              <RichText content={RHINO_RANGE.heading} voices={HEADING_VOICES} />
            </h2>
            <div className="mt-6">
              <SiteButton href={RHINO_RANGE.cta.href}>{RHINO_RANGE.cta.label}</SiteButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
