'use client'

import { useState } from 'react'
import { WATER_TABS } from '@/lib/content/home'
import { RichText } from './RichText'

/**
 * The four water-management tabs. Pills overlap the top edge of a rounded
 * outlined panel, as on the Webflow site.
 */
export function WaterTabs() {
  const [active, setActive] = useState(WATER_TABS[0].id)
  const current = WATER_TABS.find((tab) => tab.id === active) ?? WATER_TABS[0]

  return (
    <section className="bg-white pb-16">
      <div className="mx-auto max-w-[1100px] px-5">
        <div role="tablist" aria-label="Water management" className="flex flex-wrap gap-2">
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
                className={`flex-1 rounded-t-2xl px-4 pt-3 pb-5 text-center text-xs font-bold italic tracking-wider text-white uppercase transition-colors md:text-sm ${
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
          className="-mt-3 rounded-2xl border-[3px] border-site-blue bg-white p-6 text-base/relaxed md:p-10 md:text-lg/relaxed"
        >
          <RichText content={current.body} />
        </div>
      </div>
    </section>
  )
}
