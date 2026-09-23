'use client'

import { useRef, useState } from 'react'
import type { HomeContent } from '@/lib/site-content/defaults'
import { RichText, BODY_VOICES } from './RichText'
import { SiteButton } from './SiteButton'

/**
 * The RoFlo / multiFlo / autoFlo innovations.
 *
 * The three sub-brands are the navigation: a selector of lockups across
 * the top rather than small arrows, so a reader sees at once that there
 * are three and what they are called. Below, the chosen lockup sits right
 * aligned (the Webflow signature for the RHINO blocks) against its body
 * copy at a readable measure. A tinted ground sets the section apart from
 * the white bands around it.
 */
export function InnovationSlider({ content }: { content: Pick<HomeContent, 'INNOVATION_SLIDES'> }) {
  const { INNOVATION_SLIDES } = content
  const [index, setIndex] = useState(0)
  const slide = INNOVATION_SLIDES[index]
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const accentText = (amber: boolean) => (amber ? 'text-[#c9a800]' : 'text-site-green')

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + INNOVATION_SLIDES.length) % INNOVATION_SLIDES.length
    setIndex(next)
    tabs.current[next]?.focus()
  }

  return (
    <section className="bg-[#f1f7fa] py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <div role="tablist" aria-label="RHINO innovations" className="grid grid-cols-3 gap-2 md:gap-3">
          {INNOVATION_SLIDES.map((s, i) => {
            const on = i === index
            const amber = s.accent === 'amber'
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`innovation-tab-${s.id}`}
                aria-selected={on}
                aria-controls={`innovation-panel-${s.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setIndex(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`relative overflow-hidden rounded-2xl px-3 pt-4 pb-5 text-left transition-colors duration-200 md:px-6 md:pt-5 md:pb-6 ${
                  on ? 'bg-white shadow-[0_14px_40px_-20px_rgba(0,85,118,0.45)]' : 'bg-transparent hover:bg-white/60'
                }`}
              >
                <span className="block text-[11px] font-semibold tracking-[0.14em] text-site-blue-dark/55 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mt-1 block text-lg leading-none font-bold tracking-tight uppercase md:text-3xl">
                  <span className="text-site-blue">{s.brand.lead}</span>{' '}
                  <span className={`italic ${accentText(amber)}`}>{s.brand.mark}</span>
                </span>
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-1 origin-left transition-transform duration-300 ${amber ? 'bg-site-yellow' : 'bg-site-green'} ${
                    on ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            )
          })}
        </div>

        <div
          key={slide.id}
          role="tabpanel"
          id={`innovation-panel-${slide.id}`}
          aria-labelledby={`innovation-tab-${slide.id}`}
          className="journey-panel mt-10 grid gap-8 md:mt-16 md:grid-cols-12 md:gap-10"
        >
          <div className="text-right md:order-2 md:col-span-5 md:col-start-8">
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] font-bold tracking-[-0.02em] uppercase">
              <span className="block text-site-blue">{slide.brand.lead}</span>
              <span className={`block italic ${accentText(slide.accent === 'amber')}`}>{slide.brand.mark}</span>
            </h2>
            <p className="mt-4 text-xl leading-tight text-balance uppercase md:text-2xl">
              <RichText content={slide.strapline} voices={{ plain: 'text-site-green', highlight: 'font-bold text-site-blue' }} />
            </p>
            <div className="mt-8">
              <SiteButton href={slide.cta.href}>{slide.cta.label}</SiteButton>
            </div>
          </div>

          <div className="space-y-5 border-site-blue-light md:order-1 md:col-span-6 md:border-l-[3px] md:pl-8">
            {slide.body.map((paragraph, p) => (
              <p key={p} className="max-w-[62ch] text-base/relaxed text-pretty md:text-lg/relaxed">
                <RichText content={paragraph} voices={BODY_VOICES} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
