import type { Metadata } from 'next'
import { WaterJourneyExperience } from '@/components/site/journey/WaterJourneyExperience'
import { getSection } from '@/lib/site-content/store'

export const metadata: Metadata = {
  title: 'Water Journey - SuDS Enviro',
  description:
    'Follow one storm from the roof of a house to the river, and see the SuDS Enviro product at each stop: harvesting, inspection chambers, silt traps, separators, storage and flow control.',
}

/**
 * The Water Journey: a scroll-driven walk along the drainage train. Copy
 * comes from the content editor (section "waterJourney"), falling back to
 * lib/content/water-journey.ts.
 */
export default async function WaterJourneyPage() {
  const journey = await getSection('waterJourney')
  const { WATER_JOURNEY: copy } = journey
  return (
    <>
      <header className="bg-white px-5 pt-10 pb-8 md:pt-14 md:pb-10">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs font-bold tracking-[0.24em] text-site-blue-dark/70 uppercase">{copy.eyebrow}</p>
          <h1 id="journey-heading" className="mt-3 text-[clamp(2.5rem,7vw,5rem)] leading-[0.9] tracking-tight uppercase">
            <span className="font-extrabold text-site-blue">{copy.heading.lead}</span>{' '}
            <span className="font-semibold text-site-green">{copy.heading.trail}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base/relaxed text-site-blue-dark md:text-lg/relaxed">{copy.intro}</p>
        </div>
      </header>
      <WaterJourneyExperience content={journey} />
    </>
  )
}
