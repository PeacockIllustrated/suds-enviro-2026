'use client'

import { useRef, useState } from 'react'
import type { HomeContent } from '@/lib/site-content/defaults'
import { RichText } from './RichText'
import { WaterIllustration } from './WaterIllustrations'

/**
 * The four water-management streams.
 *
 * An asymmetric split: a numbered rail of tabs down the left, the chosen
 * stream's panel on the right, led by a toon illustration of it. On
 * phones the rail becomes a scrolling row of pills above the panel, so
 * the Webflow "tabs overlapping a panel" look is kept where it works and
 * dropped where wrapping used to break it.
 */
export function WaterTabs({ content }: { content: Pick<HomeContent, 'WATER_TABS'> }) {
  const { WATER_TABS } = content
  const [active, setActive] = useState(WATER_TABS[0].id)
  const current = WATER_TABS.find((tab) => tab.id === active) ?? WATER_TABS[0]
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + WATER_TABS.length) % WATER_TABS.length
    setActive(WATER_TABS[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 md:grid-cols-12 md:gap-10">
        <div
          role="tablist"
          aria-label="Water management"
          aria-orientation="vertical"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:col-span-4 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0"
        >
          {WATER_TABS.map((tab, i) => {
            const on = tab.id === active
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`water-tab-${tab.id}`}
                aria-selected={on}
                aria-controls={`water-panel-${tab.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group relative flex shrink-0 items-baseline gap-4 rounded-full px-5 py-3 text-left transition-colors duration-200 md:rounded-2xl md:px-6 md:py-5 ${
                  on ? 'bg-site-blue text-white shadow-[0_10px_30px_-12px_rgba(29,128,185,0.7)]' : 'bg-[#eef5f9] text-site-blue-dark hover:bg-site-blue-light/45'
                }`}
              >
                <span className={`hidden text-sm font-semibold tabular-nums md:inline ${on ? 'text-site-blue-light' : 'text-site-blue/60'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-tight font-bold tracking-wide whitespace-nowrap uppercase italic md:text-lg md:whitespace-normal">
                  {tab.label.lead} <span className={on ? 'font-medium text-site-ui-green' : 'font-medium text-site-green'}>{tab.label.trail}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div
          key={current.id}
          role="tabpanel"
          id={`water-panel-${current.id}`}
          aria-labelledby={`water-tab-${current.id}`}
          className="journey-panel relative overflow-hidden rounded-[2rem] border-[3px] border-site-blue bg-white md:col-span-8"
        >
          <div className="grid items-start gap-6 p-7 sm:grid-cols-[11rem_1fr] md:gap-10 md:p-12">
            <div className="flex size-36 items-center justify-center rounded-[1.75rem] bg-[#eef5f9] sm:size-44">
              <WaterIllustration id={current.id} className="size-32 sm:size-40" />
            </div>
            <div>
              <p className="text-2xl leading-tight font-bold tracking-tight text-balance text-site-blue uppercase md:text-3xl">
                {current.label.lead} <span className="font-light text-site-green">{current.label.trail}</span>
              </p>
              <p className="mt-4 max-w-[62ch] text-base/relaxed text-pretty md:text-lg/relaxed">
                <RichText content={current.body} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
