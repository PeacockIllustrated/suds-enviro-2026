import type { Metadata } from 'next'
import { WaterJourney } from '@/components/site/WaterJourney'
import { WaterTabs } from '@/components/site/WaterTabs'
import { InnovationSlider } from '@/components/site/InnovationSlider'
import { Testimonials } from '@/components/site/Testimonials'
import { RhinoRange } from '@/components/site/RhinoRange'
import { BuilderCTA } from '@/components/site/BuilderCTA'
import { SolutionRoutes } from '@/components/site/SolutionRoutes'
import { ProductTiles } from '@/components/site/ProductTiles'
import { getSection } from '@/lib/site-content/store'

export const metadata: Metadata = {
  title: 'SuDS Enviro - Bespoke, Standardised',
}

/**
 * The home page, rebuilt from the Webflow original. Copy comes from the
 * content editor (lib/site-content), falling back to lib/content/home.ts.
 * Client components are handed only the pieces they render.
 */
export default async function HomePage() {
  const home = await getSection('home')
  return (
    <>
      <WaterJourney
        content={{
          HERO: home.HERO,
          INNOVATION_SLIDES: home.INNOVATION_SLIDES,
          RHINO_RANGE: home.RHINO_RANGE,
          WATER_STREAMS: home.WATER_STREAMS,
        }}
      />
      <WaterTabs content={{ WATER_TABS: home.WATER_TABS }} />
      <InnovationSlider content={{ INNOVATION_SLIDES: home.INNOVATION_SLIDES }} />
      <Testimonials content={{ TESTIMONIALS: home.TESTIMONIALS, TESTIMONIALS_HEADING: home.TESTIMONIALS_HEADING }} />
      <RhinoRange content={home} />
      <SolutionRoutes content={home} />
      <BuilderCTA content={home} />
      <ProductTiles content={home} />
    </>
  )
}
