'use client'

import { useState } from 'react'
import type { HomeContent } from '@/lib/site-content/defaults'
import { RichText } from './RichText'

/**
 * The four water-management tabs. From tablet up the pills overlap the top
 * edge of a rounded outlined panel, as on the Webflow site; on phones they
 * wrap to a 2 x 2 grid of whole pills above the panel, since a wrapped row
 * cannot meet the panel edge.
 */
export function WaterTabs({ content }: { content: Pick<HomeContent, 'WATER_TABS'> }) {
  const { WATER_TABS } = content
  const [active, setActive] = useState(WATER_TABS[0].id)
  const current = WATER_TABS.find((tab) => tab.id === active) ?? WATER_TABS[0]

  return (
    <section className="bg-white pb-16">
      <div className="mx-auto max-w-[1100px] px-5">
        <div role="tablist" aria-label="Water management" className="grid grid-cols-2 gap-2 md:flex">
          {WATER_TABS.map((tab) => {
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`water-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`water-panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`flex-1 rounded-2xl px-3 py-3 text-center md:rounded-b-none md:px-4 md:pt-3 md:pb-5 text-xs font-bold italic tracking-wider text-white uppercase transition-colors md:text-sm ${
                  isActive ? 'bg-site-blue' : 'bg-site-blue/70 hover:bg-site-blue/85'
                }`}
              >
                <span className="block">{tab.label.lead}</span>
                <span className="block">{tab.label.trail}</span>
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`water-panel-${current.id}`}
          aria-labelledby={`water-tab-${current.id}`}
          className="mt-3 rounded-2xl border-[3px] md:-mt-3 border-site-blue bg-white p-6 text-base/relaxed md:p-10 md:text-lg/relaxed"
        >
          <RichText content={current.body} />
        </div>
      </div>
    </section>
  )
}
